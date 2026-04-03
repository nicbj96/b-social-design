import { useRef, useState } from "react";
import { Link } from "wouter";
import { MapPin, Calendar, Music, Star } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { MinSideSubNav } from "@/components/MinSideSubNav";
import { pageBase } from "@/lib/pageCSSBase";


interface HistoryEvent {
  id: string;
  title: string;
  emoji: string;
  location: string;
  date: string;
  category: string;
  image: string;
  span?: "tall" | "wide";
}

const EVENTS: HistoryEvent[] = [
  { id: "h1", title: "Roskilde Festival '25", emoji: "🎵", location: "Roskilde Dyrskueplads", date: "28 Jun 2025", category: "Musik", image: "/historik/roskilde.jpg", span: "tall" },
  { id: "h2", title: "Gåtur langs havnen", emoji: "🚶", location: "Havnefronten, Aalborg", date: "15 Mar 2026", category: "Sport", image: "/historik/havn.jpg" },
  { id: "h3", title: "Brætspil-aften", emoji: "🎲", location: "Vestbyen, Aalborg", date: "12 Mar 2026", category: "Kultur", image: "/historik/braetspil.jpg" },
  { id: "h4", title: "Fællesspisning", emoji: "🍲", location: "Vestbyen, Aalborg", date: "20 Feb 2026", category: "Mad & Drikke", image: "/historik/spisning.jpg", span: "wide" },
  { id: "h5", title: "Koncert i Royal Arena", emoji: "🎤", location: "København", date: "12 Jan 2026", category: "Musik", image: "/historik/koncert.jpg" },
  { id: "h6", title: "Cykeltur til Nibe", emoji: "🚴", location: "Aalborg → Nibe", date: "08 Feb 2026", category: "Sport", image: "/historik/cykel.jpg", span: "tall" },
  { id: "h7", title: "Julefrokost med venner", emoji: "🎄", location: "Aalborg C", date: "18 Dec 2025", category: "Mad & Drikke", image: "/historik/julefrokost.jpg" },
  { id: "h8", title: "Løbetur i Kildeparken", emoji: "🏃", location: "Kildeparken", date: "05 Jan 2026", category: "Sport", image: "/historik/loeb.jpg" },
  { id: "h9", title: "Nytårsløb 3 km", emoji: "🎆", location: "Kildeparken", date: "31 Dec 2025", category: "Sport", image: "/historik/nytaar.jpg", span: "wide" },
  { id: "h10", title: "Gåtur i Rold Skov", emoji: "🌲", location: "Rold Skov", date: "20 Jan 2026", category: "Rejser", image: "/historik/rold.jpg" },
  { id: "h11", title: "Kaffe og snak", emoji: "☕", location: "Aalborg C", date: "28 Mar 2026", category: "Mad & Drikke", image: "/historik/kaffe.jpg" },
  { id: "h12", title: "Fodbold 5-mands", emoji: "⚽", location: "Kildeparken", date: "22 Mar 2026", category: "Sport", image: "/historik/fodbold.jpg" },
];

const YEARS = ["2024", "2025", "2026"];
const CATEGORIES = ["Musik", "Rejser", "Mad & Drikke", "Kultur", "Sport"];

/* ── Scoped CSS ── */
const historikCSS = `
${pageBase("hi")}

/* ── Header ── */
.hi-header {
  padding: 32px 20px 0;
}
.hi-title {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 400;
  color: var(--pg-white);
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.hi-subtitle {
  font-size: 14px;
  color: var(--teal);
  font-weight: 500;
  margin-top: 4px;
  letter-spacing: 0.5px;
}

/* ── Filters ── */
.hi-filters {
  padding: 20px 20px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.hi-filter-divider {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.1);
  margin: 0 6px;
}
.hi-pill {
  padding: 7px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-family: var(--sans);
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: var(--pg-white-dim);
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}
.hi-pill:hover {
  border-color: rgba(78,205,196,0.4);
  color: var(--pg-white);
}
.hi-pill.active {
  background: var(--teal);
  color: var(--bg);
  border-color: var(--teal);
  font-weight: 600;
}

/* ── Bento grid ── */
.hi-bento {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 180px;
  gap: 12px;
}
.hi-card {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}
.hi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.hi-card.hi-tall {
  grid-row: span 2;
}
.hi-card.hi-wide {
  grid-column: span 2;
}

/* ── Photo card ── */
.hi-card-photo {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background: linear-gradient(135deg, rgba(78,205,196,0.12) 0%, rgba(6,10,15,0.95) 100%);
}
.hi-card-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hi-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(6,10,15,0.88) 0%, rgba(6,10,15,0.1) 50%);
}
.hi-card-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px;
}
.hi-card-title {
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--pg-white);
  line-height: 1.3;
}
.hi-card-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--pg-white-muted);
  margin-top: 3px;
}
.hi-card-date {
  font-size: 11px;
  color: var(--pg-white-muted);
  margin-top: 2px;
}

/* ── Stat mini-card ── */
.hi-mini-stat {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  padding: 16px;
}
.hi-mini-stat-icon {
  color: var(--teal);
  opacity: 0.7;
}
.hi-mini-stat-label {
  font-size: 11px;
  color: var(--pg-white-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.hi-mini-stat-val {
  font-family: var(--serif);
  font-size: 18px;
  color: var(--pg-white);
  line-height: 1.2;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .hi-bento {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 160px;
    gap: 10px;
    padding: 16px;
  }
  .hi-card.hi-wide {
    grid-column: span 2;
  }
  .hi-card.hi-tall {
    grid-row: span 2;
  }
  .hi-header {
    padding: 24px 16px 0;
  }
  .hi-filters {
    padding: 16px 16px 0;
  }
  .hi-title {
    font-size: 28px;
  }
  .hi-filter-divider {
    display: none;
  }
}
`;

export default function Historik() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeYear, setActiveYear] = useState("2026");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filtered = EVENTS.filter((e) => {
    const yearMatch = e.date.includes(activeYear);
    const catMatch = !activeCat || e.category === activeCat;
    return yearMatch && catMatch;
  });

  return (
    <>
      <style>{historikCSS}</style>
      <div
        ref={containerRef}
        className="hi-root"
        data-testid="historik-page"
      >
        {/* Header */}
        <div className="hi-header">
          <h1 className="hi-title">Min Historik</h1>
          <p className="hi-subtitle">Dine minder</p>
        </div>

        <MinSideSubNav />

        {/* Filters */}
        <div className="hi-filters">
          {YEARS.map((y) => (
            <button
              key={y}
              className={`hi-pill${activeYear === y ? " active" : ""}`}
              onClick={() => setActiveYear(y)}
            >
              {y}
            </button>
          ))}
          <div className="hi-filter-divider" />
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`hi-pill${activeCat === c ? " active" : ""}`}
              onClick={() => setActiveCat(activeCat === c ? null : c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        <div className="hi-bento">
          {filtered.map((event, i) => {
            // Insert stat cards at positions 2 and 5
            const items: React.ReactNode[] = [];

            if (i === 2) {
              items.push(
                <div key="stat-first" className="hi-mini-stat">
                  <Calendar size={20} className="hi-mini-stat-icon" />
                  <span className="hi-mini-stat-label">Første event</span>
                  <span className="hi-mini-stat-val">Jan 2024</span>
                </div>
              );
              items.push(
                <div key="stat-fav" className="hi-mini-stat">
                  <Star size={20} className="hi-mini-stat-icon" />
                  <span className="hi-mini-stat-label">Favorit</span>
                  <span className="hi-mini-stat-val">Nordbro</span>
                </div>
              );
            }

            if (i === 5) {
              items.push(
                <div key="stat-loc" className="hi-mini-stat">
                  <MapPin size={20} className="hi-mini-stat-icon" />
                  <span className="hi-mini-stat-label">Mest besøgte</span>
                  <span className="hi-mini-stat-val">Aalborg</span>
                </div>
              );
              items.push(
                <div key="stat-cat" className="hi-mini-stat">
                  <Music size={20} className="hi-mini-stat-icon" />
                  <span className="hi-mini-stat-label">Top kategori</span>
                  <span className="hi-mini-stat-val">Musik</span>
                </div>
              );
            }

            items.push(
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className={`hi-card hi-glass${event.span === "tall" ? " hi-tall" : ""}${event.span === "wide" ? " hi-wide" : ""}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="hi-card-photo">
                  {event.emoji}
                </div>
                <div className="hi-card-overlay" />
                <div className="hi-card-info">
                  <div className="hi-card-title">{event.title}</div>
                  <div className="hi-card-meta">
                    <MapPin size={10} />
                    {event.location}
                  </div>
                  <div className="hi-card-date">{event.date}</div>
                </div>
              </Link>
            );

            return items;
          })}
        </div>
      </div>
    </>
  );
}
