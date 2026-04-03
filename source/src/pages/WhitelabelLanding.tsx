import { useLocation } from "wouter";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ─────────────────────────────────────────────
   B-Social Whitelabel Landing
   Premium dark theme · scoped wl- prefix
   ───────────────────────────────────────────── */

const STATS = [
  { value: "188.000+", label: "Steder i databasen" },
  { value: "9.400+", label: "Aktive events" },
  { value: "144", label: "Lande dækket" },
  { value: "10+", label: "Kategorier" },
];

const FEATURES = [
  {
    icon: "🧠",
    title: "Motoren bag platformen",
    desc: "En avanceret relationsdatabase der i realtid kobler brugere, steder, events, firmaer, kategorier, tags, geografiske zoner og betalingsflows sammen.",
  },
  {
    icon: "🗺️",
    title: "Interaktivt verdenskort",
    desc: "Live kortvisning med geo-clustering af 188.000+ steder fordelt over hele verden — filtreret efter land, kategori og tags.",
  },
  {
    icon: "📡",
    title: "Realtids datafeed",
    desc: "Personaliseret feed med events, nyheder og trending indhold baseret på brugerens interesser, lokation og sociale graf.",
  },
  {
    icon: "🏢",
    title: "Firma-modul",
    desc: "Komplet selvbetjening for firmaer med CVR-opslag, event-oprettelse, targeting, analytics, fakturering og rekruttering.",
  },
  {
    icon: "🔗",
    title: "Social graf & beskeder",
    desc: "Bygget-in beskedsystem, notifikationer, communities & clubs, invitationer og et fuldt henvisningsprogram med provisions-tracking.",
  },
  {
    icon: "🌍",
    title: "Multi-sprog & lokalisering",
    desc: "Fuld dansk/engelsk lokalisering med i18n-support — klar til at skalere til nye markeder under dit brand.",
  },
];

const INCLUDES = [
  "Dit eget domæne og visuel identitet (logo, farver, fonts)",
  "Komplet platform med alle B-Social features fra dag 1",
  "Adgang til hele den eksisterende database — eller afgrænset til dit marked",
  "Dedikeret opsætning, onboarding og teknisk support",
  "Løbende hosting, vedligeholdelse og nye features automatisk",
  "Firma-modul med selvbetjening, analytics og fakturering",
  "Multi-sprog support og klar til internationale markeder",
];

/* ── Scoped CSS ── */
const whitelabelCSS = `
${pageBase("wl")}

/* ── Nav ── */
.wl-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 32px;
  background: rgba(6,10,15,0.85);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.wl-nav-brand {
  display: flex; align-items: center; gap: 10px;
  font-weight: 700; font-size: 18px; letter-spacing: -0.3px;
  color: var(--pg-white); font-family: var(--sans);
}
.wl-nav-brand span { color: var(--teal); }

/* ── Hero ── */
.wl-hero {
  position: relative; padding: 160px 24px 100px;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; overflow: hidden;
}
.wl-hero-bg {
  position: absolute; inset: 0;
  background: url('/whitelabel-hero.png') center/cover no-repeat;
}
.wl-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    180deg,
    rgba(6,10,15,0.4) 0%,
    rgba(6,10,15,0.65) 40%,
    rgba(6,10,15,0.92) 100%
  );
}
.wl-hero-glow {
  position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
  width: 800px; height: 500px;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(78,205,196,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.wl-hero-inner {
  position: relative; z-index: 2; max-width: 760px;
}
.wl-hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 20px; border-radius: 100px;
  border: 1px solid rgba(78,205,196,0.3);
  background: rgba(78,205,196,0.08);
  color: var(--teal); font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 2.5px;
  margin-bottom: 28px;
}
.wl-hero-h1 {
  font-family: var(--serif);
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 400; line-height: 1.05;
  letter-spacing: -1.5px;
  margin-bottom: 24px;
}
.wl-hero-h1 em { font-style: italic; color: var(--teal); }
.wl-hero-sub {
  font-size: clamp(15px, 1.6vw, 19px);
  color: var(--pg-white-dim); line-height: 1.7;
  max-width: 620px; margin: 0 auto 40px;
}
.wl-hero-btns {
  display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
}

/* ── Sections shared ── */
.wl-section {
  padding: 0 24px; max-width: 1040px; margin: 0 auto;
}
.wl-section-center { text-align: center; margin-bottom: 48px; }
.wl-section-center .wl-text { max-width: 640px; margin: 12px auto 0; }

/* ── Stats row ── */
.wl-stats {
  padding: 0 24px 80px; max-width: 960px; margin: 0 auto;
}
.wl-stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.wl-stat-card {
  padding: 28px 20px; border-radius: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  text-align: center;
  transition: border-color 0.3s, transform 0.3s;
}
.wl-stat-card:hover {
  border-color: rgba(78,205,196,0.3);
  transform: translateY(-2px);
}
.wl-stat-value {
  font-family: var(--serif); font-size: 32px; font-weight: 400;
  color: var(--teal); line-height: 1; margin-bottom: 8px;
}
.wl-stat-desc {
  font-size: 12px; color: var(--pg-white-muted);
  text-transform: uppercase; letter-spacing: 1.2px;
}

/* ── Feature grid ── */
.wl-features { padding-bottom: 100px; }
.wl-feat-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
.wl-feat-card {
  padding: 32px; border-radius: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.3s, background 0.3s, transform 0.3s;
}
.wl-feat-card:hover {
  border-color: rgba(78,205,196,0.35);
  background: rgba(255,255,255,0.07);
  transform: translateY(-2px);
}
.wl-feat-icon { font-size: 32px; margin-bottom: 14px; }
.wl-feat-title {
  font-family: var(--sans); font-size: 16px; font-weight: 600;
  color: var(--pg-white); margin-bottom: 8px;
}
.wl-feat-desc {
  font-size: 14px; color: var(--pg-white-dim); line-height: 1.65;
}

/* ── Includes section ── */
.wl-includes { padding-bottom: 100px; }
.wl-includes-box {
  max-width: 760px; margin: 0 auto; padding: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(78,205,196,0.08) 0%, rgba(78,205,196,0.02) 100%);
  border: 1px solid rgba(78,205,196,0.18);
}
.wl-includes-list { list-style: none; padding: 0; margin: 0; }
.wl-includes-list li {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 10px 0; font-size: 15px; color: var(--pg-white-dim);
  line-height: 1.5;
}
.wl-check {
  color: var(--teal); font-size: 16px; flex-shrink: 0; margin-top: 2px;
}

/* ── Pricing ── */
.wl-pricing { padding-bottom: 100px; }
.wl-price-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
  max-width: 760px; margin: 0 auto;
}
.wl-price-card {
  padding: 40px 32px; border-radius: 24px; text-align: center;
  display: flex; flex-direction: column; align-items: center;
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  transition: transform 0.3s;
}
.wl-price-card:hover { transform: translateY(-3px); }
.wl-price-card--default {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}
.wl-price-card--accent {
  background: rgba(78,205,196,0.08);
  border: 1px solid rgba(78,205,196,0.25);
}
.wl-price-tag {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 2px; margin-bottom: 16px;
}
.wl-price-tag--muted { color: var(--pg-white-muted); }
.wl-price-tag--teal  { color: var(--teal); opacity: 0.7; }
.wl-price-amount {
  font-family: var(--serif); font-size: clamp(42px, 5vw, 56px);
  font-weight: 400; line-height: 1; margin-bottom: 6px;
}
.wl-price-amount--white { color: var(--pg-white); }
.wl-price-amount--teal  { color: var(--teal); }
.wl-price-note {
  font-size: 13px; margin-bottom: 24px;
}
.wl-price-note--muted { color: var(--pg-white-muted); }
.wl-price-note--teal  { color: rgba(78,205,196,0.5); }
.wl-price-desc {
  font-size: 14px; color: var(--pg-white-dim); line-height: 1.65;
}

/* ── CTA ── */
.wl-cta { padding-bottom: 140px; }
.wl-cta-inner {
  max-width: 640px; margin: 0 auto; text-align: center;
}
.wl-cta-inner .wl-text { margin-bottom: 32px; }

/* ── Footer ── */
.wl-footer {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 28px 24px; text-align: center;
  font-size: 12px; color: var(--pg-white-muted);
}
.wl-footer button {
  background: none; border: none; color: var(--pg-white-muted);
  font-size: 12px; cursor: pointer; font-family: var(--sans);
  transition: color 0.25s;
}
.wl-footer button:hover { color: var(--pg-white-dim); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .wl-nav { padding: 12px 20px; }
  .wl-hero { padding: 140px 20px 72px; }
  .wl-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .wl-feat-grid { grid-template-columns: 1fr; }
  .wl-price-grid { grid-template-columns: 1fr; }
  .wl-includes-box { padding: 32px 24px; }
  .wl-hero-btns { flex-direction: column; align-items: center; }
}
`;

export default function WhitelabelLanding() {
  const [, setLocation] = useLocation();
  const containerRef = useFadeUp("wl");

  return (
    <>
      <style>{whitelabelCSS}</style>
      <div ref={containerRef} className="wl-root">

        {/* ── NAV ── */}
        <nav className="wl-nav">
          <div className="wl-nav-brand">
            <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
              <circle cx="20" cy="20" r="17" stroke="#4ECDC4" strokeWidth="1.5" opacity="0.6" />
              <path d="M20 8 L22.5 18 L20 16 L17.5 18 Z" fill="#4ECDC4" />
              <path d="M20 32 L17.5 22 L20 24 L22.5 22 Z" fill="rgba(255,255,255,0.4)" />
              <circle cx="20" cy="20" r="2" fill="#4ECDC4" />
            </svg>
            B-Social <span>Whitelabel</span>
          </div>
          <a href="mailto:kontakt@b-social.net" className="wl-btn-sm">Book demo</a>
        </nav>

        {/* ── HERO ── */}
        <section className="wl-hero">
          <div className="wl-hero-bg" />
          <div className="wl-hero-overlay" />
          <div className="wl-hero-glow" />
          <div className="wl-hero-inner">
            <div className="wl-hero-badge wl-fade-up">Whitelabel Platform</div>
            <h1 className="wl-hero-h1 wl-fade-up wl-d1">
              Din platform.<br />
              <em>Dit brand.</em><br />
              Vores motor.
            </h1>
            <p className="wl-hero-sub wl-fade-up wl-d2">
              Få en komplet social oplevelses-platform i dit eget navn — bygget på B-Socials
              kraftfulde infrastruktur med 95.000+ steder og 6.400+ events på tværs af 100+ lande.
            </p>
            <div className="wl-hero-btns wl-fade-up wl-d3">
              <a href="mailto:kontakt@b-social.net" className="wl-btn">
                Kontakt os for en demo
              </a>
              <button onClick={() => setLocation("/")} className="wl-btn-ghost">
                Se platformen live
              </button>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="wl-stats">
          <div className="wl-stats-grid">
            {STATS.map((s, i) => (
              <div key={s.label} className={`wl-stat-card wl-fade-up wl-d${i % 4 + 1}`}>
                <div className="wl-stat-value">{s.value}</div>
                <div className="wl-stat-desc">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DATABASE / MOTOR SEKTION ── */}
        <section className="wl-section wl-features">
          <div className="wl-section-center wl-fade-up">
            <div className="wl-eyebrow">
              <div className="wl-eyebrow-line" />
              Infrastruktur
            </div>
            <h2 className="wl-h2">Hjernen bag <em>platformen</em></h2>
            <p className="wl-text">
              Bag hver skærm ligger en kompleks relationsdatabase der i realtid håndterer
              tusindvis af datapunkter — fra personaliserede feeds til live kortvisning
              med 95.000+ steder over hele verden.
            </p>
          </div>
          <div className="wl-feat-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`wl-feat-card wl-fade-up wl-d${(i % 4) + 1}`}>
                <div className="wl-feat-icon">{f.icon}</div>
                <div className="wl-feat-title">{f.title}</div>
                <div className="wl-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HVAD DU FÅR ── */}
        <section className="wl-section wl-includes">
          <div className="wl-section-center wl-fade-up">
            <div className="wl-eyebrow">
              <div className="wl-eyebrow-line" />
              Alt inkluderet
            </div>
            <h2 className="wl-h2">Under <em>dit brand</em></h2>
          </div>
          <div className="wl-includes-box wl-fade-up wl-d1">
            <ul className="wl-includes-list">
              {INCLUDES.map((item) => (
                <li key={item}>
                  <span className="wl-check">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── PRIS ── */}
        <section className="wl-section wl-pricing">
          <div className="wl-section-center wl-fade-up">
            <div className="wl-eyebrow">
              <div className="wl-eyebrow-line" />
              Pris
            </div>
            <h2 className="wl-h2">Enkel, <em>transparent</em> prismodel</h2>
            <p className="wl-text">Du betaler kun i takt med at din platform vokser.</p>
          </div>
          <div className="wl-price-grid">
            {/* Setup */}
            <div className="wl-price-card wl-price-card--default wl-fade-up wl-d1">
              <div className="wl-price-tag wl-price-tag--muted">Engangsbetaling</div>
              <div className="wl-price-amount wl-price-amount--white">&euro;80.000</div>
              <div className="wl-price-note wl-price-note--muted">Setup-fee</div>
              <p className="wl-price-desc">
                Komplet whitelabel-opsætning inkl. branding, domæne, konfiguration, datamigration og onboarding.
              </p>
            </div>
            {/* Revenue share */}
            <div className="wl-price-card wl-price-card--accent wl-fade-up wl-d2">
              <div className="wl-price-tag wl-price-tag--teal">Løbende</div>
              <div className="wl-price-amount wl-price-amount--teal">5%</div>
              <div className="wl-price-note wl-price-note--teal">af omsætningen</div>
              <p className="wl-price-desc">
                Ingen månedlige faste omkostninger. Du betaler en andel af det din platform genererer.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="wl-section wl-cta wl-fade-up">
          <div className="wl-cta-inner">
            <div className="wl-eyebrow" style={{ justifyContent: "center", marginBottom: 20 }}>
              <div className="wl-eyebrow-line" />
              Kom i gang
            </div>
            <h2 className="wl-h2">Klar til at bygge <em>din</em> platform?</h2>
            <p className="wl-text" style={{ marginTop: 16, marginBottom: 32 }}>
              Kontakt os for en uforpligtende demo og se hvad B-Social-motoren kan gøre for dit brand.
            </p>
            <a href="mailto:kontakt@b-social.net" className="wl-btn">
              Kontakt os
            </a>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="wl-footer">
          &copy; 2026 B-Social &middot; Alle rettigheder forbeholdes &middot;{" "}
          <button onClick={() => setLocation("/privatlivspolitik")}>
            Privatlivspolitik
          </button>
        </footer>
      </div>
    </>
  );
}
