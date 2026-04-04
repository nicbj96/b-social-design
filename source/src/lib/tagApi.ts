/**
 * tagApi.ts — Supabase-backed hierarchical tag system
 * ═══════════════════════════════════════════════════
 * Fetches the 3-level tag taxonomy (L1→L2→L3) from Supabase tables:
 *   - tag_categories: 22 overkategorier
 *   - tags_normalized: 793 tags (22 L1 + 92 L2 + 679 L3)
 *
 * Provides drill-down filtering: user picks L1 → sees L2 → picks L2 → sees L3
 * Replaces static TAG_TREE for server-sourced hierarchy.
 */

import { supabase } from "./supabase";
import { TAG_TREE, type TagNode } from "./tagTree";

/* ── Types ── */

export interface TagCategory {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  sort_order: number;
}

export interface NormalizedTag {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  level: number;
  parent_id: string | null;
  category_id: string | null;
}

/** Lightweight tag node for UI rendering (matches TagNode from tagTree.ts) */
export interface HierarchyNode {
  tag: string;      // slug
  emoji: string;
  label: string;    // display name
  level: number;
  children?: HierarchyNode[];
}

/* ── In-memory cache ── */

let _categoriesCache: TagCategory[] | null = null;
let _tagsCache: NormalizedTag[] | null = null;
let _treeCache: HierarchyNode[] | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function isCacheValid(): boolean {
  return Date.now() - _cacheTimestamp < CACHE_TTL;
}

/* ── Static fallback: convert TAG_TREE → HierarchyNode[] ── */
// Used when Supabase is unreachable — keeps the filter working offline.

function tagNodeToHierarchy(node: TagNode, level: number): HierarchyNode {
  return {
    tag: node.tag,
    emoji: node.emoji,
    label: node.label,
    level,
    children: node.children?.map(c => tagNodeToHierarchy(c, level + 1)),
  };
}

let _staticFallback: HierarchyNode[] | null = null;

function getStaticFallback(): HierarchyNode[] {
  if (!_staticFallback) {
    _staticFallback = TAG_TREE.map(n => tagNodeToHierarchy(n, 1));
  }
  return _staticFallback;
}

/* ── Fetch all tag_categories ── */

export async function fetchTagCategories(): Promise<TagCategory[]> {
  if (_categoriesCache && isCacheValid()) return _categoriesCache;

  const { data, error } = await supabase
    .from("tag_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[tagApi] fetchTagCategories error:", error);
    return _categoriesCache || [];
  }

  _categoriesCache = data || [];
  _cacheTimestamp = Date.now();
  return _categoriesCache;
}

/* ── Fetch all tags_normalized ── */

export async function fetchAllNormalizedTags(): Promise<NormalizedTag[]> {
  if (_tagsCache && isCacheValid()) return _tagsCache;

  const all: NormalizedTag[] = [];
  let from = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("tags_normalized")
      .select("*")
      .order("slug")
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("[tagApi] fetchAllNormalizedTags error:", error);
      break;
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  _tagsCache = all;
  _cacheTimestamp = Date.now();
  return _tagsCache;
}

/* ── Build full hierarchy tree from flat data ── */

export async function fetchTagTree(): Promise<HierarchyNode[]> {
  if (_treeCache && isCacheValid()) return _treeCache;

  let categories: TagCategory[];
  let tags: NormalizedTag[];

  try {
    [categories, tags] = await Promise.all([
      fetchTagCategories(),
      fetchAllNormalizedTags(),
    ]);
  } catch {
    // Supabase unreachable — use bundled static TAG_TREE as fallback
    console.warn("[tagApi] Supabase unavailable, falling back to static TAG_TREE");
    return getStaticFallback();
  }

  // If we got no data (e.g. tables empty), also fall back
  if (tags.length === 0) {
    console.warn("[tagApi] tags_normalized empty, falling back to static TAG_TREE");
    return getStaticFallback();
  }

  // Index tags by id for parent lookup
  const byId = new Map<string, NormalizedTag>();
  for (const t of tags) byId.set(t.id, t);

  // Group tags by level
  const l1Tags = tags.filter(t => t.level === 1);
  const l2Tags = tags.filter(t => t.level === 2);
  const l3Tags = tags.filter(t => t.level === 3);

  // Build L3 nodes grouped by parent_id
  const l3ByParent = new Map<string, HierarchyNode[]>();
  for (const t of l3Tags) {
    if (!t.parent_id) continue;
    const list = l3ByParent.get(t.parent_id) || [];
    list.push({ tag: t.slug, emoji: t.emoji, label: t.name, level: 3 });
    l3ByParent.set(t.parent_id, list);
  }

  // Build L2 nodes grouped by parent_id (L1)
  const l2ByParent = new Map<string, HierarchyNode[]>();
  for (const t of l2Tags) {
    if (!t.parent_id) continue;
    const children = l3ByParent.get(t.id) || [];
    const list = l2ByParent.get(t.parent_id) || [];
    list.push({
      tag: t.slug,
      emoji: t.emoji,
      label: t.name,
      level: 2,
      children: children.length > 0 ? children : undefined,
    });
    l2ByParent.set(t.parent_id, list);
  }

  // Build L1 root nodes (match with tag_categories sort order)
  const catOrder = new Map<string, number>();
  for (const c of categories) catOrder.set(c.slug, c.sort_order);

  const tree: HierarchyNode[] = l1Tags
    .map(t => ({
      tag: t.slug,
      emoji: t.emoji,
      label: t.name,
      level: 1,
      children: l2ByParent.get(t.id) || undefined,
    }))
    .sort((a, b) => (catOrder.get(a.tag) ?? 99) - (catOrder.get(b.tag) ?? 99));

  _treeCache = tree;
  return tree;
}

/* ── Drill-down helpers ── */

/** Get L1 overkategorier (top-level nodes only) */
export async function getL1Categories(): Promise<HierarchyNode[]> {
  const tree = await fetchTagTree();
  return tree.map(n => ({ tag: n.tag, emoji: n.emoji, label: n.label, level: 1 }));
}

/** Get L2 children of an L1 category */
export async function getL2ForCategory(l1Slug: string): Promise<HierarchyNode[]> {
  const tree = await fetchTagTree();
  const parent = tree.find(n => n.tag === l1Slug);
  if (!parent?.children) return [];
  return parent.children.map(n => ({ tag: n.tag, emoji: n.emoji, label: n.label, level: 2 }));
}

/** Get L3 children of an L2 category */
export async function getL3ForCategory(l2Slug: string): Promise<HierarchyNode[]> {
  const tree = await fetchTagTree();
  for (const l1 of tree) {
    if (!l1.children) continue;
    const l2 = l1.children.find(n => n.tag === l2Slug);
    if (l2?.children) {
      return l2.children.map(n => ({ tag: n.tag, emoji: n.emoji, label: n.label, level: 3 }));
    }
  }
  return [];
}

/** Get all descendant slugs of a tag (for filtering) */
export async function getDescendantSlugs(slug: string): Promise<string[]> {
  const tree = await fetchTagTree();
  const slugs: string[] = [slug];

  function collect(nodes: HierarchyNode[]) {
    for (const n of nodes) {
      slugs.push(n.tag);
      if (n.children) collect(n.children);
    }
  }

  // Check L1
  for (const l1 of tree) {
    if (l1.tag === slug) {
      if (l1.children) collect(l1.children);
      return slugs;
    }
    // Check L2
    if (l1.children) {
      for (const l2 of l1.children) {
        if (l2.tag === slug) {
          if (l2.children) collect(l2.children);
          return slugs;
        }
      }
    }
  }
  return slugs;
}

/** Search tags across all levels (mirrors tagTree.searchTags) */
export async function searchNormalizedTags(query: string): Promise<HierarchyNode[]> {
  if (!query.trim()) return getL1Categories();

  const tree = await fetchTagTree();
  const q = query.toLowerCase().trim();
  const results: HierarchyNode[] = [];
  const seen = new Set<string>();

  function addIfNew(node: HierarchyNode) {
    if (!seen.has(node.tag)) {
      results.push({ tag: node.tag, emoji: node.emoji, label: node.label, level: node.level });
      seen.add(node.tag);
    }
  }

  function smartMatch(text: string): boolean {
    const t = text.toLowerCase();
    if (q.length <= 3) {
      return t === q || t.startsWith(q) || t.includes("-" + q) || t.includes(" " + q);
    }
    return t.includes(q);
  }

  for (const l1 of tree) {
    if (smartMatch(l1.tag) || smartMatch(l1.label)) {
      addIfNew(l1);
      if (l1.children) l1.children.forEach(l2 => {
        addIfNew(l2);
        if (l2.children) l2.children.forEach(l3 => addIfNew(l3));
      });
      continue;
    }

    if (l1.children) {
      for (const l2 of l1.children) {
        if (smartMatch(l2.tag) || smartMatch(l2.label)) {
          addIfNew(l1);
          addIfNew(l2);
          if (l2.children) l2.children.forEach(l3 => addIfNew(l3));
        } else if (l2.children) {
          for (const l3 of l2.children) {
            if (smartMatch(l3.tag) || smartMatch(l3.label)) {
              addIfNew(l1);
              addIfNew(l2);
              addIfNew(l3);
            }
          }
        }
      }
    }
  }

  return results;
}

/* ── Cache invalidation ── */

export function invalidateTagCache(): void {
  _categoriesCache = null;
  _tagsCache = null;
  _treeCache = null;
  _cacheTimestamp = 0;
}
