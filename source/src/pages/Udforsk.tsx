import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "wouter";
import { Search, MapPin, ChevronRight, X, Users, Heart, TrendingUp, Star, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@/lib/data";
import { getEvents } from "@/lib/data";
import { fetchPlaces, type Place } from "@/lib/supabase";
import { getCategoryEmoji, getEventImage, formatDanishDate } from "@/lib/eventHelpers";
import { useTags } from "@/context/TagContext";
import { searchTags, getParentCategories, TAG_TREE } from "@/lib/tagTree";
import { OPLEVELSER_NAER_DIG } from "@/data/feedData";
import type { SocialActivity } from "@/data/feedData";
import { ALL_PINS } from "@/data/kortPins";
import { ALL_CATEGORIES } from "@/data/categories";
import type { Category } from "@/data/categories";
import { pageBase } from "@/lib/pageCSSBase";

/* ─────────────────────────────────────────────
   B-Social Udforsk — Bento Dashboard
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
  'JP': { flag: '🇯🇵', label: 'Japan' },
  'US': { flag: '🇺🇸', label: 'USA' },
  'AU': { flag: '🇦🇺', label: 'Australien' },
  'BR': { flag: '🇧🇷', label: 'Brasilien' },
  'IN': { flag: '🇮🇳', label: 'Indien' },
  'ZA': { flag: '🇿🇦', label: 'S. Afrika' },
  'EUROPE': { flag: '🌍', label: 'Europa' },
  'ASIA': { flag: '🌏', label: 'Asien' },
  'AMERICAS': { flag: '🌎', label: 'Amerika' },
  'AFRICA': { flag: '🌍', label: 'Afrika' },
  'ALL': { flag: '🌐', label: 'Hele verden' },
};

const EUROPE_CODES = [
  'DK','SE','NO','DE','NL','BE','AT','CH','ES','FR','IT','GB','IE','PL','CZ','FI',
  'PT','GR','HU','RO','HR','SK','SI','LT','LV','EE','BG','RS','UA','BY',
  'LU','MT','CY','LI','IS','AL','MK','BA','ME','MD','AM','GE','AZ',
];
const ASIA_CODES = [
  'JP','KR','CN','TW','TH','VN','ID','MY','PH','SG','MM','KH','LA',
  'IN','BD','PK','LK','NP','KZ','UZ','KG','TJ','TM','MN','AF',
  'IR','IQ','SA','QA','KW','BH','OM','YE','JO','IL','LB','SY','TR','AE',
];
const AMERICAS_CODES = [
  'US','CA','MX','BR','AR','CL','CO','PE','VE','EC','BO','PY','UY','GY',
  'CR','PA','GT','HN','SV','NI','CU','JM','DO','HT','TT',
];
const AFRICA_CODES = [
  'ZA','EG','MA','DZ','TN','LY','NG','GH','SN','CI','CM','ET','KE','TZ',
  'UG','RW','SD','CD','AO','MZ','ZM','ZW','BW','NA','MG',
];

const COUNTRY_CHIP_ORDER = ['DK','SE','NO','DE','NL','GB','FR','ES','IT','JP','US','AU','BR','IN','ZA','EUROPE','ASIA','AMERICAS','AFRICA','ALL'] as const;

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
  natteliv: "🌙", familie: "🎡", underholdning: "🎡", temapark: "🎢", zoo: "🦁",
  akvarium: "🐟", overnatning: "🏕️", hostel: "🏕️", forlystelse: "🎡",
  logi: "🏕️", rejser: "✈️", wellness: "🧘", communities: "👥", ture: "🥾", aktiv: "🏃",
  // Old DB category names with spaces
  "Natur & friluftsliv": "🌿", "Ture & eventyr": "🥾", "Logi & base": "🏕️",
  "Aktiv & sport": "🏃", "Oplevelser & kultur": "🎭",
  // Event categories
  arrangement: "📅", "Musik & Koncerter": "🎵", "Kultur & Kunst": "🎭",
};

// Maps filter key → actual DB main_categories values (some have aliases/old names)
const CAT_ALIASES: Record<string, string[]> = {
  aktiv_sport: ["aktiv_sport", "Aktiv & sport", "sport"],
  natur:       ["natur", "Natur & friluftsliv"],
  mad:         ["mad_hangout", "mad"],
  kultur:      ["kultur", "Oplevelser & kultur", "underholdning"],
  logi:        ["logi", "overnatning", "Logi & base"],
  ture:        ["ture", "Ture & eventyr"],
  familie:     ["familie", "temapark", "zoo", "akvarium", "forlystelse"],
  natteliv:    ["natteliv", "klub", "bar"],
  wellness:    ["wellness"],
  rejser:      ["rejser", "transport"],
};

const DB_FILTERS: { key: string | null; label: string; emoji: string }[] = [
  { key: null,          label: "Alle",      emoji: "✨" },
  { key: "natur",       label: "Natur",     emoji: "🌿" },
  { key: "aktiv_sport", label: "Sport",     emoji: "🏃" },
  { key: "kultur",      label: "Kultur",    emoji: "🎭" },
  { key: "mad",         label: "Mad",       emoji: "🍽️" },
  { key: "musik",       label: "Musik",     emoji: "🎵" },
  { key: "natteliv",    label: "Natteliv",  emoji: "🌙" },
  { key: "familie",     label: "Familie",   emoji: "🎡" },
  { key: "logi",        label: "Logi",      emoji: "🏕️" },
  { key: "ture",        label: "Ture",      emoji: "🥾" },
  { key: "wellness",    label: "Wellness",  emoji: "🧘" },
  { key: "rejser",      label: "Rejser",    emoji: "✈️" },
  { key: "strand",      label: "Strand",    emoji: "🏖️" },
  { key: "hundeskov",   label: "Hundeskov", emoji: "🐕" },
];

/* Chip colors matching the mockup exactly */
const CAT_COLORS: Record<string, string> = {
  events_faellesskab: "#e74c3c",
  logi_base: "#9b59b6",
  ture_eventyr: "#27ae60",
  natur_friluftsliv: "#2ecc71",
  aktiv_sport: "#e67e22",
  mad_hangouts: "#f39c12",
  oplevelser_kultur: "#9b59b6",
  rejser_transport: "#3498db",
  communities_clubs: "#16a085",
  wellness_balance: "#2980b9",
  musik: "#e74c3c",
  kunst: "#9b59b6",
  kultur: "#9b59b6",
  mad: "#e67e22",
  sport: "#27ae60",
  natur: "#2ecc71",
  udliv: "#16a085",
  livstil: "#3498db",
  teknologi: "#2980b9",
  socialt: "#e91e63",
};

/* ── Sub-components ── */

function SupabasePlacesSection({ activeCountry }: { activeCountry: string }) {
  const { t } = useTranslation();
  const [dbFilter, setDbFilter] = useState<string | null>(null);

  // Resolve country to single code or undefined (regions handled client-side)
  const singleCountry = useMemo(() => {
    if (!activeCountry || activeCountry === 'ALL' || activeCountry === 'EUROPE' ||
        activeCountry === 'ASIA' || activeCountry === 'AMERICAS' || activeCountry === 'AFRICA') return undefined;
    return activeCountry;
  }, [activeCountry]);

  // Server-side filter: fetch by category when filter is active
  const { data: places, isLoading } = useQuery<Place[]>({
    queryKey: ["supabase-places", dbFilter, singleCountry],
    queryFn: () => {
      const cats = dbFilter ? (CAT_ALIASES[dbFilter] || [dbFilter]) : undefined;
      return fetchPlaces({ categories: cats, country: singleCountry, limit: 60 });
    },
    staleTime: 30 * 60 * 1000,
  });

  const filteredPlaces = useMemo(() => {
    if (!places) return [];
    if (activeCountry === 'ALL') return places;
    if (activeCountry === 'EUROPE')   return places.filter(p => EUROPE_CODES.includes(p.country));
    if (activeCountry === 'ASIA')     return places.filter(p => ASIA_CODES.includes(p.country));
    if (activeCountry === 'AMERICAS') return places.filter(p => AMERICAS_CODES.includes(p.country));
    if (activeCountry === 'AFRICA')   return places.filter(p => AFRICA_CODES.includes(p.country));
    return places;
  }, [places, activeCountry]);

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
  const containerRef = useRef<HTMLDivElement>(null);

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
        matchCountry = EUROPE_CODES.includes(e.country);
      } else if (activeCountry === 'ASIA') {
        matchCountry = ASIA_CODES.includes(e.country);
      } else if (activeCountry === 'AMERICAS') {
        matchCountry = AMERICAS_CODES.includes(e.country);
      } else if (activeCountry === 'AFRICA') {
        matchCountry = AFRICA_CODES.includes(e.country);
      } else {
        matchCountry = e.country === activeCountry;
      }
      return matchSearch && matchCat && matchCountry && matchUserTags;
    });
  }, [allEvents, debouncedSearch, activeCategory, activeCountry, selectedTags]);

  const popular = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 10);

  const newest = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 12);
  }, [allEvents]);

  function pickTag(tag: string) {
    setActiveCategory(tag);
    setSearch("");
    setSearchFocused(false);
    searchRef.current?.blur();
  }

  const featuredEvent = popular[0] || null;
  const showSearch = search || searchFocused;

  return (
    <div ref={containerRef} className="ud-root" data-testid="udforsk-page">
      <style>{udforskCSS}</style>

      {/* ── HERO COVER ── */}
      <div className="ud-hero">
        <img
          src="https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1400&auto=format&fit=crop"
          alt="Copenhagen skyline"
          className="ud-hero-img"
        />
        <div className="ud-hero-gradient" />
        <div className="ud-hero-text">
          <h1 className="ud-hero-title">Udforsk</h1>
          <p className="ud-hero-sub">Hvad sker der i Danmark?</p>
        </div>
      </div>

      {/* ── SEARCH (click to expand) ── */}
      {showSearch && (
        <div className="ud-search-wrap">
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
              autoFocus
              data-testid="input-search"
            />
            <button onClick={() => { setSearch(""); setSearchFocused(false); setActiveCategory(null); searchRef.current?.blur(); }} className="ud-search-clear">
              <X size={16} />
            </button>
          </div>

          {/* Search suggestions */}
          {!search && (
            <div className="ud-search-suggestions">
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

          {/* Search results */}
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
        </div>
      )}

      {/* ═══ BENTO DASHBOARD ═══ */}
      {!showSearch && (
        <div className="ud-bento">

          {activeCategory && (
            <div className="ud-active-cat" style={{ gridColumn: '1 / -1' }}>
              <span>{getCategoryEmoji(activeCategory)} {t('events.showing', {category: activeCategory})}</span>
              <button onClick={() => setActiveCategory(null)}>{t('events.show_all')}</button>
            </div>
          )}

          {/* ──── ROW 1: Featured Event + Right sidebar ──── */}
          {featuredEvent && (
            <Link href={`/event/${featuredEvent.id}`} className="ud-feat">
              {/* Inset image with rounded corners */}
              <div className="ud-feat-thumb">
                <img src={getEventImage(featuredEvent)} alt={featuredEvent.title} className="ud-feat-thumb-img" loading="lazy" />
              </div>
              {/* Event details */}
              <div className="ud-feat-info">
                <div className="ud-feat-header">
                  <div className="ud-feat-logo">B</div>
                  <span className="ud-feat-accent">#4ECDC4</span>
                </div>
                <h2 className="ud-feat-title">{featuredEvent.title}</h2>
                <div className="ud-feat-rows">
                  <div className="ud-feat-row">
                    <span>{formatDanishDate(featuredEvent.date)}</span>
                    <span className="ud-feat-highlight">12.5Tus</span>
                  </div>
                  <div className="ud-feat-row">
                    <span>{featuredEvent.location ? featuredEvent.location.split(",")[0] : "Danmark"}</span>
                    <span>{!featuredEvent.price || featuredEvent.price === 0 ? "Gratis" : `${featuredEvent.price} kr`}</span>
                  </div>
                  {featuredEvent.location && (
                    <div className="ud-feat-venue">
                      <MapPin size={10} /> {featuredEvent.location.split(",")[0]}
                    </div>
                  )}
                </div>
                {/* Platform icons row */}
                <div className="ud-feat-icons">
                  <div className="ud-feat-icon" style={{ background: '#3b82f6' }}>🎫</div>
                  <div className="ud-feat-icon" style={{ background: '#ef4444' }}>TiV</div>
                  <div className="ud-feat-icon" style={{ background: '#f59e0b' }}>🎵</div>
                  <div className="ud-feat-icon" style={{ background: '#8b5cf6' }}>🎪</div>
                  <div className="ud-feat-icon" style={{ background: '#ec4899' }}>❤️</div>
                  <span className="ud-feat-icons-label">Smukfest</span>
                </div>
              </div>
            </Link>
          )}

          <div className="ud-sidebar">
            {/* Trending kategorier */}
            <div className="ud-card">
              <h3 className="ud-card-title">Trending kategorier</h3>
              <div className="ud-trend-chips">
                {ALL_CATEGORIES.slice(0, 10).map((cat) => {
                  const color = CAT_COLORS[cat.key] || "#4ECDC4";
                  return (
                    <button
                      key={cat.key}
                      onClick={() => pickTag(cat.key)}
                      className={`ud-tchip ${activeCategory === cat.key ? "active" : ""}`}
                      style={{ '--cc': color } as React.CSSProperties}
                      data-testid={`cat-chip-${cat.key}`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Venner deltager */}
            <div className="ud-card ud-friends-card">
              <h3 className="ud-card-title">Venner deltager</h3>
              <div className="ud-friends">
                <div className="ud-friends-avatars">
                  {BRUGERE.slice(0, 3).map((b, i) => (
                    <img key={b.name} src={b.avatar} alt={b.name} className="ud-friends-ava" style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }} loading="lazy" />
                  ))}
                </div>
                <span className="ud-friends-txt">{BRUGERE[0].name} deltager i {BRUGERE[0].action}</span>
                <ChevronRight size={14} className="ud-friends-arrow" />
              </div>
            </div>
          </div>

          {/* ──── ROW 2: Populært + Redaktørens valg ──── */}
          <div className="ud-card ud-pop">
            <h3 className="ud-card-title">Populært lige nu</h3>
            <div className="ud-pop-mosaic">
              {popular.slice(0, 5).map((e, i) => (
                <Link key={e.id} href={`/event/${e.id}`} className={`ud-pop-tile ${i === 0 ? 'ud-pop-big' : ''}`}>
                  <img src={getEventImage(e)} alt={e.title} loading="lazy" />
                  <div className="ud-pop-tile-grad" />
                  <span className="ud-pop-tile-name">{e.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="ud-card ud-editor">
            <h3 className="ud-card-title">
              <Star size={13} className="ud-teal-icon" /> Redaktørens valg
            </h3>
            <div className="ud-editor-grid">
              {popular.slice(1, 3).map((e) => (
                <Link key={e.id} href={`/event/${e.id}`} className="ud-editor-tile">
                  <img src={getEventImage(e)} alt={e.title} loading="lazy" />
                  <div className="ud-pop-tile-grad" />
                  <span className="ud-editor-tile-name">{e.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ──── ROW 3: Country filter + Places ──── */}
          <div className="ud-full">
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

          <div className="ud-full">
            <SupabasePlacesSection activeCountry={activeCountry} />
          </div>

          {/* ──── Nyeste events ──── */}
          {newest.length > 0 && (
            <div className="ud-full">
              <section className="ud-newest-section">
                <div className="ud-section-head">
                  <div className="ud-section-head-left">
                    <span>✨</span>
                    <h2>Nyeste events</h2>
                    <span className="ud-section-count">{newest.length}</span>
                  </div>
                </div>
                <div className="ud-newest-scroll">
                  {newest.map(e => (
                    <Link key={e.id} href={`/event/${e.id}`} className="ud-newest-card">
                      <div className="ud-newest-img-wrap">
                        <img src={getEventImage(e)} alt={e.title} loading="lazy" className="ud-newest-img" />
                      </div>
                      <div className="ud-newest-body">
                        <span className="ud-newest-cat">{getCategoryEmoji(e.category || '')} {e.category}</span>
                        <h3 className="ud-newest-title">{e.title}</h3>
                        <span className="ud-newest-date">{formatDanishDate(e.date)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeCategory && filtered.length === 0 && (
            <div className="ud-empty-state" style={{ gridColumn: '1 / -1' }}>
              <span>🔍</span>
              <p>{t('events.no_experiences_found')}</p>
              <button onClick={() => setActiveCategory(null)} className="ud-btn-sm">{t('events.show_all_categories')}</button>
            </div>
          )}
        </div>
      )}

      {/* Hidden search trigger button when search is closed */}
      {!showSearch && (
        <button className="ud-search-fab" onClick={() => setSearchFocused(true)} aria-label="Søg">
          <Search size={18} />
        </button>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Scoped CSS — ud- prefix
   ────────────────────────────────────────────── */
const udforskCSS = `
${pageBase("ud")}

.ud-root { position: relative; padding-bottom: 96px; opacity: 1 !important; animation: none !important; }

/* ═══════════════════════════════════════════
   HERO — panoramic cover with glass frame
   ═══════════════════════════════════════════ */
.ud-hero {
  position: relative; width: 100%; height: 190px; overflow: hidden;
  border-radius: 16px; margin: 0 0 14px;
  border: 1px solid rgba(255,255,255,0.12);
}
.ud-hero-img {
  width: 100%; height: 100%; object-fit: cover; object-position: center 40%;
  filter: brightness(0.65);
}
.ud-hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(6,10,15,0.1) 0%, rgba(6,10,15,0.75) 100%);
}
.ud-hero-text {
  position: absolute; bottom: 22px; left: 26px; z-index: 2;
}
.ud-hero-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 44px; font-weight: 400; color: var(--pg-white);
  letter-spacing: -1px; line-height: 1; margin: 0;
  text-shadow: 0 2px 16px rgba(0,0,0,0.6);
}
.ud-hero-sub {
  font-size: 14px; color: var(--teal); font-weight: 500;
  margin: 5px 0 0; font-family: var(--sans);
  text-shadow: 0 1px 8px rgba(0,0,0,0.5);
}

/* ═══════════════════════════════════════════
   FLOATING SEARCH FAB
   ═══════════════════════════════════════════ */
.ud-search-fab {
  position: fixed; bottom: 100px; right: 24px; z-index: 50;
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--teal); color: var(--bg); border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 4px 20px rgba(78,205,196,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.ud-search-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(78,205,196,0.5);
}

/* ═══════════════════════════════════════════
   SEARCH PANEL (overlay when active)
   ═══════════════════════════════════════════ */
.ud-search-wrap { padding: 0 0 16px; }
.ud-search-bar { position: relative; max-width: 640px; margin-bottom: 12px; }
.ud-search-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--pg-white-muted); pointer-events: none; z-index: 1;
}
.ud-search-input {
  width: 100%; padding: 14px 44px 14px 44px;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px; color: var(--pg-white); font-size: 14px;
  font-family: var(--sans); outline: none; transition: all 0.25s;
}
.ud-search-input:focus { border-color: rgba(78,205,196,0.4); }
.ud-search-input::placeholder { color: rgba(255,255,255,0.3); }
.ud-search-clear {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: var(--pg-white-muted); background: none; border: none;
  cursor: pointer; transition: color 0.2s;
}
.ud-search-clear:hover { color: var(--pg-white); }
.ud-search-suggestions, .ud-search-results { max-width: 640px; }
.ud-tag-suggestions { display: flex; flex-wrap: wrap; gap: 8px; }
.ud-result-group { margin-bottom: 20px; }
.ud-result-list { display: flex; flex-direction: column; gap: 8px; }
.ud-result-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 14px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  text-decoration: none; color: var(--pg-white); cursor: pointer; transition: background 0.2s;
}
.ud-result-row:hover { background: rgba(255,255,255,0.1); }
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
   BENTO GRID
   ═══════════════════════════════════════════ */
.ud-bento {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 12px;
  width: 100%;
  max-width: 1100px;
}
.ud-full { grid-column: 1 / -1; }

/* ═══════════════════════════════════════════
   GLASS CARD (shared)
   ═══════════════════════════════════════════ */
.ud-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.ud-card-title {
  display: flex; align-items: center; gap: 6px;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 18px; font-weight: 400; color: var(--pg-white);
  margin: 0 0 14px; letter-spacing: -0.3px;
}
.ud-teal-icon { color: var(--teal); }

/* ═══════════════════════════════════════════
   FEATURED EVENT — inset image + details
   ═══════════════════════════════════════════ */
.ud-feat {
  display: flex; gap: 0; text-decoration: none; color: var(--pg-white);
  cursor: pointer; transition: all 0.35s ease;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 16px;
  overflow: hidden;
}
.ud-feat:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.2);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
/* Inset thumbnail */
.ud-feat-thumb {
  width: 38%; flex-shrink: 0; border-radius: 12px; overflow: hidden;
  aspect-ratio: 4/3;
}
.ud-feat-thumb-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s ease;
}
.ud-feat:hover .ud-feat-thumb-img { transform: scale(1.04); }
/* Info side */
.ud-feat-info {
  display: flex; flex-direction: column; justify-content: center;
  padding: 0 0 0 18px; flex: 1; min-width: 0; gap: 6px;
}
.ud-feat-header {
  display: flex; align-items: center; gap: 8px;
}
.ud-feat-logo {
  width: 24px; height: 24px; border-radius: 6px;
  background: rgba(255,255,255,0.1); color: var(--pg-white);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; font-family: var(--sans);
}
.ud-feat-accent {
  font-size: 10px; color: var(--teal); font-family: monospace; opacity: 0.5;
}
.ud-feat-title {
  font-size: 17px; font-weight: 700; line-height: 1.2; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.ud-feat-rows { display: flex; flex-direction: column; gap: 2px; }
.ud-feat-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 11px; color: var(--pg-white-muted);
}
.ud-feat-highlight { color: var(--teal); font-weight: 600; }
.ud-feat-venue {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: rgba(78,205,196,0.7);
}
/* Platform icons row */
.ud-feat-icons {
  display: flex; align-items: center; gap: 6px; margin-top: 4px;
}
.ud-feat-icon {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: white; font-weight: 700;
  font-family: var(--sans);
}
.ud-feat-icons-label {
  font-size: 11px; color: var(--pg-white-muted); margin-left: 4px;
}

/* ═══════════════════════════════════════════
   RIGHT SIDEBAR STACK
   ═══════════════════════════════════════════ */
.ud-sidebar {
  display: flex; flex-direction: column; gap: 12px;
}

/* ── Trending chips (colored) ── */
.ud-trend-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ud-tchip {
  padding: 5px 12px; border-radius: 100px;
  background: var(--cc);
  border: none;
  color: white;
  font-size: 11px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: var(--sans);
  opacity: 0.85;
}
.ud-tchip:hover { opacity: 1; transform: scale(1.05); }
.ud-tchip.active { opacity: 1; box-shadow: 0 0 12px var(--cc); }

/* ── Friends ── */
.ud-friends-card { padding: 16px 18px; }
.ud-friends {
  display: flex; align-items: center; gap: 8px;
}
.ud-friends-avatars {
  display: flex; flex-shrink: 0;
}
.ud-friends-ava {
  width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(6,10,15,0.8);
  position: relative;
}
.ud-friends-txt {
  font-size: 12px; color: var(--pg-white-dim);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  flex: 1; min-width: 0;
}
.ud-friends-arrow { color: var(--pg-white-muted); flex-shrink: 0; }

/* ═══════════════════════════════════════════
   POPULÆRT — mosaic image grid
   ═══════════════════════════════════════════ */
.ud-pop-mosaic {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 120px 120px;
  gap: 8px;
}
.ud-pop-big {
  grid-row: 1 / 3;
}
.ud-pop-tile {
  position: relative; border-radius: 10px; overflow: hidden;
  display: block; text-decoration: none; color: white; cursor: pointer;
}
.ud-pop-tile img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.4s ease;
}
.ud-pop-tile:hover img { transform: scale(1.06); }
.ud-pop-tile-grad {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%);
}
.ud-pop-tile-name {
  position: absolute; bottom: 8px; left: 8px; right: 8px;
  font-size: 11px; font-weight: 600; line-height: 1.2;
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
}

/* ═══════════════════════════════════════════
   REDAKTØRENS VALG — 2 image tiles with glow
   ═══════════════════════════════════════════ */
.ud-editor {
  border-color: rgba(78,205,196,0.15);
  box-shadow: 0 0 20px rgba(78,205,196,0.06), inset 0 0 20px rgba(78,205,196,0.03);
}
.ud-editor-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.ud-editor-tile {
  position: relative; border-radius: 10px; overflow: hidden;
  height: 140px; display: block; text-decoration: none; color: white; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.08);
}
.ud-editor-tile img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.4s ease;
}
.ud-editor-tile:hover img { transform: scale(1.06); }
.ud-editor-tile-name {
  position: absolute; bottom: 8px; left: 10px; right: 10px;
  font-size: 11px; font-weight: 600; line-height: 1.3;
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
}

/* ═══════════════════════════════════════════
   ACTIVE CATEGORY BAR
   ═══════════════════════════════════════════ */
.ud-active-cat {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-radius: 12px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
}
.ud-active-cat span { font-size: 13px; font-weight: 500; }
.ud-active-cat button {
  font-size: 12px; color: var(--teal); font-weight: 500;
  background: none; border: none; cursor: pointer; font-family: var(--sans);
}

/* ═══════════════════════════════════════════
   SHARED
   ═══════════════════════════════════════════ */
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
   PLACES
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
  padding: 14px; border-radius: 14px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer; transition: all 0.25s; text-decoration: none; color: var(--pg-white);
}
.ud-place-card:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }
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
   CALENDAR CARDS (search)
   ═══════════════════════════════════════════ */
.ud-cal-card {
  display: flex; gap: 12px; padding-right: 14px;
  border-radius: 14px; overflow: hidden;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  text-decoration: none; color: var(--pg-white); cursor: pointer;
  transition: all 0.25s;
}
.ud-cal-card:hover { background: rgba(255,255,255,0.1); }
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
@media (max-width: 860px) {
  .ud-bento {
    grid-template-columns: minmax(0, 1fr);
    max-width: 100%;
  }
  .ud-sidebar { order: -1; }

  /* Featured card — stack on mobile */
  .ud-feat {
    flex-direction: column; padding: 14px;
    min-width: 0; width: 100%;
  }
  .ud-feat-thumb {
    width: 100%; aspect-ratio: 16/9;
    margin-bottom: 12px;
  }
  .ud-feat-info { padding: 0; }
  .ud-feat-title { font-size: 16px; }

  .ud-pop-mosaic {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 130px 130px;
  }
  .ud-pop-big { grid-row: auto; }
  .ud-places-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .ud-hero { height: 140px; border-radius: 14px; }
  .ud-hero-title { font-size: 32px; }
  .ud-hero-text { bottom: 14px; left: 16px; }
  .ud-feat-title { font-size: 15px; }
  .ud-feat-icons { flex-wrap: wrap; }
  .ud-pop-mosaic {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 110px 110px;
  }
  .ud-editor-grid { grid-template-columns: 1fr; }
  .ud-places-grid { grid-template-columns: 1fr; }
  .ud-search-fab { bottom: 80px; right: 16px; }
  .ud-newest-card { min-width: 150px; max-width: 150px; }
  .ud-newest-img-wrap { height: 90px; }
}

/* ═══ NEWEST EVENTS ═══ */
.ud-newest-section { width: 100%; }
.ud-newest-scroll {
  display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px;
  scrollbar-width: none;
}
.ud-newest-scroll::-webkit-scrollbar { display: none; }
.ud-newest-card {
  min-width: 170px; max-width: 170px; border-radius: 14px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  text-decoration: none; color: var(--pg-white); flex-shrink: 0;
  overflow: hidden; transition: transform 0.2s;
}
.ud-newest-card:hover { transform: translateY(-2px); }
.ud-newest-img-wrap { height: 100px; overflow: hidden; }
.ud-newest-img { width: 100%; height: 100%; object-fit: cover; }
.ud-newest-body { padding: 10px 12px; }
.ud-newest-cat { font-size: 10px; color: var(--pg-accent); text-transform: uppercase; letter-spacing: 0.04em; }
.ud-newest-title {
  font-size: 12px; font-weight: 600; margin: 4px 0 5px; line-height: 1.35;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.ud-newest-date { font-size: 10px; color: rgba(255,255,255,0.45); }
`;
