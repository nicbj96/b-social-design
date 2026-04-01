/**
 * Lazy Data Loader — Bundle Size Optimization
 * ════════════════════════════════════════════════════════════════
 * Provides deferred loading for heavy static data files:
 * - tagTree.ts (72KB) — tag hierarchy & search
 * - categoryContent.ts (68KB) — category places & activities
 *
 * These files are conditionally needed based on user interactions,
 * not on initial page load. Lazy loading removes ~140KB from the
 * critical path and defers it to separate chunks.
 *
 * USAGE EXAMPLES:
 * ──────────────────────────────────────────────────────────────
 *
 * 1. Load tagTree on-demand:
 *    import { lazyLoadTagTree } from '@/lib/lazyDataLoader';
 *    const tagTree = await lazyLoadTagTree();
 *    const parent = tagTree.find(p => p.tag === 'cykling');
 *
 * 2. Load category functions on-demand:
 *    import { lazyLoadCategoryFunctions } from '@/lib/lazyDataLoader';
 *    const { getCategoryPlaces } = await lazyLoadCategoryFunctions();
 *    const places = getCategoryPlaces('sport');
 *
 * 3. Use in useEffect for deferred loading:
 *    useEffect(() => {
 *      lazyLoadTagTree().then(tagTree => {
 *        setSearchResults(tagTree.filter(...));
 *      });
 *    }, [searchQuery]);
 */

import type { TagNode } from './tagTree';
import type { CategoryPlace, CategoryActivity } from '@/data/categoryContent';

// Cache loaded modules to avoid re-importing
let tagTreeCache: typeof import('./tagTree') | null = null;
let categoryContentCache: typeof import('@/data/categoryContent') | null = null;

/**
 * Lazy load tagTree module
 * Returns the TAG_TREE array (72KB static data)
 *
 * First call: imports module (async)
 * Subsequent calls: returns cached module
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
 * Lazy load all categoryContent functions (68KB)
 * Returns getter functions for places, activities, subcategory info
 *
 * Use this when CategoryDetail.tsx is accessed (not on initial load)
 */
export async function lazyLoadCategoryFunctions() {
  if (!categoryContentCache) {
    categoryContentCache = await import('@/data/categoryContent');
  }
  return {
    getCategoryPlaces: categoryContentCache.getCategoryPlaces,
    getCategoryActivities: categoryContentCache.getCategoryActivities,
    getSubcategoryPlaces: categoryContentCache.getSubcategoryPlaces,
    getSubcategoryActivities: categoryContentCache.getSubcategoryActivities,
    SUBCATEGORY_INFO: categoryContentCache.SUBCATEGORY_INFO,
    getCategoryContentCount: categoryContentCache.getCategoryContentCount,
  };
}

/**
 * Batch load multiple data modules at once
 * Useful for pages that need both tag tree and category content
 *
 * const { TAG_TREE, getCategoryPlaces, searchTags } = await lazyLoadAll();
 */
export async function lazyLoadAll() {
  const [tagModule, categoryModule] = await Promise.all([
    import('./tagTree'),
    import('@/data/categoryContent'),
  ]);
  return {
    TAG_TREE: tagModule.TAG_TREE,
    searchTags: tagModule.searchTags,
    getCategoryPlaces: categoryModule.getCategoryPlaces,
    getCategoryActivities: categoryModule.getCategoryActivities,
    getSubcategoryPlaces: categoryModule.getSubcategoryPlaces,
    getSubcategoryActivities: categoryModule.getSubcategoryActivities,
    SUBCATEGORY_INFO: categoryModule.SUBCATEGORY_INFO,
  };
}

/**
 * Prefetch data to warm up the cache
 * Call this during idle time to load data ahead of user interaction
 *
 * useEffect(() => {
 *   prefetchData(['tags', 'categories']);
 * }, []);
 */
export async function prefetchData(modules: ('tags' | 'categories')[] = ['tags', 'categories']) {
  const tasks = [];
  if (modules.includes('tags')) tasks.push(lazyLoadTagTree());
  if (modules.includes('categories')) tasks.push(lazyLoadCategoryFunctions());
  await Promise.all(tasks);
}
