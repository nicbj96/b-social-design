import { ArrowLeft, TrendingUp, Award, Flame, Target, MapPin, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import { fetchPlaces, fetchEvents, type Place, type Event as SupabaseEvent } from "@/lib/supabase";


const MONTHLY_DATA = [
  { monthKey: "overview.month_oct", count: 3 }, { monthKey: "overview.month_nov", count: 5 }, { monthKey: "overview.month_dec", count: 2 },
  { monthKey: "overview.month_jan", count: 7 }, { monthKey: "overview.month_feb", count: 4 }, { monthKey: "overview.month_mar", count: 8 },
];

const maxCount = Math.max(...MONTHLY_DATA.map(d => d.count));

export default function Overblik() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const { data: places } = useQuery<Place[]>({
    queryKey: ["supabase-places-overview"],
    queryFn: () => fetchPlaces({ limit: 500 }),
    staleTime: 30 * 60 * 1000, // 30 min — places don't change often
  });

  const { data: events } = useQuery<SupabaseEvent[]>({
    queryKey: ["supabase-events"],
    queryFn: fetchEvents,
    staleTime: 2 * 60 * 1000, // 2 min — events change often
  });

  // Build category stats from Supabase places
  const categoryStats = (() => {
    if (!places || places.length === 0) return [
      { name: "Sport", pct: 35, color: "bg-blue-400", emoji: "⚽" },
      { name: "Natur", pct: 25, color: "bg-[#4ECDC4]", emoji: "🌿" },
      { name: "Kaffe", pct: 20, color: "bg-amber-400", emoji: "☕" },
      { name: "Kultur", pct: 12, color: "bg-purple-400", emoji: "🎭" },
      { name: "Musik", pct: 8, color: "bg-pink-400", emoji: "🎵" },
    ];

    const catCount: Record<string, number> = {};
    places.forEach(p => {
      (p.main_categories || []).forEach(c => {
        catCount[c] = (catCount[c] || 0) + 1;
      });
    });

    const total = Object.values(catCount).reduce((a, b) => a + b, 0);
    const colorMap: Record<string, string> = {
      natur: "bg-[#4ECDC4]", aktiv_sport: "bg-orange-400", mad_hangout: "bg-amber-400",
      sport: "bg-blue-400", kultur: "bg-purple-400", musik: "bg-pink-400",
    };
    const emojiMap: Record<string, string> = {
      natur: "🌿", aktiv_sport: "🏃", mad_hangout: "🍽️",
      sport: "⚽", kultur: "🎭", musik: "🎵",
    };

    return Object.entries(catCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        pct: Math.round((count / total) * 100),
        color: colorMap[name] || "bg-white/30",
        emoji: emojiMap[name] || "📍",
      }));
  })();

  const placesCount = places?.length || 0;
  const eventsCount = events?.length || 0;
  const topCategory = categoryStats[0];

  return (
    <div
      className="relative min-h-svh pb-24"
      style={{ background: "#060a0f" }}
      data-testid="overblik-page"
    >
      <div className="sticky top-0 z-30 pt-12 pb-3 px-5 flex items-center gap-3" style={{ background: "linear-gradient(to bottom, rgba(6,10,15,0.95) 60%, transparent)" }}>
        <button onClick={() => setLocation("/min-side")} className="w-9 h-9 rounded-full glass-card flex items-center justify-center"><ArrowLeft size={18} className="text-white" /></button>
        <h1 className="text-white text-xl font-serif" style={{ fontWeight: 400 }}>{t('overview.title')}</h1>
      </div>

      <div className="px-5 mt-2 space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card-strong rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#4ECDC4]/20 flex items-center justify-center"><Target size={16} className="text-[#4ECDC4]" /></div>
            </div>
            <p className="text-white text-2xl font-bold">{eventsCount > 0 ? eventsCount : 29}</p>
            <p className="text-white/40 text-xs">{t('overview.events_in_db')}</p>
          </div>
          <div className="glass-card-strong rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center"><MapPin size={16} className="text-purple-400" /></div>
            </div>
            <p className="text-white text-2xl font-bold">{placesCount}</p>
            <p className="text-white/40 text-xs">{t('overview.places_in_db')}</p>
          </div>
          <div className="glass-card-strong rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center"><Flame size={16} className="text-orange-400" /></div>
            </div>
            <p className="text-white text-2xl font-bold">12 {t('overview.days')}</p>
            <p className="text-white/40 text-xs">{t('overview.active_streak')}</p>
          </div>
          <div className="glass-card-strong rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center"><Award size={16} className="text-blue-400" /></div>
            </div>
            <p className="text-white text-2xl font-bold">{topCategory.emoji} {topCategory.name}</p>
            <p className="text-white/40 text-xs">{t('overview.most_active_category')}</p>
          </div>
        </div>

        {/* Monthly activity chart */}
        <div className="glass-card-strong rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-4">{t('overview.activity_per_month')}</h3>
          <div className="flex items-end gap-2 h-32">
            {MONTHLY_DATA.map((d) => (
              <div key={d.monthKey} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-white/60 text-xs font-medium">{d.count}</span>
                <div className="w-full rounded-t-lg bg-[#4ECDC4]/80 transition-all duration-500" style={{ height: `${(d.count / maxCount) * 100}%` }} />
                <span className="text-white/40 text-xs">{t(d.monthKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="glass-card-strong rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-4">{t('overview.categories')} {placesCount > 0 && <span className="text-white/30 text-xs font-normal">({t('overview.from_database')})</span>}</h3>
          <div className="space-y-3">
            {categoryStats.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70 text-xs font-medium">{cat.emoji} {cat.name}</span>
                  <span className="text-white/50 text-xs">{cat.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color} transition-all duration-700`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database overview */}
        {placesCount > 0 && (
          <div className="glass-card-strong rounded-2xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3">{t('overview.database_status')}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">{t('overview.places')}</span>
                <span className="text-[#4ECDC4] text-xs font-bold">{placesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">{t('overview.events')}</span>
                <span className="text-[#4ECDC4] text-xs font-bold">{eventsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">{t('overview.average_rating')}</span>
                <span className="text-amber-400 text-xs font-bold">
                  {places ? (places.reduce((s, p) => s + (p.rating_avg || 0), 0) / places.length).toFixed(1) : "–"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
