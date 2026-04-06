import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Search, MapPin } from 'lucide-react';
import { mockEvents, mockPlaces, mockL1Categories, mockPopularTags } from '../mock/data';
import { getEventImage, formatDanishDate } from '../lib/mockHelpers';

/* ══════════════════════════════════════════════════════
   UDFORSK — Design workspace version med mock-data
   ══════════════════════════════════════════════════════ */

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

type ContentItem = { type: 'event'|'place'; id: string; title: string; subtitle: string; imageUrl: string; date?: string; rating?: number; emoji: string; linkTo: string; };

export default function Udforsk() {
  const [activeL1s, setActiveL1s] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo<ContentItem[]>(() => {
    const items: ContentItem[] = [];
    const evts = activeL1s.length > 0
      ? mockEvents.filter(e => activeL1s.includes(e.category))
      : mockEvents;
    const plcs = activeL1s.length > 0
      ? mockPlaces.filter(p => activeL1s.some(a => p.main_categories.includes(a)))
      : mockPlaces;
    evts.forEach(e => items.push({ type: 'event', id: e.id, title: e.title, subtitle: e.location, imageUrl: getEventImage(e), date: e.date, emoji: mockL1Categories.find(c => c.slug === e.category)?.emoji || '🏷️', linkTo: `/event/${e.id}` }));
    plcs.forEach(p => items.push({ type: 'place', id: p.id, title: p.name, subtitle: p.city, imageUrl: getCatImg(p.main_categories[0] || ''), rating: p.rating_avg, emoji: mockL1Categories.find(c => c.slug === p.main_categories[0])?.emoji || '🏷️', linkTo: `/sted/${p.id}` }));
    return items;
  }, [activeL1s]);

  const toggleL1 = (s: string) => setActiveL1s(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const clearAll = () => setActiveL1s([]);

  return (
    <div className="min-h-screen text-white pb-24" style={{ background: '#050a0f' }}>

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40" style={{ background: 'rgba(5,10,15,0.85)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderBottom: '1px solid rgba(78,205,196,0.07)' }}>
        <div className="max-w-6xl mx-auto px-5 pt-5 pb-4">
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, fontWeight: 700, color: '#f0fffe', letterSpacing: '-0.5px', margin: '0 0 14px' }}>Udforsk</h1>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Søg oplevelser..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Category chips */}
          {activeL1s.length > 0 && (
            <button onClick={clearAll} style={{ marginBottom: 8, padding: '4px 10px', borderRadius: 999, background: 'rgba(78,205,196,0.12)', border: '1px solid rgba(78,205,196,0.35)', color: '#4ECDC4', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              ✕ Ryd ({activeL1s.length})
            </button>
          )}
          <div className="scrollbar-hide" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 } as React.CSSProperties}>
            <PhotoChip label="Alle" emoji="✨" imgUrl={CAT_FALLBACK} isActive={activeL1s.length === 0} onClick={clearAll} />
            {mockL1Categories.map(c => (
              <PhotoChip key={c.slug} label={c.name} emoji={c.emoji} imgUrl={getCatImg(c.slug)} isActive={activeL1s.includes(c.slug)} onClick={() => toggleL1(c.slug)} />
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-6xl mx-auto px-5 py-5">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: 40, marginBottom: 10 }}>🔍</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Ingen oplevelser fundet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filtered.map((item, i) => <PhotoCard key={`${item.type}-${item.id}`} item={item} tall={i === 0} />)}
          </div>
        )}

        {activeL1s.length === 0 && (
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 28 }}>
            <TrendSec />
            <MapCta />
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoChip({ label, emoji, imgUrl, isActive, onClick }: { label: string; emoji: string; imgUrl: string; isActive: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ flexShrink: 0, position: 'relative', width: 88, height: 68, borderRadius: 16, overflow: 'hidden', border: isActive ? '2px solid #4ECDC4' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 0, transition: 'all 0.2s', boxShadow: isActive ? '0 0 20px rgba(78,205,196,0.35)' : '0 2px 12px rgba(0,0,0,0.3)' } as React.CSSProperties}>
      <img src={imgUrl} alt={label} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: isActive ? 'linear-gradient(to top, rgba(5,10,15,0.88), rgba(5,10,15,0.25))' : 'linear-gradient(to top, rgba(5,10,15,0.82), rgba(5,10,15,0.2))' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 6px 7px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: isActive ? '#4ECDC4' : 'rgba(255,255,255,0.85)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
      </div>
      {isActive && <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg, transparent, #4ECDC4, transparent)' }} />}
    </button>
  );
}

function PhotoCard({ item, tall }: { item: ContentItem; tall?: boolean }) {
  const height = tall ? 260 : 200;
  return (
    <Link to={item.linkTo} style={{ textDecoration: 'none', gridColumn: tall ? '1 / -1' : undefined }}>
      <div style={{ position: 'relative', height, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 4px 28px rgba(0,0,0,0.4)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <img src={item.imageUrl} alt={item.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,10,15,0.96) 0%, rgba(5,10,15,0.4) 50%, rgba(0,0,0,0.05) 100%)' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: 'rgba(5,10,15,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{item.emoji}</div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: tall ? '20px 18px' : '14px 14px', zIndex: 2 }}>
          {item.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4ECDC4', boxShadow: '0 0 6px rgba(78,205,196,0.5)' }} />
              <p style={{ fontSize: 10, fontWeight: 700, color: '#4ECDC4', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{formatDanishDate(item.date)}</p>
            </div>
          )}
          {item.rating != null && item.rating > 0 && <p style={{ fontSize: 10, color: '#FECA57', margin: '0 0 3px' }}>⭐ {item.rating.toFixed(1)}</p>}
          <h3 style={{ fontSize: tall ? 18 : 14, fontWeight: 700, color: '#f0fffe', lineHeight: 1.25, margin: '0 0 3px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>{item.title}</h3>
          {item.subtitle && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 3, margin: 0 }}><MapPin size={9} /> {item.subtitle}</p>}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2, background: 'linear-gradient(90deg, transparent, #4ECDC4, transparent)', zIndex: 3 }} />
      </div>
    </Link>
  );
}

function TrendSec() {
  return (
    <section>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', margin: '0 0 10px' }}>🔥 Populære</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {mockPopularTags.map(t => (
          <span key={t.slug} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
            {t.emoji} {t.name}
          </span>
        ))}
      </div>
    </section>
  );
}

function MapCta() {
  return (
    <div style={{ position: 'relative', height: 110, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(78,205,196,0.12)', cursor: 'pointer', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
      <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&fm=webp&q=80" alt="Kort" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(5,10,15,0.85) 0%, rgba(5,10,15,0.55) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 2, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#4ECDC4', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>📍 Kort</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f0fffe', margin: 0 }}>Udforsk på kortet</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>Se steder og events omkring dig</p>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>→</div>
      </div>
    </div>
  );
}
