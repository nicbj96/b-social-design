import { useState, useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Settings, Flame, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTags } from "@/context/TagContext";
import { useEventsByTag, usePopularTags, usePlacesByTag } from "@/hooks/useTagData";
import { FeedTagEditor } from "@/components/FeedTagEditor";
import TagPill from "@/components/TagPill";
import TagRow from "@/components/TagRow";
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
        {/* Selected Tags Bar */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Dine Interesser
          </h2>
          {selectedTags.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-white/60 mb-3">Vælg dine interesser for at se personaliserede events</p>
              <button
                onClick={() => setTagEditorOpen(true)}
                className="inline-block px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 rounded-lg text-teal-400 font-medium transition-all"
              >
                Vælg Interesser
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((slug) => {
                const node = getTagNode(slug);
                return (
                  <TagPill
                    key={slug}
                    slug={slug}
                    name={node?.label || slug}
                    emoji={node?.emoji}
                    level={1}
                    size="md"
                    selected={true}
                    onRemove={() => {
                      setSelectedTags(selectedTags.filter((t) => t !== slug));
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Tag Sections */}
        {selectedTags.length > 0 && (
          <div className="space-y-8">
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

        {/* Trending Tags Section */}
        <TrendingTagsSection />

        {/* Places Section */}
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
    <section className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-xl">🔥</span>
        Trending
      </h2>

      <div className="flex flex-wrap gap-2">
        {trendingTags.map((t) => (
          <TagPill
            key={t.slug}
            slug={t.slug}
            name={`${t.name} (${(t.total_count || 0).toLocaleString("da-DK")})`}
            emoji={t.emoji}
            level={1}
            size="sm"
            clickable={true}
          />
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

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {places.map((place) => (
          <Link key={place.id} to={`/sted/${place.id}`}>
            <div className="flex-shrink-0 w-56 rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group snap-start p-4 h-fit">
              {/* Name */}
              <h3 className="font-medium text-sm text-white line-clamp-2 mb-2">
                {place.name}
              </h3>

              {/* City */}
              {place.city && (
                <p className="text-xs text-white/50 mb-3">
                  {place.city}
                </p>
              )}

              {/* Tags */}
              {place.tags && place.tags.length > 0 && (
                <TagRow
                  tags={place.tags
                    .slice(0, 2)
                    .map((slug: string) => {
                      const node = getTagNode(slug);
                      return {
                        slug,
                        name: node?.label || slug,
                        emoji: node?.emoji,
                        level: node ? 2 : 3,
                      };
                    })}
                  maxVisible={2}
                  size="sm"
                />
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
