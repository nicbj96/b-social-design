import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  useL1Categories,
  useEventsByTag,
  usePlacesByTag,
  useTagSearch,
  usePopularTags,
  useChildTags,
} from "@/hooks/useTagData";
import TagPill from "@/components/TagPill";
import TagRow from "@/components/TagRow";
import TagBreadcrumb from "@/components/TagBreadcrumb";
import { getEventImage, formatDanishDate } from "@/lib/eventHelpers";
import { Search, MapPin, ChevronRight, ArrowLeft } from "lucide-react";
import { getTagNode, getTagLevel, getOverkategoriForTag } from "@/lib/tagEngine";

export default function Udforsk() {
  // State for drill-down navigation
  const [activeL1, setActiveL1] = useState<{
    slug: string;
    name: string;
    emoji: string;
  } | null>(null);
  const [activeL2, setActiveL2] = useState<{
    slug: string;
    name: string;
    emoji: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch L1 categories
  const { data: l1Categories = [], isLoading: l1Loading } = useL1Categories();

  // Fetch search results (enabled when query.length >= 2)
  const { data: searchResults = [], isLoading: searchLoading } =
    useTagSearch(searchQuery);

  // Reset drill-down when search is active
  const hasSearchResults = searchQuery.length >= 2 && searchResults.length > 0;

  const handleSearchResultClick = (result: {
    slug: string;
    name: string;
    emoji?: string;
    level?: number;
  }) => {
    // Check level of result
    const level = result.level || getTagLevel(result.slug);
    if (level === 1) {
      setActiveL1({ slug: result.slug, name: result.name, emoji: result.emoji || "" });
      setActiveL2(null);
    } else if (level === 2) {
      // Find parent L1 from the result
      const parentSlug = getOverkategoriForTag(result.slug);
      const parentNode = parentSlug ? getTagNode(parentSlug) : null;
      if (parentNode && parentSlug) {
        setActiveL1({
          slug: parentSlug,
          name: parentNode.label || parentSlug,
          emoji: parentNode.emoji || "",
        });
      }
      setActiveL2({ slug: result.slug, name: result.name, emoji: result.emoji || "" });
    }
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-4">Udforsk</h1>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-3 text-white/40 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Søg blandt tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all"
            />

            {/* Search Results Dropdown */}
            {hasSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-lg overflow-hidden shadow-xl z-50">
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.level}-${result.slug}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-b-0"
                    >
                      <span className="text-xl flex-shrink-0">
                        {result.emoji || "🏷️"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {result.name}
                        </p>
                        <p className="text-xs text-white/40">
                          Level {result.level}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb (when drilled down) */}
        {(activeL1 || activeL2) && (
          <div className="mb-8">
            <TagBreadcrumb
              segments={
                activeL2
                  ? [
                      {
                        slug: activeL1!.slug,
                        name: activeL1!.name,
                        emoji: activeL1!.emoji,
                      },
                      {
                        slug: activeL2.slug,
                        name: activeL2.name,
                        emoji: activeL2.emoji,
                      },
                    ]
                  : activeL1
                  ? [
                      {
                        slug: activeL1.slug,
                        name: activeL1.name,
                        emoji: activeL1.emoji,
                      },
                    ]
                  : []
              }
              onNavigate={(slug: string | null) => {
                if (slug === null) {
                  setActiveL1(null);
                  setActiveL2(null);
                } else if (slug === activeL1?.slug) {
                  setActiveL2(null);
                } else {
                  setActiveL1(null);
                  setActiveL2(null);
                }
              }}
            />
          </div>
        )}

        {/* Level 2 Detail View */}
        {activeL2 && (
          <Level2View activeL2={activeL2} onBack={() => setActiveL2(null)} />
        )}

        {/* Level 1 Detail View */}
        {activeL1 && !activeL2 && (
          <Level1View activeL1={activeL1} onBack={() => setActiveL1(null)} onSelectL2={setActiveL2} />
        )}

        {/* Level 0: Category Grid */}
        {!activeL1 && !activeL2 && (
          <Level0View
            categories={l1Categories}
            isLoading={l1Loading}
            onSelectL1={setActiveL1}
          />
        )}

        {/* Bottom Sections (always visible) */}
        {!activeL1 && !activeL2 && (
          <div className="mt-16 space-y-12">
            {/* Trending Tags */}
            <TrendingSection />

            {/* Map Link */}
            <MapLink />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Level 0: Category Grid
 */
function Level0View({
  categories,
  isLoading,
  onSelectL1,
}: {
  categories: any[];
  isLoading: boolean;
  onSelectL1: (cat: { slug: string; name: string; emoji: string }) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Kategorier</h2>

      {isLoading ? (
        // Skeleton Grid
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/5 border border-white/10 p-4 h-32 animate-pulse"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <p className="text-white/60">Ingen kategorier fundet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() =>
                onSelectL1({
                  slug: cat.slug,
                  name: cat.name,
                  emoji: cat.emoji || "🏷️",
                })
              }
              className="rounded-xl bg-white/5 border border-white/10 p-4 text-left hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all group cursor-pointer"
            >
              {/* Emoji */}
              <p className="text-3xl mb-3">{cat.emoji || "🏷️"}</p>

              {/* Name */}
              <p className="font-medium text-sm text-white mb-2 line-clamp-2">
                {cat.name}
              </p>

              {/* Count Badge */}
              <p className="text-xs text-white/40">
                {(cat.total_count || 0).toLocaleString("da-DK")} oplevelser
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Level 1: Category Detail
 */
function Level1View({
  activeL1,
  onBack,
  onSelectL2,
}: {
  activeL1: { slug: string; name: string; emoji: string };
  onBack: () => void;
  onSelectL2: (cat: { slug: string; name: string; emoji: string }) => void;
}) {
  // Fetch L2 children
  const { data: l2Children = [] } = useChildTags(activeL1.slug);

  // Fetch events and places
  const { data: events = [], isLoading: eventsLoading } = useEventsByTag(
    activeL1.slug,
    { limit: 8, descendants: true }
  );
  const { data: places = [], isLoading: placesLoading } = usePlacesByTag(
    activeL1.slug,
    { limit: 8, descendants: true }
  );

  // Find total count from the active L1 category
  const totalCount =
    events.length > 0 || places.length > 0 ? events.length + places.length : 0;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={20} />
        Tilbage
      </button>

      {/* Hero Section */}
      <div className="space-y-4">
        <p className="text-6xl">{activeL1.emoji}</p>
        <h1 className="text-3xl font-bold">{activeL1.name}</h1>
      </div>

      {/* L2 Subcategory Chips */}
      {l2Children.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Underkategorier
          </p>
          <div className="flex flex-wrap gap-2">
            {l2Children.map((child) => (
              <button
                key={child.slug}
                onClick={() =>
                  onSelectL2({
                    slug: child.slug,
                    name: child.name,
                    emoji: child.emoji || "🏷️",
                  })
                }
                className="cursor-pointer"
              >
                <TagPill
                  slug={child.slug}
                  name={child.name}
                  emoji={child.emoji}
                  level={2}
                  size="md"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events & Places Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Events</h2>
            {events.length > 0 && (
              <Link
                to={`/kategori/${activeL1.slug}`}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Se alle →
              </Link>
            )}
          </div>

          {eventsLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 h-64 bg-white/5 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-white/60 text-sm">
              Ingen events fundet
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {events.slice(0, 8).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>

        {/* Places Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Steder</h2>
            {places.length > 0 && (
              <Link
                to={`/kort?tag=${activeL1.slug}`}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Se kort →
              </Link>
            )}
          </div>

          {placesLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 h-40 bg-white/5 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-white/60 text-sm">
              Ingen steder fundet
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {places.slice(0, 8).map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Level 2: Subcategory Detail
 */
function Level2View({
  activeL2,
  onBack,
}: {
  activeL2: { slug: string; name: string; emoji: string };
  onBack: () => void;
}) {
  // Fetch L3 children
  const { data: l3Children = [] } = useChildTags(activeL2.slug);

  // Fetch events and places
  const { data: events = [], isLoading: eventsLoading } = useEventsByTag(
    activeL2.slug,
    { limit: 8, descendants: true }
  );
  const { data: places = [], isLoading: placesLoading } = usePlacesByTag(
    activeL2.slug,
    { limit: 8, descendants: true }
  );

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={20} />
        Tilbage
      </button>

      {/* Hero Section */}
      <div className="space-y-4">
        <p className="text-6xl">{activeL2.emoji}</p>
        <h1 className="text-3xl font-bold">{activeL2.name}</h1>
      </div>

      {/* L3 Subcategory Chips (if any) */}
      {l3Children.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Underkategorier
          </p>
          <div className="flex flex-wrap gap-2">
            {l3Children.map((child) => (
              <TagPill
                key={child.slug}
                slug={child.slug}
                name={child.name}
                emoji={child.emoji}
                level={3}
                size="md"
              />
            ))}
          </div>
        </div>
      )}

      {/* Events & Places Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Events</h2>
            {events.length > 0 && (
              <Link
                to={`/kategori/${activeL2.slug}`}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Se alle →
              </Link>
            )}
          </div>

          {eventsLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 h-64 bg-white/5 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-white/60 text-sm">
              Ingen events fundet
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {events.slice(0, 8).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>

        {/* Places Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Steder</h2>
            {places.length > 0 && (
              <Link
                to={`/kort?tag=${activeL2.slug}`}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Se kort →
              </Link>
            )}
          </div>

          {placesLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 h-40 bg-white/5 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-white/60 text-sm">
              Ingen steder fundet
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {places.slice(0, 8).map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Event Card Component
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
    <Link to={`/event/${event.id}`}>
      <div className="flex-shrink-0 w-56 rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group snap-start">
        {/* Image */}
        {imageUrl && (
          <div className="h-32 overflow-hidden bg-white/5">
            <img
              src={imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-medium text-sm text-white truncate line-clamp-2">
            {event.title}
          </h3>

          {/* Date */}
          <p className="text-xs text-white/50">{formatDanishDate(event.date)}</p>

          {/* Location */}
          <p className="text-xs text-white/40 truncate">{event.location}</p>

          {/* Tags */}
          {tagArray.length > 0 && (
            <div className="pt-1">
              <TagRow tags={tagArray} maxVisible={1} size="sm" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Place Card Component
 */
function PlaceCard({
  place,
}: {
  place: {
    id: string;
    name: string;
    city?: string;
    region?: string;
    rating_avg?: number;
    rating_count?: number;
    interest_tags?: string[];
  };
}) {
  const tagArray = useMemo(() => {
    if (!place.interest_tags || place.interest_tags.length === 0) {
      return [];
    }
    return place.interest_tags
      .slice(0, 2)
      .map((slug) => {
        const node = getTagNode(slug);
        return {
          slug,
          name: node?.label || slug,
          emoji: node?.emoji,
          level: node ? 2 : 3,
        };
      });
  }, [place.interest_tags]);

  return (
    <Link to={`/sted/${place.id}`}>
      <div className="flex-shrink-0 w-56 rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group snap-start p-4 h-fit">
        {/* Name */}
        <h3 className="font-medium text-sm text-white line-clamp-2 mb-2">
          {place.name}
        </h3>

        {/* City/Region */}
        {place.city && (
          <p className="text-xs text-white/50 mb-2">{place.city}</p>
        )}

        {/* Rating */}
        {place.rating_avg && place.rating_count && place.rating_count > 0 && (
          <p className="text-xs text-white/60 mb-3 flex items-center gap-1">
            <span>⭐</span>
            {place.rating_avg.toFixed(1)} ({place.rating_count})
          </p>
        )}

        {/* Tags */}
        {tagArray.length > 0 && <TagRow tags={tagArray} maxVisible={2} size="sm" />}
      </div>
    </Link>
  );
}

/**
 * Trending Section
 */
function TrendingSection() {
  const { data: trendingTags = [], isLoading } = usePopularTags(12);

  if (isLoading || trendingTags.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        Trending
      </h2>

      <div className="flex flex-wrap gap-2">
        {trendingTags.map((tag) => (
          <Link key={tag.slug} to={`/kategori/${tag.slug}`}>
            <TagPill
              slug={tag.slug}
              name={`${tag.name} (${(tag.total_count || 0).toLocaleString("da-DK")})`}
              emoji={tag.emoji}
              level={1}
              size="sm"
              clickable={false}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Map Link Section
 */
function MapLink() {
  return (
    <section>
      <Link to="/kort">
        <div className="rounded-xl bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/30 p-8 hover:border-teal-500/50 hover:bg-gradient-to-r hover:from-teal-500/30 hover:to-blue-500/30 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Udforsk på Kort</h3>
              <p className="text-white/60 text-sm">Se alle steder og events omkring dig</p>
            </div>
            <MapPin size={32} className="text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </Link>
    </section>
  );
}
