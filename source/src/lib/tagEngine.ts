/*
 B-Social Tag Engine — "Superhjernen"
 3-niveau hierarki: OVERKATEGORI → KATEGORI → UNDERKATEGORI
 Forbinder tags på kryds og tværs af alle sider:
 Feed, Udforsk, Kort, Firma, Henvisning
*/
import { TAG_TREE, type TagNode, getOverkategorier } from "./tagTree";
import type { Event } from "./data";

// --- Tag Storage (localStorage) ---
const STORAGE_KEY = "bsocial_user_tags";
const FIRMA_TAGS_KEY = "bsocial_firma_tags";

// Default tags shown to new users before they customize their feed
const DEFAULT_TAGS = ["motion-fitness", "natur-outdoor", "musik-kultur", "mad-drikke", "cykling", "løb", "outdoor"];

export function getUserTags(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_TAGS;
  } catch { return DEFAULT_TAGS; }
}

export function setUserTags(tags: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  window.dispatchEvent(new CustomEvent("bsocial-tags-changed", { detail: tags }));
}

export function getFirmaTags(): string[] {
  try {
    const raw = localStorage.getItem(FIRMA_TAGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function setFirmaTags(tags: string[]) {
  localStorage.setItem(FIRMA_TAGS_KEY, JSON.stringify(tags));
}

// --- 3-level flatten ---
function flattenTree(nodes: TagNode[]): TagNode[] {
  const flat: TagNode[] = [];
  for (const n of nodes) {
    flat.push(n);
    if (n.children) flat.push(...flattenTree(n.children));
  }
  return flat;
}

const ALL_TAGS = flattenTree(TAG_TREE);

// --- Pre-built lookup maps for fast hierarchy resolution ---
type TagLevel = 1 | 2 | 3;
interface TagInfo {
  level: TagLevel;
  node: TagNode;
  overTag: string;       // level-1 parent tag
  katTag: string | null;  // level-2 parent tag (null for level 1)
}

const TAG_INFO_MAP = new Map<string, TagInfo>();
for (const over of TAG_TREE) {
  TAG_INFO_MAP.set(over.tag, { level: 1, node: over, overTag: over.tag, katTag: null });
  if (over.children) {
    for (const kat of over.children) {
      TAG_INFO_MAP.set(kat.tag, { level: 2, node: kat, overTag: over.tag, katTag: kat.tag });
      if (kat.children) {
        for (const under of kat.children) {
          TAG_INFO_MAP.set(under.tag, { level: 3, node: under, overTag: over.tag, katTag: kat.tag });
        }
      }
    }
  }
}

export function getTagNode(tag: string): TagNode | undefined {
  return TAG_INFO_MAP.get(tag.toLowerCase())?.node;
}

// --- Get which overkategori a tag belongs to ---
export function getOverkategoriForTag(tag: string): string | null {
  const info = TAG_INFO_MAP.get(tag.toLowerCase());
  return info ? info.overTag : null;
}

// --- Get tag level ---
export function getTagLevel(tag: string): TagLevel | null {
  return TAG_INFO_MAP.get(tag.toLowerCase())?.level ?? null;
}

// --- Related tags: 3-level aware ---
export function getRelatedTags(tag: string): string[] {
  const info = TAG_INFO_MAP.get(tag.toLowerCase());
  if (!info) return [];
  const related: string[] = [];

  if (info.level === 1) {
    // OVERKATEGORI: return all kategorier + all underkategorier
    const overNode = info.node;
    if (overNode.children) {
      for (const kat of overNode.children) {
        related.push(kat.tag);
        if (kat.children) {
          for (const under of kat.children) {
            related.push(under.tag);
          }
        }
      }
    }
  } else if (info.level === 2) {
    // KATEGORI: return parent overkategori + sibling kategorier + all children underkategorier
    related.push(info.overTag);
    const overNode = TAG_INFO_MAP.get(info.overTag)?.node;
    if (overNode?.children) {
      for (const sibling of overNode.children) {
        if (sibling.tag !== tag.toLowerCase()) {
          related.push(sibling.tag);
        }
        // Own children
        if (sibling.tag === tag.toLowerCase() && sibling.children) {
          for (const under of sibling.children) {
            related.push(under.tag);
          }
        }
      }
    }
  } else if (info.level === 3) {
    // UNDERKATEGORI: return parent kategori + sibling underkategorier + grandparent overkategori
    related.push(info.overTag);
    if (info.katTag) {
      related.push(info.katTag);
      const katNode = TAG_INFO_MAP.get(info.katTag)?.node;
      if (katNode?.children) {
        for (const sibling of katNode.children) {
          if (sibling.tag !== tag.toLowerCase()) {
            related.push(sibling.tag);
          }
        }
      }
    }
  }

  return [...new Set(related)];
}

// --- Co-occurrence: which tags appear together ---
export function buildCoOccurrence(events: Event[]): Map<string, Map<string, number>> {
  const matrix = new Map<string, Map<string, number>>();
  for (const ev of events) {
    const tags = ev.interest_tags || [];
    for (const t1 of tags) {
      if (!matrix.has(t1)) matrix.set(t1, new Map());
      for (const t2 of tags) {
        if (t1 !== t2) {
          const row = matrix.get(t1)!;
          row.set(t2, (row.get(t2) || 0) + 1);
        }
      }
    }
  }
  return matrix;
}

// --- Scoring: rank events by tag match (3-level weighted) ---
export function scoreEvent(event: Event, userTags: string[]): number {
  if (userTags.length === 0) return 0;
  const eventTags = new Set([
    ...(event.interest_tags || []),
    event.category?.toLowerCase()
  ].filter(Boolean));
  let score = 0;

  for (const ut of userTags) {
    const utLower = ut.toLowerCase();
    if (eventTags.has(utLower)) {
      score += 10; // Direct match
      continue;
    }

    const utInfo = TAG_INFO_MAP.get(utLower);
    if (!utInfo) continue;

    for (const et of eventTags) {
      const etInfo = TAG_INFO_MAP.get(et as string);
      if (!etInfo) continue;

      // Same overkategori?
      if (utInfo.overTag === etInfo.overTag) {
        // Parent↔child (1 level apart)
        if (
          (utInfo.level === 1 && etInfo.level === 2) ||
          (utInfo.level === 2 && etInfo.level === 1) ||
          (utInfo.level === 2 && etInfo.level === 3 && utInfo.katTag === etInfo.katTag) ||
          (utInfo.level === 3 && etInfo.level === 2 && utInfo.katTag === etInfo.katTag)
        ) {
          score += 5;
        }
        // Grandparent↔grandchild or siblings (2 levels apart or same level different branch)
        else if (
          (utInfo.level === 1 && etInfo.level === 3) ||
          (utInfo.level === 3 && etInfo.level === 1) ||
          (utInfo.level === 2 && etInfo.level === 2) || // sibling kategorier
          (utInfo.level === 3 && etInfo.level === 3 && utInfo.katTag === etInfo.katTag) // sibling underkategorier
        ) {
          score += 2;
        }
        // Same overkategori but distant (e.g. underkategori in different kategori)
        else {
          score += 1;
        }
      }
    }
  }
  return score;
}

// --- Feed builder: group events by overkategorier as top-level sections ---
export interface TagSection {
  tag: string;
  label: string;
  emoji: string;
  events: Event[];
}

export function buildTagFeed(events: Event[], userTags: string[]): TagSection[] {
  if (userTags.length === 0) return [];

  // Group user tags by overkategori
  const overMap = new Map<string, Set<string>>();
  for (const tag of userTags) {
    const overTag = getOverkategoriForTag(tag) || tag;
    if (!overMap.has(overTag)) overMap.set(overTag, new Set());
    overMap.get(overTag)!.add(tag);
  }

  const sections: TagSection[] = [];
  for (const [overTag, tagSet] of overMap) {
    const overNode = getTagNode(overTag);
    // Expand all tags in this group
    const expanded = new Set<string>();
    for (const t of tagSet) {
      expanded.add(t.toLowerCase());
      getRelatedTags(t).forEach(r => expanded.add(r.toLowerCase()));
    }

    const matched = events.filter(ev => {
      const eTags = new Set([
        ...(ev.interest_tags || []),
        ev.category?.toLowerCase()
      ].filter(Boolean));
      return [...eTags].some(et => expanded.has((et as string).toLowerCase()));
    });

    if (matched.length > 0) {
      sections.push({
        tag: overTag,
        label: overNode?.label || overTag,
        emoji: overNode?.emoji || "⭐",
        events: matched.slice(0, 8),
      });
    }
  }
  return sections;
}

// --- Firma targeting: match firma tags to user reach (3-level aware) ---
export function estimateFirmaReach(firmaTags: string[], allUserTags: string[][]): number {
  // Expand firma tags to include all related
  const firmaExpanded = new Set<string>();
  for (const t of firmaTags) {
    firmaExpanded.add(t.toLowerCase());
    getRelatedTags(t).forEach(r => firmaExpanded.add(r.toLowerCase()));
  }

  let matchCount = 0;
  for (const userTags of allUserTags) {
    const hasOverlap = userTags.some(ut => firmaExpanded.has(ut.toLowerCase()));
    if (hasOverlap) matchCount++;
  }
  return matchCount;
}

// --- Kort: filter events by tags for map ---
export function filterEventsForMap(events: Event[], activeTags: string[]): Event[] {
  if (activeTags.length === 0) return events;
  const expanded = new Set<string>();
  for (const t of activeTags) {
    expanded.add(t.toLowerCase());
    getRelatedTags(t).forEach(r => expanded.add(r.toLowerCase()));
  }
  return events.filter(ev => {
    const eTags = [
      ...(ev.interest_tags || []),
      ev.category?.toLowerCase()
    ].filter(Boolean);
    return eTags.some(et => expanded.has(et!.toLowerCase()));
  });
}

// --- Search: fuzzy tag search across all 3 levels ---
export function searchAllTags(query: string): TagNode[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return ALL_TAGS.filter(t =>
    t.tag.includes(q) || t.label.toLowerCase().includes(q)
  ).slice(0, 20);
}

// --- Henvisning: tag-based referral matching ---
export function getReferralTagMatch(referrerTags: string[], newUserTags: string[]): number {
  // Expand referrer tags for broader matching
  const referrerExpanded = new Set<string>();
  for (const t of referrerTags) {
    referrerExpanded.add(t.toLowerCase());
    getRelatedTags(t).forEach(r => referrerExpanded.add(r.toLowerCase()));
  }

  let matches = 0;
  for (const tag of newUserTags) {
    if (referrerExpanded.has(tag.toLowerCase())) matches++;
  }
  return Math.min(100, Math.round((matches / Math.max(newUserTags.length, 1)) * 100));
}

export { ALL_TAGS };

// --- Trending tags: count tag frequency across events ---
export function getTrendingTags(events: Event[], limit = 15): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const ev of events) {
    for (const t of ev.interest_tags || []) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

// --- Filter events by tag (with 3-level related tag expansion) ---
export function filterByTag(events: Event[], tag: string): Event[] {
  const expanded = new Set<string>();
  expanded.add(tag.toLowerCase());
  getRelatedTags(tag).forEach(r => expanded.add(r.toLowerCase()));
  return events.filter(ev => {
    const eTags = [...(ev.interest_tags || []), ev.category?.toLowerCase()].filter(Boolean);
    return eTags.some(et => expanded.has(et!.toLowerCase()));
  });
}

// --- Unified tagEngine object for convenient imports ---
export const tagEngine = {
  getUserTags,
  setUserTags,
  getFirmaTags,
  setFirmaTags,
  getTagNode,
  getTagLevel,
  getOverkategoriForTag,
  getRelatedTags: (tag: string, events?: Event[], limit?: number) => {
    const related = getRelatedTags(tag);
    if (!limit) return related.map(t => ({ tag: t }));
    return related.slice(0, limit).map(t => ({ tag: t }));
  },
  getTrendingTags,
  filterByTag,
  buildTagFeed,
  scoreEvent,
  searchAllTags,
  filterEventsForMap,
  estimateFirmaReach,
  getReferralTagMatch,
  buildCoOccurrence,
};
