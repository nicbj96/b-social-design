import { useState, useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Settings, Flame, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTags } from "@/context/TagContext";
import { useEventsByTag, usePopularTags, usePlacesByTag } from "@/hooks/useTagData";
import { FeedTagEditor } from "@/components/FeedTagEditor";
// TagPill and TagRow intentionally removed — tags are background logic, not foreground UI
import { getEventImage, formatDanishDate } from "@/lib/eventHelpers";
import { getTagNode, getOverkategoriForTag } from "@/lib/tagEngine";

export default function Feed() {
  const { profile } = useAuth();
  const { selectedTags, setSelectedTags, getSelectedOverkategorier } = useTags();
  // Set page meta tags
  usePageMeta({ title: "Feed", description: "Dit personlige feed af events og oplevelser baseret på dine interesser." });
  const [tagEditorOpen, setTagEditorOpen] = useState(false);

  // Get unique L1 categories from selected tags
  const selectedOverkategorier = useMemo(() => {
    return getSelectedOverkategorier();
  }, [getSelectedOverkategorier]);

  // Resolve overkategori info (name, emoji, slug)
  const overkategorierInfo = useMemo(() => {
    return selectedOverkategorier
      .map(slug => {
        const node = getTagNode(slug);
        return {
          slug,
          name: node?.label || slug,
          emoji: node?.emoji || "🏷️",
        };
      })
      .filter(Boolean);
  }, [selectedOverkategorier]);

  return (
    <div className="min-h-screen text-white pb-20" style={{ background: "#060a0f" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-lg border-b border-white/[0.06]" style={{ background: "rgba(6,10,15,0.85)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Instrument Serif', Georgia, serif", letterSpacing: "-0.3px", color: "#f0fffe" }}>Dit Feed</h1>
          <button
            onClick={() => setTagEditorOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Open feed settings"
          >
            <Settings size={24} className="text-teal-400" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">

        {/* Subtle interests bar — just one line, no pill wall */}
        {selectedTags.length === 0 ? (
          <div style={{
            background: "linear-gradient(135deg, rgba(78,205,196,0.08), rgba(78,205,196,0.04))",
            border: "1px solid rgba(78,205,196,0.2)",
            borderRadius: "16px", padding: "24px", textAlign: "center",
          }}>
            <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: "14px", fontSize: "15px" }}>
              Tilpas dit feed med dine interesser
            </p>
            <button
              onClick={() => setTagEditorOpen(true)}
              style={{
                padding: "10px 24px", background: "rgba(78,205,196,0.15)",
                border: "1px solid rgba(78,205,196,0.35)", borderRadius: "10px",
                color: "#4ECDC4", fontWeight: 600, fontSize: "14px", cursor: "pointer",
              }}
            >
              Vælg interesser →
            </button>
          </div>
        ) : (
          /* Single subtle line — no pill wall */
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              {overkategorierInfo.map(c => c.emoji + " " + c.name).join("  ·  ")}
            </p>
            <button
              onClick={() => setTagEditorOpen(true)}
              style={{ fontSize: "12px", color: "rgba(78,205,196,0.7)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Rediger →
            </button>
          </div>
        )}

        {/* Event sections — the actual content */}
        {selectedTags.length > 0 && (
          <div className="space-y-10">
            {overkategorierInfo.map((category) => (
              <FeedSection
                key={category.slug}
                slug={category.slug}
                name={category.name}
                emoji={category.emoji}
              />
            ))}
          </div>
        )}

        {/* Trending */}
        <TrendingTagsSection />

        {/* Places */}
        {selectedTags.length > 0 && <PlacesSection firstTag={selectedTags[0]} />}
      </div>

      {/* Tag Editor Modal */}
      <FeedTagEditor open={tagEditorOpen} onClose={() => setTagEditorOpen(false)} />
    </div>
  );
}

/**
 * FeedSection: Renders events for a single overkategori
 */
function FeedSection({
  slug,
  name,
  emoji,
}: {
  slug: string;
  name: string;
  emoji: string;
}) {
  const { data: events = [], isLoading, error } = useEventsByTag(slug, {
    limit: 6,
    descendants: true,
  });

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          {name}
        </h2>
        <Link
          to={`/kategori/${slug}`}
          className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors flex items-center gap-1"
        >
          Se alle <span>→</span>
        </Link>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        // Skeleton Loading State
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-64 bg-white/5 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        // Error State
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center text-red-400 text-sm">
          Kunne ikke indlæse events
        </div>
      ) : events.length === 0 ? (
        // Empty State
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <p className="text-white/60 mb-3">Ingen events fundet</p>
          <Link
            to={`/kategori/${slug}`}
            className="inline-block text-teal-400 hover:text-teal-300 font-medium transition-colors"
          >
            Besøg kategori →
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * EventCard: Renders a single event in the feed
 */
function EventCard({
  event,
}: {
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    image_url?: string | null;
    category?: string;
    interest_tags?: string[] | null;
  };
}) {
  const imageUrl = getEventImage(event);

  // Build tag array for TagRow
  const tagArray = useMemo(() => {
    const tags = [];
    if (event.category) {
      const node = getTagNode(event.category);
      tags.push({
        slug: event.category,
        name: node?.label || event.category,
        emoji: node?.emoji,
        level: node ? 2 : 3,
      });
    }
    return tags;
  }, [event.category]);

  return (
    <Link to={`/event/${event.id}`} style={{ flexShrink: 0 }}>
      <div style={{
        flexShrink: 0, width: "200px", borderRadius: "16px", overflow: "hidden",
        background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer", transition: "transform 0.18s, box-shadow 0.18s", snapAlign: "start",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(78,205,196,0.15)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
        }}
      >
        <div style={{ position: "relative", height: "230px", background: "rgba(78,205,196,0.06)" }}>
          {imageUrl && (
            <img src={imageUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,10,15,0.95) 0%, rgba(6,10,15,0.5) 50%, rgba(0,0,0,0.05) 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 12px 12px" }}>
            <h3 style={{ fontWeight: 600, fontSize: "13px", color: "#fff", lineHeight: 1.35, marginBottom: "5px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {event.title}
            </h3>
            <p style={{ fontSize: "11px", color: "#4ECDC4", fontWeight: 600 }}>{formatDanishDate(event.date)}</p>
            {event.location && (
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.location}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * TrendingTagsSection: Shows popular tags as clickable pills
 */
function TrendingTagsSection() {
  const { data: trendingTags = [], isLoading } = usePopularTags(12);

  if (isLoading || trendingTags.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f0fffe", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        🔥 Populære kategorier
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {trendingTags.map((t) => (
          <Link key={t.slug} to={`/kategori/${t.slug}`}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "6px 12px", borderRadius: "8px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "13px", color: "rgba(255,255,255,0.6)", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(78,205,196,0.3)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              {t.emoji && <span>{t.emoji}</span>}
              <span>{t.name}</span>
              <span style={{ color: "rgba(78,205,196,0.6)", fontSize: "11px" }}>
                {(t.total_count || 0).toLocaleString("da-DK")}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * PlacesSection: Shows nearby places for the user's first selected tag
 */
function PlacesSection({ firstTag }: { firstTag: string }) {
  const { data: places = [], isLoading } = usePlacesByTag(firstTag, {
    limit: 6,
    descendants: true,
  });

  if (isLoading || places.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-xl">📍</span>
        Steder nær dig
      </h2>

      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
        {places.map((place) => (
          <Link key={place.id} to={`/sted/${place.id}`} style={{ flexShrink: 0 }}>
            <div style={{
              width: "180px", borderRadius: "16px", padding: "16px",
              background: "linear-gradient(135deg, rgba(78,205,196,0.08), rgba(6,10,15,0.9))",
              border: "1px solid rgba(78,205,196,0.18)",
              cursor: "pointer", transition: "transform 0.18s",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "9px", background: "rgba(78,205,196,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                <MapPin size={16} color="#4ECDC4" />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: "13px", color: "#f0fffe", lineHeight: 1.3, marginBottom: "5px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {place.name}
              </h3>
              {place.city && (
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{place.city}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
