/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://rbengtfrthqdfbcdcugp.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);

const COUNTRY_NAMES: Record<string, string> = {
  DK: "Denmark", SE: "Sweden", NO: "Norway", FI: "Finland", DE: "Germany",
  AT: "Austria", CH: "Switzerland", FR: "France", ES: "Spain", IT: "Italy",
  GB: "United Kingdom", US: "United States", AU: "Australia", NL: "Netherlands",
  BE: "Belgium", PL: "Poland"
};

async function fetchOverpass(query: string) {
  const resp = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
  });
  return resp.json();
}

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const countries = body.countries || ["DK", "SE", "NO", "FI", "DE"];
  const results = [];

  for (const cc of countries) {
    const queries = [
      { q: `relation["route"="hiking"]["name"]`, cat: ["natur", "aktiv_sport"], tags: ["vandring", "hiking"] },
      { q: `relation["route"="mtb"]["name"]`, cat: ["aktiv_sport"], tags: ["mtb", "mountainbike"] },
      { q: `relation["route"="running"]["name"]`, cat: ["aktiv_sport"], tags: ["running", "løberute"] },
      { q: `relation["route"="fitness_trail"]["name"]`, cat: ["aktiv_sport"], tags: ["fitness", "træning"] },
      { q: `relation["route"="bicycle"]["name"]`, cat: ["aktiv_sport"], tags: ["cycling", "cykelrute"] },
      { q: `relation["route"="horse"]["name"]`, cat: ["aktiv_sport"], tags: ["ridning", "horse riding"] },
      { q: `relation["route"="piste"]["name"]`, cat: ["aktiv_sport"], tags: ["ski", "winter sports"] },
      { q: `relation["route"="paddling"]["name"]`, cat: ["aktiv_sport", "natur"], tags: ["kajak", "paddling"] },
      { q: `relation["route"="via_ferrata"]["name"]`, cat: ["aktiv_sport", "extreme_sport"], tags: ["climbing", "via ferrata"] }
    ];

    for (const item of queries) {
      try {
        const query = `[out:json][timeout:60];area["ISO3166-1"="\${cc}"]->.a;\${item.q}(area.a);out center 200;`;
        const data = await fetchOverpass(query);
        const elements = data.elements || [];
        const toInsert = elements.map((el: any) => ({
          name: el.tags.name,
          latitude: el.center.lat,
          longitude: el.center.lon,
          country: COUNTRY_NAMES[cc] || cc,
          main_categories: item.cat,
          tags: item.tags,
          smart_tags: [...item.tags, "NATUR", "RUTE"],
          description: `\${item.tags[0]} rute: \${el.tags.name} i \${COUNTRY_NAMES[cc] || cc}`,
          metadata: { osm_id: el.id, distance: el.tags.distance, source: "osm_routes" }
        }));

        if (toInsert.length > 0) {
          await supabase.from("places").upsert(toInsert, { onConflict: "name,latitude,longitude", ignoreDuplicates: true });
        }
        results.push({ cc, type: item.tags[0], count: elements.length });
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        console.error(err);
      }
    }
  }
  return new Response(JSON.stringify({ success: true, results }), { headers: { "Access-Control-Allow-Origin": "*" } });
});
