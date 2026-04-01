import { useState } from "react";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";


interface Note {
  id: string;
  title: string;
  content: string;
  emoji: string;
  type: "event" | "person" | "ide";
  tag: string;
}

const DEMO_NOTES: Note[] = [
  {
    id: "n1",
    title: "Br\u00e6tspil-aften",
    content: "Mads havde Settlers of Catan med \u2014 virkelig sjov aften. Husk at sp\u00f8rge om Ticket to Ride n\u00e6ste gang.",
    emoji: "\uD83C\uDFB2",
    type: "event",
    tag: "Spil",
  },
  {
    id: "n2",
    title: "Anna fra g\u00e5turen",
    content: "Arbejder p\u00e5 universitetet. Interesseret i vandring og fotografi. Vil gerne med p\u00e5 Rold Skov-turen.",
    emoji: "\uD83D\uDC69",
    type: "person",
    tag: "Kontakt",
  },
  {
    id: "n3",
    title: "Cykeltur til Nibe",
    content: "Smuk rute langs fjorden. Husk vand og solcreme. Tager ca. 1.5 time i roligt tempo. God caf\u00e9 i Nibe havn.",
    emoji: "\uD83D\uDEB4",
    type: "event",
    tag: "Sport",
  },
  {
    id: "n4",
    title: "Ide: F\u00e6llesspisning",
    content: "T\u00e6nker vi kunne lave en f\u00e6llesspisning i Vestbyen. Evt. thai-mad. Sp\u00f8rg Sofie om hun vil hj\u00e6lpe med at arrangere.",
    emoji: "\uD83D\uDCA1",
    type: "ide",
    tag: "Ide",
  },
  {
    id: "n5",
    title: "Emil \u2014 kaffe-m\u00f8de",
    content: "Ny i Aalborg, flyttet fra K\u00f8benhavn. Arbejder som designer. God energi. Vil gerne med til br\u00e6tspil n\u00e6ste gang.",
    emoji: "\u2615",
    type: "person",
    tag: "Kontakt",
  },
  {
    id: "n6",
    title: "Fodbold 5-mands",
    content: "Kildeparken er perfekt. Vi var 5 i alt \u2014 alle niveauer. Jonas er den faste organisator. N\u00e6ste gang torsdag.",
    emoji: "\u26BD",
    type: "event",
    tag: "Sport",
  },
  {
    id: "n7",
    title: "Fantastisk g\u00e5tur ved havnen",
    content: "Gik fra Utzon Center til Vestre Fjordpark. Fantastisk udsigt over Limfjorden. M\u00f8dte Anna p\u00e5 vejen \u2014 vi snakkede om at g\u00f8re det igen n\u00e6ste weekend.",
    emoji: "\uD83C\uDF0A",
    type: "event",
    tag: "G\u00e5tur",
  },
  {
    id: "n8",
    title: "Skal pr\u00f8ve MTB i Hammer Bakker",
    content: "Mads anbefalede Hammer Bakker til mountainbike. Bl\u00e5 rute er god for begyndere, r\u00f8d rute er mere teknisk. Husk hjelm og ekstra slange.",
    emoji: "\uD83D\uDEB5",
    type: "ide",
    tag: "Sport",
  },
];

const TYPE_META: Record<string, { accent: string; glow: string; labelKey: string }> = {
  event: { accent: "#4ECDC4", glow: "rgba(78,205,196,0.25)", labelKey: "notes.type_experience" },
  person: { accent: "#60a5fa", glow: "rgba(96,165,250,0.25)", labelKey: "notes.type_person" },
  ide: { accent: "#fbbf24", glow: "rgba(251,191,36,0.25)", labelKey: "notes.type_idea" },
};

/* ── Scoped CSS ── */
const noterCSS = `
${pageBase("nt")}

/* ── Header bar ── */
.nt-header {
  position: sticky; top: 0; z-index: 30;
  padding: 48px 20px 12px;
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(to bottom, rgba(6,10,15,0.97) 60%, transparent);
}
.nt-back {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  color: var(--pg-white); cursor: pointer; transition: all 0.3s;
  flex-shrink: 0;
}
.nt-back:hover { border-color: var(--teal); color: var(--teal); }
.nt-title {
  flex: 1; font-family: var(--serif); font-size: 22px;
  font-weight: 400; color: var(--pg-white);
}
.nt-add {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--teal); border: none; color: var(--bg);
  cursor: pointer; transition: all 0.3s; flex-shrink: 0;
}
.nt-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px var(--teal-glow);
}

/* ── Content wrapper ── */
.nt-body { padding: 8px 20px 96px; }

/* ── Search bar ── */
.nt-search-wrap {
  position: relative; margin-bottom: 16px;
}
.nt-search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.35); pointer-events: none;
}
.nt-search {
  width: 100%; padding: 12px 40px 12px 40px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; color: var(--pg-white);
  font-size: 14px; font-family: var(--sans);
  outline: none; transition: border-color 0.3s, box-shadow 0.3s;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
.nt-search:focus {
  border-color: rgba(78,205,196,0.45);
  box-shadow: 0 0 0 3px rgba(78,205,196,0.08);
}
.nt-search::placeholder { color: rgba(255,255,255,0.28); }
.nt-search-clear {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: rgba(255,255,255,0.35);
  cursor: pointer; padding: 0; display: flex; align-items: center;
  transition: color 0.2s;
}
.nt-search-clear:hover { color: var(--teal); }

/* ── Filter chips ── */
.nt-filters {
  display: flex; gap: 8px; margin-bottom: 20px;
  overflow-x: auto; scrollbar-width: none;
  -ms-overflow-style: none;
}
.nt-filters::-webkit-scrollbar { display: none; }
.nt-filter {
  padding: 7px 16px; border-radius: 100px;
  font-size: 12px; font-weight: 500; font-family: var(--sans);
  white-space: nowrap; cursor: pointer; transition: all 0.25s;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.45);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.nt-filter:hover { color: var(--pg-white); border-color: rgba(255,255,255,0.15); }
.nt-filter--active {
  background: var(--teal); color: var(--bg);
  border-color: var(--teal); font-weight: 600;
}

/* ── Notes grid ── */
.nt-list { display: flex; flex-direction: column; gap: 12px; }

/* ── Note card ── */
.nt-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px; padding: 18px;
  display: flex; align-items: flex-start; gap: 14px;
  transition: background 0.3s, border-color 0.3s, transform 0.3s, box-shadow 0.3s;
  cursor: default;
}
.nt-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.14);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

/* ── Note emoji icon ── */
.nt-icon {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 20px;
  transition: box-shadow 0.3s;
}

/* ── Note content ── */
.nt-card-body { flex: 1; min-width: 0; }
.nt-card-head {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 4px; flex-wrap: wrap;
}
.nt-card-title {
  font-size: 14px; font-weight: 600; color: var(--pg-white);
  font-family: var(--sans);
}
.nt-card-badge {
  padding: 2px 8px; border-radius: 100px;
  font-size: 10px; font-weight: 700; font-family: var(--sans);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.nt-card-text {
  font-size: 13px; color: rgba(255,255,255,0.5);
  line-height: 1.55; font-family: var(--sans);
}
.nt-card-tag {
  display: block; margin-top: 8px;
  font-size: 11px; color: rgba(255,255,255,0.2);
  font-family: var(--sans); letter-spacing: 0.3px;
}

/* ── Empty state ── */
.nt-empty {
  text-align: center; padding: 48px 20px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
}
.nt-empty-icon { font-size: 36px; margin-bottom: 8px; }
.nt-empty-text {
  font-size: 14px; color: rgba(255,255,255,0.45);
  font-family: var(--sans);
}

/* ── Stagger delays for cards ── */
.nt-d0 { transition-delay: 0.04s; }
.nt-d1 { transition-delay: 0.08s; }
.nt-d2 { transition-delay: 0.12s; }
.nt-d3 { transition-delay: 0.16s; }
.nt-d4 { transition-delay: 0.20s; }
.nt-d5 { transition-delay: 0.24s; }
.nt-d6 { transition-delay: 0.28s; }
.nt-d7 { transition-delay: 0.32s; }
`;

export default function Noter() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const containerRef = useFadeUp("nt");

  const filtered = DEMO_NOTES.filter((n) => {
    const matchType = !activeType || n.type === activeType;
    const matchSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <>
      <style>{noterCSS}</style>
      <div
        className="nt-root"
        ref={containerRef}
        data-testid="noter-page"
      >
        {/* ── Header ── */}
        <div className="nt-header nt-fade-up">
          <button onClick={() => setLocation("/min-side")} className="nt-back">
            <ArrowLeft size={18} />
          </button>
          <h1 className="nt-title">{t('notes.title')}</h1>
          <button className="nt-add">
            <Plus size={18} />
          </button>
        </div>

        <div className="nt-body">
          {/* ── Search ── */}
          <div className="nt-search-wrap nt-fade-up nt-d1">
            <span className="nt-search-icon"><Search size={15} /></span>
            <input
              type="text"
              placeholder={t('notes.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="nt-search"
              data-testid="input-search-notes"
            />
            {search && (
              <button onClick={() => setSearch("")} className="nt-search-clear">
                <X size={14} />
              </button>
            )}
          </div>

          {/* ── Type filters ── */}
          <div className="nt-filters nt-fade-up nt-d2">
            {[
              { key: null, labelKey: "notes.filter_all", count: DEMO_NOTES.length },
              { key: "event", labelKey: "notes.filter_experiences", count: DEMO_NOTES.filter(n => n.type === "event").length },
              { key: "person", labelKey: "notes.filter_persons", count: DEMO_NOTES.filter(n => n.type === "person").length },
              { key: "ide", labelKey: "notes.filter_ideas", count: DEMO_NOTES.filter(n => n.type === "ide").length },
            ].map((f) => (
              <button
                key={f.key || "alle"}
                onClick={() => setActiveType(f.key)}
                className={`nt-filter${activeType === f.key ? " nt-filter--active" : ""}`}
              >
                {t(f.labelKey)} ({f.count})
              </button>
            ))}
          </div>

          {/* ── Notes list ── */}
          <div className="nt-list">
            {filtered.map((note, i) => {
              const meta = TYPE_META[note.type];
              return (
                <div
                  key={note.id}
                  className={`nt-card nt-fade-up nt-d${Math.min(i, 7)}`}
                  style={{ borderLeft: `3px solid ${meta.accent}` }}
                >
                  <div
                    className="nt-icon"
                    style={{
                      background: `${meta.accent}15`,
                      boxShadow: `0 0 20px ${meta.glow}`,
                    }}
                  >
                    {note.emoji}
                  </div>
                  <div className="nt-card-body">
                    <div className="nt-card-head">
                      <span className="nt-card-title">{note.title}</span>
                      <span
                        className="nt-card-badge"
                        style={{
                          background: `${meta.accent}18`,
                          color: meta.accent,
                        }}
                      >
                        {t(meta.labelKey)}
                      </span>
                    </div>
                    <p className="nt-card-text">{note.content}</p>
                    <span className="nt-card-tag">{note.tag}</span>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="nt-empty nt-fade-up">
                <div className="nt-empty-icon">{"\uD83D\uDCDD"}</div>
                <p className="nt-empty-text">{t('notes.no_notes_found')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
