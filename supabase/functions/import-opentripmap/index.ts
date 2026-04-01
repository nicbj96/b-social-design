/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://rbengtfrthqdfbcdcugp.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OTM_API_KEY = Deno.env.get("OPENTRIPMAP_API_KEY") || "5ae2e3f221c38a28845f05b6";
const OTM_BASE = "https://api.opentripmap.org/0.1/en/places";

// ---------------------------------------------------------------------------
// City / country data
// ---------------------------------------------------------------------------
const COUNTRY_CITIES: Record<string, { lat: number; lon: number; city: string }[]> = {
  DK: [
    { city: "Copenhagen", lat: 55.676, lon: 12.568 },
    { city: "Aarhus", lat: 56.164, lon: 10.204 },
    { city: "Odense", lat: 55.396, lon: 10.388 },
    { city: "Aalborg", lat: 57.046, lon: 9.922 },
  ],
  SE: [
    { city: "Stockholm", lat: 59.329, lon: 18.069 },
    { city: "Gothenburg", lat: 57.709, lon: 11.975 },
    { city: "Malmö", lat: 55.605, lon: 13.000 },
  ],
  NO: [
    { city: "Oslo", lat: 59.913, lon: 10.752 },
    { city: "Bergen", lat: 60.393, lon: 5.324 },
    { city: "Trondheim", lat: 63.431, lon: 10.395 },
  ],
  DE: [
    { city: "Berlin", lat: 52.520, lon: 13.405 },
    { city: "Munich", lat: 48.137, lon: 11.576 },
    { city: "Hamburg", lat: 53.551, lon: 9.994 },
    { city: "Frankfurt", lat: 50.110, lon: 8.682 },
    { city: "Cologne", lat: 50.938, lon: 6.960 },
  ],
  NL: [
    { city: "Amsterdam", lat: 52.370, lon: 4.895 },
    { city: "Rotterdam", lat: 51.925, lon: 4.479 },
  ],
  FR: [
    { city: "Paris", lat: 48.857, lon: 2.352 },
    { city: "Lyon", lat: 45.764, lon: 4.836 },
    { city: "Marseille", lat: 43.297, lon: 5.374 },
  ],
  IT: [
    { city: "Rome", lat: 41.903, lon: 12.496 },
    { city: "Milan", lat: 45.464, lon: 9.190 },
    { city: "Florence", lat: 43.770, lon: 11.249 },
  ],
  ES: [
    { city: "Madrid", lat: 40.417, lon: -3.704 },
    { city: "Barcelona", lat: 41.386, lon: 2.170 },
  ],
  GB: [
    { city: "London", lat: 51.507, lon: -0.128 },
    { city: "Edinburgh", lat: 55.953, lon: -3.189 },
    { city: "Manchester", lat: 53.483, lon: -2.244 },
  ],
  US: [
    { city: "New York", lat: 40.713, lon: -74.006 },
    { city: "Los Angeles", lat: 34.052, lon: -118.244 },
    { city: "Chicago", lat: 41.878, lon: -87.630 },
  ],
  AT: [{ city: "Vienna", lat: 48.208, lon: 16.372 }],
  CH: [{ city: "Zurich", lat: 47.377, lon: 8.540 }],
  BE: [{ city: "Brussels", lat: 50.850, lon: 4.352 }],
  IE: [{ city: "Dublin", lat: 53.350, lon: -6.260 }],
  AU: [{ city: "Sydney", lat: -33.869, lon: 151.209 }],
  NZ: [{ city: "Auckland", lat: -36.848, lon: 174.763 }],
  TR: [{ city: "Istanbul", lat: 41.009, lon: 28.978 }],
  ZA: [{ city: "Cape Town", lat: -33.925, lon: 18.424 }],
  AE: [{ city: "Dubai", lat: 25.205, lon: 55.270 }],
};

const COUNTRY_NAMES: Record<string, string> = {
  DK: "Denmark", SE: "Sweden", NO: "Norway", DE: "Germany",
  NL: "Netherlands", FR: "France", IT: "Italy", ES: "Spain",
  GB: "United Kingdom", US: "United States", AT: "Austria",
  CH: "Switzerland", BE: "Belgium", IE: "Ireland", AU: "Australia",
  NZ: "New Zealand", TR: "Turkey", ZA: "South Africa", AE: "United Arab Emirates",
};

// ---------------------------------------------------------------------------
// Kind → category mapping
// ---------------------------------------------------------------------------
interface KindMapping {
  main_categories: string[];
  tags: string[];
  smart_tags: string[];
}

const KIND_MAP: Record<string, KindMapping> = {
  museums: {
    main_categories: ["kultur"],
    tags: ["museum", "udstilling", "kunst"],
    smart_tags: ["KULTUR", "MUSEUM"],
  },
  theatres_and_entertainments: {
    main_categories: ["kultur", "underholdning"],
    tags: ["teater", "show"],
    smart_tags: ["KULTUR", "TEATER"],
  },
  amusements: {
    main_categories: ["familie", "underholdning"],
    tags: ["forlystelse", "sjov"],
    smart_tags: ["FAMILIE", "UNDERHOLDNING"],
  },
  sport: {
    main_categories: ["aktiv_sport"],
    tags: ["sport", "aktivitet"],
    smart_tags: ["AKTIV_SPORT"],
  },
  natural: {
    main_categories: ["natur"],
    tags: ["natur", "park", "grønt"],
    smart_tags: ["NATUR"],
  },
  foods: {
    main_categories: ["mad_hangout"],
    tags: ["restaurant", "mad", "café"],
    smart_tags: ["MAD", "RESTAURANT"],
  },
  shops: {
    main_categories: ["shopping"],
    tags: ["shopping", "butik"],
    smart_tags: ["SHOPPING"],
  },
  religion: {
    main_categories: ["kultur"],
    tags: ["kirke", "tempel", "religion"],
    smart_tags: ["KULTUR", "RELIGION"],
  },
  accomodations: {
    main_categories: ["overnatning"],
    tags: ["hotel", "overnatning"],
    smart_tags: ["OVERNATNING"],
  },
};

const ALL_KINDS = Object.keys(KIND_MAP);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomSubset<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// Deduplicate key: round lat/lon to 3 decimal places + normalized name
function dedupeKey(name: string, lat: number, lon: number): string {
  return `${name.toLowerCase().trim()}|${lat.toFixed(3)}|${lon.toFixed(3)}`;
}

// ---------------------------------------------------------------------------
// OpenTripMap fetch helpers
// ---------------------------------------------------------------------------
async function fetchRadiusPlaces(
  lat: number,
  lon: number,
  kind: string,
): Promise<OtmListItem[]> {
  const url =
    `${OTM_BASE}/radius?radius=50000&lon=${lon}&lat=${lat}&kinds=${kind}&limit=500&format=json&apikey=${OTM_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchPlaceDetail(xid: string): Promise<OtmDetail | null> {
  const url = `${OTM_BASE}/xid/${xid}?apikey=${OTM_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Type definitions (minimal)
// ---------------------------------------------------------------------------
interface OtmListItem {
  xid: string;
  name: string;
  rate: number;
  osm: string;
  kinds: string;
  point: { lon: number; lat: number };
}

interface OtmDetail {
  xid: string;
  name: string;
  rate: number;
  kinds: string;
  point?: { lon: number; lat: number };
  address?: {
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  wikipedia_extracts?: { text?: string; html?: string };
  image?: string;
  url?: string;
  info?: { descr?: string };
}

interface PlaceRow {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  main_categories: string[];
  tags: string[];
  smart_tags: string;
  metadata: Record<string, unknown>;
  rating_avg: number | null;
  rating_count: number | null;
}

// ---------------------------------------------------------------------------
// Main Edge Function
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse body
  let body: {
    countries?: string[];
    max_cities?: number;
    kinds?: string[];
  } = {};
  try {
    body = await req.json();
  } catch {
    // default body
  }

  const allCountryCodes = Object.keys(COUNTRY_CITIES);
  let targetCountries: string[] = body.countries?.filter((c) =>
    allCountryCodes.includes(c)
  ) ?? [];

  if (targetCountries.length === 0) {
    // Default: DK + 2 random countries
    const others = allCountryCodes.filter((c) => c !== "DK");
    targetCountries = ["DK", ...randomSubset(others, 2)];
  }

  const maxCities = body.max_cities ?? 999;
  const targetKinds: string[] = body.kinds?.filter((k) => k in KIND_MAP) ??
    ALL_KINDS;

  // Timeout guard: start timer, stop gracefully at 55s
  const startTime = Date.now();
  const TIMEOUT_MS = 55_000;

  function isTimedOut(): boolean {
    return Date.now() - startTime > TIMEOUT_MS;
  }

  // Supabase client (manual REST calls to avoid bundle size)
  async function upsertPlaces(rows: PlaceRow[]): Promise<number> {
    if (!SUPABASE_KEY) {
      console.warn("SUPABASE_SERVICE_ROLE_KEY not set — skipping DB write");
      return 0;
    }
    if (rows.length === 0) return 0;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/places`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("Supabase upsert error:", res.status, txt);
      return 0;
    }
    return rows.length;
  }

  // Deduplicate tracking
  const seenKeys = new Set<string>();

  const summary = {
    countries_processed: [] as string[],
    total_fetched: 0,
    total_inserted: 0,
    total_skipped_duplicate: 0,
    total_skipped_no_name: 0,
    detail_calls: 0,
    timed_out: false,
    errors: [] as string[],
  };

  // Batch buffer for upserts
  const BATCH_SIZE = 50;
  const buffer: PlaceRow[] = [];

  async function flushBuffer(): Promise<void> {
    if (buffer.length === 0) return;
    const inserted = await upsertPlaces([...buffer]);
    summary.total_inserted += inserted;
    buffer.length = 0;
  }

  // Process each country
  outer:
  for (const countryCode of targetCountries) {
    if (isTimedOut()) {
      summary.timed_out = true;
      break;
    }

    const cities = COUNTRY_CITIES[countryCode] ?? [];
    const citySlice = cities.slice(0, maxCities);
    const countryName = COUNTRY_NAMES[countryCode] ?? countryCode;

    for (const cityInfo of citySlice) {
      if (isTimedOut()) {
        summary.timed_out = true;
        break outer;
      }

      for (const kind of targetKinds) {
        if (isTimedOut()) {
          summary.timed_out = true;
          break outer;
        }

        await sleep(500); // Rate limit: 500ms between calls

        const items = await fetchRadiusPlaces(
          cityInfo.lat,
          cityInfo.lon,
          kind,
        );

        for (const item of items) {
          if (isTimedOut()) {
            summary.timed_out = true;
            break outer;
          }

          // Skip places without a name
          if (!item.name || item.name.trim() === "") {
            summary.total_skipped_no_name++;
            continue;
          }

          const lat = item.point?.lat ?? 0;
          const lon = item.point?.lon ?? 0;

          // Deduplicate
          const key = dedupeKey(item.name, lat, lon);
          if (seenKeys.has(key)) {
            summary.total_skipped_duplicate++;
            continue;
          }
          seenKeys.add(key);
          summary.total_fetched++;

          // Merge category data from all matching kinds in item.kinds
          const itemKindsList = (item.kinds || kind).split(",").map((k) =>
            k.trim()
          );
          const allMainCats = new Set<string>();
          const allTags = new Set<string>();
          const allSmartTags = new Set<string>();

          // Always add the current search kind
          const primaryMapping = KIND_MAP[kind];
          if (primaryMapping) {
            primaryMapping.main_categories.forEach((c) =>
              allMainCats.add(c)
            );
            primaryMapping.tags.forEach((t) => allTags.add(t));
            primaryMapping.smart_tags.forEach((s) => allSmartTags.add(s));
          }

          // Add any other recognized kinds from the item
          for (const k of itemKindsList) {
            const m = KIND_MAP[k];
            if (m) {
              m.main_categories.forEach((c) => allMainCats.add(c));
              m.tags.forEach((t) => allTags.add(t));
              m.smart_tags.forEach((s) => allSmartTags.add(s));
            }
          }

          // Only fetch detail for top-rated places (rate >= 2) to save API calls
          let description = "";
          let imageUrl = "";
          let wikipediaUrl = "";
          let detailAddress: OtmDetail["address"] | undefined;

          if (item.rate >= 2 && !isTimedOut()) {
            await sleep(500);
            summary.detail_calls++;
            const detail = await fetchPlaceDetail(item.xid);
            if (detail) {
              description =
                detail.wikipedia_extracts?.text ||
                detail.info?.descr ||
                "";
              imageUrl = detail.image || "";
              wikipediaUrl = detail.url || "";
              detailAddress = detail.address;
            }
          }

          // Resolve city/region from detail address or fall back to search city
          const resolvedCity = detailAddress?.city || cityInfo.city;
          const resolvedRegion = detailAddress?.state || "";

          const row: PlaceRow = {
            name: item.name.trim(),
            description: description.trim(),
            latitude: lat,
            longitude: lon,
            city: resolvedCity,
            region: resolvedRegion,
            country: countryName,
            main_categories: [...allMainCats],
            tags: [...allTags],
            smart_tags: [...allSmartTags].join(","),
            metadata: {
              xid: item.xid,
              rate: item.rate,
              kinds: item.kinds,
              source_kind: kind,
              source_city: cityInfo.city,
              country_code: countryCode,
              image: imageUrl || null,
              wikipedia_url: wikipediaUrl || null,
              osm: item.osm || null,
              imported_at: new Date().toISOString(),
            },
            rating_avg: item.rate > 0 ? item.rate : null,
            rating_count: null,
          };

          buffer.push(row);

          if (buffer.length >= BATCH_SIZE) {
            await flushBuffer();
          }
        }
      }
    }

    summary.countries_processed.push(countryCode);
  }

  // Flush any remaining rows
  await flushBuffer();

  return new Response(
    JSON.stringify({
      success: true,
      summary,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
});
