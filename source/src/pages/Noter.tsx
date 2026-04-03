import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { PenLine, Star, Clock, Tag } from "lucide-react";
import { MinSideSubNav } from "@/components/MinSideSubNav";
import { pageBase } from "@/lib/pageCSSBase";

/* ─────────────────────────────────────────────
   B-Social Noter — Design B: Journal / List
   Scoped CSS prefix: nt-
   ───────────────────────────────────────────── */

/* ── Types ── */
interface PinnedNote {
  id: string;
  title: string;
  body: string;
  time: string;
  color: string;
}

interface NoteEntry {
  id: string;
  title: string;
  body: string;
  time: string;
  color: string;
  tags: { label: string; color: string }[];
}

interface RecentNote {
  id: string;
  title: string;
  time: string;
}

/* ── Mock data ── */
const PINNED: PinnedNote[] = [
  {
    id: "p1",
    title: "Projektideer",
    body: "Brainstorm for ny app — undersøg marked for lokale events.",
    time: "2t siden",
    color: "#4ECDC4",
  },
  {
    id: "p2",
    title: "Mødenotater",
    body: "Status fra fredag — næste sprint handler om notifikationer.",
    time: "5t siden",
    color: "#a78bfa",
  },
  {
    id: "p3",
    title: "Madplan",
    body: "Mandag: pasta. Tirsdag: kylling-wok. Onsdag: fisk.",
    time: "1d siden",
    color: "#f97316",
  },
];

const NOTES: NoteEntry[] = [
  {
    id: "n1",
    title: "Ideer til blogindlæg",
    body: "Udarbejdelse af content kalender — skriv om lokale initiativer og community-building i Nordjylland.",
    time: "10m siden",
    color: "#4ECDC4",
    tags: [
      { label: "Content", color: "#4ECDC4" },
      { label: "Blog", color: "#60a5fa" },
    ],
  },
  {
    id: "n2",
    title: "Boglæsning",
    body: "Noter fra 'Sapiens' kap. 3 — landbrugsrevolutionen og dens sociale konsekvenser.",
    time: "25m siden",
    color: "#60a5fa",
    tags: [
      { label: "Litteratur", color: "#a78bfa" },
      { label: "Historie", color: "#f59e0b" },
    ],
  },
  {
    id: "n3",
    title: "Træningsprogram",
    body: "Skema for 'Sapiens' kap. 3 — 4-split program med fokus på styrke og kondition.",
    time: "1t siden",
    color: "#ec4899",
    tags: [
      { label: "Sundhed", color: "#ec4899" },
      { label: "Fitness", color: "#f97316" },
    ],
  },
  {
    id: "n4",
    title: "Rejseplanlægning",
    body: "Research til sommer i Norditalien — Como-søen, Cinque Terre, lokale restauranter.",
    time: "3t siden",
    color: "#f97316",
    tags: [
      { label: "Rejse", color: "#f97316" },
      { label: "Planlægning", color: "#4ECDC4" },
    ],
  },
  {
    id: "n5",
    title: "Podcast-noter",
    body: "Episode om kreativitet og flow — vigtigt citat om daglige rutiner og morgenritualer.",
    time: "5t siden",
    color: "#a78bfa",
    tags: [
      { label: "Inspiration", color: "#a78bfa" },
      { label: "Kreativitet", color: "#ec4899" },
    ],
  },
];

const RECENT: RecentNote[] = [
  { id: "r1", title: "Nye funktioner i app", time: "2d siden" },
  { id: "r2", title: "Feedback fra brugere", time: "3d siden" },
  { id: "r3", title: "OpenIT-projekt", time: "5d siden" },
];

/* ── Scoped CSS ── */
const noterCSS = `
${pageBase("nt")}

/* ── Header ── */
.nt-header {
  padding: 40px 20px 0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.nt-header-icon {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(78,205,196,0.12);
  color: var(--teal);
  flex-shrink: 0;
}
.nt-header-text { flex: 1; }
.nt-title {
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 400;
  color: var(--pg-white);
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.nt-subtitle {
  font-size: 13px;
  color: var(--teal);
  font-weight: 500;
  margin-top: 4px;
  letter-spacing: 0.5px;
}

/* ── Back link ── */
.nt-back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 20px 20px 0;
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  text-decoration: none;
  font-family: var(--sans);
  transition: color 0.2s;
}
.nt-back-link:hover { color: var(--teal); }

/* ── Section label ── */
.nt-section-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 24px 20px 10px;
  font-family: var(--sans);
}

/* ── Pinned row ── */
.nt-pinned-row {
  display: flex;
  gap: 12px;
  padding: 0 20px 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.nt-pinned-row::-webkit-scrollbar { display: none; }

.nt-pinned-card {
  min-width: 155px;
  max-width: 180px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: background 0.3s, border-color 0.3s, transform 0.3s;
  position: relative;
  overflow: hidden;
}
.nt-pinned-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
}
.nt-pinned-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.14);
  transform: translateY(-2px);
}
.nt-pinned-star {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.nt-pinned-star svg {
  flex-shrink: 0;
}
.nt-pinned-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--pg-white);
  font-family: var(--sans);
}
.nt-pinned-body {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  line-height: 1.4;
  margin-top: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--sans);
}
.nt-pinned-time {
  font-size: 10px;
  color: rgba(255,255,255,0.25);
  margin-top: 8px;
  font-family: var(--sans);
}

/* ── Note list entries ── */
.nt-body { padding: 0 20px 96px; }

.nt-list { display: flex; flex-direction: column; gap: 10px; }

.nt-entry {
  display: flex;
  align-items: stretch;
  gap: 14px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: background 0.3s, border-color 0.3s, transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;
}
.nt-entry:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.14);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

/* Left color bar */
.nt-entry-bar {
  width: 4px;
  border-radius: 4px;
  flex-shrink: 0;
  align-self: stretch;
}

.nt-entry-content { flex: 1; min-width: 0; }

.nt-entry-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--pg-white);
  font-family: var(--sans);
  line-height: 1.3;
}
.nt-entry-body {
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  line-height: 1.5;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--sans);
}
.nt-entry-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}
.nt-entry-time {
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--sans);
}

/* Tags area on the right */
.nt-entry-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
}
.nt-tag-pill {
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 600;
  font-family: var(--sans);
  white-space: nowrap;
  letter-spacing: 0.3px;
}

/* ── Recent notes section ── */
.nt-recent-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 20px 32px;
}
.nt-recent-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  transition: background 0.2s;
}
.nt-recent-row:last-child { border-bottom: none; }
.nt-recent-row:hover { opacity: 0.8; }
.nt-recent-title {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  font-family: var(--sans);
}
.nt-recent-time {
  font-size: 11px;
  color: rgba(255,255,255,0.2);
  font-family: var(--sans);
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .nt-header { padding: 32px 16px 0; }
  .nt-section-label { padding-left: 16px; padding-right: 16px; }
  .nt-pinned-row { padding: 0 16px 8px; }
  .nt-body { padding: 0 16px 96px; }
  .nt-back-link { margin-left: 16px; margin-right: 16px; }
  .nt-recent-list { padding: 0 16px 32px; }
  .nt-title { font-size: 24px; }
}
`;

export default function Noter() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <style>{noterCSS}</style>
      <div
        ref={containerRef}
        className="nt-root"
        data-testid="noter-page"
      >
        <MinSideSubNav />

        {/* ── Header ── */}
        <div className="nt-header">
          <div className="nt-header-icon">
            <PenLine size={22} />
          </div>
          <div className="nt-header-text">
            <h1 className="nt-title">{t("notes.title", "Noter")}</h1>
            <p className="nt-subtitle">{t("notes.subtitle", "Personlig journal")}</p>
          </div>
        </div>

        {/* ── Pinned notes ── */}
        <div className="nt-section-label">{t("notes.pinned", "Pinned noter")}</div>
        <div className="nt-pinned-row">
          {PINNED.map((pin) => (
            <div
              key={pin.id}
              className="nt-pinned-card"
              style={{ borderTop: `3px solid ${pin.color}` } as React.CSSProperties}
            >
              <div className="nt-pinned-star">
                <Star size={12} style={{ color: pin.color }} fill={pin.color} />
                <span className="nt-pinned-title">{pin.title}</span>
              </div>
              <p className="nt-pinned-body">{pin.body}</p>
              <span className="nt-pinned-time">{pin.time}</span>
            </div>
          ))}
        </div>

        {/* ── Main note entries ── */}
        <div className="nt-section-label">{t("notes.all_notes", "Alle noter")}</div>
        <div className="nt-body">
          <div className="nt-list">
            {NOTES.map((note) => (
              <div key={note.id} className="nt-entry">
                <div
                  className="nt-entry-bar"
                  style={{ background: note.color }}
                />
                <div className="nt-entry-content">
                  <div className="nt-entry-title">{note.title}</div>
                  <p className="nt-entry-body">{note.body}</p>
                  <div className="nt-entry-meta">
                    <span className="nt-entry-time">
                      <Clock size={10} />
                      {note.time}
                    </span>
                  </div>
                </div>
                <div className="nt-entry-tags">
                  {note.tags.map((tag) => (
                    <span
                      key={tag.label}
                      className="nt-tag-pill"
                      style={{
                        background: `${tag.color}18`,
                        color: tag.color,
                      }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Seneste noter ── */}
        <div className="nt-section-label">{t("notes.recent", "Seneste noter")}</div>
        <div className="nt-recent-list">
          {RECENT.map((r) => (
            <div key={r.id} className="nt-recent-row">
              <span className="nt-recent-title">{r.title}</span>
              <span className="nt-recent-time">{r.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
