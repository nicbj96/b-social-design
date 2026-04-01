/*
  B-Social News Engine
  Henter nyheder fra RSS feeds og matcher dem med brugerens tags
  via Superhjernen. Bruger egen Cloudflare Worker som CORS proxy.
*/

import { TAG_TREE, type TagNode } from "./tagTree";
import { getRelatedTags, getTagNode } from "./tagEngine";
import { logger } from "./logger";

// --- Types ---
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string | null;
  source: string;
  sourceEmoji: string;
  pubDate: Date;
  matchedTags: string[];
  score: number;
}

// --- RSS Feed Config mapped to tags ---
interface FeedConfig {
  url: string;
  source: string;
  sourceEmoji: string;
  tags: string[]; // Which tags this feed maps to
}

const RSS_FEEDS: FeedConfig[] = [
  // --- Eksisterende danske feeds ---
  {
    url: "https://nordjyske.dk/rss/sport",
    source: "Nordjyske Sport",
    sourceEmoji: "🏆",
    tags: ["cykling", "løb", "fodbold", "svømning", "fitness", "kampsport", "basketball", "tennis", "golf", "ski", "snowboard", "ridning"],
  },
  {
    url: "https://www.dr.dk/nyheder/service/feeds/sporten",
    source: "DR Sporten",
    sourceEmoji: "📺",
    tags: ["fodbold", "håndbold", "cykling", "løb", "tennis", "badminton", "fitness", "svømning"],
  },
  {
    url: "https://nordjyske.dk/rss/aalborg",
    source: "Nordjyske Aalborg",
    sourceEmoji: "🎨",
    tags: ["kunst", "musik", "dans", "fotografering", "teater", "stand-up", "festival", "koncert"],
  },
  {
    url: "https://nordjyske.dk/rss/nyheder",
    source: "Nordjyske",
    sourceEmoji: "📰",
    tags: ["social", "familie", "natur", "outdoor", "frivilligt", "tech", "mad", "shopping", "motor", "rejser"],
  },

  // --- DR nyheder (danske kategorier) ---
  {
    url: "https://www.dr.dk/nyheder/service/feeds/allenyheder",
    source: "DR Nyheder",
    sourceEmoji: "📻",
    tags: ["social", "familie", "frivilligt"],
  },
  {
    url: "https://www.dr.dk/nyheder/service/feeds/indland",
    source: "DR Indland",
    sourceEmoji: "🇩🇰",
    tags: ["social", "familie", "frivilligt"],
  },
  {
    url: "https://www.dr.dk/nyheder/service/feeds/udland",
    source: "DR Udland",
    sourceEmoji: "🌍",
    tags: ["social", "rejser"],
  },
  {
    url: "https://www.dr.dk/nyheder/service/feeds/politik",
    source: "DR Politik",
    sourceEmoji: "🏛️",
    tags: ["social", "frivilligt"],
  },
  {
    url: "https://www.dr.dk/nyheder/service/feeds/penge",
    source: "DR Penge",
    sourceEmoji: "💰",
    tags: ["shopping", "social"],
  },
  {
    url: "https://www.dr.dk/nyheder/service/feeds/kultur",
    source: "DR Kultur",
    sourceEmoji: "🎭",
    tags: ["kunst", "musik", "dans", "teater", "festival", "koncert", "stand-up"],
  },
  {
    url: "https://www.dr.dk/nyheder/service/feeds/viden",
    source: "DR Viden",
    sourceEmoji: "🔬",
    tags: ["natur", "outdoor", "tech"],
  },
  {
    url: "https://www.dr.dk/nyheder/service/feeds/musik",
    source: "DR Musik",
    sourceEmoji: "🎵",
    tags: ["musik", "koncert", "festival"],
  },
  {
    url: "https://www.dr.dk/nyheder/service/feeds/vejret",
    source: "DR Vejret",
    sourceEmoji: "⛅",
    tags: ["natur", "outdoor", "rejser"],
  },
  {
    url: "https://www.dr.dk/nyheder/service/feeds/regionale",
    source: "DR Regionale",
    sourceEmoji: "📍",
    tags: ["social", "familie", "frivilligt"],
  },

  // --- Jyllands-Posten ---
  {
    url: "https://jyllands-posten.dk/feed/rss",
    source: "Jyllands-Posten",
    sourceEmoji: "📰",
    tags: ["social", "familie", "shopping", "rejser"],
  },
  {
    url: "https://jyllands-posten.dk/sport/feed/rss",
    source: "JP Sport",
    sourceEmoji: "⚽",
    tags: ["fodbold", "håndbold", "cykling", "løb", "tennis", "golf", "basketball"],
  },
  {
    url: "https://jyllands-posten.dk/erhverv/feed/rss",
    source: "JP Erhverv",
    sourceEmoji: "💼",
    tags: ["shopping", "tech", "social"],
  },
  {
    url: "https://jyllands-posten.dk/kultur/feed/rss",
    source: "JP Kultur",
    sourceEmoji: "🎨",
    tags: ["kunst", "musik", "teater", "festival", "koncert", "stand-up"],
  },

  // --- Politiken ---
  {
    url: "https://politiken.dk/rss",
    source: "Politiken",
    sourceEmoji: "📰",
    tags: ["social", "familie", "kunst", "musik", "mad", "rejser"],
  },

  // --- Nordjyske ekstra ---
  {
    url: "https://nordjyske.dk/rss/erhverv",
    source: "Nordjyske Erhverv",
    sourceEmoji: "💼",
    tags: ["shopping", "tech", "social"],
  },
  {
    url: "https://nordjyske.dk/rss/indland",
    source: "Nordjyske Indland",
    sourceEmoji: "🇩🇰",
    tags: ["social", "familie", "frivilligt"],
  },

  // --- Dansk sport ---
  {
    url: "https://tipsbladet.dk/feed",
    source: "Tipsbladet",
    sourceEmoji: "⚽",
    tags: ["fodbold", "håndbold", "cykling", "basketball", "tennis"],
  },
  {
    url: "https://sporten.dk/feed",
    source: "Sporten.dk",
    sourceEmoji: "🏅",
    tags: ["fodbold", "håndbold", "cykling", "løb", "svømning", "tennis", "golf", "basketball", "ski", "snowboard"],
  },

  // --- Dansk tech ---
  {
    url: "https://www.version2.dk/rss",
    source: "Version2",
    sourceEmoji: "💻",
    tags: ["tech"],
  },

  // --- Dansk kultur og musik ---
  {
    url: "https://www.soundvenue.com/rss",
    source: "Soundvenue",
    sourceEmoji: "🎶",
    tags: ["musik", "koncert", "festival", "stand-up"],
  },
  {
    url: "https://gaffa.dk/rss",
    source: "GAFFA",
    sourceEmoji: "🎸",
    tags: ["musik", "koncert", "festival"],
    // Note: If this feed fails silently, check CORS or endpoint changes
  },

  // --- Dansk film og TV ---
  {
    url: "https://www.filmz.dk/rss",
    source: "Filmz.dk",
    sourceEmoji: "🎬",
    tags: ["kunst", "social", "festival"],
  },

  // --- Dansk mad ---
  {
    url: "https://madensverden.dk/feed",
    source: "Madens Verden",
    sourceEmoji: "🍽️",
    tags: ["mad"],
  },

  // --- Dansk økonomi og finans ---
  {
    url: "https://www.finanswatch.dk/rss",
    source: "FinansWatch",
    sourceEmoji: "📈",
    tags: ["shopping", "tech", "social"],
  },
  {
    url: "https://www.finans.dk/rss",
    source: "Finans.dk",
    sourceEmoji: "💹",
    tags: ["shopping", "social"],
  },
  {
    url: "https://borsen.dk/rss",
    source: "Børsen",
    sourceEmoji: "📊",
    tags: ["shopping", "tech", "motor", "social"],
  },
  {
    url: "https://epn.dk/rss",
    source: "EPN Erhverv",
    sourceEmoji: "💼",
    tags: ["shopping", "tech", "social"],
  },

  // --- Altinget (dansk politik og samfund) ---
  {
    url: "https://www.altinget.dk/rss",
    source: "Altinget",
    sourceEmoji: "🏛️",
    tags: ["social", "frivilligt", "familie"],
  },

  // --- Dansk videnskab ---
  {
    url: "https://videnskab.dk/rss",
    source: "Videnskab.dk",
    sourceEmoji: "🔭",
    tags: ["natur", "outdoor", "tech"],
  },

  // --- Dansk motor ---
  {
    url: "https://www.bilmagasinet.dk/rss",
    source: "Bilmagasinet",
    sourceEmoji: "🚗",
    tags: ["motor"],
  },
  {
    url: "https://www.motor.dk/rss",
    source: "Motor.dk",
    sourceEmoji: "🏎️",
    tags: ["motor"],
  },
  {
    url: "https://www.autoit.dk/rss",
    source: "AutoIT",
    sourceEmoji: "🚙",
    tags: ["motor", "tech"],
  },

  // --- Dansk mode ---
  {
    url: "https://www.elle.dk/rss",
    source: "Elle Danmark",
    sourceEmoji: "👗",
    tags: ["shopping", "social"],
  },

  // --- International nyheder ---
  {
    url: "https://feeds.bbci.co.uk/news/rss.xml",
    source: "BBC News",
    sourceEmoji: "🌐",
    tags: ["social", "familie", "frivilligt"],
  },
  {
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    source: "BBC World",
    sourceEmoji: "🌍",
    tags: ["social", "rejser"],
  },
  {
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    source: "BBC Business",
    sourceEmoji: "💼",
    tags: ["shopping", "tech", "social"],
  },
  {
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    source: "BBC Technology",
    sourceEmoji: "💻",
    tags: ["tech"],
  },
  {
    url: "https://feeds.bbci.co.uk/news/health/rss.xml",
    source: "BBC Health",
    sourceEmoji: "🏃",
    tags: ["fitness", "løb", "social"],
  },
  {
    url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    source: "BBC Science",
    sourceEmoji: "🔬",
    tags: ["natur", "outdoor", "tech"],
  },
  {
    url: "https://feeds.bbci.co.uk/sport/rss.xml",
    source: "BBC Sport",
    sourceEmoji: "🏆",
    tags: ["fodbold", "cykling", "tennis", "golf", "basketball", "svømning"],
  },
  {
    url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
    source: "BBC Entertainment",
    sourceEmoji: "🎬",
    tags: ["kunst", "musik", "teater", "festival", "koncert"],
  },

  // --- The Guardian ---
  {
    url: "https://www.theguardian.com/world/rss",
    source: "The Guardian",
    sourceEmoji: "🌐",
    tags: ["social", "rejser", "frivilligt"],
  },
  {
    url: "https://www.theguardian.com/technology/rss",
    source: "Guardian Tech",
    sourceEmoji: "💻",
    tags: ["tech"],
  },
  {
    url: "https://www.theguardian.com/sport/rss",
    source: "Guardian Sport",
    sourceEmoji: "⚽",
    tags: ["fodbold", "cykling", "tennis", "golf", "basketball", "løb", "svømning"],
  },
  {
    url: "https://www.theguardian.com/culture/rss",
    source: "Guardian Culture",
    sourceEmoji: "🎨",
    tags: ["kunst", "musik", "teater", "festival", "koncert", "stand-up"],
  },
  {
    url: "https://www.theguardian.com/food/rss",
    source: "Guardian Food",
    sourceEmoji: "🍽️",
    tags: ["mad"],
  },
  {
    url: "https://www.theguardian.com/fashion/rss",
    source: "Guardian Fashion",
    sourceEmoji: "👗",
    tags: ["shopping", "social"],
  },
  {
    url: "https://www.theguardian.com/film/rss",
    source: "Guardian Film",
    sourceEmoji: "🎬",
    tags: ["kunst", "festival"],
  },
  {
    url: "https://www.theguardian.com/music/rss",
    source: "Guardian Music",
    sourceEmoji: "🎵",
    tags: ["musik", "koncert", "festival"],
  },
  {
    url: "https://www.theguardian.com/environment/rss",
    source: "Guardian Environment",
    sourceEmoji: "🌿",
    tags: ["natur", "outdoor", "frivilligt"],
  },
  {
    url: "https://www.theguardian.com/travel/rss",
    source: "Guardian Travel",
    sourceEmoji: "✈️",
    tags: ["rejser", "outdoor"],
  },
  {
    url: "https://www.theguardian.com/science/rss",
    source: "Guardian Science",
    sourceEmoji: "🔭",
    tags: ["natur", "tech"],
  },
  {
    url: "https://www.theguardian.com/business/rss",
    source: "Guardian Business",
    sourceEmoji: "📊",
    tags: ["shopping", "tech", "social"],
  },

  // --- International tech ---
  {
    url: "https://techcrunch.com/feed/",
    source: "TechCrunch",
    sourceEmoji: "🚀",
    tags: ["tech"],
  },
  {
    url: "https://www.wired.com/feed/rss",
    source: "Wired",
    sourceEmoji: "⚡",
    tags: ["tech", "motor", "natur"],
  },
  {
    url: "https://www.theverge.com/rss/index.xml",
    source: "The Verge",
    sourceEmoji: "📱",
    tags: ["tech", "motor"],
  },
  {
    url: "https://arstechnica.com/feed/",
    source: "Ars Technica",
    sourceEmoji: "🖥️",
    tags: ["tech", "natur"],
  },

  // --- International sport ---
  {
    url: "https://www.espn.com/espn/rss/news",
    source: "ESPN",
    sourceEmoji: "🏈",
    tags: ["fodbold", "basketball", "tennis", "golf", "cykling", "kampsport"],
  },
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml",
    source: "NYT Sports",
    sourceEmoji: "🏅",
    tags: ["fodbold", "basketball", "tennis", "golf", "løb", "cykling"],
  },

  // --- International videnskab ---
  {
    url: "https://www.sciencedaily.com/rss/all.xml",
    source: "Science Daily",
    sourceEmoji: "🔬",
    tags: ["natur", "outdoor", "tech"],
  },
  {
    url: "https://www.nature.com/nature.rss",
    source: "Nature",
    sourceEmoji: "🧬",
    tags: ["natur", "tech"],
  },
  {
    url: "https://www.newscientist.com/feed/home",
    source: "New Scientist",
    sourceEmoji: "🔭",
    tags: ["natur", "tech"],
  },
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
    source: "NYT Science",
    sourceEmoji: "🌌",
    tags: ["natur", "tech"],
  },

  // --- International gaming ---
  {
    url: "https://www.gamespot.com/feeds/news/",
    source: "GameSpot",
    sourceEmoji: "🎮",
    tags: ["tech"],
  },
  {
    url: "https://www.polygon.com/rss/index.xml",
    source: "Polygon",
    sourceEmoji: "🕹️",
    tags: ["tech"],
  },
  {
    url: "https://kotaku.com/rss",
    source: "Kotaku",
    sourceEmoji: "🎮",
    tags: ["tech"],
  },

  // --- International nyheder (NYT) ---
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    source: "New York Times",
    sourceEmoji: "📰",
    tags: ["social", "rejser", "familie"],
  },
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    source: "NYT Technology",
    sourceEmoji: "💻",
    tags: ["tech"],
  },
];

// --- CORS Proxy (own Cloudflare Worker) ---
const PROXY = "https://bsocial-rss-proxy.pages.dev/?url=";

// --- Cache ---
const CACHE_KEY = "bsocial_news_v4";
const SAVED_NEWS_KEY = "bsocial_saved_news";
const CACHE_TTL = 30 * 60 * 1000; // 30 min

interface NewsCache {
  timestamp: number;
  items: NewsItem[];
}

function getCache(): NewsCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: NewsCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    // Restore Date objects
    cache.items = cache.items.map(i => ({ ...i, pubDate: new Date(i.pubDate) }));
    return cache;
  } catch {
    return null;
  }
}

function setCache(items: NewsItem[]): void {
  try {
    const cache: NewsCache = { timestamp: Date.now(), items };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* localStorage full */ }
}

// --- Bookmark / Saved News Functions ---
export function getSavedNews(): NewsItem[] {
  try {
    const raw = localStorage.getItem(SAVED_NEWS_KEY);
    if (!raw) return [];
    const items: NewsItem[] = JSON.parse(raw);
    return items.map(i => ({ ...i, pubDate: new Date(i.pubDate) }));
  } catch {
    return [];
  }
}

export function saveNews(item: NewsItem): void {
  try {
    const saved = getSavedNews();
    if (saved.some(i => i.id === item.id)) return;
    const next = [item, ...saved];
    localStorage.setItem(SAVED_NEWS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('bsocial-saved-news-changed', { detail: next }));
  } catch { /* localStorage full */ }
}

export function removeSavedNews(id: string): void {
  try {
    const saved = getSavedNews();
    const next = saved.filter(i => i.id !== id);
    localStorage.setItem(SAVED_NEWS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('bsocial-saved-news-changed', { detail: next }));
  } catch { /* error */ }
}

export function isNewsSaved(id: string): boolean {
  return getSavedNews().some(i => i.id === id);
}

// --- RSS Parser ---
function parseRSS(xml: string, config: FeedConfig): NewsItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const items = doc.querySelectorAll("item");
  const results: NewsItem[] = [];

  items.forEach((item, idx) => {
    const title = item.querySelector("title")?.textContent?.trim() || "";
    const description = item.querySelector("description")?.textContent?.trim() || "";
    const link = item.querySelector("link")?.textContent?.trim() || "";
    const pubDateStr = item.querySelector("pubDate")?.textContent?.trim();
    const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();

    // Try to extract image from enclosure, media:content, or description
    let image: string | null = null;
    const enclosure = item.querySelector("enclosure");
    if (enclosure?.getAttribute("type")?.startsWith("image")) {
      image = enclosure.getAttribute("url");
    }
    const mediaContent = item.querySelector("content");
    if (!image && mediaContent?.getAttribute("url")) {
      image = mediaContent.getAttribute("url");
    }

    // Fallback: extract first img src from description HTML
    if (!image && description) {
      const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/);
      if (imgMatch) image = imgMatch[1];
    }

    // Tag matching: scan title + description for tag keywords
    const matchedTags = matchTagsToContent(title + " " + description, config.tags);

    results.push({
      id: `news-${config.source}-${idx}-${pubDate.getTime()}`,
      title,
      description: stripHtml(description).slice(0, 150),
      link,
      image,
      source: config.source,
      sourceEmoji: config.sourceEmoji,
      pubDate,
      matchedTags,
      score: 0,
    });
  });

  return results;
}

// --- Strip HTML tags from string ---
// Safe HTML stripping without innerHTML (avoids XSS from RSS feeds)
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// --- Flatten all tags for keyword matching ---
function flattenAllTags(): { tag: string; label: string; keywords: string[] }[] {
  const flat: { tag: string; label: string; keywords: string[] }[] = [];
  for (const parent of TAG_TREE) {
    flat.push({
      tag: parent.tag,
      label: parent.label,
      keywords: [parent.tag, parent.label.toLowerCase()],
    });
    if (parent.children) {
      for (const child of parent.children) {
        flat.push({
          tag: child.tag,
          label: child.label,
          keywords: [child.tag, child.label.toLowerCase()],
        });
      }
    }
  }
  return flat;
}

const ALL_TAG_KEYWORDS = flattenAllTags();

// --- Match content text against tags ---
function matchTagsToContent(text: string, feedTags: string[]): string[] {
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  // Better sport keyword matching
  if (lower.includes("fodbold") || lower.includes("aab") || lower.includes("superliga")) matched.add("fodbold");
  if (lower.includes("håndbold") || lower.includes("aalborg håndbold")) matched.add("håndbold");
  if (lower.includes("cykling") || lower.includes("tour de")) matched.add("cykling");
  if (lower.includes("løb") || lower.includes("maraton")) matched.add("løb");
  if (lower.includes("padel") || lower.includes("tennis")) matched.add("tennis");

  // Always include feed-level tags if content has relevant words
  for (const ft of feedTags) {
    const node = getTagNode(ft);
    if (node && lower.includes(node.label.toLowerCase())) {
      matched.add(ft);
    }
  }

  // Scan for specific tag keywords in content
  for (const t of ALL_TAG_KEYWORDS) {
    for (const kw of t.keywords) {
      if (kw.length >= 3 && lower.includes(kw)) {
        matched.add(t.tag);
        break;
      }
    }
  }

  // If no specific matches, use the feed's default tags
  if (matched.size === 0 && feedTags.length > 0) {
    matched.add(feedTags[0]);
  }

  return [...matched];
}

// --- Score news item against user tags ---
export function scoreNewsItem(item: NewsItem, userTags: string[]): number {
  if (userTags.length === 0) return 0;
  let score = 0;
  const itemTags = new Set(item.matchedTags);

  for (const ut of userTags) {
    if (itemTags.has(ut.toLowerCase())) {
      score += 10; // Direct match
    }
    const related = getRelatedTags(ut);
    for (const rt of related) {
      if (itemTags.has(rt)) score += 3; // Related match
    }
  }

  // Recency bonus: newer articles get a small boost
  const hoursAgo = (Date.now() - item.pubDate.getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 6) score += 5;
  else if (hoursAgo < 24) score += 2;

  return score;
}

// --- Fetch all news ---
export async function fetchNews(): Promise<NewsItem[]> {
  // Check cache first
  const cached = getCache();
  if (cached) return cached.items;

  const allItems: NewsItem[] = [];
  const fetches = RSS_FEEDS.map(async (config) => {
    try {
      const res = await fetch(PROXY + encodeURIComponent(config.url), {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        logger.warn(`[NewsEngine] HTTP ${res.status} from ${config.source}`);
        return [];
      }
      const xml = await res.text();
      const items = parseRSS(xml, config);
      // Log if major feed returns nothing
      if (items.length === 0 && ['GAFFA', 'DR Sporten', 'Nordjyske'].includes(config.source)) {
        logger.warn(`[NewsEngine] ${config.source} returned no items (may be endpoint/CORS issue)`);
      }
      return items;
    } catch (err) {
      logger.warn(`[NewsEngine] Failed to fetch ${config.source}:`, err instanceof Error ? err.message : String(err));
      return [];
    }
  });

  const results = await Promise.allSettled(fetches);
  for (const r of results) {
    if (r.status === "fulfilled") allItems.push(...r.value);
  }

  // Prioritize Danish sources, then sort by date (newest first)
  const isDanish = (source: string) =>
    ['nordjyske', 'dr ', 'jyllands', 'politiken', 'tv2', 'tipsbladet', 'version2', 'soundvenue', 'gaffa', 'altinget', 'børsen', 'finans']
    .some(dk => source.toLowerCase().includes(dk));

  allItems.sort((a, b) => {
    const aDK = isDanish(a.source) ? 1 : 0;
    const bDK = isDanish(b.source) ? 1 : 0;
    if (aDK !== bDK) return bDK - aDK; // Danish first
    return b.pubDate.getTime() - a.pubDate.getTime(); // Then newest
  });

  // Only cache non-empty results
  if (allItems.length > 0) setCache(allItems);
  return allItems;
}

// --- Get personalized news for user tags ---
export function getPersonalizedNews(allNews: NewsItem[], userTags: string[]): NewsItem[] {
  if (userTags.length === 0) return allNews.slice(0, 10);

  // Score all items
  const scored = allNews.map(item => ({
    ...item,
    score: scoreNewsItem(item, userTags),
  }));

  // Filter to only items with score > 0, then sort by score
  return scored
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score || b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 20);
}

// --- Group news by tag sections (like buildTagFeed) ---
export interface NewsSection {
  tag: string;
  label: string;
  emoji: string;
  items: NewsItem[];
}

export function buildNewsSections(allNews: NewsItem[], userTags: string[]): NewsSection[] {
  if (userTags.length === 0) return [];

  const sections: NewsSection[] = [];
  for (const tag of userTags) {
    const node = getTagNode(tag);
    const related = [tag, ...getRelatedTags(tag)];
    const relatedSet = new Set(related.map(r => r.toLowerCase()));

    const matched = allNews.filter(item => 
      item.matchedTags.some(mt => relatedSet.has(mt.toLowerCase()))
    );

    if (matched.length > 0) {
      // Sort by date within section
      matched.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
      sections.push({
        tag,
        label: node?.label || tag,
        emoji: node?.emoji || "⭐",
        items: matched.slice(0, 5),
      });
    }
  }
  return sections;
}

// --- Format relative time in Danish ---
export function formatNewsTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Lige nu";
  if (mins < 60) return `${mins} min siden`;
  if (hours < 24) return `${hours} ${hours === 1 ? "time" : "timer"} siden`;
  if (days < 7) return `${days} ${days === 1 ? "dag" : "dage"} siden`;
  return date.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}
