/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />

// ---------------------------------------------------------------------------
// Source: Goabase (https://www.goabase.net/api/party/)
// Free JSON API for psytrance / goa / electronic events worldwide — no key needed.
// ---------------------------------------------------------------------------

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://rbengtfrthqdfbcdcugp.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOABASE_URL = "https://www.goabase.net/api/party/json/";

// Countries to pull — prioritise Europe, then global hubs
const COUNTRIES = [
  "DE","CH","AT","BE","NL","FR","GB","ES","IT","PT","DK","SE","NO","FI",
  "PL","CZ","HU","GR","HR","RO","SK","SI","EE","LV","LT","BG","RS","UA",
  "US","CA","BR","AU","ZA","MX","AR","IL","TR","IN","TH","JP",
];

// Goabase event types
const EVENT_TYPES = ["festival","openair","indoor","club"];

function mapType(nameType: string): string {
  const t = nameType?.toLowerCase() ?? "";
  if (t.includes("open") || t.includes("outdoor") || t.includes("festival")) return "outdoor";
  if (t.includes("indoor") || t.includes("club")) return "indoor";
  return "indoor_outdoor";
}

function mapCategory(nameType: string): string {
  const t = nameType?.toLowerCase() ?? "";
  if (t.includes("festival") || t.includes("open")) return "musik";
  return "natteliv";
}

function mapTags(nameType: string): string[] {
  const t = nameType?.toLowerCase() ?? "";
  const base = ["psytrance", "goa", "electronic music"];
  if (t.includes("festival")) return [...base, "festival"];
  if (t.includes("open")) return [...base, "openair", "festival"];
  if (t.includes("club")) return [...base, "club", "natteliv"];
  return [...base, "natteliv"];
}

// ---------------------------------------------------------------------------
// Logging helpers
// ---------------------------------------------------------------------------
async function startRun(functionName: string): Promise<string | null> {
  if (!SUPABASE_KEY) return null;
  const runId = crypto.randomUUID();
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/import_runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Prefer": "return=minimal" },
      body: JSON.stringify({ id: runId, function_name: functionName, started_at: new Date().toISOString(), status: "running" }),
    });
  } catch { /* non-fatal */ }
  return runId;
}

async function completeRun(runId: string | null, summary: Record<string, unknown>): Promise<void> {
  if (!runId) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/import_runs?id=eq.${runId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Prefer": "return=minimal" },
      body: JSON.stringify({
        completed_at: new Date().toISOString(),
        status: summary.timed_out ? "timed_out" : "completed",
        fetched_count: summary.total_fetched,
        inserted_count: summary.total_inserted,
        skipped_count: summary.total_skipped,
        errors: (summary.errors as string[]).length > 0 ? summary.errors : null,
        metadata: { by_country: summary.by_country },
      }),
    });
  } catch { /* non-fatal */ }
}

// ---------------------------------------------------------------------------
// Fetch from Goabase
// ---------------------------------------------------------------------------
async function fetchGoabase(params: Record<string, string>): Promise<any[]> {
  const qs = new URLSearchParams(params).toString();
  const resp = await fetch(`${GOABASE_URL}?${qs}`, {
    headers: { "User-Agent": "B-Social/1.0 (b-social.net)" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!resp.ok) throw new Error(`Goabase ${resp.status}`);
  const data = await resp.json();
  return data.partylist ?? [];
}

// ---------------------------------------------------------------------------
// Upsert events
// ---------------------------------------------------------------------------
async function upsertEvents(rows: any[]): Promise<number> {
  if (rows.length === 0) return 0;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?on_conflict=title,date,country`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("upsert error:", res.status, txt.slice(0, 300));
    return 0;
  }
  return rows.length;
}

// ---------------------------------------------------------------------------
// Edge Function
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }

  let body: any = {};
  try { body = await req.json(); } catch { /* defaults */ }

  const runId = await startRun("import-goabase-events");
  const startTime = Date.now();
  const TIMEOUT_MS = 55_000;
  function isTimedOut() { return Date.now() - startTime > TIMEOUT_MS; }

  const targetCountries: string[] = body.countries ?? COUNTRIES;
  const targetTypes: string[] = body.event_types ?? EVENT_TYPES;
  const seen = new Set<string>(); // dedup within this run by Goabase ID

  const summary = {
    total_fetched: 0,
    total_inserted: 0,
    total_skipped: 0,
    timed_out: false,
    by_country: {} as Record<string, number>,
    errors: [] as string[],
  };

  // Helper: turn a Goabase party record into an events row
  function toRow(p: any, fallbackCountry: string) {
    const indoor_outdoor = mapType(p.nameType ?? "");
    return {
      title: p.nameParty.trim(),
      description: [
        p.nameOrganizer ? `Organizer: ${p.nameOrganizer}` : "",
        p.nameTown ? `Location: ${p.nameTown}, ${p.nameCountry}` : "",
        p.nameType ? `Type: ${p.nameType}` : "",
      ].filter(Boolean).join(" · ").slice(0, 500),
      location: p.nameTown ? `${p.nameTown}, ${p.nameCountry}` : (p.nameCountry ?? fallbackCountry),
      image_url: p.urlImageMedium || p.urlImageSmall || null,
      date: p.dateStart,
      category: mapCategory(p.nameType ?? ""),
      interest_tags: mapTags(p.nameType ?? ""),
      indoor_outdoor,
      weather_suitable: indoor_outdoor === "indoor" ? ["all"] : ["clear", "cloudy"],
      suitable_for_modes: ["solo", "duo", "gruppe"],
      latitude: Number(p.geoLat),
      longitude: Number(p.geoLon),
      country: p.isoCountry || fallbackCountry,
      source: "goabase",
      status: "active",
      max_participants: 2000,
      created_by: null,
      price: null,
      min_required_participants: 1,
      category_level: 2,
      url: p.urlPartyHtml || null,
    };
  }

  function ingest(parties: any[], fallbackCountry: string, bucket: any[]) {
    for (const p of parties) {
      if (!p.nameParty || !p.dateStart || !p.geoLat || !p.geoLon) continue;
      const key = String(p.id);
      if (seen.has(key)) { summary.total_skipped++; continue; }
      seen.add(key);
      summary.total_fetched++;
      bucket.push(toRow(p, fallbackCountry));
    }
  }

  // ── Phase 1: global sweep (no country filter) — catches everything at once ──
  if (!isTimedOut()) {
    const globalBuffer: any[] = [];
    for (const eventType of targetTypes) {
      if (isTimedOut()) break;
      try {
        const parties = await fetchGoabase({ eventtype: eventType, limit: "500" });
        ingest(parties, "XX", globalBuffer);
      } catch (err: any) {
        summary.errors.push(`global/${eventType}: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }
    if (globalBuffer.length > 0) {
      summary.total_inserted += await upsertEvents(globalBuffer);
      console.log(`global sweep: ${globalBuffer.length} events`);
    }
  }

  // ── Phase 2: future date sweeps — get events up to 6 months out ──
  // Goabase only returns events from today onwards by default; date sweeps reach further
  const futureDates: string[] = [];
  for (let m = 1; m <= 6; m++) {
    const d = new Date();
    d.setMonth(d.getMonth() + m);
    futureDates.push(d.toISOString().slice(0, 10));
  }
  if (!isTimedOut()) {
    const futureBuffer: any[] = [];
    for (const date of futureDates) {
      if (isTimedOut()) break;
      try {
        const parties = await fetchGoabase({ searchdate: date, limit: "500" });
        ingest(parties, "XX", futureBuffer);
      } catch (err: any) {
        summary.errors.push(`future/${date}: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }
    if (futureBuffer.length > 0) {
      summary.total_inserted += await upsertEvents(futureBuffer);
      console.log(`future sweeps: ${futureBuffer.length} new events`);
    }
  }

  // ── Phase 3: per-country sweep — fills in country-specific events ──
  outer:
  for (const country of targetCountries) {
    if (isTimedOut()) { summary.timed_out = true; break; }

    let countryTotal = 0;
    const buffer: any[] = [];

    for (const eventType of targetTypes) {
      if (isTimedOut()) { summary.timed_out = true; break outer; }

      let parties: any[];
      try {
        parties = await fetchGoabase({ country, eventtype: eventType, limit: "500" });
      } catch (err: any) {
        summary.errors.push(`${country}/${eventType}: ${err.message}`);
        continue;
      }

      const before = summary.total_fetched;
      ingest(parties, country, buffer);
      countryTotal += summary.total_fetched - before;

      await new Promise(r => setTimeout(r, 200));
    }

    if (buffer.length > 0) {
      summary.total_inserted += await upsertEvents(buffer);
    }
    summary.by_country[country] = countryTotal;
    if (countryTotal > 0) console.log(`${country}: ${countryTotal} new events`);
  }

  await completeRun(runId, summary);
  console.log("import-goabase-events complete:", JSON.stringify(summary));

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
