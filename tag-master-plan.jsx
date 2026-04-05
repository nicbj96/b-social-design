import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, AlertTriangle, CheckCircle, Search, GitBranch, Zap, Database, ArrowRight, X, Copy, Tag, TreePine, BarChart3, MapPin, Calendar } from "lucide-react";

// ═══════════════════════════════════════════
// B-SOCIAL TAG SYSTEM — MASTER PLAN v2
// Based on REAL Supabase database audit (2026-04-05)
// ═══════════════════════════════════════════

// REAL database stats
const DB_STATS = {
  events: { total: 61212, withTags: 1000, withoutTags: 60212, categories: 8 },
  places: { total: 194097, uniqueTags: 53, smartTags: 31, mainCats: 8 },
  tags: { categories: 22, l1: 22, l2: 92, l3: 679, total: 793 },
  junctions: { eventTags: 0, userTags: 0, profiles: 0 },
};

const EVENT_CATS = [
  { name: "musik", count: 6088, emoji: "🎵", pct: 9.9 },
  { name: "kultur", count: 5590, emoji: "🎨", pct: 9.1 },
  { name: "mad", count: 4255, emoji: "🍽️", pct: 6.9 },
  { name: "motor", count: 3758, emoji: "🏎️", pct: 6.1 },
  { name: "arrangement", count: 894, emoji: "🎉", pct: 1.5 },
  { name: "sport", count: 463, emoji: "⚽", pct: 0.8 },
  { name: "familie", count: 234, emoji: "👨‍👩‍👧", pct: 0.4 },
  { name: "festival", count: 108, emoji: "🎪", pct: 0.2 },
];

const PLACE_CATS = [
  { name: "aktiv_sport", count: "~80K", emoji: "⚽" },
  { name: "natur", count: "~55K", emoji: "🌲" },
  { name: "kultur", count: "~26K", emoji: "🎨" },
  { name: "overnatning", count: "~7K", emoji: "🏕️" },
  { name: "mad_hangout", count: "~4K", emoji: "🍽️" },
  { name: "underholdning", count: "~3K", emoji: "🎭" },
  { name: "familie", count: "~800", emoji: "👨‍👩‍👧" },
  { name: "natteliv", count: "~400", emoji: "🌙" },
];

const PLACE_TAGS_TOP = [
  { tag: "ridning / horse riding", count: 1105 },
  { tag: "museum / udstilling", count: 662 },
  { tag: "cykling / mtb", count: 468 },
  { tag: "kunst", count: 365 },
  { tag: "fitness", count: 297 },
  { tag: "skating / skøjteløb", count: 182 },
  { tag: "natur", count: 179 },
  { tag: "klatring", count: 174 },
  { tag: "skatepark / sport", count: 173 },
  { tag: "naturreservat", count: 144 },
  { tag: "nationalpark", count: 132 },
  { tag: "bar / restaurant / café", count: 47 },
  { tag: "camping", count: 36 },
  { tag: "vandring / hiking", count: 23 },
];

const MOTOR_TAGS_USED = [
  { tag: "racing", count: 27 }, { tag: "motorcykel", count: 23 }, { tag: "motorsport", count: 22 },
  { tag: "klassisk", count: 19 }, { tag: "mc", count: 15 }, { tag: "rally", count: 10 },
  { tag: "supercar", count: 10 }, { tag: "custom", count: 9 }, { tag: "f1", count: 8 },
  { tag: "veteran-bil", count: 8 }, { tag: "bilshow", count: 7 }, { tag: "mc-traef", count: 7 },
  { tag: "trackday", count: 6 }, { tag: "drift", count: 4 }, { tag: "tuning", count: 4 },
  { tag: "elbil", count: 4 }, { tag: "gokart", count: 1 }, { tag: "dragrace", count: 1 },
];

const DB_TAG_TREE_MOTOR = [
  { slug: "motor-køretøjer", name: "Motor & Køretøjer", emoji: "🚗", level: 1, children: [
    { slug: "biler", name: "Biler", level: 2, children: [
      "autocamper","bil-klub","bil-show","drifting","elbiler","karting-aktiv","klassiske-biler","rally-aktiv","roadtrip-bil","tuning"
    ]},
    { slug: "motorcykler", name: "Motorcykler", level: 2, children: [
      "custom-mc","enduro","mc-klub","mc-tur","scooter"
    ]},
    { slug: "motorsport-aktiv", name: "Motorsport", level: 2, children: [
      "circuit-racing"
    ]},
    { slug: "vandfartøjer", name: "Vandfartøjer", level: 2, children: [
      "båd","jetski","sejlads-sport","speedbåd"
    ]},
  ]}
];

const ISSUES = [
  { type: "critical", title: "98% af events har INGEN tags", desc: "Kun ~1.000 ud af 61.212 events har interest_tags. De resterende 60.000+ er fuldstændig utagget — inkl. 3.650 motor-events.", fix: "Auto-tagging migration: Map event category + title keywords → tags_normalized slugs. Kør som batch SQL + Edge Function." },
  { type: "critical", title: "event_tags_normalized er TOM (0 rækker)", desc: "Junction-tabellen mellem events og det normaliserede tag-system er aldrig blevet brugt. Tags'ene ligger kun i interest_tags arrayet.", fix: "Populér event_tags_normalized fra existing interest_tags + category mapping. Derefter: ny auto-tagger for events uden tags." },
  { type: "critical", title: "Places har kun 53 unikke tags", desc: "194K steder men kun 53 forskellige tags. Ingen motor/bil/MC steder overhovedet. 850 af tags er 'ridning'. Næsten ingen diversitet.", fix: "Re-tag alle places via main_categories + smart_tags → tags_normalized mapping. Tilføj motor-steder (racerbaner, go-kart, MC-værksteder)." },
  { type: "critical", title: "3 kilder, 0 match", desc: "tagTree.ts har 30 L1 (1.093 tags), Supabase har 22 L1 (793 tags), categories.ts har 13 UI-kategorier. Ingen stemmer overens.", fix: "Supabase = single source of truth. tagTree.ts auto-genereret. categories.ts mapper til DB." },
  { type: "warning", title: "Events bruger simple category-strenge", desc: "Kun 8 kategorier: musik, kultur, mad, motor, arrangement, sport, familie, festival. For grovkornet til 793 tags.", fix: "Map de 8 kategorier til L1 tag_categories. Berig med L2/L3 via title-parsing og keyword-matching." },
  { type: "warning", title: "Places har parallel tag-system", desc: "Places bruger main_categories (8), tags (53 unikke), og smart_tags (31 unikke CAPS) — tre uafhængige systemer.", fix: "Konsolidér til ét tag-system: tags_normalized. Mapping: smart_tags → L1/L2, tags → L3." },
  { type: "warning", title: "22 duplicate slugs i tagTree.ts", desc: "Tags som surfing, esport, backpacking, moderne-dans optræder i flere grene.", fix: "Dedupliker med canonical slugs + tag_aliases tabel." },
  { type: "warning", title: "Motor-tags i DB matcher IKKE motor-tags brugt på events", desc: "DB har 'bil-show', 'circuit-racing', 'drifting'. Events bruger 'bilshow', 'racing', 'drift'. Ingen overlap!", fix: "Alias-mapping: bil-show↔bilshow, circuit-racing↔racing, drifting↔drift, mc-tur↔mc osv." },
  { type: "info", title: "Ingen steder for motor-entusiaster", desc: "0 places med motor/bil/MC tags ud af 194K. Ingen racerbaner, go-kart-baner, bilværksteder, MC-klubber.", fix: "Import motor-steder fra OSM/Google: racetracks, karting, bilmuseer, MC-værksteder, cars & coffee spots." },
  { type: "info", title: "user_tags_normalized er tom", desc: "Ingen brugere har gemt tag-præferencer i Supabase. Alt kører i localStorage.", fix: "Sync localStorage → Supabase ved login. Giver server-side personalisering." },
];

const PHASES = [
  { phase: 1, title: "Tag 61K Events (Auto-Tagger)", weeks: "Uge 1-2", color: "red", tasks: [
    { task: "Byg category→L1 mapping (motor→motor-køretøjer, musik→musik-lyd, osv.)", status: "migration" },
    { task: "Title keyword extraction: 'Track Day'→trackday, 'MC Tur'→mc-tur, 'Gokart'→karting-aktiv", status: "migration" },
    { task: "Populér event_tags_normalized for alle 61K events via batch SQL", status: "migration" },
    { task: "Tilføj alias-tabel: bilshow↔bil-show, racing↔circuit-racing, drift↔drifting", status: "migration" },
    { task: "Validér: 3.758 motor-events skal have minimum 2 tags hver efter migration", status: "verify" },
  ]},
  { phase: 2, title: "Tag 194K Places (Re-Tag)", weeks: "Uge 2-3", color: "amber", tasks: [
    { task: "Map smart_tags → tags_normalized: AKTIV_SPORT→motion-fitness, MTB→mtb, MUSEUM→museum", status: "migration" },
    { task: "Map main_categories → L1: aktiv_sport→motion-fitness, natur→natur-outdoor, kultur→kultur-kunst", status: "migration" },
    { task: "Import motor-steder fra OSM: racerbaner, go-kart, MC-klubber, bilmuseer (DK + EU)", status: "import" },
    { task: "Byg place_tags junction tabel (som event_tags_normalized men for places)", status: "schema" },
    { task: "Berig places med L3 tags: ridning→hest+ryttersti+ridning, museum→kunstmuseum/historisk", status: "migration" },
  ]},
  { phase: 3, title: "Single Source of Truth", weeks: "Uge 3-4", color: "blue", tasks: [
    { task: "Merge overlappende L1 kategorier (30→18): sundhed+velvære, gaming+digital, osv.", status: "schema" },
    { task: "Dedupliker 22 duplicate slugs med canonical resolution", status: "migration" },
    { task: "Auto-generér tagTree.ts fra Supabase (build script, ikke håndskrevet)", status: "code" },
    { task: "Align categories.ts UI-kategorier med tag_categories via mapping-tabel", status: "code" },
    { task: "Sync localStorage tags → user_tags_normalized ved login", status: "code" },
  ]},
  { phase: 4, title: "Intelligence Layer", weeks: "Uge 5-6", color: "green", tasks: [
    { task: "tag_aliases tabel: MTB→mountain bike, SUP→stand up paddle, 5K→fem kilometer", status: "schema" },
    { task: "tag_metadata: season, indoor/outdoor, difficulty, age_group, price_range", status: "schema" },
    { task: "Auto-tagger Edge Function: foreslå tags fra event/place titel + description ved insert", status: "code" },
    { task: "Tag-søgning med alias-support (søg 'mountain bike' → finder 'mtb')", status: "code" },
    { task: "Admin panel: CRUD tags, merge, deprecate — uden deploy", status: "code" },
  ]},
];

const AUTO_TAG_RULES = [
  { category: "motor", keywords: ["Track Day","Trackday"], maps_to: ["motor-køretøjer","motorsport-aktiv","circuit-racing","trackday"] },
  { category: "motor", keywords: ["MC Tur","MC-tur"], maps_to: ["motor-køretøjer","motorcykler","mc-tur"] },
  { category: "motor", keywords: ["Drift","Drifting"], maps_to: ["motor-køretøjer","biler","drifting"] },
  { category: "motor", keywords: ["Gokart","Karting","Go-kart"], maps_to: ["motor-køretøjer","motorsport-aktiv","karting-aktiv"] },
  { category: "motor", keywords: ["Bilshow","Bil Show","Car Show"], maps_to: ["motor-køretøjer","biler","bil-show"] },
  { category: "motor", keywords: ["Dragrace","Drag Race"], maps_to: ["motor-køretøjer","motorsport-aktiv","circuit-racing"] },
  { category: "motor", keywords: ["Tuning"], maps_to: ["motor-køretøjer","biler","tuning"] },
  { category: "motor", keywords: ["F1","Formel","Formula"], maps_to: ["motor-køretøjer","motorsport-aktiv","circuit-racing"] },
  { category: "motor", keywords: ["Scrambler","MC Safety","Motorcykel"], maps_to: ["motor-køretøjer","motorcykler","mc-tur"] },
  { category: "motor", keywords: ["Cars & Coffee","Cars and Coffee"], maps_to: ["motor-køretøjer","biler","bil-klub"] },
  { category: "motor", keywords: ["Rally","Rallycross","Autocross"], maps_to: ["motor-køretøjer","motorsport-aktiv","rally-aktiv"] },
  { category: "motor", keywords: ["Veteran","Oldtimer","Klassisk"], maps_to: ["motor-køretøjer","biler","klassiske-biler"] },
  { category: "motor", keywords: ["Van Life","Autocamper"], maps_to: ["motor-køretøjer","biler","autocamper"] },
  { category: "motor", keywords: ["Electric Car","Elbil","EV"], maps_to: ["motor-køretøjer","biler","elbiler"] },
  { category: "musik", keywords: ["Koncert","Concert"], maps_to: ["musik-lyd","live-musik","koncerter"] },
  { category: "musik", keywords: ["Festival"], maps_to: ["musik-lyd","live-musik","festivaler"] },
  { category: "musik", keywords: ["Jazz"], maps_to: ["musik-lyd","genre","jazz"] },
  { category: "sport", keywords: ["Fodbold","Football"], maps_to: ["motion-fitness","bold","fodbold"] },
  { category: "sport", keywords: ["Løb","Marathon","Running"], maps_to: ["motion-fitness","løb"] },
  { category: "mad", keywords: ["Smagning","Tasting","Vin"], maps_to: ["mad-drikke","drikke","vinsmagning"] },
  { category: "mad", keywords: ["Street Food","Food Market"], maps_to: ["mad-drikke","spisesteder","streetfood"] },
];

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════

function Stat({ label, value, sub, color = "blue", big }) {
  const colors = {
    blue: "border-blue-500/30 bg-blue-950/40 text-blue-300",
    red: "border-red-500/30 bg-red-950/40 text-red-300",
    amber: "border-amber-500/30 bg-amber-950/40 text-amber-300",
    green: "border-green-500/30 bg-green-950/40 text-green-300",
    purple: "border-purple-500/30 bg-purple-950/40 text-purple-300",
    rose: "border-rose-500/30 bg-rose-950/40 text-rose-300",
  };
  return (
    <div className={`rounded-xl border-2 p-4 ${colors[color]}`}>
      <div className={`font-bold ${big ? "text-3xl" : "text-2xl"}`}>{value}</div>
      <div className="font-semibold text-sm mt-1 opacity-90">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
    </div>
  );
}

function Bar({ label, value, max, color = "indigo", emoji }) {
  const w = Math.max(3, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      {emoji && <span className="text-lg w-7 text-center">{emoji}</span>}
      <span className="text-sm text-slate-300 w-32 truncate">{label}</span>
      <div className="flex-1 bg-slate-800 rounded-full h-5 overflow-hidden">
        <div className={`h-full bg-gradient-to-r from-${color}-600 to-${color}-400 rounded-full flex items-center justify-end px-2`} style={{ width: `${w}%`, minWidth: "40px" }}>
          <span className="text-xs font-bold text-white">{typeof value === "number" ? value.toLocaleString() : value}</span>
        </div>
      </div>
    </div>
  );
}

function IssueCard({ issue }) {
  const [open, setOpen] = useState(false);
  const styles = {
    critical: { border: "border-red-500/40", bg: "bg-red-950/30", badge: "bg-red-500 text-white", icon: "text-red-400" },
    warning: { border: "border-amber-500/40", bg: "bg-amber-950/30", badge: "bg-amber-500 text-black", icon: "text-amber-400" },
    info: { border: "border-blue-500/40", bg: "bg-blue-950/30", badge: "bg-blue-500 text-white", icon: "text-blue-400" },
  };
  const s = styles[issue.type];
  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-4 cursor-pointer hover:scale-[1.005] transition-all`} onClick={() => setOpen(!open)}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className={`${s.icon} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{issue.type.toUpperCase()}</span>
            <span className="text-white font-semibold text-sm">{issue.title}</span>
          </div>
          <p className="text-slate-400 text-sm">{issue.desc}</p>
          {open && (
            <div className="mt-3 p-3 rounded-lg bg-green-950/40 border border-green-500/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} className="text-green-400" />
                <span className="text-green-400 font-semibold text-xs">LØSNING</span>
              </div>
              <p className="text-green-200 text-sm">{issue.fix}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════

const TABS = [
  { id: "db", label: "Database Audit", icon: Database },
  { id: "events", label: "Events", icon: Calendar },
  { id: "places", label: "Places", icon: MapPin },
  { id: "issues", label: "Issues (10)", icon: AlertTriangle },
  { id: "plan", label: "Migration Plan", icon: GitBranch },
  { id: "autotag", label: "Auto-Tagger", icon: Zap },
];

export default function TagMasterPlan() {
  const [tab, setTab] = useState("db");

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Tag size={22} className="text-rose-400" /></div>
            <h1 className="text-2xl font-bold">B-Social Tag System — Master Plan v2</h1>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded-full font-bold">REAL DB DATA</span>
          </div>
          <p className="text-slate-400">Live audit af Supabase: 61K events, 194K places, 793 tags — og hvad der mangler</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto py-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${tab === t.id ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              <t.icon size={15} />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── DATABASE AUDIT ── */}
        {tab === "db" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Supabase Database — Live Audit</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Stat label="Events" value="61.212" color="blue" />
              <Stat label="Places" value="194.097" color="green" />
              <Stat label="Tag Categories" value="22" sub="L1 i Supabase" color="purple" />
              <Stat label="Tags Normalized" value="793" sub="22 L1 + 92 L2 + 679 L3" color="purple" />
              <Stat label="Event↔Tag Links" value="0" sub="Junction EMPTY" color="red" />
              <Stat label="User Tags" value="0" sub="Kun localStorage" color="red" />
            </div>

            {/* The big disconnect */}
            <div className="rounded-2xl border-2 border-red-500/30 bg-red-950/20 p-6">
              <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={22} />
                Det Store Problem: Tag-systemet er IKKE forbundet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-black text-red-400">793</div>
                  <div className="text-sm text-slate-400 mt-1">tags defineret i DB</div>
                  <div className="text-xs text-slate-500">(tags_normalized)</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <X size={40} className="text-red-500 mx-auto" />
                    <div className="text-red-400 font-bold text-sm mt-1">IKKE FORBUNDET</div>
                    <div className="text-xs text-slate-500">event_tags_normalized: 0 rækker</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black text-blue-400">61K</div>
                  <div className="text-sm text-slate-400 mt-1">events + 194K places</div>
                  <div className="text-xs text-slate-500">(bruger simple strings)</div>
                </div>
              </div>
            </div>

            {/* 3 sources */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-red-500/30 bg-red-950/10 p-5">
                <div className="font-bold text-red-300 mb-3">tagTree.ts (Static)</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">L1</span><span className="font-bold text-red-300">30</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Total tags</span><span className="font-bold">1.093</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Duplicates</span><span className="font-bold text-red-400">22</span></div>
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-5">
                <div className="font-bold text-amber-300 mb-3">categories.ts (UI)</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Categories</span><span className="font-bold text-amber-300">13</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Key format</span><span className="font-bold">Short slugs</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Match med DB?</span><span className="font-bold text-red-400">0%</span></div>
                </div>
              </div>
              <div className="rounded-xl border border-blue-500/30 bg-blue-950/10 p-5">
                <div className="font-bold text-blue-300 mb-3">Supabase (DB)</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Categories</span><span className="font-bold text-blue-300">22</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Total tags</span><span className="font-bold">793</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Brugt?</span><span className="font-bold text-red-400">NEJ</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {tab === "events" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Events — 61.212 total</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Total Events" value="61.212" color="blue" />
              <Stat label="Med Tags" value="~1.000" sub="1.6%" color="green" />
              <Stat label="Uden Tags" value="~60.212" sub="98.4%!" color="red" />
              <Stat label="Kategorier" value="8" sub="Simple strenge" color="amber" />
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Events fordelt på kategori</h3>
              <div className="space-y-2">
                {EVENT_CATS.map(c => <Bar key={c.name} label={c.name} value={c.count} max={6088} emoji={c.emoji} color="indigo" />)}
              </div>
              <p className="text-slate-500 text-xs mt-3">Bemærk: Kategorierne summerer kun til ~21K. De resterende ~40K events har ingen af disse 8 kategorier eller er pagineret ud.</p>
            </div>

            {/* Motor deep-dive */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">🏎️ Motor Events — Deep Dive</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Stat label="Motor events" value="3.758" color="amber" />
                <Stat label="Med tags" value="108" sub="2.9%" color="green" />
                <Stat label="Uden tags" value="3.650" sub="97.1%!" color="red" />
                <Stat label="Unikke tags brugt" value="220" color="purple" />
              </div>

              <h4 className="font-bold text-sm mb-3 text-amber-300">Top motor-tags faktisk brugt på events:</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {MOTOR_TAGS_USED.map(t => (
                  <span key={t.tag} className="px-2 py-1 rounded-full bg-amber-900/40 border border-amber-500/30 text-amber-200 text-xs font-mono">
                    {t.tag} <span className="text-amber-400 font-bold">({t.count})</span>
                  </span>
                ))}
              </div>

              <h4 className="font-bold text-sm mb-3 text-blue-300">Motor-tags i Supabase tags_normalized:</h4>
              <div className="bg-slate-800/60 rounded-xl p-4">
                <div className="text-white font-bold mb-2">🚗 Motor & Køretøjer (25 tags)</div>
                {DB_TAG_TREE_MOTOR[0].children.map(l2 => (
                  <div key={l2.slug} className="ml-4 mb-2">
                    <div className="text-slate-300 font-medium">↳ {l2.name} ({l2.slug})</div>
                    <div className="ml-6 flex flex-wrap gap-1 mt-1">
                      {l2.children.map(l3 => (
                        <span key={l3} className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-mono">{l3}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-red-950/30 border border-red-500/20 rounded-lg">
                <p className="text-red-300 text-sm font-semibold">Problem: Events bruger 'bilshow', DB har 'bil-show'. Events bruger 'racing', DB har 'circuit-racing'. Events bruger 'drift', DB har 'drifting'. INGEN MATCH!</p>
              </div>

              <h4 className="font-bold text-sm mb-3 mt-4 text-slate-300">Eksempler på utaggede motor-events:</h4>
              <div className="space-y-1 text-sm text-slate-400">
                {["Track Day – Viborg","Dragrace – Mariager","Scrambler Tur – Marseille","ATV Quad – Kolding","Rally Cross – København","Drift School – Vejle","Monstertruck Show – Ribe","Bilshow – Hillerød","Van Life Meetup – Rødekro","Karting Race – Viborg"].map(e => (
                  <div key={e} className="flex items-center gap-2"><X size={12} className="text-red-500" />{e} — <span className="text-red-400">tags: []</span></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PLACES TAB ── */}
        {tab === "places" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Places — 194.097 total</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Total Places" value="194.097" color="green" />
              <Stat label="Main Categories" value="8" sub="Simple strenge" color="amber" />
              <Stat label="Unikke tags" value="53" sub="Ud af 194K steder!" color="red" />
              <Stat label="Smart Tags" value="31" sub="CAPS format" color="purple" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-4">main_categories fordeling</h3>
                <div className="space-y-2">
                  {PLACE_CATS.map(c => (
                    <div key={c.name} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{c.emoji}</span>
                      <span className="text-slate-300 w-28">{c.name}</span>
                      <span className="text-slate-400 font-mono">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Top place tags (kun 53 unikke!)</h3>
                <div className="space-y-1.5">
                  {PLACE_TAGS_TOP.map(t => (
                    <div key={t.tag} className="flex items-center gap-2 text-sm">
                      <span className="text-slate-300 flex-1">{t.tag}</span>
                      <span className="font-mono text-slate-400 text-xs">{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Motor places gap */}
            <div className="rounded-2xl border-2 border-red-500/30 bg-red-950/20 p-6">
              <h3 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={20} />
                0 Motor/Bil/MC Steder
              </h3>
              <p className="text-slate-300 mb-4">Ud af 194.097 steder er der INGEN med motor-relaterede tags. Ingen racerbaner, go-kart-baner, bilmuseer, MC-værksteder, autocamper-pladser.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Racerbaner","Go-kart baner","MC-klubber","Bilmuseer","Autocamper spots","Track day venues","Tuning shops","Cars & Coffee spots"].map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm"><X size={14} className="text-red-500" /><span className="text-slate-400">{s}</span></div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-950/30 border border-green-500/20 rounded-lg text-sm text-green-300">
                <CheckCircle size={14} className="inline mr-1" /> Løsning: Import fra OpenStreetMap — der er tusindvis af motor-steder i DK + EU med tags som "amenity=fuel", "leisure=track", "sport=karting", "shop=car_repair"
              </div>
            </div>

            {/* 3 parallel tag systems */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6">
              <h3 className="text-lg font-bold mb-4">3 parallelle tag-systemer på places</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-800/60 p-4">
                  <div className="font-bold text-amber-300 mb-2">main_categories</div>
                  <div className="text-sm text-slate-400 mb-2">8 simple strenge</div>
                  <div className="flex flex-wrap gap-1">
                    {["aktiv_sport","natur","kultur","mad_hangout","overnatning","underholdning","familie","natteliv"].map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-amber-900/30 text-amber-300 text-xs font-mono">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-800/60 p-4">
                  <div className="font-bold text-blue-300 mb-2">tags</div>
                  <div className="text-sm text-slate-400 mb-2">53 unikke (mixed dansk/engelsk)</div>
                  <div className="flex flex-wrap gap-1">
                    {["ridning","horse riding","hest","museum","cykling","mtb","kunst","fitness","skating","camping"].map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 text-xs font-mono">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-800/60 p-4">
                  <div className="font-bold text-purple-300 mb-2">smart_tags</div>
                  <div className="text-sm text-slate-400 mb-2">31 unikke (CAPS format)</div>
                  <div className="flex flex-wrap gap-1">
                    {["AKTIV_SPORT","RUTE","RIDNING","KULTUR","MUSEUM","MTB","FITNESS","NATUR","SKATING","EXTREME"].map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 text-xs font-mono">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <ArrowRight className="text-green-400" size={20} />
                <span className="text-green-300 text-sm font-semibold">Skal konsolideres til ét system: tags_normalized (793 tags)</span>
              </div>
            </div>
          </div>
        )}

        {/* ── ISSUES TAB ── */}
        {tab === "issues" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Issues — Klik for løsning</h2>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Critical" value={ISSUES.filter(i => i.type === "critical").length} color="red" />
              <Stat label="Warning" value={ISSUES.filter(i => i.type === "warning").length} color="amber" />
              <Stat label="Improvement" value={ISSUES.filter(i => i.type === "info").length} color="blue" />
            </div>
            <div className="space-y-3">
              {ISSUES.map((issue, i) => <IssueCard key={i} issue={issue} />)}
            </div>
          </div>
        )}

        {/* ── MIGRATION PLAN ── */}
        {tab === "plan" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Migration Roadmap — 6 uger</h2>
            <p className="text-slate-400">Fra 98% utaggede events + 53 place-tags → fuldt intelligent tag-system</p>

            {PHASES.map(phase => (
              <div key={phase.phase} className="rounded-2xl border border-white/10 bg-slate-800/40 overflow-hidden">
                <div className={`px-6 py-4 border-b border-white/10 bg-${phase.color}-950/30`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg bg-${phase.color}-500/20 text-${phase.color}-300`}>
                      {phase.phase}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{phase.title}</h3>
                      <span className="text-slate-400 text-sm">{phase.weeks}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-2.5">
                  {phase.tasks.map((t, i) => {
                    const statusColors = {
                      migration: "bg-amber-500/20 text-amber-300",
                      schema: "bg-blue-500/20 text-blue-300",
                      code: "bg-purple-500/20 text-purple-300",
                      import: "bg-green-500/20 text-green-300",
                      verify: "bg-rose-500/20 text-rose-300",
                    };
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-slate-500">{i + 1}</span>
                        </div>
                        <span className="text-slate-300 text-sm flex-1">{t.task}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${statusColors[t.status]}`}>{t.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* End result */}
            <div className="rounded-2xl border-2 border-green-500/30 bg-green-950/15 p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Zap className="text-green-400" size={20} />Slutresultat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p className="text-slate-300"><span className="text-green-400 font-bold">61K events tagget</span> — fra 1.6% til 100% tag-dækning</p>
                <p className="text-slate-300"><span className="text-green-400 font-bold">194K places tagget</span> — fra 53 til 793 mulige tags</p>
                <p className="text-slate-300"><span className="text-green-400 font-bold">Motor-steder importeret</span> — racerbaner, go-kart, MC-klubber</p>
                <p className="text-slate-300"><span className="text-green-400 font-bold">1 source of truth</span> — Supabase, ikke statiske filer</p>
                <p className="text-slate-300"><span className="text-green-400 font-bold">Alias-system</span> — MTB = mountain bike = mountainbike</p>
                <p className="text-slate-300"><span className="text-green-400 font-bold">Auto-tagger</span> — nye events/places tagges automatisk</p>
              </div>
            </div>
          </div>
        )}

        {/* ── AUTO-TAGGER TAB ── */}
        {tab === "autotag" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Auto-Tagger — Keyword→Tag Mapping</h2>
            <p className="text-slate-400">Sådan tagger vi 60K+ events automatisk baseret på category + title keywords</p>

            <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-6">
              <h3 className="text-lg font-bold mb-4">Event Title → Tags Mapping Rules</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-700">
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Title Keywords</th>
                      <th className="py-2 px-3">→ Maps to tags</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {AUTO_TAG_RULES.map((r, i) => (
                      <tr key={i} className="border-b border-slate-800/50">
                        <td className="py-2 px-3 font-mono text-xs">
                          <span className={`px-2 py-0.5 rounded ${
                            r.category === "motor" ? "bg-amber-900/40 text-amber-300" :
                            r.category === "musik" ? "bg-purple-900/40 text-purple-300" :
                            r.category === "sport" ? "bg-blue-900/40 text-blue-300" :
                            "bg-green-900/40 text-green-300"
                          }`}>{r.category}</span>
                        </td>
                        <td className="py-2 px-3 font-mono text-xs">{r.keywords.join(", ")}</td>
                        <td className="py-2 px-3">
                          <div className="flex flex-wrap gap-1">
                            {r.maps_to.map(t => (
                              <span key={t} className="px-1.5 py-0.5 rounded bg-green-900/30 text-green-300 text-xs font-mono">{t}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SQL Preview */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Database size={18} className="text-blue-400" /> Migration SQL Preview
              </h3>
              <pre className="bg-slate-950 rounded-xl p-4 text-sm text-green-300 overflow-x-auto font-mono leading-relaxed">{`-- Step 1: Tag alle motor-events med L1 category
INSERT INTO event_tags_normalized (event_id, tag_id)
SELECT e.id, t.id
FROM events e
CROSS JOIN tags_normalized t
WHERE e.category = 'motor'
  AND t.slug = 'motor-køretøjer'
ON CONFLICT DO NOTHING;

-- Step 2: Tag baseret på title keywords
INSERT INTO event_tags_normalized (event_id, tag_id)
SELECT e.id, t.id
FROM events e
CROSS JOIN tags_normalized t
WHERE e.category = 'motor'
  AND e.title ILIKE '%Track Day%'
  AND t.slug IN ('motorsport-aktiv','circuit-racing')
ON CONFLICT DO NOTHING;

-- Step 3: Migrate existing interest_tags → normalized
INSERT INTO event_tags_normalized (event_id, tag_id)
SELECT e.id, t.id
FROM events e, unnest(e.interest_tags) AS tag_slug
JOIN tags_normalized t ON t.slug = tag_slug
   OR t.slug IN (SELECT alias FROM tag_aliases
                  WHERE canonical = tag_slug)
ON CONFLICT DO NOTHING;

-- Step 4: Same for places
INSERT INTO place_tags (place_id, tag_id)
SELECT p.id, t.id
FROM places p, unnest(p.smart_tags) AS stag
JOIN tag_smart_mapping m ON m.smart_tag = stag
JOIN tags_normalized t ON t.slug = m.normalized_slug
ON CONFLICT DO NOTHING;`}</pre>
            </div>

            {/* Expected results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-green-500/20 bg-green-950/15 p-5">
                <h4 className="font-bold text-green-300 mb-3">Før migration</h4>
                <div className="space-y-2 text-sm text-slate-400">
                  <div>Events med tags: ~1.000 (1.6%)</div>
                  <div>event_tags_normalized: 0 rækker</div>
                  <div>Places unikke tags: 53</div>
                  <div>Motor-steder: 0</div>
                </div>
              </div>
              <div className="rounded-xl border border-green-500/30 bg-green-950/25 p-5">
                <h4 className="font-bold text-green-300 mb-3">Efter migration</h4>
                <div className="space-y-2 text-sm text-green-200">
                  <div>Events med tags: 61.212 (100%)</div>
                  <div>event_tags_normalized: ~180.000 rækker</div>
                  <div>Places unikke tags: 200+ (fra 793)</div>
                  <div>Motor-steder: 500+ (fra OSM import)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
