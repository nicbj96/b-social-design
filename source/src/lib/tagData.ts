import { supabase } from "@/lib/supabase";
import { NormalizedTag, HierarchyNode, TagCategory } from "@/lib/tagApi";
import { Event, Place } from "@/lib/supabase";

// Types
export type TagUsageCount = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  level: number;
  event_count: number;
  place_count: number;
  total_count: number;
};

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

// Cache configuration
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const cache = new Map<string, CacheEntry<any>>();

// Cache utility functions
function setCacheEntry<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function getCacheEntry<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// ============================================================================
// TAG HIERARCHY FUNCTIONS
// ============================================================================

/**
 * Fetch the complete tag hierarchy as a tree (L1→L2→L3)
 * Results are cached for 30 minutes
 */
export async function fetchTagTree(): Promise<HierarchyNode[]> {
  const cacheKey = "tagTree:all";
  const cached = getCacheEntry<HierarchyNode[]>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch all tags ordered by level, then by sort order
    const { data: allTags, error } = await supabase
      .from("tags_normalized")
      .select("*")
      .order("level", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.warn("Error fetching tag tree:", error);
      return [];
    }

    if (!allTags) return [];

    // Build the hierarchy: L1 tags have no parent, L2 tags have L1 parent, etc.
    const tagMap = new Map<string, HierarchyNode>();
    const roots: HierarchyNode[] = [];

    // First pass: create nodes for all tags
    for (const tag of allTags) {
      const node: HierarchyNode = {
        // Core fields (legacy compat)
        tag: tag.slug,
        label: tag.name,
        emoji: tag.emoji,
        level: tag.level,
        children: [],
        // Extended fields
        id: tag.id,
        slug: tag.slug,
        name: tag.name,
        parent_id: tag.parent_id,
        category_id: tag.category_id,
      };
      tagMap.set(tag.id, node);
    }

    // Second pass: link parent-child relationships
    for (const tag of allTags) {
      const node = tagMap.get(tag.id)!;
      if (tag.parent_id) {
        const parent = tagMap.get(tag.parent_id);
        if (parent) {
          parent.children!.push(node);
        }
      } else {
        // Root level (L1)
        roots.push(node);
      }
    }

    setCacheEntry(cacheKey, roots);
    return roots;
  } catch (err) {
    console.warn("Exception fetching tag tree:", err);
    return [];
  }
}

/**
 * Fetch L1 categories with usage counts
 * Results are cached for 30 minutes
 */
export async function fetchL1Categories(): Promise<TagUsageCount[]> {
  const cacheKey = "l1Categories:all";
  const cached = getCacheEntry<TagUsageCount[]>(cacheKey);
  if (cached) return cached;

  try {
    // Get L1 tags with usage counts from the view
    const { data: l1Tags, error } = await supabase
      .from("tag_usage_counts")
      .select("*")
      .eq("level", 1)
      .order("total_count", { ascending: false });

    if (error) {
      console.warn("Error fetching L1 categories:", error);
      return [];
    }

    if (!l1Tags) return [];

    setCacheEntry(cacheKey, l1Tags);
    return l1Tags as TagUsageCount[];
  } catch (err) {
    console.warn("Exception fetching L1 categories:", err);
    return [];
  }
}

/**
 * Fetch child tags of a parent tag (L2 or L3 children)
 */
export async function fetchChildTags(
  parentSlug: string
): Promise<NormalizedTag[]> {
  if (!parentSlug) return [];

  try {
    // First, get the parent tag by slug
    const { data: parentData, error: parentError } = await supabase
      .from("tags_normalized")
      .select("id")
      .eq("slug", parentSlug)
      .single();

    if (parentError || !parentData) {
      console.warn("Parent tag not found:", parentSlug);
      return [];
    }

    // Then fetch all children of this parent
    const { data: children, error } = await supabase
      .from("tags_normalized")
      .select("*")
      .eq("parent_id", parentData.id)
      .order("name", { ascending: true });

    if (error) {
      console.warn("Error fetching child tags:", error);
      return [];
    }

    return (children || []) as NormalizedTag[];
  } catch (err) {
    console.warn("Exception fetching child tags:", err);
    return [];
  }
}

/**
 * Get all descendant slugs of a tag (recursive)
 */
export async function getDescendantSlugs(slug: string): Promise<string[]> {
  if (!slug) return [];

  try {
    // Fetch the entire tree to traverse it
    const tree = await fetchTagTree();

    // Helper to find a node by slug and collect all descendants
    function findAndCollectDescendants(
      nodes: HierarchyNode[],
      targetSlug: string,
      result: string[] = []
    ): string[] {
      for (const node of nodes) {
        const nodeSlug = node.slug || node.tag;
        if (nodeSlug === targetSlug) {
          // Found the target, collect all descendants recursively
          result.push(nodeSlug);
          collectAllDescendants(node.children || [], result);
          return result;
        }
        // Search in children
        const found = findAndCollectDescendants(
          node.children || [],
          targetSlug,
          result
        );
        if (found.length > 0) return found;
      }
      return result;
    }

    function collectAllDescendants(
      nodes: HierarchyNode[],
      result: string[]
    ): void {
      for (const node of nodes) {
        result.push(node.slug || node.tag);
        if (node.children && node.children.length > 0) {
          collectAllDescendants(node.children, result);
        }
      }
    }

    return findAndCollectDescendants(tree, slug);
  } catch (err) {
    console.warn("Exception getting descendant slugs:", err);
    return [];
  }
}

// ============================================================================
// EVENTS BY TAG
// ============================================================================

export interface FetchEventsByTagOptions {
  limit?: number;
  offset?: number;
  descendants?: boolean;
}

/**
 * Fetch events for a given tag (optionally including descendants)
 * @param slug - Tag slug
 * @param opts - Options including limit (default 20), offset (default 0), descendants (default true)
 */
export async function fetchEventsByTag(
  slug: string,
  opts: FetchEventsByTagOptions = {}
): Promise<Event[]> {
  if (!slug) return [];

  const { limit = 20, offset = 0, descendants = true } = opts;

  try {
    let tagSlugs = [slug];

    // Get descendant slugs if requested
    if (descendants) {
      tagSlugs = await getDescendantSlugs(slug);
    }

    if (tagSlugs.length === 0) {
      return [];
    }

    // Get tag IDs for all slugs
    const { data: tags, error: tagsError } = await supabase
      .from("tags_normalized")
      .select("id")
      .in("slug", tagSlugs);

    if (tagsError || !tags || tags.length === 0) {
      console.warn("No tags found for slugs:", tagSlugs);
      return [];
    }

    const tagIds = tags.map((t) => t.id);

    // Join through event_tags_normalized to events
    const { data: eventIds, error: joinError } = await supabase
      .from("event_tags_normalized")
      .select("event_id")
      .in("tag_id", tagIds)
      .range(offset, offset + limit - 1);

    if (joinError || !eventIds) {
      console.warn("Error joining event_tags_normalized:", joinError);
      return [];
    }

    const ids = [...new Set(eventIds.map((e) => e.event_id))];

    if (ids.length === 0) {
      return [];
    }

    // Fetch the actual event data
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .in("id", ids)
      .order("date", { ascending: false });

    if (eventsError || !events) {
      console.warn("Error fetching events:", eventsError);
      return [];
    }

    return events as Event[];
  } catch (err) {
    console.warn("Exception fetching events by tag:", err);
    return [];
  }
}

// ============================================================================
// PLACES BY TAG
// ============================================================================

export interface FetchPlacesByTagOptions {
  limit?: number;
  offset?: number;
  descendants?: boolean;
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Fetch places for a given tag (optionally including descendants and bbox filter)
 * @param slug - Tag slug
 * @param opts - Options including limit, offset, descendants, and optional bbox
 */
export async function fetchPlacesByTag(
  slug: string,
  opts: FetchPlacesByTagOptions = {}
): Promise<Place[]> {
  if (!slug) return [];

  const { limit = 20, offset = 0, descendants = true, bbox } = opts;

  try {
    let tagSlugs = [slug];

    // Get descendant slugs if requested
    if (descendants) {
      tagSlugs = await getDescendantSlugs(slug);
    }

    if (tagSlugs.length === 0) {
      return [];
    }

    // Get tag IDs for all slugs
    const { data: tags, error: tagsError } = await supabase
      .from("tags_normalized")
      .select("id")
      .in("slug", tagSlugs);

    if (tagsError || !tags || tags.length === 0) {
      console.warn("No tags found for slugs:", tagSlugs);
      return [];
    }

    const tagIds = tags.map((t) => t.id);

    // Join through place_tags to places
    const { data: placeIds, error: joinError } = await supabase
      .from("place_tags")
      .select("place_id")
      .in("tag_id", tagIds)
      .range(offset, offset + limit - 1);

    if (joinError || !placeIds) {
      console.warn("Error joining place_tags:", joinError);
      return [];
    }

    const ids = [...new Set(placeIds.map((p) => p.place_id))];

    if (ids.length === 0) {
      return [];
    }

    // Fetch the actual place data
    let query = supabase
      .from("places")
      .select("*")
      .in("id", ids);

    // Apply bbox filter if provided
    if (bbox) {
      query = query
        .lte("latitude", bbox.north)
        .gte("latitude", bbox.south)
        .lte("longitude", bbox.east)
        .gte("longitude", bbox.west);
    }

    const { data: places, error: placesError } = await query.order("name", {
      ascending: true,
    });

    if (placesError || !places) {
      console.warn("Error fetching places:", placesError);
      return [];
    }

    return places as Place[];
  } catch (err) {
    console.warn("Exception fetching places by tag:", err);
    return [];
  }
}

// ============================================================================
// TAGS FOR SPECIFIC ITEMS
// ============================================================================

export interface TagForItem {
  slug: string;
  name: string;
  emoji: string;
  level: number;
}

/**
 * Fetch all tags for a specific event
 */
export async function fetchTagsForEvent(eventId: string): Promise<TagForItem[]> {
  if (!eventId) return [];

  try {
    const { data, error } = await supabase
      .from("event_tag_slugs")
      .select("slug, name, emoji, level")
      .eq("event_id", eventId);

    if (error) {
      console.warn("Error fetching tags for event:", error);
      return [];
    }

    return (data || []) as TagForItem[];
  } catch (err) {
    console.warn("Exception fetching tags for event:", err);
    return [];
  }
}

/**
 * Fetch all tags for a specific place
 */
export async function fetchTagsForPlace(placeId: string): Promise<TagForItem[]> {
  if (!placeId) return [];

  try {
    const { data, error } = await supabase
      .from("place_tag_slugs")
      .select("slug, name, emoji, level")
      .eq("place_id", placeId);

    if (error) {
      console.warn("Error fetching tags for place:", error);
      return [];
    }

    return (data || []) as TagForItem[];
  } catch (err) {
    console.warn("Exception fetching tags for place:", err);
    return [];
  }
}

// ============================================================================
// TAG SEARCH
// ============================================================================

/**
 * Search tags by name or slug, including alias resolution
 */
export async function searchTags(query: string): Promise<NormalizedTag[]> {
  if (!query || query.length < 1) return [];

  try {
    const searchPattern = `%${query}%`;

    // First, search tags by name or slug
    const { data: directMatches, error: directError } = await supabase
      .from("tags_normalized")
      .select("*")
      .or(`name.ilike.${searchPattern},slug.ilike.${searchPattern}`)
      .order("name", { ascending: true });

    if (directError) {
      console.warn("Error searching tags directly:", directError);
      return [];
    }

    const results = new Map<string, NormalizedTag>();

    // Add direct matches
    (directMatches || []).forEach((tag) => {
      results.set(tag.id, tag);
    });

    // Also search aliases and resolve to canonical tags
    const { data: aliases, error: aliasError } = await supabase
      .from("tag_aliases")
      .select("canonical")
      .ilike("alias", searchPattern);

    if (!aliasError && aliases) {
      const canonicalSlugs = aliases.map((a) => a.canonical);

      const { data: canonicalTags } = await supabase
        .from("tags_normalized")
        .select("*")
        .in("slug", canonicalSlugs);

      (canonicalTags || []).forEach((tag) => {
        results.set(tag.id, tag);
      });
    }

    return Array.from(results.values());
  } catch (err) {
    console.warn("Exception searching tags:", err);
    return [];
  }
}

// ============================================================================
// POPULAR TAGS
// ============================================================================

/**
 * Fetch the most popular/used tags
 */
export async function fetchPopularTags(limit: number = 20): Promise<TagUsageCount[]> {
  const cacheKey = `popularTags:${limit}`;
  const cached = getCacheEntry<TagUsageCount[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from("tag_usage_counts")
      .select("*")
      .order("total_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Error fetching popular tags:", error);
      return [];
    }

    const result = (data || []) as TagUsageCount[];
    setCacheEntry(cacheKey, result);
    return result;
  } catch (err) {
    console.warn("Exception fetching popular tags:", err);
    return [];
  }
}

// ============================================================================
// TAG RESOLUTION
// ============================================================================

/**
 * Resolve a string (name, slug, or alias) to a tag
 * Handles aliases by looking up the canonical tag
 */
export async function resolveTag(input: string): Promise<NormalizedTag | null> {
  if (!input) return null;

  try {
    // First try direct match by slug
    const { data: bySlug } = await supabase
      .from("tags_normalized")
      .select("*")
      .eq("slug", input.toLowerCase())
      .single();

    if (bySlug) return bySlug as NormalizedTag;

    // Try by name
    const { data: byName } = await supabase
      .from("tags_normalized")
      .select("*")
      .eq("name", input)
      .single();

    if (byName) return byName as NormalizedTag;

    // Try as an alias
    const { data: alias } = await supabase
      .from("tag_aliases")
      .select("canonical")
      .eq("alias", input.toLowerCase())
      .single();

    if (alias) {
      const { data: canonicalTag } = await supabase
        .from("tags_normalized")
        .select("*")
        .eq("slug", alias.canonical)
        .single();

      if (canonicalTag) return canonicalTag as NormalizedTag;
    }

    return null;
  } catch (err) {
    console.warn("Exception resolving tag:", err);
    return null;
  }
}

// ============================================================================
// CACHE MANAGEMENT (exported for testing/cleanup)
// ============================================================================

export function clearTagCache(pattern?: string): void {
  clearCache(pattern);
}
