import FirmaLayout from "@/components/FirmaLayout";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";
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

/* ── Scoped CSS ── */
const firmaAnalyticsCSS = `
${pageBase("fn")}

/* ── Page layout ── */
.fn-page {
  padding: 40px 24px 80px;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Header ── */
.fn-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}
@media (min-width: 640px) {
  .fn-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.fn-title {
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 400;
  letter-spacing: -0.5px;
  color: var(--pg-white);
  margin: 0;
}
.fn-subtitle {
  font-size: 13px;
  color: var(--pg-white-muted);
  margin-top: 4px;
}

/* ── Period toggle ── */
.fn-toggle {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  padding: 4px;
  border: 1px solid rgba(255,255,255,0.06);
}
.fn-toggle-btn {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  font-family: var(--sans);
  border: none;
  cursor: pointer;
  transition: all 0.25s;
  color: var(--pg-white-muted);
  background: transparent;
}
.fn-toggle-btn:hover {
  color: var(--pg-white-dim);
}
.fn-toggle-btn.active {
  background: rgba(78,205,196,0.15);
  color: var(--teal);
}

/* ── Tip banner ── */
.fn-tip {
  padding: 16px 20px;
  border-radius: 14px;
  background: rgba(78,205,196,0.08);
  border: 1px solid rgba(78,205,196,0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 28px;
}
.fn-tip-icon {
  color: var(--teal);
  flex-shrink: 0;
  margin-top: 2px;
}
.fn-tip-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--pg-white);
}
.fn-tip-desc {
  font-size: 12px;
  color: var(--pg-white-muted);
  margin-top: 3px;
}

/* ── Stats grid ── */
.fn-stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
@media (min-width: 640px) {
  .fn-stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .fn-stats-grid { grid-template-columns: repeat(4, 1fr); }
}
.fn-stat-card {
  padding: 22px;
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  transition: all 0.3s;
}
.fn-stat-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  transform: translateY(-2px);
}
.fn-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.fn-stat-icon {
  color: var(--teal);
}
.fn-stat-note {
  font-size: 10px;
  color: rgba(255,255,255,0.2);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.fn-stat-value {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 400;
  color: var(--pg-white);
  line-height: 1;
}
.fn-stat-label-text {
  font-size: 11px;
  color: var(--pg-white-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 6px;
}

/* ── Section card (glass) ── */
.fn-section {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  transition: background 0.3s, border-color 0.3s;
}
.fn-section:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}
.fn-section-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 400;
  color: var(--pg-white);
  margin-bottom: 16px;
}

/* ── SVG chart ── */
.fn-chart-wrap {
  width: 100%;
  height: 180px;
}
.fn-chart-wrap svg {
  width: 100%;
  height: 100%;
}
.fn-chart-empty {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pg-white-muted);
  font-size: 13px;
}

/* ── Funnel ── */
.fn-funnel-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}
.fn-funnel-label {
  width: 100px;
  text-align: right;
  flex-shrink: 0;
}
.fn-funnel-val {
  font-size: 14px;
  font-weight: 600;
  color: var(--pg-white);
}
.fn-funnel-name {
  font-size: 11px;
  color: var(--pg-white-muted);
}
.fn-funnel-track {
  flex: 1;
  height: 32px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255,255,255,0.04);
}
.fn-funnel-fill {
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, var(--teal), rgba(78,205,196,0.5));
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  transition: width 0.6s ease;
}
.fn-funnel-pct {
  font-size: 11px;
  font-weight: 600;
  color: var(--bg);
}

/* ── Heatmap ── */
.fn-heatmap-grid {
  display: grid;
  grid-template-columns: auto repeat(7, 1fr);
  gap: 4px;
  min-width: 400px;
}
.fn-heatmap-header {
  font-size: 11px;
  color: var(--pg-white-muted);
  text-align: center;
  padding: 4px 0;
}
.fn-heatmap-time {
  font-size: 11px;
  color: var(--pg-white-muted);
  display: flex;
  align-items: center;
  padding-right: 8px;
}
.fn-heatmap-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  color: var(--pg-white);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.04);
  transition: transform 0.2s, border-color 0.2s;
}
.fn-heatmap-cell:hover {
  transform: scale(1.08);
  border-color: rgba(78,205,196,0.3);
}
.fn-heatmap-scroll {
  overflow-x: auto;
}

/* ── Performance table ── */
.fn-table-wrap {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  transition: background 0.3s, border-color 0.3s;
}
.fn-table-wrap:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}
.fn-table-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.fn-table-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 400;
  color: var(--pg-white);
}
.fn-table {
  width: 100%;
  border-collapse: collapse;
}
.fn-table th {
  text-align: left;
  padding: 10px 24px;
  font-size: 11px;
  font-weight: 500;
  color: var(--pg-white-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.fn-table td {
  padding: 12px 24px;
  font-size: 13px;
  color: var(--pg-white-dim);
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.fn-table tr:hover td {
  background: rgba(255,255,255,0.03);
}
.fn-table-teal {
  color: var(--teal) !important;
  font-weight: 600;
}
.fn-table-muted {
  color: var(--pg-white-muted);
  text-transform: capitalize;
}
.fn-table-empty {
  padding: 40px;
  text-align: center;
  color: var(--pg-white-muted);
  font-size: 13px;
}

/* ── Two-col grid ── */
.fn-two-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 24px;
}
@media (min-width: 1024px) {
  .fn-two-col { grid-template-columns: 1fr 1fr; }
}

/* ── Tag / Geo items ── */
.fn-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.fn-list-item:last-child {
  border-bottom: none;
}
.fn-list-name {
  font-size: 13px;
  color: var(--pg-white-dim);
  text-transform: capitalize;
}
.fn-list-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.fn-list-muted {
  font-size: 12px;
  color: var(--pg-white-muted);
}
.fn-list-teal {
  font-size: 12px;
  color: var(--teal);
  font-weight: 600;
}

/* ── Geo bar ── */
.fn-geo-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.fn-geo-track {
  width: 80px;
  height: 5px;
  border-radius: 100px;
  background: rgba(78,205,196,0.12);
  overflow: hidden;
}
.fn-geo-fill {
  height: 100%;
  border-radius: 100px;
  background: var(--teal);
  transition: width 0.5s ease;
}
.fn-geo-count {
  font-size: 12px;
  color: var(--pg-white-muted);
  width: 48px;
  text-align: right;
}
.fn-geo-pct {
  font-size: 12px;
  color: var(--pg-white-muted);
  width: 36px;
  text-align: right;
}

/* ── Empty state ── */
.fn-empty {
  padding: 24px;
  text-align: center;
  color: var(--pg-white-muted);
  font-size: 13px;
}

/* ── Loading ── */
.fn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 128px 0;
}
.fn-spinner {
  color: var(--teal);
  animation: fn-spin 1s linear infinite;
}
@keyframes fn-spin {
  to { transform: rotate(360deg); }
}
`;

/* ── Main Component ── */
export default function FirmaAnalytics() {
  const { t } = useTranslation();
  const { user, companyId } = useAuth();
  const containerRef = useFadeUp("fn");
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
        <style>{firmaAnalyticsCSS}</style>
        <div className="fn-root">
          <div className="fn-loading">
            <Loader2 className="fn-spinner" size={32} />
          </div>
        </div>
      </FirmaLayout>
    );
  }

  return (
    <FirmaLayout>
      <style>{firmaAnalyticsCSS}</style>
      <div className="fn-root" ref={containerRef}>
        <div className="fn-page">

          {/* ── Header ── */}
          <div className="fn-header fn-fade-up fn-d1">
            <div>
              <div className="fn-eyebrow">
                <div className="fn-eyebrow-line" />
                B-Social Firma
              </div>
              <h1 className="fn-title">{t('firma.analytics_title')}</h1>
              <p className="fn-subtitle">{t('firma.analytics_subtitle')}</p>
            </div>
            <div className="fn-toggle">
              {(["i dag", "uge", "måned", "alt"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`fn-toggle-btn${period === p ? " active" : ""}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tip when data is sparse ── */}
          {eventsCount === 0 && signupsCount === 0 && (
            <div className="fn-tip fn-fade-up fn-d1">
              <TrendingUp size={20} className="fn-tip-icon" />
              <div>
                <p className="fn-tip-title">{t('firma.analytics_tip_title')}</p>
                <p className="fn-tip-desc">{t('firma.analytics_tip_description')}</p>
              </div>
            </div>
          )}

          {/* ── Overview stats ── */}
          <div className="fn-stats-grid fn-fade-up fn-d1">
            {[
              { label: t('firma.analytics_events'), value: eventsCount.toLocaleString("da-DK"), icon: Calendar },
              { label: t('firma.analytics_signups'), value: signupsCount.toLocaleString("da-DK"), icon: UserPlus },
              { label: t('firma.analytics_impressions'), value: impressions.toLocaleString("da-DK"), icon: Eye, note: t('firma.analytics_coming_soon') },
              { label: t('firma.analytics_favorites'), value: favorites.toLocaleString("da-DK"), icon: Heart, note: t('firma.analytics_coming_soon') },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`fn-stat-card fn-fade-up fn-d${Math.min(idx + 1, 4)}`}>
                  <div className="fn-stat-top">
                    <Icon size={18} className="fn-stat-icon" />
                    {stat.note && <span className="fn-stat-note">{stat.note}</span>}
                  </div>
                  <p className="fn-stat-value">{stat.value}</p>
                  <p className="fn-stat-label-text">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* ── SVG Line Chart ── */}
          <div className="fn-section fn-fade-up fn-d2">
            <h3 className="fn-section-title">{t('firma.analytics_events_per_weekday')}</h3>
            {eventsCount > 0 ? (
              <div className="fn-chart-wrap">
                <svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="fn-areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="fn-lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#4ECDC4" stopOpacity="1" />
                      <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0.6" />
                    </linearGradient>
                    <filter id="fn-glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Grid lines */}
                  {[0, 1, 2, 3].map(i => (
                    <line key={i} x1="10" y1={20 + i * 40} x2="290" y2={20 + i * 40} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  ))}
                  <polygon points={areaPoints} fill="url(#fn-areaGrad)" />
                  <polyline points={points} fill="none" stroke="url(#fn-lineGrad)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" filter="url(#fn-glow)" />
                  {dailyData.map((d, i) => (
                    <g key={d.day}>
                      <circle cx={(i / 6) * 280 + 10} cy={140 - (d.views / maxView) * 120} r="5" fill="#060a0f" stroke="#4ECDC4" strokeWidth="2" />
                      <circle cx={(i / 6) * 280 + 10} cy={140 - (d.views / maxView) * 120} r="2" fill="#4ECDC4" />
                      <text x={(i / 6) * 280 + 10} y={155} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="DM Sans, sans-serif">{d.day}</text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="fn-chart-empty">
                {t('firma.analytics_no_data_chart')}
              </div>
            )}
          </div>

          {/* ── Engagement Funnel ── */}
          <div className="fn-section fn-fade-up fn-d2">
            <h3 className="fn-section-title">{t('firma.analytics_engagement_funnel')}</h3>
            {funnel.map((step, i) => (
              <div key={step.label} className="fn-funnel-row">
                <div className="fn-funnel-label">
                  <p className="fn-funnel-val">{step.value.toLocaleString("da-DK")}</p>
                  <p className="fn-funnel-name">{step.label}</p>
                </div>
                <div className="fn-funnel-track">
                  <div
                    className="fn-funnel-fill"
                    style={{ width: `${eventsCount > 0 ? Math.max(100 - i * 50, 10) : 0}%` }}
                  >
                    <span className="fn-funnel-pct">{step.pct}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Heatmap ── */}
          <div className="fn-section fn-fade-up fn-d3">
            <h3 className="fn-section-title">{t('firma.analytics_event_times')}</h3>
            <div className="fn-heatmap-scroll">
              <div className="fn-heatmap-grid">
                <div />
                {heatmapDays.map((d) => (
                  <div key={d} className="fn-heatmap-header">{d}</div>
                ))}
                {heatmapTimes.map((time, ti) => (
                  <>
                    <div key={`time-${ti}`} className="fn-heatmap-time">{time}</div>
                    {heatmapData[ti].map((val, di) => (
                      <div
                        key={`${ti}-${di}`}
                        className="fn-heatmap-cell"
                        style={{ backgroundColor: `rgba(78, 205, 196, ${val / heatmapMax * 0.8})` }}
                      >
                        {val > 0 ? val : ""}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>

          {/* ── Event performance table ── */}
          <div className="fn-table-wrap fn-fade-up fn-d3">
            <div className="fn-table-header">
              <h2 className="fn-table-title">{t('firma.analytics_event_performance')}</h2>
            </div>
            {eventPerformance.length > 0 ? (
              <table className="fn-table">
                <thead>
                  <tr>
                    <th>{t('firma.analytics_table_event')}</th>
                    <th>{t('firma.analytics_table_category')}</th>
                    <th>{t('firma.analytics_table_date')}</th>
                    <th>{t('firma.analytics_table_signups')}</th>
                  </tr>
                </thead>
                <tbody>
                  {eventPerformance.map((c) => (
                    <tr key={c.name}>
                      <td>{c.name}</td>
                      <td className="fn-table-muted">{c.category}</td>
                      <td className="fn-table-muted">{c.date}</td>
                      <td className="fn-table-teal">{c.signups}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="fn-table-empty">{t('firma.analytics_no_events_period')}</div>
            )}
          </div>

          {/* ── Tag performance + Geo distribution ── */}
          <div className="fn-two-col">
            {/* Tag performance */}
            <div className="fn-section fn-fade-up fn-d3">
              <h3 className="fn-section-title">{t('firma.analytics_tag_performance')}</h3>
              {tagPerformance.length > 0 ? (
                <div>
                  {tagPerformance.map((item) => (
                    <div key={item.tag} className="fn-list-item">
                      <span className="fn-list-name">{item.tag}</span>
                      <div className="fn-list-meta">
                        <span className="fn-list-muted">{item.events} {t('firma.analytics_events_label')}</span>
                        <span className="fn-list-teal">{item.signups} {t('firma.analytics_signups_short')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="fn-empty">{t('firma.analytics_no_tag_data')}</p>
              )}
            </div>

            {/* Geo distribution */}
            <div className="fn-section fn-fade-up fn-d4">
              <h3 className="fn-section-title">{t('firma.analytics_geo_distribution')}</h3>
              {geoData.length > 0 ? (
                <div>
                  {geoData.map((g) => (
                    <div key={g.city} className="fn-list-item">
                      <span className="fn-list-name">{g.city}</span>
                      <div className="fn-geo-bar-wrap">
                        <div className="fn-geo-track">
                          <div className="fn-geo-fill" style={{ width: `${g.pct}%` }} />
                        </div>
                        <span className="fn-geo-count">{g.users.toLocaleString("da-DK")}</span>
                        <span className="fn-geo-pct">{g.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="fn-empty">{t('firma.analytics_no_followers')}</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </FirmaLayout>
  );
}
