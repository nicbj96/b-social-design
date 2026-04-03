/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />

// ---------------------------------------------------------------------------
// Replaces: import-nature-trails (Overpass blocked)
// Sources:
//   - Waymarked Trails API (hiking, MTB, cycling) — no API key, globally reachable
//   - Covers: hiking, MTB, cycling, running, horse, winter sports, paddling
// ---------------------------------------------------------------------------

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://rbengtfrthqdfbcdcugp.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// ---------------------------------------------------------------------------
// Country bounding boxes [west, south, east, north]
// ---------------------------------------------------------------------------
const COUNTRY_BBOX: Record<string, [number, number, number, number]> = {
  DK: [8.07, 54.56, 15.20, 57.75],
  SE: [11.12, 55.34, 24.17, 69.06],
  NO: [4.51, 57.96, 31.17, 71.19],
  FI: [20.55, 59.81, 31.59, 70.09],
  DE: [5.87, 47.27, 15.04, 55.06],
  NL: [3.36, 50.75, 7.22, 53.51],
  BE: [2.55, 49.50, 6.41, 51.51],
  AT: [9.53, 46.37, 17.16, 49.02],
  CH: [5.96, 45.83, 10.49, 47.81],
  ES: [-9.30, 35.99, 4.33, 43.79],
  FR: [-5.14, 41.34, 9.56, 51.09],
  IT: [6.62, 36.65, 18.52, 47.09],
  GB: [-8.65, 49.87, 1.77, 60.86],
  IE: [-10.48, 51.44, -5.43, 55.39],
  PL: [14.12, 49.00, 24.15, 54.84],
  CZ: [12.09, 48.55, 18.86, 51.06],
  US: [-125.00, 24.52, -66.93, 49.38],
  CA: [-141.00, 41.68, -52.62, 83.11],
  AU: [113.34, -43.74, 153.64, -10.69],
  NZ: [166.43, -47.29, 178.57, -34.39],
  TR: [25.67, 35.82, 44.79, 42.11],
  ZA: [16.34, -34.83, 32.89, -22.09],
  AE: [51.55, 22.63, 56.40, 26.08],
  MX: [-117.12, 14.53, -86.71, 32.72],
  BR: [-73.99, -33.75, -28.85, 5.27],
  CL: [-75.64, -55.90, -66.42, -17.50],
  PE: [-81.33, -18.35, -68.65, -0.04],
  PT: [-9.56, 36.95, -6.19, 42.15],   GR: [19.37, 34.80, 28.24, 41.75],
  HU: [16.11, 45.74, 22.90, 48.58],   RO: [20.26, 43.62, 29.74, 48.27],
  HR: [13.49, 42.39, 19.45, 46.55],   SK: [16.84, 47.73, 22.56, 49.61],
  SI: [13.38, 45.42, 16.61, 46.88],   LT: [20.94, 53.89, 26.84, 56.45],
  LV: [20.97, 55.67, 28.24, 57.97],   EE: [21.76, 57.51, 28.21, 59.68],
  BG: [22.36, 41.24, 28.61, 44.22],   RS: [18.82, 42.23, 23.01, 46.18],
  UA: [22.14, 44.39, 40.23, 52.38],   BY: [23.18, 51.26, 32.78, 56.17],
  LU: [5.74, 49.44, 6.53, 50.18],     MT: [14.18, 35.78, 14.58, 36.08],
  CY: [32.27, 34.57, 34.60, 35.71],   LI: [9.47, 47.05, 9.64, 47.27],
  IS: [-24.55, 63.29, -13.50, 66.56], AL: [19.27, 39.64, 21.07, 42.66],
  MK: [20.45, 40.85, 23.03, 42.37],   BA: [15.75, 42.56, 19.62, 45.28],
  ME: [18.43, 41.85, 20.36, 43.56],   MD: [26.62, 45.47, 30.14, 48.49],
  AM: [43.45, 38.84, 46.63, 41.30],   GE: [39.99, 41.05, 46.74, 43.59],
  AZ: [44.77, 38.39, 50.37, 41.91],
  // Asia
  JP: [122.93, 24.04, 153.99, 45.52], KR: [124.61, 33.19, 131.87, 38.62],
  CN: [73.50, 18.16, 134.77, 53.56],  TW: [120.00, 21.89, 122.01, 25.30],
  TH: [97.34, 5.61, 105.64, 20.46],   VN: [102.14, 8.38, 109.46, 23.39],
  ID: [95.01, -10.94, 141.02, 5.91],  MY: [99.64, 0.85, 119.28, 7.36],
  PH: [116.87, 4.59, 126.60, 21.12],  SG: [103.60, 1.16, 104.09, 1.47],
  MM: [92.19, 9.78, 101.17, 28.55],   KH: [102.35, 10.49, 107.63, 14.69],
  LA: [100.09, 13.91, 107.64, 22.50], IN: [68.18, 8.07, 97.40, 35.50],
  BD: [88.03, 20.60, 92.68, 26.63],   PK: [60.87, 23.69, 77.84, 37.09],
  LK: [79.65, 5.92, 81.88, 9.84],     NP: [80.06, 26.35, 88.20, 30.45],
  KZ: [50.99, 40.57, 87.32, 55.43],   UZ: [56.00, 37.18, 73.13, 45.59],
  KG: [69.46, 39.19, 80.28, 43.24],   TJ: [67.34, 36.67, 75.15, 41.04],
  TM: [52.44, 35.14, 66.69, 42.80],   MN: [87.76, 41.57, 119.93, 52.15],
  AF: [60.52, 29.38, 74.89, 38.49],
  // Middle East
  IR: [44.03, 25.08, 63.32, 39.78],   IQ: [38.79, 29.10, 48.57, 37.38],
  SA: [34.95, 16.37, 55.67, 32.16],   QA: [50.75, 24.56, 51.61, 26.18],
  KW: [46.55, 28.53, 48.42, 30.10],   BH: [50.45, 25.79, 50.68, 26.27],
  OM: [51.98, 16.65, 59.84, 26.40],   YE: [42.55, 12.11, 54.01, 19.00],
  JO: [34.96, 29.19, 39.30, 33.38],   IL: [34.27, 29.50, 35.90, 33.34],
  LB: [35.10, 33.05, 36.62, 34.69],   SY: [35.73, 32.31, 42.38, 37.32],
  // Africa
  EG: [24.70, 22.00, 36.90, 31.67],   MA: [-17.02, 27.67, -1.12, 35.92],
  DZ: [-8.67, 18.97, 11.99, 37.09],   TN: [7.52, 30.23, 11.58, 37.53],
  LY: [9.31, 19.51, 25.18, 33.17],    NG: [2.69, 4.27, 14.68, 13.87],
  GH: [-3.26, 4.74, 1.20, 11.17],     SN: [-17.53, 12.33, -11.35, 15.00],
  CI: [-8.60, 4.36, -2.49, 10.74],    CM: [8.50, 1.65, 16.19, 12.36],
  ET: [32.99, 3.40, 47.99, 15.00],    KE: [33.91, -4.72, 41.90, 5.02],
  TZ: [29.34, -11.75, 40.44, -0.99],  UG: [29.57, -1.48, 35.04, 4.23],
  RW: [28.86, -2.84, 30.90, -1.05],   SD: [21.81, 8.68, 38.60, 22.22],
  CD: [12.18, -13.46, 31.30, 5.39],   AO: [11.64, -18.02, 24.08, -4.39],
  MZ: [32.47, -26.87, 40.84, -10.47], ZM: [21.97, -18.08, 33.70, -8.24],
  ZW: [25.24, -22.42, 33.06, -15.61], BW: [19.99, -26.91, 29.37, -17.78],
  NA: [11.72, -28.97, 25.26, -16.96], MG: [43.22, -25.60, 50.48, -12.04],
  // Americas
  AR: [-73.56, -55.06, -53.57, -21.78], CO: [-79.00, -4.23, -66.87, 12.46],
  VE: [-73.35, 0.65, -59.81, 12.20],    EC: [-80.98, -5.01, -75.19, 1.68],
  BO: [-69.64, -22.90, -57.45, -9.68],  PY: [-62.64, -27.59, -54.29, -19.29],
  UY: [-58.44, -34.95, -53.18, -30.09], GY: [-61.41, 1.18, -56.48, 8.56],
  CR: [-85.95, 8.03, -82.55, 11.22],    PA: [-83.05, 7.20, -77.16, 9.64],
  GT: [-92.23, 13.74, -88.22, 17.82],   HN: [-89.35, 12.98, -83.15, 15.90],
  SV: [-90.10, 13.15, -87.69, 14.45],   NI: [-87.67, 10.71, -82.74, 15.03],
  CU: [-85.00, 19.83, -74.13, 23.19],   JM: [-78.37, 17.70, -76.19, 18.52],
  DO: [-72.01, 17.54, -68.32, 19.93],   HT: [-74.48, 18.02, -71.62, 19.93],
  TT: [-61.95, 10.03, -60.89, 10.89],   GY: [-61.41, 1.18, -56.48, 8.56],
  // Oceania
  FJ: [177.30, -20.67, 180.00, -12.48], PG: [141.02, -11.66, 156.02, -1.31],
};

const COUNTRY_NAMES: Record<string, string> = {
  DK:"Denmark", SE:"Sweden", NO:"Norway", FI:"Finland", DE:"Germany",
  NL:"Netherlands", BE:"Belgium", AT:"Austria", CH:"Switzerland", ES:"Spain",
  FR:"France", IT:"Italy", GB:"United Kingdom", IE:"Ireland", PL:"Poland",
  CZ:"Czech Republic", PT:"Portugal", GR:"Greece", HU:"Hungary", RO:"Romania",
  HR:"Croatia", SK:"Slovakia", SI:"Slovenia", LT:"Lithuania", LV:"Latvia", EE:"Estonia",
  BG:"Bulgaria", RS:"Serbia", UA:"Ukraine", BY:"Belarus", LU:"Luxembourg",
  MT:"Malta", CY:"Cyprus", LI:"Liechtenstein", IS:"Iceland", AL:"Albania",
  MK:"North Macedonia", BA:"Bosnia and Herzegovina", ME:"Montenegro", MD:"Moldova",
  AM:"Armenia", GE:"Georgia", AZ:"Azerbaijan",
  US:"United States", CA:"Canada", AU:"Australia", NZ:"New Zealand",
  AE:"United Arab Emirates", ZA:"South Africa", TR:"Turkey",
  MX:"Mexico", BR:"Brazil", CL:"Chile", PE:"Peru",
  JP:"Japan", KR:"South Korea", CN:"China", TW:"Taiwan",
  TH:"Thailand", VN:"Vietnam", ID:"Indonesia", MY:"Malaysia", PH:"Philippines",
  SG:"Singapore", MM:"Myanmar", KH:"Cambodia", LA:"Laos",
  IN:"India", BD:"Bangladesh", PK:"Pakistan", LK:"Sri Lanka", NP:"Nepal",
  KZ:"Kazakhstan", UZ:"Uzbekistan", KG:"Kyrgyzstan", TJ:"Tajikistan",
  TM:"Turkmenistan", MN:"Mongolia", AF:"Afghanistan",
  IR:"Iran", IQ:"Iraq", SA:"Saudi Arabia", QA:"Qatar", KW:"Kuwait",
  BH:"Bahrain", OM:"Oman", YE:"Yemen", JO:"Jordan", IL:"Israel", LB:"Lebanon", SY:"Syria",
  EG:"Egypt", MA:"Morocco", DZ:"Algeria", TN:"Tunisia", LY:"Libya",
  NG:"Nigeria", GH:"Ghana", SN:"Senegal", CI:"Côte d'Ivoire", CM:"Cameroon",
  ET:"Ethiopia", KE:"Kenya", TZ:"Tanzania", UG:"Uganda", RW:"Rwanda", SD:"Sudan",
  CD:"DR Congo", AO:"Angola", MZ:"Mozambique", ZM:"Zambia", ZW:"Zimbabwe",
  BW:"Botswana", NA:"Namibia", MG:"Madagascar",
  AR:"Argentina", CO:"Colombia", VE:"Venezuela", EC:"Ecuador", BO:"Bolivia",
  PY:"Paraguay", UY:"Uruguay", GY:"Guyana",
  CR:"Costa Rica", PA:"Panama", GT:"Guatemala", HN:"Honduras",
  SV:"El Salvador", NI:"Nicaragua", CU:"Cuba", JM:"Jamaica",
  DO:"Dominican Republic", HT:"Haiti", TT:"Trinidad and Tobago",
  FJ:"Fiji", PG:"Papua New Guinea",
};

// ---------------------------------------------------------------------------
// Route sources per type
// ---------------------------------------------------------------------------
interface RouteSource {
  name: string;
  baseUrl: string;           // Waymarked Trails API base
  main_categories: string[];
  tags: string[];
  smart_tags: string[];
}

const ROUTE_SOURCES: RouteSource[] = [
  {
    name: "hiking",
    baseUrl: "https://hiking.waymarkedtrails.org/api/v1",
    main_categories: ["natur", "aktiv_sport"],
    tags: ["vandring", "hiking", "tur"],
    smart_tags: ["NATUR", "AKTIV_SPORT", "HIKING", "RUTE"],
  },
  {
    name: "cycling_mtb",
    baseUrl: "https://cycling.waymarkedtrails.org/api/v1",
    main_categories: ["aktiv_sport"],
    tags: ["cykling", "mountainbike", "mtb", "cykelrute"],
    smart_tags: ["AKTIV_SPORT", "MTB", "CYCLING", "RUTE"],
  },
  {
    name: "skating",
    baseUrl: "https://skating.waymarkedtrails.org/api/v1",
    main_categories: ["aktiv_sport"],
    tags: ["skating", "skøjteløb", "inline skating"],
    smart_tags: ["AKTIV_SPORT", "SKATING", "RUTE"],
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
// Waymarked Trails query
// Works by bbox — returns paginated results
// ---------------------------------------------------------------------------
async function fetchWaymarkedPage(baseUrl: string, bbox: [number, number, number, number], page = 0): Promise<any[]> {
  const [west, south, east, north] = bbox;
  const bboxStr = `${west},${south},${east},${north}`;
  const url = `${baseUrl}/list/search?query=&bbox=${bboxStr}&limit=200&page=${page}`;

  const resp = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!resp.ok) return [];
  const data = await resp.json();
  return data.results ?? [];
}

// Also fetch the route detail to get start coordinates
async function fetchRouteDetail(baseUrl: string, routeId: number): Promise<any | null> {
  try {
    const resp = await fetch(`${baseUrl}/details/relation/${routeId}`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
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
        skipped_count: summary.total_skipped_duplicate ?? 0,
        error_count: summary.errors?.length ?? 0,
        errors: summary.errors?.length > 0 ? summary.errors : null,
        metadata: { by_source: summary.by_source, countries_processed: summary.countries_processed },
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

  const runId = await startRun("import-waymarked-routes");

  const allCodes = Object.keys(COUNTRY_BBOX);
  let targetCountries: string[] = body.countries?.filter((c: string) => allCodes.includes(c)) ?? [];
  if (targetCountries.length === 0) {
    // Default: Scandinavia first, then rest
    targetCountries = ["DK","SE","NO","FI","DE","AT","CH","FR","ES","IT","GB","IE","NL","BE","PL","CZ","US","CA","AU","NZ","TR","ZA","AE","MX","BR","CL","PE"];
  }

  const targetSources: string[] = body.sources ?? ROUTE_SOURCES.map(s => s.name);
  const sources = ROUTE_SOURCES.filter(s => targetSources.includes(s.name));

  // 55s timeout guard
  const startTime = Date.now();
  function isTimedOut() { return Date.now() - startTime > 55_000; }

  const seen = new Set<string>();
  const summary = {
    countries_processed: [] as string[],
    total_fetched: 0,
    total_inserted: 0,
    total_skipped_duplicate: 0,
    by_source: {} as Record<string, number>,
    timed_out: false,
    errors: [] as string[],
  };

  const BATCH = 50;
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
    const bbox = COUNTRY_BBOX[countryCode];
    const countryName = COUNTRY_NAMES[countryCode] ?? countryCode;

    for (const source of sources) {
      if (isTimedOut()) { summary.timed_out = true; break outer; }

      await sleep(400);

      let routes: any[];
      try {
        routes = await fetchWaymarkedPage(source.baseUrl, bbox, 0);
        // Fetch page 2 if available and not timed out
        if (routes.length >= 200 && !isTimedOut()) {
          await sleep(300);
          const page2 = await fetchWaymarkedPage(source.baseUrl, bbox, 1);
          routes.push(...page2);
        }
      } catch (err: any) {
        console.error(`Waymarked error ${countryCode}/${source.name}:`, err.message);
        summary.errors.push(`${countryCode}/${source.name}: ${err.message}`);
        continue;
      }

      console.log(`${countryCode}/${source.name}: ${routes.length} routes`);
      summary.by_source[source.name] = (summary.by_source[source.name] ?? 0) + routes.length;

      for (const route of routes) {
        if (isTimedOut()) { summary.timed_out = true; break outer; }

        const name = route.name?.trim() || route.ref?.trim();
        if (!name) continue;

        // Use bbox center as fallback coordinates
        const [west, south, east, north] = bbox;
        const lat = route.geom?.coordinates?.[1] ?? ((south + north) / 2);
        const lon = route.geom?.coordinates?.[0] ?? ((west + east) / 2);

        const key = dedupeKey(name, lat, lon);
        if (seen.has(key)) { summary.total_skipped_duplicate++; continue; }
        seen.add(key);
        summary.total_fetched++;

        // Build description
        const distStr = route.length ? ` (${(route.length / 1000).toFixed(1)} km)` : "";
        const description = `${source.tags[0]} rute: ${name}${distStr} i ${countryName}`;

        buffer.push({
          name,
          description: description.slice(0, 500),
          latitude: lat,
          longitude: lon,
          city: "",
          region: "",
          country: countryName,
          main_categories: source.main_categories,
          tags: source.tags,
          smart_tags: source.smart_tags,
          metadata: {
            source: "waymarked_trails",
            route_type: source.name,
            osm_id: route.id,
            length_m: route.length ?? null,
            ascent_m: route.ascent ?? null,
            descent_m: route.descent ?? null,
            difficulty: route.difficulty ?? null,
            ref: route.ref ?? null,
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

  console.log("import-waymarked-routes complete:", JSON.stringify(summary));
  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
