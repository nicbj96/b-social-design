/**
 * Shared design tokens for all premium page CSS.
 * Import and spread into each page's scoped CSS template.
 */

/** CSS custom properties shared by every redesigned page */
export const cssVars = `
  --teal: #4ecdc4;
  --teal-dim: rgba(78,205,196,0.15);
  --teal-glow: rgba(78,205,196,0.35);
  --pg-white: rgba(255,255,255,0.95);
  --pg-white-dim: rgba(255,255,255,0.55);
  --pg-white-muted: rgba(255,255,255,0.25);
  --serif: 'Instrument Serif', Georgia, serif;
  --sans: 'DM Sans', -apple-system, sans-serif;
  --bg: #060a0f;
  --glass-bg: rgba(255,255,255,0.05);
  --glass-bg-hover: rgba(255,255,255,0.08);
  --glass-border: rgba(255,255,255,0.08);
  --glass-border-hover: rgba(255,255,255,0.14);
`;

/** Shared gradient overlays */
export const gradients = {
  heroBottom: "linear-gradient(to top, rgba(6,10,15,1) 0%, rgba(6,10,15,0.7) 40%, transparent 100%)",
  heroFull: "linear-gradient(180deg,rgba(6,10,15,0.2) 0%,rgba(6,10,15,0.55) 50%,rgba(6,10,15,0.85) 100%)",
  cardBottom: "linear-gradient(to top, rgba(6,10,15,0.9) 0%, transparent 50%)",
};
