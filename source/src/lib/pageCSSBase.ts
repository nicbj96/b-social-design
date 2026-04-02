import { cssVars } from "./designTokens";

/**
 * Returns the base CSS boilerplate for a redesigned page.
 * Pass a unique 2-3 letter prefix (e.g. "fd" for Feed).
 *
 * Includes: root vars, fade-up animation, glass card, eyebrow,
 * section heading, button styles, chip styles, and responsive resets.
 *
 * Usage:
 *   const feedCSS = `${pageBase("fd")} .fd-custom { ... }`;
 */
export function pageBase(p: string): string {
  return `
.${p}-root {
  ${cssVars}
  background: var(--bg);
  color: var(--pg-white);
  font-family: var(--sans);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── Glass card ── */
.${p}-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  transition: background 0.3s, border-color 0.3s, transform 0.3s;
}
.${p}-glass:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}
.${p}-glass-strong {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
}

/* ── Eyebrow ── */
.${p}-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 500; color: var(--teal);
  text-transform: uppercase; letter-spacing: 2.5px;
}
.${p}-eyebrow-line { width: 32px; height: 1px; background: var(--teal); }

/* ── Headings ── */
.${p}-h2 {
  font-family: var(--serif);
  font-size: clamp(32px, 4vw, 56px);
  font-weight: 400; line-height: 1.05; letter-spacing: -1px;
}
.${p}-h2 em { font-style: italic; color: var(--teal); }
.${p}-h3 {
  font-family: var(--serif);
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 400; line-height: 1.1;
}
.${p}-h3 em { font-style: italic; color: var(--teal); }

/* ── Body text ── */
.${p}-text { font-size: 15px; color: var(--pg-white-dim); line-height: 1.65; }
.${p}-text-sm { font-size: 13px; color: var(--pg-white-muted); line-height: 1.5; }
.${p}-label {
  font-size: 11px; font-weight: 500; color: var(--teal);
  text-transform: uppercase; letter-spacing: 1.5px;
}

/* ── Buttons ── */
.${p}-btn {
  padding: 12px 28px; background: var(--teal); color: var(--bg);
  border: none; border-radius: 100px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.3s; font-family: var(--sans);
}
.${p}-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px var(--teal-glow);
}
.${p}-btn-ghost {
  padding: 12px 28px; background: transparent; color: var(--pg-white);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 100px;
  font-size: 14px; font-weight: 400; cursor: pointer;
  transition: all 0.3s; font-family: var(--sans);
}
.${p}-btn-ghost:hover { border-color: var(--teal); color: var(--teal); }
.${p}-btn-sm {
  padding: 8px 20px; font-size: 12px; background: var(--teal); color: var(--bg);
  border: none; border-radius: 100px; font-weight: 600; cursor: pointer;
  transition: all 0.25s; font-family: var(--sans);
}
.${p}-btn-sm:hover { box-shadow: 0 4px 16px var(--teal-glow); }

/* ── Chips ── */
.${p}-chip {
  padding: 8px 18px; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 100px;
  font-size: 13px; color: var(--pg-white-dim); cursor: pointer;
  transition: all 0.25s; backdrop-filter: blur(8px);
  font-family: var(--sans); white-space: nowrap;
}
.${p}-chip:hover, .${p}-chip.active {
  background: var(--teal); color: var(--bg);
  border-color: var(--teal); font-weight: 600;
}

/* ── Input ── */
.${p}-input {
  width: 100%; padding: 14px 18px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; color: var(--pg-white); font-size: 14px;
  font-family: var(--sans); outline: none; transition: border-color 0.25s;
}
.${p}-input:focus { border-color: rgba(78,205,196,0.4); }
.${p}-input::placeholder { color: rgba(255,255,255,0.3); }

/* ── Fade-up ── */
.${p}-fade-up {
  opacity: 0; transform: translateY(32px);
  transition: opacity 0.7s cubic-bezier(0.23,1,0.32,1), transform 0.7s cubic-bezier(0.23,1,0.32,1);
}
.${p}-fade-up.${p}-visible { opacity: 1; transform: translateY(0); }
.${p}-d1 { transition-delay: 0.08s; }
.${p}-d2 { transition-delay: 0.16s; }
.${p}-d3 { transition-delay: 0.28s; }
.${p}-d4 { transition-delay: 0.4s; }

/* ── Stat card ── */
.${p}-stat {
  padding: 20px; border-radius: 16px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
}
.${p}-stat-num {
  font-family: var(--serif); font-size: 28px; font-weight: 400;
  color: var(--pg-white); line-height: 1;
}
.${p}-stat-label {
  font-size: 11px; color: var(--pg-white-muted); text-transform: uppercase;
  letter-spacing: 1.5px; margin-top: 6px;
}

/* ── Divider ── */
.${p}-divider {
  height: 1px; background: rgba(255,255,255,0.06); margin: 32px 0;
}

/* ── Responsive base ── */
@media (max-width: 768px) {
  .${p}-root { padding-bottom: 96px; }
}

/* ══════════════════════════════════════════
   COVER HERO PATTERN (profile-style)
   ══════════════════════════════════════════ */

/* Full-width atmospheric photo at top */
.${p}-cover {
  position: relative; width: 100%; height: 220px; overflow: hidden; flex-shrink: 0;
}
.${p}-cover img {
  width: 100%; height: 100%; object-fit: cover; object-position: center;
  display: block;
}
.${p}-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(6,10,15,0.25) 0%, rgba(6,10,15,0.92) 100%);
}

/* Identity block — overlaps cover bottom */
.${p}-identity {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; margin-top: -44px; padding: 0 20px 20px; position: relative; z-index: 2;
}
.${p}-avatar {
  width: 88px; height: 88px; border-radius: 50%;
  border: 3px solid rgba(78,205,196,0.45);
  box-shadow: 0 0 32px rgba(78,205,196,0.22), 0 8px 24px rgba(0,0,0,0.6);
  background: rgba(6,10,15,0.85); overflow: hidden;
  display: flex; align-items: center; justify-content: center; font-size: 32px;
  flex-shrink: 0;
}
.${p}-avatar img { width: 100%; height: 100%; object-fit: cover; }
.${p}-identity-title {
  font-family: var(--serif); font-size: 28px; font-weight: 400;
  color: var(--pg-white); margin-top: 12px; line-height: 1.1; letter-spacing: -0.5px;
}
.${p}-identity-title em { font-style: italic; color: var(--teal); }
.${p}-identity-sub {
  font-size: 13px; color: var(--teal); margin-top: 4px; font-weight: 500; letter-spacing: 0.5px;
}

/* Three-up glass stat cards */
.${p}-stats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px; padding: 0 20px 24px;
}
.${p}-stat-card {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 16px; text-align: center;
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
}
.${p}-stat-val {
  font-family: var(--serif); font-size: 26px; color: var(--pg-white); line-height: 1;
}
.${p}-stat-lbl {
  font-size: 11px; color: var(--pg-white-muted); text-transform: uppercase;
  letter-spacing: 1.5px; margin-top: 4px;
}

/* Two-column content layout */
.${p}-cols {
  padding: 0 20px 40px;
  display: flex; flex-direction: column; gap: 20px;
}
@media (min-width: 769px) {
  .${p}-cols { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
}
.${p}-col-main { min-width: 0; }
.${p}-col-side { min-width: 0; }

/* Section heading inside columns */
.${p}-section-title {
  font-size: 13px; font-weight: 600; color: var(--pg-white);
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px;
}
`;
}
