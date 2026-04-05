import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as tagData from "@/lib/tagData";
import {
  NormalizedTag,
  HierarchyNode,
  TagCategory,
} from "@/lib/tagApi";
import { Event, Place } from "@/lib/supabase";
import {
  FetchEventsByTagOptions,
  FetchPlacesByTagOptions,
  TagUsageCount,
  TagForItem,
} from "@/lib/tagData";

// ============================================================================
// TAG HIERARCHY HOOKS
// ============================================================================

/**
 * Hook to fetch the complete tag hierarchy (L1→L2→L3)
 * Cached for 30 minutes
 */
export function useTagTree(): UseQueryResult<HierarchyNode[], Error> {
  return useQuery({
    queryKey: ["tagTree"],
    queryFn: () => tagData.fetchTagTree(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
    retry: 1,
  });
}

/**
 * Hook to fetch L1 categories with usage counts
 * Cached for 10 minutes
 */
export function useL1Categories(): UseQueryResult<TagUsageCount[], Error> {
  return useQuery({
    queryKey: ["l1Categories"],
    queryFn: () => tagData.fetchL1Categories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch child tags of a parent
 * Automatically disabled if parentSlug is empty
 */
export function useChildTags(
  parentSlug: string
): UseQueryResult<NormalizedTag[], Error> {
  return useQuery({
    queryKey: ["childTags", parentSlug],
    queryFn: () => tagData.fetchChildTags(parentSlug),
    enabled: !!parentSlug,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

// ============================================================================
// EVENTS BY TAG HOOKS
// ============================================================================

/**
 * Hook to fetch events for a given tag
 * Automatically disabled if slug is empty
 */
export function useEventsByTag(
  slug: string,
  opts?: FetchEventsByTagOptions
): UseQueryResult<Event[], Error> {
  return useQuery({
    queryKey: ["eventsByTag", slug, opts?.limit, opts?.offset, opts?.descendants],
    queryFn: () => tagData.fetchEventsByTag(slug, opts),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// ============================================================================
// PLACES BY TAG HOOKS
// ============================================================================

/**
 * Hook to fetch places for a given tag
 * Automatically disabled if slug is empty
 */
export function usePlacesByTag(
  slug: string,
  opts?: FetchPlacesByTagOptions
): UseQueryResult<Place[], Error> {
  return useQuery({
    queryKey: [
      "placesByTag",
      slug,
      opts?.limit,
      opts?.offset,
      opts?.descendants,
      opts?.bbox,
    ],
    queryFn: () => tagData.fetchPlacesByTag(slug, opts),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

// ============================================================================
// TAGS FOR SPECIFIC ITEMS HOOKS
// ============================================================================

/**
 * Hook to fetch all tags for a specific event
 * Automatically disabled if eventId is empty
 */
export function useTagsForEvent(
  eventId: string
): UseQueryResult<TagForItem[], Error> {
  return useQuery({
    queryKey: ["tagsForEvent", eventId],
    queryFn: () => tagData.fetchTagsForEvent(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook to fetch all tags for a specific place
 * Automatically disabled if placeId is empty
 */
export function useTagsForPlace(
  placeId: string
): UseQueryResult<TagForItem[], Error> {
  return useQuery({
    queryKey: ["tagsForPlace", placeId],
    queryFn: () => tagData.fetchTagsForPlace(placeId),
    enabled: !!placeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
}

// ============================================================================
// TAG SEARCH HOOK
// ============================================================================

/**
 * Hook to search tags by name/slug
 * Requires at least 2 characters in the query
 * Debouncing should be handled by the caller if needed
 */
export function useTagSearch(query: string): UseQueryResult<NormalizedTag[], Error> {
  return useQuery({
    queryKey: ["tagSearch", query],
    queryFn: () => tagData.searchTags(query),
    enabled: query.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000,
    retry: 1,
  });
}

// ============================================================================
// POPULAR TAGS HOOK
// ============================================================================

/**
 * Hook to fetch the most popular/used tags
 * Cached for 5 minutes
 */
export function usePopularTags(
  limit: number = 20
): UseQueryResult<TagUsageCount[], Error> {
  return useQuery({
    queryKey: ["popularTags", limit],
    queryFn: () => tagData.fetchPopularTags(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

// ============================================================================
// TAG RESOLUTION HOOK
// ============================================================================

/**
 * Hook to resolve a string (name, slug, or alias) to a tag
 * Automatically disabled if input is empty
 */
export function useResolveTag(
  input: string
): UseQueryResult<NormalizedTag | null, Error> {
  return useQuery({
    queryKey: ["resolveTag", input],
    queryFn: () => tagData.resolveTag(input),
    enabled: !!input,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
