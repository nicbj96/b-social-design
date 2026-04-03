/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />
import { createClient } from "jsr:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") || "https://rbengtfrthqdfbcdcugp.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface OsmElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OsmElement[];
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
  smart_tags: string[];
  metadata: Record<string, unknown>;
  rating_avg: null;
  rating_count: null;
}

interface CategoryMapping {
  main_categories: string[];
  tags: string[];
  smart_tags: string[];
}

// ---------------------------------------------------------------------------
// Country code → full name
// ---------------------------------------------------------------------------
const COUNTRY_NAMES: Record<string, string> = {
  DK: "Denmark",
  SE: "Sweden",
  NO: "Norway",
  FI: "Finland",
  DE: "Germany",
  NL: "Netherlands",
  BE: "Belgium",
  AT: "Austria",
  CH: "Switzerland",
  ES: "Spain",
  FR: "France",
  IT: "Italy",
  GB: "United Kingdom",
  IE: "Ireland",
  PL: "Poland",
  CZ: "Czech Republic",
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  BR: "Brazil",
  CL: "Chile",
  PE: "Peru",
  AU: "Australia",
  NZ: "New Zealand",
  AE: "United Arab Emirates",
  ZA: "South Africa",
  TR: "Turkey",
};

// ---------------------------------------------------------------------------
// Category mappings keyed by "tag_key=tag_value"
// ---------------------------------------------------------------------------
const CATEGORY_MAP: Record<string, CategoryMapping> = {
  "tourism=zoo": {
    main_categories: ["natur", "familie"],
    tags: ["zoo", "dyrepark", "dyr"],
    smart_tags: ["NATUR", "ZOO", "FAMILIE"],
  },
  "tourism=museum": {
    main_categories: ["kultur"],
    tags: ["museum", "udstilling"],
    smart_tags: ["KULTUR", "MUSEUM"],
  },
  "tourism=camp_site": {
    main_categories: ["natur", "overnatning"],
    tags: ["camping", "campingplads"],
    smart_tags: ["NATUR", "CAMPING"],
  },
  "tourism=theme_park": {
    main_categories: ["familie", "underholdning"],
    tags: ["forlystelsespark", "temapark"],
    smart_tags: ["FAMILIE", "FORLYSTELSESPARK"],
  },
  "tourism=aquarium": {
    main_categories: ["natur", "familie"],
    tags: ["akvarium", "hav"],
    smart_tags: ["NATUR", "AKVARIUM"],
  },
  "tourism=alpine_hut": {
    main_categories: ["natur", "overnatning"],
    tags: ["bjerghytte", "vandring"],
    smart_tags: ["NATUR", "HYTTE", "VANDRING"],
  },
  "tourism=wilderness_hut": {
    main_categories: ["natur", "overnatning"],
    tags: ["shelter", "hytte"],
    smart_tags: ["NATUR", "SHELTER"],
  },
  "amenity=shelter": {
    main_categories: ["natur", "overnatning"],
    tags: ["shelter", "friluftsliv"],
    smart_tags: ["NATUR", "SHELTER", "FRILUFTSLIV"],
  },
  "leisure=nature_reserve": {
    main_categories: ["natur"],
    tags: ["naturreservat", "natur"],
    smart_tags: ["NATUR", "RESERVAT"],
  },
  "leisure=fitness_station": {
    main_categories: ["aktiv_sport"],
    tags: ["udendørs træning", "fitness"],
    smart_tags: ["AKTIV_SPORT", "FITNESS"],
  },
  "leisure=outdoor_gym": {
    main_categories: ["aktiv_sport"],
    tags: ["udendørs træning", "fitness"],
    smart_tags: ["AKTIV_SPORT", "FITNESS", "OUTDOOR"],
  },
  "leisure=skate_park": {
    main_categories: ["aktiv_sport"],
    tags: ["skatepark", "skateboard", "extreme sport"],
    smart_tags: ["AKTIV_SPORT", "SKATE", "EXTREME"],
  },
  "leisure=parkour_course": {
    main_categories: ["aktiv_sport"],
    tags: ["parkour", "extreme sport"],
    smart_tags: ["AKTIV_SPORT", "PARKOUR", "EXTREME"],
  },
  "leisure=climbing_wall": {
    main_categories: ["aktiv_sport"],
    tags: ["klatrevæg", "climbing"],
    smart_tags: ["AKTIV_SPORT", "CLIMBING"],
  },
  "amenity=theatre": {
    main_categories: ["kultur"],
    tags: ["teater", "concert venue"],
    smart_tags: ["KULTUR", "TEATER", "KONCERT"],
  },
  "amenity=arts_centre": {
    main_categories: ["kultur"],
    tags: ["kulturcenter", "arts center"],
    smart_tags: ["KULTUR", "KONCERT"],
  },
  "leisure=concert_hall": {
    main_categories: ["kultur"],
    tags: ["koncertsal", "concert hall"],
    smart_tags: ["KULTUR", "KONCERT"],
  },
  "leisure=stadium": {
    main_categories: ["sport", "kultur"],
    tags: ["stadion", "stadium"],
    smart_tags: ["SPORT", "KONCERT"],
  },
  "boundary=national_park": {
    main_categories: ["natur"],
    tags: ["nationalpark", "natur"],
    smart_tags: ["NATUR", "NATIONALPARK"],
  },
};

const TAG_CHECKS: Array<{ key: string; value: string }> = [
  { key: "tourism", value: "zoo" },
  { key: "tourism", value: "museum" },
  { key: "tourism", value: "camp_site" },
  { key: "tourism", value: "theme_park" },
  { key: "tourism", value: "aquarium" },
  { key: "tourism", value: "alpine_hut" },
  { key: "tourism", value: "wilderness_hut" },
  { key: "amenity", value: "shelter" },
  { key: "leisure", value: "nature_reserve" },
  { key: "leisure", value: "fitness_station" },
  { key: "leisure", value: "outdoor_gym" },
  { key: "leisure", value: "skate_park" },
  { key: "leisure", value: "parkour_course" },
  { key: "leisure", value: "climbing_wall" },
  { key: "amenity", value: "theatre" },
  { key: "amenity", value: "arts_centre" },
  { key: "leisure", value: "concert_hall" },
  { key: "leisure", value: "stadium" },
  { key: "boundary", value: "national_park" },
];

function buildOverpassQuery(countryCode: string): string {
  return `[out:json][timeout:90];
area["ISO3166-1"="\${countryCode}"]->.a;
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
  nwr["leisure"="outdoor_gym"](area.a);
  nwr["leisure"="skate_park"](area.a);
  nwr["leisure"="parkour_course"](area.a);
  nwr["leisure"="climbing_wall"](area.a);
  nwr["amenity"="theatre"](area.a);
  nwr["amenity"="arts_centre"](area.a);
  nwr["leisure"="concert_hall"](area.a);
  nwr["leisure"="stadium"](area.a);
  nwr["boundary"="national_park"](area.a);
);
out center 5000;`;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function fetchOverpass(
  query: string,
  attempt = 0
): Promise<OverpassResponse> {
  const endpoint = OVERPASS_ENDPOINTS[attempt % OVERPASS_ENDPOINTS.length];
  const body = new URLSearchParams({ data: query });
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!resp.ok) {
    const text = await resp.text();
    if (attempt < 2) {
      await sleep(3000);
      return fetchOverpass(query, attempt + 1);
    }
    throw new Error(
      \`Overpass HTTP \${resp.status} from \${endpoint}: \${text.slice(0, 200)}\`
    );
  }
  return resp.json() as Promise<OverpassResponse>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCoords(
  el: OsmElement
): { lat: number; lon: number } | null {
  if (el.type === "node" && el.lat != null && el.lon != null) {
    return { lat: el.lat, lon: el.lon };
  }
  if (el.center?.lat != null && el.center?.lon != null) {
    return { lat: el.center.lat, lon: el.center.lon };
  }
  return null;
}

function resolveCategory(
  osmTags: Record<string, string>
): { mapping: CategoryMapping; typeKey: string } | null {
  for (const { key, value } of TAG_CHECKS) {
    if (osmTags[key] === value) {
      const typeKey = \`\${key}=\${value}\`;
      return { mapping: CATEGORY_MAP[typeKey], typeKey };
    }
  }
  return null;
}

function shortTypeLabel(typeKey: string): string {
  return typeKey.split("=")[1] ?? typeKey;
}

async function isDuplicate(
  name: string,
  lat: number,
  lon: number
): Promise<boolean> {
  const delta = 0.001;
  const { data, error } = await supabase
    .from("places")
    .select("id")
    .eq("name", name)
    .gte("latitude", lat - delta)
    .lte("latitude", lat + delta)
    .gte("longitude", lon - delta)
    .lte("longitude", lon + delta)
    .limit(1);
  if (error) {
    console.error("Dedup check error:", error.message);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

async function insertBatch(rows: PlaceRow[]): Promise<number> {
  if (rows.length === 0) return 0;
  const { error, count } = await supabase
    .from("places")
    .insert(rows, { count: "exact" });
  if (error) {
    console.error("Insert batch error:", error.message);
    return 0;
  }
  return count ?? rows.length;
}

async function processCountry(
  countryCode: string,
  byType: Record<string, number>
): Promise<{ fetched: number; inserted: number }> {
  const countryName = COUNTRY_NAMES[countryCode] ?? countryCode;
  console.log(\`Processing \${countryCode} (\${countryName})…\`);
  const query = buildOverpassQuery(countryCode);
  let response: OverpassResponse;
  try {
    response = await fetchOverpass(query);
  } catch (err) {
    console.error(\`Overpass fetch failed for \${countryCode}:\`, err);
    return { fetched: 0, inserted: 0 };
  }
  const elements = response.elements ?? [];
  console.log(\` \${countryCode}: \${elements.length} elements returned\`);
  let fetched = 0;
  let inserted = 0;
  const batch: PlaceRow[] = [];
  for (const el of elements) {
    const osmTags = el.tags ?? {};
    const name = osmTags["name"]?.trim();
    if (!name) continue;
    const coords = getCoords(el);
    if (!coords) continue;
    const resolved = resolveCategory(osmTags);
    if (!resolved) continue;
    fetched++;
    const dup = await isDuplicate(name, coords.lat, coords.lon);
    if (dup) continue;
    const city = osmTags["addr:city"] ?? "";
    const region = osmTags["addr:state"] ?? osmTags["addr:county"] ?? "";
    const website = osmTags["website"] ?? osmTags["url"] ?? osmTags["contact:website"] ?? "";
    const phone = osmTags["phone"] ?? osmTags["contact:phone"] ?? "";
    const metadata: Record<string, unknown> = {
      source: "osm",
      osm_id: el.id,
      osm_type: el.type,
    };
    if (website) metadata.website = website;
    if (phone) metadata.phone = phone;
    const row: PlaceRow = {
      name, description: osmTags["description"] ?? "",
      latitude: coords.lat, longitude: coords.lon,
      city, region, country: countryName,
      main_categories: resolved.mapping.main_categories,
      tags: resolved.mapping.tags, smart_tags: resolved.mapping.smart_tags,
      metadata, rating_avg: null, rating_count: null,
    };
    batch.push(row);
    const label = shortTypeLabel(resolved.typeKey);
    byType[label] = (byType[label] ?? 0) + 1;
    if (batch.length >= 200) {
      inserted += await insertBatch([...batch]);
      batch.length = 0;
    }
  }
  if (batch.length > 0) inserted += await insertBatch([...batch]);
  return { fetched, inserted };
}

Deno.serve(async (req: Request): Promise<Response> => {
  const body = await req.json().catch(() => ({}));
  const maxCountries = Math.max(1, body.max_countries ?? 3);
  const priorityOrder = [
    "DK","SE","NO","FI","DE","NL","BE","AT","CH","ES","FR","IT","GB","IE",
    "PL","CZ","US","CA","MX","AU","NZ","AE","ZA","TR","BR","CL","PE",
  ];
  let requestedCodes: string[];
  if (Array.isArray(body.countries) && body.countries.length > 0) {
    requestedCodes = body.countries
      .map((c) => c.toUpperCase().trim())
      .filter((c) => COUNTRY_NAMES[c] !== undefined);
  } else {
    requestedCodes = [...priorityOrder];
  }
  const targetCodes = requestedCodes.slice(0, maxCountries);
  let totalFetched = 0;
  let totalInserted = 0;
  const byType: Record<string, number> = {};
  for (let i = 0; i < targetCodes.length; i++) {
    if (i > 0) await sleep(2000);
    const { fetched, inserted } = await processCountry(targetCodes[i], byType);
    totalFetched += fetched;
    totalInserted += inserted;
  }
  return new Response(JSON.stringify({ total_fetched: totalFetched, total_inserted: totalInserted, by_type: byType }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
});
