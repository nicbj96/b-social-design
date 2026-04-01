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


function getPersonalizedGreeting(name: string | null | undefined, isAnonymous: boolean, t: (key: string) => string): string {
  if (isAnonymous) return t('greeting.welcome');
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? t('greeting.morning') : hour < 17 ? t('greeting.afternoon') : t('greeting.evening');
  // Use full name — never truncate
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

  // Debounced search: 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000, // 5 min — news feed is fine with global default
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

  // Use profile name, falling back to user metadata full_name, then email prefix
  const displayName = profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || null;
  const isAnonymous = !profile && !user;
  const greeting = getPersonalizedGreeting(displayName, isAnonymous, t);

  // Build tag-based feed sections using tagEngine (only upcoming events)
  const tagSections = useMemo(() => {
    if (events.length === 0 || selectedTags.length === 0) return [];
    const now = new Date().toISOString();
    const upcomingEvents = events.filter(e => e.date >= now);
    if (upcomingEvents.length === 0) return [];
    const sections = buildTagFeed(upcomingEvents, selectedTags);
    // Sort events within each section by relevance score
    return sections.map(section => ({
      ...section,
      events: [...section.events].sort((a, b) => scoreEvent(b, selectedTags) - scoreEvent(a, selectedTags)),
    }));
  }, [events, selectedTags]);

  // Trending tags from real event data
  const trendingTags = useMemo(() => {
    return getTrendingTags(events, 12);
  }, [events]);

  // Demo sections for anonymous users — group all events by category
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

    // "Internationale events" section: events from non-DK countries
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

  // Search filtering: filter demoSections or tagSections by activeSearch query
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

  // Subtitle line
  const subtitle = profile
    ? `${city || profile.city || t('feed.denmark')} \u00B7 ${selectedTags.length} ${t('feed.tags_selected')}`
    : isAnonymous
    ? t('feed.demo_subtitle')
    : t('feed.subtitle');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060a0f] flex items-center justify-center">
        <p className="text-white/50">{t('feed.loading_events')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl truncate" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, letterSpacing: "-0.5px" }}>{greeting}</h1>
            <p className="text-white/50 mt-1 text-sm truncate">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <button
              onClick={() => setTagEditorOpen(true)}
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Rediger tags"
            >
              <SlidersHorizontal size={18} className="text-white/60" />
            </button>
            {/* Hide search on mobile, show on sm+ */}
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setActiveSearch(searchQuery.trim());
                  if (e.key === "Escape") { setSearchQuery(""); setActiveSearch(""); }
                }}
                placeholder="Søg events, steder..."
                className="bg-white/10 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setActiveSearch(""); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Ryd søgning"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <Link href="/notifikationer" className="relative p-3 rounded-lg bg-white/5 hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Bell size={18} className="text-white/60" />
              {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />}
            </Link>
          </div>
        </div>

        {/* Search results banner */}
        {activeSearch && (
          <div className="flex items-center justify-between mb-4 px-1 py-2.5 bg-white/5 rounded-xl border border-white/10">
            <span className="text-sm text-white/70">
              <span className="text-white font-medium">{searchResultCount}</span> {searchResultCount === 1 ? "resultat" : "resultater"} for{" "}
              <span className="text-[#4ECDC4] font-medium">&ldquo;{activeSearch}&rdquo;</span>
            </span>
            <button
              onClick={() => { setSearchQuery(""); setActiveSearch(""); }}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            >
              <X size={12} />
              Ryd
            </button>
          </div>
        )}

        {/* Active tags filter bar */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 px-1">
            <span className="text-xs text-white/40">Aktive tags:</span>
            {selectedTags.map(tag => {
              const node = getTagNode(tag);
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                  className="flex items-center gap-1 text-xs bg-[#4ECDC4]/20 text-[#4ECDC4] px-2.5 py-1 rounded-full hover:bg-[#4ECDC4]/30 transition-colors"
                >
                  {node?.emoji || "🏷️"} {node?.label || tag}
                  <span className="ml-0.5 text-[10px]">✕</span>
                </button>
              );
            })}
            <button
              onClick={() => setSelectedTags([])}
              className="text-[10px] text-white/30 hover:text-white/60 ml-1 transition-colors"
            >
              Ryd alle
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-8 px-1">
          <button
            onClick={() => setTagEditorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 hover:bg-[#4ECDC4]/20 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center">
              <SlidersHorizontal size={14} className="text-[#4ECDC4]" />
            </div>
            <span className="text-sm text-[#4ECDC4] font-medium">
              {selectedTags.length > 0 ? t('feed.edit_tags') : t('feed.select_interests_btn')}
            </span>
          </button>
        </div>

        {/* Hero for anonymous users — premium serif style */}
        {isAnonymous && tagSections.length === 0 && (
          <div className="relative mb-10 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Hero background image */}
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,10,15,0.3) 0%, rgba(6,10,15,0.85) 60%, rgba(6,10,15,0.98) 100%)" }} />

            <div className="relative px-6 md:px-10 pt-32 pb-10">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5" style={{ background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.15)", backdropFilter: "blur(8px)" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ECDC4] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ECDC4]" />
                </span>
                <span className="text-[11px] text-[#4ECDC4] font-semibold tracking-[1px] uppercase">Live i dag</span>
              </div>

              <h2 className="text-[32px] md:text-[42px] leading-[1.1] mb-3" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, letterSpacing: "-0.8px" }}>Find din næste<br/><em className="text-[#4ECDC4]" style={{ fontStyle: "italic" }}>store oplevelse</em></h2>
              <p className="text-white/50 text-[15px] leading-relaxed mb-7 max-w-md">
                Events, steder og aktiviteter overalt i verden — alt samlet ét sted. Fra Nyhavn til nordlyset.
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-7">
                {[["95K+","Steder"],["6.4K","Events"],["117","Lande"]].map(([num, label]) => (
                  <div key={label} className="rounded-xl px-3 py-3 text-center transition-all hover:translate-y-[-2px]" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}>
                    <p className="text-xl font-bold" style={{ fontFamily: "'Instrument Serif', Georgia, serif", background: "linear-gradient(135deg, #4ECDC4, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{num}</p>
                    <p className="text-[10px] text-white/35 mt-0.5 font-medium uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth" className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[#060a0f] text-sm font-bold transition-all min-h-[44px] hover:translate-y-[-1px]" style={{ background: "linear-gradient(135deg, #4ECDC4, #93c5fd)", boxShadow: "0 6px 24px rgba(78,205,196,0.25)" }}>
                  Kom i gang gratis →
                </Link>
                <Link href="/udforsk" className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white/70 text-sm font-medium hover:border-[#4ECDC4]/30 hover:text-[#4ECDC4] transition-all min-h-[44px]" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                  Se events →
                </Link>
              </div>

              {/* Email capture */}
              <div className="mt-6 pt-5 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-white/30">📨 Få ugentlige event-tips direkte i din indbakke</span>
                </div>
                <EmailCaptureInline />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            {isAnonymous && tagSections.length === 0 ? (
              // ── DEMO FEED for anonymous users ──────────────────────────
              <>

                {/* Event rows by category */}
                {filteredDemoSections.length === 0 && activeSearch ? (
                  <div className="text-center py-12 text-white/40">
                    <Search size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Ingen events fundet for &ldquo;{activeSearch}&rdquo;</p>
                  </div>
                ) : filteredDemoSections.map(section => (
                  <div key={section.tag} className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, letterSpacing: "-0.3px" }}>
                        {section.emoji}&nbsp;&nbsp;{section.label}
                      </h2>
                      <Link href="/udforsk" className="text-sm text-[#4ECDC4] hover:underline flex items-center gap-1 py-2 px-3 min-h-[44px]">
                        <span>{t('feed.see_all')}</span> <ChevronRight size={14} />
                      </Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {section.events.map(event => (
                        <Link key={event.id} href={`/event/${event.id}`} className="glass-card rounded-xl overflow-hidden hover:ring-1 hover:ring-[#4ECDC4]/30 transition-all group min-w-[180px] max-w-[220px] flex-shrink-0">
                          <img src={getEventImage(event)} alt={event.title} className="w-full h-28 object-cover" loading="lazy" onError={(e) => { const target = e.target as HTMLImageElement; target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop"; }} />
                          <div className="p-3">
                            <p className="text-xs text-white/40 mb-1">{formatDanishDate(event.date)}</p>
                            <h3 className="text-sm font-semibold leading-snug line-clamp-2">{event.title}</h3>
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {event.interest_tags && event.interest_tags.slice(0, 2).map((tag: string) => (
                                <span key={tag} className="text-xs bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full">#{tag}</span>
                              ))}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Floating CTA banner */}
                <div className="sticky bottom-6 flex justify-center mt-6 pointer-events-none">
                  <Link
                    href="/auth"
                    className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#4ECDC4] text-[#0a0f1a] text-sm font-semibold shadow-lg shadow-[#4ECDC4]/20 hover:bg-[#3dbdb5] transition-all"
                  >
                    {t('feed.demo_cta_banner')}
                  </Link>
                </div>
              </>
            ) : !isAnonymous && tagSections.length === 0 ? (
              // ── EMPTY STATE for logged-in users with no tags ────────────
              <div className="text-center py-16 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#4ECDC4]/10 flex items-center justify-center mx-auto mb-5">
                  <Compass size={28} className="text-[#4ECDC4]" />
                </div>
                <h2 className="text-lg font-bold text-white/80 mb-2">{t('feed.get_started')}</h2>
                <p className="text-white/40 text-sm mb-6">
                  {selectedTags.length === 0
                    ? t('feed.select_interests')
                    : t('feed.no_events_for_tags')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setTagEditorOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-sm font-semibold hover:bg-[#3dbdb5] transition-all"
                  >
                    {selectedTags.length === 0 ? t('feed.select_interests_btn') : t('feed.edit_tags')}
                  </button>
                  <Link
                    href="/udforsk"
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition-all"
                  >
                    {t('feed.explore_all_events')}
                  </Link>
                </div>
              </div>
            ) : (
              // ── PERSONALIZED FEED for logged-in users with tags ─────────
              filteredTagSections.length === 0 && activeSearch ? (
                <div className="text-center py-12 text-white/40">
                  <Search size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Ingen events fundet for &ldquo;{activeSearch}&rdquo;</p>
                </div>
              ) : filteredTagSections.map(section => (
                <div key={section.tag} className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                      {section.emoji}&nbsp;&nbsp;{section.label}
                    </h2>
                    <Link href="/udforsk" className="text-sm text-[#4ECDC4] hover:underline flex items-center gap-1 py-2 px-3 min-h-[44px]">
                      <span>{t('feed.see_all')}</span> <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {section.events.map(event => (
                      <Link key={event.id} href={`/event/${event.id}`} className="glass-card rounded-xl overflow-hidden hover:ring-1 hover:ring-[#4ECDC4]/30 transition-all group min-w-[180px] max-w-[220px] flex-shrink-0">
                        <img src={getEventImage(event)} alt={event.title} className="w-full h-28 object-cover" loading="lazy" onError={(e) => { const target = e.target as HTMLImageElement; target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop"; }} />
                        <div className="p-3">
                          <p className="text-xs text-white/40 mb-1">{formatDanishDate(event.date)}</p>
                          <h3 className="text-sm font-semibold leading-snug line-clamp-2">{event.title}</h3>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {event.interest_tags && event.interest_tags.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="text-xs bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full">#{tag}</span>
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

          <aside className="space-y-6">
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                {t('feed.news_for_you')}
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">LIVE</span>
              </h3>
              {newsLoading ? (
                <div className="flex items-center gap-2 text-white/40 text-sm py-4">
                  <Loader2 size={14} className="animate-spin" />
                  {t('feed.fetching_news')}
                </div>
              ) : relevantNews.length > 0 ? (
                <div className="space-y-3">
                  {relevantNews.map((news, i) => (
                    <a key={i} href={news.link} target="_blank" rel="noopener noreferrer" className="flex gap-3 group hover:bg-white/5 rounded-lg p-1.5 -mx-1.5 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/30 mb-0.5">
                          {news.sourceEmoji} {news.source} &bull; {formatNewsTime(news.pubDate)}
                        </p>
                        <p className="text-xs font-medium text-white/80 line-clamp-2 group-hover:text-white transition-colors">{news.title}</p>
                      </div>
                      <ExternalLink size={12} className="text-white/20 group-hover:text-white/50 mt-1 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-xs py-4">{t('feed.no_news')}</p>
              )}
            </div>

            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3">{t('feed.popular_tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map(({ tag, count }) => {
                  const node = getTagNode(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        const isActive = selectedTags.includes(tag);
                        if (isActive) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-[#4ECDC4] text-[#0a0f1a] font-semibold shadow-lg shadow-[#4ECDC4]/20"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {node?.emoji || "🏷️"} #{node?.label || tag}
                      <span className={`ml-1 ${selectedTags.includes(tag) ? "text-[#0a0f1a]/50" : "text-white/25"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <FeedTagEditor open={tagEditorOpen} onClose={() => setTagEditorOpen(false)} />
    </div>
  );
}
