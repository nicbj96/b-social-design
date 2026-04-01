import { ArrowLeft, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';


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

const TYPE_BADGE: Record<string, { bg: string; text: string; labelKey: string }> = {
  deltog: { bg: "bg-[#4ECDC4]/15", text: "text-[#4ECDC4]", labelKey: "history.badge_attended" },
  arrangerede: { bg: "bg-blue-500/15", text: "text-blue-400", labelKey: "history.badge_organized" },
  ambassadør: { bg: "bg-amber-500/15", text: "text-amber-400", labelKey: "history.badge_ambassador" },
};

export default function Historik() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const totalEvents = HISTORY.reduce((sum, g) => sum + g.events.length, 0);
  const totalPeople = HISTORY.reduce((sum, g) => sum + g.events.reduce((s, e) => s + e.people, 0), 0);

  return (
    <div
      className="relative min-h-svh pb-24"
      style={{ background: "#060a0f" }}
      data-testid="historik-page"
    >
      <div className="sticky top-0 z-30 pt-12 pb-3 px-5 flex items-center gap-3" style={{ background: "linear-gradient(to bottom, rgba(6,10,15,0.95) 60%, transparent)" }}>
        <button onClick={() => setLocation("/min-side")} className="w-9 h-9 rounded-full glass-card flex items-center justify-center"><ArrowLeft size={18} className="text-white" /></button>
        <h1 className="text-white text-xl font-serif" style={{ fontWeight: 400 }}>{t('history.title')}</h1>
      </div>

      <div className="px-5 mt-2 space-y-5">
        {/* Summary card */}
        <div className="glass-card-strong rounded-2xl p-4 flex gap-4">
          <div className="flex-1 text-center">
            <p className="text-white text-xl font-bold">{totalEvents}</p>
            <p className="text-white/40 text-xs">{t('history.experiences')}</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex-1 text-center">
            <p className="text-white text-xl font-bold">{totalPeople}</p>
            <p className="text-white/40 text-xs">{t('history.people_met')}</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex-1 text-center">
            <p className="text-white text-xl font-bold">{HISTORY.length}</p>
            <p className="text-white/40 text-xs">{t('history.active_months')}</p>
          </div>
        </div>

        {/* Timeline */}
        {HISTORY.map((group) => (
          <div key={group.period}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
              <h2 className="text-white font-semibold text-sm">{group.period}</h2>
              <span className="text-white/30 text-xs">{group.events.length} {t('history.experiences_count')}</span>
            </div>

            <div className="ml-3 border-l border-white/10 pl-4 space-y-2">
              {group.events.map((event) => {
                const badge = TYPE_BADGE[event.type];
                return (
                  <div key={event.id} className="glass-card rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                      {event.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-white text-sm font-semibold">{event.title}</h3>
                        <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                          {t(badge.labelKey)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-white/40 text-xs">
                          <MapPin size={8} />{event.location}
                        </span>
                        <span className="text-white/30 text-xs">· {event.people} {t('history.persons')}</span>
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
  );
}
