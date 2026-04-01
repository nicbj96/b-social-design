import FirmaLayout from "@/components/FirmaLayout";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  Eye,
  MousePointerClick,
  Heart,
  UserPlus,
  TrendingUp,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";

type Period = "i dag" | "uge" | "måned" | "alt";

/* ── Types ── */
interface EventRow {
  id: string;
  title: string;
  date: string;
  category: string;
  interest_tags: string[] | null;
  created_at: string;
}

interface ParticipantRow {
  event_id: string;
  user_id: string;
  created_at: string;
}

interface ProfileRow {
  city: string | null;
}

/* ── Date range helper ── */
function getDateRange(period: Period): Date | null {
  const now = new Date();
  switch (period) {
    case "i dag":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "uge": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "måned": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
    case "alt":
      return null;
  }
}

/* ── Safe query wrapper ── */
async function safeQuery<T>(fn: () => Promise<{ data: T | null; error: any }>): Promise<T | null> {
  try {
    const { data, error } = await fn();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/* ── Main Component ── */
export default function FirmaAnalytics() {
  const { t } = useTranslation();
  const { user, companyId } = useAuth();
  const [period, setPeriod] = useState<Period>("uge");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [followerProfiles, setFollowerProfiles] = useState<ProfileRow[]>([]);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);

    // 1. Fetch user's events
    const evData = await safeQuery<EventRow[]>(async () =>
      await supabase.from("events").select("id, title, date, category, interest_tags, created_at").eq("created_by", user.id)
    );
    const allEvents = evData || [];
    setEvents(allEvents);

    const eventIds = allEvents.map(e => e.id);

    // 2. Fetch participants for user's events
    if (eventIds.length > 0) {
      const partData = await safeQuery<ParticipantRow[]>(async () =>
        await supabase.from("event_participants").select("event_id, user_id, created_at").in("event_id", eventIds)
      );
      setParticipants(partData || []);
    } else {
      setParticipants([]);
    }

    // 3. Fetch follower profiles for geo data (if company_follows exists)
    const cId = companyId;
    if (cId) {
      const followData = await safeQuery<{ user_id: string }[]>(async () =>
        await supabase.from("company_follows").select("user_id").eq("company_id", cId)
      );
      if (followData && followData.length > 0) {
        const followerIds = followData.map(f => f.user_id);
        const profileData = await safeQuery<ProfileRow[]>(async () =>
          await supabase.from("profiles").select("city").in("id", followerIds)
        );
        setFollowerProfiles(profileData || []);
      }
    }

    setLoading(false);
  }, [user?.id, companyId]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  /* ── Derived data based on period filter ── */
  const cutoff = getDateRange(period);

  const filteredEvents = useMemo(() => {
    if (!cutoff) return events;
    return events.filter(e => new Date(e.created_at) >= cutoff);
  }, [events, cutoff]);

  const filteredParticipants = useMemo(() => {
    if (!cutoff) return participants;
    return participants.filter(p => new Date(p.created_at) >= cutoff);
  }, [participants, cutoff]);

  // Stats
  const eventsCount = filteredEvents.length;
  const signupsCount = filteredParticipants.length;
  // No real view/favorite tracking tables exist yet — show 0 honestly
  const impressions = 0;
  const favorites = 0;

  // Daily views chart — show events per day of week
  const dailyData = useMemo(() => {
    const dayLabels = [t('firma.analytics_day_mon'), t('firma.analytics_day_tue'), t('firma.analytics_day_wed'), t('firma.analytics_day_thu'), t('firma.analytics_day_fri'), t('firma.analytics_day_sat'), t('firma.analytics_day_sun')];
    const counts = new Array(7).fill(0);
    for (const e of filteredEvents) {
      const d = new Date(e.date);
      const dow = d.getDay(); // 0=Sun
      const idx = dow === 0 ? 6 : dow - 1; // Shift to Mon=0
      counts[idx]++;
    }
    return dayLabels.map((day, i) => ({ day, views: counts[i] }));
  }, [filteredEvents]);

  const maxView = Math.max(...dailyData.map(d => d.views), 1);

  // SVG chart points
  const points = dailyData.map((d, i) => `${(i / 6) * 280 + 10},${140 - (d.views / maxView) * 120}`).join(" ");
  const areaPoints = points + " 290,140 10,140";

  // Funnel
  const funnel = useMemo(() => [
    { label: t('firma.analytics_events'), value: eventsCount, pct: "100%" },
    { label: t('firma.analytics_signups'), value: signupsCount, pct: eventsCount > 0 ? `${((signupsCount / eventsCount) * 100).toFixed(1)}%` : "0%" },
  ], [eventsCount, signupsCount, t]);

  // Event performance table
  const eventPerformance = useMemo(() => {
    return filteredEvents.map(e => {
      const eventSignups = filteredParticipants.filter(p => p.event_id === e.id).length;
      return {
        name: e.title,
        category: e.category || "-",
        signups: eventSignups,
        date: new Date(e.date).toLocaleDateString("da-DK"),
      };
    }).sort((a, b) => b.signups - a.signups).slice(0, 10);
  }, [filteredEvents, filteredParticipants]);

  // Tag performance
  const tagPerformance = useMemo(() => {
    const tagCounts: Record<string, { events: number; signups: number }> = {};
    for (const e of filteredEvents) {
      const tags = e.interest_tags || (e.category ? [e.category] : []);
      const eventSignups = filteredParticipants.filter(p => p.event_id === e.id).length;
      for (const tag of tags) {
        if (!tagCounts[tag]) tagCounts[tag] = { events: 0, signups: 0 };
        tagCounts[tag].events++;
        tagCounts[tag].signups += eventSignups;
      }
    }
    return Object.entries(tagCounts)
      .map(([tag, data]) => ({ tag, ...data, rate: data.events > 0 ? `${((data.signups / data.events) * 100).toFixed(1)}%` : "0%" }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 5);
  }, [filteredEvents, filteredParticipants]);

  // Geo distribution
  const geoData = useMemo(() => {
    const cityCounts: Record<string, number> = {};
    for (const p of followerProfiles) {
      const city = p.city || t('firma.analytics_unknown');
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    }
    const total = followerProfiles.length || 1;
    return Object.entries(cityCounts)
      .map(([city, count]) => ({ city, users: count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 7);
  }, [followerProfiles]);

  // Heatmap: events distributed by day of week and time of day
  const heatmapData = useMemo(() => {
    const grid = Array.from({ length: 4 }, () => new Array(7).fill(0));
    for (const e of filteredEvents) {
      const d = new Date(e.date);
      const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
      const hour = d.getHours();
      let slot = 0;
      if (hour >= 6 && hour < 12) slot = 0;
      else if (hour >= 12 && hour < 15) slot = 1;
      else if (hour >= 15 && hour < 18) slot = 2;
      else slot = 3;
      grid[slot][dow]++;
    }
    return grid;
  }, [filteredEvents]);

  const heatmapTimes = [t('firma.analytics_time_morning'), t('firma.analytics_time_noon'), t('firma.analytics_time_afternoon'), t('firma.analytics_time_evening')];
  const heatmapDays = [t('firma.analytics_day_mon'), t('firma.analytics_day_tue'), t('firma.analytics_day_wed'), t('firma.analytics_day_thu'), t('firma.analytics_day_fri'), t('firma.analytics_day_sat'), t('firma.analytics_day_sun')];
  const heatmapMax = Math.max(...heatmapData.flat(), 1);

  if (loading) {
    return (
      <FirmaLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-[#4ECDC4]" size={32} />
        </div>
      </FirmaLayout>
    );
  }

  return (
    <FirmaLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif" style={{ fontWeight: 400 }}>{t('firma.analytics_title')}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t('firma.analytics_subtitle')}</p>
          </div>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(["i dag", "uge", "måned", "alt"] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Tip when data is sparse */}
        {eventsCount === 0 && signupsCount === 0 && (
          <div className="p-4 rounded-2xl bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 flex items-start gap-3">
            <TrendingUp size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold">{t('firma.analytics_tip_title')}</p>
              <p className="text-white/50 text-xs mt-1">{t('firma.analytics_tip_description')}</p>
            </div>
          </div>
        )}

        {/* Overview stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('firma.analytics_events'), value: eventsCount.toLocaleString("da-DK"), icon: Calendar },
            { label: t('firma.analytics_signups'), value: signupsCount.toLocaleString("da-DK"), icon: UserPlus },
            { label: t('firma.analytics_impressions'), value: impressions.toLocaleString("da-DK"), icon: Eye, note: t('firma.analytics_coming_soon') },
            { label: t('firma.analytics_favorites'), value: favorites.toLocaleString("da-DK"), icon: Heart, note: t('firma.analytics_coming_soon') },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon size={18} className="text-primary" />
                  {stat.note && <span className="text-[11px] text-white/30 font-medium">{stat.note}</span>}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* SVG Line Chart */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold mb-3">{t('firma.analytics_events_per_weekday')}</h3>
          {eventsCount > 0 ? (
            <svg viewBox="0 0 300 160" className="w-full h-40">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={areaPoints} fill="url(#areaGrad)" />
              <polyline points={points} fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinejoin="round" />
              {dailyData.map((d, i) => (
                <g key={d.day}>
                  <circle cx={(i / 6) * 280 + 10} cy={140 - (d.views / maxView) * 120} r="4" fill="#4ECDC4" />
                  <text x={(i / 6) * 280 + 10} y={155} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">{d.day}</text>
                </g>
              ))}
            </svg>
          ) : (
            <div className="h-40 flex items-center justify-center text-white/30 text-sm">
              {t('firma.analytics_no_data_chart')}
            </div>
          )}
        </div>

        {/* Engagement Funnel */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold mb-4">{t('firma.analytics_engagement_funnel')}</h3>
          <div className="space-y-2">
            {funnel.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="w-24 text-right">
                  <p className="text-sm font-medium">{step.value.toLocaleString("da-DK")}</p>
                  <p className="text-xs text-muted-foreground">{step.label}</p>
                </div>
                <div className="flex-1 h-8 rounded-lg overflow-hidden bg-white/5">
                  <div className="h-full rounded-lg bg-primary/60 flex items-center justify-end pr-2 transition-all" style={{ width: `${eventsCount > 0 ? Math.max(100 - i * 50, 10) : 0}%` }}>
                    <span className="text-xs font-medium text-white">{step.pct}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold mb-3">{t('firma.analytics_event_times')}</h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-1 min-w-[400px]">
              <div />
              {heatmapDays.map((d) => (<div key={d} className="text-xs text-muted-foreground text-center py-1">{d}</div>))}
              {heatmapTimes.map((time, ti) => (
                <div key={time} className="contents">
                  <div className="text-xs text-muted-foreground flex items-center">{time}</div>
                  {heatmapData[ti].map((val, di) => (
                    <div key={`${ti}-${di}`} className="aspect-square rounded-md flex items-center justify-center text-xs" style={{ backgroundColor: `rgba(78, 205, 196, ${val / heatmapMax * 0.8})` }}>
                      {val > 0 ? val : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event performance table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold">{t('firma.analytics_event_performance')}</h2>
          </div>
          {eventPerformance.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-white/10">
                  <th className="text-left px-4 py-2">{t('firma.analytics_table_event')}</th>
                  <th className="text-left px-4 py-2">{t('firma.analytics_table_category')}</th>
                  <th className="text-left px-4 py-2">{t('firma.analytics_table_date')}</th>
                  <th className="text-left px-4 py-2">{t('firma.analytics_table_signups')}</th>
                </tr>
              </thead>
              <tbody>
                {eventPerformance.map((c) => (
                  <tr key={c.name} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2 text-sm">{c.name}</td>
                    <td className="px-4 py-2 text-sm text-muted-foreground capitalize">{c.category}</td>
                    <td className="px-4 py-2 text-sm text-muted-foreground">{c.date}</td>
                    <td className="px-4 py-2 text-sm text-primary font-medium">{c.signups}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-white/30 text-sm">{t('firma.analytics_no_events_period')}</div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tag performance */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-3">{t('firma.analytics_tag_performance')}</h3>
            {tagPerformance.length > 0 ? (
              <div className="space-y-3">
                {tagPerformance.map((item) => (
                  <div key={item.tag} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{item.tag}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{item.events} {t('firma.analytics_events_label')}</span>
                      <span className="text-xs text-primary font-medium">{item.signups} {t('firma.analytics_signups_short')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm text-center py-4">{t('firma.analytics_no_tag_data')}</p>
            )}
          </div>

          {/* Geo distribution */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-3">{t('firma.analytics_geo_distribution')}</h3>
            {geoData.length > 0 ? (
              <div className="space-y-2">
                {geoData.map((g) => (
                  <div key={g.city} className="flex items-center justify-between">
                    <span className="text-sm">{g.city}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-primary/20 w-20">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${g.pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{g.users.toLocaleString("da-DK")}</span>
                      <span className="text-xs text-muted-foreground w-8 text-right">{g.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm text-center py-4">{t('firma.analytics_no_followers')}</p>
            )}
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
