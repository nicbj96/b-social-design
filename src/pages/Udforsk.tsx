import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Search, MapPin, Compass, Flame, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { mockEvents, mockPlaces, mockL1Categories, mockPopularTags } from '../mock/data';
import { getEventImage, formatDanishDate } from '../lib/mockHelpers';

/* ══════════════════════════════════════════════════════
   UDFORSK — Redesign v2
   Bento grid · Hero søgning · Visual kategorier · Trending
   ══════════════════════════════════════════════════════ */

const BG = '#07080a';
const ACCENT = '#4ECDC4';
const ACCENT_DIM = 'rgba(78,205,196,0.12)';
const ACCENT_BORDER = 'rgba(78,205,196,0.22)';

const CAT_IMG: Record<string, string> = {
  natur:   'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&auto=format&fit=crop&fm=webp&q=80',
  outdoor: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&auto=format&fit=crop&fm=webp&q=80',
  musik:   'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop&fm=webp&q=80',
  mad:     'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&auto=format&fit=crop&fm=webp&q=80',
  sport:   'https://images.unsplash.com/photo-1461896836934-bd45ba3ff2b3?w=300&auto=format&fit=crop&fm=webp&q=80',
  kultur:  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=300&auto=format&fit=crop&fm=webp&q=80',
  wellness:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&auto=format&fit=crop&fm=webp&q=80',
  gaming:  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop&fm=webp&q=80',
  tech:    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&fm=webp&q=80',
  film:    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&auto=format&fit=crop&fm=webp&q=80',
  rejser:  'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=300&auto=format&fit=crop&fm=webp&q=80',
};
const CAT_FALLBACK = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&auto=format&fit=crop&fm=webp&q=80';

function getCatImg(slug: string) {
  const s = slug.toLowerCase();
  for (const [k, v] of Object.entries(CAT_IMG)) { if (s.includes(k)) return v; }
  return CAT_FALLBACK;
}

type ContentItem = {
  type: 'event' | 'place';
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  date?: string;
  rating?: number;
  emoji: string;
  linkTo: string;
};

export default function Udforsk() {
  const [activeL1s, setActiveL1s] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = useMemo<ContentItem[]>(() => {
    const items: ContentItem[] = [];
    const q = searchQuery.toLowerCase();
    const evts = activeL1s.length > 0
      ? mockEvents.filter(e => activeL1s.includes(e.category))
      : mockEvents;
    const plcs = activeL1s.length > 0
      ? mockPlaces.filter(p => activeL1s.some(a => p.main_categories.includes(a)))
      : mockPlaces;

    evts
      .filter(e => !q || e.title.toLowerCase().includes(q))
      .forEach(e => items.push({
        type: 'event', id: e.id, title: e.title, subtitle: e.location,
        imageUrl: getEventImage(e), date: e.date,
        emoji: mockL1Categories.find(c => c.slug === e.category)?.emoji || '🏷️',
        linkTo: `/event/${e.id}`,
      }));
    plcs
      .filter(p => !q || p.name.toLowerCase().includes(q))
      .forEach(p => items.push({
        type: 'place', id: p.id, title: p.name, subtitle: p.city,
        imageUrl: getCatImg(p.main_categories[0] || ''), rating: p.rating_avg,
        emoji: mockL1Categories.find(c => c.slug === p.main_categories[0])?.emoji || '🏷️',
        linkTo: `/sted/${p.id}`,
      }));
    return items;
  }, [activeL1s, searchQuery]);

  const toggleL1 = (s: string) => setActiveL1s(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const clearAll = () => { setActiveL1s([]); setSearchQuery(''); };

  const showDefault = activeL1s.length === 0 && !searchQuery;
  const featured = filtered.slice(0, 1);
  const rest = filtered.slice(1);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', paddingBottom: 96 }}>

      {/* ── STICKY HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `rgba(7,8,10,0.82)`,
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '14px 16px 0' }}>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 10, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={15} color={ACCENT} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f5fffe', letterSpacing: '-0.4px', margin: 0, fontFamily: "'Instrument Serif', Georgia, serif" }}>Udforsk</h1>
            </div>
            <button style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <SlidersHorizontal size={15} color='rgba(255,255,255,0.5)' />
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: searchFocused ? ACCENT : 'rgba(255,255,255,0.2)', pointerEvents: 'none', transition: 'color 0.2s' }} />
            <input
              type="text"
              placeholder="Søg events, steder, oplevelser..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', padding: '11px 16px 11px 40px', borderRadius: 14,
                background: searchFocused ? 'rgba(78,205,196,0.07)' : 'rgba(255,255,255,0.05)',
                border: searchFocused ? `1px solid ${ACCENT_BORDER}` : '1px solid rgba(255,255,255,0.07)',
                color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                transition: 'all 0.25s',
              } as React.CSSProperties}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>✕</button>
            )}
          </div>

          {/* Category scroll */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 14, scrollbarWidth: 'none' } as React.CSSProperties}>
            <CatChip label="Alle" emoji="✨" isActive={activeL1s.length === 0} onClick={clearAll} />
            {mockL1Categories.map(c => (
              <CatChip key={c.slug} label={c.name} emoji={c.emoji} isActive={activeL1s.includes(c.slug)} onClick={() => toggleL1(c.slug)} />
            ))}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 0' }}>

        {filtered.length === 0 ? (
          <EmptyState query={searchQuery} onClear={clearAll} />
        ) : (
          <>
            {/* Active filter label */}
            {(activeL1s.length > 0 || searchQuery) && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                  {filtered.length} resultater{activeL1s.length > 0 ? ` · ${activeL1s.length} kategori${activeL1s.length > 1 ? 'er' : ''}` : ''}
                </p>
                <button onClick={clearAll} style={{ fontSize: 11, color: ACCENT, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 999, padding: '3px 10px', cursor: 'pointer' }}>Ryd alt</button>
              </div>
            )}

            {/* Featured hero card */}
            {featured.map(item => <HeroCard key={item.id} item={item} />)}

            {/* Bento grid */}
            {rest.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                {rest.map((item, i) => (
                  <GridCard key={`${item.type}-${item.id}`} item={item} wide={(i + 1) % 5 === 0} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── DEFAULT SECTIONS ── */}
        {showDefault && (
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 32 }}>
            <TrendingSection />
            <MapBanner />
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── CatChip ─── */
function CatChip({ label, emoji, isActive, onClick }: { label: string; emoji: string; isActive: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '6px 12px',
      borderRadius: 999,
      background: isActive ? ACCENT_DIM : 'rgba(255,255,255,0.04)',
      border: isActive ? `1.5px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.08)',
      color: isActive ? ACCENT : 'rgba(255,255,255,0.55)',
      fontSize: 12, fontWeight: isActive ? 700 : 500,
      cursor: 'pointer',
      transition: 'all 0.18s',
      whiteSpace: 'nowrap',
    } as React.CSSProperties}>
      <span style={{ fontSize: 13 }}>{emoji}</span>
      {label}
    </button>
  );
}

/* ─── HeroCard ─── */
function HeroCard({ item }: { item: ContentItem }) {
  return (
    <Link to={item.linkTo} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        position: 'relative', height: 260, borderRadius: 22, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        cursor: 'pointer',
      }}>
        <img src={item.imageUrl} alt={item.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,8,10,0.97) 0%, rgba(7,8,10,0.5) 45%, rgba(7,8,10,0.05) 100%)' }} />
        {/* type pill */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(7,8,10,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {item.type === 'event' ? 'Event' : 'Sted'}
          </span>
        </div>
        {/* emoji badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 11, background: 'rgba(7,8,10,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{item.emoji}</div>
        {/* content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '22px 20px' }}>
          {item.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
              <p style={{ fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{formatDanishDate(item.date)}</p>
            </div>
          )}
          {item.rating != null && item.rating > 0 && (
            <p style={{ fontSize: 11, color: '#FECA57', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 3 }}>⭐ {item.rating.toFixed(1)}</p>
          )}
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f5fffe', lineHeight: 1.2, margin: '0 0 6px', letterSpacing: '-0.3px' }}>{item.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
              <MapPin size={11} />{item.subtitle}
            </p>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={14} color={ACCENT} />
            </div>
          </div>
        </div>
        {/* accent line */}
        <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
      </div>
    </Link>
  );
}

/* ─── GridCard ─── */
function GridCard({ item, wide }: { item: ContentItem; wide?: boolean }) {
  return (
    <Link to={item.linkTo} style={{ textDecoration: 'none', gridColumn: wide ? '1 / -1' : undefined }}>
      <div style={{
        position: 'relative', height: wide ? 160 : 180, borderRadius: 18, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        transition: 'transform 0.22s cubic-bezier(0.16,1,0.3,1)',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.025)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
      >
        <img src={item.imageUrl} alt={item.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,8,10,0.96) 0%, rgba(7,8,10,0.3) 55%, transparent 100%)' }} />
        {/* emoji */}
        <div style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 9, background: 'rgba(7,8,10,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{item.emoji}</div>
        {/* content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 14px' }}>
          {item.date && (
            <p style={{ fontSize: 9, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>{formatDanishDate(item.date)}</p>
          )}
          {item.rating != null && item.rating > 0 && (
            <p style={{ fontSize: 9, color: '#FECA57', margin: '0 0 2px' }}>⭐ {item.rating.toFixed(1)}</p>
          )}
          <h3 style={{ fontSize: wide ? 16 : 13, fontWeight: 700, color: '#f5fffe', lineHeight: 1.25, margin: '0 0 3px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>{item.title}</h3>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', display: 'flex', alignItems: 'center', gap: 3, margin: 0 }}><MapPin size={8} />{item.subtitle}</p>
        </div>
      </div>
    </Link>
  );
}

/* ─── TrendingSection ─── */
function TrendingSection() {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <Flame size={14} color='#FF6B6B' />
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Trending nu</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {mockPopularTags.map(t => (
          <button key={t.slug} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 13px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            fontSize: 12, color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', transition: 'all 0.18s',
          } as React.CSSProperties}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = ACCENT_DIM; (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT_BORDER; (e.currentTarget as HTMLButtonElement).style.color = ACCENT; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; }}
          >
            <span style={{ fontSize: 14 }}>{t.emoji}</span>{t.name}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─── MapBanner ─── */
function MapBanner() {
  return (
    <Link to="/kort" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        position: 'relative', height: 120, borderRadius: 20, overflow: 'hidden',
        border: `1px solid ${ACCENT_BORDER}`,
        boxShadow: '0 4px 28px rgba(0,0,0,0.35)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.01)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
      >
        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&fm=webp&q=80" alt="Kort" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(7,8,10,0.88) 0%, rgba(7,8,10,0.5) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <MapPin size={13} color={ACCENT} />
              <p style={{ fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Kort</p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#f5fffe', margin: '0 0 3px', letterSpacing: '-0.2px' }}>Udforsk nær dig</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Se events og steder på kortet</p>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ChevronRight size={16} color={ACCENT} />
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 1.5, background: `linear-gradient(90deg, transparent, ${ACCENT}55, transparent)` }} />
      </div>
    </Link>
  );
}

/* ─── EmptyState ─── */
function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', marginTop: 8 }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px' }}>Ingen resultater</p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: '0 0 20px' }}>{query ? `Ingen match for "${query}"` : 'Prøv en anden kategori'}</p>
      <button onClick={onClear} style={{ padding: '9px 20px', borderRadius: 12, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Ryd filter</button>
    </div>
  );
}
