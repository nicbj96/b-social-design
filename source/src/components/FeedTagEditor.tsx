import { useState, useEffect, useMemo, useCallback } from "react";
import { X, Search, ChevronDown, Check, Sparkles } from "lucide-react";
import { useTags } from "@/context/TagContext";
import type { PriceTier } from "@/context/TagContext";
import { TAG_TREE, type TagNode } from "@/lib/tagTree";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from 'react-i18next';

interface FeedTagEditorProps {
  open: boolean;
  onClose: () => void;
}

const PRICE_OPTIONS: { value: PriceTier; labelKey: string; activeClass: string }[] = [
  { value: "alle", labelKey: "tags.price_all", activeClass: "bg-white/15 text-white" },
  { value: "gratis", labelKey: "tags.price_free", activeClass: "bg-[#4ECDC4] text-[#0a0f1a] shadow-lg shadow-[#4ECDC4]/25" },
  { value: "premium", labelKey: "tags.price_premium", activeClass: "bg-amber-500 text-white shadow-lg shadow-amber-500/25" },
];

/* ── Expandable tag-tree group ── */
function TagTreeRow({ parent, selectedTags, onToggle, forceExpand }: {
  parent: TagNode & { children?: TagNode[] };
  selectedTags: Set<string>;
  onToggle: (tag: string) => void;
  forceExpand?: boolean;
}) {
  const children = parent.children || [];
  const parentSelected = selectedTags.has(parent.tag);
  const childCount = children.filter(c => selectedTags.has(c.tag)).length;
  const hasSelections = parentSelected || childCount > 0;
  const [expanded, setExpanded] = useState(forceExpand || false);

  useEffect(() => {
    if (forceExpand) setExpanded(true);
  }, [forceExpand]);

  useEffect(() => {
    if (parentSelected && children.length > 0) setExpanded(true);
  }, [parentSelected]);

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all duration-200 ${
        hasSelections
          ? "bg-[#4ECDC4]/8 ring-1 ring-[#4ECDC4]/25"
          : "bg-white/4 ring-1 ring-white/6"
      }`}
    >
      <button
        onClick={() => {
          onToggle(parent.tag);
          if (!parentSelected && children.length > 0) setExpanded(true);
        }}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
        data-testid={`feed-tag-${parent.tag}`}
      >
        <span className="text-base">{parent.emoji}</span>
        <span className={`flex-1 text-xs font-semibold ${parentSelected ? "text-[#4ECDC4]" : "text-white/70"}`}>
          {parent.label}
        </span>
        {childCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-[#4ECDC4]/20 text-[#4ECDC4] text-[11px] font-bold">
            {childCount}
          </span>
        )}
        <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all ${
          parentSelected ? "bg-[#4ECDC4]" : "bg-white/10"
        }`} style={{ width: 18, height: 18 }}>
          {parentSelected && <Check size={10} className="text-white" />}
        </div>
        {children.length > 0 && (
          <ChevronDown
            size={12}
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className={`text-white/25 transition-transform cursor-pointer hover:text-white/50 ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {expanded && children.length > 0 && (
        <div className="px-2.5 pb-2.5 pt-0">
          <div className="flex flex-wrap gap-1">
            {children.map(child => {
              const active = selectedTags.has(child.tag);
              return (
                <button
                  key={child.tag}
                  onClick={() => onToggle(child.tag)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                    active
                      ? "bg-[#4ECDC4]/20 text-[#4ECDC4] ring-1 ring-[#4ECDC4]/40"
                      : "bg-white/5 text-white/40 hover:bg-white/8 hover:text-white/60"
                  }`}
                  data-testid={`feed-tag-child-${child.tag}`}
                >
                  <span className="text-xs">{child.emoji}</span>
                  <span>{child.label}</span>
                  {active && <Check size={8} className="ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


export function FeedTagEditor({ open, onClose }: FeedTagEditorProps) {
  const { t } = useTranslation();
  const { selectedTags: contextTags, setSelectedTags, priceTier, setPriceTier, city, radius } = useTags();
  const { user } = useAuth();
  const [localTags, setLocalTags] = useState<Set<string>>(new Set());
  const [localPrice, setLocalPrice] = useState<PriceTier>(priceTier);
  const [tagSearch, setTagSearch] = useState("");

  // Sync from context when opening
  useEffect(() => {
    if (open) {
      setLocalTags(new Set(contextTags));
      setLocalPrice(priceTier);
      setTagSearch("");
    }
  }, [open, contextTags, priceTier]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Filter tag tree
  const filteredTree = useMemo(() => {
    if (!tagSearch.trim()) return TAG_TREE;
    const q = tagSearch.toLowerCase();
    return TAG_TREE.filter(parent => {
      if (parent.tag.includes(q) || parent.label.toLowerCase().includes(q)) return true;
      return parent.children?.some(c => c.tag.includes(q) || c.label.toLowerCase().includes(q));
    });
  }, [tagSearch]);

  const toggleTag = useCallback((tag: string) => {
    setLocalTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const handleSave = async () => {
    setSelectedTags([...localTags]);
    setPriceTier(localPrice);

    // Persist to Supabase if user is logged in
    if (user) {
      const tagArray = [...localTags];
      const parentTagSet = new Set(TAG_TREE.map(p => p.tag));
      const vibeKeys = tagArray.filter(item => parentTagSet.has(item));

      await supabase.from("profiles").update({
        interests: tagArray,
        vibe_tags: vibeKeys,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
    }

    onClose();
  };

  if (!open) return null;

  const tagCount = localTags.size;
  const radiusLabel = radius === 0 ? t('tags.whole_dk') : `${radius} km`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" data-testid="feed-tag-editor">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full glass-card-strong rounded-t-3xl pt-3 px-5 flex flex-col animate-in slide-in-from-bottom duration-300"
        style={{ maxHeight: "80vh", paddingBottom: "80px" }}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-bold text-lg">{t('tags.customize_feed')}</h3>
            <p className="text-white/40 text-[11px]">{city} · {radiusLabel}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center" data-testid="button-close-tag-editor">
            <X size={16} className="text-white/70" />
          </button>
        </div>

        {/* Price filter */}
        <div className="mb-3">
          <p className="text-white/40 text-xs font-medium mb-1.5">{t('tags.show_experiences')}</p>
          <div className="flex gap-2">
            {PRICE_OPTIONS.map(p => {
              const active = localPrice === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => setLocalPrice(p.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active ? p.activeClass : "bg-white/5 text-white/40 border border-white/8"
                  }`}
                  data-testid={`price-${p.value}`}
                >
                  {t(p.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tag search field ── */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={tagSearch}
            onChange={e => setTagSearch(e.target.value)}
            placeholder={t('tags.search_placeholder')}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#4ECDC4]/40 transition-all"
            data-testid="feed-tag-search"
          />
          {tagSearch && (
            <button
              onClick={() => setTagSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Tag count + reset */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-[#4ECDC4]" />
            <p className="text-white/40 text-xs font-medium">{t('tags.your_tags')}</p>
            {tagCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#4ECDC4]/15 text-[#4ECDC4] text-[11px] font-bold">
                {tagCount}
              </span>
            )}
          </div>
          {tagCount > 0 && (
            <button onClick={() => setLocalTags(new Set())} className="text-[#4ECDC4] text-xs font-medium">
              {t('tags.reset')}
            </button>
          )}
        </div>

        {/* ── Scrollable tag tree ── */}
        <div
          className="flex-1 overflow-y-auto min-h-0 space-y-1.5"
          style={{ scrollbarWidth: "none" }}
        >
          {filteredTree.map(parent => (
            <TagTreeRow
              key={parent.tag}
              parent={parent}
              selectedTags={localTags}
              onToggle={toggleTag}
              forceExpand={!!tagSearch.trim()}
            />
          ))}

          {filteredTree.length === 0 && (
            <div className="text-center py-6">
              <p className="text-white/25 text-xs">{t('tags.no_tags_match', { search: tagSearch })}</p>
            </div>
          )}

          {tagCount === 0 && !tagSearch && (
            <p className="text-white/20 text-xs mt-1 px-1">{t('tags.none_selected_shows_all')}</p>
          )}
        </div>

        {/* Save — fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pt-3" style={{ background: "linear-gradient(to top, rgba(20,26,46,1) 70%, transparent)" }}>
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-[#4ECDC4] text-[#0a0f1a] font-semibold text-sm hover:bg-[#0EA372] active:scale-[0.98] transition-all shadow-lg shadow-[#4ECDC4]/20"
            data-testid="button-save-tags"
          >
            {t('tags.save')} ({tagCount === 0 ? t('tags.shows_all') : t('tags.tag_count', { count: tagCount })} · {t(PRICE_OPTIONS.find(p => p.value === localPrice)?.labelKey ?? 'tags.price_all')})
          </button>
        </div>
      </div>
    </div>
  );
}
