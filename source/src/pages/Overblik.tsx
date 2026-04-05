import { TrendingUp, Award, Flame, Target, MapPin, Loader2, Compass, MessageCircle, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import { fetchPlaces, fetchEvents, type Place, type Event as SupabaseEvent } from "@/lib/supabase";
import { useFadeUp } from "@/lib/useFadeUp";
import { MinSideSubNav } from "@/components/MinSideSubNav";
import { pageBase } from "@/lib/pageCSSBase";

const MONTHLY_DATA = [
  { monthKey: "overview.month_oct", count: 3 }, { monthKey: "overview.month_nov", count: 5 }, { monthKey: "overview.month_dec", count: 2 },
  { monthKey: "overview.month_jan", count: 7 }, { monthKey: "overview.month_feb", count: 4 }, { monthKey: "overview.month_mar", count: 8 },
];

const maxCount = Math.max(...MONTHLY_DATA.map(d => d.count));

/* ── Scoped CSS ── */
const overblikCSS = `
${pageBase("ov")}

/* ── Body wrapper ── */
.ov-body {
  position: relative; z-index: 1;
  padding: 0 20px 96px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Stat grid ── */
.ov-stat-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.ov-stat-card {
  padding: 20px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  transition: border-color 0.3s, transform 0.3s;
}
.ov-stat-card:hover {
  border-color: rgba(255,255,255,0.14);
  transform: translateY(-2px);
}
.ov-stat-icon {
  width: 36px; height: 36px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.ov-stat-icon--teal    { background: rgba(78,205,196,0.15); color: #4ECDC4; }
.ov-stat-icon--purple  { background: rgba(168,85,247,0.15); color: #c084fc; }
.ov-stat-icon--orange  { background: rgba(249,115,22,0.15); color: #fb923c; }
.ov-stat-icon--blue    { background: rgba(59,130,246,0.15); color: #60a5fa; }
.ov-stat-value {
  font-family: var(--serif);
  font-size: 26px; font-weight: 400;
  color: var(--pg-white); line-height: 1;
}
.ov-stat-desc {
  font-size: 11px; color: var(--pg-white-muted);
  text-transform: uppercase; letter-spacing: 1.2px;
  margin-top: 6px;
}

/* ── Chart section ── */
.ov-chart-card {
  padding: 20px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
}
.ov-chart-title {
  font-family: var(--sans);
  font-size: 14px; font-weight: 600;
  color: var(--pg-white); margin-bottom: 16px;
}
.ov-chart-bars {
  display: flex; align-items: flex-end; gap: 8px;
  height: 128px;
}
.ov-bar-col {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 4px; height: 100%;
  justify-content: flex-end;
}
.ov-bar-value {
  font-size: 11px; font-weight: 500;
  color: rgba(255,255,255,0.5);
}
.ov-bar {
  width: 100%; border-radius: 6px 6px 0 0;
  background: linear-gradient(180deg, rgba(78,205,196,0.9) 0%, rgba(78,205,196,0.45) 100%);
  transition: height 0.6s cubic-bezier(0.23,1,0.32,1);
  position: relative;
}
.ov-bar::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 2px; border-radius: 6px 6px 0 0;
  background: #4ECDC4;
  box-shadow: 0 0 8px rgba(78,205,196,0.6);
}
.ov-bar-label {
  font-size: 11px; color: rgba(255,255,255,0.3);
  margin-top: 4px;
}

/* ── Category breakdown ── */
.ov-cat-card {
  padding: 20px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
}
.ov-cat-title {
  font-family: var(--sans);
  font-size: 14px; font-weight: 600;
  color: var(--pg-white); margin-bottom: 16px;
}
.ov-cat-subtitle {
  font-size: 11px; font-weight: 400;
  color: var(--pg-white-muted); margin-left: 6px;
}
.ov-cat-list {
  display: flex; flex-direction: column; gap: 14px;
}
.ov-cat-row-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.ov-cat-name {
  font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.7);
}
.ov-cat-pct {
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.45);
}
.ov-cat-track {
  height: 6px; border-radius: 100px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}
.ov-cat-fill {
  height: 100%; border-radius: 100px;
  transition: width 0.7s cubic-bezier(0.23,1,0.32,1);
}
.ov-cat-fill--teal    { background: linear-gradient(90deg, rgba(78,205,196,0.5), #4ECDC4); }
.ov-cat-fill--orange  { background: linear-gradient(90deg, rgba(251,146,60,0.5), #fb923c); }
.ov-cat-fill--amber   { background: linear-gradient(90deg, rgba(251,191,36,0.5), #fbbf24); }
.ov-cat-fill--purple  { background: linear-gradient(90deg, rgba(192,132,252,0.5), #c084fc); }
.ov-cat-fill--pink    { background: linear-gradient(90deg, rgba(244,114,182,0.5), #f472b6); }
.ov-cat-fill--blue    { background: linear-gradient(90deg, rgba(96,165,250,0.5), #60a5fa); }
.ov-cat-fill--default { background: linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.35)); }

/* ── Database status ── */
.ov-db-card {
  padding: 20px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
}
.ov-db-title {
  font-family: var(--sans);
  font-size: 14px; font-weight: 600;
  color: var(--pg-white); margin-bottom: 14px;
}
.ov-db-rows {
  display: flex; flex-direction: column; gap: 10px;
}
.ov-db-row {
  display: flex; align-items: center; justify-content: space-between;
}
.ov-db-key {
  font-size: 13px; color: rgba(255,255,255,0.5);
}
.ov-db-val {
  font-size: 13px; font-weight: 700; color: var(--teal);
}
.ov-db-val--amber { color: #fbbf24; }

/* ── Quick actions ── */
.ov-actions-title {
  font-family: var(--sans);
  font-size: 14px; font-weight: 600;
  color: var(--pg-white); margin-bottom: 14px;
}
.ov-actions-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.ov-action-link {
  display: flex; align-items: center; gap: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  text-decoration: none;
  color: var(--pg-white);
  transition: border-color 0.3s, transform 0.3s;
}
.ov-action-link:hover {
  border-color: rgba(78,205,196,0.3);
  transform: translateY(-2px);
}
.ov-action-icon {
  width: 36px; height: 36px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(78,205,196,0.12); color: #4ECDC4;
  flex-shrink: 0;
}
.ov-action-label {
  font-size: 13px; font-weight: 500;
}
`;

/* ── Color helpers ── */
const catFillClass: Record<string, string> = {
  "bg-[#4ECDC4]": "ov-cat-fill--teal",
  "bg-orange-400": "ov-cat-fill--orange",
  "bg-amber-400": "ov-cat-fill--amber",
  "bg-purple-400": "ov-cat-fill--purple",
  "bg-pink-400": "ov-cat-fill--pink",
  "bg-blue-400": "ov-cat-fill--blue",
  "bg-white/30": "ov-cat-fill--default",
};

export default function Overblik() {
  const { t } = useTranslation();
  const containerRef = useFadeUp("ov");

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
    <>
      <style>{overblikCSS}</style>
      <div
        className="ov-root"
        ref={containerRef}
        data-testid="overblik-page"
      >
        {/* Cover */}
        <div className="ov-cover">
          <img src="/dashboard-hero.png" alt="" loading="lazy" />
          <div className="ov-cover-overlay" />
        </div>

        {/* Identity */}
        <div className="ov-identity ov-fade-up">
          <div className="ov-avatar">📊</div>
          <h1 className="ov-identity-title"><em>Overblik</em></h1>
          <p className="ov-identity-sub">{eventsCount} events · {placesCount} steder</p>
        </div>

        {/* Stats */}
        <div className="ov-stats ov-fade-up ov-d1">
          <div className="ov-stat-card">
            <div className="ov-stat-val">{eventsCount > 0 ? eventsCount : 29}</div>
            <div className="ov-stat-lbl">{t('overview.events_in_db')}</div>
          </div>
          <div className="ov-stat-card">
            <div className="ov-stat-val">{placesCount}</div>
            <div className="ov-stat-lbl">{t('overview.places_in_db')}</div>
          </div>
          <div className="ov-stat-card">
            <div className="ov-stat-val">12</div>
            <div className="ov-stat-lbl">{t('overview.active_streak')}</div>
          </div>
        </div>

        <div className="ov-body">
          <MinSideSubNav />

          {/* Quick actions */}
          <div className="ov-fade-up">
            <h3 className="ov-actions-title">Hurtige handlinger</h3>
            <div className="ov-actions-grid">
              <Link href="/udforsk" className="ov-action-link">
                <div className="ov-action-icon"><Compass size={16} /></div>
                <span className="ov-action-label">Udforsk</span>
              </Link>
              <Link href="/kort" className="ov-action-link">
                <div className="ov-action-icon"><MapPin size={16} /></div>
                <span className="ov-action-label">Kort</span>
              </Link>
              <Link href="/beskeder" className="ov-action-link">
                <div className="ov-action-icon"><MessageCircle size={16} /></div>
                <span className="ov-action-label">Beskeder</span>
              </Link>
              <Link href="/kalender" className="ov-action-link">
                <div className="ov-action-icon"><Calendar size={16} /></div>
                <span className="ov-action-label">Kalender</span>
              </Link>
            </div>
          </div>

          {/* Stat cards */}
          <div className="ov-stat-grid ov-fade-up">
            <div className="ov-stat-card">
              <div className="ov-stat-icon ov-stat-icon--teal">
                <Target size={16} />
              </div>
              <p className="ov-stat-value">{eventsCount > 0 ? eventsCount : 29}</p>
              <p className="ov-stat-desc">{t('overview.events_in_db')}</p>
            </div>
            <div className="ov-stat-card">
              <div className="ov-stat-icon ov-stat-icon--purple">
                <MapPin size={16} />
              </div>
              <p className="ov-stat-value">{placesCount}</p>
              <p className="ov-stat-desc">{t('overview.places_in_db')}</p>
            </div>
            <div className="ov-stat-card">
              <div className="ov-stat-icon ov-stat-icon--orange">
                <Flame size={16} />
              </div>
              <p className="ov-stat-value">12 {t('overview.days')}</p>
              <p className="ov-stat-desc">{t('overview.active_streak')}</p>
            </div>
            <div className="ov-stat-card">
              <div className="ov-stat-icon ov-stat-icon--blue">
                <Award size={16} />
              </div>
              <p className="ov-stat-value">{topCategory.emoji} {topCategory.name}</p>
              <p className="ov-stat-desc">{t('overview.most_active_category')}</p>
            </div>
          </div>

          {/* Monthly activity chart */}
          <div className="ov-chart-card ov-fade-up ov-d1">
            <h3 className="ov-chart-title">{t('overview.activity_per_month')}</h3>
            <div className="ov-chart-bars">
              {MONTHLY_DATA.map((d) => (
                <div key={d.monthKey} className="ov-bar-col">
                  <span className="ov-bar-value">{d.count}</span>
                  <div className="ov-bar" style={{ height: `${(d.count / maxCount) * 100}%` }} />
                  <span className="ov-bar-label">{t(d.monthKey)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="ov-cat-card ov-fade-up ov-d2">
            <h3 className="ov-cat-title">
              {t('overview.categories')}
              {placesCount > 0 && <span className="ov-cat-subtitle">({t('overview.from_database')})</span>}
            </h3>
            <div className="ov-cat-list">
              {categoryStats.map((cat) => (
                <div key={cat.name}>
                  <div className="ov-cat-row-head">
                    <span className="ov-cat-name">{cat.emoji} {cat.name}</span>
                    <span className="ov-cat-pct">{cat.pct}%</span>
                  </div>
                  <div className="ov-cat-track">
                    <div
                      className={`ov-cat-fill ${catFillClass[cat.color] || "ov-cat-fill--default"}`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database overview */}
          {placesCount > 0 && (
            <div className="ov-db-card ov-fade-up ov-d3">
              <h3 className="ov-db-title">{t('overview.database_status')}</h3>
              <div className="ov-db-rows">
                <div className="ov-db-row">
                  <span className="ov-db-key">{t('overview.places')}</span>
                  <span className="ov-db-val">{placesCount}</span>
                </div>
                <div className="ov-db-row">
                  <span className="ov-db-key">{t('overview.events')}</span>
                  <span className="ov-db-val">{eventsCount}</span>
                </div>
                <div className="ov-db-row">
                  <span className="ov-db-key">{t('overview.average_rating')}</span>
                  <span className="ov-db-val ov-db-val--amber">
                    {places ? (places.reduce((s, p) => s + (p.rating_avg || 0), 0) / places.length).toFixed(1) : "–"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
