/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />
import { createClient } from "jsr:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://rbengtfrthqdfbcdcugp.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);

// ---------------------------------------------------------------------------
// Country code → full name
// ---------------------------------------------------------------------------
const COUNTRY_NAMES: Record<string, string> = {
  DK: "Denmark", SE: "Sweden", NO: "Norway", FI: "Finland",
  DE: "Germany", NL: "Netherlands", BE: "Belgium", AT: "Austria",
  CH: "Switzerland", ES: "Spain", FR: "France", IT: "Italy",
  GB: "United Kingdom", IE: "Ireland", PL: "Poland", CZ: "Czech Republic",
  US: "United States", CA: "Canada", MX: "Mexico", BR: "Brazil",
  CL: "Chile", PE: "Peru", AU: "Australia", NZ: "New Zealand",
  AE: "United Arab Emirates", ZA: "South Africa", TR: "Turkey",
};

// ---------------------------------------------------------------------------
// Category mappings
// ---------------------------------------------------------------------------
interface CategoryMapping {
  main_categories: string[];
  tags: string[];
  smart_tags: string[];
}

const CATEGORY_MAP: Record<string, CategoryMapping> = {
  "tourism=zoo":           { main_categories: ["natur","familie"],         tags: ["zoo","dyrepark","dyr"],              smart_tags: ["NATUR","ZOO","FAMILIE"] },
  "tourism=museum":        { main_categories: ["kultur"],                   tags: ["museum","udstilling"],               smart_tags: ["KULTUR","MUSEUM"] },
  "tourism=camp_site":     { main_categories: ["natur","overnatning"],      tags: ["camping","campingplads"],            smart_tags: ["NATUR","CAMPING"] },
  "tourism=theme_park":    { main_categories: ["familie","underholdning"],  tags: ["forlystelsespark","temapark"],       smart_tags: ["FAMILIE","FORLYSTELSESPARK"] },
  "tourism=aquarium":      { main_categories: ["natur","familie"],          tags: ["akvarium","hav"],                   smart_tags: ["NATUR","AKVARIUM"] },
  "tourism=alpine_hut":    { main_categories: ["natur","overnatning"],      tags: ["bjerghytte","vandring"],             smart_tags: ["NATUR","HYTTE","VANDRING"] },
  "tourism=wilderness_hut":{ main_categories: ["natur","overnatning"],      tags: ["shelter","hytte"],                  smart_tags: ["NATUR","SHELTER"] },
  "amenity=shelter":       { main_categories: ["natur","overnatning"],      tags: ["shelter","friluftsliv"],             smart_tags: ["NATUR","SHELTER","FRILUFTSLIV"] },
  "leisure=nature_reserve":{ main_categories: ["natur"],                    tags: ["naturreservat","natur"],             smart_tags: ["NATUR","RESERVAT"] },
  "leisure=fitness_station":{ main_categories: ["aktiv_sport"],             tags: ["udendørs træning","fitness"],        smart_tags: ["AKTIV_SPORT","FITNESS"] },
  "boundary=national_park":{ main_categories: ["natur"],                    tags: ["nationalpark","natur"],              smart_tags: ["NATUR","NATIONALPARK"] },
};

const TAG_CHECKS = [
  { key: "tourism",  value: "zoo" },
  { key: "tourism",  value: "museum" },
  { key: "tourism",  value: "camp_site" },
  { key: "tourism",  value: "theme_park" },
  { key: "tourism",  value: "aquarium" },
  { key: "tourism",  value: "alpine_hut" },
  { key: "tourism",  value: "wilderness_hut" },
  { key: "amenity",  value: "shelter" },
  { key: "leisure",  value: "nature_reserve" },
  { key: "leisure",  value: "fitness_station" },
  { key: "boundary", value: "national_park" },
];

// ---------------------------------------------------------------------------
// Overpass
// ---------------------------------------------------------------------------
// FIX: reduced timeout from 90 → 18 so the edge function doesn't hang
function buildOverpassQuery(countryCode: string): string {
  return `[out:json][timeout:18];
area["ISO3166-1"="${countryCode}"]->.a;
(
  nwr["tourism"="zoo"](area.a);
  nwr["tourism"="museum"](area.a);
  nwr["tourism"="camp_site"](area.a);
  nwr["tourism"="theme_park"](area.a);
  nwr["tourism"="aquarium"](area.a);
  nwr["tourism"="alpine_hut"](area.a);
  nwr["tourism"="wilderness_hut"](area.a);
  nwr["amenity"="shelter"](area.a);
  nwr["leisure"="nature_reserve"](area.a);
  nwr["leisure"="fitness_station"](area.a);
  nwr["boundary"="national_park"](area.a);
);
out center 5000;`;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

// FIX: added AbortSignal.timeout so a slow Overpass won't block beyond the edge function deadline
async function fetchOverpass(query: string, attempt = 0): Promise<any> {
  const endpoint = OVERPASS_ENDPOINTS[attempt % OVERPASS_ENDPOINTS.length];
  const body = new URLSearchParams({ data: query });
  let resp: Response;
  try {
    resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(20_000), // FIX: was missing entirely
    });
  } catch (err: any) {
    if (attempt < 1) {
      await sleep(1000);
      return fetchOverpass(query, attempt + 1);
    }
    throw err;
  }
  if (!resp.ok) {
    const text = await resp.text();
    if (attempt < 1) {
      await sleep(2000);
      return fetchOverpass(query, attempt + 1);
    }
    throw new Error(`Overpass HTTP ${resp.status} from ${endpoint}: ${text.slice(0, 200)}`);
  }
  return resp.json();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function getCoords(el: any): { lat: number; lon: number } | null {
  if (el.type === "node" && el.lat != null && el.lon != null)
    return { lat: el.lat, lon: el.lon };
  if (el.center?.lat != null && el.center?.lon != null)
    return { lat: el.center.lat, lon: el.center.lon };
  return null;
}

function resolveCategory(osmTags: Record<string, string>) {
  for (const { key, value } of TAG_CHECKS) {
    if (osmTags[key] === value) {
      const typeKey = `${key}=${value}`;
      return { mapping: CATEGORY_MAP[typeKey], typeKey };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Batch insert — FIX: use ignoreDuplicates instead of per-row isDuplicate()
// ---------------------------------------------------------------------------
async function insertBatch(rows: any[]): Promise<number> {
  if (rows.length === 0) return 0;
  const { error, count } = await supabase.from("places").insert(rows, {
    count: "exact",
    ignoreDuplicates: true, // FIX: was doing 1 DB roundtrip per element before
  });
  if (error) {
    console.error("Insert batch error:", error.message);
    return 0;
  }
  return count ?? rows.length;
}

// ---------------------------------------------------------------------------
// Process one country
// ---------------------------------------------------------------------------
async function processCountry(
  countryCode: string,
  byType: Record<string, number>,
  isTimedOut: () => boolean,
): Promise<{ fetched: number; inserted: number }> {
  const countryName = COUNTRY_NAMES[countryCode] ?? countryCode;
  console.log(`Processing ${countryCode} (${countryName})…`);
  const query = buildOverpassQuery(countryCode);
  let response: any;
  try {
    response = await fetchOverpass(query);
  } catch (err) {
    console.error(`Overpass fetch failed for ${countryCode}:`, err);
    return { fetched: 0, inserted: 0 };
  }

  const elements = response.elements ?? [];
  console.log(`  ${countryCode}: ${elements.length} elements returned`);

  let fetched = 0;
  let inserted = 0;
  const batch: any[] = [];

  for (const el of elements) {
    if (isTimedOut()) break; // FIX: honour timeout inside element loop

    const osmTags = el.tags ?? {};
    const name = osmTags["name"]?.trim();
    if (!name) continue;
    const coords = getCoords(el);
    if (!coords) continue;
    const resolved = resolveCategory(osmTags);
    if (!resolved) continue;

    fetched++;

    // FIX: removed per-element isDuplicate() DB call — ignoreDuplicates handles this

    const city    = osmTags["addr:city"] ?? "";
    const region  = osmTags["addr:state"] ?? osmTags["addr:county"] ?? "";
    const website = osmTags["website"] ?? osmTags["url"] ?? osmTags["contact:website"] ?? "";
    const phone   = osmTags["phone"] ?? osmTags["contact:phone"] ?? "";
    const openingHours = osmTags["opening_hours"] ?? "";
    const fee      = osmTags["fee"] ?? "";
    const wheelchair = osmTags["wheelchair"] ?? "";
    const description = osmTags["description"] ?? "";

    const metadata: Record<string, any> = {
      source: "osm",
      osm_id: el.id,
      osm_type: el.type,
    };
    if (website)      metadata.website = website;
    if (phone)        metadata.phone = phone;
    if (openingHours) metadata.opening_hours = openingHours;
    if (fee)          metadata.fee = fee;
    if (wheelchair)   metadata.wheelchair = wheelchair;

    batch.push({
      name,
      description,
      latitude: coords.lat,
      longitude: coords.lon,
      city,
      region,
      country: countryName,
      main_categories: resolved.mapping.main_categories,
      tags: resolved.mapping.tags,
      smart_tags: resolved.mapping.smart_tags,
      metadata,
      rating_avg: null,
      rating_count: null,
    });

    const label = resolved.typeKey.split("=")[1] ?? resolved.typeKey;
    byType[label] = (byType[label] ?? 0) + 1;

    if (batch.length >= 200) {
      inserted += await insertBatch([...batch]);
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    inserted += await insertBatch([...batch]);
  }

  console.log(`  ${countryCode}: fetched=${fetched}, inserted=${inserted}`);
  return { fetched, inserted };
}

// ---------------------------------------------------------------------------
// Edge Function entry point
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: any = {};
  try { body = await req.json(); } catch { /* use defaults */ }

  const priorityOrder = [
    "DK","SE","NO","FI","DE","NL","BE","AT","CH","ES","FR","IT",
    "GB","IE","PL","CZ","US","CA","MX","AU","NZ","AE","ZA","TR","BR","CL","PE",
  ];

  let requestedCodes: string[];
  if (Array.isArray(body.countries) && body.countries.length > 0) {
    requestedCodes = body.countries
      .map((c: string) => c.toUpperCase().trim())
      .filter((c: string) => COUNTRY_NAMES[c] !== undefined);
    if (requestedCodes.length === 0) {
      return new Response(JSON.stringify({ error: "No valid country codes provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    requestedCodes = [...priorityOrder];
  }

  const maxCountries = Math.max(1, body.max_countries ?? 999);
  const targetCodes = requestedCodes.slice(0, maxCountries);
  console.log(`import-osm: processing ${targetCodes.join(", ")}`);

  // FIX: added timeout guard (55s) so function exits cleanly before Supabase kills it
  const startTime = Date.now();
  const TIMEOUT_MS = 55_000;
  function isTimedOut() { return Date.now() - startTime > TIMEOUT_MS; }

  let totalFetched = 0;
  let totalInserted = 0;
  const byType: Record<string, number> = {};
  const countriesProcessed: string[] = [];
  let timedOut = false;

  for (let i = 0; i < targetCodes.length; i++) {
    if (isTimedOut()) { timedOut = true; break; }

    const code = targetCodes[i];
    // FIX: reduced inter-country sleep from 2000ms → 500ms
    if (i > 0) await sleep(500);

    const { fetched, inserted } = await processCountry(code, byType, isTimedOut);
    totalFetched += fetched;
    totalInserted += inserted;
    countriesProcessed.push(code);
  }

  const summary = {
    countries_processed: countriesProcessed,
    total_fetched: totalFetched,
    total_inserted: totalInserted,
    by_type: byType,
    timed_out: timedOut,
  };
  console.log("import-osm complete:", JSON.stringify(summary));
  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
