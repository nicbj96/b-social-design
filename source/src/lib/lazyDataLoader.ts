/**
 * Lazy Data Loader — Bundle Size Optimization
 * ════════════════════════════════════════════════════════════════
 * Provides deferred loading for tagTree.ts (72KB static data).
 * Conditionally loaded based on user interactions, not on initial page load.
 */

import type { TagNode } from './tagTree';

// Cache loaded modules to avoid re-importing
let tagTreeCache: typeof import('./tagTree') | null = null;

/**
 * Lazy load tagTree module
 * Returns the TAG_TREE array (72KB static data)
 */
export async function lazyLoadTagTree(): Promise<TagNode[]> {
  if (!tagTreeCache) {
    tagTreeCache = await import('./tagTree');
  }
  return tagTreeCache.TAG_TREE;
}

/**
 * Lazy load tagTree search functions
 * Returns searchTags, getChildren, getParentCategories, etc.
 */
export async function lazyLoadTagFunctions() {
  if (!tagTreeCache) {
    tagTreeCache = await import('./tagTree');
  }
  return {
    searchTags: tagTreeCache.searchTags,
    getChildren: tagTreeCache.getChildren,
    getParentCategories: tagTreeCache.getParentCategories,
    getOverkategorier: tagTreeCache.getOverkategorier,
    getAllTagsFlat: tagTreeCache.getAllTagsFlat,
  };
}

/**
 * Prefetch tag data to warm up the cache
 */
export async function prefetchData() {
  await lazyLoadTagTree();
}
