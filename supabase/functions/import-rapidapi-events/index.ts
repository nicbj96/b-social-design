import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAPIDAPI_HOST = "real-time-events-search.p.rapidapi.com";
const SUPABASE_URL_ENV = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY_ENV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function startRun(functionName: string): Promise<string | null> {
  const runId = crypto.randomUUID();
  try {
    await fetch(`${SUPABASE_URL_ENV}/rest/v1/import_runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY_ENV, "Authorization": `Bearer ${SUPABASE_KEY_ENV}`, "Prefer": "return=minimal" },
      body: JSON.stringify({ id: runId, function_name: functionName, started_at: new Date().toISOString(), status: "running" }),
    });
  } catch { /* non-fatal */ }
  return runId;
}

async function completeRun(runId: string | null, inserted: number, errors: string[]): Promise<void> {
  if (!runId) return;
  try {
    await fetch(`${SUPABASE_URL_ENV}/rest/v1/import_runs?id=eq.${runId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY_ENV, "Authorization": `Bearer ${SUPABASE_KEY_ENV}`, "Prefer": "return=minimal" },
      body: JSON.stringify({ completed_at: new Date().toISOString(), status: "completed", inserted_count: inserted, error_count: errors.length, errors: errors.length > 0 ? errors : null }),
    });
  } catch { /* non-fatal */ }
}

const EVENT_QUERIES = [
  "concerts", "live music", "music festival", "jazz concert", "rock concert", "electronic music", "opera", "symphony", "rock koncert", "pop koncert", "koncert",
  "football match", "soccer game", "basketball game", "tennis tournament", "cycling race", "marathon", "triathlon", "boxing match", "MMA fight",
  "extreme sport", "surfing", "rock climbing", "skateboarding", "bmx competition", "skydiving", "bungee jumping", "paragliding", "motocross", "scuba diving",
  "parkour competition", "downhill mtb race", "ironman triathlon", "ultra marathon", "wakeboarding", "kite surfing", "snowboarding competition", "freestyle skiing",
  "mountain bike race", "mountainbike rute", "trail running", "hiking event", "løberute", "vandrerute", "cykelrute", "mtb event",
  "museum exhibition", "art exhibition", "gallery opening", "theater", "comedy show", "stand-up comedy", "ballet", "dance performance",
  "food festival", "wine tasting", "beer festival", "street food market", "cooking class", "yoga class", "fitness event", "outdoor gym", "crossfit event",
  "theme park", "amusement park", "zoo event", "aquarium event", "family event", "kids event", "circus", "carnival", "flea market", "christmas market"
];

const COUNTRY_CITIES: Record<string, string[]> = {
  DK: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle", "Roskilde"],
  SE: ["Stockholm", "Gothenburg", "Malmö", "Uppsala"], NO: ["Oslo", "Bergen", "Trondheim"], FI: ["Helsinki", "Tampere"],
  DE: ["Berlin", "Munich", "Hamburg", "Frankfurt"], NL: ["Amsterdam", "Rotterdam"], BE: ["Brussels", "Antwerp"],
  AT: ["Vienna", "Salzburg"], CH: ["Zurich", "Geneva"], ES: ["Madrid", "Barcelona", "Valencia"], FR: ["Paris", "Lyon", "Nice"],
  IT: ["Rome", "Milan", "Florence", "Naples"], GB: ["London", "Manchester", "Edinburgh", "Birmingham"], IE: ["Dublin", "Cork"],
  US: ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami", "Seattle", "Austin", "Boston"], CA: ["Toronto", "Vancouver", "Montreal"],
  AU: ["Sydney", "Melbourne", "Brisbane"], NZ: ["Auckland", "Wellington"], AE: ["Dubai", "Abu Dhabi"], ZA: ["Cape Town", "Johannesburg"], TR: ["Istanbul", "Ankara"],
  JP: ["Tokyo", "Osaka", "Kyoto"], KR: ["Seoul", "Busan"], CN: ["Beijing", "Shanghai", "Guangzhou"], IN: ["Mumbai", "Delhi", "Bangalore", "Chennai"],
  TH: ["Bangkok", "Chiang Mai"], VN: ["Hanoi", "Ho Chi Minh City"], ID: ["Jakarta", "Bali"], MY: ["Kuala Lumpur"], SG: ["Singapore"],
  PH: ["Manila", "Cebu"], TW: ["Taipei"], HK: ["Hong Kong"],
  BR: ["São Paulo", "Rio de Janeiro", "Brasília"], AR: ["Buenos Aires", "Córdoba"], CL: ["Santiago"], CO: ["Bogotá", "Medellín"],
  MX: ["Mexico City", "Guadalajara", "Monterrey"], PE: ["Lima"],
  EG: ["Cairo", "Alexandria"], MA: ["Casablanca", "Marrakech"], NG: ["Lagos", "Abuja"], KE: ["Nairobi"], GH: ["Accra"],
  IL: ["Tel Aviv", "Jerusalem"], SA: ["Riyadh", "Jeddah"], QA: ["Doha"], KW: ["Kuwait City"],
  GR: ["Athens", "Thessaloniki"], PT: ["Lisbon", "Porto"], HU: ["Budapest"], RO: ["Bucharest"],
  PL: ["Warsaw", "Krakow"], CZ: ["Prague"], HR: ["Zagreb", "Split"],
};

function categorizeEvent(query: string, event: any) {
  const combined = `${query} ${event.name} ${event.description}`.toLowerCase();
  if (/concert|music|festival|koncert/i.test(combined)) return { category: "musik", tags: ["musik", "koncert"], indoor_outdoor: "indoor", weather_suitable: ["all"], suitable_for_modes: ["solo", "duo", "gruppe"] };
  if (/extreme|surfing|climbing|skate|bmx|skydiv|bungee|paraglid|motocross|parkour|wakeboard|kite|snowboard|freestyle/i.test(combined)) return { category: "aktiv_sport", tags: ["extreme", "action"], indoor_outdoor: "outdoor", weather_suitable: ["clear", "cloudy"], suitable_for_modes: ["solo", "duo", "gruppe"] };
  if (/mountain bike|mtb|trail run|hiking|rute|trail/i.test(combined)) return { category: "natur", tags: ["natur", "rute"], indoor_outdoor: "outdoor", weather_suitable: ["clear", "cloudy"], suitable_for_modes: ["solo", "duo", "gruppe"] };
  if (/sport|match|game|tournament|race|marathon/i.test(combined)) return { category: "sport", tags: ["sport"], indoor_outdoor: "outdoor", weather_suitable: ["clear", "cloudy"], suitable_for_modes: ["solo", "duo", "gruppe"] };
  if (/fitness|gym|yoga|crossfit|workout/i.test(combined)) return { category: "aktiv_sport", tags: ["fitness", "wellness"], indoor_outdoor: "indoor", weather_suitable: ["all"], suitable_for_modes: ["solo", "duo", "gruppe"] };
  return { category: "arrangement", tags: ["event", "oplevelse"], indoor_outdoor: "indoor", weather_suitable: ["all"], suitable_for_modes: ["solo", "duo", "gruppe"] };
}

async function fetchRapidAPI(apiKey: string, query: string, date: string) {
  const url = `https://real-time-events-search.p.rapidapi.com/search-events?query=${encodeURIComponent(query)}&date=${date}`;
  const resp = await fetch(url, {
    headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": RAPIDAPI_HOST },
    signal: AbortSignal.timeout(15_000),
  });
  if (!resp.ok) return [];
  const data = await resp.json();
  return data.data || [];
}

Deno.serve(async (req) => {
  const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
  const supabase = createClient(SUPABASE_URL_ENV, SUPABASE_KEY_ENV);
  const runId = await startRun("import-rapidapi-events");
  const errors: string[] = [];

  const results = [];
  const plan = [];
  
  for (const [cc, cities] of Object.entries(COUNTRY_CITIES)) {
    for (const city of cities) {
      plan.push({ query: `${EVENT_QUERIES[Math.floor(Math.random()*EVENT_QUERIES.length)]} in ${city}`, country: cc });
    }
  }
  
  const shuffled = plan.sort(() => Math.random() - 0.5);
  
  for (const item of shuffled.slice(0, 50)) {
    try {
      const events = await fetchRapidAPI(RAPIDAPI_KEY!, item.query, "month");
      const toInsert = events.map((e: any) => {
        const { category, tags, indoor_outdoor, weather_suitable, suitable_for_modes } = categorizeEvent(item.query, e);
        const lat = e.venue?.latitude ? parseFloat(e.venue.latitude) : null;
        const lon = e.venue?.longitude ? parseFloat(e.venue.longitude) : null;
        return {
          title: e.name,
          description: (e.description || e.name || "").slice(0, 500),
          location: e.venue?.full_address || e.venue?.city || item.query,
          image_url: e.thumbnail || null,
          date: e.start_time,
          category,
          interest_tags: tags,
          indoor_outdoor,
          weather_suitable,
          suitable_for_modes,
          latitude: lat,
          longitude: lon,
          country: item.country,
          source: "rapidapi",
          status: "active",
          max_participants: 500,
          created_by: null,
          price: null,
          min_required_participants: 1,
          category_level: 2,
          url: e.link || e.url || null,
        };
      });
      if (toInsert.length > 0) await supabase.from("events").upsert(toInsert, { onConflict: "title,date,location", ignoreDuplicates: true });
      results.push({ query: item.query, count: events.length });
      await new Promise(r => setTimeout(r, 250));
    } catch (err: any) { console.error(err); errors.push(String(err?.message ?? err)); }
  }
  const totalInserted = results.reduce((s, r) => s + r.count, 0);
  await completeRun(runId, totalInserted, errors);
  return new Response(JSON.stringify({ success: true, results }));
});
