import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { getEvents } from "@/lib/data";
import { getEventImage, formatDanishDate } from "@/lib/eventHelpers";
import { Search, Bell, Loader2, ExternalLink, SlidersHorizontal, Compass, X } from "lucide-react";
import { fetchNews, formatNewsTime, type NewsItem } from "@/lib/newsEngine";
import { buildTagFeed, scoreEvent, getTrendingTags, getTagNode } from "@/lib/tagEngine";
import { useAuth } from "@/context/AuthContext";
import { useTags } from "@/context/TagContext";
import { useNotifications } from "@/context/NotificationContext";
import { FeedTagEditor } from "@/components/FeedTagEditor";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ─────────────────────────────────────────────
   B-Social Feed — Premium Redesign
   Scoped CSS prefix: fd-
   ───────────────────────────────────────────── */

function getPersonalizedGreeting(name: string | null | undefined, isAnonymous: boolean, t: (key: string) => string): string {
  if (isAnonymous) return t('greeting.welcome');
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? t('greeting.morning') : hour < 17 ? t('greeting.afternoon') : t('greeting.evening');
  const displayName = name && name.length > 1 ? name : null;
  return displayName ? `${timeGreeting}, ${displayName}` : `${timeGreeting}, ${t('greeting.anonymous')}`;
}

export default function Feed() {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { selectedTags, setSelectedTags, city } = useTags();
  const { unreadCount } = useNotifications();
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const containerRef = useFadeUp("fd");

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000,
  });

  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    setNewsLoading(true);
    fetchNews()
      .then(items => { setAllNews(items); setNewsLoading(false); })
      .catch(() => setNewsLoading(false));
  }, []);

  const relevantNews = useMemo(() => {
    return allNews.slice(0, 6);
  }, [allNews]);

  const displayName = profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || null;
  const isAnonymous = !profile && !user;
  const greeting = getPersonalizedGreeting(displayName, isAnonymous, t);

  const tagSections = useMemo(() => {
    if (events.length === 0 || selectedTags.length === 0) return [];
    const now = new Date().toISOString();
    const upcomingEvents = events.filter(e => e.date >= now);
    if (upcomingEvents.length === 0) return [];
    const sections = buildTagFeed(upcomingEvents, selectedTags);
    return sections.map(section => ({
      ...section,
      events: [...section.events].sort((a, b) => scoreEvent(b, selectedTags) - scoreEvent(a, selectedTags)),
    }));
  }, [events, selectedTags]);

  const trendingTags = useMemo(() => {
    return getTrendingTags(events, 12);
  }, [events]);

  const demoSections = useMemo(() => {
    if (events.length === 0) return [];
    const catMap: Record<string, typeof events> = {};
    for (const e of events) {
      const cat = e.category || 'andet';
      if (!catMap[cat]) catMap[cat] = [];
      catMap[cat].push(e);
    }
    const categorySections = Object.entries(catMap)
      .filter(([_, evts]) => evts.length >= 1)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 6)
      .map(([cat, evts]) => ({
        tag: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        emoji: getTagNode(cat)?.emoji || '\uD83C\uDFAF',
        events: evts.slice(0, 8),
      }));

    const intlEvents = events.filter(e => e.country && e.country !== 'DK');
    if (intlEvents.length >= 2) {
      categorySections.push({
        tag: 'international',
        label: t('feed.international_events'),
        emoji: '🌍',
        events: intlEvents.slice(0, 8),
      });
    }

    return categorySections;
  }, [events, t]);

  const filteredDemoSections = useMemo(() => {
    if (!activeSearch) return demoSections;
    const q = activeSearch.toLowerCase();
    return demoSections
      .map(section => ({
        ...section,
        events: section.events.filter(e =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          (e.interest_tags && e.interest_tags.some((tag: string) => tag.toLowerCase().includes(q)))
        ),
      }))
      .filter(section => section.events.length > 0);
  }, [demoSections, activeSearch]);

  const filteredTagSections = useMemo(() => {
    if (!activeSearch) return tagSections;
    const q = activeSearch.toLowerCase();
    return tagSections
      .map(section => ({
        ...section,
        events: section.events.filter(e =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          (e.interest_tags && e.interest_tags.some((tag: string) => tag.toLowerCase().includes(q)))
        ),
      }))
      .filter(section => section.events.length > 0);
  }, [tagSections, activeSearch]);

  const searchResultCount = useMemo(() => {
    if (!activeSearch) return 0;
    const sections = isAnonymous && tagSections.length === 0 ? filteredDemoSections : filteredTagSections;
    return sections.reduce((acc, s) => acc + s.events.length, 0);
  }, [activeSearch, isAnonymous, tagSections, filteredDemoSections, filteredTagSections]);

  const subtitle = profile
    ? `${city || profile.city || t('feed.denmark')} · ${selectedTags.length} ${t('feed.tags_selected')}`
    : isAnonymous
    ? t('feed.demo_subtitle')
    : t('feed.subtitle');

  const tagColors = ['#4ecdc4','#2dd4a8','#06b6d4','#22c55e','#14b8a6','#0ea5e9','#10b981'];

  const newestEvents = useMemo(() => {
    if (events.length === 0) return [];
    return [...events]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [events]);

  const masonryEvents = useMemo(() => {
    // Show tag-filtered events if user has tags, otherwise show all events (demo sections)
    const hasUserTags = selectedTags.length > 0 && filteredTagSections.length > 0;
    const src = hasUserTags ? filteredTagSections : (activeSearch ? filteredDemoSections : demoSections);
    const maxLen = Math.max(...src.map(s => s.events.length), 0);
    const seen = new Set<string>();
    const result: typeof events = [];
    for (let i = 0; i < maxLen; i++) {
      for (const s of src) {
        if (i < s.events.length) {
          const e = s.events[i];
          if (!seen.has(e.id)) { seen.add(e.id); result.push(e); }
        }
      }
    }
    return result;
  }, [selectedTags, filteredTagSections, filteredDemoSections, demoSections, activeSearch]);

  if (isLoading) {
    return (
      <div className="fd-root">
        <style>{feedCSS}</style>
        <div className="fd-loading">
          <div className="fd-loading-dot" />
          <p>{t('feed.loading_events')}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fd-root">
      <style>{feedCSS}</style>

      {/* ── IMMERSIVE HERO — greeting overlaid on photo ── */}
      <div className="fd-cover">
        <img src="/feed-hero.png" alt="" />
        <div className="fd-cover-overlay" />
        <div className="fd-cover-greeting">
          <h1 className="fd-cover-title">{greeting}</h1>
          <p className="fd-cover-sub">{subtitle}</p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="fd-content">

      {/* ── ACTION BAR ── */}
      <div className="fd-action-bar fd-fade-up">
        <button onClick={() => setTagEditorOpen(true)} className="fd-icon-btn" title="Rediger tags">
          <SlidersHorizontal size={18} />
        </button>
        <div className="fd-search-wrap fd-search-expand">
          <Search size={15} className="fd-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setActiveSearch(searchQuery.trim());
              if (e.key === "Escape") { setSearchQuery(""); setActiveSearch(""); }
            }}
            placeholder="Søg events, steder..."
            className="fd-search-input"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setActiveSearch(""); }} className="fd-search-clear">
              <X size={13} />
            </button>
          )}
        </div>
        <Link href="/notifikationer" className="fd-icon-btn fd-bell-btn">
          <Bell size={18} />
          {unreadCount > 0 && <span className="fd-bell-dot" />}
        </Link>
      </div>

      {/* ── SEARCH RESULTS BANNER ── */}
      {activeSearch && (
        <div className="fd-search-banner fd-fade-up">
          <span className="fd-search-banner-text">
            <strong>{searchResultCount}</strong> {searchResultCount === 1 ? "resultat" : "resultater"} for{" "}
            <span className="fd-search-banner-query">"{activeSearch}"</span>
          </span>
          <button onClick={() => { setSearchQuery(""); setActiveSearch(""); }} className="fd-search-banner-clear">
            <X size={12} /> Ryd
          </button>
        </div>
      )}

      {/* ── ACTIVE TAGS ── */}
      {selectedTags.length > 0 && (
        <div className="fd-active-tags fd-fade-up fd-d1">
          <span className="fd-active-tags-label">Aktive tags:</span>
          {selectedTags.map(tag => {
            const node = getTagNode(tag);
            return (
              <button key={tag} onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))} className="fd-tag-pill">
                {node?.emoji || "🏷️"} {node?.label || tag}
                <span className="fd-tag-pill-x">✕</span>
              </button>
            );
          })}
          <button onClick={() => setSelectedTags([])} className="fd-clear-all">Ryd alle</button>
        </div>
      )}

      {/* ── NEWEST EVENTS ── */}
      {!activeSearch && newestEvents.length > 0 && (
        <div className="fd-newest-section fd-fade-up">
          <div className="fd-newest-head">
            <span className="fd-newest-label">✨ Nyeste events</span>
            <Link href="/udforsk" className="fd-newest-link">Se alle</Link>
          </div>
          <div className="fd-newest-scroll">
            {newestEvents.map(e => (
              <Link key={e.id} href={`/event/${e.id}`} className="fd-newest-card">
                <img src={getEventImage(e)} alt={e.title} className="fd-newest-img" loading="lazy"
                  onError={(ev) => { (ev.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop"; }} />
                <div className="fd-newest-grad" />
                <div className="fd-newest-text">
                  <p className="fd-newest-date">{formatDanishDate(e.date)}</p>
                  <h3 className="fd-newest-title">{e.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── EVENTS HEADER ── */}
      <div className="fd-events-header fd-fade-up">
        <h2 className="fd-events-count">{masonryEvents.length} Events</h2>
        <button onClick={() => setTagEditorOpen(true)} className="fd-chip active">
          {selectedTags.length > 0 ? t('feed.edit_tags') : t('feed.select_interests_btn')}
        </button>
      </div>

      {/* ── MOBILE TAG STRIP (hidden on desktop) ── */}
      <div className="fd-mobile-tags">
        {trendingTags.slice(0, 8).map(({ tag }, i) => {
          const node = getTagNode(tag);
          const isActive = selectedTags.includes(tag);
          const color = tagColors[i % tagColors.length];
          return (
            <button
              key={tag}
              onClick={() => {
                if (isActive) setSelectedTags(selectedTags.filter(t => t !== tag));
                else setSelectedTags([...selectedTags, tag]);
              }}
              className={`fd-mobile-tag ${isActive ? "active" : ""}`}
              style={!isActive ? { color, borderColor: `${color}44` } : undefined}
            >
              #{node?.label || tag}
            </button>
          );
        })}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="fd-grid">
        <div className="fd-main">
          {masonryEvents.length === 0 ? (
            activeSearch ? (
              <div className="fd-empty-search">
                <Search size={32} />
                <p>Ingen events fundet for "{activeSearch}"</p>
              </div>
            ) : (
              <div className="fd-empty fd-fade-up">
                <div className="fd-empty-icon"><Compass size={28} /></div>
                <h2 className="fd-empty-h2">{t('feed.get_started')}</h2>
                <p className="fd-empty-p">{t('feed.select_interests')}</p>
                <div className="fd-empty-actions">
                  <button onClick={() => setTagEditorOpen(true)} className="fd-btn">{t('feed.select_interests_btn')}</button>
                  <Link href="/udforsk" className="fd-btn-ghost">{t('feed.explore_all_events')}</Link>
                </div>
              </div>
            )
          ) : (
            <div className="fd-masonry">
              {masonryEvents.map((event) => (
                <Link key={event.id} href={`/event/${event.id}`} className="fd-masonry-card">
                  <img src={getEventImage(event)} alt={event.title} className="fd-masonry-img" loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop"; }} />
                  <div className="fd-masonry-overlay" />
                  <div className="fd-masonry-text">
                    <p className="fd-masonry-date">{formatDanishDate(event.date)}</p>
                    <h3 className="fd-masonry-title">{event.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {isAnonymous && (
            <div className="fd-floating-cta">
              <Link href="/auth" className="fd-floating-cta-btn">{t('feed.demo_cta_banner')}</Link>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="fd-sidebar">
          {/* Trending Tags — tag cloud */}
          <div className="fd-sidebar-card fd-fade-up fd-d2">
            <h3 className="fd-sidebar-card-title">Trending Tags</h3>
            <div className="fd-tag-cloud">
              {trendingTags.map(({ tag, count }, i) => {
                const node = getTagNode(tag);
                const isActive = selectedTags.includes(tag);
                const color = tagColors[i % tagColors.length];
                const maxCount = trendingTags[0]?.count || 1;
                const ratio = count / maxCount;
                const fontSize = 13 + ratio * 16;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (isActive) setSelectedTags(selectedTags.filter(t => t !== tag));
                      else setSelectedTags([...selectedTags, tag]);
                    }}
                    className={`fd-cloud-tag ${isActive ? "active" : ""}`}
                    style={{ color: isActive ? undefined : color, fontSize: `${fontSize}px` }}
                  >
                    #{node?.label || tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Activity */}
          <div className="fd-sidebar-card fd-fade-up fd-d3">
            <div className="fd-sidebar-header">
              <h3>Live Activity</h3>
              <span className="fd-live-badge">LIVE</span>
            </div>
            <div className="fd-activity-list">
              {[
                { avatar: '👩', name: 'Anna', action: 'liked a photo of', target: 'Tivoli Gardens' },
                { avatar: '👩‍🦰', name: 'Sofia', action: 'commented', target: 'Hygge i Nyhavn' },
                { avatar: '🧑', name: 'Erik', action: "RSVP'd to", target: 'Jazz i Kødbyen' },
              ].map((item, i) => (
                <div key={i} className="fd-activity-item">
                  <span className="fd-activity-avatar">{item.avatar}</span>
                  <p className="fd-activity-text">
                    <strong>{item.name}</strong> {item.action} <em>'{item.target}'</em>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* News */}
          <div className="fd-sidebar-card fd-fade-up fd-d4">
            <div className="fd-sidebar-header">
              <h3>{t('feed.news_for_you')}</h3>
              <span className="fd-live-badge">LIVE</span>
            </div>
            {newsLoading ? (
              <div className="fd-sidebar-loading">
                <Loader2 size={14} className="animate-spin" />
                {t('feed.fetching_news')}
              </div>
            ) : relevantNews.length > 0 ? (
              <div className="fd-news-list">
                {relevantNews.map((news, i) => (
                  <a key={i} href={news.link} target="_blank" rel="noopener noreferrer" className="fd-news-item">
                    <div className="fd-news-item-text">
                      <p className="fd-news-meta">{news.sourceEmoji} {news.source} &bull; {formatNewsTime(news.pubDate)}</p>
                      <p className="fd-news-title">{news.title}</p>
                    </div>
                    <ExternalLink size={12} className="fd-news-ext" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="fd-sidebar-empty">{t('feed.no_news')}</p>
            )}
          </div>
        </aside>
      </div>

      </div>{/* end fd-content */}

      <FeedTagEditor open={tagEditorOpen} onClose={() => setTagEditorOpen(false)} />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Scoped CSS — all classes prefixed with fd-
   IMMERSIVE MAGAZINE — Pinterest masonry + overlay text
   ────────────────────────────────────────────── */
const feedCSS = `
${pageBase("fd")}

/* ── Immersive cover with greeting overlaid ── */
.fd-cover { height: clamp(320px, 40vh, 480px); }
.fd-cover-overlay {
  background: linear-gradient(
    to bottom,
    transparent 30%,
    rgba(6,10,15,0.7) 65%,
    rgba(6,10,15,0.98) 100%
  ) !important;
}
.fd-cover-greeting {
  position: absolute; bottom: 28px; left: 32px; z-index: 2;
}
.fd-cover-title {
  font-family: var(--serif); font-size: clamp(28px, 4vw, 42px);
  font-weight: 400; color: var(--pg-white); line-height: 1.05;
  letter-spacing: -0.5px; text-shadow: 0 4px 24px rgba(0,0,0,0.5);
}
.fd-cover-sub {
  font-size: 13px; color: var(--teal); margin-top: 6px;
  font-weight: 500; letter-spacing: 0.3px;
}

/* ── Loading ── */
.fd-loading {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px;
}
.fd-loading p { font-size: 14px; color: var(--pg-white-muted); }
.fd-loading-dot {
  width: 8px; height: 8px; background: var(--teal);
  border-radius: 50%; animation: fd-pulse 1.5s ease-in-out infinite;
}
@keyframes fd-pulse { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }

/* ── Content wrapper ── */
.fd-content { padding: 0 20px; }

/* ── Action bar ── */
.fd-action-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 20px 0 16px;
}
.fd-search-expand { display: block; flex: 1; }
.fd-search-expand .fd-search-input { width: 100%; }
.fd-icon-btn {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  color: var(--pg-white-dim); display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all 0.25s;
}
.fd-icon-btn:hover { background: var(--glass-bg-hover); color: var(--pg-white); }
.fd-bell-btn { position: relative; }
.fd-bell-dot {
  position: absolute; top: 8px; right: 8px; width: 7px; height: 7px;
  background: #ef4444; border-radius: 50%;
}

/* ── Search ── */
.fd-search-wrap { position: relative; display: block; }
.fd-search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: var(--pg-white-muted); pointer-events: none;
}
.fd-search-input {
  width: 200px; padding: 11px 36px 11px 38px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  border-radius: 12px; color: var(--pg-white); font-size: 13px;
  font-family: var(--sans); outline: none; transition: all 0.25s;
}
.fd-search-input:focus { border-color: rgba(78,205,196,0.4); width: 260px; }
.fd-search-input::placeholder { color: rgba(255,255,255,0.3); }
.fd-search-clear {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  color: var(--pg-white-muted); background: none; border: none;
  cursor: pointer; transition: color 0.2s;
}
.fd-search-clear:hover { color: var(--pg-white); }

/* ── Search banner ── */
.fd-search-banner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; margin-bottom: 16px; border-radius: 14px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
}
.fd-search-banner-text { font-size: 13px; color: var(--pg-white-dim); }
.fd-search-banner-text strong { color: var(--pg-white); }
.fd-search-banner-query { color: var(--teal); font-weight: 500; }
.fd-search-banner-clear {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--pg-white-muted); background: none; border: none;
  cursor: pointer; padding: 6px 10px; border-radius: 8px; transition: all 0.2s;
}
.fd-search-banner-clear:hover { background: var(--glass-bg); color: var(--pg-white-dim); }

/* ── Active tags ── */
.fd-active-tags {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  margin-bottom: 16px;
}
.fd-active-tags-label { font-size: 11px; color: var(--pg-white-muted); }
.fd-tag-pill {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; padding: 6px 14px; border-radius: 100px;
  background: var(--teal-dim); color: var(--teal); border: none;
  cursor: pointer; transition: all 0.2s; font-family: var(--sans);
}
.fd-tag-pill:hover { background: rgba(78,205,196,0.25); }
.fd-tag-pill-x { font-size: 10px; margin-left: 2px; opacity: 0.6; }
.fd-clear-all {
  font-size: 10px; color: var(--pg-white-muted); background: none; border: none;
  cursor: pointer; margin-left: 4px; transition: color 0.2s;
}
.fd-clear-all:hover { color: var(--pg-white-dim); }

/* ── Events header ── */
.fd-events-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0 20px;
}
.fd-events-count {
  font-family: var(--serif); font-size: clamp(22px, 3vw, 32px);
  font-weight: 400; color: var(--pg-white);
}

/* ── Main grid (content + sidebar) ── */
.fd-grid {
  display: grid; grid-template-columns: 1fr; gap: 32px;
}
@media (min-width: 1200px) {
  .fd-grid { grid-template-columns: 1fr 300px; }
}

/* ═══ MASONRY — CSS columns for Pinterest layout ═══ */
.fd-masonry {
  column-count: 2; column-gap: 16px;
}
.fd-masonry > * {
  break-inside: avoid; margin-bottom: 16px;
}
@media (min-width: 1400px) { .fd-masonry { column-count: 3; } }
@media (max-width: 600px)  { .fd-masonry { column-count: 1; } }

/* ── Masonry card — image with overlay text ── */
.fd-masonry-card {
  position: relative; border-radius: 16px; overflow: hidden;
  display: block; text-decoration: none; color: var(--pg-white);
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s;
}
.fd-masonry-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
}
.fd-masonry-img {
  width: 100%; display: block; object-fit: cover;
  transition: transform 0.6s ease;
}
.fd-masonry-card:hover .fd-masonry-img { transform: scale(1.05); }

/* Vary heights for visual rhythm */
.fd-masonry-card:nth-child(3n+1) .fd-masonry-img { height: 280px; }
.fd-masonry-card:nth-child(3n+2) .fd-masonry-img { height: 200px; }
.fd-masonry-card:nth-child(3n)   .fd-masonry-img { height: 340px; }

.fd-masonry-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(6,10,15,0.85) 0%, rgba(6,10,15,0.2) 40%, transparent 60%);
  pointer-events: none;
}
.fd-masonry-text {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 16px 18px; z-index: 2;
}
.fd-masonry-date {
  font-size: 11px; color: var(--teal); text-transform: uppercase;
  letter-spacing: 1px; font-weight: 500; margin-bottom: 4px;
}
.fd-masonry-title {
  font-size: 15px; font-weight: 600; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
}

/* ── Empty states ── */
.fd-empty { text-align: center; padding: 64px 24px; }
.fd-empty-icon {
  width: 64px; height: 64px; border-radius: 18px;
  background: var(--teal-dim); display: flex; align-items: center;
  justify-content: center; margin: 0 auto 20px; color: var(--teal);
}
.fd-empty-h2 { font-family: var(--serif); font-size: 20px; margin-bottom: 10px; }
.fd-empty-p { font-size: 14px; color: var(--pg-white-muted); margin-bottom: 24px; }
.fd-empty-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.fd-empty-search { text-align: center; padding: 48px 24px; color: var(--pg-white-muted); }
.fd-empty-search p { font-size: 14px; margin-top: 12px; }

/* ── Floating CTA ── */
.fd-floating-cta {
  position: sticky; bottom: 24px; display: flex; justify-content: center;
  margin-top: 24px; pointer-events: none;
}
.fd-floating-cta-btn {
  pointer-events: auto; display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: 100px;
  background: var(--teal); color: var(--bg); font-size: 14px;
  font-weight: 600; text-decoration: none; font-family: var(--sans);
  box-shadow: 0 8px 32px rgba(78,205,196,0.3); transition: all 0.3s;
}
.fd-floating-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(78,205,196,0.4);
}

/* ── Sidebar ── */
.fd-sidebar { display: flex; flex-direction: column; gap: 20px; }
.fd-sidebar-card {
  padding: 22px; border-radius: 18px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
}
.fd-sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.fd-sidebar-header h3 { font-size: 14px; font-weight: 600; color: var(--pg-white-dim); }
.fd-live-badge {
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  padding: 3px 10px; border-radius: 100px;
  background: rgba(16,185,129,0.15); color: #34d399;
}
.fd-sidebar-loading {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--pg-white-muted); padding: 16px 0;
}
.fd-sidebar-empty { font-size: 12px; color: var(--pg-white-muted); padding: 16px 0; }
.fd-sidebar-card-title {
  font-size: 14px; font-weight: 600; color: var(--pg-white-dim); margin-bottom: 14px;
}

/* ── News items ── */
.fd-news-list { display: flex; flex-direction: column; gap: 4px; }
.fd-news-item {
  display: flex; gap: 10px; padding: 10px; border-radius: 10px;
  text-decoration: none; color: var(--pg-white); transition: background 0.2s;
}
.fd-news-item:hover { background: var(--glass-bg-hover); }
.fd-news-item-text { flex: 1; min-width: 0; }
.fd-news-meta { font-size: 11px; color: var(--pg-white-muted); margin-bottom: 3px; }
.fd-news-title {
  font-size: 12px; font-weight: 500; color: var(--pg-white-dim); line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.fd-news-item:hover .fd-news-title { color: var(--pg-white); }
.fd-news-ext { color: var(--pg-white-muted); flex-shrink: 0; margin-top: 4px; }
.fd-news-item:hover .fd-news-ext { color: var(--pg-white-dim); }

/* ── Tag cloud (varied sizes, no borders) ── */
.fd-tag-cloud { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: baseline; }
.fd-cloud-tag {
  background: none; border: none; cursor: pointer;
  font-family: var(--sans); font-weight: 600;
  transition: opacity 0.2s, transform 0.2s;
  padding: 2px 0; line-height: 1.2;
}
.fd-cloud-tag:hover { opacity: 0.7; transform: scale(1.05); }
.fd-cloud-tag.active {
  color: var(--teal) !important;
  text-decoration: underline; text-underline-offset: 3px;
}

/* ── Mobile tag strip (hidden on desktop) ── */
.fd-mobile-tags {
  display: none; overflow-x: auto; gap: 8px; padding: 0 0 16px;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
}
.fd-mobile-tags::-webkit-scrollbar { display: none; }
.fd-mobile-tag {
  flex-shrink: 0; padding: 6px 14px; border-radius: 100px;
  background: transparent; border: 1px solid var(--glass-border);
  font-size: 12px; font-weight: 500; font-family: var(--sans);
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.fd-mobile-tag:hover { background: rgba(255,255,255,0.05); }
.fd-mobile-tag.active {
  background: var(--teal); color: var(--bg) !important;
  border-color: var(--teal) !important; font-weight: 600;
}

/* ── Live Activity ── */
.fd-activity-list { display: flex; flex-direction: column; gap: 4px; }
.fd-activity-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px; border-radius: 10px; transition: background 0.2s;
}
.fd-activity-item:hover { background: var(--glass-bg-hover); }
.fd-activity-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--glass-bg); display: flex;
  align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
  border: 1px solid var(--glass-border);
}
.fd-activity-text {
  font-size: 12px; color: var(--pg-white-dim); line-height: 1.45;
}
.fd-activity-text strong { color: var(--pg-white); font-weight: 600; }
.fd-activity-text em { color: var(--teal); font-style: normal; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .fd-cover { height: clamp(140px, 22vh, 180px); }
  .fd-cover-greeting { bottom: 14px; left: 16px; }
  .fd-cover-title { font-size: 22px; }
  .fd-cover-sub { font-size: 11px; margin-top: 3px; }
  .fd-content { padding: 0 12px; }
  .fd-action-bar { padding: 10px 0 8px; gap: 6px; }
  .fd-events-header { padding: 0 0 6px; }
  .fd-mobile-tags { display: flex; padding: 0 0 10px; }
  .fd-masonry { column-count: 2; gap: 10px; }
  .fd-masonry-card { margin-bottom: 10px; border-radius: 10px; }
  .fd-masonry-card:nth-child(n) .fd-masonry-img { height: auto; min-height: 120px; }
  .fd-masonry-text { padding: 10px 10px; }
  .fd-masonry-date { font-size: 9px; letter-spacing: 0.5px; margin-bottom: 2px; }
  .fd-masonry-title { font-size: 11px; -webkit-line-clamp: 2; }
  .fd-sidebar { display: none; }
  .fd-newest-card { min-width: 140px; max-width: 140px; height: 100px; }
}

/* ── NEWEST EVENTS STRIP ── */
.fd-newest-section { padding: 0 0 4px; }
.fd-newest-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.fd-newest-label { font-size: 13px; font-weight: 600; color: var(--pg-white); }
.fd-newest-link { font-size: 12px; color: var(--pg-accent); text-decoration: none; }
.fd-newest-scroll {
  display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px;
  scrollbar-width: none;
}
.fd-newest-scroll::-webkit-scrollbar { display: none; }
.fd-newest-card {
  position: relative; min-width: 160px; max-width: 160px; height: 110px;
  border-radius: 12px; overflow: hidden; flex-shrink: 0;
  text-decoration: none; color: var(--pg-white);
}
.fd-newest-img { width: 100%; height: 100%; object-fit: cover; }
.fd-newest-grad {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%);
}
.fd-newest-text {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 8px 10px;
}
.fd-newest-date { font-size: 9px; letter-spacing: 0.05em; color: rgba(255,255,255,0.6); margin-bottom: 2px; }
.fd-newest-title {
  font-size: 11px; font-weight: 600; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
`;
