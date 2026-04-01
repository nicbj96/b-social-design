import { ArrowLeft, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";


interface HistoryEvent {
  id: string;
  title: string;
  emoji: string;
  location: string;
  month: string;
  type: "deltog" | "arrangerede" | "ambassadør";
  people: number;
}

const HISTORY: { period: string; events: HistoryEvent[] }[] = [
  {
    period: "Marts 2026",
    events: [
      { id: "h1", title: "Gåtur langs havnen", emoji: "🚶", location: "Havnefronten", month: "mar", type: "deltog", people: 5 },
      { id: "h2", title: "Brætspil-aften", emoji: "🎲", location: "Vestbyen", month: "mar", type: "deltog", people: 6 },
      { id: "h3", title: "Fodbold 5-mands", emoji: "⚽", location: "Kildeparken", month: "mar", type: "deltog", people: 5 },
      { id: "h4", title: "Kaffe og snak", emoji: "☕", location: "Aalborg C", month: "mar", type: "deltog", people: 2 },
    ],
  },
  {
    period: "Februar 2026",
    events: [
      { id: "h5", title: "Løbetur 5 km", emoji: "🏃", location: "Aalborg Øst", month: "feb", type: "deltog", people: 4 },
      { id: "h6", title: "Fællesspisning", emoji: "🍲", location: "Vestbyen", month: "feb", type: "arrangerede", people: 8 },
      { id: "h7", title: "Cykeltur til Nibe", emoji: "🚴", location: "Aalborg → Nibe", month: "feb", type: "deltog", people: 3 },
    ],
  },
  {
    period: "Januar 2026",
    events: [
      { id: "h8", title: "Brætspil — Catan marathon", emoji: "🎲", location: "Vestbyen", month: "jan", type: "arrangerede", people: 4 },
      { id: "h9", title: "Gåtur i Rold Skov", emoji: "🌲", location: "Rold Skov", month: "jan", type: "deltog", people: 6 },
    ],
  },
  {
    period: "December 2025",
    events: [
      { id: "h10", title: "Julefrokost med nye venner", emoji: "🎄", location: "Aalborg C", month: "dec", type: "arrangerede", people: 12 },
      { id: "h11", title: "Nytårsløb 3 km", emoji: "🏃", location: "Kildeparken", month: "dec", type: "ambassadør", people: 15 },
    ],
  },
];

const TYPE_BADGE: Record<string, { color: string; bgAlpha: string; labelKey: string }> = {
  deltog:      { color: "var(--teal)",      bgAlpha: "rgba(78,205,196,0.15)",  labelKey: "history.badge_attended" },
  arrangerede: { color: "#60a5fa",          bgAlpha: "rgba(96,165,250,0.15)",  labelKey: "history.badge_organized" },
  ambassadør:  { color: "#fbbf24",          bgAlpha: "rgba(251,191,36,0.15)",  labelKey: "history.badge_ambassador" },
};

/* ── Scoped CSS ── */
const historikCSS = `
${pageBase("hi")}

/* ── Hero background ── */
.hi-hero-bg {
  position: fixed; inset: 0; z-index: 0;
  background: url('/historik-hero.png') center/cover no-repeat;
}
.hi-hero-overlay {
  position: fixed; inset: 0; z-index: 0;
  background: linear-gradient(
    180deg,
    rgba(6,10,15,0.55) 0%,
    rgba(6,10,15,0.85) 40%,
    rgba(6,10,15,0.97) 100%
  );
}

/* ── Sticky header ── */
.hi-header {
  position: sticky; top: 0; z-index: 30;
  padding: 48px 20px 12px;
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(to bottom, rgba(6,10,15,0.95) 60%, transparent);
}
.hi-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; color: var(--pg-white);
}
.hi-back:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}
.hi-title {
  font-family: var(--serif);
  font-size: 22px; font-weight: 400;
  color: var(--pg-white);
}

/* ── Content wrapper ── */
.hi-content {
  position: relative; z-index: 1;
  padding: 8px 20px 96px;
  display: flex; flex-direction: column; gap: 28px;
}

/* ── Summary stats row ── */
.hi-summary {
  display: flex; gap: 0;
  border-radius: 16px; overflow: hidden;
}
.hi-stat-cell {
  flex: 1;
  padding: 18px 12px;
  text-align: center;
  position: relative;
}
.hi-stat-cell + .hi-stat-cell::before {
  content: '';
  position: absolute; left: 0; top: 20%; height: 60%;
  width: 1px; background: rgba(255,255,255,0.08);
}
.hi-stat-num {
  font-family: var(--serif);
  font-size: 26px; font-weight: 400;
  color: var(--pg-white); line-height: 1;
}
.hi-stat-label {
  font-size: 11px; color: var(--pg-white-muted);
  text-transform: uppercase; letter-spacing: 1.5px;
  margin-top: 6px;
}

/* ── Timeline ── */
.hi-timeline-group {
  display: flex; flex-direction: column; gap: 0;
}
.hi-period-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px;
}
.hi-period-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--teal);
  box-shadow: 0 0 12px var(--teal-glow);
  flex-shrink: 0;
}
.hi-period-label {
  font-family: var(--sans);
  font-size: 14px; font-weight: 600;
  color: var(--pg-white);
}
.hi-period-count {
  font-size: 12px; color: var(--pg-white-muted);
}

/* ── Timeline rail ── */
.hi-rail {
  margin-left: 4px;
  padding-left: 22px;
  border-left: 2px solid rgba(78,205,196,0.2);
  display: flex; flex-direction: column; gap: 10px;
  position: relative;
}

/* ── Event card ── */
.hi-event {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  position: relative;
}
.hi-event::before {
  content: '';
  position: absolute;
  left: -28px; top: 50%;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: rgba(6,10,15,0.9);
  border: 2px solid rgba(78,205,196,0.4);
  transform: translateY(-50%);
}
.hi-event:hover::before {
  background: var(--teal);
  border-color: var(--teal);
  box-shadow: 0 0 10px var(--teal-glow);
}
.hi-emoji-box {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.hi-event-body {
  flex: 1; min-width: 0;
}
.hi-event-top {
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}
.hi-event-title {
  font-size: 14px; font-weight: 600;
  color: var(--pg-white);
}
.hi-badge {
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px; font-weight: 700;
  line-height: 1.4;
}
.hi-event-meta {
  display: flex; align-items: center; gap: 8px;
}
.hi-event-loc {
  display: flex; align-items: center; gap: 3px;
  font-size: 12px; color: var(--pg-white-muted);
}
.hi-event-people {
  font-size: 12px; color: rgba(255,255,255,0.2);
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .hi-event-top { gap: 6px; }
  .hi-stat-num { font-size: 22px; }
}
`;

export default function Historik() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const containerRef = useFadeUp("hi");

  const totalEvents = HISTORY.reduce((sum, g) => sum + g.events.length, 0);
  const totalPeople = HISTORY.reduce((sum, g) => sum + g.events.reduce((s, e) => s + e.people, 0), 0);

  return (
    <>
      <style>{historikCSS}</style>
      <div
        ref={containerRef}
        className="hi-root"
        data-testid="historik-page"
      >
        {/* Hero background */}
        <div className="hi-hero-bg" />
        <div className="hi-hero-overlay" />

        {/* Sticky header */}
        <div className="hi-header">
          <button className="hi-back" onClick={() => setLocation("/min-side")}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="hi-title">{t('history.title')}</h1>
        </div>

        <div className="hi-content">
          {/* Summary stats */}
          <div className="hi-glass-strong hi-summary hi-fade-up">
            <div className="hi-stat-cell">
              <p className="hi-stat-num">{totalEvents}</p>
              <p className="hi-stat-label">{t('history.experiences')}</p>
            </div>
            <div className="hi-stat-cell">
              <p className="hi-stat-num">{totalPeople}</p>
              <p className="hi-stat-label">{t('history.people_met')}</p>
            </div>
            <div className="hi-stat-cell">
              <p className="hi-stat-num">{HISTORY.length}</p>
              <p className="hi-stat-label">{t('history.active_months')}</p>
            </div>
          </div>

          {/* Timeline */}
          {HISTORY.map((group, gi) => (
            <div key={group.period} className={`hi-timeline-group hi-fade-up hi-d${Math.min(gi + 1, 4)}`}>
              <div className="hi-period-header">
                <div className="hi-period-dot" />
                <h2 className="hi-period-label">{group.period}</h2>
                <span className="hi-period-count">{group.events.length} {t('history.experiences_count')}</span>
              </div>

              <div className="hi-rail">
                {group.events.map((event) => {
                  const badge = TYPE_BADGE[event.type];
                  return (
                    <div key={event.id} className="hi-glass hi-event">
                      <div className="hi-emoji-box">{event.emoji}</div>
                      <div className="hi-event-body">
                        <div className="hi-event-top">
                          <h3 className="hi-event-title">{event.title}</h3>
                          <span
                            className="hi-badge"
                            style={{ background: badge.bgAlpha, color: badge.color }}
                          >
                            {t(badge.labelKey)}
                          </span>
                        </div>
                        <div className="hi-event-meta">
                          <span className="hi-event-loc">
                            <MapPin size={10} />{event.location}
                          </span>
                          <span className="hi-event-people">&middot; {event.people} {t('history.persons')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
