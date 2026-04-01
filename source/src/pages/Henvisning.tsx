import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Copy,
  Check,
  LogIn,
  ArrowLeft,
  TrendingUp,
  Users,
  Wallet,
  Clock,
  ChevronRight,
  Banknote,
  Gift,
  Link2,
  CircleDollarSign,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ─────────────────────────────────────────────────────────── */
const henvisningCSS = `
${pageBase("hv")}

/* ── Hero background ── */
.hv-hero-bg {
  position: relative;
  min-height: 320px;
  background: url('/revenue-hero.png') center/cover no-repeat;
}
.hv-hero-bg::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(180deg,
    rgba(6,10,15,0.4) 0%,
    rgba(6,10,15,0.75) 50%,
    rgba(6,10,15,1) 100%);
  pointer-events: none;
}
.hv-hero-inner {
  position: relative; z-index: 1;
  max-width: 720px; margin: 0 auto;
  padding: 72px 24px 48px;
}

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
  display: flex; flex-direction: column; gap: 24px;
}

/* ── Hero card ── */
.hv-hero-card {
  position: relative; overflow: hidden;
  border-radius: 20px; padding: 32px;
  background: linear-gradient(135deg,
    rgba(78,205,196,0.12) 0%,
    rgba(78,205,196,0.04) 40%,
    rgba(6,10,15,0.6) 100%);
  border: 1px solid rgba(78,205,196,0.15);
}
.hv-hero-glow {
  position: absolute; top: -60px; right: -60px;
  width: 200px; height: 200px; border-radius: 50%;
  background: rgba(78,205,196,0.08);
  filter: blur(60px); pointer-events: none;
}
.hv-hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; color: var(--teal);
  text-transform: uppercase; letter-spacing: 2px;
  background: rgba(78,205,196,0.12);
  border: 1px solid rgba(78,205,196,0.2);
  padding: 5px 14px; border-radius: 100px;
}
.hv-hero-title {
  font-family: var(--serif); font-size: clamp(26px, 4vw, 36px);
  font-weight: 400; line-height: 1.1; margin-top: 16px;
  color: var(--pg-white);
}
.hv-hero-title em { font-style: italic; color: var(--teal); }
.hv-hero-desc {
  font-size: 14px; color: var(--pg-white-dim);
  line-height: 1.65; margin-top: 10px; max-width: 420px;
}

/* ── Stats grid ── */
.hv-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
}
.hv-stat-card {
  padding: 20px; border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  display: flex; flex-direction: column; gap: 10px;
  transition: background 0.3s, border-color 0.3s;
}
.hv-stat-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}
.hv-stat-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.hv-stat-icon-teal  { background: rgba(78,205,196,0.1); color: var(--teal); }
.hv-stat-icon-amber { background: rgba(251,191,36,0.1); color: #fbbf24; }
.hv-stat-icon-green { background: rgba(52,211,153,0.1); color: #34d399; }
.hv-stat-val {
  font-family: var(--serif); font-size: 24px;
  font-weight: 400; color: var(--pg-white); line-height: 1;
}
.hv-stat-lbl {
  font-size: 11px; color: var(--pg-white-muted);
  text-transform: uppercase; letter-spacing: 1.2px;
  line-height: 1.3;
}

/* ── Link card ── */
.hv-link-card {
  border-radius: 16px; padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}
.hv-link-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px;
}
.hv-link-header svg { color: var(--teal); }
.hv-link-header span {
  font-size: 13px; font-weight: 600; color: var(--pg-white-dim);
}
.hv-link-row {
  display: flex; align-items: center; gap: 10px;
}
.hv-link-input {
  flex: 1; padding: 12px 16px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; color: var(--pg-white-dim);
  font-size: 13px; font-family: 'DM Mono', monospace;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.hv-copy-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 12px 20px; border-radius: 12px;
  font-size: 13px; font-weight: 600; font-family: var(--sans);
  cursor: pointer; transition: all 0.25s; white-space: nowrap;
  border: none;
}
.hv-copy-btn-default {
  background: var(--teal); color: var(--bg);
}
.hv-copy-btn-default:hover {
  box-shadow: 0 4px 20px var(--teal-glow);
  transform: translateY(-1px);
}
.hv-copy-btn-done {
  background: rgba(52,211,153,0.15);
  color: #34d399;
  border: 1px solid rgba(52,211,153,0.25);
}
.hv-link-hint {
  font-size: 12px; color: var(--pg-white-muted);
  margin-top: 12px; line-height: 1.5;
}

/* ── Section card (reusable) ── */
.hv-section {
  border-radius: 16px; padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}
.hv-section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 600; color: var(--pg-white-dim);
  text-transform: uppercase; letter-spacing: 1.8px;
  margin-bottom: 20px;
}
.hv-section-title svg { color: var(--teal); }

/* ── How-it-works steps ── */
.hv-steps { display: flex; flex-direction: column; gap: 20px; }
.hv-step {
  display: flex; align-items: flex-start; gap: 16px;
}
.hv-step-icon {
  width: 44px; height: 44px; border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.hv-step-body { flex: 1; padding-top: 2px; }
.hv-step-name {
  font-size: 14px; font-weight: 600; color: var(--pg-white);
  margin-bottom: 2px;
}
.hv-step-desc {
  font-size: 12px; color: var(--pg-white-muted); line-height: 1.55;
}

/* ── Commission table ── */
.hv-comm-list { display: flex; flex-direction: column; gap: 12px; }
.hv-comm-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; border-radius: 14px; padding: 16px 18px;
  transition: background 0.25s;
}
.hv-comm-row-starter {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
}
.hv-comm-row-vaekst {
  background: rgba(78,205,196,0.05);
  border: 1px solid rgba(78,205,196,0.15);
}
.hv-comm-row-partner {
  background: rgba(52,211,153,0.05);
  border: 1px solid rgba(52,211,153,0.15);
}
.hv-comm-left { flex: 1; }
.hv-comm-plan {
  font-size: 14px; font-weight: 700; margin-bottom: 2px;
}
.hv-comm-plan-muted { color: var(--pg-white-muted); }
.hv-comm-plan-teal  { color: var(--teal); }
.hv-comm-plan-green { color: #34d399; }
.hv-comm-share {
  font-size: 11px; color: var(--pg-white-muted);
  margin-left: 8px; font-weight: 400;
}
.hv-comm-desc { font-size: 12px; color: var(--pg-white-muted); }
.hv-comm-right { text-align: right; flex-shrink: 0; }
.hv-comm-cut {
  font-size: 14px; font-weight: 700;
}
.hv-comm-cut-muted { color: var(--pg-white-muted); }
.hv-comm-cut-teal  { color: var(--teal); }
.hv-comm-cut-green { color: #34d399; }
.hv-comm-sub {
  font-size: 11px; color: var(--pg-white-muted);
}
.hv-comm-note {
  font-size: 12px; color: var(--pg-white-muted);
  margin-top: 16px; line-height: 1.55;
}

/* ── Referred users ── */
.hv-ref-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.hv-ref-list { display: flex; flex-direction: column; gap: 6px; }
.hv-ref-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 12px;
  transition: background 0.25s; cursor: default;
}
.hv-ref-row:hover { background: rgba(255,255,255,0.04); }
.hv-ref-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(78,205,196,0.12);
  border: 1px solid rgba(78,205,196,0.18);
  display: flex; align-items: center; justify-content: center;
  color: var(--teal); font-size: 13px; font-weight: 700;
  flex-shrink: 0;
}
.hv-ref-info { flex: 1; min-width: 0; }
.hv-ref-name {
  font-size: 14px; font-weight: 500; color: var(--pg-white);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.hv-ref-meta {
  font-size: 12px; color: var(--pg-white-muted);
}
.hv-ref-chevron { color: rgba(255,255,255,0.15); flex-shrink: 0; }
.hv-ref-empty {
  text-align: center; padding: 40px 0;
}
.hv-ref-empty-icon { font-size: 36px; margin-bottom: 12px; }
.hv-ref-empty-text { font-size: 14px; color: var(--pg-white-muted); }
.hv-ref-empty-hint { font-size: 12px; color: var(--pg-white-muted); margin-top: 4px; }

/* ── Skeleton shimmer ── */
.hv-skeleton {
  display: flex; align-items: center; gap: 12px;
}
.hv-skeleton-circle {
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  animation: hv-pulse 1.5s ease-in-out infinite;
}
.hv-skeleton-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.hv-skeleton-line {
  height: 10px; border-radius: 6px;
  background: rgba(255,255,255,0.06);
  animation: hv-pulse 1.5s ease-in-out infinite;
}
.hv-skeleton-line-short { width: 45%; }
.hv-skeleton-line-long  { width: 70%; }
@keyframes hv-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ── Footer note ── */
.hv-footer {
  text-align: center; padding: 8px 0 24px;
  font-size: 12px; color: var(--pg-white-muted);
  line-height: 1.55; max-width: 360px; margin: 0 auto;
}

/* ── Anonymous view ── */
.hv-anon {
  min-height: 100vh; display: flex;
  align-items: center; justify-content: center; padding: 24px;
}
.hv-anon-inner { width: 100%; max-width: 420px; }
.hv-anon-center { text-align: center; margin-bottom: 40px; }
.hv-anon-icon-wrap {
  display: inline-flex; align-items: center; justify-content: center;
  width: 80px; height: 80px; border-radius: 24px;
  background: linear-gradient(135deg, rgba(78,205,196,0.25), rgba(78,205,196,0.06));
  border: 1px solid rgba(78,205,196,0.18);
  margin-bottom: 24px;
}
.hv-anon-icon-wrap svg { color: var(--teal); }
.hv-anon-h1 {
  font-family: var(--serif); font-size: 28px; font-weight: 400;
  color: var(--pg-white); margin-bottom: 12px;
}
.hv-anon-h1 em { font-style: italic; color: var(--teal); }
.hv-anon-sub {
  font-size: 15px; color: var(--pg-white-dim);
  line-height: 1.6; max-width: 320px; margin: 0 auto;
}
.hv-anon-steps { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
.hv-anon-step {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px; border-radius: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
}
.hv-anon-step-emoji { font-size: 22px; }
.hv-anon-step-text {
  font-size: 14px; font-weight: 500; color: var(--pg-white-dim);
}
.hv-anon-cta {
  width: 100%; padding: 16px; border-radius: 14px;
  background: var(--teal); color: var(--bg);
  font-size: 15px; font-weight: 600; font-family: var(--sans);
  border: none; cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-bottom: 10px;
}
.hv-anon-cta:hover {
  box-shadow: 0 8px 32px var(--teal-glow);
  transform: translateY(-1px);
}
.hv-anon-cta:active { transform: scale(0.98); }
.hv-anon-back {
  width: 100%; padding: 14px; border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  color: var(--pg-white-dim); font-size: 13px; font-weight: 500;
  font-family: var(--sans); cursor: pointer; transition: all 0.25s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.hv-anon-back:hover { background: rgba(255,255,255,0.08); }

/* ── Responsive ── */
@media (max-width: 600px) {
  .hv-stats { grid-template-columns: 1fr; }
  .hv-hero-card { padding: 24px; }
  .hv-comm-row { flex-direction: column; align-items: flex-start; gap: 6px; }
  .hv-comm-right { text-align: left; }
}
`;

interface ReferredUser {
  id: string;
  name: string;
  city?: string;
  created_at: string;
}

export default function Henvisning() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [referredCount, setReferredCount] = useState<number | null>(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const containerRef = useFadeUp("hv");

  const referralLink = user ? `https://b-social.net/?ref=${user.id}` : "";

  useEffect(() => {
    if (!user) return;
    setLoadingReferrals(true);
    // Query profiles that signed up with this user's referral code
    supabase
      .from("profiles")
      .select("id, name, city, created_at")
      .eq("referred_by", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error && data) {
          setReferredUsers(data as ReferredUser[]);
          setReferredCount(data.length);
        } else {
          setReferredCount(0);
        }
        setLoadingReferrals(false);
      });
  }, [user]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // ─── Anonymous view ───────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <style>{henvisningCSS}</style>
        <div ref={containerRef} className="hv-root">
          <div className="hv-anon">
            <div className="hv-anon-inner">
              {/* Icon + headline */}
              <div className="hv-anon-center hv-fade-up">
                <div className="hv-anon-icon-wrap">
                  <CircleDollarSign size={38} />
                </div>
                <h1 className="hv-anon-h1">Tjen penge med <em>B-Social</em></h1>
                <p className="hv-anon-sub">
                  Del dit link — og tjen provision hver gang dine henvisninger bruger platformen.
                </p>
              </div>

              {/* Preview steps */}
              <div className="hv-anon-steps hv-fade-up hv-d1">
                {[
                  { icon: "🔗", text: "Del dit personlige henvisningslink" },
                  { icon: "👤", text: "Nye brugere opretter konto via dit link" },
                  { icon: "💰", text: "Tjen provision når de køber billetter eller bruger Firma" },
                ].map((step, i) => (
                  <div key={i} className="hv-anon-step">
                    <span className="hv-anon-step-emoji">{step.icon}</span>
                    <span className="hv-anon-step-text">{step.text}</span>
                  </div>
                ))}
              </div>

              <div className="hv-fade-up hv-d2">
                <button
                  onClick={() => setLocation("/auth")}
                  className="hv-anon-cta"
                >
                  <LogIn size={18} />
                  Log ind for at starte med at tjene penge
                </button>
                <button
                  onClick={() => setLocation("/feed")}
                  className="hv-anon-back"
                >
                  <ArrowLeft size={16} />
                  Tilbage til feed
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Logged-in view ───────────────────────────────────────────────────────
  return (
    <>
      <style>{henvisningCSS}</style>
      <div ref={containerRef} className="hv-root">

        {/* Header */}
        <div className="hv-header">
          <div className="hv-header-inner">
            <button onClick={() => setLocation("/feed")} className="hv-back">
              <ArrowLeft size={18} />
            </button>
            <div className="hv-header-title">
              <CircleDollarSign size={20} />
              <span>Tjen penge med B-Social</span>
            </div>
          </div>
        </div>

        <div className="hv-content">

          {/* Hero card */}
          <div className="hv-hero-card hv-fade-up">
            <div className="hv-hero-glow" />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>💰</span>
                <span className="hv-hero-badge">Passiv indkomst</span>
              </div>
              <h2 className="hv-hero-title">
                <em>Henvisnings</em>program
              </h2>
              <p className="hv-hero-desc">
                Del dit unikke link og tjen provision når dine henvisninger opretter en Firma-konto og køber billetter på B-Social.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="hv-stats hv-fade-up hv-d1">
            {[
              {
                icon: <Users size={18} />,
                cls: "hv-stat-icon-teal",
                label: "Henviste brugere",
                value: referredCount === null ? "–" : String(referredCount),
              },
              {
                icon: <Clock size={18} />,
                cls: "hv-stat-icon-amber",
                label: "Ventende provision",
                value: "0 kr",
              },
              {
                icon: <Wallet size={18} />,
                cls: "hv-stat-icon-green",
                label: "Udbetalt",
                value: "0 kr",
              },
            ].map((stat, i) => (
              <div key={i} className="hv-stat-card">
                <div className={`hv-stat-icon ${stat.cls}`}>
                  {stat.icon}
                </div>
                <p className="hv-stat-val">{stat.value}</p>
                <p className="hv-stat-lbl">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Referral link card */}
          <div className="hv-link-card hv-fade-up hv-d2">
            <div className="hv-link-header">
              <Link2 size={16} />
              <span>Dit henvisningslink</span>
            </div>
            <div className="hv-link-row">
              <div className="hv-link-input">{referralLink}</div>
              <button
                onClick={copyLink}
                className={`hv-copy-btn ${copied ? "hv-copy-btn-done" : "hv-copy-btn-default"}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Kopieret!" : "Kopiér"}
              </button>
            </div>
            <p className="hv-link-hint">
              Del dette link på sociale medier, i din bio eller direkte til kontakter.
            </p>
          </div>

          {/* How it works */}
          <div className="hv-section hv-fade-up hv-d3">
            <h3 className="hv-section-title">
              <TrendingUp size={14} />
              Sådan virker det
            </h3>
            <div className="hv-steps">
              {[
                {
                  icon: "🔗",
                  title: "Del dit link",
                  desc: "Kopiér dit personlige link og del det overalt — sociale medier, e-mail eller direkte til din netværk.",
                },
                {
                  icon: "👤",
                  title: "Nye brugere opretter konto",
                  desc: "Når nogen klikker på dit link og opretter en konto, registreres de automatisk under dig.",
                },
                {
                  icon: "💰",
                  title: "Tjen provision",
                  desc: "Hver gang dine henvisninger køber billetter til events eller opgraderer til Firma, tjener du provision.",
                },
              ].map((step, i) => (
                <div key={i} className="hv-step">
                  <div className="hv-step-icon">{step.icon}</div>
                  <div className="hv-step-body">
                    <p className="hv-step-name">{step.title}</p>
                    <p className="hv-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commission rates */}
          <div className="hv-section hv-fade-up hv-d4">
            <h3 className="hv-section-title">
              <Banknote size={14} />
              Provisionssatser — Firma abonnementer
            </h3>
            <div className="hv-comm-list">
              {[
                {
                  plan: "Starter",
                  bsocial: "0% rev. share",
                  yourCut: "0 kr",
                  desc: "Gratis plan — ingen omsætningsdeling",
                  rowCls: "hv-comm-row-starter",
                  planCls: "hv-comm-plan-muted",
                  cutCls: "hv-comm-cut-muted",
                },
                {
                  plan: "Vækst",
                  bsocial: "5% rev. share",
                  yourCut: "0,5% af omsætning",
                  desc: "Du får 10% af B-Socials andel",
                  rowCls: "hv-comm-row-vaekst",
                  planCls: "hv-comm-plan-teal",
                  cutCls: "hv-comm-cut-teal",
                },
                {
                  plan: "Partner",
                  bsocial: "3% rev. share",
                  yourCut: "0,3% af omsætning",
                  desc: "Du får 10% af B-Socials andel",
                  rowCls: "hv-comm-row-partner",
                  planCls: "hv-comm-plan-green",
                  cutCls: "hv-comm-cut-green",
                },
              ].map((row) => (
                <div key={row.plan} className={`hv-comm-row ${row.rowCls}`}>
                  <div className="hv-comm-left">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className={`hv-comm-plan ${row.planCls}`}>{row.plan}</span>
                      <span className="hv-comm-share">{row.bsocial}</span>
                    </div>
                    <p className="hv-comm-desc">{row.desc}</p>
                  </div>
                  <div className="hv-comm-right">
                    <p className={`hv-comm-cut ${row.cutCls}`}>{row.yourCut}</p>
                    <p className="hv-comm-sub">din provision</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="hv-comm-note">
              Provision beregnes automatisk og udbetales månedligt. Minimum udbetaling: 100 kr. Stripe-integration kommer snart.
            </p>
          </div>

          {/* Referred users list */}
          <div className="hv-section hv-fade-up">
            <div className="hv-ref-header">
              <h3 className="hv-section-title" style={{ marginBottom: 0 }}>
                <Gift size={14} />
                Dine henvisninger ({referredCount === null ? "–" : referredCount})
              </h3>
            </div>

            {loadingReferrals ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="hv-skeleton">
                    <div className="hv-skeleton-circle" />
                    <div className="hv-skeleton-lines">
                      <div className="hv-skeleton-line hv-skeleton-line-long" />
                      <div className="hv-skeleton-line hv-skeleton-line-short" />
                    </div>
                  </div>
                ))}
              </div>
            ) : referredUsers.length === 0 ? (
              <div className="hv-ref-empty">
                <div className="hv-ref-empty-icon">🔗</div>
                <p className="hv-ref-empty-text">Ingen henvisninger endnu</p>
                <p className="hv-ref-empty-hint">Del dit link for at komme i gang</p>
              </div>
            ) : (
              <div className="hv-ref-list">
                {referredUsers.map((u) => (
                  <div key={u.id} className="hv-ref-row">
                    <div className="hv-ref-avatar">
                      {u.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="hv-ref-info">
                      <p className="hv-ref-name">{u.name}</p>
                      <p className="hv-ref-meta">
                        {u.city ? `${u.city} · ` : ""}Tilmeldt {formatDate(u.created_at)}
                      </p>
                    </div>
                    <ChevronRight size={14} className="hv-ref-chevron" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom note */}
          <p className="hv-footer hv-fade-up">
            Provisionssystemet er under udvikling. Alle henvisninger registreres nu og vil tælle med, når udbetaling aktiveres.
          </p>

        </div>
      </div>
    </>
  );
}
