/**
 * B-Social — Cloudflare Pages Advanced Worker
 *
 * Intercepts bot/crawler requests to /event/:id and /sted/:id,
 * fetches live data from Supabase, and injects dynamic OG meta tags
 * into the index.html shell before returning it to the crawler.
 *
 * Real-user requests pass straight through to env.ASSETS (the static bundle).
 *
 * Deployed automatically via GitHub Actions → Cloudflare Pages Direct Upload.
 * The file lives in source/public/_worker.js and Vite copies it to dist/public/.
 */

// ─── Supabase (anon key — frontend-safe, already in the compiled bundle) ───
const SUPABASE_URL = 'https://rbengtfrthqdfbcdcugp.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZW5ndGZydGhxZGZiY2RjdWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjUwNjksImV4cCI6MjA4ODIwMTA2OX0.' +
  '9RXVN3u0UzXO2ideDFA8Un34jqUEf6hiG8ZJki5RAXk';

// ─── Bot / crawler User-Agent patterns ───────────────────────────────────────
const BOT_PATTERNS = [
  'facebookexternalhit', 'facebot', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'slackbot', 'discordbot', 'googlebot',
  'bingbot', 'applebot', 'embedly', 'rogerbot', 'bufferbot',
  'pinterest', 'vkshare', 'w3c_validator', 'redditbot',
  'iframely', 'ahrefsbot', 'semrushbot', 'yandexbot',
  'screaming frog', 'msnbot', 'duckduckbot', 'baidu',
];

/** Returns true when the User-Agent string belongs to a known bot/crawler */
function isBot(ua) {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some((p) => lower.includes(p));
}

// ─── Supabase fetch helpers ───────────────────────────────────────────────────

async function fetchEvent(id) {
  const url =
    `${SUPABASE_URL}/rest/v1/events` +
    `?id=eq.${encodeURIComponent(id)}&select=id,title,description,image_url&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

async function fetchPlace(id) {
  const url =
    `${SUPABASE_URL}/rest/v1/places` +
    `?id=eq.${encodeURIComponent(id)}&select=id,name,description,image_url&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

/** Escape a string for safe insertion into HTML attribute values */
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Replace OG / Twitter / description meta tags in the HTML shell.
 * Regex matches the exact attribute order used in source/index.html.
 */
function injectOGTags(html, { title, desc, image, pageUrl }) {
  const fullTitle = `${title} | B-Social`;
  const safeDesc =
    (desc || '').slice(0, 160) ||
    'Find oplevelser, mød mennesker og del din verden med B-Social.';
  const safeImg = image || 'https://b-social.net/og-image.svg';
  const safeUrl = pageUrl;

  return html
    // <title>
    .replace(/(<title>)[^<]*(<\/title>)/, `$1${esc(fullTitle)}$2`)
    // description
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/i,
      `$1${esc(safeDesc)}$2`,
    )
    // og:title
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/i,
      `$1${esc(fullTitle)}$2`,
    )
    // og:description
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/i,
      `$1${esc(safeDesc)}$2`,
    )
    // og:image
    .replace(
      /(<meta\s+property="og:image"\s+content=")[^"]*(")/i,
      `$1${esc(safeImg)}$2`,
    )
    // og:url
    .replace(
      /(<meta\s+property="og:url"\s+content=")[^"]*(")/i,
      `$1${esc(safeUrl)}$2`,
    )
    // twitter:title
    .replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i,
      `$1${esc(fullTitle)}$2`,
    )
    // twitter:description
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i,
      `$1${esc(safeDesc)}$2`,
    )
    // twitter:image
    .replace(
      /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/i,
      `$1${esc(safeImg)}$2`,
    );
}

// ─── Main Worker handler ──────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const ua = request.headers.get('User-Agent') || '';

    // Detect route type
    const eventMatch = path.match(/^\/event\/([^/]+)$/);
    const stedMatch = path.match(/^\/sted\/([^/]+)$/);

    // Pass through for non-dynamic routes or real users
    if ((!eventMatch && !stedMatch) || !isBot(ua)) {
      return env.ASSETS.fetch(request);
    }

    try {
      // Fetch the SPA shell (index.html served at /)
      const shellReq = new Request(new URL('/', request.url).href, {
        headers: { Accept: 'text/html' },
      });
      const shellRes = await env.ASSETS.fetch(shellReq);
      let html = await shellRes.text();

      // Fetch entity data from Supabase
      let meta = null;

      if (eventMatch) {
        const event = await fetchEvent(eventMatch[1]);
        if (event) {
          meta = {
            title: event.title || 'Event',
            desc: event.description,
            image: event.image_url,
            pageUrl: url.href,
          };
        }
      } else if (stedMatch) {
        const place = await fetchPlace(stedMatch[1]);
        if (place) {
          meta = {
            title: place.name || 'Sted',
            desc: place.description,
            image: place.image_url,
            pageUrl: url.href,
          };
        }
      }

      // Inject if we got data; otherwise return the generic shell
      if (meta) {
        html = injectOGTags(html, meta);
      }

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          // Short cache so fresh event details propagate quickly
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-B-Social-OG': 'injected',
        },
      });
    } catch (_err) {
      // Any error → graceful fallback to normal static serving
      return env.ASSETS.fetch(request);
    }
  },
};
