import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "wouter";
import { Search, MapPin, ChevronRight, X, Users, Heart, TrendingUp, Star, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@/lib/data";
import { getEvents } from "@/lib/data";
import { fetchPlacesWithLimit, type Place } from "@/lib/supabase";
import { getCategoryEmoji, getEventImage, formatDanishDate } from "@/lib/eventHelpers";
import { useTags } from "@/context/TagContext";
import { searchTags, getParentCategories, TAG_TREE } from "@/lib/tagTree";
import { OPLEVELSER_NAER_DIG } from "@/data/feedData";
import type { SocialActivity } from "@/data/feedData";
import { ALL_PINS } from "@/data/kortPins";
import { ALL_CATEGORIES } from "@/data/categories";
import type { Category } from "@/data/categories";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ─────────────────────────────────────────────
   B-Social Udforsk — Premium Redesign
   Scoped CSS prefix: ud-
   ───────────────────────────────────────────── */

const REGIONS: Record<string, { flag: string; label: string }> = {
  'DK': { flag: '🇩🇰', label: 'Danmark' },
  'SE': { flag: '🇸🇪', label: 'Sverige' },
  'NO': { flag: '🇳🇴', label: 'Norge' },
  'DE': { flag: '🇩🇪', label: 'Tyskland' },
  'NL': { flag: '🇳🇱', label: 'Holland' },
  'GB': { flag: '🇬🇧', label: 'UK' },
  'FR': { flag: '🇫🇷', label: 'Frankrig' },
  'ES': { flag: '🇪🇸', label: 'Spanien' },
  'IT': { flag: '🇮🇹', label: 'Italien' },
  'EUROPE': { flag: '🌍', label: 'Europa' },
  'ALL': { flag: '🌎', label: 'Hele verden' },
};

const EUROPE_CODES = [
  'DK','SE','NO','DE','NL','BE','AT','CH','ES','FR','IT','GB','IE','PL','CZ','FI',
  'PT','GR','HU','RO','HR','SK','SI','LT','LV','EE','BG','RS','UA','BY',
  'LU','MT','CY','LI','IS','AL','MK','BA','ME','MD','AM','GE','AZ',
];

const COUNTRY_CHIP_ORDER = ['DK', 'SE', 'NO', 'DE', 'NL', 'GB', 'FR', 'ES', 'IT', 'EUROPE', 'ALL'] as const;

const BRUGERE = [
  { name: "Anna", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&auto=format&fit=crop&crop=face" },
  { name: "Mads", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&crop=face" },
  { name: "Sofie", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&crop=face" },
  { name: "Jonas", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&crop=face" },
  { name: "Emil", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&crop=face" },
  { name: "Lise", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&crop=face" },
  { name: "Peter", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&crop=face" },
];

const PLACE_CATEGORY_IMAGES: Record<string, string> = {
  natur: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
  aktiv_sport: "https://images.unsplash.com/photo-1461896836934-bd45ba3ff2b3?w=400",
  mad_hangout: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
  sport: "https://images.unsplash.com/photo-1461896836934-bd45ba3ff2b3?w=400",
  kultur: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400",
  musik: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400",
};

const DB_FILTERS: { key: string | null; label: string; emoji: string }[] = [
  { key: null, label: "Alle", emoji: "✨" },
  { key: "natur", label: "Natur", emoji: "🌿" },
  { key: "strand", label: "Strand", emoji: "🏖️" },
  { key: "hundeskov", label: "Hundeskov", emoji: "🐕" },
  { key: "sport", label: "Sport", emoji: "🏃" },
  { key: "kultur", label: "Kultur", emoji: "🎭" },
  { key: "mad", label: "Mad", emoji: "🍽️" },
];

const PLACE_CAT_EMOJI: Record<string, string> = {
  natur: "🌿", aktiv_sport: "🏃", mad_hangout: "🍽️", sport: "⚽", kultur: "🎭", musik: "🎵",
  strand: "🏖️", badning: "🏊", hundeskov: "🐕", hund: "🐕", shelter: "⛺", fiskeri: "🎣",
  loeb: "🏃", mtb: "🚵", vandring: "🥾", mad: "🍽️", fitness: "💪", outdoor: "🌲",
};

/* ── Sub-components ── */

function PopularCard({ event }: { event: Event }) {
  const { t } = useTranslation();
  const isGratis = !event.price || event.price === 0;
  return (
    <Link href={`/event/${event.id}`} className="ud-pop-card">
      <div className="ud-pop-card-img-wrap">
        <img src={getEventImage(event)} alt={event.title} className="ud-pop-card-img" loading="lazy" />
        <div className="ud-pop-card-gradient" />
        <span className={`ud-pop-card-price ${isGratis ? "free" : ""}`}>
          {isGratis ? t('events.free') : `${event.price} kr`}
        </span>
      </div>
      <div className="ud-pop-card-body">
        <h3 className="ud-pop-card-name">{event.title}</h3>
        <p className="ud-pop-card-cat">{getCategoryEmoji(event.category || "")} {event.category}</p>
      </div>
    </Link>
  );
}

function CalendarListCard({ event }: { event: Event }) {
  const { t } = useTranslation();
  const isGratis = !event.price || event.price === 0;
  return (
    <Link href={`/event/${event.id}`} className="ud-cal-card">
      <div className="ud-cal-card-img-wrap">
        <img src={getEventImage(event)} alt={event.title} className="ud-cal-card-img" loading="lazy" />
      </div>
      <div className="ud-cal-card-body">
        <div className="ud-cal-card-meta">
          <span className="ud-cal-card-cat">{getCategoryEmoji(event.category || "")} {event.category}</span>
          <span className={`ud-cal-card-price ${isGratis ? "free" : ""}`}>
            {isGratis ? t('events.free') : `${event.price} kr`}
          </span>
        </div>
        <h3 className="ud-cal-card-name">{event.title}</h3>
        <div className="ud-cal-card-info">
          <span>{formatDanishDate(event.date)}</span>
          {event.location && (
            <span className="ud-cal-card-loc"><MapPin size={9} />{event.location.split(",")[0]}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function TrendingCard({ activity }: { activity: SocialActivity }) {
  const { t } = useTranslation();
  return (
    <Link href={`/social/${activity.id}`} className="ud-trend-card">
      <div className="ud-trend-card-icon">{activity.emoji}</div>
      <div className="ud-trend-card-body">
        <h3 className="ud-trend-card-name">{activity.title}</h3>
        <div className="ud-trend-card-meta">
          <span><MapPin size={8} />{activity.location}</span>
          <span><Users size={8} />{activity.spots.current}/{activity.spots.total}</span>
        </div>
      </div>
      <span className="ud-trend-card-badge">{t('events.free')}</span>
    </Link>
  );
}

function SupabasePlacesSection({ activeCountry }: { activeCountry: string }) {
  const { t } = useTranslation();
  const [dbFilter, setDbFilter] = useState<string | null>(null);
  const { data: places, isLoading } = useQuery<Place[]>({
    queryKey: ["supabase-places-50"],
    queryFn: () => fetchPlacesWithLimit(50),
    staleTime: 30 * 60 * 1000,
  });

  const filteredPlaces = useMemo(() => {
    if (!places) return [];
    let countryFiltered = places;
    if (activeCountry === 'ALL') {
      countryFiltered = places;
    } else if (activeCountry === 'EUROPE') {
      countryFiltered = places.filter(p => !p.country || EUROPE_CODES.includes(p.country));
    } else {
      countryFiltered = places.filter(p => !p.country || p.country === activeCountry);
    }
    if (!dbFilter) return countryFiltered;
    return countryFiltered.filter(p => {
      const cats = (p.main_categories || []).map(c => c.toLowerCase());
      const tags = (p.tags || []).map(tag => tag.toLowerCase());
      const all = [...cats, ...tags];
      return all.some(item => item.includes(dbFilter));
    });
  }, [places, dbFilter, activeCountry]);

  if (isLoading) return (
    <section className="ud-places-section">
      <div className="ud-section-head">
        <span>📍</span>
        <h2>{t('udforsk.places_in_area')}</h2>
      </div>
      <div className="ud-places-loading">
        <Loader2 size={14} className="animate-spin" /> {t('udforsk.fetching_places')}
      </div>
    </section>
  );

  if (!places || places.length === 0) return null;

  return (
    <section className="ud-places-section">
      <div className="ud-section-head">
        <div className="ud-section-head-left">
          <span>📍</span>
          <h2>{t('udforsk.places_in_area')}</h2>
          <span className="ud-section-count">{places.length}</span>
        </div>
        <Link href="/kort" className="ud-section-link">
          {t('nav.kort')} <ChevronRight size={12} />
        </Link>
      </div>
      <div className="ud-filter-row">
        {DB_FILTERS.map((f) => (
          <button
            key={f.key || "alle"}
            onClick={() => setDbFilter(f.key)}
            className={`ud-chip ${dbFilter === f.key ? "active" : ""}`}
            data-testid={`db-filter-${f.key || "alle"}`}
          >
            <span>{f.emoji}</span> {f.label}
          </button>
        ))}
      </div>
      <div className="ud-places-grid">
        {filteredPlaces.slice(0, 20).map(p => {
          const mainCat = p.main_categories?.[0] || "natur";
          const emoji = PLACE_CAT_EMOJI[mainCat] || "📍";
          return (
            <Link key={p.id} href={`/sted/${p.id}`} className="ud-place-card" data-testid={`db-place-${p.id}`}>
              <div className="ud-place-card-icon">{emoji}</div>
              <h3 className="ud-place-card-name">{p.name}</h3>
              <div className="ud-place-card-meta">
                <div className="ud-place-card-rating">
                  <Star size={10} className="ud-star" />
                  <span>{p.rating_avg?.toFixed(1) || "–"}</span>
                </div>
                <span className="ud-place-card-sep">·</span>
                <span className="ud-place-card-city">{p.city}</span>
              </div>
            </Link>
          );
        })}
      </div>
      {filteredPlaces.length === 0 && (
        <div className="ud-empty-places">
          <span>{t('udforsk.no_places_category')}</span>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════ MAIN ═══════════════════ */
export default function Udforsk() {
  const { t } = useTranslation();
  const { selectedTags } = useTags();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string>('EUROPE');
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useFadeUp("ud");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: events } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: () => Promise.resolve(getEvents()),
    staleTime: 2 * 60 * 1000,
  });

  const allEvents = events || [];

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    let expandedTerms: string[] = q ? [q] : [];
    if (q) {
      const tagResults = searchTags(q);
      expandedTerms = [q, ...tagResults.map(tr => tr.tag.toLowerCase()), ...tagResults.map(tr => tr.label.toLowerCase())];
    }

    return allEvents.filter((e) => {
      const matchSearch = !q ||
        expandedTerms.some(term =>
          (e.title || "").toLowerCase().includes(term) ||
          (e.description || "").toLowerCase().includes(term) ||
          (e.location || "").toLowerCase().includes(term) ||
          (e.interest_tags || []).some(tag => tag.toLowerCase().includes(term)) ||
          (e.category || "").toLowerCase().includes(term)
        );
      const matchCat = !activeCategory ||
        (e.interest_tags || []).some(tag => tag.toLowerCase().includes(activeCategory)) ||
        (e.category || "").toLowerCase().includes(activeCategory);
      const matchUserTags = selectedTags.length === 0 || !activeCategory ||
        selectedTags.some(t => (e.interest_tags || []).some(tag => tag.toLowerCase().includes(t.toLowerCase())));
      let matchCountry = true;
      if (activeCountry === 'ALL') {
        matchCountry = true;
      } else if (activeCountry === 'EUROPE') {
        matchCountry = !e.country || EUROPE_CODES.includes(e.country);
      } else {
        matchCountry = !e.country || e.country === activeCountry;
      }
      return matchSearch && matchCat && matchCountry && matchUserTags;
    });
  }, [allEvents, debouncedSearch, activeCategory, activeCountry, selectedTags]);

  const popular = [...filtered].sort((a, b) => (b.max_participants || 0) - (a.max_participants || 0)).slice(0, 10);
  const comingSoon = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 6);
  const trendingSocial = OPLEVELSER_NAER_DIG.slice(0, 4);

  function pickTag(tag: string) {
    setActiveCategory(tag);
    setSearch("");
    setSearchFocused(false);
    searchRef.current?.blur();
  }

  return (
    <div ref={containerRef} className="ud-root" data-testid="udforsk-page">
      <style>{udforskCSS}</style>

      {/* ── COVER HERO ── */}
      <div className="ud-cover">
        <img src="/udforsk-hero.png" alt="" />
        <div className="ud-cover-overlay" />
      </div>

      {/* ── IDENTITY ── */}
      <div className="ud-identity ud-fade-up">
        <div className="ud-avatar">🧭</div>
        <h1 className="ud-identity-title">Udforsk <em>Danmark</em></h1>
        <p className="ud-identity-sub">{t('udforsk.subtitle')}</p>
      </div>

      {/* ── STATS ── */}
      <div className="ud-stats ud-fade-up ud-d1">
        <div className="ud-stat-card">
          <div className="ud-stat-val">97K+</div>
          <div className="ud-stat-lbl">Steder</div>
        </div>
        <div className="ud-stat-card">
          <div className="ud-stat-val">{allEvents.length}</div>
          <div className="ud-stat-lbl">Events</div>
        </div>
        <div className="ud-stat-card">
          <div className="ud-stat-val">{Object.keys(REGIONS).length - 1}</div>
          <div className="ud-stat-lbl">Lande</div>
        </div>
      </div>

      {/* ── SEARCH ── */}
      <div className="ud-search-wrap-outer ud-fade-up ud-d2">
        <div className="ud-search-bar">
          <Search size={16} className="ud-search-icon" />
          <input
            ref={searchRef}
            type="search"
            placeholder={t('udforsk.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            className="ud-search-input"
            data-testid="input-search"
          />
          {(search || searchFocused) && (
            <button onClick={() => { setSearch(""); setSearchFocused(false); setActiveCategory(null); searchRef.current?.blur(); }} className="ud-search-clear">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ═══ SEARCH OVERLAY ═══ */}
      {searchFocused && !search && (
        <div className="ud-search-overlay">
          <p className="ud-label">{t('udforsk.what_catches_you')}</p>
          <div className="ud-tag-suggestions">
            {getParentCategories().map((dt) => (
              <button key={dt.tag} onClick={() => pickTag(dt.tag)} className="ud-chip">
                <span>{dt.emoji}</span> {dt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SEARCH RESULTS ═══ */}
      {search && (
        <div className="ud-search-results">
          {/* Kategorier */}
          {(() => {
            const results = searchTags(search);
            if (results.length === 0) return null;
            return (
              <div className="ud-result-group">
                <p className="ud-label">{t('udforsk.categories')}</p>
                <div className="ud-tag-suggestions">
                  {results.slice(0, 6).map((tr) => {
                    const isParentCat = TAG_TREE.some(p => p.tag === tr.tag);
                    return (
                      <button key={tr.tag} onClick={() => pickTag(tr.tag)}
                        className={`ud-chip ${isParentCat ? "highlighted" : ""}`}>
                        <span>{tr.emoji}</span> {tr.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Events */}
          {filtered.length > 0 && (
            <div className="ud-result-group">
              <p className="ud-label">{t('udforsk.search_events')}</p>
              <div className="ud-result-list">
                {filtered.slice(0, 3).map(e => <CalendarListCard key={e.id} event={e} />)}
              </div>
              {filtered.length > 3 && (
                <button className="ud-see-more">{t('events.see_all_events', {count: filtered.length})}</button>
              )}
            </div>
          )}

          {/* Steder */}
          {(() => {
            const q = search.toLowerCase();
            const tagResults = searchTags(q);
            const expandedPlaceTerms = [q, ...tagResults.map(tr => tr.tag.toLowerCase()), ...tagResults.map(tr => tr.label.toLowerCase())];
            const matchedPlaces = ALL_PINS.filter(p => expandedPlaceTerms.some(term => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term) || (p.tags && p.tags.some(tag => tag.toLowerCase().includes(term))))).slice(0, 3);
            if (matchedPlaces.length === 0) return null;
            const catEmoji: Record<string, string> = { sport: "⚽", kultur: "🎭", natur: "🌿", musik: "🎵", mad: "🍽️", spil: "🎲", events: "🎉", mtb: "🚵", vandring: "🥾", loeb: "🏃", hund: "🐕", fiskeri: "🎣", badning: "🏊", shelter: "⛺", dyrespot: "🦌", kreativt: "🖌️", fitness: "💪", outdoor: "🌲", socialt: "❤️", karriere: "💼", tech: "💻", rejser: "🚆", logi: "🏕️", wellness: "🧘", communities: "👥", ture: "🥾", aktiv: "⚽" };
            return (
              <div className="ud-result-group">
                <p className="ud-label">{t('udforsk.search_places')}</p>
                <div className="ud-result-list">
                  {matchedPlaces.map(p => (
                    <Link key={p.id} href="/kort" className="ud-result-row">
                      <div className="ud-result-row-icon">{catEmoji[p.category] || "📍"}</div>
                      <div className="ud-result-row-text">
                        <span className="ud-result-row-name">{p.name}</span>
                        <span className="ud-result-row-cat">{p.category}</span>
                      </div>
                      <MapPin size={12} className="ud-result-row-pin" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Brugere */}
          {(() => {
            const q = search.toLowerCase();
            const matchedUsers = BRUGERE.filter(b => b.name.toLowerCase().includes(q)).slice(0, 3);
            if (matchedUsers.length === 0) return null;
            return (
              <div className="ud-result-group">
                <p className="ud-label">{t('udforsk.search_users')}</p>
                <div className="ud-result-list">
                  {matchedUsers.map(b => (
                    <div key={b.name} className="ud-result-row">
                      <img src={b.avatar} alt={b.name} className="ud-result-row-avatar" loading="lazy" />
                      <span className="ud-result-row-name">{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {filtered.length === 0 && searchTags(search).length === 0 && (
            <div className="ud-no-results">
              <span>🔍</span>
              <p>{t('udforsk.no_results', {query: search})}</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      {!search && !searchFocused && (
        <div className="ud-content">

          {activeCategory && (
            <div className="ud-active-cat ud-fade-up">
              <span>{getCategoryEmoji(activeCategory)} {t('events.showing', {category: activeCategory})}</span>
              <button onClick={() => setActiveCategory(null)}>{t('events.show_all')}</button>
            </div>
          )}

          {/* Country chips */}
          <section className="ud-fade-up">
            <div className="ud-section-head">
              <span>🌎</span>
              <h2>{t('udforsk.country_filter_label')}</h2>
            </div>
            <div className="ud-chip-scroll">
              {COUNTRY_CHIP_ORDER.map((code) => {
                const region = REGIONS[code];
                if (!region) return null;
                return (
                  <button key={code} onClick={() => setActiveCountry(code)}
                    className={`ud-chip ${activeCountry === code ? "active" : ""}`}
                    data-testid={`country-chip-${code}`}>
                    <span>{region.flag}</span> {region.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Categories */}
          <section className="ud-fade-up ud-d1">
            <div className="ud-section-head">
              <span>🗂️</span>
              <h2>{t('udforsk.categories')}</h2>
            </div>
            <div className="ud-cat-wrap">
              {ALL_CATEGORIES.map((cat) => (
                <button key={cat.key} onClick={() => pickTag(cat.key)}
                  className={`ud-cat-chip ${activeCategory === cat.key ? "active" : ""}`}
                  data-testid={`cat-chip-${cat.key}`}>
                  <span className="ud-cat-chip-emoji">{cat.emoji}</span>
                  <span className="ud-cat-chip-label">{cat.label}</span>
                </button>
              ))}
              <Link href="/kort" className="ud-cat-chip hotel">
                <span className="ud-cat-chip-emoji">🏨</span>
                <span className="ud-cat-chip-label">Hoteller & overnatning</span>
              </Link>
            </div>
          </section>

          {/* Database places */}
          <div className="ud-fade-up ud-d2">
            <SupabasePlacesSection activeCountry={activeCountry} />
          </div>

          {/* Trending */}
          <section className="ud-fade-up ud-d2">
            <div className="ud-section-head">
              <TrendingUp size={14} className="ud-teal-icon" />
              <h2>{t('udforsk.trending_nearby')}</h2>
            </div>
            <div className="ud-trend-list">
              {trendingSocial.map((s) => <TrendingCard key={s.id} activity={s} />)}
            </div>
          </section>

          {/* Popular */}
          {popular.length > 0 && (
            <section className="ud-fade-up ud-d3">
              <div className="ud-section-head">
                <div className="ud-section-head-left">
                  <span>🔥</span>
                  <h2>{t('events.popular_experiences')}</h2>
                </div>
                <span className="ud-section-link">{t('events.see_all')} <ChevronRight size={12} /></span>
              </div>
              <div className="ud-pop-row">
                {popular.map(e => <PopularCard key={e.id} event={e} />)}
              </div>
            </section>
          )}

          {/* Coming soon */}
          {comingSoon.length > 0 && (
            <section className="ud-fade-up ud-d3">
              <div className="ud-section-head">
                <span>📅</span>
                <h2>{t('events.coming_soon')}</h2>
              </div>
              <div className="ud-cal-list">
                {comingSoon.map(e => <CalendarListCard key={e.id} event={e} />)}
              </div>
            </section>
          )}

          {activeCategory && filtered.length === 0 && (
            <div className="ud-empty-state">
              <span>🔍</span>
              <p>{t('events.no_experiences_found')}</p>
              <button onClick={() => setActiveCategory(null)} className="ud-btn-sm">{t('events.show_all_categories')}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Scoped CSS — all classes prefixed with ud-
   ────────────────────────────────────────────── */
const udforskCSS = `
${pageBase("ud")}

.ud-root { position: relative; padding-bottom: 96px; }

/* ── Content area (below cover+identity+stats) ── */
.ud-content { padding: 0 20px; }
.ud-search-results, .ud-search-overlay { padding-bottom: 16px; }

/* ── Search wrapper ── */
.ud-search-wrap-outer { padding: 0 20px 20px; }
.ud-search-bar { position: relative; }
.ud-search-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--pg-white-muted); pointer-events: none; z-index: 1;
}
.ud-search-input {
  width: 100%; padding: 14px 44px 14px 44px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  border-radius: 14px; color: var(--pg-white); font-size: 14px;
  font-family: var(--sans); outline: none; transition: all 0.25s;
}
.ud-search-input:focus { border-color: rgba(78,205,196,0.35); }
.ud-search-input::placeholder { color: rgba(255,255,255,0.3); }
.ud-search-clear {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: var(--pg-white-muted); background: none; border: none;
  cursor: pointer; transition: color 0.2s;
}
.ud-search-clear:hover { color: var(--pg-white); }

/* ── Search overlay / results ── */
.ud-search-overlay, .ud-search-results { padding: 0 20px 16px; margin-top: 0; }
.ud-tag-suggestions { display: flex; flex-wrap: wrap; gap: 8px; }
.ud-result-group { margin-bottom: 20px; }
.ud-result-list { display: flex; flex-direction: column; gap: 8px; }
.ud-result-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 14px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  text-decoration: none; color: var(--pg-white); cursor: pointer;
  transition: background 0.2s;
}
.ud-result-row:hover { background: var(--glass-bg-hover); }
.ud-result-row-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(255,255,255,0.08); display: flex;
  align-items: center; justify-content: center; font-size: 15px;
}
.ud-result-row-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.ud-result-row-text { display: flex; flex-direction: column; }
.ud-result-row-name { font-size: 13px; font-weight: 500; }
.ud-result-row-cat { font-size: 11px; color: var(--pg-white-muted); }
.ud-result-row-pin { margin-left: auto; color: var(--pg-white-muted); }
.ud-see-more {
  font-size: 12px; color: var(--teal); font-weight: 500;
  background: none; border: none; cursor: pointer; margin-top: 8px;
  font-family: var(--sans);
}
.ud-no-results { text-align: center; padding: 40px 20px; }
.ud-no-results span { font-size: 32px; display: block; margin-bottom: 10px; }
.ud-no-results p { font-size: 14px; color: var(--pg-white-dim); }

/* ── Content ── */
.ud-content { display: flex; flex-direction: column; gap: 28px; padding: 0 20px; }

/* ── Active category ── */
.ud-active-cat {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-radius: 14px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
}
.ud-active-cat span { font-size: 14px; font-weight: 500; }
.ud-active-cat button {
  font-size: 12px; color: var(--teal); font-weight: 500;
  background: none; border: none; cursor: pointer; font-family: var(--sans);
}

/* ── Section heads ── */
.ud-section-head {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.ud-section-head h2 { font-size: 14px; font-weight: 600; color: var(--pg-white); }
.ud-section-head span { font-size: 14px; }
.ud-section-head-left { display: flex; align-items: center; gap: 8px; flex: 1; }
.ud-section-count {
  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px;
  background: var(--teal-dim); color: var(--teal);
}
.ud-section-link {
  display: flex; align-items: center; gap: 3px;
  font-size: 12px; color: var(--pg-white-muted); text-decoration: none;
  cursor: pointer; transition: color 0.2s;
}
.ud-section-link:hover { color: var(--pg-white-dim); }
.ud-teal-icon { color: var(--teal); }

/* ── Chips ── */
.ud-chip-scroll {
  display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;
  scrollbar-width: none;
}
.ud-chip-scroll::-webkit-scrollbar { display: none; }
.ud-chip.highlighted {
  background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2);
  color: var(--pg-white);
}

/* ── Category chips ── */
.ud-cat-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
.ud-cat-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px; border-radius: 14px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  cursor: pointer; transition: all 0.25s; text-decoration: none;
  min-height: 44px; font-family: var(--sans);
  color: var(--pg-white);
}
.ud-cat-chip:hover { background: var(--glass-bg-hover); }
.ud-cat-chip.active {
  background: var(--teal); border-color: var(--teal);
  box-shadow: 0 4px 16px rgba(78,205,196,0.25);
}
.ud-cat-chip.active .ud-cat-chip-label { color: var(--bg); }
.ud-cat-chip.hotel {
  background: #003580; border-color: #003580;
}
.ud-cat-chip.hotel:hover { background: #00264D; }
.ud-cat-chip.hotel .ud-cat-chip-label { color: white; }
.ud-cat-chip-emoji { font-size: 16px; }
.ud-cat-chip-label { font-size: 12px; font-weight: 500; color: var(--pg-white-dim); }

/* ── Places section ── */
.ud-places-section { }
.ud-places-loading {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--pg-white-muted);
}
.ud-filter-row {
  display: flex; gap: 6px; overflow-x: auto; margin-bottom: 14px;
  scrollbar-width: none;
}
.ud-filter-row::-webkit-scrollbar { display: none; }
.ud-places-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ud-place-card {
  padding: 14px; border-radius: 16px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  cursor: pointer; transition: all 0.25s; text-decoration: none; color: var(--pg-white);
}
.ud-place-card:hover { background: var(--glass-bg-hover); transform: translateY(-2px); }
.ud-place-card-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,0.06); display: flex;
  align-items: center; justify-content: center; font-size: 18px;
  margin-bottom: 10px;
}
.ud-place-card-name {
  font-size: 12px; font-weight: 600; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ud-place-card-meta {
  display: flex; align-items: center; gap: 6px;
  margin-top: 6px; font-size: 12px;
}
.ud-place-card-rating { display: flex; align-items: center; gap: 3px; }
.ud-star { color: #fbbf24; fill: #fbbf24; }
.ud-place-card-rating span { color: var(--pg-white-dim); }
.ud-place-card-sep { color: var(--pg-white-muted); }
.ud-place-card-city { color: var(--pg-white-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ud-empty-places { padding: 16px 0; text-align: center; font-size: 12px; color: var(--pg-white-muted); }

/* ── Trending cards ── */
.ud-trend-list { display: flex; flex-direction: column; gap: 8px; }
.ud-trend-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px; border-radius: 16px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  text-decoration: none; color: var(--pg-white); cursor: pointer;
  transition: all 0.25s;
}
.ud-trend-card:hover { background: var(--glass-bg-hover); transform: translateY(-2px); }
.ud-trend-card-icon {
  width: 42px; height: 42px; border-radius: 12px;
  background: var(--teal-dim); display: flex;
  align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
}
.ud-trend-card-body { flex: 1; min-width: 0; }
.ud-trend-card-name { font-size: 14px; font-weight: 600; }
.ud-trend-card-meta {
  display: flex; align-items: center; gap: 10px;
  margin-top: 3px; font-size: 12px; color: var(--pg-white-muted);
}
.ud-trend-card-meta span { display: flex; align-items: center; gap: 3px; }
.ud-trend-card-badge {
  padding: 4px 12px; border-radius: 100px;
  background: var(--teal); color: var(--bg);
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}

/* ── Popular row ── */
.ud-pop-row {
  display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none;
}
.ud-pop-row::-webkit-scrollbar { display: none; }
.ud-pop-card {
  flex: 0 0 175px; border-radius: 16px; overflow: hidden;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  text-decoration: none; color: var(--pg-white); cursor: pointer;
  transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
}
.ud-pop-card:hover { transform: translateY(-6px); border-color: rgba(78,205,196,0.2); }
.ud-pop-card-img-wrap { position: relative; height: 112px; overflow: hidden; }
.ud-pop-card-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s ease;
}
.ud-pop-card:hover .ud-pop-card-img { transform: scale(1.08); }
.ud-pop-card-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(6,10,15,0.8) 0%, transparent 50%);
}
.ud-pop-card-price {
  position: absolute; top: 8px; right: 8px;
  padding: 3px 8px; border-radius: 100px;
  font-size: 11px; font-weight: 600;
  background: rgba(245,158,11,0.8); color: white;
}
.ud-pop-card-price.free { background: rgba(78,205,196,0.8); }
.ud-pop-card-body { padding: 10px 12px 12px; }
.ud-pop-card-name {
  font-size: 12px; font-weight: 600; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.ud-pop-card-cat { font-size: 11px; color: var(--pg-white-muted); margin-top: 4px; }

/* ── Calendar list cards ── */
.ud-cal-list { display: flex; flex-direction: column; gap: 8px; }
.ud-cal-card {
  display: flex; gap: 12px; padding-right: 14px;
  border-radius: 16px; overflow: hidden;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  text-decoration: none; color: var(--pg-white); cursor: pointer;
  transition: all 0.25s;
}
.ud-cal-card:hover { background: var(--glass-bg-hover); }
.ud-cal-card-img-wrap { width: 80px; height: 80px; flex-shrink: 0; overflow: hidden; }
.ud-cal-card-img { width: 100%; height: 100%; object-fit: cover; }
.ud-cal-card-body { display: flex; flex-direction: column; justify-content: center; padding: 8px 0; min-width: 0; flex: 1; }
.ud-cal-card-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
.ud-cal-card-cat { font-size: 11px; color: var(--pg-white-dim); }
.ud-cal-card-price {
  padding: 1px 8px; border-radius: 100px;
  font-size: 11px; font-weight: 600;
  background: rgba(245,158,11,0.15); color: #f59e0b;
}
.ud-cal-card-price.free { background: var(--teal-dim); color: var(--teal); }
.ud-cal-card-name {
  font-size: 13px; font-weight: 600; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ud-cal-card-info {
  display: flex; align-items: center; gap: 8px;
  margin-top: 3px; font-size: 11px; color: var(--pg-white-muted);
}
.ud-cal-card-loc { display: flex; align-items: center; gap: 3px; }

/* ── Empty ── */
.ud-empty-state {
  text-align: center; padding: 60px 20px;
}
.ud-empty-state span { font-size: 40px; display: block; margin-bottom: 12px; }
.ud-empty-state p { font-size: 14px; color: var(--pg-white-dim); margin-bottom: 16px; }

@media (max-width: 768px) {
  .ud-sticky-header { padding: 40px 16px 12px; }
}
`;
