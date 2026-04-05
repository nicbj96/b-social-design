import { useState, useMemo, useRef } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Loader2, Search, Share2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import { fetchEvents, type Event as SupabaseEvent } from "@/lib/supabase";
import { MinSideSubNav } from "@/components/MinSideSubNav";
import { pageBase } from "@/lib/pageCSSBase";

/* ─────────────────────────────────────────────
   B-Social Kalender — Month Grid (Option A)
   Scoped CSS prefix: ka-
   ───────────────────────────────────────────── */

const DAY_KEYS = ["calendar.day_mon", "calendar.day_tue", "calendar.day_wed", "calendar.day_thu", "calendar.day_fri", "calendar.day_sat", "calendar.day_sun"];
const MONTH_NAME_KEYS = ["calendar.month_january", "calendar.month_february", "calendar.month_march", "calendar.month_april", "calendar.month_may", "calendar.month_june", "calendar.month_july", "calendar.month_august", "calendar.month_september", "calendar.month_october", "calendar.month_november", "calendar.month_december"];

const STATIC_EVENT_DATES: Record<string, { title: string; emoji: string; type: string }[]> = {
  "2026-03-16": [{ title: "Gåtur langs havnen", emoji: "🚶", type: "tilmeldt" }],
  "2026-03-18": [{ title: "Brætspil-aften", emoji: "🎲", type: "tilmeldt" }],
  "2026-03-20": [{ title: "Cykeltur til Nibe", emoji: "🚴", type: "venter" }],
  "2026-03-22": [{ title: "Kaffe og snak", emoji: "☕", type: "tilmeldt" }],
  "2026-03-25": [{ title: "Fodbold 5-mands", emoji: "⚽", type: "tilmeldt" }],
  "2026-03-28": [{ title: "Løbetur 5 km", emoji: "🏃", type: "tilmeldt" }],
  "2026-04-02": [{ title: "Lær guitar", emoji: "🎸", type: "venter" }],
  "2026-04-05": [{ title: "Aalborg Karneval", emoji: "🎭", type: "tilmeldt" }],
};

const CAT_EMOJI: Record<string, string> = {
  sport: "⚽", kultur: "🎭", natur: "🌿", musik: "🎵", "mad & drikke": "🍽️",
  spil: "🎲", loeb: "🏃", vandring: "🥾", fiskeri: "🎣", social: "❤️",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const kalenderCSS = `
${pageBase("ka")}

/* Override .dsk-main > * fadeSlideIn which sets opacity:0 */
.ka-root { animation: none !important; opacity: 1 !important; padding-bottom: 40px; }

/* ── Cover hero ── */
.ka-cover {
  position: relative; width: 100%; height: 220px; overflow: hidden;
}
.ka-cover img {
  width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;
}
.ka-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(6,10,15,0.25) 0%, rgba(6,10,15,0.92) 100%);
}

/* ── Identity block ── */
.ka-identity {
  display: flex; align-items: center; gap: 16px;
  margin-top: -32px; padding: 0 28px 24px; position: relative; z-index: 2;
}
.ka-identity-icon {
  width: 56px; height: 56px; border-radius: 14px;
  background: rgba(78,205,196,0.12); border: 1px solid rgba(78,205,196,0.25);
  display: flex; align-items: center; justify-content: center; font-size: 26px;
  flex-shrink: 0;
}
.ka-identity-text {}
.ka-identity-title {
  font-family: var(--serif); font-size: 26px; font-weight: 400;
  color: var(--pg-white); line-height: 1.1;
}
.ka-identity-title em { font-style: italic; color: var(--teal); }
.ka-identity-sub {
  font-size: 13px; color: var(--teal); margin-top: 2px; font-weight: 500;
}

/* ── Main two-column layout ── */
.ka-layout {
  display: grid; grid-template-columns: 1fr 280px; gap: 24px;
  padding: 0 28px 24px;
}
@media (max-width: 768px) {
  .ka-layout { grid-template-columns: 1fr; gap: 20px; padding: 0 12px 24px; }
  .ka-layout > * { min-width: 0; }
  .ka-identity { padding: 0 12px 20px; }
  .ka-calendar-card { padding: 14px 10px; }
  .ka-day-cell { font-size: 12px; border-radius: 8px; }
}

/* ── Calendar grid card ── */
.ka-calendar-card {
  background: rgba(255,255,255,0.04); backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.07); border-radius: 16px;
  padding: 20px;
}
.ka-month-nav {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.ka-month-btn {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.25s; color: var(--pg-white);
}
.ka-month-btn:hover { background: rgba(255,255,255,0.12); }
.ka-month-label {
  font-size: 15px; font-weight: 600; color: var(--pg-white);
}

/* ── Day headers ── */
.ka-day-headers {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 6px;
}
.ka-day-header {
  text-align: center; font-size: 11px; font-weight: 600;
  color: var(--pg-white-muted); padding: 6px 0;
  text-transform: uppercase; letter-spacing: 0.5px;
}

/* ── Calendar days grid ── */
.ka-days-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
}
.ka-day-cell {
  width: 100%; aspect-ratio: 1; border-radius: 10px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.2s; position: relative; border: none; background: transparent;
  color: var(--pg-white-dim);
}
.ka-day-cell:hover { background: rgba(255,255,255,0.06); }
.ka-day-today {
  background: rgba(78,205,196,0.12); color: var(--teal);
  border: 1px solid rgba(78,205,196,0.25);
}
.ka-day-selected {
  background: var(--teal); color: var(--bg); font-weight: 700;
}
.ka-day-dot {
  position: absolute; bottom: 5px; width: 4px; height: 4px; border-radius: 50%;
  background: var(--teal);
}
.ka-day-dot-db { background: #a78bfa; }

/* ── Hint text ── */
.ka-hint {
  font-size: 12px; color: var(--pg-white-muted); margin-top: 14px;
  font-style: italic;
}

/* ── Events sidebar ── */
.ka-events-panel {}
.ka-events-title {
  font-family: var(--serif); font-size: 20px; font-weight: 400;
  color: var(--pg-white); margin-bottom: 16px;
}
.ka-events-title em { font-style: italic; color: var(--teal); }

.ka-event-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: all 0.2s;
}
.ka-event-item:last-child { border-bottom: none; }
.ka-event-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(78,205,196,0.1); border: 1px solid rgba(78,205,196,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0; overflow: hidden;
}
.ka-event-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ka-event-info { flex: 1; min-width: 0; }
.ka-event-name {
  font-size: 14px; font-weight: 500; color: var(--pg-white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ka-event-name.ka-teal { color: var(--teal); }
.ka-event-date-label {
  font-size: 11px; color: var(--pg-white-muted); margin-top: 1px;
}

/* ── Empty state ── */
.ka-empty {
  padding: 32px; border-radius: 16px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  text-align: center;
}
.ka-empty-emoji { font-size: 28px; }
.ka-empty-text { font-size: 12px; color: var(--pg-white-dim); margin-top: 8px; }

/* ── Bottom bar ── */
.ka-bottom-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px; margin-top: 20px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
}
.ka-search-group {
  flex: 1; display: flex; align-items: center; gap: 8px;
}
.ka-search-icon { color: var(--pg-white-muted); flex-shrink: 0; }
.ka-search-input {
  flex: 1; background: none; border: none; outline: none;
  color: var(--pg-white); font-size: 13px; font-family: var(--sans);
}
.ka-search-input::placeholder { color: var(--pg-white-muted); }
.ka-search-btn {
  padding: 6px 18px; background: var(--teal); color: var(--bg);
  border: none; border-radius: 100px; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.25s; font-family: var(--sans);
}
.ka-search-btn:hover { box-shadow: 0 4px 16px var(--teal-glow); }
.ka-share-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 100px;
  color: var(--pg-white-dim); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.25s; font-family: var(--sans);
}
.ka-share-btn:hover { border-color: var(--teal); color: var(--teal); }

/* ── Mobile tweaks ── */
@media (max-width: 768px) {
  .ka-root { padding-bottom: 96px; }
  .ka-cover { height: 180px; }
  .ka-bottom-bar { margin: 16px 16px 0; }
}
`;

export default function Kalender() {
  const { t } = useTranslation();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // April = index 3
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: supabaseEvents, isLoading } = useQuery<SupabaseEvent[]>({
    queryKey: ["supabase-events"],
    queryFn: fetchEvents,
    staleTime: 2 * 60 * 1000,
  });

  const EVENT_DATES = useMemo(() => {
    const combined: Record<string, { title: string; emoji: string; type: string; fromDB?: boolean; eventId?: string }[]> = { ...STATIC_EVENT_DATES };
    (supabaseEvents || []).forEach(evt => {
      if (!evt.date) return;
      const dateStr = evt.date.split("T")[0];
      const emoji = CAT_EMOJI[(evt.category || "").toLowerCase()] || "📅";
      const entry = { title: evt.title, emoji, type: "event", fromDB: true, eventId: evt.id };
      if (!combined[dateStr]) combined[dateStr] = [];
      combined[dateStr].push(entry);
    });
    return combined;
  }, [supabaseEvents]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const selectedEvents = selectedDate ? (EVENT_DATES[selectedDate] || []) : [];
  const upcomingEvents = Object.entries(EVENT_DATES)
    .filter(([date]) => date >= todayStr)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([date, events]) => events.map(e => ({ ...e, date })))
    .slice(0, 6);

  const formatEventDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    return `${t(MONTH_NAME_KEYS[parseInt(m) - 1])} ${parseInt(d)}, ${y}`;
  };

  return (
    <>
      <style>{kalenderCSS}</style>
      <div className="ka-root" ref={containerRef} data-testid="kalender-page">

        {/* ── COVER HERO ── */}
        <div className="ka-cover">
          <img src="/kalender-hero.png" alt="" loading="lazy" />
          <div className="ka-cover-overlay" />
        </div>

        {/* ── IDENTITY ── */}
        <div className="ka-identity">
          <div className="ka-identity-icon">📅</div>
          <div className="ka-identity-text">
            <h1 className="ka-identity-title">Min <em>Kalender</em></h1>
            <p className="ka-identity-sub">{t(MONTH_NAME_KEYS[month])} {year}</p>
          </div>
        </div>

        <MinSideSubNav />

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="ka-layout">

          {/* Left: Calendar Grid */}
          <div>
            <div className="ka-calendar-card">
              <div className="ka-month-nav">
                <button className="ka-month-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
                <span className="ka-month-label">{t(MONTH_NAME_KEYS[month])} {year}</span>
                <button className="ka-month-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
              </div>

              <div className="ka-day-headers">
                {DAY_KEYS.map(dk => <div key={dk} className="ka-day-header">{t(dk)}</div>)}
              </div>

              <div className="ka-days-grid">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const hasEvent = !!EVENT_DATES[dateStr];
                  const hasDBEvent = (EVENT_DATES[dateStr] || []).some(e => (e as any).fromDB);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`ka-day-cell ${isSelected ? 'ka-day-selected' : isToday ? 'ka-day-today' : ''}`}
                    >
                      {day}
                      {hasEvent && !isSelected && (
                        <span className={`ka-day-dot ${hasDBEvent ? 'ka-day-dot-db' : ''}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="ka-hint">
                {selectedDate
                  ? `${t('calendar.events_on')} ${parseInt(selectedDate.split("-")[2])}. ${t(MONTH_NAME_KEYS[parseInt(selectedDate.split("-")[1]) - 1])}`
                  : t('calendar.click_date', { defaultValue: 'Klik på en dato for at se events.' })
                }
              </p>
            </div>

            {/* ── Bottom bar ── */}
            <div className="ka-bottom-bar">
              <div className="ka-search-group">
                <Search size={14} className="ka-search-icon" />
                <input
                  className="ka-search-input"
                  placeholder="Events"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button className="ka-search-btn">Søge</button>
              </div>
              <button className="ka-share-btn">
                <Share2 size={12} /> Deler
              </button>
            </div>
          </div>

          {/* Right: Events Panel */}
          <div className="ka-events-panel">
            <h2 className="ka-events-title">
              {selectedDate
                ? <>Events d. <em>{parseInt(selectedDate.split("-")[2])}. {t(MONTH_NAME_KEYS[parseInt(selectedDate.split("-")[1]) - 1])}</em></>
                : <>Tilmeldte <em>events</em></>
              }
              {isLoading && <Loader2 size={14} className="animate-spin" style={{ display: 'inline', marginLeft: 8 }} />}
            </h2>

            {selectedDate && selectedEvents.length === 0 && (
              <div className="ka-empty">
                <span className="ka-empty-emoji">📅</span>
                <p className="ka-empty-text">{t('calendar.no_events_this_day')}</p>
              </div>
            )}

            {(selectedDate ? selectedEvents.map((e, i) => ({ ...e, date: selectedDate, _key: i })) : upcomingEvents.map((e, i) => ({ ...e, _key: i }))).map((event) => {
              const eventId = (event as any).eventId;
              const inner = (
                <>
                  <div className="ka-event-avatar">{event.emoji}</div>
                  <div className="ka-event-info">
                    <div className={`ka-event-name ${(event as any).fromDB ? 'ka-teal' : ''}`}>
                      {event.title}
                    </div>
                    <div className="ka-event-date-label">{formatEventDate(event.date)}</div>
                  </div>
                </>
              );
              return eventId ? (
                <Link key={event._key} href={`/event/${eventId}`} className="ka-event-item" style={{ textDecoration: "none", color: "inherit" }}>
                  {inner}
                </Link>
              ) : (
                <div key={event._key} className="ka-event-item">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
