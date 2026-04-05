/**
 * Søg — full-text search across events, places and categories
 * Route: /soeg
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { pageBase } from "@/lib/pageCSSBase";
import {
  Search, X, MapPin, Calendar, Tag, Loader2,
  Clock, ChevronRight, SlidersHorizontal,
} from "lucide-react";

/* ── CSS ──────────────────────────────────────────────────────────────────── */

const css = `
${pageBase("sq")}

/* ── Layout ── */
.sq-root { padding-bottom: 120px; }

/* ── Search bar ── */
.sq-search-wrap {
  position: sticky; top: 0; z-index: 10;
  padding: 16px 20px 12px;
  background: linear-gradient(to bottom, var(--bg) 80%, transparent);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
.sq-search-inner {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 16px;
  background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.1);
  transition: all 0.25s;
}
.sq-search-inner:focus-within {
  background: rgba(255,255,255,0.1);
  border-color: rgba(78,205,196,0.4);
  box-shadow: 0 0 0 3px rgba(78,205,196,0.08);
}
.sq-search-inner svg { color: rgba(255,255,255,0.35); flex-shrink: 0; }
.sq-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 16px; color: rgba(255,255,255,0.9);
  font-family: var(--sans); caret-color: #4ecdc4;
}
.sq-input::placeholder { color: rgba(255,255,255,0.3); }
.sq-clear {
  width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.12);
  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.5); transition: all 0.2s; flex-shrink: 0;
}
.sq-clear:hover { background: rgba(255,255,255,0.2); color: #fff; }
.sq-clear svg { width: 12px; height: 12px; }

/* ── Filter chips ── */
.sq-filters {
  display: flex; gap: 8px; padding: 0 20px 16px;
  overflow-x: auto; scrollbar-width: none;
}
.sq-filters::-webkit-scrollbar { display: none; }
.sq-chip {
  flex-shrink: 0; padding: 6px 14px; border-radius: 20px; border: none;
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
  font-family: var(--sans);
  background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.55);
}
.sq-chip:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }
.sq-chip.active {
  background: rgba(78,205,196,0.15); color: #4ecdc4;
  border: 1px solid rgba(78,205,196,0.25);
  box-shadow: 0 0 8px rgba(78,205,196,0.12);
}

/* ── Section header ── */
.sq-section {
  padding: 0 20px; margin-bottom: 10px;
}
.sq-section-title {
  font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35);
  text-transform: uppercase; letter-spacing: 2px; margin: 0;
}

/* ── Result card ── */
.sq-result {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 20px; cursor: pointer; transition: background 0.2s;
  text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sq-result:hover { background: rgba(255,255,255,0.04); }
.sq-result:last-child { border-bottom: none; }
.sq-thumb {
  width: 52px; height: 52px; border-radius: 14px; object-fit: cover;
  background: rgba(78,205,196,0.1); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(78,205,196,0.12);
}
.sq-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 14px; }
.sq-thumb svg { color: rgba(78,205,196,0.5); }
.sq-info { flex: 1; min-width: 0; }
.sq-name {
  font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.9);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin: 0 0 4px;
}
.sq-meta {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: rgba(255,255,255,0.35);
}
.sq-meta svg { width: 11px; height: 11px; }
.sq-badge {
  flex-shrink: 0; font-size: 11px; padding: 3px 8px; border-radius: 6px;
}
.sq-badge-event {
  background: rgba(78,205,196,0.1); color: #4ecdc4; border: 1px solid rgba(78,205,196,0.2);
}
.sq-badge-place {
  background: rgba(147,197,253,0.1); color: #93c5fd; border: 1px solid rgba(147,197,253,0.2);
}
.sq-chevron { color: rgba(255,255,255,0.2); flex-shrink: 0; }

/* ── States ── */
.sq-loading {
  display: flex; align-items: center; gap: 10px; padding: 40px 20px;
  font-size: 14px; color: rgba(255,255,255,0.35); justify-content: center;
}
.sq-loading svg { animation: sqSpin 1s linear infinite; }
@keyframes sqSpin { to { transform: rotate(360deg); } }
.sq-empty {
  text-align: center; padding: 60px 20px 20px;
  font-size: 15px; color: rgba(255,255,255,0.2);
}
.sq-empty-sub {
  font-size: 13px; color: rgba(255,255,255,0.15); margin-top: 6px;
}

/* ── Recent searches ── */
.sq-recents {
  padding: 0 20px;
}
.sq-recents-title {
  font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3);
  text-transform: uppercase; letter-spacing: 2px;
  margin: 0 0 12px; display: flex; align-items: center; justify-content: space-between;
}
.sq-recents-clear {
  font-size: 11px; color: rgba(78,205,196,0.7); background: none; border: none;
  cursor: pointer; font-family: var(--sans); padding: 0; font-weight: 500;
}
.sq-recents-clear:hover { color: #4ecdc4; }
.sq-recent-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  cursor: pointer; transition: opacity 0.2s;
}
.sq-recent-item:hover { opacity: 0.8; }
.sq-recent-item svg { color: rgba(255,255,255,0.2); flex-shrink: 0; }
.sq-recent-text { font-size: 14px; color: rgba(255,255,255,0.55); flex: 1; }
`;

/* ── Types ───────────────────────────────────────────────────────────────── */

type Filter = 'alle' | 'events' | 'steder';

interface EventResult {
  id: string;
  title: string;
  date?: string;
  location?: string;
  image_url?: string;
  tags?: string[];
}

interface PlaceResult {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  category?: string;
}

type Result =
  | { kind: 'event'; data: EventResult }
  | { kind: 'place'; data: PlaceResult };

const MAX_RECENT = 6;
const STORAGE_KEY = 'bsocial_recent_searches';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecent(terms: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(terms.slice(0, MAX_RECENT)));
  } catch {}
}

function pushRecent(term: string) {
  const terms = [term, ...loadRecent().filter((t) => t !== term)];
  saveRecent(terms);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric', month: 'short' });
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function Soeg() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('alle');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [, setLocation] = useLocation();

  // ── Search ──────────────────────────────────────────────────────────────
  const doSearch = useCallback(async (q: string, f: Filter) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setLoading(true);

    const pattern = `%${trimmed}%`;
    const out: Result[] = [];

    // Events
    if (f === 'alle' || f === 'events') {
      const { data } = await supabase
        .from('events')
        .select('id, title, date, location, image_url, tags')
        .or(`title.ilike.${pattern},description.ilike.${pattern},location.ilike.${pattern}`)
        .order('date', { ascending: true })
        .limit(20);

      if (data) {
        out.push(...data.map((d) => ({ kind: 'event' as const, data: d as EventResult })));
      }
    }

    // Places
    if (f === 'alle' || f === 'steder') {
      const { data } = await supabase
        .from('places')
        .select('id, name, description, image_url, category')
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(20);

      if (data) {
        out.push(...data.map((d) => ({ kind: 'place' as const, data: d as PlaceResult })));
      }
    }

    setResults(out);
    setLoading(false);
  }, []);

  // ── Debounce query changes ──────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => doSearch(query, filter), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, filter, doSearch]);

  // ── Focus on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Save recent on result click ────────────────────────────────────────
  const handleResultClick = (path: string) => {
    if (query.trim()) {
      pushRecent(query.trim());
      setRecent(loadRecent());
    }
    setLocation(path);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const clearRecent = () => {
    saveRecent([]);
    setRecent([]);
  };

  const showRecent = !query && recent.length > 0;
  const showEmpty = query && !loading && results.length === 0;

  return (
    <>
      <style>{css}</style>
      <div className="sq-root">

        {/* ── Search bar ── */}
        <div className="sq-search-wrap">
          <div className="sq-search-inner">
            <Search size={18} />
            <input
              ref={inputRef}
              className="sq-input"
              type="search"
              placeholder="Søg efter events, steder…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {query && (
              <button className="sq-clear" onClick={() => setQuery('')} aria-label="Ryd søgning">
                <X />
              </button>
            )}
          </div>
        </div>

        {/* ── Filter chips ── */}
        <div className="sq-filters">
          {(['alle', 'events', 'steder'] as Filter[]).map((f) => (
            <button
              key={f}
              className={`sq-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'alle' ? 'Alle' : f === 'events' ? 'Events' : 'Steder'}
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="sq-loading">
            <Loader2 size={18} />
            Søger…
          </div>
        )}

        {/* ── Results ── */}
        {!loading && results.length > 0 && (
          <>
            {/* Events */}
            {results.some((r) => r.kind === 'event') && (
              <>
                {(filter === 'alle') && (
                  <div className="sq-section"><p className="sq-section-title">Events</p></div>
                )}
                {results
                  .filter((r) => r.kind === 'event')
                  .map((r) => {
                    const ev = r.data as EventResult;
                    return (
                      <div
                        key={`ev-${ev.id}`}
                        className="sq-result"
                        onClick={() => handleResultClick(`/event/${ev.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleResultClick(`/event/${ev.id}`)}
                      >
                        <div className="sq-thumb">
                          {ev.image_url
                            ? <img src={ev.image_url} alt="" loading="lazy" />
                            : <Calendar size={20} />}
                        </div>
                        <div className="sq-info">
                          <p className="sq-name">{ev.title}</p>
                          <div className="sq-meta">
                            {ev.date && <><Clock size={11} />{formatDate(ev.date)}</>}
                            {ev.location && (
                              <><MapPin size={11} />
                              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ev.location}
                              </span></>
                            )}
                          </div>
                        </div>
                        <span className="sq-badge sq-badge-event">Event</span>
                        <ChevronRight size={14} className="sq-chevron" />
                      </div>
                    );
                  })}
              </>
            )}

            {/* Places */}
            {results.some((r) => r.kind === 'place') && (
              <>
                {filter === 'alle' && (
                  <div className="sq-section" style={{ marginTop: 16 }}>
                    <p className="sq-section-title">Steder</p>
                  </div>
                )}
                {results
                  .filter((r) => r.kind === 'place')
                  .map((r) => {
                    const pl = r.data as PlaceResult;
                    return (
                      <div
                        key={`pl-${pl.id}`}
                        className="sq-result"
                        onClick={() => handleResultClick(`/sted/${pl.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleResultClick(`/sted/${pl.id}`)}
                      >
                        <div className="sq-thumb">
                          {pl.image_url
                            ? <img src={pl.image_url} alt="" loading="lazy" />
                            : <MapPin size={20} />}
                        </div>
                        <div className="sq-info">
                          <p className="sq-name">{pl.name}</p>
                          <div className="sq-meta">
                            {pl.category && <><Tag size={11} />{pl.category}</>}
                          </div>
                        </div>
                        <span className="sq-badge sq-badge-place">Sted</span>
                        <ChevronRight size={14} className="sq-chevron" />
                      </div>
                    );
                  })}
              </>
            )}
          </>
        )}

        {/* ── Empty state ── */}
        {showEmpty && (
          <div className="sq-empty">
            <Search size={40} style={{ color: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
            <p>Ingen resultater for "{query}"</p>
            <p className="sq-empty-sub">Prøv et andet søgeord</p>
          </div>
        )}

        {/* ── Recent searches ── */}
        {showRecent && (
          <div className="sq-recents">
            <p className="sq-recents-title">
              Seneste søgninger
              <button className="sq-recents-clear" onClick={clearRecent}>Ryd</button>
            </p>
            {recent.map((term) => (
              <div
                key={term}
                className="sq-recent-item"
                onClick={() => handleRecentClick(term)}
              >
                <Clock size={14} />
                <span className="sq-recent-text">{term}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Default state — no query, no recent ── */}
        {!query && !showRecent && (
          <div className="sq-empty">
            <Search size={48} style={{ color: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
            <p>Søg efter events og steder</p>
            <p className="sq-empty-sub">Start med at skrive noget…</p>
          </div>
        )}

      </div>
    </>
  );
}
