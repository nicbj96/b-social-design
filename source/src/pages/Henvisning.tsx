import { useRef, useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  ArrowLeft,
  Users,
  Wallet,
  Clock,
  ChevronRight,
  Gift,
  Trophy,
  Shield,
  Rocket,
  Star,
  Zap,
  UserPlus,
  Crown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Mock data ─────────────────────────────────────────────────────────── */
const MOCK_REFERRALS = [
  { id: "r1", name: "Anna Jensen", avatar: "AJ", joinDate: "12. mar 2026", earned: "75 DKK" },
  { id: "r2", name: "Kasper Thomsen", avatar: "KT", joinDate: "3. mar 2026", earned: "120 DKK" },
  { id: "r3", name: "Sofie Andersen", avatar: "SA", joinDate: "18. feb 2026", earned: "100 DKK" },
  { id: "r4", name: "Emil Rasmussen", avatar: "ER", joinDate: "2. feb 2026", earned: "90 DKK" },
  { id: "r5", name: "Maja Kristensen", avatar: "MK", joinDate: "22. jan 2026", earned: "65 DKK" },
];

const MOCK_EARNINGS_CHART = [
  { month: "Jan", value: 180 },
  { month: "Feb", value: 260 },
  { month: "Mar", value: 340 },
  { month: "Apr", value: 225 },
  { month: "Maj", value: 240 },
];

const MOCK_REWARDS = [
  { id: "rw1", icon: "crown", title: "Gratis Premium Måned", desc: "Nå 20 henvisninger", progress: 70 },
  { id: "rw2", icon: "shield", title: "Eksklusivt Badge", desc: "Nå 15 henvisninger", progress: 93 },
  { id: "rw3", icon: "rocket", title: "Early Access", desc: "Nå 25 henvisninger", progress: 56 },
];

const MOCK_ACTIVITY = [
  { id: "a1", text: "Bruger123 accepterede din henvisning", time: "10 timer siden", points: "+2" },
  { id: "a2", text: "Sofie A. opgraderede til Premium", time: "13 timer siden", points: "+5" },
  { id: "a3", text: "Emil R. accepterede din henvisning", time: "18 timer siden", points: "+7" },
];

/* ── Progress ring constants ── */
const RING_RADIUS = 80;
const RING_STROKE = 8;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const CURRENT_REFS = 14;
const NEXT_TIER_REFS = 20;
const RING_PROGRESS = CURRENT_REFS / NEXT_TIER_REFS;

/* ── Scoped CSS ────────────────────────────────────────────────────────── */
const henvisningCSS = `
${pageBase("hv")}

/* ── Header bar ── */
.hv-header {
  position: sticky; top: 0; z-index: 20;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(6,10,15,0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.hv-header-inner {
  max-width: 720px; margin: 0 auto;
  padding: 0 24px; height: 60px;
  display: flex; align-items: center; gap: 14px;
}
.hv-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  color: var(--pg-white-dim); cursor: pointer;
  transition: all 0.25s;
}
.hv-back:hover { background: rgba(255,255,255,0.1); color: var(--teal); }
.hv-header-title {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--sans); font-size: 16px; font-weight: 600;
  color: var(--pg-white);
}
.hv-header-title svg { color: var(--teal); }

/* ── Content wrapper ── */
.hv-content {
  max-width: 720px; margin: 0 auto;
  padding: 32px 24px 64px;
  display: flex; flex-direction: column; gap: 28px;
}

/* ══════════════════════════════════════════
   TOP: Progress Ring (Design C)
   ══════════════════════════════════════════ */
.hv-ring-section {
  display: flex; flex-direction: column; align-items: center;
  padding: 32px 0 8px;
}
.hv-ring-wrap {
  position: relative;
  width: 200px; height: 200px;
}
.hv-ring-svg {
  width: 200px; height: 200px;
  transform: rotate(-90deg);
}
.hv-ring-bg {
  fill: none;
  stroke: rgba(255,255,255,0.06);
  stroke-width: ${RING_STROKE};
}
.hv-ring-fill {
  fill: none;
  stroke: url(#hv-ring-gradient);
  stroke-width: ${RING_STROKE};
  stroke-linecap: round;
  stroke-dasharray: ${RING_CIRCUMFERENCE};
  stroke-dashoffset: ${RING_CIRCUMFERENCE * (1 - RING_PROGRESS)};
  transition: stroke-dashoffset 1.2s cubic-bezier(0.23, 1, 0.32, 1);
}
.hv-ring-label {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
}
.hv-ring-count {
  font-family: var(--serif);
  font-size: 36px; font-weight: 400;
  color: var(--pg-white); line-height: 1;
}
.hv-ring-count span {
  font-size: 22px; color: var(--pg-white-muted);
}
.hv-ring-text {
  font-size: 13px; color: var(--pg-white-muted);
  margin-top: 4px; letter-spacing: 0.5px;
}

/* Tier badge */
.hv-tier-badge {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 16px; padding: 6px 18px; border-radius: 100px;
  background: linear-gradient(135deg, rgba(192,192,192,0.15), rgba(192,192,192,0.05));
  border: 1px solid rgba(192,192,192,0.25);
  font-size: 13px; font-weight: 600; color: #c0c0c0;
  letter-spacing: 1px;
}
.hv-tier-badge svg { color: #c0c0c0; }

/* Stats chips row */
.hv-chips-row {
  display: flex; gap: 10px; margin-top: 18px;
  flex-wrap: wrap; justify-content: center;
}
.hv-stat-chip {
  padding: 8px 16px; border-radius: 100px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
  font-size: 12px; color: var(--pg-white-dim);
  display: flex; align-items: center; gap: 6px;
  white-space: nowrap;
}
.hv-stat-chip-val {
  font-weight: 700; color: var(--teal);
}

/* ══════════════════════════════════════════
   MIDDLE: Earnings Hero (Design A)
   ══════════════════════════════════════════ */
.hv-earnings-hero {
  position: relative; overflow: hidden;
  border-radius: 20px; padding: 32px;
  background: linear-gradient(135deg,
    rgba(78,205,196,0.1) 0%,
    rgba(78,205,196,0.03) 40%,
    rgba(6,10,15,0.6) 100%);
  border: 1px solid rgba(78,205,196,0.15);
  text-align: center;
}
.hv-earnings-glow {
  position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
  width: 240px; height: 120px; border-radius: 50%;
  background: rgba(78,205,196,0.12);
  filter: blur(60px); pointer-events: none;
}
.hv-earnings-amount {
  position: relative; z-index: 1;
  font-family: var(--serif);
  font-size: clamp(40px, 8vw, 56px);
  font-weight: 400; color: var(--pg-white);
  line-height: 1; letter-spacing: -1px;
}
.hv-earnings-currency {
  font-size: clamp(22px, 4vw, 28px);
  color: var(--teal); margin-left: 8px;
}
.hv-earnings-label {
  position: relative; z-index: 1;
  font-size: 13px; color: var(--pg-white-muted);
  margin-top: 8px; text-transform: uppercase;
  letter-spacing: 2px;
}

/* Stats row under earnings hero */
.hv-earnings-stats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px; margin-top: 24px; position: relative; z-index: 1;
}
.hv-earnings-stat {
  padding: 14px 10px; border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  text-align: center;
}
.hv-earnings-stat-val {
  font-family: var(--serif);
  font-size: 18px; font-weight: 400;
  color: var(--pg-white); line-height: 1;
}
.hv-earnings-stat-lbl {
  font-size: 10px; color: var(--pg-white-muted);
  text-transform: uppercase; letter-spacing: 1px;
  margin-top: 5px;
}

/* ── Bar chart ── */
.hv-chart-section {
  border-radius: 16px; padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}
.hv-chart-title {
  font-size: 11px; font-weight: 600; color: var(--pg-white-dim);
  text-transform: uppercase; letter-spacing: 1.8px;
  margin-bottom: 20px;
  display: flex; align-items: center; gap: 8px;
}
.hv-chart-title svg { color: var(--teal); }
.hv-chart {
  display: flex; align-items: flex-end;
  gap: 12px; height: 140px;
  padding-bottom: 24px;
  position: relative;
}
.hv-chart-bar-wrap {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 8px; height: 100%;
  justify-content: flex-end;
}
.hv-chart-bar {
  width: 100%; max-width: 48px; border-radius: 8px 8px 4px 4px;
  background: linear-gradient(180deg, var(--teal) 0%, rgba(78,205,196,0.4) 100%);
  transition: height 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  min-height: 8px;
  position: relative;
}
.hv-chart-bar:hover {
  filter: brightness(1.2);
}
.hv-chart-bar-val {
  font-size: 11px; color: var(--pg-white-dim);
  font-weight: 600; margin-bottom: 4px;
}
.hv-chart-bar-month {
  font-size: 11px; color: var(--pg-white-muted);
  letter-spacing: 0.5px;
}

/* ══════════════════════════════════════════
   BELOW: Referred Users List (Design A)
   ══════════════════════════════════════════ */
.hv-referrals-section {
  border-radius: 16px; padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}
.hv-section-heading {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 600; color: var(--pg-white-dim);
  text-transform: uppercase; letter-spacing: 1.8px;
  margin-bottom: 18px;
}
.hv-section-heading svg { color: var(--teal); }
.hv-ref-list { display: flex; flex-direction: column; gap: 4px; }
.hv-ref-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 14px;
  transition: background 0.25s; cursor: default;
}
.hv-ref-row:hover { background: rgba(255,255,255,0.04); }
.hv-ref-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(78,205,196,0.12);
  border: 1px solid rgba(78,205,196,0.18);
  display: flex; align-items: center; justify-content: center;
  color: var(--teal); font-size: 12px; font-weight: 700;
  flex-shrink: 0;
}
.hv-ref-info { flex: 1; min-width: 0; }
.hv-ref-name {
  font-size: 14px; font-weight: 500; color: var(--pg-white);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.hv-ref-meta {
  font-size: 12px; color: var(--pg-white-muted); margin-top: 1px;
}
.hv-ref-earned {
  font-size: 14px; font-weight: 600; color: var(--teal);
  flex-shrink: 0;
}

/* ══════════════════════════════════════════
   BOTTOM: Rewards Cards (Design C)
   ══════════════════════════════════════════ */
.hv-rewards-section {
  border-radius: 16px; padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}
.hv-rewards-scroll {
  display: flex; gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(78,205,196,0.3) transparent;
}
.hv-rewards-scroll::-webkit-scrollbar { height: 4px; }
.hv-rewards-scroll::-webkit-scrollbar-track { background: transparent; }
.hv-rewards-scroll::-webkit-scrollbar-thumb {
  background: rgba(78,205,196,0.3); border-radius: 4px;
}
.hv-reward-card {
  min-width: 160px; padding: 20px 18px;
  border-radius: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex; flex-direction: column;
  align-items: center; text-align: center; gap: 10px;
  flex-shrink: 0;
  transition: border-color 0.3s, transform 0.3s;
}
.hv-reward-card:hover {
  border-color: rgba(78,205,196,0.25);
  transform: translateY(-2px);
}
.hv-reward-icon {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(78,205,196,0.1);
  color: var(--teal);
}
.hv-reward-title {
  font-size: 13px; font-weight: 600;
  color: var(--pg-white); line-height: 1.3;
}
.hv-reward-desc {
  font-size: 11px; color: var(--pg-white-muted);
}
.hv-reward-bar-bg {
  width: 100%; height: 4px; border-radius: 4px;
  background: rgba(255,255,255,0.08);
  margin-top: 4px; overflow: hidden;
}
.hv-reward-bar-fill {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, var(--teal), rgba(78,205,196,0.6));
  transition: width 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

/* ── Activity feed ── */
.hv-activity-section {
  border-radius: 16px; padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}
.hv-activity-list { display: flex; flex-direction: column; gap: 4px; }
.hv-activity-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 14px;
  transition: background 0.25s;
}
.hv-activity-row:hover { background: rgba(255,255,255,0.03); }
.hv-activity-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--teal); flex-shrink: 0;
  box-shadow: 0 0 8px rgba(78,205,196,0.4);
}
.hv-activity-info { flex: 1; min-width: 0; }
.hv-activity-text {
  font-size: 13px; color: var(--pg-white-dim);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.hv-activity-time {
  font-size: 11px; color: var(--pg-white-muted); margin-top: 2px;
}
.hv-activity-points {
  font-size: 14px; font-weight: 700; color: var(--teal);
  flex-shrink: 0;
}

/* ── CTA Button ── */
.hv-cta {
  width: 100%; padding: 18px; border-radius: 16px;
  background: linear-gradient(135deg, var(--teal), #3bb8b0);
  color: var(--bg);
  font-size: 17px; font-weight: 700; font-family: var(--sans);
  border: none; cursor: pointer;
  transition: all 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  text-decoration: none;
  letter-spacing: 0.5px;
}
.hv-cta:hover {
  box-shadow: 0 8px 40px rgba(78,205,196,0.35);
  transform: translateY(-2px);
}
.hv-cta:active { transform: scale(0.98); }

/* ── Footer ── */
.hv-footer {
  text-align: center; padding: 8px 0 24px;
  font-size: 12px; color: var(--pg-white-muted);
  line-height: 1.55; max-width: 360px; margin: 0 auto;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .hv-content { padding: 24px 16px 64px; gap: 22px; }
  .hv-earnings-stats { grid-template-columns: 1fr; gap: 8px; }
  .hv-earnings-hero { padding: 24px 20px; }
  .hv-ring-wrap { width: 170px; height: 170px; }
  .hv-ring-svg { width: 170px; height: 170px; }
  .hv-ring-count { font-size: 30px; }
  .hv-ring-count span { font-size: 18px; }
  .hv-chips-row { gap: 8px; }
  .hv-stat-chip { font-size: 11px; padding: 6px 12px; }
  .hv-chart { gap: 8px; height: 120px; }
  .hv-reward-card { min-width: 140px; padding: 16px 14px; }
}
`;

/* ── Component ─────────────────────────────────────────────────────────── */
export default function Henvisning() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  const maxEarning = Math.max(...MOCK_EARNINGS_CHART.map((e) => e.value));

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const rewardIcon = (type: string) => {
    switch (type) {
      case "crown": return <Crown size={22} />;
      case "shield": return <Shield size={22} />;
      case "rocket": return <Rocket size={22} />;
      default: return <Star size={22} />;
    }
  };

  return (
    <>
      <style>{henvisningCSS}</style>
      <div ref={containerRef} className="hv-root" data-testid="henvisning-page">

        {/* Header */}
        <div className="hv-header">
          <div className="hv-header-inner">
            <button onClick={() => setLocation("/feed")} className="hv-back">
              <ArrowLeft size={18} />
            </button>
            <div className="hv-header-title">
              <Trophy size={20} />
              <span>Henvisning</span>
            </div>
          </div>
        </div>

        <div className="hv-content">

          {/* ── TOP: Progress Ring (Design C) ── */}
          <div className="hv-ring-section">
            <div className="hv-ring-wrap">
              <svg className="hv-ring-svg" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="hv-ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4ECDC4" />
                    <stop offset="100%" stopColor="#3bb8b0" />
                  </linearGradient>
                </defs>
                <circle
                  className="hv-ring-bg"
                  cx="100" cy="100" r={RING_RADIUS}
                />
                <circle
                  className="hv-ring-fill"
                  cx="100" cy="100" r={RING_RADIUS}
                  style={{
                    strokeDashoffset: animated
                      ? RING_CIRCUMFERENCE * (1 - RING_PROGRESS)
                      : RING_CIRCUMFERENCE,
                  }}
                />
              </svg>
              <div className="hv-ring-label">
                <div className="hv-ring-count">
                  {CURRENT_REFS}<span>/{NEXT_TIER_REFS}</span>
                </div>
                <div className="hv-ring-text">henvisninger</div>
              </div>
            </div>

            {/* Tier badge */}
            <div className="hv-tier-badge">
              <Shield size={14} />
              Solv
            </div>

            {/* Stats chips */}
            <div className="hv-chips-row">
              <div className="hv-stat-chip">
                Total tjent <span className="hv-stat-chip-val">1.245 DKK</span>
              </div>
              <div className="hv-stat-chip">
                Denne uge <span className="hv-stat-chip-val">85 DKK</span>
              </div>
              <div className="hv-stat-chip">
                Ventende <span className="hv-stat-chip-val">120 DKK</span>
              </div>
            </div>
          </div>

          {/* ── MIDDLE: Earnings Hero (Design A) ── */}
          <div className="hv-earnings-hero">
            <div className="hv-earnings-glow" />
            <div className="hv-earnings-amount">
              1.245<span className="hv-earnings-currency">DKK</span>
            </div>
            <div className="hv-earnings-label">Samlet optjent</div>

            <div className="hv-earnings-stats">
              <div className="hv-earnings-stat">
                <div className="hv-earnings-stat-val">14</div>
                <div className="hv-earnings-stat-lbl">Aktive henviste</div>
              </div>
              <div className="hv-earnings-stat">
                <div className="hv-earnings-stat-val">340</div>
                <div className="hv-earnings-stat-lbl">Denne maned</div>
              </div>
              <div className="hv-earnings-stat">
                <div className="hv-earnings-stat-val">1.245</div>
                <div className="hv-earnings-stat-lbl">Samlet optjent</div>
              </div>
            </div>
          </div>

          {/* ── Bar Chart (Design A) ── */}
          <div className="hv-chart-section">
            <div className="hv-chart-title">
              <Zap size={14} />
              Indtjening pr. maned
            </div>
            <div className="hv-chart">
              {MOCK_EARNINGS_CHART.map((bar) => {
                const heightPct = (bar.value / maxEarning) * 100;
                return (
                  <div key={bar.month} className="hv-chart-bar-wrap">
                    <div className="hv-chart-bar-val">{bar.value}</div>
                    <div
                      className="hv-chart-bar"
                      style={{
                        height: animated ? `${heightPct}%` : "4px",
                      }}
                    />
                    <div className="hv-chart-bar-month">{bar.month}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Referred Users List (Design A) ── */}
          <div className="hv-referrals-section">
            <div className="hv-section-heading">
              <Users size={14} />
              Dine henvisninger
            </div>
            <div className="hv-ref-list">
              {MOCK_REFERRALS.map((ref) => (
                <div key={ref.id} className="hv-ref-row">
                  <div className="hv-ref-avatar">{ref.avatar}</div>
                  <div className="hv-ref-info">
                    <div className="hv-ref-name">{ref.name}</div>
                    <div className="hv-ref-meta">Tilmeldt {ref.joinDate}</div>
                  </div>
                  <div className="hv-ref-earned">{ref.earned}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Reward Cards (Design C) ── */}
          <div className="hv-rewards-section">
            <div className="hv-section-heading">
              <Gift size={14} />
              Belonninger
            </div>
            <div className="hv-rewards-scroll">
              {MOCK_REWARDS.map((reward) => (
                <div key={reward.id} className="hv-reward-card">
                  <div className="hv-reward-icon">
                    {rewardIcon(reward.icon)}
                  </div>
                  <div className="hv-reward-title">{reward.title}</div>
                  <div className="hv-reward-desc">{reward.desc}</div>
                  <div className="hv-reward-bar-bg">
                    <div
                      className="hv-reward-bar-fill"
                      style={{ width: animated ? `${reward.progress}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Activity Feed (Design C) ── */}
          <div className="hv-activity-section">
            <div className="hv-section-heading">
              <Clock size={14} />
              Seneste aktivitet
            </div>
            <div className="hv-activity-list">
              {MOCK_ACTIVITY.map((item) => (
                <div key={item.id} className="hv-activity-row">
                  <div className="hv-activity-dot" />
                  <div className="hv-activity-info">
                    <div className="hv-activity-text">{item.text}</div>
                    <div className="hv-activity-time">{item.time}</div>
                  </div>
                  <div className="hv-activity-points">{item.points}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA Button (Design C) ── */}
          <Link href="/inviter" className="hv-cta">
            <UserPlus size={20} />
            Inviter en ven
          </Link>

          {/* Footer note */}
          <p className="hv-footer">
            Belonninger og tier-fremskridt opdateres i realtid. Alle henvisninger taller med fra dag et.
          </p>

        </div>
      </div>
    </>
  );
}
