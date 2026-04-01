import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import FirmaLayout from "@/components/FirmaLayout";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Users, Eye, CalendarPlus, TrendingUp, ArrowUpRight, Plus, Megaphone, BarChart3, Clock, Newspaper, ExternalLink, Loader2, UserPlus, MousePointerClick, CalendarDays, AlertCircle } from "lucide-react";
import { fetchNews, formatNewsTime, type NewsItem } from "@/lib/newsEngine";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const firmaDashCSS = `${pageBase("fb")}

/* ── Layout ── */
.fb-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}
.fb-section-gap { display: flex; flex-direction: column; gap: 32px; }

/* ── Header ── */
.fb-header {
  display: flex; flex-direction: column; gap: 16px;
}
@media (min-width: 768px) {
  .fb-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
}
.fb-company-name {
  font-family: var(--serif);
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 400; line-height: 1.1; letter-spacing: -0.5px;
  color: var(--pg-white);
}
.fb-plan-badge {
  display: inline-flex; align-items: center;
  padding: 4px 12px; border-radius: 100px;
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 1.2px; color: var(--teal);
  background: var(--teal-dim); border: 1px solid rgba(78,205,196,0.2);
}
.fb-header-row {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.fb-create-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 12px;
  background: var(--teal); color: var(--bg);
  font-size: 14px; font-weight: 600; font-family: var(--sans);
  border: none; cursor: pointer; transition: all 0.3s;
  text-decoration: none;
}
.fb-create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px var(--teal-glow);
}

/* ── Tip banner ── */
.fb-tip {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 16px 20px; border-radius: 16px;
  background: var(--teal-dim); border: 1px solid rgba(78,205,196,0.2);
}
.fb-tip-icon { color: var(--teal); flex-shrink: 0; margin-top: 2px; }
.fb-tip-title { font-size: 14px; font-weight: 600; color: var(--pg-white); }
.fb-tip-desc { font-size: 12px; color: var(--pg-white-dim); margin-top: 4px; }

/* ── Stat grid ── */
.fb-stat-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
@media (min-width: 1024px) {
  .fb-stat-grid { grid-template-columns: repeat(4, 1fr); }
}
.fb-stat-card {
  padding: 20px; border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  transition: border-color 0.3s, transform 0.3s;
}
.fb-stat-card:hover {
  border-color: var(--glass-border-hover);
  transform: translateY(-2px);
}
.fb-stat-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.fb-stat-icon {
  width: 36px; height: 36px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(78,205,196,0.08); border: 1px solid rgba(78,205,196,0.12);
  color: var(--teal);
}
.fb-stat-arrow { color: rgba(255,255,255,0.15); }
.fb-stat-value {
  font-family: var(--serif); font-size: 28px;
  font-weight: 400; color: var(--pg-white); line-height: 1;
}
.fb-stat-label-text {
  font-size: 11px; color: var(--pg-white-muted);
  text-transform: uppercase; letter-spacing: 1.5px; margin-top: 6px;
}

/* ── Main grid (2/3 + 1/3) ── */
.fb-main-grid {
  display: grid; grid-template-columns: 1fr; gap: 32px;
}
@media (min-width: 1024px) {
  .fb-main-grid { grid-template-columns: 2fr 1fr; }
}
.fb-left-col { display: flex; flex-direction: column; gap: 32px; }
.fb-right-col { display: flex; flex-direction: column; gap: 32px; }

/* ── Chart row ── */
.fb-chart-row {
  display: grid; grid-template-columns: 1fr; gap: 16px;
}
@media (min-width: 768px) {
  .fb-chart-row { grid-template-columns: 1fr 1fr; }
}

/* ── Weekly chart ── */
.fb-chart-card {
  padding: 24px; border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}
.fb-chart-title {
  font-size: 11px; font-weight: 600; color: var(--pg-white-dim);
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px;
}
.fb-chart-bars {
  display: flex; align-items: flex-end; justify-content: space-between;
  height: 128px; gap: 8px;
}
.fb-bar-col {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.fb-bar-col:hover .fb-bar-tooltip { opacity: 1; }
.fb-bar {
  width: 100%; border-radius: 6px 6px 0 0;
  background: rgba(78,205,196,0.35);
  transition: background 0.25s;
  position: relative;
}
.fb-bar-col:hover .fb-bar { background: rgba(78,205,196,0.6); }
.fb-bar-tooltip {
  position: absolute; top: -32px; left: 50%; transform: translateX(-50%);
  background: rgba(30,37,53,0.95); color: var(--pg-white); font-size: 11px;
  padding: 4px 8px; border-radius: 6px; opacity: 0;
  transition: opacity 0.2s; white-space: nowrap; z-index: 10;
  border: 1px solid var(--glass-border);
  pointer-events: none;
}
.fb-bar-day { font-size: 11px; color: var(--pg-white-muted); }

/* ── Engagement ring ── */
.fb-ring-card {
  padding: 24px; border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.fb-ring-svg { width: 128px; height: 128px; transform: rotate(-90deg); margin-bottom: 16px; }
.fb-ring-track { stroke: rgba(255,255,255,0.05); }
.fb-ring-progress { stroke: var(--teal); stroke-linecap: round; transition: stroke-dashoffset 0.8s ease; }
.fb-ring-center {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center; flex-direction: column;
}
.fb-ring-pct { font-size: 24px; font-weight: 700; color: var(--pg-white); }
.fb-ring-sub { font-size: 11px; color: var(--pg-white-muted); margin-top: 4px; }

/* ── Quick actions grid ── */
.fb-actions-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
@media (min-width: 768px) {
  .fb-actions-grid { grid-template-columns: repeat(4, 1fr); }
}
.fb-action-card {
  display: flex; flex-direction: column; align-items: center;
  padding: 20px 16px; border-radius: 16px; text-align: center;
  background: var(--glass-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  transition: all 0.3s; cursor: pointer; text-decoration: none;
}
.fb-action-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  transform: translateY(-2px);
}
.fb-action-icon {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px; transition: transform 0.3s;
}
.fb-action-card:hover .fb-action-icon { transform: scale(1.1); }
.fb-action-icon--green  { background: rgba(16,185,129,0.1); color: #34d399; }
.fb-action-icon--blue   { background: rgba(59,130,246,0.1); color: #60a5fa; }
.fb-action-icon--purple { background: rgba(168,85,247,0.1); color: #c084fc; }
.fb-action-icon--orange { background: rgba(249,115,22,0.1); color: #fb923c; }
.fb-action-title {
  font-size: 12px; font-weight: 700; color: var(--pg-white); margin-bottom: 4px;
}
.fb-action-desc { font-size: 11px; color: var(--pg-white-muted); }

/* ── Upcoming events table ── */
.fb-events-card {
  border-radius: 16px; overflow: hidden;
  background: var(--glass-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}
.fb-events-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.fb-events-title { font-size: 15px; font-weight: 700; color: var(--pg-white); }
.fb-events-link {
  font-size: 11px; font-weight: 700; color: var(--teal);
  text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none;
}
.fb-events-link:hover { text-decoration: underline; }
.fb-event-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.2s;
}
.fb-event-row:last-child { border-bottom: none; }
.fb-event-row:hover { background: rgba(255,255,255,0.02); }
.fb-event-name { font-size: 14px; font-weight: 700; color: var(--pg-white); margin-bottom: 4px; }
.fb-event-date {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--pg-white-muted);
}
.fb-event-badge {
  padding: 4px 12px; border-radius: 8px;
  background: rgba(255,255,255,0.05);
  font-size: 12px; font-weight: 700; color: var(--pg-white-dim);
  text-transform: lowercase; letter-spacing: -0.3px; white-space: nowrap;
}
.fb-events-empty {
  padding: 32px 24px; text-align: center;
  font-size: 13px; color: var(--pg-white-muted);
}
.fb-events-empty a { color: var(--teal); text-decoration: underline; }

/* ── Right column cards ── */
.fb-sidebar-card {
  padding: 24px; border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}
.fb-sidebar-title {
  font-size: 12px; font-weight: 700; color: var(--pg-white);
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 24px;
  display: flex; align-items: center; gap: 8px;
}
.fb-sidebar-title svg { color: var(--teal); }

/* ── Category tags ── */
.fb-tag-row { margin-bottom: 16px; }
.fb-tag-row:last-child { margin-bottom: 0; }
.fb-tag-meta {
  display: flex; justify-content: space-between; margin-bottom: 8px;
}
.fb-tag-name {
  font-size: 12px; font-weight: 500; color: var(--pg-white-dim);
  text-transform: capitalize;
}
.fb-tag-count {
  font-size: 11px; color: var(--pg-white-muted); letter-spacing: 1px;
}
.fb-tag-track {
  height: 6px; width: 100%; background: rgba(255,255,255,0.05);
  border-radius: 100px; overflow: hidden;
}
.fb-tag-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, var(--teal), #45B7AF);
  transition: width 0.6s ease;
}
.fb-no-data {
  font-size: 12px; color: var(--pg-white-muted); text-align: center; padding: 16px 0;
}

/* ── News widget ── */
.fb-news-card {
  padding: 24px; border-radius: 16px;
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 100%);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}
.fb-news-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px;
}
.fb-live-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 100px;
  background: var(--teal-dim);
}
.fb-live-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--teal);
  animation: fb-pulse 2s ease-in-out infinite;
}
@keyframes fb-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.fb-live-text { font-size: 9px; font-weight: 700; color: var(--teal); text-transform: uppercase; }
.fb-news-list { display: flex; flex-direction: column; gap: 16px; }
.fb-news-item {
  display: block; padding: 12px; border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  transition: background 0.25s; text-decoration: none;
}
.fb-news-item:hover { background: rgba(255,255,255,0.08); }
.fb-news-meta {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; color: var(--pg-white-muted);
  font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
  margin-bottom: 8px;
}
.fb-news-headline {
  font-size: 13px; font-weight: 600; color: var(--pg-white-dim);
  line-height: 1.4; transition: color 0.25s;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.fb-news-item:hover .fb-news-headline { color: var(--teal); }
.fb-news-empty {
  padding: 32px 0; text-align: center;
  background: rgba(255,255,255,0.05); border-radius: 12px;
  border: 1px dashed rgba(255,255,255,0.1);
}
.fb-news-loading {
  padding: 48px 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  font-size: 12px; color: var(--pg-white-muted);
}

/* ── Activity log ── */
.fb-activity-list { display: flex; flex-direction: column; gap: 20px; }
.fb-activity-item { display: flex; gap: 12px; }
.fb-activity-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--teal); margin-top: 5px; flex-shrink: 0;
}
.fb-activity-text { font-size: 13px; color: var(--pg-white-dim); line-height: 1.5; margin-bottom: 4px; }
.fb-activity-time { font-size: 11px; color: var(--pg-white-muted); font-weight: 500; }

/* ── Auth / empty states ── */
.fb-empty-state {
  max-width: 480px; margin: 0 auto; padding: 80px 0;
  text-align: center; display: flex; flex-direction: column;
  align-items: center; gap: 24px;
}
.fb-empty-icon {
  width: 80px; height: 80px; border-radius: 16px;
  background: var(--teal-dim);
  display: flex; align-items: center; justify-content: center;
  color: var(--teal);
}
.fb-empty-title {
  font-family: var(--serif); font-size: 28px;
  font-weight: 400; color: var(--pg-white);
}
.fb-empty-desc { font-size: 14px; color: var(--pg-white-dim); line-height: 1.6; }
.fb-empty-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 32px; border-radius: 12px;
  background: var(--teal); color: var(--bg);
  font-size: 14px; font-weight: 700; font-family: var(--sans);
  text-decoration: none; transition: all 0.3s; border: none; cursor: pointer;
}
.fb-empty-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px var(--teal-glow);
}

/* ── Loading spinner ── */
.fb-loading {
  display: flex; align-items: center; justify-content: center;
  padding: 128px 0; color: var(--teal);
}
.fb-spin { animation: fb-spinner 1s linear infinite; }
@keyframes fb-spinner { to { transform: rotate(360deg); } }

/* ── Status badge ── */
.fb-status {
  display: inline-flex; padding: 2px 10px; border-radius: 100px;
  font-size: 11px; font-weight: 600; border: 1px solid;
}
.fb-status--aktiv { background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.2); }
.fb-status--draft { background: rgba(234,179,8,0.15); color: #facc15; border-color: rgba(234,179,8,0.2); }
.fb-status--ended { background: rgba(255,255,255,0.05); color: var(--pg-white-muted); border-color: rgba(255,255,255,0.1); }
`;

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
  const variant =
    status === "aktiv" ? "fb-status--aktiv" :
    status === "draft" ? "fb-status--draft" : "fb-status--ended";
  return <span className={`fb-status ${variant}`}>{status}</span>;
}

function WeeklyChart({ data }: { data: { day: string; views: number }[] }) {
  const { t } = useTranslation();
  const maxViews = Math.max(...data.map((d) => d.views), 1);
  return (
    <div className="fb-chart-card fb-fade-up fb-d1">
      <div className="fb-chart-title">{t('events.events_this_month')}</div>
      <div className="fb-chart-bars">
        {data.map((d) => (
          <div key={d.day} className="fb-bar-col">
            <div
              className="fb-bar"
              style={{ height: `${Math.max((d.views / maxViews) * 112, 4)}px` }}
            >
              <div className="fb-bar-tooltip">{d.views}</div>
            </div>
            <span className="fb-bar-day">{d.day}</span>
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
    <div className="fb-ring-card fb-fade-up fb-d2">
      <div className="fb-chart-title" style={{ width: "100%" }}>{t('events.signup_rate')}</div>
      <div style={{ position: "relative", width: 128, height: 128, marginBottom: 16 }}>
        <svg className="fb-ring-svg" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="45" strokeWidth="10" fill="transparent" className="fb-ring-track" />
          <circle cx="64" cy="64" r="45" strokeWidth="10" fill="transparent" className="fb-ring-progress"
            strokeDasharray={circumference} style={{ strokeDashoffset: offset }} />
        </svg>
        <div className="fb-ring-center">
          <span className="fb-ring-pct">{displayRate}%</span>
        </div>
      </div>
      <span className="fb-ring-sub">{t('events.signups_per_events', { signups, events: eventsCount })}</span>
    </div>
  );
}

function EmptyCompanyState() {
  const { t } = useTranslation();
  return (
    <div className="fb-empty-state">
      <div className="fb-empty-icon">
        <AlertCircle size={36} />
      </div>
      <h2 className="fb-empty-title">{t('firma.create_company')}</h2>
      <p className="fb-empty-desc">{t('firma.no_company_desc')}</p>
      <Link href="/firma/auth">
        <a className="fb-empty-btn">
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
  const containerRef = useFadeUp("fb");

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
        <style>{firmaDashCSS}</style>
        <div className="fb-root" ref={containerRef}>
          <div className="fb-empty-state fb-fade-up">
            <div className="fb-empty-icon">
              <AlertCircle size={36} />
            </div>
            <h2 className="fb-empty-title">{t('firma.login_required')}</h2>
            <p className="fb-empty-desc">{t('firma.login_required_desc')}</p>
            <Link href="/firma/auth">
              <a className="fb-empty-btn">{t('firma.create_company_account')}</a>
            </Link>
          </div>
        </div>
      </FirmaLayout>
    );
  }

  if (loading || authLoading) {
    return (
      <FirmaLayout>
        <style>{firmaDashCSS}</style>
        <div className="fb-root">
          <div className="fb-loading">
            <Loader2 className="fb-spin" size={32} />
          </div>
        </div>
      </FirmaLayout>
    );
  }

  // No company found — show CTA
  if (!company) {
    return (
      <FirmaLayout>
        <style>{firmaDashCSS}</style>
        <div className="fb-root" ref={containerRef}>
          <EmptyCompanyState />
        </div>
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
      <style>{firmaDashCSS}</style>
      <div className="fb-root" ref={containerRef}>
        <div className="fb-container fb-section-gap">

          {/* ── Header ── */}
          <div className="fb-header fb-fade-up">
            <div>
              <div className="fb-eyebrow" style={{ marginBottom: 8 }}>
                <span className="fb-eyebrow-line" />
                {t('firma.welcome_back')}
              </div>
              <div className="fb-header-row">
                <h1 className="fb-company-name">{company.name}</h1>
                <span className="fb-plan-badge">
                  {company.plan === "vaekst" ? "Vaekst" : company.plan === "partner" ? "Partner" : "Starter"}
                </span>
              </div>
            </div>
            <Link href="/firma/events">
              <a className="fb-create-btn">
                <Plus size={18} />
                {t('firma.create_event')}
              </a>
            </Link>
          </div>

          {/* ── Tip banner when data is sparse ── */}
          {stats.followers === 0 && stats.signups === 0 && (
            <div className="fb-tip fb-fade-up fb-d1">
              <TrendingUp size={20} className="fb-tip-icon" />
              <div>
                <div className="fb-tip-title">{t('firma.tip_share')}</div>
                <div className="fb-tip-desc">{t('firma.tip_share_desc')}</div>
              </div>
            </div>
          )}

          {/* ── Stat cards ── */}
          <div className="fb-stat-grid fb-fade-up fb-d1">
            {STAT_CARDS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="fb-stat-card">
                  <div className="fb-stat-top">
                    <div className="fb-stat-icon">
                      <Icon size={17} />
                    </div>
                    <ArrowUpRight size={14} className="fb-stat-arrow" />
                  </div>
                  <div className="fb-stat-value">{stat.value.toLocaleString("da-DK")}</div>
                  <div className="fb-stat-label-text">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* ── Main 2-column layout ── */}
          <div className="fb-main-grid">

            {/* ── Left column ── */}
            <div className="fb-left-col">

              {/* Chart row */}
              <div className="fb-chart-row">
                <WeeklyChart data={weeklyViews} />
                <EngagementRing eventsCount={stats.eventsCount} signups={stats.signups} />
              </div>

              {/* Quick actions */}
              <div className="fb-actions-grid fb-fade-up fb-d2">
                <Link href="/firma/events">
                  <a className="fb-action-card">
                    <div className="fb-action-icon fb-action-icon--green">
                      <CalendarPlus size={20} />
                    </div>
                    <div className="fb-action-title">{t('firma.quick_actions.create_event')}</div>
                    <div className="fb-action-desc">{t('firma.quick_actions.create_event_desc')}</div>
                  </a>
                </Link>
                <Link href="/firma/targeting">
                  <a className="fb-action-card">
                    <div className="fb-action-icon fb-action-icon--blue">
                      <Megaphone size={20} />
                    </div>
                    <div className="fb-action-title">{t('firma.quick_actions.targeting')}</div>
                    <div className="fb-action-desc">{t('firma.quick_actions.targeting_desc')}</div>
                  </a>
                </Link>
                <Link href="/firma/analytics">
                  <a className="fb-action-card">
                    <div className="fb-action-icon fb-action-icon--purple">
                      <BarChart3 size={20} />
                    </div>
                    <div className="fb-action-title">{t('firma.quick_actions.analytics')}</div>
                    <div className="fb-action-desc">{t('firma.quick_actions.analytics_desc')}</div>
                  </a>
                </Link>
                <Link href="/firma/rekruttering">
                  <a className="fb-action-card">
                    <div className="fb-action-icon fb-action-icon--orange">
                      <UserPlus size={20} />
                    </div>
                    <div className="fb-action-title">{t('firma.quick_actions.recruitment')}</div>
                    <div className="fb-action-desc">{t('firma.quick_actions.recruitment_desc')}</div>
                  </a>
                </Link>
              </div>

              {/* Upcoming events */}
              <div className="fb-events-card fb-fade-up fb-d3">
                <div className="fb-events-header">
                  <span className="fb-events-title">{t('events.upcoming_events')}</span>
                  <Link href="/firma/events">
                    <a className="fb-events-link">{t('events.see_all')}</a>
                  </Link>
                </div>
                <div>
                  {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                    <div key={event.id} className="fb-event-row">
                      <div>
                        <div className="fb-event-name">{event.title}</div>
                        <div className="fb-event-date">
                          <Clock size={12} /> {new Date(event.date).toLocaleDateString("da-DK")}
                        </div>
                      </div>
                      <div className="fb-event-badge">
                        om {event.daysUntil} dag{event.daysUntil !== 1 ? "e" : ""}
                      </div>
                    </div>
                  )) : (
                    <div className="fb-events-empty">
                      {t('events.no_upcoming')}{" "}
                      <Link href="/firma/events"><a>{t('events.create_now')}</a></Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right column — Insights ── */}
            <div className="fb-right-col">

              {/* Top tags from events */}
              <div className="fb-sidebar-card fb-fade-up fb-d2">
                <div className="fb-sidebar-title">
                  <TrendingUp size={16} />
                  {t('firma.your_categories')}
                </div>
                {topTags.length > 0 ? (
                  <div>
                    {topTags.map((tag) => {
                      const maxCount = topTags[0].count;
                      return (
                        <div key={tag.tag} className="fb-tag-row">
                          <div className="fb-tag-meta">
                            <span className="fb-tag-name">{tag.tag}</span>
                            <span className="fb-tag-count">{tag.count}</span>
                          </div>
                          <div className="fb-tag-track">
                            <div className="fb-tag-fill" style={{ width: `${(tag.count / maxCount) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="fb-no-data">{t('firma.no_categories')}</p>
                )}
              </div>

              {/* News widget */}
              <div className="fb-news-card fb-fade-up fb-d3">
                <div className="fb-news-header">
                  <div className="fb-sidebar-title" style={{ marginBottom: 0 }}>
                    <Newspaper size={16} />
                    {t('firma.news_for_audience')}
                  </div>
                  <div className="fb-live-badge">
                    <span className="fb-live-dot" />
                    <span className="fb-live-text">LIVE</span>
                  </div>
                </div>

                {newsLoading ? (
                  <div className="fb-news-loading">
                    <Loader2 className="fb-spin" size={20} />
                    {t('firma.fetching_news')}
                  </div>
                ) : relevantNews.length > 0 ? (
                  <div className="fb-news-list">
                    {relevantNews.map((news) => (
                      <a
                        key={news.link}
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fb-news-item"
                      >
                        <div className="fb-news-meta">
                          <span>{news.sourceEmoji} {news.source}</span>
                          <span>-</span>
                          <span>{formatNewsTime(news.pubDate)}</span>
                        </div>
                        <div className="fb-news-headline">{news.title}</div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="fb-news-empty">
                    <p className="fb-no-data">{t('firma.no_news')}</p>
                  </div>
                )}
              </div>

              {/* Activity log */}
              <div className="fb-sidebar-card fb-fade-up fb-d4">
                <div className="fb-sidebar-title">{t('firma.recent_activity')}</div>
                <div className="fb-activity-list">
                  {activity.map((item, i) => (
                    <div key={i} className="fb-activity-item">
                      <div className="fb-activity-dot" />
                      <div>
                        <div className="fb-activity-text">{item.text}</div>
                        <div className="fb-activity-time">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
