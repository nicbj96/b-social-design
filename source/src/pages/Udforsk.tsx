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
   B-Social Udforsk — Bento Dashboard Redesign
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
  { name: "Anna", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&auto=format&fit=crop&crop=face", action: "Koncert" },
  { name: "Mads", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&crop=face", action: "Festival" },
  { name: "Sofie", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&crop=face", action: "Udstilling" },
  { name: "Jonas", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&crop=face", action: "Løbeevent" },
  { name: "Emil", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&crop=face", action: "Madmarked" },
  { name: "Lise", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&crop=face", action: "Teater" },
  { name: "Peter", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&crop=face", action: "Fodbold" },
];

const PLACE_CAT_EMOJI: Record<string, string> = {
  natur: "🌿", aktiv_sport: "🏃", mad_hangout: "🍽️", sport: "⚽", kultur: "🎭", musik: "🎵",
  strand: "🏖️", badning: "🏊", hundeskov: "🐕", hund: "🐕", shelter: "⛺", fiskeri: "🎣",
  loeb: "🏃", mtb: "🚵", vandring: "🥾", mad: "🍽️", fitness: "💪", outdoor: "🌲",
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

/* Category colors for trending chips */
const CAT_COLORS: Record<string, string> = {
  musik: "#e74c3c",
  kunst: "#9b59b6",
  kultur: "#9b59b6",
  mad: "#e67e22",
  drikke: "#f39c12",
  sport: "#27ae60",
  natur: "#2ecc71",
  udliv: "#16a085",
  livstil: "#3498db",
  teknologi: "#2980b9",
  socialt: "#e91e63",
  spil: "#8e44ad",
  fitness: "#1abc9c",
  kreativt: "#e74c3c",
};

/* ── Sub-components ── */

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

  function pickTag(tag: string) {
    setActiveCategory(tag);
    setSearch("");
    setSearchFocused(false);
    searchRef.current?.blur();
  }

  const featuredEvent = popular[0] || null;

  return (
    <div ref={containerRef} className="ud-root" data-testid="udforsk-page">
      <style>{udforskCSS}</style>

      {/* ── HERO COVER ── */}
      <div className="ud-hero ud-fade-up">
        <img
          src="https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1400&auto=format&fit=crop"
          alt="Copenhagen skyline"
          className="ud-hero-img"
        />
        <div className="ud-hero-gradient" />
        <div className="ud-hero-content">
          <h1 className="ud-hero-title">Udforsk</h1>
          <p className="ud-hero-sub">Hvad sker der i Danmark?</p>
        </div>
      </div>

      {/* ── SEARCH (hidden when scrolled into bento) ── */}
      <div className="ud-search-wrap ud-fade-up ud-d1">
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

          {filtered.length > 0 && (
            <div className="ud-result-group">
              <p className="ud-label">{t('udforsk.search_events')}</p>
              <div className="ud-result-list">
                {filtered.slice(0, 3).map(e => (
                  <Link key={e.id} href={`/event/${e.id}`} className="ud-cal-card">
                    <div className="ud-cal-card-img-wrap">
                      <img src={getEventImage(e)} alt={e.title} className="ud-cal-card-img" loading="lazy" />
                    </div>
                    <div className="ud-cal-card-body">
                      <div className="ud-cal-card-meta">
                        <span className="ud-cal-card-cat">{getCategoryEmoji(e.category || "")} {e.category}</span>
                      </div>
                      <h3 className="ud-cal-card-name">{e.title}</h3>
                      <div className="ud-cal-card-info">
                        <span>{formatDanishDate(e.date)}</span>
                        {e.location && <span className="ud-cal-card-loc"><MapPin size={9} />{e.location.split(",")[0]}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

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

      {/* ═══ BENTO DASHBOARD ═══ */}
      {!search && !searchFocused && (
        <div className="ud-bento">

          {activeCategory && (
            <div className="ud-active-cat ud-fade-up" style={{ gridColumn: '1 / -1' }}>
              <span>{getCategoryEmoji(activeCategory)} {t('events.showing', {category: activeCategory})}</span>
              <button onClick={() => setActiveCategory(null)}>{t('events.show_all')}</button>
            </div>
          )}

          {/* ──── ROW 1: Featured + Trending/Friends ──── */}

          {/* Featured Event — large card */}
          {featuredEvent && (
            <Link href={`/event/${featuredEvent.id}`} className="ud-feat ud-glass ud-fade-up">
              <div className="ud-feat-img-wrap">
                <img src={getEventImage(featuredEvent)} alt={featuredEvent.title} className="ud-feat-img" loading="lazy" />
                <div className="ud-feat-img-overlay" />
              </div>
              <div className="ud-feat-info">
                <div className="ud-feat-header">
                  <div className="ud-feat-logo">B</div>
                  <span className="ud-feat-accent">#4ECDC4</span>
                </div>
                <h2 className="ud-feat-title">{featuredEvent.title}</h2>
                <div className="ud-feat-details">
                  <div className="ud-feat-detail-row">
                    <span className="ud-feat-date">{formatDanishDate(featuredEvent.date)}</span>
                    <span className="ud-feat-attendees">12.5Tus</span>
                  </div>
                  <div className="ud-feat-detail-row">
                    <span className="ud-feat-loc">
                      {featuredEvent.location ? `${featuredEvent.location.split(",")[0]}` : "Danmark"}
                    </span>
                    <span className="ud-feat-price">
                      {!featuredEvent.price || featuredEvent.price === 0 ? "Gratis" : `${featuredEvent.price} kr`}
                    </span>
                  </div>
                  {featuredEvent.location && (
                    <div className="ud-feat-venue">
                      <MapPin size={10} /> {featuredEvent.location.split(",")[0]}
                    </div>
                  )}
                </div>
                <div className="ud-feat-social">
                  {BRUGERE.slice(0, 5).map((b, i) => (
                    <img key={b.name} src={b.avatar} alt={b.name} className="ud-feat-social-avatar" style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }} loading="lazy" />
                  ))}
                  <span className="ud-feat-social-label">Socialhot</span>
                </div>
              </div>
            </Link>
          )}

          {/* Right stack: Trending + Friends */}
          <div className="ud-right-stack">
            {/* Trending kategorier */}
            <div className="ud-bento-card ud-glass ud-fade-up ud-d1">
              <h3 className="ud-bento-card-title">Trending kategorier</h3>
              <div className="ud-trending-chips">
                {ALL_CATEGORIES.slice(0, 10).map((cat) => {
                  const color = CAT_COLORS[cat.key] || "#4ECDC4";
                  return (
                    <button
                      key={cat.key}
                      onClick={() => pickTag(cat.key)}
                      className={`ud-trend-chip ${activeCategory === cat.key ? "active" : ""}`}
                      style={{ '--chip-color': color } as React.CSSProperties}
                      data-testid={`cat-chip-${cat.key}`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Venner deltager */}
            <div className="ud-bento-card ud-glass ud-fade-up ud-d2">
              <h3 className="ud-bento-card-title">Venner deltager</h3>
              <div className="ud-friends-row">
                {BRUGERE.slice(0, 4).map((b) => (
                  <div key={b.name} className="ud-friend-item">
                    <img src={b.avatar} alt={b.name} className="ud-friend-avatar" loading="lazy" />
                  </div>
                ))}
                <div className="ud-friend-detail">
                  <span className="ud-friend-name">{BRUGERE[0].name} deltager i {BRUGERE[0].action}</span>
                  <ChevronRight size={12} className="ud-friend-arrow" />
                </div>
              </div>
            </div>
          </div>

          {/* ──── ROW 2: Populært + Redaktørens valg ──── */}

          {/* Populært lige nu — image grid */}
          <div className="ud-bento-card ud-pop-section ud-glass ud-fade-up ud-d2">
            <h3 className="ud-bento-card-title">Populært lige nu</h3>
            <div className="ud-pop-grid">
              {popular.slice(0, 5).map((e, i) => (
                <Link key={e.id} href={`/event/${e.id}`} className={`ud-pop-item ${i === 0 ? 'ud-pop-large' : ''}`}>
                  <img src={getEventImage(e)} alt={e.title} className="ud-pop-item-img" loading="lazy" />
                  <div className="ud-pop-item-overlay" />
                  <span className="ud-pop-item-label">{e.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Redaktørens valg */}
          <div className="ud-bento-card ud-editor-section ud-glass ud-fade-up ud-d3">
            <h3 className="ud-bento-card-title">
              <Star size={13} className="ud-teal-icon" /> Redaktørens valg
            </h3>
            <div className="ud-editor-grid">
              {popular.slice(1, 3).map((e) => (
                <Link key={e.id} href={`/event/${e.id}`} className="ud-editor-card">
                  <img src={getEventImage(e)} alt={e.title} className="ud-editor-card-img" loading="lazy" />
                  <div className="ud-editor-card-overlay" />
                  <div className="ud-editor-card-body">
                    <span className="ud-editor-card-name">{e.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ──── ROW 3: Country filter + Places ──── */}
          <div className="ud-full-row ud-fade-up ud-d3">
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
          </div>

          <div className="ud-full-row ud-fade-up ud-d3">
            <SupabasePlacesSection activeCountry={activeCountry} />
          </div>

          {activeCategory && filtered.length === 0 && (
            <div className="ud-empty-state" style={{ gridColumn: '1 / -1' }}>
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

/* ═══════════════════════════════════════════
   HERO COVER
   ═══════════════════════════════════════════ */
.ud-hero {
  position: relative; width: 100%; height: 200px; overflow: hidden;
  border-radius: 0 0 20px 20px; margin-bottom: 20px;
}
.ud-hero-img {
  width: 100%; height: 100%; object-fit: cover; object-position: center 40%;
  filter: brightness(0.65);
}
.ud-hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(6,10,15,0.2) 0%, rgba(6,10,15,0.85) 100%);
}
.ud-hero-content {
  position: absolute; bottom: 24px; left: 28px; z-index: 2;
}
.ud-hero-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 48px; font-weight: 400; color: var(--pg-white);
  letter-spacing: -1px; line-height: 1; margin: 0;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
}
.ud-hero-sub {
  font-size: 15px; color: var(--teal); font-weight: 500;
  margin: 6px 0 0; font-family: var(--sans);
  text-shadow: 0 1px 10px rgba(0,0,0,0.5);
}

/* ═══════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════ */
.ud-search-wrap { padding: 0 24px 20px; }
.ud-search-bar { position: relative; max-width: 640px; }
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

.ud-search-overlay, .ud-search-results { padding: 0 24px 16px; max-width: 700px; }
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
.ud-no-results { text-align: center; padding: 40px 20px; }
.ud-no-results span { font-size: 32px; display: block; margin-bottom: 10px; }
.ud-no-results p { font-size: 14px; color: var(--pg-white-dim); }

/* ═══════════════════════════════════════════
   BENTO DASHBOARD GRID
   ═══════════════════════════════════════════ */
.ud-bento {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.ud-full-row { grid-column: 1 / -1; }

/* ═══════════════════════════════════════════
   BENTO CARD BASE
   ═══════════════════════════════════════════ */
.ud-bento-card { padding: 20px; }
.ud-bento-card-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 600; color: var(--pg-white);
  margin: 0 0 14px; font-family: var(--sans);
}

/* ═══════════════════════════════════════════
   FEATURED EVENT CARD (bento left)
   ═══════════════════════════════════════════ */
.ud-feat {
  display: flex; overflow: hidden; text-decoration: none; color: var(--pg-white);
  cursor: pointer; transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
  min-height: 240px;
}
.ud-feat:hover {
  transform: translateY(-3px);
  border-color: rgba(78,205,196,0.25);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
}
.ud-feat-img-wrap {
  position: relative; width: 42%; flex-shrink: 0; overflow: hidden;
}
.ud-feat-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s ease;
}
.ud-feat:hover .ud-feat-img { transform: scale(1.06); }
.ud-feat-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to right, transparent 50%, rgba(6,10,15,0.5) 100%);
}
.ud-feat-info {
  display: flex; flex-direction: column; justify-content: center;
  padding: 22px 24px; flex: 1; min-width: 0; gap: 10px;
}
.ud-feat-header {
  display: flex; align-items: center; gap: 10px;
}
.ud-feat-logo {
  width: 28px; height: 28px; border-radius: 8px;
  background: var(--teal); color: var(--bg);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; font-family: var(--sans);
}
.ud-feat-accent {
  font-size: 11px; color: var(--teal); font-family: monospace;
  opacity: 0.6;
}
.ud-feat-title {
  font-size: 20px; font-weight: 700; line-height: 1.25; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.ud-feat-details {
  display: flex; flex-direction: column; gap: 4px;
}
.ud-feat-detail-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12px; color: var(--pg-white-dim);
}
.ud-feat-date { color: var(--pg-white-muted); }
.ud-feat-attendees { color: var(--teal); font-weight: 600; }
.ud-feat-loc { color: var(--pg-white-muted); }
.ud-feat-price {
  font-weight: 600; color: var(--pg-white-dim);
}
.ud-feat-venue {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: var(--pg-white-muted);
}
.ud-feat-social {
  display: flex; align-items: center; margin-top: 4px;
}
.ud-feat-social-avatar {
  width: 26px; height: 26px; border-radius: 50%; object-fit: cover;
  border: 2px solid var(--bg); position: relative;
}
.ud-feat-social-label {
  font-size: 11px; color: var(--pg-white-muted);
  margin-left: 10px; font-weight: 500;
}

/* ═══════════════════════════════════════════
   RIGHT STACK (trending + friends)
   ═══════════════════════════════════════════ */
.ud-right-stack {
  display: flex; flex-direction: column; gap: 16px;
}

/* ── Trending chips with color ── */
.ud-trending-chips {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.ud-trend-chip {
  padding: 6px 14px; border-radius: 100px;
  background: color-mix(in srgb, var(--chip-color) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--chip-color) 30%, transparent);
  color: var(--chip-color);
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: var(--sans);
}
.ud-trend-chip:hover {
  background: color-mix(in srgb, var(--chip-color) 30%, transparent);
  border-color: var(--chip-color);
}
.ud-trend-chip.active {
  background: var(--chip-color); color: white;
  border-color: var(--chip-color);
}

/* ── Friends row ── */
.ud-friends-row {
  display: flex; align-items: center; gap: 10px;
}
.ud-friend-item { flex-shrink: 0; }
.ud-friend-avatar {
  width: 40px; height: 40px; border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(78,205,196,0.25);
}
.ud-friend-detail {
  display: flex; align-items: center; gap: 6px;
  flex: 1; min-width: 0;
}
.ud-friend-name {
  font-size: 12px; color: var(--pg-white-dim);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ud-friend-arrow { color: var(--pg-white-muted); flex-shrink: 0; }

/* ═══════════════════════════════════════════
   POPULÆRT — IMAGE GRID
   ═══════════════════════════════════════════ */
.ud-pop-section { }
.ud-pop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 10px;
}
.ud-pop-large {
  grid-row: 1 / 3;
}
.ud-pop-item {
  position: relative; border-radius: 12px; overflow: hidden;
  height: 110px; cursor: pointer; text-decoration: none; color: white;
  display: block;
}
.ud-pop-large { height: 100%; min-height: 230px; }
.ud-pop-item-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.4s ease;
}
.ud-pop-item:hover .ud-pop-item-img { transform: scale(1.06); }
.ud-pop-item-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
}
.ud-pop-item-label {
  position: absolute; bottom: 8px; left: 10px; right: 10px;
  font-size: 11px; font-weight: 600; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ═══════════════════════════════════════════
   REDAKTØRENS VALG — 2-col image cards
   ═══════════════════════════════════════════ */
.ud-editor-section { }
.ud-editor-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.ud-editor-card {
  position: relative; border-radius: 12px; overflow: hidden;
  height: 140px; cursor: pointer; text-decoration: none; color: white;
  display: block;
}
.ud-editor-card-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.4s ease;
}
.ud-editor-card:hover .ud-editor-card-img { transform: scale(1.06); }
.ud-editor-card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
}
.ud-editor-card-body {
  position: absolute; bottom: 10px; left: 12px; right: 12px;
}
.ud-editor-card-name {
  font-size: 12px; font-weight: 600; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* ═══════════════════════════════════════════
   ACTIVE CATEGORY BAR
   ═══════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════
   SHARED ELEMENTS
   ═══════════════════════════════════════════ */
.ud-teal-icon { color: var(--teal); }

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

.ud-chip-scroll {
  display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;
  scrollbar-width: none;
}
.ud-chip-scroll::-webkit-scrollbar { display: none; }
.ud-chip.highlighted {
  background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2);
  color: var(--pg-white);
}

/* ═══════════════════════════════════════════
   PLACES SECTION
   ═══════════════════════════════════════════ */
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
.ud-places-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
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

/* ═══════════════════════════════════════════
   CALENDAR LIST CARDS (search results)
   ═══════════════════════════════════════════ */
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
.ud-cal-card-name {
  font-size: 13px; font-weight: 600; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ud-cal-card-info {
  display: flex; align-items: center; gap: 8px;
  margin-top: 3px; font-size: 11px; color: var(--pg-white-muted);
}
.ud-cal-card-loc { display: flex; align-items: center; gap: 3px; }

/* ═══════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════ */
.ud-empty-state {
  text-align: center; padding: 60px 20px;
}
.ud-empty-state span { font-size: 40px; display: block; margin-bottom: 12px; }
.ud-empty-state p { font-size: 14px; color: var(--pg-white-dim); margin-bottom: 16px; }

/* ═══════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════ */
@media (max-width: 900px) {
  .ud-bento {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }
  .ud-feat { flex-direction: column; min-height: auto; }
  .ud-feat-img-wrap { width: 100%; height: 180px; }
  .ud-feat-img-overlay {
    background: linear-gradient(to top, rgba(6,10,15,0.7) 0%, transparent 60%);
  }
  .ud-feat-info { padding: 18px 20px; }
  .ud-feat-title { font-size: 18px; }
  .ud-pop-grid { grid-template-columns: 1fr 1fr; }
  .ud-pop-large { grid-row: auto; min-height: 140px; }
  .ud-places-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .ud-hero { height: 160px; }
  .ud-hero-title { font-size: 36px; }
  .ud-hero-content { bottom: 18px; left: 20px; }
  .ud-bento { gap: 12px; }
  .ud-pop-grid { grid-template-columns: 1fr; }
  .ud-pop-large { min-height: 160px; }
  .ud-editor-grid { grid-template-columns: 1fr; }
  .ud-places-grid { grid-template-columns: 1fr; }
}
`;
