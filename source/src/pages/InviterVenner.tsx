import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Copy,
  Check,
  Users,
  LogIn,
  Link2,
  ArrowLeft,
  Share2,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ─────────────────────────────────────────────── */
const inviterCSS = `${pageBase("iv")}

/* ── Header bar ── */
.iv-header {
  position: sticky; top: 0; z-index: 10;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(6,10,15,0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.iv-header-inner {
  max-width: 640px; margin: 0 auto;
  padding: 0 24px; height: 64px;
  display: flex; align-items: center; gap: 16px;
}
.iv-back-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: var(--pg-white); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.25s;
}
.iv-back-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(78,205,196,0.3); }
.iv-header-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 17px; font-weight: 700; color: var(--pg-white);
}
.iv-header-icon { color: var(--teal); }

/* ── Content wrapper ── */
.iv-content {
  max-width: 640px; margin: 0 auto;
  padding: 32px 24px; display: flex; flex-direction: column; gap: 24px;
}

/* ── Hero section ── */
.iv-hero { text-align: center; padding: 16px 0 8px; }
.iv-hero-emoji { font-size: 56px; margin-bottom: 12px; }
.iv-hero-title {
  font-family: var(--serif); font-size: clamp(28px, 4vw, 40px);
  font-weight: 400; line-height: 1.1; margin-bottom: 8px;
}
.iv-hero-title em { font-style: italic; color: var(--teal); }
.iv-hero-sub {
  font-size: 14px; color: var(--pg-white-dim); line-height: 1.65;
  max-width: 380px; margin: 0 auto;
}

/* ── Referral link card ── */
.iv-link-card {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 24px; transition: border-color 0.3s;
}
.iv-link-card:hover { border-color: rgba(78,205,196,0.25); }
.iv-link-label {
  font-size: 11px; font-weight: 600; color: var(--teal);
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px;
}
.iv-link-row {
  display: flex; align-items: center; gap: 10px;
}
.iv-link-url {
  flex: 1; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 12px 14px;
  color: var(--pg-white-dim); font-size: 13px; font-family: 'JetBrains Mono', monospace;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.iv-copy-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 20px; border-radius: 12px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.25s; border: none; white-space: nowrap;
  font-family: var(--sans);
}
.iv-copy-btn--default {
  background: var(--teal); color: var(--bg);
}
.iv-copy-btn--default:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px var(--teal-glow);
}
.iv-copy-btn--copied {
  background: rgba(52,211,153,0.15); color: #34d399;
  border: 1px solid rgba(52,211,153,0.3);
}

/* ── Share buttons ── */
.iv-share-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}
.iv-share-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 0; border-radius: 14px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.3s; border: none;
  background: var(--glass-bg); backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-family: var(--sans);
}
.iv-share-btn--fb {
  color: #6cb2ff; border: 1px solid rgba(24,119,242,0.25);
}
.iv-share-btn--fb:hover {
  background: rgba(24,119,242,0.18); border-color: rgba(24,119,242,0.4);
  transform: translateY(-1px);
}
.iv-share-btn--x {
  color: var(--pg-white-dim); border: 1px solid rgba(255,255,255,0.08);
}
.iv-share-btn--x:hover {
  background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15);
  transform: translateY(-1px);
}

/* ── How-it-works card ── */
.iv-how-card {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 24px;
}
.iv-how-title {
  font-size: 11px; font-weight: 600; color: var(--pg-white-muted);
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;
}
.iv-how-list { display: flex; flex-direction: column; gap: 18px; }
.iv-step { display: flex; gap: 14px; }
.iv-step-icon {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.iv-step-title { font-size: 14px; font-weight: 600; color: var(--pg-white); }
.iv-step-desc {
  font-size: 12px; color: var(--pg-white-muted); line-height: 1.5; margin-top: 2px;
}

/* ── Friend count card ── */
.iv-friends-card {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 22px 24px;
  display: flex; align-items: center; gap: 16px;
}
.iv-friends-icon {
  width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
  background: rgba(78,205,196,0.12); border: 1px solid rgba(78,205,196,0.15);
  display: flex; align-items: center; justify-content: center;
  color: var(--teal);
}
.iv-friends-num {
  font-family: var(--serif); font-size: 28px; font-weight: 400;
  color: var(--pg-white); line-height: 1;
}
.iv-friends-label { font-size: 13px; color: var(--pg-white-dim); margin-top: 2px; }
.iv-friends-action { margin-left: auto; }
.iv-friends-link {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 10px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  color: var(--pg-white-dim); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.25s; font-family: var(--sans);
}
.iv-friends-link:hover {
  background: rgba(78,205,196,0.12); border-color: rgba(78,205,196,0.25);
  color: var(--teal);
}

/* ── CTA footer ── */
.iv-footer {
  text-align: center; padding: 8px 0 4px;
  font-size: 12px; color: var(--pg-white-muted);
}

/* ── Anonymous view ── */
.iv-anon {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.iv-anon-wrap { width: 100%; max-width: 420px; }
.iv-anon-center { text-align: center; margin-bottom: 40px; }
.iv-anon-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 80px; height: 80px; border-radius: 24px;
  background: linear-gradient(135deg, rgba(78,205,196,0.25), rgba(78,205,196,0.08));
  border: 1px solid rgba(78,205,196,0.2); margin-bottom: 24px;
  color: var(--teal);
}
.iv-anon-title {
  font-family: var(--serif); font-size: clamp(28px, 4vw, 36px);
  font-weight: 400; line-height: 1.1; margin-bottom: 12px;
}
.iv-anon-title em { font-style: italic; color: var(--teal); }
.iv-anon-sub {
  font-size: 14px; color: var(--pg-white-dim); line-height: 1.65;
  max-width: 300px; margin: 0 auto;
}
.iv-anon-steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 40px; }
.iv-anon-step {
  display: flex; align-items: center; gap: 14px;
  background: var(--glass-bg); backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06); border-radius: 14px;
  padding: 16px 20px;
}
.iv-anon-step-emoji { font-size: 22px; }
.iv-anon-step-text {
  font-size: 13px; font-weight: 500; color: var(--pg-white-dim);
}
.iv-login-btn {
  width: 100%; padding: 16px 0; border-radius: 14px;
  background: var(--teal); color: var(--bg); border: none;
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.3s; font-family: var(--sans);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-bottom: 10px;
}
.iv-login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 32px var(--teal-glow);
}
.iv-back-link {
  width: 100%; padding: 14px 0; border-radius: 14px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  color: var(--pg-white-dim); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.25s; font-family: var(--sans);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.iv-back-link:hover { background: rgba(255,255,255,0.08); }
`;

export default function InviterVenner() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [friendCount, setFriendCount] = useState<number | null>(null);
  const containerRef = useFadeUp("iv");

  const referralLink = user ? `https://b-social.net/?ref=${user.id}` : "";

  useEffect(() => {
    if (!user) return;
    // my_friends is a view of accepted friendships for the current user
    supabase
      .from("my_friends")
      .select("friend_id", { count: "exact", head: true })
      .then(({ count }) => {
        setFriendCount(count ?? 0);
      });
  }, [user]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select the text
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

  function shareOnFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank", "width=600,height=400");
  }

  function shareOnX() {
    const text = encodeURIComponent("Kom med på B-Social — find events og mød nye folk 🎉");
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank", "width=600,height=400");
  }

  // ─── Anonymous view ───────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <style>{inviterCSS}</style>
        <div ref={containerRef} className="iv-root iv-anon">
          <div className="iv-anon-wrap">
            <div className="iv-anon-center iv-fade-up">
              <div className="iv-anon-icon">
                <Link2 size={36} />
              </div>
              <h1 className="iv-anon-title">
                Del <em>B-Social</em>
              </h1>
              <p className="iv-anon-sub">
                Log ind for at få dit personlige link og inviter venner direkte.
              </p>
            </div>

            {/* Steps preview */}
            <div className="iv-anon-steps iv-fade-up iv-d1">
              {[
                { icon: "📤", text: "Del dit link med venner" },
                { icon: "👤", text: "De opretter en konto" },
                { icon: "🎉", text: "I bliver venner automatisk" },
              ].map((step, i) => (
                <div key={i} className="iv-anon-step">
                  <span className="iv-anon-step-emoji">{step.icon}</span>
                  <span className="iv-anon-step-text">{step.text}</span>
                </div>
              ))}
            </div>

            <div className="iv-fade-up iv-d2">
              <button
                onClick={() => setLocation("/auth")}
                className="iv-login-btn"
              >
                <LogIn size={18} />
                Log ind for at få dit link
              </button>
              <button
                onClick={() => setLocation("/feed")}
                className="iv-back-link"
              >
                <ArrowLeft size={16} />
                Tilbage til feed
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Logged-in view ───────────────────────────────────────────────────────
  return (
    <>
      <style>{inviterCSS}</style>
      <div ref={containerRef} className="iv-root">
        {/* Header */}
        <div className="iv-header">
          <div className="iv-header-inner">
            <button
              onClick={() => setLocation("/feed")}
              className="iv-back-btn"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="iv-header-title">
              <Link2 size={20} className="iv-header-icon" />
              <span>Inviter venner</span>
            </div>
          </div>
        </div>

        <div className="iv-content">
          {/* Hero */}
          <div className="iv-hero iv-fade-up">
            <div className="iv-hero-emoji">🎉</div>
            <h2 className="iv-hero-title">
              Del <em>B-Social</em>
            </h2>
            <p className="iv-hero-sub">
              Send dit link til venner — når de opretter en konto via dit link,
              bliver I venner automatisk.
            </p>
          </div>

          {/* Referral link card */}
          <div className="iv-link-card iv-fade-up iv-d1">
            <p className="iv-link-label">Dit personlige link</p>
            <div className="iv-link-row">
              <div className="iv-link-url">{referralLink}</div>
              <button
                onClick={copyLink}
                className={`iv-copy-btn ${
                  copied ? "iv-copy-btn--copied" : "iv-copy-btn--default"
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Kopieret!" : "Kopier link"}
              </button>
            </div>
          </div>

          {/* Share buttons */}
          <div className="iv-share-grid iv-fade-up iv-d2">
            <button
              onClick={shareOnFacebook}
              className="iv-share-btn iv-share-btn--fb"
            >
              <Share2 size={16} />
              Del på Facebook
            </button>
            <button
              onClick={shareOnX}
              className="iv-share-btn iv-share-btn--x"
            >
              <Share2 size={16} />
              Del på X
            </button>
          </div>

          {/* How it works */}
          <div className="iv-how-card iv-fade-up iv-d2">
            <h3 className="iv-how-title">Sådan virker det</h3>
            <div className="iv-how-list">
              {[
                {
                  icon: "📤",
                  title: "Del dit link med venner",
                  desc: "Kopier linket og send det på beskeder, sociale medier eller direkte.",
                },
                {
                  icon: "👤",
                  title: "De opretter en konto",
                  desc: "Din ven klikker på linket og opretter en profil på B-Social.",
                },
                {
                  icon: "🎉",
                  title: "I bliver venner automatisk",
                  desc: "Når de er klar, dukker de op i din venneliste med det samme.",
                },
              ].map((step, i) => (
                <div key={i} className="iv-step">
                  <div className="iv-step-icon">
                    <span>{step.icon}</span>
                  </div>
                  <div>
                    <p className="iv-step-title">{step.title}</p>
                    <p className="iv-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Friend count */}
          <div className="iv-friends-card iv-fade-up iv-d3">
            <div className="iv-friends-icon">
              <Users size={22} />
            </div>
            <div>
              <p className="iv-friends-num">
                {friendCount === null ? "–" : friendCount}
              </p>
              <p className="iv-friends-label">
                {friendCount === 1 ? "ven på B-Social" : "venner på B-Social"}
              </p>
            </div>
            <div className="iv-friends-action">
              <button
                onClick={() => setLocation("/venner")}
                className="iv-friends-link"
              >
                <UserPlus size={14} />
                Se venner
              </button>
            </div>
          </div>

          {/* CTA bottom */}
          <div className="iv-footer iv-fade-up iv-d4">
            Del B-Social — find events og mød folk med de samme interesser 🎊
          </div>
        </div>
      </div>
    </>
  );
}
