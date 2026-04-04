/**
 * DrillDownFilter — 3-level hierarchical tag filter
 * ═══════════════════════════════════════════════════
 * Shows L1 overkategorier as main chips.
 * Clicking an L1 → expands to show L2 kategorier.
 * Clicking an L2 → expands to show L3 underkategorier.
 * Clicking an L3 → highlights as active; click again to deselect.
 * Breadcrumb trail shows the current path with back navigation.
 *
 * Used in: Udforsk (places section), Kort (sidebar), etc.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  fetchTagTree,
  type HierarchyNode,
} from "@/lib/tagApi";

/* ── Props ── */

interface DrillDownFilterProps {
  /** Called when filter selection changes. null = show all. */
  onFilterChange: (slugs: string[] | null) => void;
  /** CSS class prefix for scoping styles */
  classPrefix?: string;
  /** Show compact single-row mode (for map sidebar) */
  compact?: boolean;
}

/* ── Component ── */

export default function DrillDownFilter({
  onFilterChange,
  classPrefix = "ddf",
  compact = false,
}: DrillDownFilterProps) {
  const p = classPrefix;

  const [tree, setTree] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down state: active slug at each level
  const [activeL1, setActiveL1] = useState<string | null>(null);
  const [activeL2, setActiveL2] = useState<string | null>(null);
  const [activeL3, setActiveL3] = useState<string | null>(null);

  // Load tag tree on mount (cached in tagApi — fast after first load)
  useEffect(() => {
    fetchTagTree()
      .then(t => { setTree(t); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Derived lists
  const l2Items = useMemo(() => {
    if (!activeL1) return [];
    return tree.find(n => n.tag === activeL1)?.children || [];
  }, [tree, activeL1]);

  const l3Items = useMemo(() => {
    if (!activeL1 || !activeL2) return [];
    return tree
      .find(n => n.tag === activeL1)?.children
      ?.find(n => n.tag === activeL2)?.children || [];
  }, [tree, activeL1, activeL2]);

  // Collect all descendant slugs for a node (for broad filtering)
  const collectDescendants = useCallback((node: HierarchyNode): string[] => {
    const slugs: string[] = [node.tag];
    if (node.children) {
      for (const child of node.children) slugs.push(...collectDescendants(child));
    }
    return slugs;
  }, []);

  // ── L1 click ──
  const handleL1Click = useCallback((slug: string) => {
    if (slug === activeL1) {
      // Toggle off → clear everything
      setActiveL1(null); setActiveL2(null); setActiveL3(null);
      onFilterChange(null);
      return;
    }
    setActiveL1(slug); setActiveL2(null); setActiveL3(null);
    const node = tree.find(n => n.tag === slug);
    onFilterChange(node ? collectDescendants(node) : [slug]);
  }, [activeL1, tree, collectDescendants, onFilterChange]);

  // ── L2 click ──
  const handleL2Click = useCallback((slug: string) => {
    if (slug === activeL2) {
      // Toggle off → back to L1 scope
      setActiveL2(null); setActiveL3(null);
      const l1Node = tree.find(n => n.tag === activeL1);
      onFilterChange(l1Node ? collectDescendants(l1Node) : null);
      return;
    }
    setActiveL2(slug); setActiveL3(null);
    const l1Node = tree.find(n => n.tag === activeL1);
    const l2Node = l1Node?.children?.find(n => n.tag === slug);
    onFilterChange(l2Node ? collectDescendants(l2Node) : [slug]);
  }, [activeL2, activeL1, tree, collectDescendants, onFilterChange]);

  // ── L3 click ──
  const handleL3Click = useCallback((slug: string) => {
    if (slug === activeL3) {
      // Toggle off → back to L2 scope
      setActiveL3(null);
      const l1Node = tree.find(n => n.tag === activeL1);
      const l2Node = l1Node?.children?.find(n => n.tag === activeL2);
      onFilterChange(l2Node ? collectDescendants(l2Node) : null);
      return;
    }
    setActiveL3(slug);
    onFilterChange([slug]);
  }, [activeL3, activeL1, activeL2, tree, collectDescendants, onFilterChange]);

  // ── Back navigation ──
  const handleBack = useCallback(() => {
    if (activeL3) {
      setActiveL3(null);
      const l1Node = tree.find(n => n.tag === activeL1);
      const l2Node = l1Node?.children?.find(n => n.tag === activeL2);
      onFilterChange(l2Node ? collectDescendants(l2Node) : null);
    } else if (activeL2) {
      setActiveL2(null);
      const l1Node = tree.find(n => n.tag === activeL1);
      onFilterChange(l1Node ? collectDescendants(l1Node) : null);
    } else if (activeL1) {
      setActiveL1(null);
      onFilterChange(null);
    }
  }, [activeL1, activeL2, activeL3, tree, collectDescendants, onFilterChange]);

  // ── Clear all ──
  const handleClearAll = useCallback(() => {
    setActiveL1(null); setActiveL2(null); setActiveL3(null);
    onFilterChange(null);
  }, [onFilterChange]);

  // Active node info for breadcrumb labels
  const activeL1Node = useMemo(() => tree.find(n => n.tag === activeL1), [tree, activeL1]);
  const activeL2Node = useMemo(
    () => activeL1Node?.children?.find(n => n.tag === activeL2),
    [activeL1Node, activeL2]
  );
  const activeL3Node = useMemo(
    () => activeL2Node?.children?.find(n => n.tag === activeL3),
    [activeL2Node, activeL3]
  );

  if (loading) return <div className={`${p}-loading`}>Indlæser kategorier…</div>;

  return (
    <div className={`${p}-wrap${compact ? ` ${p}-compact` : ""}`}>

      {/* ── Breadcrumb (shown once any level is active) ── */}
      {activeL1 && (
        <div className={`${p}-breadcrumb`}>
          <button onClick={handleBack} className={`${p}-back`} aria-label="Tilbage">
            <ChevronLeft size={14} />
          </button>
          <button onClick={handleClearAll} className={`${p}-crumb`}>Alle</button>
          <ChevronRight size={10} className={`${p}-crumb-sep`} />
          <button
            onClick={() => { setActiveL2(null); setActiveL3(null); handleL1Click(activeL1); }}
            className={`${p}-crumb${!activeL2 ? ` ${p}-crumb-active` : ""}`}
          >
            {activeL1Node?.emoji} {activeL1Node?.label}
          </button>
          {activeL2 && activeL2Node && (
            <>
              <ChevronRight size={10} className={`${p}-crumb-sep`} />
              <button
                onClick={() => { setActiveL3(null); handleL2Click(activeL2); }}
                className={`${p}-crumb${!activeL3 ? ` ${p}-crumb-active` : ""}`}
              >
                {activeL2Node.emoji} {activeL2Node.label}
              </button>
            </>
          )}
          {activeL3 && activeL3Node && (
            <>
              <ChevronRight size={10} className={`${p}-crumb-sep`} />
              <span className={`${p}-crumb ${p}-crumb-active`}>
                {activeL3Node.emoji} {activeL3Node.label}
              </span>
            </>
          )}
        </div>
      )}

      {/* ── L1 row (no active L1) ── */}
      {!activeL1 && (
        <div className={`${p}-row`}>
          <button className={`${p}-chip active`} onClick={handleClearAll}>
            <span>✨</span> Alle
          </button>
          {tree.map(node => (
            <button
              key={node.tag}
              className={`${p}-chip`}
              onClick={() => handleL1Click(node.tag)}
            >
              <span>{node.emoji}</span> {node.label}
            </button>
          ))}
        </div>
      )}

      {/* ── L2 row (L1 active, no L2 active) ── */}
      {activeL1 && !activeL2 && l2Items.length > 0 && (
        <div className={`${p}-row`}>
          {l2Items.map(node => (
            <button
              key={node.tag}
              className={`${p}-chip${activeL2 === node.tag ? " active" : ""}`}
              onClick={() => handleL2Click(node.tag)}
            >
              <span>{node.emoji}</span> {node.label}
            </button>
          ))}
        </div>
      )}

      {/* ── L3 row (L2 active) ── */}
      {activeL2 && l3Items.length > 0 && (
        <div className={`${p}-row`}>
          {l3Items.map(node => (
            <button
              key={node.tag}
              className={`${p}-chip${activeL3 === node.tag ? " active" : ""}`}
              onClick={() => handleL3Click(node.tag)}
            >
              <span>{node.emoji}</span> {node.label}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
