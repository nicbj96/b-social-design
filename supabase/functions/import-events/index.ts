import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Constants ────────────────────────────────────────────────────────────────

// All 27 supported countries
const ALL_COUNTRIES = [
  "DK", "SE", "NO", "DE", "NL", "BE", "AT", "CH", "ES", "FR", "IT",
  "GB", "IE", "PL", "CZ", "FI", "US", "CA", "MX", "AU", "NZ", "AE",
  "ZA", "TR", "BR", "CL", "PE",
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface ImportedEvent {
  title: string;
  description: string;
  location: string;
  image_url: string | null;
  date: string;
  category: string;
  max_participants: number;
  created_by: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number | null;
  interest_tags: string[];
  suitable_for_modes: string[];
  weather_suitable: string[];
  indoor_outdoor: string;
  category_level: number;
  min_required_participants: number;
  source: string;
  status: string;
  country: string;
}

interface ImportResult {
  source: string;
  country?: string;
  fetched: number;
  inserted: number;
  skipped: number;
  errors: string[];
}

// ─── City Coordinates ────────────────────────────────────────────────────────

const DANISH_CITIES: Record<string, { lat: number; lng: number }> = {
  Aalborg: { lat: 57.0462626, lng: 9.9215263 },
  Aarhus: { lat: 56.163939, lng: 10.2039213 },
  København: { lat: 55.6760968, lng: 12.5683372 },
  Odense: { lat: 55.3959763, lng: 10.3883866 },
  Esbjerg: { lat: 55.4762, lng: 8.4594 },
  Randers: { lat: 56.4607, lng: 10.0369 },
  Kolding: { lat: 55.4904, lng: 9.4722 },
  Horsens: { lat: 55.8614, lng: 9.8503 },
  Vejle: { lat: 55.7113, lng: 9.536 },
  Roskilde: { lat: 55.6415, lng: 12.0803 },
};

// ─── Country Bounding Boxes (for OpenAgenda geo filter) ──────────────────────

const COUNTRY_BOUNDING_BOXES: Record<string, { northEastLat: number; northEastLng: number; southWestLat: number; southWestLng: number }> = {
  DK: { northEastLat: 57.75, northEastLng: 15.20, southWestLat: 54.56, southWestLng: 8.07 },
  SE: { northEastLat: 69.06, northEastLng: 24.17, southWestLat: 55.34, southWestLng: 11.12 },
  NO: { northEastLat: 71.19, northEastLng: 31.17, southWestLat: 57.96, southWestLng: 4.51 },
  DE: { northEastLat: 55.06, northEastLng: 15.04, southWestLat: 47.27, southWestLng: 5.87 },
  NL: { northEastLat: 53.51, northEastLng: 7.22, southWestLat: 50.75, southWestLng: 3.36 },
  BE: { northEastLat: 51.51, northEastLng: 6.41, southWestLat: 49.50, southWestLng: 2.55 },
  AT: { northEastLat: 49.02, northEastLng: 17.16, southWestLat: 46.37, southWestLng: 9.53 },
  CH: { northEastLat: 47.81, northEastLng: 10.49, southWestLat: 45.83, southWestLng: 5.96 },
  ES: { northEastLat: 43.79, northEastLng: 4.33, southWestLat: 35.99, southWestLng: -9.30 },
  FR: { northEastLat: 51.09, northEastLng: 9.56, southWestLat: 41.34, southWestLng: -5.14 },
  IT: { northEastLat: 47.09, northEastLng: 18.52, southWestLat: 36.65, southWestLng: 6.62 },
  GB: { northEastLat: 60.86, northEastLng: 1.77, southWestLat: 49.87, southWestLng: -8.65 },
  IE: { northEastLat: 55.39, northEastLng: -5.43, southWestLat: 51.44, southWestLng: -10.48 },
  PL: { northEastLat: 54.84, northEastLng: 24.15, southWestLat: 49.00, southWestLng: 14.12 },
  CZ: { northEastLat: 51.06, northEastLng: 18.86, southWestLat: 48.55, southWestLng: 12.09 },
  FI: { northEastLat: 70.09, northEastLng: 31.59, southWestLat: 59.81, southWestLng: 20.55 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Rate limiter: sleep ms */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Pick widest image from Ticketmaster images array */
function pickWidestImage(images: any[]): string | null {
  if (!images || images.length === 0) return null;
  // Prefer 16:9 ratio images for better display
  const ratio16_9 = images.filter((i) => i.ratio === "16_9");
  const pool = ratio16_9.length > 0 ? ratio16_9 : images;
  let best = pool[0];
  for (const img of pool) {
    if ((img.width || 0) > (best.width || 0)) best = img;
  }
  return best?.url || null;
}

/** Map Ticketmaster segment+genre to B-Social category + tags */
function mapClassification(segment: string, genre: string): {
  category: string;
  interest_tags: string[];
  indoor_outdoor: string;
  weather_suitable: string[];
  suitable_for_modes: string[];
} {
  const seg = (segment || "").toLowerCase();
  const gen = (genre || "").toLowerCase();

  if (
    seg === "music" ||
    gen.includes("music") ||
    gen.includes("rock") ||
    gen.includes("pop") ||
    gen.includes("jazz") ||
    gen.includes("classical")
  ) {
    const tags = ["musik", "koncert"];
    if (gen.includes("jazz")) tags.push("jazz");
    if (gen.includes("rock")) tags.push("rock");
    if (gen.includes("classical") || gen.includes("klassisk")) tags.push("klassisk");
    if (gen.includes("pop")) tags.push("pop");
    if (gen.includes("hip-hop") || gen.includes("hip hop") || gen.includes("rap")) tags.push("hiphop");
    if (gen.includes("electronic") || gen.includes("techno") || gen.includes("edm")) tags.push("elektronisk");
    return {
      category: "musik",
      interest_tags: tags,
      indoor_outdoor: "indoor",
      weather_suitable: ["all"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
    };
  }

  if (
    seg === "sports" ||
    gen.includes("sport") ||
    gen.includes("football") ||
    gen.includes("soccer") ||
    gen.includes("basketball") ||
    gen.includes("tennis")
  ) {
    const tags = ["sport"];
    if (gen.includes("football") || gen.includes("soccer")) tags.push("fodbold");
    if (gen.includes("basketball")) tags.push("basketball");
    if (gen.includes("tennis")) tags.push("tennis");
    if (gen.includes("hockey")) tags.push("hockey");
    if (gen.includes("baseball")) tags.push("baseball");
    if (gen.includes("golf")) tags.push("golf");
    return {
      category: "sport",
      interest_tags: tags,
      indoor_outdoor: "outdoor",
      weather_suitable: ["clear", "cloudy"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
    };
  }

  if (
    seg === "arts & theatre" ||
    seg === "arts" ||
    seg === "theatre" ||
    gen.includes("theatre") ||
    gen.includes("opera") ||
    gen.includes("ballet") ||
    gen.includes("dance") ||
    gen.includes("comedy")
  ) {
    const tags = ["kultur"];
    if (gen.includes("opera")) tags.push("opera");
    if (gen.includes("ballet")) tags.push("ballet");
    if (gen.includes("comedy")) tags.push("comedy");
    if (gen.includes("theatre") || gen.includes("theater")) tags.push("teater");
    if (gen.includes("dance")) tags.push("dans");
    return {
      category: "kultur",
      interest_tags: tags,
      indoor_outdoor: "indoor",
      weather_suitable: ["all"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
    };
  }

  if (seg === "film" || gen.includes("film") || gen.includes("cinema") || gen.includes("movie")) {
    return {
      category: "kultur",
      interest_tags: ["film", "biograf", "kultur"],
      indoor_outdoor: "indoor",
      weather_suitable: ["all"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
    };
  }

  if (gen.includes("festival")) {
    return {
      category: "festival",
      interest_tags: ["festival", "musik", "kultur"],
      indoor_outdoor: "outdoor",
      weather_suitable: ["clear", "cloudy"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
    };
  }

  if (seg === "family" || gen.includes("family") || gen.includes("children")) {
    return {
      category: "familie",
      interest_tags: ["familie", "børn", "underholdning"],
      indoor_outdoor: "indoor",
      weather_suitable: ["all"],
      suitable_for_modes: ["gruppe"],
    };
  }

  return {
    category: "arrangement",
    interest_tags: ["arrangement", "oplevelse"],
    indoor_outdoor: "indoor",
    weather_suitable: ["all"],
    suitable_for_modes: ["solo", "duo", "gruppe"],
  };
}

/** Map OpenAgenda category tags to B-Social category */
function mapOpenAgendaCategory(tags: string[]): {
  category: string;
  interest_tags: string[];
  indoor_outdoor: string;
  weather_suitable: string[];
  suitable_for_modes: string[];
} {
  const tagStr = (tags || []).join(" ").toLowerCase();

  if (tagStr.includes("music") || tagStr.includes("concert") || tagStr.includes("musique")) {
    return {
      category: "musik",
      interest_tags: ["musik", "koncert"],
      indoor_outdoor: "indoor",
      weather_suitable: ["all"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
    };
  }
  if (tagStr.includes("sport") || tagStr.includes("fitness")) {
    return {
      category: "sport",
      interest_tags: ["sport"],
      indoor_outdoor: "outdoor",
      weather_suitable: ["clear", "cloudy"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
    };
  }
  if (tagStr.includes("theatre") || tagStr.includes("theater") || tagStr.includes("theatre") || tagStr.includes("art") || tagStr.includes("culture") || tagStr.includes("exhibition")) {
    return {
      category: "kultur",
      interest_tags: ["kultur", "kunst"],
      indoor_outdoor: "indoor",
      weather_suitable: ["all"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
    };
  }
  if (tagStr.includes("festival")) {
    return {
      category: "festival",
      interest_tags: ["festival", "kultur"],
      indoor_outdoor: "outdoor",
      weather_suitable: ["clear", "cloudy"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
    };
  }
  if (tagStr.includes("family") || tagStr.includes("children") || tagStr.includes("enfant")) {
    return {
      category: "familie",
      interest_tags: ["familie", "børn"],
      indoor_outdoor: "indoor",
      weather_suitable: ["all"],
      suitable_for_modes: ["gruppe"],
    };
  }
  if (tagStr.includes("food") || tagStr.includes("gastro") || tagStr.includes("cuisine")) {
    return {
      category: "mad",
      interest_tags: ["mad", "gastronomi"],
      indoor_outdoor: "indoor",
      weather_suitable: ["all"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
    };
  }

  return {
    category: "arrangement",
    interest_tags: ["arrangement", "oplevelse"],
    indoor_outdoor: "indoor",
    weather_suitable: ["all"],
    suitable_for_modes: ["solo", "duo", "gruppe"],
  };
}

// ─── Source 1: Ticketmaster by Country ───────────────────────────────────────

async function fetchTicketmasterByCountry(
  apiKey: string,
  countryCode: string
): Promise<{ events: ImportedEvent[]; errors: string[] }> {
  const errors: string[] = [];
  const events: ImportedEvent[] = [];

  // Ticketmaster requires YYYY-MM-DDTHH:mm:ssZ (no milliseconds)
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  
  // Single page of 200 events per country (edge functions have 60s timeout)
  // The weekly cron handles all 27 countries, so we get broad coverage over time
  const MAX_PAGES = 1;
  const PAGE_SIZE = 200;
  let allItems: any[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=${countryCode}&size=${PAGE_SIZE}&page=${page}&apikey=${apiKey}&sort=date,asc&startDateTime=${encodeURIComponent(now)}`;

    let data: any;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });

      if (!response.ok) {
        const body = await response.text();
        if (response.status === 429) {
          // Rate limited — wait and retry
          console.log(`[import-events] Ticketmaster ${countryCode}: rate limited on page ${page}, waiting 2s...`);
          await sleep(2000);
          continue;
        }
        errors.push(`Ticketmaster ${countryCode} page ${page}: HTTP ${response.status} - ${body.slice(0, 200)}`);
        break;
      }

      data = await response.json();

      if (data.fault) {
        errors.push(`Ticketmaster ${countryCode}: ${data.fault.faultstring}`);
        break;
      }
    } catch (err) {
      errors.push(`Ticketmaster ${countryCode} page ${page}: fetch error - ${err}`);
      break;
    }

    const pageItems = data._embedded?.events || [];
    allItems.push(...pageItems);

    // Check if there are more pages
    const totalPages = data.page?.totalPages || 1;
    const totalElements = data.page?.totalElements || 0;
    console.log(`[import-events] Ticketmaster ${countryCode}: page ${page}/${totalPages} — got ${pageItems.length} events (total available: ${totalElements})`);

    if (page >= totalPages - 1 || pageItems.length < PAGE_SIZE) {
      break; // No more pages
    }

    // Rate limit: wait between pages
    await sleep(250);
  }

  const items = allItems;
  console.log(`[import-events] Ticketmaster ${countryCode}: total ${items.length} events fetched across pages`);

  for (const item of items) {
    try {
      const venue = item._embedded?.venues?.[0];
      const lat = venue?.location?.latitude ? parseFloat(venue.location.latitude) : null;
      const lng = venue?.location?.longitude ? parseFloat(venue.location.longitude) : null;

      // For DK, fall back to city coords
      const cityName = venue?.city?.name || "";
      if (!lat && countryCode === "DK" && cityName in DANISH_CITIES) {
        const cityCoords = DANISH_CITIES[cityName];
        // will use cityCoords below
      }

      const cityCoords =
        countryCode === "DK" && cityName && DANISH_CITIES[cityName]
          ? DANISH_CITIES[cityName]
          : null;
      const finalLat = lat || cityCoords?.lat || null;
      const finalLng = lng || cityCoords?.lng || null;

      const dateTime = item.dates?.start?.dateTime ||
        (item.dates?.start?.localDate ? `${item.dates.start.localDate}T19:00:00` : null);
      if (!dateTime) continue;

      const segment = item.classifications?.[0]?.segment?.name || "";
      const genre = item.classifications?.[0]?.genre?.name || "";
      const classification = mapClassification(segment, genre);

      const priceMin = item.priceRanges?.[0]?.min || null;
      const imageUrl = pickWidestImage(item.images || []);

      const venueName = venue?.name || "";
      const venueCity = venue?.city?.name || "";
      const venueAddr = venue?.address?.line1 || "";
      const locationStr = [venueName, venueAddr, venueCity]
        .filter(Boolean)
        .join(", ")
        .replace(/^,\s*/, "")
        .replace(/,\s*,$/, "") || cityName || countryCode;

      // Determine indoor/outdoor from venue type if available
      const venueType = (venue?.type || "").toLowerCase();
      const indoorOutdoor = venueType.includes("outdoor") || venueType.includes("stadium")
        ? "outdoor"
        : classification.indoor_outdoor;

      events.push({
        title: item.name,
        description: item.info || item.pleaseNote || item.description || `${item.name} — ${segment || "Event"} in ${venueCity || countryCode}`,
        location: locationStr,
        image_url: imageUrl,
        date: dateTime,
        category: classification.category,
        max_participants: 1000,
        created_by: null,
        latitude: finalLat,
        longitude: finalLng,
        price: priceMin,
        interest_tags: classification.interest_tags,
        suitable_for_modes: ["solo", "duo", "gruppe"],
        weather_suitable: ["all"],
        indoor_outdoor: indoorOutdoor,
        category_level: 2,
        min_required_participants: 1,
        source: "ticketmaster",
        status: "active",
        country: countryCode,
      });
    } catch (itemErr) {
      errors.push(`Ticketmaster ${countryCode} event parse error: ${itemErr}`);
    }
  }

  return { events, errors };
}

// ─── Source 2: Curated Danish Events Generator ───────────────────────────────

function generateDanishEvents(): ImportedEvent[] {
  const now = new Date();
  const events: ImportedEvent[] = [];

  const futureDate = (offsetDays: number, hour = 19, minute = 0): string => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const eventTemplates = [
    {
      title: "Aalborg Karneval 2026",
      description: "Aalborg Karneval er et af Skandinaviens største karnevaler med farverige optog, samba, musik og dans i gaderne. Over 100.000 besøgende fejrer friheden og glæden i byens hjerte.",
      location: "Aalborg Midtby, Kennedy Arkaden, Aalborg",
      date: futureDate(45, 14),
      category: "festival",
      interest_tags: ["festival", "karneval", "musik", "dans", "samba"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      weather_suitable: ["clear", "cloudy"],
      indoor_outdoor: "outdoor",
      latitude: 57.0462626, longitude: 9.9215263, price: 0, max_participants: 5000, image_url: null,
    },
    {
      title: "Jazzkoncert: Aalborg Big Band",
      description: "Aalborg Symfoniorkestrets jazzafsnit præsenterer en aften med storband jazz i verdensklasse. Oplev klassikere af Duke Ellington og Count Basie samt moderne jazzkompositioner.",
      location: "Musikkens Hus, Aalborg",
      date: futureDate(7, 19, 30),
      category: "musik",
      interest_tags: ["jazz", "musik", "koncert", "storband"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      weather_suitable: ["all"],
      indoor_outdoor: "indoor",
      latitude: 57.0478, longitude: 9.9132, price: 195, max_participants: 300, image_url: null,
    },
    {
      title: "Fodboldkamp: AaB vs FC Midtjylland",
      description: "Superligakamp i Aalborg. AaB hjemmekamp på Aalborg Portland Park mod FC Midtjylland. Oplev intens Superliga-fodbold med Nordjyllands bedste hold.",
      location: "Aalborg Portland Park, Hornevej 2, Aalborg",
      date: futureDate(10, 16),
      category: "sport",
      interest_tags: ["fodbold", "sport", "superliga", "AaB"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      weather_suitable: ["clear", "cloudy"],
      indoor_outdoor: "outdoor",
      latitude: 57.0448, longitude: 9.895, price: 150, max_participants: 13800, image_url: null,
    },
    {
      title: "Streetfood Weekend på Aalborg Havn",
      description: "Oplev det bedste fra Aalborgs gastronomiske scene i en afslappet havneatmosfære. Over 30 madstader, livemusik og hygge ved vandet.",
      location: "Aalborg Havn, Østre Havnepromenade, Aalborg",
      date: futureDate(14, 12),
      category: "mad",
      interest_tags: ["mad", "streetfood", "havn", "musik", "hygge"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      weather_suitable: ["clear", "cloudy"],
      indoor_outdoor: "outdoor",
      latitude: 57.0504, longitude: 9.9377, price: 0, max_participants: 2000, image_url: null,
    },
    {
      title: "Standup-aften på Aalborg Teater",
      description: "Danmarks bedste standup-komikere mødes på Aalborg Teaters store scene. En aften med hjertestoppende humor og grin på tværs af generationer.",
      location: "Aalborg Teater, Boulevarden 19, Aalborg",
      date: futureDate(5, 20),
      category: "underholdning",
      interest_tags: ["comedy", "standup", "humor", "teater"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      weather_suitable: ["all"],
      indoor_outdoor: "indoor",
      latitude: 57.0452, longitude: 9.9192, price: 245, max_participants: 600, image_url: null,
    },
    {
      title: "Aarhus Festuge 2026",
      description: "Danmarks største kulturfestival afholdes i Aarhus i over 10 dage. Over 1000 begivenheder inden for musik, teater, dans, litteratur og billedkunst i hele byen.",
      location: "Aarhus Midtby, Aarhus",
      date: futureDate(60, 12),
      category: "festival",
      interest_tags: ["festival", "kultur", "musik", "teater", "dans"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      weather_suitable: ["clear", "cloudy"],
      indoor_outdoor: "both",
      latitude: 56.163939, longitude: 10.2039213, price: 0, max_participants: 10000, image_url: null,
    },
    {
      title: "Copenhagen Jazz Festival 2026",
      description: "Verdens største jazzfestival afholdes i København over 10 dage med hundredvis af gratis og betalte koncerter i gader, parker, jazzklubber og store scener.",
      location: "Indre By, København",
      date: futureDate(100, 17),
      category: "festival",
      interest_tags: ["jazz", "festival", "musik", "koncert", "kultur"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      weather_suitable: ["clear", "cloudy"],
      indoor_outdoor: "both",
      latitude: 55.6760968, longitude: 12.5683372, price: 0, max_participants: 25000, image_url: null,
    },
    {
      title: "Det Kongelige Teater: Romeo og Julie",
      description: "Shakespeares tidløse drama opføres af Det Kongelige Teater med flotte kostumer, imponerende scenografi og Prokofievs berømte ballet-score.",
      location: "Det Kongelige Teater, Kongens Nytorv, København",
      date: futureDate(15, 19, 30),
      category: "kultur",
      interest_tags: ["teater", "ballet", "opera", "kultur", "shakespeare"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      weather_suitable: ["all"],
      indoor_outdoor: "indoor",
      latitude: 55.6804, longitude: 12.5842, price: 380, max_participants: 1500, image_url: null,
    },
    {
      title: "Roskilde Festival 2026",
      description: "Scandinavias biggest music festival returns to Roskilde. Oplev internationale superstjerner og nye talenter på otte scener over otte dage.",
      location: "Roskilde Festival-plads, Darupvej, Roskilde",
      date: futureDate(110, 14),
      category: "festival",
      interest_tags: ["festival", "musik", "rock", "pop", "camping"],
      suitable_for_modes: ["solo", "gruppe"],
      weather_suitable: ["clear", "cloudy"],
      indoor_outdoor: "outdoor",
      latitude: 55.6415, longitude: 12.0803, price: 2695, max_participants: 130000, image_url: null,
    },
    {
      title: "Tinderbox Festival 2026",
      description: "Tinderbox er Fyn og Odenses store sommerfestival med internationale og danske topnavne. Fire dage med over 100 artister, god stemning og fællesskab.",
      location: "Tusindårsskoven, Odense",
      date: futureDate(90, 14),
      category: "festival",
      interest_tags: ["festival", "musik", "sommer", "camping", "pop", "rock"],
      suitable_for_modes: ["solo", "gruppe"],
      weather_suitable: ["clear", "cloudy"],
      indoor_outdoor: "outdoor",
      latitude: 55.3651, longitude: 10.3601, price: 1995, max_participants: 30000, image_url: null,
    },
    {
      title: "Yoga i Kildeparken – Gratis Udendørs Session",
      description: "Vores ugentlige gratis udendørs yoga-session i Aalborgs Kildeparken. For alle niveauer, fra begyndere til erfarne. Tag en yogamåtte med og mød ligesindede.",
      location: "Kildeparken, Aalborg",
      date: futureDate(3, 10),
      category: "sundhed",
      interest_tags: ["yoga", "wellness", "natur", "motion", "mindfulness"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      weather_suitable: ["clear"],
      indoor_outdoor: "outdoor",
      latitude: 57.0424, longitude: 9.9155, price: 0, max_participants: 50, image_url: null,
    },
    {
      title: "Nordkraft: Comedy Night",
      description: "Aalborgs bedste location for standup-comedy. Nordkraft Comedy Night er varet tilbage med en fyldt scene og Aalborgs skarpeste komikere. En aften med garanteret latter.",
      location: "Nordkraft, Kjellerups Torv 5, Aalborg",
      date: futureDate(9, 20),
      category: "underholdning",
      interest_tags: ["comedy", "standup", "humor", "underholdning"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      weather_suitable: ["all"],
      indoor_outdoor: "indoor",
      latitude: 57.0472, longitude: 9.9167, price: 125, max_participants: 200, image_url: null,
    },
  ];

  for (const template of eventTemplates) {
    events.push({
      ...template,
      created_by: null,
      min_required_participants: 1,
      source: "curated",
      status: "active",
      country: "DK",
    });
  }

  return events;
}

// ─── Source 3: OpenAgenda (pan-European) ─────────────────────────────────────

async function fetchOpenAgendaEvents(
  apiKey: string,
  countriesToFilter?: string[]
): Promise<{ events: ImportedEvent[]; errors: string[] }> {
  const errors: string[] = [];
  const allEvents: ImportedEvent[] = [];

  // If specific countries are requested and we have bounding boxes, query per country
  // Otherwise do a single broad European query
  const countriesToQuery = countriesToFilter?.filter((cc) => COUNTRY_BOUNDING_BOXES[cc]) || [];

  // Helper: fetch events from a single OpenAgenda endpoint URL
  async function tryOpenAgendaUrl(url: string, defaultCountry: string | null): Promise<{ items: any[]; ok: boolean; status?: number }> {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) return { items: [], ok: false, status: response.status };
      const data = await response.json();
      return { items: data.events || [], ok: true };
    } catch {
      return { items: [], ok: false };
    }
  }

  if (countriesToQuery.length > 0) {
    // Query per country using bounding boxes
    for (const cc of countriesToQuery) {
      const bbox = COUNTRY_BOUNDING_BOXES[cc];
      const url = new URL("https://api.openagenda.com/v2/events");
      url.searchParams.set("key", apiKey);
      url.searchParams.set("size", "100");
      url.searchParams.set("sort", "updatedAt.desc");
      url.searchParams.append("relative[]", "current");
      url.searchParams.append("relative[]", "upcoming");
      url.searchParams.set("geo[northEast][lat]", String(bbox.northEastLat));
      url.searchParams.set("geo[northEast][lng]", String(bbox.northEastLng));
      url.searchParams.set("geo[southWest][lat]", String(bbox.southWestLat));
      url.searchParams.set("geo[southWest][lng]", String(bbox.southWestLng));

      const { items, ok, status } = await tryOpenAgendaUrl(url.toString(), cc);

      if (!ok) {
        if (status === 403) {
          // Global event endpoint requires special access — fall back to popular public agendas
          console.log(`[import-events] OpenAgenda ${cc}: global endpoint unauthorized, trying public agendas...`);
          const publicAgendaIds = [41648, 86518, 501473, 1282232, 4641572, 5348688, 6294539, 821385];
          for (const agendaId of publicAgendaIds) {
            const agendaUrl = new URL(`https://api.openagenda.com/v2/agendas/${agendaId}/events`);
            agendaUrl.searchParams.set("key", apiKey);
            agendaUrl.searchParams.set("size", "50");
            agendaUrl.searchParams.append("relative[]", "current");
            agendaUrl.searchParams.append("relative[]", "upcoming");
            agendaUrl.searchParams.set("geo[northEast][lat]", String(bbox.northEastLat));
            agendaUrl.searchParams.set("geo[northEast][lng]", String(bbox.northEastLng));
            agendaUrl.searchParams.set("geo[southWest][lat]", String(bbox.southWestLat));
            agendaUrl.searchParams.set("geo[southWest][lng]", String(bbox.southWestLng));
            const { items: agItems, ok: agOk } = await tryOpenAgendaUrl(agendaUrl.toString(), cc);
            if (agOk) {
              for (const item of agItems) {
                const parsed = parseOpenAgendaEvent(item, cc);
                if (parsed) allEvents.push(parsed);
              }
              console.log(`[import-events] OpenAgenda agenda ${agendaId}: found ${agItems.length} events`);
            }
            await sleep(300);
          }
        } else {
          errors.push(`OpenAgenda ${cc}: HTTP ${status ?? "unknown"} error`);
        }
        await sleep(500);
        continue;
      }

      console.log(`[import-events] OpenAgenda ${cc}: found ${items.length} events`);
      for (const item of items) {
        const parsed = parseOpenAgendaEvent(item, cc);
        if (parsed) allEvents.push(parsed);
      }

      await sleep(500);
    }
  } else {
    // Fallback: broad European query (no geo filter)
    const url = new URL("https://api.openagenda.com/v2/events");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("size", "100");
    url.searchParams.set("sort", "updatedAt.desc");
    url.searchParams.append("relative[]", "current");
    url.searchParams.append("relative[]", "upcoming");

    const { items, ok, status } = await tryOpenAgendaUrl(url.toString(), null);
    if (!ok) {
      errors.push(`OpenAgenda global: HTTP ${status ?? "unknown"} - global events endpoint may require special API access`);
    } else {
      console.log(`[import-events] OpenAgenda global: found ${items.length} events`);
      for (const item of items) {
        const parsed = parseOpenAgendaEvent(item, null);
        if (parsed) allEvents.push(parsed);
      }
    }
  }

  return { events: allEvents, errors };
}

/** Parse a single OpenAgenda event object into ImportedEvent */
function parseOpenAgendaEvent(item: any, defaultCountry: string | null): ImportedEvent | null {
  try {
    // Pick title: prefer French, then English, then any non-null
    const title =
      item.title?.fr ||
      item.title?.en ||
      Object.values(item.title || {}).find((v) => v) ||
      null;
    if (!title) return null;

    // Date
    const startDate = item.firstTiming?.begin;
    if (!startDate) return null;
    if (new Date(startDate) < new Date()) return null;

    // Description
    const rawDesc =
      item.description?.fr ||
      item.description?.en ||
      Object.values(item.description || {}).find((v) => v) ||
      "";
    const description =
      typeof rawDesc === "string" && rawDesc.length > 500
        ? rawDesc.substring(0, 497) + "..."
        : String(rawDesc || "");

    // Location
    const locationName = item.location?.name || "";
    const locationCity = item.location?.city || "";
    const locationStr = [locationName, locationCity].filter(Boolean).join(", ") || "Unknown location";

    // Coordinates
    const lat = item.location?.latitude ? parseFloat(item.location.latitude) : null;
    const lng = item.location?.longitude ? parseFloat(item.location.longitude) : null;

    // Image
    const imageUrl =
      item.image?.base && item.image?.filename
        ? `${item.image.base}${item.image.filename}`
        : item.image?.url || null;

    // Country
    const country = item.location?.countryCode || defaultCountry || "FR";

    // Tags for category mapping
    const tags: string[] = (item.keywords?.fr || item.keywords?.en || []).concat(
      item.categories?.map((c: any) => c.label?.fr || c.label?.en || "") || []
    );
    const classification = mapOpenAgendaCategory(tags);

    return {
      title: String(title),
      description,
      location: locationStr,
      image_url: imageUrl,
      date: startDate,
      category: classification.category,
      max_participants: 500,
      created_by: null,
      latitude: lat,
      longitude: lng,
      price: null,
      interest_tags: classification.interest_tags,
      suitable_for_modes: classification.suitable_for_modes,
      weather_suitable: classification.weather_suitable,
      indoor_outdoor: classification.indoor_outdoor,
      category_level: 2,
      min_required_participants: 1,
      source: "openagenda",
      status: "active",
      country,
    };
  } catch (err) {
    console.error(`[import-events] OpenAgenda parse error: ${err}`);
    return null;
  }
}

// ─── Deduplication Check (day-level) ─────────────────────────────────────────

async function checkExists(
  supabase: ReturnType<typeof createClient>,
  title: string,
  date: string,
  country: string
): Promise<boolean> {
  const dayPrefix = date.substring(0, 10); // YYYY-MM-DD
  const windowStart = `${dayPrefix}T00:00:00Z`;
  const windowEnd = `${dayPrefix}T23:59:59Z`;

  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("title", title)
    .gte("date", windowStart)
    .lte("date", windowEnd)
    .eq("country", country)
    .limit(1);

  if (error) {
    console.error(`Dedup check error for "${title}":`, error.message);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

// ─── Insert Events ────────────────────────────────────────────────────────────

async function insertEvents(
  supabase: ReturnType<typeof createClient>,
  events: ImportedEvent[],
  sourceName: string,
  country: string
): Promise<ImportResult> {
  const result: ImportResult = {
    source: sourceName,
    country,
    fetched: events.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const event of events) {
    try {
      if (new Date(event.date) < new Date()) {
        result.skipped++;
        continue;
      }

      const exists = await checkExists(supabase, event.title, event.date, event.country || country);
      if (exists) {
        result.skipped++;
        continue;
      }

      const { error } = await supabase.from("events").insert({
        title: event.title,
        description: event.description,
        location: event.location,
        image_url: event.image_url,
        date: event.date,
        category: event.category,
        max_participants: event.max_participants,
        created_by: event.created_by,
        latitude: event.latitude,
        longitude: event.longitude,
        price: event.price,
        interest_tags: event.interest_tags,
        suitable_for_modes: event.suitable_for_modes,
        weather_suitable: event.weather_suitable,
        indoor_outdoor: event.indoor_outdoor,
        category_level: event.category_level,
        min_required_participants: event.min_required_participants,
        source: event.source,
        status: event.status,
        country: event.country || country,
      });

      if (error) {
        result.errors.push(`Insert error for "${event.title}": ${error.message}`);
      } else {
        result.inserted++;
        console.log(`[import-events] Inserted: ${event.title} (${event.country || country})`);
      }
    } catch (err) {
      result.errors.push(`Error processing "${event.title}": ${err}`);
    }
  }

  console.log(
    `[import-events] Importing ${country}: found ${result.fetched} events, inserted ${result.inserted} new`
  );
  return result;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const startTime = Date.now();
  const results: ImportResult[] = [];
  const globalErrors: string[] = [];

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const ticketmasterKey = Deno.env.get("TICKETMASTER_API_KEY") ?? "";
    // Fall back to hardcoded defaults when env vars are not set in Supabase secrets
    const openAgendaKey = Deno.env.get("OPENAGENDA_KEY") ?? "95cdf9a694424435a29025dbf4e66b92";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Parse optional ?country=XX query param
    const reqUrl = new URL(req.url);
    const countryParam = reqUrl.searchParams.get("country");
    const countriesToImport = countryParam
      ? [countryParam.toUpperCase()]
      : ALL_COUNTRIES;

    let ticketmasterUsed = false;
    let ticketmasterFailed = false;

    // ── Source 1: Ticketmaster by country ──────────────────────────────────
    if (ticketmasterKey) {
      console.log(`[import-events] Starting Ticketmaster import for ${countriesToImport.length} countries...`);

      for (const cc of countriesToImport) {
        try {
          const { events: tmEvents, errors: tmErrors } = await fetchTicketmasterByCountry(
            ticketmasterKey,
            cc
          );

          if (tmErrors.length > 0) {
            globalErrors.push(...tmErrors);
          }

          if (tmEvents.length > 0) {
            const result = await insertEvents(supabase, tmEvents, "ticketmaster", cc);
            results.push(result);
            ticketmasterUsed = true;
          } else {
            results.push({
              source: "ticketmaster",
              country: cc,
              fetched: 0,
              inserted: 0,
              skipped: 0,
              errors: tmErrors,
            });
          }

          // Rate limit: max 5 requests/sec (Ticketmaster free tier)
          await sleep(200);
        } catch (ccErr) {
          globalErrors.push(`Fatal error for country ${cc}: ${ccErr}`);
          ticketmasterFailed = true;
          await sleep(200);
        }
      }
    } else {
      console.log("[import-events] TICKETMASTER_API_KEY not set — skipping Ticketmaster, using fallback only.");
      ticketmasterFailed = true;
    }

    // ── Source 2: Curated Danish Fallback ──────────────────────────────────
    // Use if: Ticketmaster key missing OR all TM calls failed OR DK is in scope
    const importingDK = countriesToImport.includes("DK");
    const useFallback =
      importingDK && (!ticketmasterKey || ticketmasterFailed || !ticketmasterUsed);

    if (useFallback) {
      console.log("[import-events] Running curated Danish fallback generator...");
      const curatedEvents = generateDanishEvents();
      const result = await insertEvents(supabase, curatedEvents, "curated", "DK");
      results.push(result);
    }

    // ── Source 3: OpenAgenda (pan-European) ────────────────────────────────
    let openAgendaUsed = false;
    if (openAgendaKey) {
      console.log("[import-events] Starting OpenAgenda import...");

      try {
        // Pass countries that have bounding boxes defined; OpenAgenda is mostly European
        const europeanCountries = countriesToImport.filter((cc) => COUNTRY_BOUNDING_BOXES[cc]);
        const { events: oaEvents, errors: oaErrors } = await fetchOpenAgendaEvents(
          openAgendaKey,
          europeanCountries.length > 0 ? europeanCountries : countriesToImport
        );

        if (oaErrors.length > 0) {
          globalErrors.push(...oaErrors);
        }

        if (oaEvents.length > 0) {
          // Group events by country for separate result entries
          const byCountry = new Map<string, ImportedEvent[]>();
          for (const ev of oaEvents) {
            const cc = ev.country || "XX";
            if (!byCountry.has(cc)) byCountry.set(cc, []);
            byCountry.get(cc)!.push(ev);
          }

          for (const [cc, ccEvents] of byCountry.entries()) {
            const result = await insertEvents(supabase, ccEvents, "openagenda", cc);
            results.push(result);
          }
          openAgendaUsed = true;
        } else {
          results.push({
            source: "openagenda",
            country: "EU",
            fetched: 0,
            inserted: 0,
            skipped: 0,
            errors: oaErrors,
          });
        }
      } catch (oaErr) {
        globalErrors.push(`OpenAgenda fatal error: ${oaErr}`);
      }
    } else {
      console.log("[import-events] OPENAGENDA_KEY not set — skipping OpenAgenda.");
    }

    // ── Summary ──────────────────────────────────────────────────────────
    const totalFetched = results.reduce((s, r) => s + r.fetched, 0);
    const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
    const totalSkipped = results.reduce((s, r) => s + r.skipped, 0);
    const durationMs = Date.now() - startTime;

    console.log(
      `[import-events] Done: ${totalInserted} inserted, ${totalSkipped} skipped in ${durationMs}ms`
    );

    return new Response(
      JSON.stringify({
        success: true,
        countries_requested: countriesToImport,
        countries_processed: countriesToImport.length,
        ticketmaster_used: ticketmasterUsed,
        curated_fallback_used: useFallback,
        openagenda_used: openAgendaUsed,
        totals: {
          fetched: totalFetched,
          inserted: totalInserted,
          skipped: totalSkipped,
        },
        duration_ms: durationMs,
        results,
        errors: globalErrors,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("[import-events] Fatal error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(err),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
