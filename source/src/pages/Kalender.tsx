import { useState, useMemo } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import { fetchEvents, type Event as SupabaseEvent } from "@/lib/supabase";


const DAY_KEYS = ["calendar.day_mon", "calendar.day_tue", "calendar.day_wed", "calendar.day_thu", "calendar.day_fri", "calendar.day_sat", "calendar.day_sun"];
const MONTH_NAME_KEYS = ["calendar.month_january", "calendar.month_february", "calendar.month_march", "calendar.month_april", "calendar.month_may", "calendar.month_june", "calendar.month_july", "calendar.month_august", "calendar.month_september", "calendar.month_october", "calendar.month_november", "calendar.month_december"];

// Static fallback events
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
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function Kalender() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2); // March = 2
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch events from Supabase
  const { data: supabaseEvents, isLoading } = useQuery<SupabaseEvent[]>({
    queryKey: ["supabase-events"],
    queryFn: fetchEvents,
    staleTime: 2 * 60 * 1000, // 2 min — events change often
  });

  // Build combined event dates from Supabase + static
  const EVENT_DATES = useMemo(() => {
    const combined: Record<string, { title: string; emoji: string; type: string; fromDB?: boolean }[]> = { ...STATIC_EVENT_DATES };

    (supabaseEvents || []).forEach(evt => {
      if (!evt.date) return;
      const dateStr = evt.date.split("T")[0]; // "2026-03-20"
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

  // Get events for selected date or all upcoming
  const selectedEvents = selectedDate ? (EVENT_DATES[selectedDate] || []) : [];
  const upcomingEvents = Object.entries(EVENT_DATES)
    .filter(([date]) => date >= todayStr)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([date, events]) => events.map(e => ({ ...e, date })));

  return (
    <div
      className="relative min-h-svh pb-24"
      style={{ backgroundImage: `linear-gradient(to bottom, rgba(6,10,15,0.85), rgba(6,10,15,0.95)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}
      data-testid="kalender-page"
    >
      <div className="sticky top-0 z-30 pt-12 pb-3 px-5 flex items-center gap-3" style={{ background: "linear-gradient(to bottom, rgba(6,10,15,0.95) 60%, transparent)" }}>
        <button onClick={() => setLocation("/min-side")} className="w-9 h-9 rounded-full glass-card flex items-center justify-center"><ArrowLeft size={18} className="text-white" /></button>
        <h1 className="text-white text-xl font-serif" style={{ fontWeight: 400 }}>{t('calendar.title')}</h1>
        {isLoading && <Loader2 size={14} className="animate-spin text-[#4ECDC4]" />}
      </div>

      <div className="px-5 mt-2">
        {/* Calendar */}
        <div className="glass-card-strong rounded-3xl p-4 mb-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full glass-card flex items-center justify-center"><ChevronLeft size={16} className="text-white" /></button>
            <h2 className="text-white font-semibold text-sm">{t(MONTH_NAME_KEYS[month])} {year}</h2>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full glass-card flex items-center justify-center"><ChevronRight size={16} className="text-white" /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_KEYS.map(dk => <div key={dk} className="text-center text-white/40 text-xs font-medium">{t(dk)}</div>)}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
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
                  className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all relative ${
                    isSelected ? "bg-[#4ECDC4] text-[#0a0f1a]" :
                    isToday ? "bg-white/15 text-white" :
                    "text-white/60 hover:bg-white/10"
                  }`}
                >
                  {day}
                  {hasEvent && !isSelected && (
                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${hasDBEvent ? "bg-purple-400" : "bg-[#4ECDC4]"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events list */}
        <h2 className="text-white font-semibold text-sm mb-3">
          {selectedDate ? `${t('calendar.events_on')} ${parseInt(selectedDate.split("-")[2])}. ${t(MONTH_NAME_KEYS[parseInt(selectedDate.split("-")[1]) - 1])}` : t('calendar.upcoming_events')}
        </h2>

        {selectedDate && selectedEvents.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-center">
            <span className="text-2xl">📅</span>
            <p className="text-white/50 text-xs mt-2">{t('calendar.no_events_this_day')}</p>
          </div>
        )}

        {(selectedDate ? selectedEvents.map((e, i) => ({ ...e, date: selectedDate, _key: i })) : upcomingEvents.map((e, i) => ({ ...e, _key: i }))).map((event) => (
          <div key={event._key} className="glass-card rounded-2xl p-3 flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4ECDC4]/15 flex items-center justify-center text-xl flex-shrink-0">{event.emoji}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm font-semibold">{event.title}</h3>
              <p className="text-white/40 text-xs">{event.date.split("-").reverse().join("/")}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              (event as any).fromDB ? "bg-purple-500/20 text-purple-400" :
              event.type === "tilmeldt" ? "bg-[#4ECDC4]/20 text-[#4ECDC4]" :
              "bg-amber-500/20 text-amber-400"
            }`}>
              {(event as any).fromDB ? t('calendar.from_db') : event.type === "tilmeldt" ? t('calendar.registered') : t('calendar.waiting')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
