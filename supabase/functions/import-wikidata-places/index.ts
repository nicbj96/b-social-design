/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />

// ---------------------------------------------------------------------------
// Replaces: import-osm (Overpass blocked) + import-opentripmap (API dead)
// Source: Wikidata SPARQL (Wikimedia - no API key, globally reachable)
// ---------------------------------------------------------------------------

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://rbengtfrthqdfbcdcugp.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

// ---------------------------------------------------------------------------
// Country → Wikidata QID
// ---------------------------------------------------------------------------
const COUNTRY_QID: Record<string, string> = {
  DK: "Q35",  SE: "Q34",  NO: "Q20",  FI: "Q33",  DE: "Q183",
  NL: "Q55",  BE: "Q31",  AT: "Q40",  CH: "Q39",  ES: "Q29",
  FR: "Q142", IT: "Q38",  GB: "Q145", IE: "Q27",  PL: "Q36",
  CZ: "Q213", US: "Q30",  CA: "Q16",  AU: "Q408", NZ: "Q664",
  AE: "Q878", ZA: "Q258", TR: "Q43",  MX: "Q96",  BR: "Q155",
  CL: "Q298", PE: "Q419",
  PT: "Q45",  GR: "Q41",  HU: "Q28",  RO: "Q218", HR: "Q224",
  SK: "Q214", SI: "Q215", LT: "Q37",  LV: "Q211", EE: "Q191",
  BG: "Q219", RS: "Q403", UA: "Q212", BY: "Q184", LU: "Q32",
  MT: "Q233", CY: "Q229", LI: "Q347", IS: "Q189", AL: "Q8",
  MK: "Q221", BA: "Q225", ME: "Q236", MD: "Q217", AM: "Q399",
  GE: "Q230", AZ: "Q227",
};

const COUNTRY_NAMES: Record<string, string> = {
  DK:"Denmark", SE:"Sweden", NO:"Norway", FI:"Finland", DE:"Germany",
  NL:"Netherlands", BE:"Belgium", AT:"Austria", CH:"Switzerland", ES:"Spain",
  FR:"France", IT:"Italy", GB:"United Kingdom", IE:"Ireland", PL:"Poland",
  CZ:"Czech Republic", US:"United States", CA:"Canada", AU:"Australia",
  NZ:"New Zealand", AE:"United Arab Emirates", ZA:"South Africa", TR:"Turkey",
  MX:"Mexico", BR:"Brazil", CL:"Chile", PE:"Peru",
  PT:"Portugal", GR:"Greece", HU:"Hungary", RO:"Romania", HR:"Croatia",
  SK:"Slovakia", SI:"Slovenia", LT:"Lithuania", LV:"Latvia", EE:"Estonia",
  BG:"Bulgaria", RS:"Serbia", UA:"Ukraine", BY:"Belarus", LU:"Luxembourg",
  MT:"Malta", CY:"Cyprus", LI:"Liechtenstein", IS:"Iceland", AL:"Albania",
  MK:"North Macedonia", BA:"Bosnia and Herzegovina", ME:"Montenegro", MD:"Moldova",
  AM:"Armenia", GE:"Georgia", AZ:"Azerbaijan",
};

// ---------------------------------------------------------------------------
// Category groups: Wikidata types → B-Social taxonomy
// ---------------------------------------------------------------------------
interface CategoryGroup {
  label: string;
  types: string[];   // Wikidata QIDs
  main_categories: string[];
  tags: string[];
  smart_tags: string[];
  limit: number;
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: "museums",
    types: ["Q33506", "Q207694", "Q686822", "Q1734150"], // museum, art museum, science museum, children's museum
    main_categories: ["kultur"],
    tags: ["museum", "udstilling", "kunst"],
    smart_tags: ["KULTUR", "MUSEUM"],
    limit: 500,
  },
  {
    label: "zoos_aquariums",
    types: ["Q43501", "Q11813", "Q1203897"], // zoo, aquarium, botanical garden
    main_categories: ["natur", "familie"],
    tags: ["zoo", "akvarium", "dyr", "natur"],
    smart_tags: ["NATUR", "ZOO", "FAMILIE"],
    limit: 200,
  },
  {
    label: "amusement_parks",
    // FIX: Q194195 (amusement park) is too broad/slow — use specific subtypes only
    types: ["Q1115575", "Q1153629", "Q2031836"], // theme park, water park, amusement ride
    main_categories: ["familie", "underholdning"],
    tags: ["forlystelsespark", "temapark", "familie"],
    smart_tags: ["FAMILIE", "FORLYSTELSESPARK", "UNDERHOLDNING"],
    limit: 150,
  },
  {
    label: "national_parks",
    types: ["Q46169", "Q179049"], // national park, wildlife sanctuary (removed slow types)
    main_categories: ["natur"],
    tags: ["nationalpark", "natur", "naturreservat"],
    smart_tags: ["NATUR", "NATIONALPARK", "RESERVAT"],
    limit: 500,
  },
  {
    label: "concert_venues_stadiums",
    types: ["Q1020696", "Q483110", "Q63395", "Q375928"], // concert hall, stadium, music venue, theatre
    main_categories: ["kultur", "underholdning"],
    tags: ["koncertsal", "stadion", "music venue", "teater"],
    smart_tags: ["KULTUR", "KONCERT", "SPORT"],
    limit: 300,
  },
  {
    label: "climbing_skate_fitness",
    types: ["Q272447", "Q1353573", "Q18674739", "Q1076486"], // climbing gym, skate park, fitness centre, sports facility
    main_categories: ["aktiv_sport"],
    tags: ["klatring", "skatepark", "fitness", "sport"],
    smart_tags: ["AKTIV_SPORT", "EXTREME", "FITNESS"],
    limit: 500,
  },
  {
    label: "campsites_parks",
    types: ["Q180673", "Q22698"], // campsite, park
    main_categories: ["natur", "overnatning"],
    tags: ["camping", "park", "natur"],
    smart_tags: ["NATUR", "CAMPING"],
    limit: 300,
  },
  {
    label: "extreme_sport_sites",
    types: ["Q1218195", "Q130003", "Q1258278", "Q4164983"], // ski resort, climbing area, surfing spot, paragliding site
    main_categories: ["aktiv_sport"],
    tags: ["surfing", "klatring", "ski", "paragliding", "extreme sport"],
    smart_tags: ["AKTIV_SPORT", "EXTREME"],
    limit: 300,
  },
  {
    label: "restaurants_food",
    types: ["Q11707", "Q812576", "Q1229518"], // restaurant, business, pub
    
    main_categories: ["mad_hangout"],
    tags: ["restaurant", "mad", "café", "bar"],
    smart_tags: ["MAD", "RESTAURANT", "CAFE"],
    limit: 500,
  },
  {
    label: "nightlife",
    types: ["Q204832", "Q622425", "Q1060829"], // nightclub, bar, karaoke bar
    main_categories: ["natteliv", "underholdning"],
    tags: ["natteliv", "bar", "klub", "dj"],
    smart_tags: ["NATTELIV", "BAR", "KLUB"],
    limit: 300,
  },
  {
    label: "beaches_lakes",
    types: ["Q40080", "Q23442", "Q166118"], // beach, island, lake
    main_categories: ["natur"],
    tags: ["strand", "sø", "vand", "natur"],
    smart_tags: ["NATUR", "STRAND", "SO"],
    limit: 300,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function dedupeKey(name: string, lat: number, lon: number) {
  return `${name.toLowerCase().trim()}|${lat.toFixed(3)}|${lon.toFixed(3)}`;
}

// ---------------------------------------------------------------------------
// Wikidata SPARQL query
// ---------------------------------------------------------------------------
async function queryWikidata(countryQid: string, group: CategoryGroup): Promise<any[]> {
  const typeValues = group.types.map(t => `wd:${t}`).join(" ");
  const sparql = `
SELECT DISTINCT ?item ?itemLabel ?lat ?lon ?desc WHERE {
  VALUES ?country { wd:${countryQid} }
  VALUES ?type { ${typeValues} }
  ?item wdt:P31 ?type; wdt:P17 ?country.
  ?item wdt:P625 ?coord.
  BIND(geof:latitude(?coord) AS ?lat)
  BIND(geof:longitude(?coord) AS ?lon)
  OPTIONAL { ?item schema:description ?desc FILTER(LANG(?desc)="en"). }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT ${group.limit}`.trim();

  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(sparql)}&format=json`;
  const resp = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "B-Social/1.0 (b-social.net; contact@b-social.net)",
    },
    signal: AbortSignal.timeout(12_000),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Wikidata ${resp.status}: ${txt.slice(0, 200)}`);
  }

  const data = await resp.json();
  return data.results?.bindings ?? [];
}

// ---------------------------------------------------------------------------
// Supabase batch upsert
// ---------------------------------------------------------------------------
async function upsertPlaces(rows: any[]): Promise<number> {
  if (!SUPABASE_KEY || rows.length === 0) return 0;
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
    console.error("Supabase upsert error:", res.status, txt.slice(0, 300));
    return 0;
  }
  return rows.length;
}

// ---------------------------------------------------------------------------
// import_runs logging
// ---------------------------------------------------------------------------
async function startRun(functionName: string): Promise<string | null> {
  if (!SUPABASE_KEY) return null;
  const runId = crypto.randomUUID();
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/import_runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ id: runId, function_name: functionName, started_at: new Date().toISOString(), status: "running" }),
    });
  } catch { /* non-fatal */ }
  return runId;
}

async function completeRun(runId: string | null, summary: any): Promise<void> {
  if (!SUPABASE_KEY || !runId) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/import_runs?id=eq.${runId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        completed_at: new Date().toISOString(),
        status: summary.timed_out ? "timed_out" : "completed",
        fetched_count: summary.total_fetched,
        inserted_count: summary.total_inserted,
        skipped_count: (summary.total_skipped_duplicate ?? 0) + (summary.total_skipped_no_name ?? 0),
        error_count: summary.errors?.length ?? 0,
        errors: summary.errors?.length > 0 ? summary.errors : null,
        metadata: { by_group: summary.by_group, countries_processed: summary.countries_processed },
      }),
    });
  } catch { /* non-fatal */ }
}

// ---------------------------------------------------------------------------
// Edge Function
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  let body: any = {};
  try { body = await req.json(); } catch { /* defaults */ }

  const runId = await startRun("import-wikidata-places");

  const allCodes = Object.keys(COUNTRY_QID);
  let targetCountries: string[] = body.countries?.filter((c: string) => allCodes.includes(c)) ?? [];
  if (targetCountries.length === 0) targetCountries = [...allCodes];

  const targetGroups: string[] = body.groups ?? CATEGORY_GROUPS.map(g => g.label);
  const groups = CATEGORY_GROUPS.filter(g => targetGroups.includes(g.label));

  // 55s timeout guard
  const startTime = Date.now();
  function isTimedOut() { return Date.now() - startTime > 55_000; }

  const seen = new Set<string>();
  const summary = {
    countries_processed: [] as string[],
    total_fetched: 0,
    total_inserted: 0,
    total_skipped_duplicate: 0,
    total_skipped_no_name: 0,
    by_group: {} as Record<string, number>,
    timed_out: false,
    errors: [] as string[],
  };

  const BATCH = 100;
  const buffer: any[] = [];

  async function flush() {
    if (buffer.length === 0) return;
    const inserted = await upsertPlaces([...buffer]);
    summary.total_inserted += inserted;
    buffer.length = 0;
  }

  outer:
  for (const countryCode of targetCountries) {
    if (isTimedOut()) { summary.timed_out = true; break; }
    const qid = COUNTRY_QID[countryCode];
    const countryName = COUNTRY_NAMES[countryCode] ?? countryCode;

    for (const group of groups) {
      if (isTimedOut()) { summary.timed_out = true; break outer; }

      // Wikidata rate limit: be polite
      await sleep(300);

      let bindings: any[];
      try {
        bindings = await queryWikidata(qid, group);
      } catch (err: any) {
        console.error(`Wikidata error ${countryCode}/${group.label}:`, err.message);
        summary.errors.push(`${countryCode}/${group.label}: ${err.message}`);
        continue;
      }

      console.log(`${countryCode}/${group.label}: ${bindings.length} results`);
      summary.by_group[group.label] = (summary.by_group[group.label] ?? 0) + bindings.length;

      for (const b of bindings) {
        if (isTimedOut()) { summary.timed_out = true; break outer; }

        const name = b.itemLabel?.value;
        const lat  = parseFloat(b.lat?.value ?? "0");
        const lon  = parseFloat(b.lon?.value ?? "0");

        if (!name || name.startsWith("Q") || lat === 0 || lon === 0) {
          summary.total_skipped_no_name++;
          continue;
        }

        const key = dedupeKey(name, lat, lon);
        if (seen.has(key)) { summary.total_skipped_duplicate++; continue; }
        seen.add(key);
        summary.total_fetched++;

        const description = b.desc?.value ?? "";
        const wikidata_id = b.item?.value?.replace("http://www.wikidata.org/entity/", "") ?? "";

        buffer.push({
          name: name.trim(),
          description: description.slice(0, 2000),
          latitude: lat,
          longitude: lon,
          city: "",
          region: "",
          country: countryName,
          main_categories: group.main_categories,
          tags: group.tags,
          smart_tags: group.smart_tags,
          metadata: {
            source: "wikidata",
            wikidata_id,
            category_group: group.label,
          },
          rating_avg: null,
          rating_count: null,
        });

        if (buffer.length >= BATCH) await flush();
      }
    }

    summary.countries_processed.push(countryCode);
  }

  await flush();

  await completeRun(runId, summary);

  console.log("import-wikidata-places complete:", JSON.stringify(summary));
  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
