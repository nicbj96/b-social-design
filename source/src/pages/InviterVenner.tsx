import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Award,
  MessageSquare,
  Link2,
  CheckCircle,
  Users,
  ArrowLeft,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Mock data ─────────────────────────────────────────────── */
const INVITED_COUNT = 12;
const NEXT_MILESTONE = 20;
const MOCK_FRIENDS = [
  { name: "Anna L.", avatar: "AL", time: "2 minutter siden" },
  { name: "Peter B.", avatar: "PB", time: "1 time siden" },
  { name: "Maria K.", avatar: "MK", time: "3 timer siden" },
  { name: "Jonas H.", avatar: "JH", time: "1 dag siden" },
];

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
  padding: 32px 24px 48px; display: flex; flex-direction: column; gap: 24px;
}

/* ── Achievement card ── */
.iv-achievement {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 20px;
  padding: 32px 24px 28px; text-align: center;
  position: relative; overflow: hidden;
}
.iv-achievement::before {
  content: ''; position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  width: 120px; height: 3px; border-radius: 0 0 3px 3px;
  background: linear-gradient(90deg, transparent, #4ECDC4, transparent);
}
.iv-laurel {
  display: inline-flex; align-items: center; justify-content: center;
  width: 72px; height: 72px; border-radius: 50%; margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(78,205,196,0.18), rgba(78,205,196,0.06));
  border: 1px solid rgba(78,205,196,0.2);
  position: relative;
}
.iv-laurel-icon { color: #4ECDC4; }
.iv-laurel-left, .iv-laurel-right {
  position: absolute; font-size: 28px; top: 50%; transform: translateY(-50%);
}
.iv-laurel-left { left: -18px; }
.iv-laurel-right { right: -18px; }
.iv-achievement-title {
  font-family: var(--serif); font-size: clamp(22px, 3.5vw, 28px);
  font-weight: 400; color: var(--pg-white); line-height: 1.2;
  margin-bottom: 20px;
}
.iv-achievement-title strong { color: #4ECDC4; font-weight: 600; }

/* ── Progress bar ── */
.iv-progress-wrap { padding: 0 8px; margin-bottom: 12px; }
.iv-progress-labels {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
}
.iv-progress-current {
  font-size: 13px; font-weight: 600; color: #4ECDC4;
}
.iv-progress-goal {
  font-size: 13px; color: var(--pg-white-muted);
}
.iv-progress-bar {
  width: 100%; height: 8px; border-radius: 4px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}
.iv-progress-fill {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, #4ECDC4, #38b2ac);
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 0 12px rgba(78,205,196,0.4);
}
.iv-reward-text {
  font-size: 12px; color: var(--pg-white-muted); margin-top: 10px;
}
.iv-reward-text span { color: #4ECDC4; font-weight: 600; }

/* ── QR code card ── */
.iv-qr-card {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(78,205,196,0.15); border-radius: 20px;
  padding: 28px 24px; text-align: center;
  box-shadow: 0 0 40px rgba(78,205,196,0.06), inset 0 0 40px rgba(78,205,196,0.03);
}
.iv-qr-title {
  font-size: 15px; font-weight: 600; color: var(--pg-white);
  margin-bottom: 20px; letter-spacing: 0.3px;
}
.iv-qr-frame {
  display: inline-block; padding: 16px; border-radius: 16px;
  background: #fff; position: relative;
}
.iv-qr-frame::after {
  content: ''; position: absolute; inset: -2px; border-radius: 18px;
  border: 2px solid rgba(78,205,196,0.3);
  box-shadow: 0 0 20px rgba(78,205,196,0.15);
  pointer-events: none;
}

/* ── QR SVG pattern ── */
.iv-qr-svg { display: block; }

/* ── CTA buttons ── */
.iv-cta-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}
.iv-cta-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 16px 12px; border-radius: 14px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.3s; border: none;
  background: linear-gradient(135deg, #4ECDC4, #38b2ac);
  color: #060a0f; font-family: var(--sans);
}
.iv-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(78,205,196,0.35);
}
.iv-cta-btn:active { transform: translateY(0); }

/* ── Recent friends feed ── */
.iv-feed-card {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 20px;
  padding: 24px;
}
.iv-feed-title {
  font-size: 15px; font-weight: 600; color: var(--pg-white);
  margin-bottom: 18px; display: flex; align-items: center; gap: 8px;
}
.iv-feed-title-icon { color: var(--pg-white-muted); }
.iv-feed-list { display: flex; flex-direction: column; gap: 0; }
.iv-feed-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.iv-feed-item:last-child { border-bottom: none; padding-bottom: 0; }
.iv-feed-item:first-child { padding-top: 0; }
.iv-feed-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, rgba(78,205,196,0.2), rgba(78,205,196,0.08));
  border: 1px solid rgba(78,205,196,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; color: #4ECDC4;
}
.iv-feed-info { flex: 1; min-width: 0; }
.iv-feed-name {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 600; color: var(--pg-white);
}
.iv-feed-check { color: #34d399; flex-shrink: 0; }
.iv-feed-time {
  font-size: 12px; color: var(--pg-white-muted); margin-top: 2px;
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

/* ── Henvisning link ── */
.iv-ref-link {
  text-align: center; padding: 4px 0;
}
.iv-ref-link a {
  font-size: 13px; color: var(--pg-white-muted);
  text-decoration: none; transition: color 0.2s;
}
.iv-ref-link a:hover { color: #4ECDC4; }
.iv-ref-link a span { text-decoration: underline; }
`;

/* ── Decorative QR SVG (placeholder pattern) ── */
function PlaceholderQR() {
  // Generate a decorative QR-like pattern (7x7 modules + alignment)
  const size = 180;
  const modules = 21;
  const cellSize = size / modules;

  // Seed a deterministic pattern that looks QR-like
  const filled = new Set<string>();
  // Finder patterns (top-left, top-right, bottom-left)
  const addFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        if (
          y === 0 || y === 6 || x === 0 || x === 6 ||
          (y >= 2 && y <= 4 && x >= 2 && x <= 4)
        ) {
          filled.add(`${ox + x},${oy + y}`);
        }
      }
  };
  addFinder(0, 0);
  addFinder(14, 0);
  addFinder(0, 14);

  // Timing patterns
  for (let i = 8; i < 13; i++) {
    if (i % 2 === 0) {
      filled.add(`${i},6`);
      filled.add(`6,${i}`);
    }
  }

  // Pseudo-random data modules
  const dataPattern = [
    0x3a, 0x7c, 0x1f, 0x55, 0xaa, 0x6d, 0xb3, 0x4e, 0x91, 0xd8,
    0x27, 0xf0, 0x69, 0xc5, 0x3b, 0x8e, 0x42, 0xa7, 0x5c, 0xe1,
  ];
  let byteIdx = 0;
  let bitIdx = 0;
  for (let y = 8; y < modules; y++) {
    for (let x = 8; x < modules; x++) {
      if (y < 13 && x < 13) continue; // skip alignment area overlap
      if (filled.has(`${x},${y}`)) continue;
      const byte = dataPattern[byteIdx % dataPattern.length];
      if ((byte >> (7 - bitIdx)) & 1) {
        filled.add(`${x},${y}`);
      }
      bitIdx++;
      if (bitIdx >= 8) { bitIdx = 0; byteIdx++; }
    }
  }

  const rects: JSX.Element[] = [];
  filled.forEach((key) => {
    const [cx, cy] = key.split(",").map(Number);
    rects.push(
      <rect
        key={key}
        x={cx * cellSize}
        y={cy * cellSize}
        width={cellSize}
        height={cellSize}
        fill="#060a0f"
        rx={0.5}
      />
    );
  });

  return (
    <svg
      className="iv-qr-svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={size} height={size} fill="#ffffff" rx={4} />
      {rects}
    </svg>
  );
}

export default function InviterVenner() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink = user ? `https://b-social.net/?ref=${user.id}` : "";
  const progressPct = Math.round((INVITED_COUNT / NEXT_MILESTONE) * 100);

  function shareSMS() {
    const body = encodeURIComponent(
      `Hej! Kom med p\u00e5 B-Social \u2014 find events og m\u00f8d nye folk: ${referralLink}`
    );
    window.open(`sms:?body=${body}`, "_self");
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "B-Social",
          text: "Kom med p\u00e5 B-Social \u2014 find events og m\u00f8d nye folk!",
          url: referralLink,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(referralLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch {
        /* fallback */
      }
    }
  }

  // ─── Anonymous view ───────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <style>{inviterCSS}</style>
        <div className="iv-root iv-anon">
          <div className="iv-anon-wrap">
            <div className="iv-anon-center">
              <div className="iv-anon-icon">
                <Award size={36} />
              </div>
              <h1 className="iv-anon-title">
                Inviter <em>venner</em>
              </h1>
              <p className="iv-anon-sub">
                Log ind for at f\u00e5 dit personlige link og inviter venner direkte.
              </p>
            </div>

            <div className="iv-anon-steps">
              {[
                { icon: "\ud83d\udce4", text: "Del dit link med venner" },
                { icon: "\ud83d\udc64", text: "De opretter en konto" },
                { icon: "\ud83c\udf89", text: "Optjen badges og bel\u00f8nninger" },
              ].map((step, i) => (
                <div key={i} className="iv-anon-step">
                  <span className="iv-anon-step-emoji">{step.icon}</span>
                  <span className="iv-anon-step-text">{step.text}</span>
                </div>
              ))}
            </div>

            <div>
              <button
                onClick={() => setLocation("/auth")}
                className="iv-login-btn"
              >
                <LogIn size={18} />
                Log ind for at f\u00e5 dit link
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

  // ─── Logged-in view (Design C - Gamified Invite) ────────────────────────
  return (
    <>
      <style>{inviterCSS}</style>
      <div className="iv-root">
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
              <Users size={20} className="iv-header-icon" />
              <span>Inviter venner</span>
            </div>
          </div>
        </div>

        <div className="iv-content">
          {/* Achievement card */}
          <div className="iv-achievement">
            <div className="iv-laurel">
              <span className="iv-laurel-left">{"\ud83c\udf3f"}</span>
              <Award size={32} className="iv-laurel-icon" />
              <span className="iv-laurel-right">{"\ud83c\udf3f"}</span>
            </div>
            <h2 className="iv-achievement-title">
              Du har inviteret <strong>{INVITED_COUNT} venner!</strong>
            </h2>
            <div className="iv-progress-wrap">
              <div className="iv-progress-labels">
                <span className="iv-progress-current">{INVITED_COUNT}</span>
                <span className="iv-progress-goal">{NEXT_MILESTONE}</span>
              </div>
              <div className="iv-progress-bar">
                <div
                  className="iv-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="iv-reward-text">
                N\u00e6ste bel\u00f8nning: <span>Premium badge</span>
              </p>
            </div>
          </div>

          {/* QR code card */}
          <div className="iv-qr-card">
            <p className="iv-qr-title">Scan for at tilmelde</p>
            <div className="iv-qr-frame">
              <PlaceholderQR />
            </div>
          </div>

          {/* CTA buttons */}
          <div className="iv-cta-row">
            <button onClick={shareSMS} className="iv-cta-btn">
              <MessageSquare size={18} />
              Del via SMS
            </button>
            <button onClick={shareLink} className="iv-cta-btn">
              <Link2 size={18} />
              {copiedLink ? "Link kopieret!" : "Del via link"}
            </button>
          </div>

          {/* Recent friends feed */}
          <div className="iv-feed-card">
            <h3 className="iv-feed-title">
              <Users size={16} className="iv-feed-title-icon" />
              Seneste tilmeldte
            </h3>
            <div className="iv-feed-list">
              {MOCK_FRIENDS.map((friend, i) => (
                <div key={i} className="iv-feed-item">
                  <div className="iv-feed-avatar">{friend.avatar}</div>
                  <div className="iv-feed-info">
                    <p className="iv-feed-name">
                      {friend.name}
                      <CheckCircle size={14} className="iv-feed-check" />
                    </p>
                    <p className="iv-feed-time">{friend.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Henvisning link */}
          <div className="iv-ref-link">
            <Link href="/henvisning">
              Se dine <span>henvisningsindtjening</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
