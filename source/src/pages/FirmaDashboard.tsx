import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import FirmaLayout from "@/components/FirmaLayout";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Users, Eye, CalendarPlus, TrendingUp, ArrowUpRight, Plus, Megaphone, BarChart3, Clock, Newspaper, ExternalLink, Loader2, UserPlus, MousePointerClick, CalendarDays, AlertCircle } from "lucide-react";
import { fetchNews, formatNewsTime, type NewsItem } from "@/lib/newsEngine";

/* ── Types ── */
interface CompanyData {
  id: string;
  name: string;
  plan: string;
}

interface DashboardStats {
  followers: number;
  eventViews: number;
  eventsCount: number;
  signups: number;
}

interface CompanyEvent {
  id: string;
  title: string;
  date: string;
  category: string;
}

interface ActivityItem {
  text: string;
  time: string;
}

/* ── Safe Supabase query helper — returns empty/zero on missing tables ── */
async function safeCount(query: PromiseLike<{ count: number | null; error: any }>): Promise<number> {
  try {
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/* ── Dashboard data hooks ── */
function useFirmaData() {
  const { user, companyId } = useAuth();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ followers: 0, eventViews: 0, eventsCount: 0, signups: 0 });
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [weeklyViews, setWeeklyViews] = useState<{ day: string; views: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }

    setLoading(true);

    // 1. Fetch company info
    let co: CompanyData | null = null;
    if (companyId) {
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("id, name, plan")
          .eq("id", companyId)
          .single();
        if (!error && data) co = data;
      } catch { /* table may not exist */ }
    }
    // Fallback: look up by owner
    if (!co) {
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("id, name, plan")
          .eq("created_by", user.id)
          .limit(1)
          .single();
        if (!error && data) co = data;
      } catch { /* table may not exist */ }
    }
    setCompany(co);

    const cId = co?.id ?? companyId;

    // 2. Fetch user's events
    let userEvents: CompanyEvent[] = [];
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, date, category")
        .eq("created_by", user.id)
        .order("date", { ascending: true });
      if (!error && data) userEvents = data;
    } catch { /* events table should exist */ }
    setEvents(userEvents);

    const eventIds = userEvents.map(e => e.id);

    // 3. Compute stats
    let followers = 0;
    let signups = 0;

    // Followers from company_follows
    if (cId) {
      followers = await safeCount(
        supabase.from("company_follows").select("*", { count: "exact", head: true }).eq("company_id", cId).then(r => r)
      );
    }

    // Signups from event_participants for user's events
    if (eventIds.length > 0) {
      signups = await safeCount(
        supabase.from("event_participants").select("*", { count: "exact", head: true }).in("event_id", eventIds).then(r => r)
      );
    }

    setStats({
      followers,
      eventViews: 0, // No view-tracking table yet — will show 0 honestly
      eventsCount: userEvents.length,
      signups,
    });

    // 4. Build weekly views from events created in the last 7 days (proxy metric)
    const days = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
    const now = new Date();
    const weekData = days.map(() => 0);
    // Count events per day-of-week as a simple activity proxy
    for (const ev of userEvents) {
      const d = new Date(ev.date);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 30) {
        weekData[d.getDay()]++;
      }
    }
    // Reorder to start on Monday
    const monFirst = [...weekData.slice(1), weekData[0]];
    const dayLabels = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
    setWeeklyViews(dayLabels.map((d, i) => ({ day: d, views: monFirst[i] })));

    // 5. Build activity log from recent events
    const recentActivity: ActivityItem[] = [];
    const upcoming = userEvents.filter(e => new Date(e.date) >= now).slice(0, 3);
    for (const ev of upcoming) {
      const d = new Date(ev.date);
      const daysUntil = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      recentActivity.push({
        text: `Event '${ev.title}' er om ${daysUntil} dag${daysUntil !== 1 ? "e" : ""}`,
        time: d.toLocaleDateString("da-DK"),
      });
    }
    if (signups > 0) {
      recentActivity.push({ text: `${signups} tilmelding${signups !== 1 ? "er" : ""} til dine events`, time: "Total" });
    }
    if (recentActivity.length === 0) {
      recentActivity.push({ text: "Ingen aktivitet endnu", time: "Opret dit første event for at komme i gang" });
    }
    setActivity(recentActivity);

    setLoading(false);
  }, [user?.id, companyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { company, stats, events, activity, weeklyViews, loading };
}

/* ── Sub-components ── */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    aktiv: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    draft: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    afsluttet: "bg-white/5 text-muted-foreground border-white/10",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.afsluttet}`}>
      {status}
    </span>
  );
}

function WeeklyChart({ data }: { data: { day: string; views: number }[] }) {
  const { t } = useTranslation();
  const maxViews = Math.max(...data.map((d) => d.views), 1);
  return (
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-sm font-semibold text-white/60 mb-6 uppercase tracking-wider">{t('events.events_this_month')}</h3>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
            <div
              className="w-full rounded-t-lg transition-all relative"
              style={{ height: `${Math.max((d.views / maxViews) * 112, 4)}px`, background: "rgba(78,205,196,0.4)" }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1e2535] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-white/10">
                {d.views}
              </div>
            </div>
            <span className="text-xs text-white/40">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngagementRing({ eventsCount, signups }: { eventsCount: number; signups: number }) {
  const { t } = useTranslation();
  const rate = eventsCount > 0 ? ((signups / Math.max(eventsCount, 1)) * 100) : 0;
  const displayRate = rate.toFixed(1);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (Math.min(rate, 100) / 100) * circumference;

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold text-white/60 mb-6 uppercase tracking-wider w-full">{t('events.signup_rate')}</h3>
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
          <circle cx="64" cy="64" r="45" stroke="#4ECDC4" strokeWidth="10" fill="transparent" strokeDasharray={circumference} style={{ strokeDashoffset: offset }} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-bold text-white">{displayRate}%</span>
        </div>
      </div>
      <p className="text-xs text-white/40">{t('events.signups_per_events', { signups, events: eventsCount })}</p>
    </div>
  );
}

function EmptyCompanyState() {
  const { t } = useTranslation();
  return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-[#4ECDC4]/10 flex items-center justify-center">
        <AlertCircle size={36} className="text-[#4ECDC4]" />
      </div>
      <h2 className="text-2xl font-bold text-white">{t('firma.create_company')}</h2>
      <p className="text-white/50 text-sm leading-relaxed">
        {t('firma.no_company_desc')}
      </p>
      <Link href="/firma/auth">
        <a className="inline-flex items-center gap-2 bg-[#4ECDC4] hover:bg-[#3dbdb5] text-[#0a1929] px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#4ECDC4]/20">
          <Plus size={20} />
          {t('firma.create_company_account')}
        </a>
      </Link>
    </div>
  );
}

/* ── Main Component ── */
export default function FirmaDashboard() {
  const { t } = useTranslation();
  const { isLoggedIn, isFirma, loading: authLoading } = useAuth();
  const { company, stats, events, activity, weeklyViews, loading } = useFirmaData();
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    setNewsLoading(true);
    fetchNews()
      .then(items => { setAllNews(items); setNewsLoading(false); })
      .catch(() => setNewsLoading(false));
  }, []);

  const relevantNews = useMemo(() => {
    const targetTags = ["cykling", "løb", "outdoor", "fitness", "sport"];
    return allNews.filter(n =>
      n.matchedTags?.some(tag => targetTags.includes(tag.toLowerCase()))
    ).slice(0, 3);
  }, [allNews]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.date) >= now)
      .slice(0, 5)
      .map(e => {
        const d = new Date(e.date);
        const daysUntil = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { ...e, daysUntil };
      });
  }, [events]);

  // Top tags from user's events
  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    for (const e of events) {
      if (e.category) {
        tagCounts[e.category] = (tagCounts[e.category] || 0) + 1;
      }
    }
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [events]);

  // Guard: if not authenticated or not firma, show login prompt only
  if (!authLoading && (!isLoggedIn || !isFirma())) {
    return (
      <FirmaLayout>
        <div className="max-w-lg mx-auto py-20 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#4ECDC4]/10 flex items-center justify-center">
            <AlertCircle size={36} className="text-[#4ECDC4]" />
          </div>
          <h2 className="text-2xl font-bold text-white">{t('firma.login_required')}</h2>
          <p className="text-white/50 text-sm leading-relaxed">{t('firma.login_required_desc')}</p>
          <Link href="/firma/auth">
            <a className="inline-flex items-center gap-2 bg-[#4ECDC4] hover:bg-[#3dbdb5] text-[#0a1929] px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#4ECDC4]/20">
              {t('firma.create_company_account')}
            </a>
          </Link>
        </div>
      </FirmaLayout>
    );
  }

  if (loading || authLoading) {
    return (
      <FirmaLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-[#4ECDC4]" size={32} />
        </div>
      </FirmaLayout>
    );
  }

  // No company found — show CTA
  if (!company) {
    return (
      <FirmaLayout>
        <EmptyCompanyState />
      </FirmaLayout>
    );
  }

  const STAT_CARDS = [
    { label: t('firma.followers'), value: stats.followers, icon: Users },
    { label: "Events", value: stats.eventsCount, icon: CalendarDays },
    { label: t('firma.signups'), value: stats.signups, icon: UserPlus },
    { label: t('firma.event_views'), value: stats.eventViews, icon: Eye },
  ];

  return (
    <FirmaLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-serif text-white tracking-tight" style={{ fontWeight: 400 }}>{company.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#4ECDC4]/15 text-[#4ECDC4] border border-[#4ECDC4]/20">
                {company.plan === "vaekst" ? "Vækst" : company.plan === "partner" ? "Partner" : "Starter"} · {company.plan === "vaekst" ? "5%" : company.plan === "partner" ? "3%" : "0%"} {t('firma.revenue_share')}
              </span>
            </div>
            <p className="text-white/40">{t('firma.welcome_back')}</p>
          </div>
          <Link href="/firma/events">
            <a className="bg-[#4ECDC4] hover:bg-[#3dbdb5] text-[#0a1929] px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#4ECDC4]/20 flex items-center gap-2 w-fit">
              <Plus size={20} />
              {t('firma.create_event')}
            </a>
          </Link>
        </div>

        {/* Tip banner when data is sparse */}
        {stats.followers === 0 && stats.signups === 0 && (
          <div className="p-4 rounded-2xl bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 flex items-start gap-3">
            <TrendingUp size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold">{t('firma.tip_share')}</p>
              <p className="text-white/50 text-xs mt-1">{t('firma.tip_share_desc')}</p>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/5 text-white/60">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value.toLocaleString("da-DK")}</div>
                <div className="text-xs text-white/40 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly chart + Engagement ring */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WeeklyChart data={weeklyViews} />
              <EngagementRing eventsCount={stats.eventsCount} signups={stats.signups} />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/firma/events">
                <a className="glass-card p-4 rounded-xl text-center hover:bg-white/5 transition-all group block">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <CalendarPlus size={20} />
                  </div>
                  <div className="text-xs font-bold text-white mb-1">{t('firma.quick_actions.create_event')}</div>
                  <div className="text-xs text-white/30">{t('firma.quick_actions.create_event_desc')}</div>
                </a>
              </Link>
              <Link href="/firma/targeting">
                <a className="glass-card p-4 rounded-xl text-center hover:bg-white/5 transition-all group block">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Megaphone size={20} />
                  </div>
                  <div className="text-xs font-bold text-white mb-1">{t('firma.quick_actions.targeting')}</div>
                  <div className="text-xs text-white/30">{t('firma.quick_actions.targeting_desc')}</div>
                </a>
              </Link>
              <Link href="/firma/analytics">
                <a className="glass-card p-4 rounded-xl text-center hover:bg-white/5 transition-all group block">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <BarChart3 size={20} />
                  </div>
                  <div className="text-xs font-bold text-white mb-1">{t('firma.quick_actions.analytics')}</div>
                  <div className="text-xs text-white/30">{t('firma.quick_actions.analytics_desc')}</div>
                </a>
              </Link>
              <Link href="/firma/rekruttering">
                <a className="glass-card p-4 rounded-xl text-center hover:bg-white/5 transition-all group block">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <UserPlus size={20} />
                  </div>
                  <div className="text-xs font-bold text-white mb-1">{t('firma.quick_actions.recruitment')}</div>
                  <div className="text-xs text-white/30">{t('firma.quick_actions.recruitment_desc')}</div>
                </a>
              </Link>
            </div>

            {/* Upcoming events */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white">{t('events.upcoming_events')}</h3>
                <Link href="/firma/events">
                  <a className="text-xs font-bold text-[#4ECDC4] uppercase tracking-wider">{t('events.see_all')}</a>
                </Link>
              </div>
              <div className="divide-y divide-white/5">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                  <div key={event.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">{event.title}</div>
                      <div className="text-xs text-white/40 flex items-center gap-2">
                        <Clock size={12} /> {new Date(event.date).toLocaleDateString("da-DK")}
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white/5 text-xs font-bold text-white/60 uppercase tracking-tighter">
                      om {event.daysUntil} dag{event.daysUntil !== 1 ? "e" : ""}
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-8 text-center text-white/30 text-sm">
                    {t('events.no_upcoming')} <Link href="/firma/events"><a className="text-[#4ECDC4] underline">{t('events.create_now')}</a></Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Insights */}
          <div className="space-y-8">
            {/* Top tags from events */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={16} className="text-[#4ECDC4]" />
                {t('firma.your_categories')}
              </h3>
              {topTags.length > 0 ? (
                <div className="space-y-4">
                  {topTags.map((tag, i) => {
                    const maxCount = topTags[0].count;
                    return (
                      <div key={tag.tag} className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-white/80 capitalize">{tag.tag}</span>
                          <span className="text-white/40 text-xs tracking-widest">{tag.count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#45B7AF] rounded-full"
                            style={{ width: `${(tag.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/30 text-xs text-center py-4">{t('firma.no_categories')}</p>
              )}
            </div>

            {/* NYHEDER TIL DIN MÅLGRUPPE WIDGET */}
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Newspaper size={16} className="text-[#4ECDC4]" />
                  {t('firma.news_for_audience')}
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#4ECDC4]/10">
                  <span className="w-1 h-1 rounded-full bg-[#4ECDC4] animate-pulse" />
                  <span className="text-[8px] font-bold text-[#4ECDC4] uppercase">LIVE</span>
                </div>
              </div>

              {newsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/30 text-xs">
                  <Loader2 className="animate-spin" size={20} />
                  {t('firma.fetching_news')}
                </div>
              ) : relevantNews.length > 0 ? (
                <div className="space-y-4">
                  {relevantNews.map((news) => (
                    <a
                      key={news.link}
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all group"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-white/30 font-bold uppercase tracking-widest mb-2">
                        <span>{news.sourceEmoji} {news.source}</span>
                        <span>•</span>
                        <span>{formatNewsTime(news.pubDate)}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white/80 group-hover:text-[#4ECDC4] transition-colors leading-snug line-clamp-2">
                        {news.title}
                      </h4>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                  <p className="text-white/30 text-xs">{t('firma.no_news')}</p>
                </div>
              )}
            </div>

            {/* Activity log */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">{t('firma.recent_activity')}</h3>
              <div className="space-y-6">
                {activity.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4ECDC4] mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-white/80 leading-relaxed mb-1">{item.text}</div>
                      <div className="text-xs text-white/30 font-medium">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
          }
