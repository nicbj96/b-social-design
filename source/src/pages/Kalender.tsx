import { useState, useMemo } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import { fetchEvents, type Event as SupabaseEvent } from "@/lib/supabase";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ─────────────────────────────────────────────
   B-Social Kalender — Premium Redesign
   Scoped CSS prefix: kl-
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
${pageBase("kl")}

.kl-root {
  background-image: linear-gradient(to bottom, rgba(6,10,15,0.85), rgba(6,10,15,0.95)),
    url('/kalender-hero.png');
  background-size: cover; background-position: center; background-attachment: fixed;
}

/* ── Sticky header ── */
.kl-header {
  position: sticky; top: 0; z-index: 30;
  padding: 48px 20px 12px;
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(to bottom, rgba(6,10,15,0.95) 60%, transparent);
}
.kl-back-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; color: var(--pg-white);
}
.kl-back-btn:hover { background: rgba(255,255,255,0.12); }
.kl-page-title {
  font-family: var(--serif); font-size: 22px; font-weight: 400;
  color: var(--pg-white);
}

/* ── Calendar grid card ── */
.kl-calendar-card {
  background: rgba(255,255,255,0.06); backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
  padding: 16px; margin-bottom: 24px;
}
.kl-month-nav {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.kl-month-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.25s; color: var(--pg-white);
}
.kl-month-btn:hover { background: rgba(255,255,255,0.12); }
.kl-month-label {
  font-size: 14px; font-weight: 600; color: var(--pg-white);
}

/* ── Day headers ── */
.kl-day-headers {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 8px;
}
.kl-day-header {
  text-align: center; font-size: 11px; font-weight: 500;
  color: var(--pg-white-muted);
}

/* ── Calendar days grid ── */
.kl-days-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
}
.kl-day-cell {
  width: 100%; aspect-ratio: 1; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.2s; position: relative; border: none; background: transparent;
  color: var(--pg-white-dim);
}
.kl-day-cell:hover { background: rgba(255,255,255,0.06); }
.kl-day-today { background: rgba(255,255,255,0.1); color: var(--pg-white); }
.kl-day-selected { background: var(--teal); color: var(--bg); }
.kl-day-dot {
  position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%;
  background: var(--teal);
}
.kl-day-dot-db { background: #a78bfa; }

/* ── Events section ── */
.kl-section-title {
  font-size: 14px; font-weight: 600; color: var(--pg-white); margin-bottom: 12px;
}

.kl-event-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 14px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  margin-bottom: 8px; transition: all 0.25s;
}
.kl-event-card:hover {
  background: var(--glass-bg-hover); border-color: var(--glass-border-hover);
}
.kl-event-emoji {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(78,205,196,0.1); border: 1px solid rgba(78,205,196,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.kl-event-info { flex: 1; min-width: 0; }
.kl-event-title {
  font-size: 14px; font-weight: 500; color: var(--pg-white);
}
.kl-event-date {
  font-size: 12px; color: var(--pg-white-muted); margin-top: 2px;
}
.kl-event-badge {
  padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600;
}
.kl-badge-registered { background: rgba(78,205,196,0.15); color: var(--teal); }
.kl-badge-waiting { background: rgba(245,158,11,0.15); color: #fbbf24; }
.kl-badge-db { background: rgba(167,139,250,0.15); color: #a78bfa; }

/* ── Empty state ── */
.kl-empty {
  padding: 32px; border-radius: 16px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  text-align: center;
}
.kl-empty-emoji { font-size: 28px; }
.kl-empty-text { font-size: 12px; color: var(--pg-white-dim); margin-top: 8px; }
`;

export default function Kalender() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const containerRef = useFadeUp("kl");

  const { data: supabaseEvents, isLoading } = useQuery<SupabaseEvent[]>({
    queryKey: ["supabase-events"],
    queryFn: fetchEvents,
    staleTime: 2 * 60 * 1000,
  });

  const EVENT_DATES = useMemo(() => {
    const combined: Record<string, { title: string; emoji: string; type: string; fromDB?: boolean }[]> = { ...STATIC_EVENT_DATES };
    (supabaseEvents || []).forEach(evt => {
      if (!evt.date) return;
      const dateStr = evt.date.split("T")[0];
      const emoji = CAT_EMOJI[(evt.category || "").toLowerCase()] || "📅";
      const entry = { title: evt.title, emoji, type: "event", fromDB: true };
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
    .flatMap(([date, events]) => events.map(e => ({ ...e, date })));

  return (
    <>
      <style>{kalenderCSS}</style>
      <div className="kl-root" ref={containerRef} data-testid="kalender-page">

        {/* ── Header ── */}
        <div className="kl-header">
          <button className="kl-back-btn" onClick={() => setLocation("/min-side")}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="kl-page-title">{t('calendar.title')}</h1>
          {isLoading && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--teal)' }} />}
        </div>

        <div style={{ padding: '0 20px', marginTop: 8 }}>

          {/* ── Calendar ── */}
          <div className="kl-calendar-card kl-fade-up">
            <div className="kl-month-nav">
              <button className="kl-month-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
              <span className="kl-month-label">{t(MONTH_NAME_KEYS[month])} {year}</span>
              <button className="kl-month-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
            </div>

            <div className="kl-day-headers">
              {DAY_KEYS.map(dk => <div key={dk} className="kl-day-header">{t(dk)}</div>)}
            </div>

            <div className="kl-days-grid">
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
                    className={`kl-day-cell ${isSelected ? 'kl-day-selected' : isToday ? 'kl-day-today' : ''}`}
                  >
                    {day}
                    {hasEvent && !isSelected && (
                      <span className={`kl-day-dot ${hasDBEvent ? 'kl-day-dot-db' : ''}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Events list ── */}
          <h2 className="kl-section-title kl-fade-up kl-d1">
            {selectedDate ? `${t('calendar.events_on')} ${parseInt(selectedDate.split("-")[2])}. ${t(MONTH_NAME_KEYS[parseInt(selectedDate.split("-")[1]) - 1])}` : t('calendar.upcoming_events')}
          </h2>

          {selectedDate && selectedEvents.length === 0 && (
            <div className="kl-empty kl-fade-up kl-d1">
              <span className="kl-empty-emoji">📅</span>
              <p className="kl-empty-text">{t('calendar.no_events_this_day')}</p>
            </div>
          )}

          <div className="kl-fade-up kl-d2">
            {(selectedDate ? selectedEvents.map((e, i) => ({ ...e, date: selectedDate, _key: i })) : upcomingEvents.map((e, i) => ({ ...e, _key: i }))).map((event) => (
              <div key={event._key} className="kl-event-card">
                <div className="kl-event-emoji">{event.emoji}</div>
                <div className="kl-event-info">
                  <div className="kl-event-title">{event.title}</div>
                  <div className="kl-event-date">{event.date.split("-").reverse().join("/")}</div>
                </div>
                <span className={`kl-event-badge ${
                  (event as any).fromDB ? 'kl-badge-db' :
                  event.type === "tilmeldt" ? 'kl-badge-registered' : 'kl-badge-waiting'
                }`}>
                  {(event as any).fromDB ? t('calendar.from_db') : event.type === "tilmeldt" ? t('calendar.registered') : t('calendar.waiting')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
