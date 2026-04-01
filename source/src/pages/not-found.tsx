import { Link } from "wouter";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const notFoundCSS = `
${pageBase("e4")}

/* ── Hero background ── */
.e4-root {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.e4-bg {
  position: absolute;
  inset: 0;
  background: url("/404-hero.png") center/cover no-repeat;
  z-index: 0;
}

.e4-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(6,10,15,0.35) 0%, rgba(6,10,15,0.85) 70%),
    linear-gradient(180deg, rgba(6,10,15,0.3) 0%, rgba(6,10,15,0.95) 100%);
  z-index: 1;
}

/* ── Content layer ── */
.e4-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 520px;
  padding: 0 24px;
}

/* ── Large 404 display ── */
.e4-code {
  font-family: var(--serif);
  font-size: clamp(100px, 20vw, 200px);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -4px;
  color: var(--teal);
  opacity: 0.15;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -65%);
  z-index: 1;
  pointer-events: none;
  user-select: none;
}

/* ── Eyebrow label ── */
.e4-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--teal);
  text-transform: uppercase;
  letter-spacing: 3px;
}

.e4-tag-line {
  width: 28px;
  height: 1px;
  background: var(--teal);
}

/* ── Heading ── */
.e4-heading {
  font-family: var(--serif);
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.5px;
  color: var(--pg-white);
}

.e4-heading em {
  font-style: italic;
  color: var(--teal);
}

/* ── Subtitle ── */
.e4-sub {
  font-size: 15px;
  color: var(--pg-white-dim);
  line-height: 1.65;
  max-width: 380px;
}

/* ── Glass CTA button ── */
.e4-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 14px 32px;
  background: rgba(78,205,196,0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(78,205,196,0.25);
  border-radius: 100px;
  color: var(--teal);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--sans);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.23,1,0.32,1);
}

.e4-cta:hover {
  background: var(--teal);
  color: var(--bg);
  border-color: var(--teal);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(78,205,196,0.25);
}

.e4-cta:active {
  transform: scale(0.97);
}

/* ── Arrow icon ── */
.e4-arrow {
  display: inline-block;
  transition: transform 0.3s;
}
.e4-cta:hover .e4-arrow {
  transform: translateX(3px);
}
`;

export default function NotFound() {
  const containerRef = useFadeUp("e4");

  return (
    <>
      <style>{notFoundCSS}</style>
      <div className="e4-root" ref={containerRef}>
        {/* Background image + cinematic gradient */}
        <div className="e4-bg" />

        {/* Large background 404 */}
        <div className="e4-code">404</div>

        {/* Content */}
        <div className="e4-content">
          {/* Eyebrow */}
          <div className="e4-fade-up e4-tag">
            <span className="e4-tag-line" />
            Side ikke fundet
            <span className="e4-tag-line" />
          </div>

          {/* Heading */}
          <h1 className="e4-fade-up e4-d1 e4-heading">
            Siden blev <em>ikke fundet</em>
          </h1>

          {/* Subtitle */}
          <p className="e4-fade-up e4-d2 e4-sub">
            Den side, du leder efter, eksisterer ikke eller er blevet flyttet.
          </p>

          {/* CTA */}
          <Link href="/feed" className="e4-fade-up e4-d3 e4-cta">
            Ga til forsiden
            <span className="e4-arrow">&rarr;</span>
          </Link>
        </div>
      </div>
    </>
  );
}
