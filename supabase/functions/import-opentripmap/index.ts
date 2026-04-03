/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://rbengtfrthqdfbcdcugp.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OTM_API_KEY = Deno.env.get("OPENTRIPMAP_API_KEY") || "5ae2e3f221c38a28845f05b6";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);

const KIND_MAP: Record<string, any> = {
  museums: { cat: ["kultur"], tags: ["museum"], smart: ["KULTUR", "MUSEUM"] },
  theatres_and_entertainments: { cat: ["kultur"], tags: ["teater"], smart: ["KULTUR", "TEATER"] },
  amusements: { cat: ["familie"], tags: ["forlystelse"], smart: ["FAMILIE"] },
  sport: { cat: ["aktiv_sport"], tags: ["sport"], smart: ["SPORT"] },
  climbing: { cat: ["aktiv_sport"], tags: ["klatring"], smart: ["EXTREME", "CLIMBING"] },
  surfing: { cat: ["aktiv_sport"], tags: ["surfing"], smart: ["EXTREME", "SURFING"] },
  skateboarding: { cat: ["aktiv_sport"], tags: ["skateboard"], smart: ["EXTREME", "SKATE"] },
  natural: { cat: ["natur"], tags: ["natur"], smart: ["NATUR"] },
  foods: { cat: ["mad_hangout"], tags: ["restaurant"], smart: ["MAD"] }
};

const COUNTRY_CITIES: Record<string, any[]> = {
  DK: [{ city: "Copenhagen", lat: 55.676, lon: 12.568 }, { city: "Aarhus", lat: 56.164, lon: 10.204 }],
  SE: [{ city: "Stockholm", lat: 59.329, lon: 18.069 }], NO: [{ city: "Oslo", lat: 59.913, lon: 10.752 }]
};

async function fetchOTM(endpoint: string, params: Record<string, string>) {
  const url = new URL(`https://api.opentripmap.org/0.1/en/places/\${endpoint}`);
  params.apikey = OTM_API_KEY;
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url.toString());
  return resp.json();
}

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const countries = body.countries || ["DK"];
  const results = [];

  for (const cc of countries) {
    const cities = COUNTRY_CITIES[cc] || [];
    for (const city of cities) {
      for (const [kind, mapping] of Object.entries(KIND_MAP)) {
        try {
          const items = await fetchOTM("radius", { radius: "50000", lat: String(city.lat), lon: String(city.lon), kinds: kind, limit: "50" });
          const toInsert = items.map((item: any) => ({
            name: item.name, latitude: item.point.lat, longitude: item.point.lon,
            country: cc, main_categories: mapping.cat, tags: mapping.tags, smart_tags: mapping.smart,
            description: \`\${mapping.tags[0]} i \${cc}\`, metadata: { otm_id: item.xid, rate: item.rate }
          })).filter((i: any) => i.name);
          if (toInsert.length > 0) await supabase.from("places").upsert(toInsert, { onConflict: "name,latitude,longitude", ignoreDuplicates: true });
          results.push({ city: city.city, kind, count: items.length });
          await new Promise(r => setTimeout(r, 500));
        } catch (err) { console.error(err); }
      }
    }
  }
  return new Response(JSON.stringify({ success: true, results }), { headers: { "Access-Control-Allow-Origin": "*" } });
});
