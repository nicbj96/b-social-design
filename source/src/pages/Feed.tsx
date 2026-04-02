import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { getEvents } from "@/lib/data";
import { getEventImage, formatDanishDate } from "@/lib/eventHelpers";
import { Search, ChevronRight, Bell, Loader2, ExternalLink, SlidersHorizontal, Compass, X } from "lucide-react";
import { fetchNews, formatNewsTime, type NewsItem } from "@/lib/newsEngine";
import { buildTagFeed, scoreEvent, getTrendingTags, getTagNode, type TagSection } from "@/lib/tagEngine";
import { useAuth } from "@/context/AuthContext";
import { EmailCaptureInline } from "@/components/EmailCapture";
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
      .filter(([_, evts]) => evts.length >= 2)
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

      {/* ── COVER HERO ── */}
      <div className="fd-cover">
        <img src="/feed-hero.png" alt="" />
        <div className="fd-cover-overlay" />
      </div>

      {/* ── IDENTITY ── */}
      <div className="fd-identity">
        <div className="fd-avatar">
          {profile?.name ? profile.name.charAt(0).toUpperCase() : '🏠'}
        </div>
        <h1 className="fd-identity-title">{greeting}</h1>
        <p className="fd-identity-sub">{subtitle}</p>
      </div>

      {/* ── STATS ── */}
      <div className="fd-stats">
        <div className="fd-stat-card">
          <div className="fd-stat-val">{events.length > 999 ? (events.length / 1000).toFixed(1) + 'K' : events.length}</div>
          <div className="fd-stat-lbl">Events</div>
        </div>
        <div className="fd-stat-card">
          <div className="fd-stat-val">{trendingTags.length}</div>
          <div className="fd-stat-lbl">Trending</div>
        </div>
        <div className="fd-stat-card">
          <div className="fd-stat-val">{selectedTags.length || '—'}</div>
          <div className="fd-stat-lbl">Mine tags</div>
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

      {/* ── TAG EDITOR TRIGGER ── */}
      <div className="fd-tag-trigger fd-fade-up fd-d2">
        <button onClick={() => setTagEditorOpen(true)} className="fd-tag-trigger-btn">
          <div className="fd-tag-trigger-icon"><SlidersHorizontal size={14} /></div>
          <span>{selectedTags.length > 0 ? t('feed.edit_tags') : t('feed.select_interests_btn')}</span>
        </button>
      </div>

      {/* ── HERO (anonymous) ── */}
      {isAnonymous && tagSections.length === 0 && (
        <section className="fd-hero fd-fade-up fd-d1">
          <img src="/concert.jpg" alt="" className="fd-hero-bg" />
          <div className="fd-hero-overlay" />
          <div className="fd-hero-content">
            <div className="fd-hero-live">
              <span className="fd-live-dot"><span className="fd-live-ping" /><span className="fd-live-core" /></span>
              Live i dag
            </div>
            <h2 className="fd-hero-h2">Find din næste<br /><em>store oplevelse</em></h2>
            <p className="fd-hero-p">Events, steder og aktiviteter overalt i verden — alt samlet ét sted. Fra Nyhavn til nordlyset.</p>
            <div className="fd-hero-stats">
              {[["95K+","Steder"],["6.4K","Events"],["117","Lande"]].map(([num, label]) => (
                <div key={label} className="fd-hero-stat">
                  <p className="fd-hero-stat-num">{num}</p>
                  <p className="fd-hero-stat-label">{label}</p>
                </div>
              ))}
            </div>
            <div className="fd-hero-actions">
              <Link href="/auth" className="fd-btn">Kom i gang gratis →</Link>
              <Link href="/udforsk" className="fd-btn-ghost">Se events →</Link>
            </div>
            <div className="fd-hero-email">
              <span className="fd-hero-email-hint">📨 Få ugentlige event-tips direkte i din indbakke</span>
              <EmailCaptureInline />
            </div>
          </div>
        </section>
      )}

      {/* ── MAIN GRID ── */}
      <div className="fd-grid">
        <div className="fd-main">
          {isAnonymous && tagSections.length === 0 ? (
            <>
              {filteredDemoSections.length === 0 && activeSearch ? (
                <div className="fd-empty-search">
                  <Search size={32} />
                  <p>Ingen events fundet for "{activeSearch}"</p>
                </div>
              ) : filteredDemoSections.map(section => (
                <div key={section.tag} className="fd-section fd-fade-up">
                  <div className="fd-section-header">
                    <h2 className="fd-section-title">{section.emoji}&nbsp;&nbsp;{section.label}</h2>
                    <Link href="/udforsk" className="fd-section-link">
                      <span>{t('feed.see_all')}</span> <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div className="fd-events-row">
                    {section.events.map(event => (
                      <Link key={event.id} href={`/event/${event.id}`} className="fd-event-card">
                        <div className="fd-event-card-img-wrap">
                          <img src={getEventImage(event)} alt={event.title} className="fd-event-card-img" loading="lazy" onError={(e) => { const target = e.target as HTMLImageElement; target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop"; }} />
                          <div className="fd-event-card-gradient" />
                        </div>
                        <div className="fd-event-card-body">
                          <p className="fd-event-card-date">{formatDanishDate(event.date)}</p>
                          <h3 className="fd-event-card-name">{event.title}</h3>
                          <div className="fd-event-card-tags">
                            {event.interest_tags && event.interest_tags.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="fd-event-tag">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <div className="fd-floating-cta">
                <Link href="/auth" className="fd-floating-cta-btn">{t('feed.demo_cta_banner')}</Link>
              </div>
            </>
          ) : !isAnonymous && tagSections.length === 0 ? (
            <div className="fd-empty fd-fade-up">
              <div className="fd-empty-icon"><Compass size={28} /></div>
              <h2 className="fd-empty-h2">{t('feed.get_started')}</h2>
              <p className="fd-empty-p">
                {selectedTags.length === 0 ? t('feed.select_interests') : t('feed.no_events_for_tags')}
              </p>
              <div className="fd-empty-actions">
                <button onClick={() => setTagEditorOpen(true)} className="fd-btn">
                  {selectedTags.length === 0 ? t('feed.select_interests_btn') : t('feed.edit_tags')}
                </button>
                <Link href="/udforsk" className="fd-btn-ghost">{t('feed.explore_all_events')}</Link>
              </div>
            </div>
          ) : (
            filteredTagSections.length === 0 && activeSearch ? (
              <div className="fd-empty-search">
                <Search size={32} />
                <p>Ingen events fundet for "{activeSearch}"</p>
              </div>
            ) : filteredTagSections.map(section => (
              <div key={section.tag} className="fd-section fd-fade-up">
                <div className="fd-section-header">
                  <h2 className="fd-section-title">{section.emoji}&nbsp;&nbsp;{section.label}</h2>
                  <Link href="/udforsk" className="fd-section-link">
                    <span>{t('feed.see_all')}</span> <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="fd-events-row">
                  {section.events.map(event => (
                    <Link key={event.id} href={`/event/${event.id}`} className="fd-event-card">
                      <div className="fd-event-card-img-wrap">
                        <img src={getEventImage(event)} alt={event.title} className="fd-event-card-img" loading="lazy" onError={(e) => { const target = e.target as HTMLImageElement; target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop"; }} />
                        <div className="fd-event-card-gradient" />
                      </div>
                      <div className="fd-event-card-body">
                        <p className="fd-event-card-date">{formatDanishDate(event.date)}</p>
                        <h3 className="fd-event-card-name">{event.title}</h3>
                        <div className="fd-event-card-tags">
                          {event.interest_tags && event.interest_tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="fd-event-tag">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="fd-sidebar">
          <div className="fd-sidebar-card fd-fade-up fd-d3">
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

          <div className="fd-sidebar-card fd-fade-up fd-d4">
            <h3 className="fd-sidebar-card-title">{t('feed.popular_tags')}</h3>
            <div className="fd-trending-tags">
              {trendingTags.map(({ tag, count }) => {
                const node = getTagNode(tag);
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (isActive) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    className={`fd-trending-tag ${isActive ? "active" : ""}`}
                  >
                    {node?.emoji || "🏷️"} #{node?.label || tag}
                    <span className="fd-trending-count">{count}</span>
                  </button>
                );
              })}
            </div>
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
   ────────────────────────────────────────────── */
const feedCSS = `
${pageBase("fd")}

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

/* ── Action bar (search + filter) ── */
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
.fd-search-wrap {
  position: relative; display: none;
}
@media (min-width: 640px) { .fd-search-wrap { display: block; } }
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
  padding: 0 4px; margin-bottom: 16px;
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

/* ── Tag trigger ── */
.fd-tag-trigger { margin-bottom: 28px; padding: 0 4px; }
.fd-tag-trigger-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 10px 22px; border-radius: 100px;
  background: var(--teal-dim); border: 1px solid rgba(78,205,196,0.15);
  cursor: pointer; transition: all 0.25s; font-family: var(--sans);
  color: var(--teal); font-size: 13px; font-weight: 500;
}
.fd-tag-trigger-btn:hover { background: rgba(78,205,196,0.2); border-color: rgba(78,205,196,0.3); }
.fd-tag-trigger-icon {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(78,205,196,0.15); display: flex;
  align-items: center; justify-content: center;
}

/* ── Hero (anonymous) ── */
.fd-hero {
  position: relative; border-radius: 20px; overflow: hidden;
  margin-bottom: 36px; border: 1px solid var(--glass-border);
}
.fd-hero-bg {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  transform: scale(1.05); transition: transform 8s ease;
}
.fd-hero:hover .fd-hero-bg { transform: scale(1.1); }
.fd-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(6,10,15,0.2) 0%, rgba(6,10,15,0.75) 50%, rgba(6,10,15,0.98) 100%);
}
.fd-hero-content { position: relative; z-index: 2; padding: 180px 32px 36px; }
.fd-hero-live {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 16px; border-radius: 100px; margin-bottom: 20px;
  background: rgba(78,205,196,0.08); border: 1px solid rgba(78,205,196,0.12);
  backdrop-filter: blur(8px);
  font-size: 11px; color: var(--teal); font-weight: 600;
  text-transform: uppercase; letter-spacing: 1.5px;
}
.fd-live-dot { position: relative; width: 8px; height: 8px; }
.fd-live-ping {
  position: absolute; inset: 0; border-radius: 50%;
  background: var(--teal); animation: fd-ping 1.5s cubic-bezier(0,0,0.2,1) infinite; opacity: 0.6;
}
.fd-live-core { position: relative; display: block; width: 8px; height: 8px; border-radius: 50%; background: var(--teal); }
@keyframes fd-ping { 75%,100% { transform: scale(2); opacity: 0; } }
.fd-hero-h2 {
  font-family: var(--serif); font-size: clamp(28px, 5vw, 46px);
  font-weight: 400; line-height: 1.05; letter-spacing: -1px; margin-bottom: 14px;
}
.fd-hero-h2 em { font-style: italic; color: var(--teal); }
.fd-hero-p {
  font-size: 15px; color: var(--pg-white-dim); line-height: 1.6;
  max-width: 420px; margin-bottom: 24px;
}
.fd-hero-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
.fd-hero-stat {
  padding: 14px; border-radius: 14px; text-align: center;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(8px); transition: transform 0.3s;
}
.fd-hero-stat:hover { transform: translateY(-2px); }
.fd-hero-stat-num {
  font-family: var(--serif); font-size: 22px; font-weight: 400;
  color: var(--teal); line-height: 1;
}
.fd-hero-stat-label {
  font-size: 10px; color: var(--pg-white-muted); text-transform: uppercase;
  letter-spacing: 1.2px; margin-top: 4px;
}
.fd-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
.fd-hero-email { padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
.fd-hero-email-hint { display: block; font-size: 12px; color: var(--pg-white-muted); margin-bottom: 10px; }

/* ── Main grid ── */
.fd-grid {
  display: grid; grid-template-columns: 1fr; gap: 32px;
}
@media (min-width: 1024px) {
  .fd-grid { grid-template-columns: 1fr 320px; }
}

/* ── Event sections ── */
.fd-section { margin-bottom: 40px; }
.fd-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 18px;
}
.fd-section-title {
  font-family: var(--serif); font-size: 22px; font-weight: 400;
  letter-spacing: -0.3px;
}
.fd-section-link {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; color: var(--teal); text-decoration: none;
  padding: 8px 12px; border-radius: 10px; transition: all 0.2s;
  min-height: 44px;
}
.fd-section-link:hover { background: var(--teal-dim); }

/* ── Event cards ── */
.fd-events-row {
  display: flex; gap: 14px; overflow-x: auto; padding-bottom: 8px;
  scrollbar-width: none;
}
.fd-events-row::-webkit-scrollbar { display: none; }
.fd-event-card {
  flex: 0 0 210px; border-radius: 16px; overflow: hidden;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  cursor: pointer; text-decoration: none; color: var(--pg-white);
  transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
}
.fd-event-card:hover {
  transform: translateY(-6px);
  border-color: rgba(78,205,196,0.25);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}
.fd-event-card-img-wrap { position: relative; overflow: hidden; }
.fd-event-card-img {
  width: 100%; height: 140px; object-fit: cover;
  transition: transform 0.6s ease;
}
.fd-event-card:hover .fd-event-card-img { transform: scale(1.08); }
.fd-event-card-gradient {
  position: absolute; bottom: 0; left: 0; right: 0; height: 40px;
  background: linear-gradient(to top, rgba(6,10,15,0.8), transparent);
}
.fd-event-card-body { padding: 14px 16px 16px; }
.fd-event-card-date {
  font-size: 11px; color: var(--teal); text-transform: uppercase;
  letter-spacing: 1px; font-weight: 500; margin-bottom: 6px;
}
.fd-event-card-name {
  font-size: 14px; font-weight: 600; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.fd-event-card-tags { display: flex; gap: 5px; margin-top: 10px; flex-wrap: wrap; }
.fd-event-tag {
  font-size: 11px; padding: 3px 9px; border-radius: 100px;
  background: rgba(255,255,255,0.06); color: var(--pg-white-muted);
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
.fd-empty-search {
  text-align: center; padding: 48px 24px; color: var(--pg-white-muted);
}
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
  box-shadow: 0 8px 32px rgba(78,205,196,0.3);
  transition: all 0.3s;
}
.fd-floating-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(78,205,196,0.4);
}

/* ── Sidebar ── */
.fd-sidebar { display: flex; flex-direction: column; gap: 20px; }
.fd-sidebar-card {
  padding: 20px; border-radius: 18px;
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

/* ── Trending tags ── */
.fd-trending-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.fd-trending-tag {
  font-size: 12px; padding: 7px 14px; border-radius: 100px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  color: var(--pg-white-dim); cursor: pointer; transition: all 0.25s;
  font-family: var(--sans);
}
.fd-trending-tag:hover { background: var(--glass-bg-hover); border-color: var(--glass-border-hover); }
.fd-trending-tag.active {
  background: var(--teal); color: var(--bg); border-color: var(--teal);
  font-weight: 600; box-shadow: 0 4px 16px rgba(78,205,196,0.25);
}
.fd-trending-count {
  margin-left: 4px; opacity: 0.5; font-size: 10px;
}
.fd-trending-tag.active .fd-trending-count { opacity: 0.6; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .fd-hero-content { padding: 120px 20px 28px; }
  .fd-hero-h2 { font-size: 26px; }
  .fd-hero-stats { gap: 6px; }
  .fd-event-card { flex: 0 0 175px; }
  .fd-event-card-img { height: 110px; }
}
`;
