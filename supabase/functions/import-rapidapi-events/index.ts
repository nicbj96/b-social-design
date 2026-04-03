import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAPIDAPI_HOST = "real-time-events-search.p.rapidapi.com";

const EVENT_QUERIES = [
  "concerts", "live music", "music festival", "jazz concert", "rock concert", "electronic music", "opera", "symphony", "rock koncert", "pop koncert", "koncert",
  "football match", "soccer game", "basketball game", "tennis tournament", "cycling race", "marathon", "triathlon", "boxing match", "MMA fight",
  "extreme sport", "surfing", "rock climbing", "skateboarding", "bmx competition", "skydiving", "bungee jumping", "paragliding", "motocross", "scuba diving",
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
  IT: ["Rome", "Milan", "Florence"], GB: ["London", "Manchester", "Edinburgh"], IE: ["Dublin", "Cork"],
  US: ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami"], CA: ["Toronto", "Vancouver"],
  AU: ["Sydney", "Melbourne"], NZ: ["Auckland"], AE: ["Dubai"], ZA: ["Cape Town"], TR: ["Istanbul"]
};

const COUNTRY_NAMES: Record<string, string> = {
  DK: "Denmark", SE: "Sweden", NO: "Norway", FI: "Finland", DE: "Germany", NL: "Netherlands",
  BE: "Belgium", AT: "Austria", CH: "Switzerland", ES: "Spain", FR: "France", IT: "Italy",
  GB: "United Kingdom", IE: "Ireland", US: "United States", CA: "Canada", AU: "Australia",
  NZ: "New Zealand", AE: "United Arab Emirates", ZA: "South Africa", TR: "Turkey"
};

function categorizeEvent(query: string, event: any) {
  const combined = `${query} ${event.name} ${event.description}`.toLowerCase();
  if (/concert|music|festival|koncert/i.test(combined)) return { category: "Musik & Koncerter", tags: ["musik", "koncert"], indoor_outdoor: "indoor" };
  if (/sport|match|game|tournament|race|marathon/i.test(combined)) return { category: "Sport", tags: ["sport"], indoor_outdoor: "outdoor" };
  if (/extreme|surfing|climbing|skate|bmx|skydiv|bungee|paraglid|motocross/i.test(combined)) return { category: "Extreme Sport", tags: ["extreme", "action"], indoor_outdoor: "outdoor" };
  if (/mountain bike|mtb|trail run|hiking|rute|trail/i.test(combined)) return { category: "Natur & Ruter", tags: ["natur", "rute"], indoor_outdoor: "outdoor" };
  if (/fitness|gym|yoga|crossfit|workout/i.test(combined)) return { category: "Sundhed & Wellness", tags: ["fitness", "wellness"], indoor_outdoor: "indoor" };
  return { category: "Events", tags: ["event"], indoor_outdoor: "indoor" };
}

async function fetchRapidAPI(apiKey: string, query: string, date: string) {
  const url = `https://real-time-events-search.p.rapidapi.com/search-events?query=\${encodeURIComponent(query)}&date=\${date}`;
  const resp = await fetch(url, { headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": RAPIDAPI_HOST } });
  const data = await resp.json();
  return data.data || [];
}

Deno.serve(async (req) => {
  const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

  const results = [];
  const plan = [];
  for (const [cc, cities] of Object.entries(COUNTRY_CITIES)) {
    for (const city of cities) {
      plan.push({ query: `\${EVENT_QUERIES[Math.floor(Math.random()*EVENT_QUERIES.length)]} in \${city}`, country: cc });
    }
  }

  for (const item of plan.slice(0, 50)) { // Limit to 50 calls per run to avoid timeouts
    try {
      const events = await fetchRapidAPI(RAPIDAPI_KEY!, item.query, "month");
      const toInsert = events.map((e: any) => {
        const { category, tags, indoor_outdoor } = categorizeEvent(item.query, e);
        return {
          title: e.name, description: e.description, location: e.venue?.full_address || e.venue?.city || item.query,
          image_url: e.thumbnail, date: e.start_time, category, interest_tags: tags,
          indoor_outdoor, country: item.country, source: "rapidapi", status: "active"
        };
      });
      if (toInsert.length > 0) await supabase.from("events").upsert(toInsert, { onConflict: "title,date,location", ignoreDuplicates: true });
      results.push({ query: item.query, count: events.length });
      await new Promise(r => setTimeout(r, 250));
    } catch (err) { console.error(err); }
  }
  return new Response(JSON.stringify({ success: true, results }));
});
