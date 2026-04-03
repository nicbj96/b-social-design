/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://rbengtfrthqdfbcdcugp.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);

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

const COUNTRY_NAMES: Record<string, string> = {
  DK: "Denmark", SE: "Sweden", NO: "Norway", FI: "Finland", DE: "Germany",
  NL: "Netherlands", BE: "Belgium", AT: "Austria", CH: "Switzerland", ES: "Spain",
  FR: "France", IT: "Italy", GB: "United Kingdom", IE: "Ireland", PL: "Poland",
  CZ: "Czech Republic", US: "United States", CA: "Canada", MX: "Mexico",
  BR: "Brazil", CL: "Chile", PE: "Peru", AU: "Australia", NZ: "New Zealand",
  AE: "United Arab Emirates", ZA: "South Africa", TR: "Turkey",
};

const CATEGORY_MAP: Record<string, CategoryMapping> = {
  "tourism=zoo": { main_categories: ["natur", "familie"], tags: ["zoo", "dyrepark"], smart_tags: ["NATUR", "ZOO"] },
  "tourism=museum": { main_categories: ["kultur"], tags: ["museum", "udstilling"], smart_tags: ["KULTUR", "MUSEUM"] },
  "leisure=fitness_station": { main_categories: ["aktiv_sport"], tags: ["udendørs træning", "fitness"], smart_tags: ["AKTIV_SPORT", "FITNESS"] },
  "sport=climbing": { main_categories: ["aktiv_sport"], tags: ["klatring", "climbing"], smart_tags: ["AKTIV_SPORT", "EXTREME"] },
  "sport=surfing": { main_categories: ["aktiv_sport"], tags: ["surfing", "vand"], smart_tags: ["AKTIV_SPORT", "SURFING"] },
  "sport=skateboard": { main_categories: ["aktiv_sport"], tags: ["skateboard", "skate"], smart_tags: ["AKTIV_SPORT", "SKATE"] },
  "sport=paragliding": { main_categories: ["aktiv_sport"], tags: ["paragliding", "extreme"], smart_tags: ["AKTIV_SPORT", "EXTREME"] },
  "sport=calisthenics": { main_categories: ["aktiv_sport"], tags: ["calisthenics", "træning"], smart_tags: ["AKTIV_SPORT", "OUTDOOR_GYM"] },
  "sport=crossfit": { main_categories: ["aktiv_sport"], tags: ["crossfit", "fitness"], smart_tags: ["AKTIV_SPORT", "CROSSFIT"] },
  "route=running": { main_categories: ["aktiv_sport"], tags: ["løberute", "running"], smart_tags: ["AKTIV_SPORT", "RUNNING"] },
};

const TAG_CHECKS = [
  { key: "tourism", value: "zoo" }, { key: "tourism", value: "museum" },
  { key: "leisure", value: "fitness_station" }, { key: "sport", value: "climbing" },
  { key: "sport", value: "surfing" }, { key: "sport", value: "skateboard" },
  { key: "sport", value: "paragliding" }, { key: "sport", value: "calisthenics" },
  { key: "sport", value: "crossfit" }, { key: "route", value: "running" }
];

function buildOverpassQuery(countryCode: string): string {
  return `[out:json][timeout:90];area["ISO3166-1"="${countryCode}"]->.a;(
    nwr["tourism"~"zoo|museum"](area.a);
    nwr["leisure"="fitness_station"](area.a);
    nwr["sport"~"climbing|surfing|skateboard|paragliding|calisthenics|crossfit"](area.a);
    relation["route"="running"](area.a);
  );out center 5000;`;
}

const OVERPASS_ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

async function fetchOverpass(query: string, attempt = 0): Promise<OverpassResponse> {
  const endpoint = OVERPASS_ENDPOINTS[attempt % OVERPASS_ENDPOINTS.length];
  const resp = await fetch(endpoint, { method: "POST", body: `data=${encodeURIComponent(query)}` });
  if (!resp.ok && attempt < 2) return fetchOverpass(query, attempt + 1);
  return resp.json();
}

async function isDuplicate(name: string, lat: number, lon: number): Promise<boolean> {
  const { data } = await supabase.from("places").select("id").eq("name", name).maybeSingle();
  return !!data;
}

Deno.serve(async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const codes = body.countries || ["DK"];
  for (const code of codes) {
    const { elements } = await fetchOverpass(buildOverpassQuery(code));
    for (const el of elements) {
      const name = el.tags?.name;
      if (!name) continue;
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;
      if (lat && lon && !await isDuplicate(name, lat, lon)) {
        await supabase.from("places").insert([{ name, latitude: lat, longitude: lon, country: COUNTRY_NAMES[code] || code }]);
      }
    }
  }
  return new Response(JSON.stringify({ success: true }));
});
