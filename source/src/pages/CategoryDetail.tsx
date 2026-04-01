import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { ArrowLeft, MapPin, Users, Star, ChevronDown, ChevronRight, Search, X, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Event } from "@/lib/data";
import { getEvents } from "@/lib/data";
import { getCategoryEmoji, getEventImage, formatDanishDate } from "@/lib/eventHelpers";

import { useJoin } from "@/context/JoinContext";
import { getCategoryByKey, ALL_CATEGORIES } from "@/data/categories";
import { fetchPlaces, fetchEvents as fetchSupabaseEvents, type Place } from "@/lib/supabase";
import type { TagNode } from "@/lib/tagTree";
import { lazyLoadTagTree, lazyLoadTagFunctions, lazyLoadCategoryFunctions } from "@/lib/lazyDataLoader";
import type { CategoryPlace, CategoryActivity } from "@/data/categoryContent";

/* ═══════════════════════════════════════════════
   SMART SEARCH ENGINE
   Maps category keys to related tag-tree entries
   so "musik" → koncert, jazz, festival, jam etc.
   ═══════════════════════════════════════════════ */

const CATEGORY_TAG_MAP: Record<string, string[]> = {
  // 10 låste kategorier
  events: ["festival", "koncert", "stand-up", "quiz", "loppemarked", "julemarked", "fællesspisning", "netværk", "singles", "frivilligt"],
  logi: ["shelter", "camping", "vandrerhjem", "hytter", "glamping", "bål", "overnatning"],
  ture: ["vandring", "cykling", "mtb", "kajak", "sup", "geocaching", "orienteringsløb", "overlevelse", "bushcraft", "gåtur"],
  natur: ["natur", "skov", "strand", "nationalpark", "fiskeri", "fuglekiggeri", "hundeskov", "dyrespotting", "badning", "svampejagt", "naturlegeplads"],
  aktiv: ["cykling", "løb", "fodbold", "svømning", "fitness", "kampsport", "klatring", "tennis", "dans", "crossfit", "calisthenics", "hiit", "basketball", "golf", "ridning"],
  mad: ["mad", "madlavning", "streetfood", "sushi", "grillaften", "vinsmagning", "ølsmagning", "kaffe", "restaurant", "cafe", "bar", "foodmarket"],
  kultur: ["kunst", "maleri", "galleri", "museum", "teater", "stand-up", "impro", "poesi", "keramik", "koncert", "musik", "fotografering", "film", "kreativt"],
  rejser: ["tog", "samkørsel", "cykelruter", "færge", "roadtrip", "flydeals", "transport", "rejse", "bus", "metro"],
  communities: ["bogklub", "brætspil", "gaming", "sprogcafé", "tech", "startup", "filmaften", "ridning", "rollespil", "kortspil", "esport", "lan-party", "programmering", "hackathon"],
  wellness: ["yoga", "meditation", "sauna", "vinterbadning", "breathwork", "mindfulness", "wellness"],
  // Legacy aliases for backward compat
  musik: ["musik", "koncert", "festival", "rock", "pop", "elektronisk", "jazz", "klassisk", "hip-hop", "metal", "akustisk", "kor", "jam-session", "dj"],
  sport: ["cykling", "løb", "fodbold", "svømning", "fitness", "kampsport", "vandsport", "basketball", "tennis", "golf", "klatring", "rulleskøjter", "ridning"],
  spil: ["gaming", "brætspil", "rollespil", "kortspil", "esport", "lan-party"],
  kreativt: ["kunst", "fotografering", "film", "keramik", "strik", "skrivning"],
  fitness: ["fitness", "crossfit", "kampsport", "klatring", "dans", "calisthenics", "hiit"],
  outdoor: ["outdoor", "overlevelse", "geocaching", "rafting", "zip-line", "treetop", "bueskydning"],
  socialt: ["social", "netværk", "hygge", "book-club", "quiz", "filmaften", "picnic", "fællesspisning"],
  karriere: ["tech", "startup", "programmering", "foredrag", "hackathon", "netværk"],
  tech: ["tech", "programmering", "ai", "gaming", "drone", "3d-print", "hackathon"],
};

/** Get all tag-tree tags relevant to a category */
function getCategoryRelatedTags(categoryKey: string, tagTree: any): string[] {
  const base = CATEGORY_TAG_MAP[categoryKey] || [];
  const expanded: string[] = [...base];
  if (!tagTree) return expanded;
  for (const tag of base) {
    const parent = tagTree.find((p: any) => p.tag === tag);
    if (parent?.children) {
      expanded.push(...parent.children.map((c: any) => c.tag));
    }
  }
  return [...new Set(expanded)];
}

/** Smart search suggestions from tag tree within category context */
function getSmartSuggestions(query: string, categoryKey: string, tagTree: any): TagNode[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const relatedTags = getCategoryRelatedTags(categoryKey, tagTree);
  
  const results: TagNode[] = [];
  const seen = new Set<string>();
  
  if (!tagTree || !Array.isArray(tagTree)) return [];
  for (const parent of tagTree) {
    // Check parent match
    if (parent.tag.includes(q) || parent.label.toLowerCase().includes(q)) {
      // Only show if relevant to this category
      if (relatedTags.includes(parent.tag) || relatedTags.some(item => parent.children?.some(c => c.tag === item))) {
        if (!seen.has(parent.tag)) {
          results.push({ tag: parent.tag, emoji: parent.emoji, label: parent.label });
          seen.add(parent.tag);
        }
        if (parent.children) {
          for (const child of parent.children) {
            if (!seen.has(child.tag)) {
              results.push(child);
              seen.add(child.tag);
            }
          }
        }
      }
    }
    // Check children
    if (parent.children) {
      for (const child of parent.children) {
        if ((child.tag.includes(q) || child.label.toLowerCase().includes(q)) && !seen.has(child.tag)) {
          if (relatedTags.includes(child.tag) || relatedTags.includes(parent.tag)) {
            if (!seen.has(parent.tag)) {
              results.push({ tag: parent.tag, emoji: parent.emoji, label: parent.label });
              seen.add(parent.tag);
            }
            results.push(child);
            seen.add(child.tag);
          }
        }
      }
    }
  }
  
  return results.slice(0, 8);
}

/* ═══════════════════════════════════════════════
   COMPACT CARD COMPONENTS
   ═══════════════════════════════════════════════ */

function SpotsBar({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation();
  const remaining = total - current;
  const pct = Math.round((current / total) * 100);
  const almostFull = remaining <= 2;
  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs text-white/50 flex items-center gap-1"><Users size={9} />{current}/{total}</span>
        <span className={`text-xs font-semibold ${almostFull ? "text-orange-400" : "text-[#4ECDC4]"}`}>
          {t('category.spots_remaining', { count: remaining })}
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${almostFull ? "bg-orange-400" : "bg-[#4ECDC4]"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Compact card — used for both steder and aktiviteter in the grid ── */
function CompactCard({
  image, title, subtitle, badge, rating, distance, tags, spots, onJoin, isJoined, emoji
}: {
  image: string; title: string; subtitle: string; badge?: { text: string; color: string };
  rating?: number; distance?: string; tags?: string[];
  spots?: { current: number; total: number }; onJoin?: () => void; isJoined?: boolean; emoji?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="relative h-28">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {badge && (
          <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-white text-[11px] font-bold ${badge.color}`}>
            {badge.text}
          </span>
        )}
        <div className="absolute bottom-2 left-2.5 right-2.5">
          <h3 className="text-white font-semibold text-[13px] leading-tight line-clamp-2">
            {emoji && <span className="mr-0.5">{emoji}</span>}{title}
          </h3>
        </div>
      </div>
      <div className="p-2.5 pt-2">
        <p className="text-white/45 text-[11px] line-clamp-1 mb-1">{subtitle}</p>
        <div className="flex items-center gap-2 text-xs">
          {rating && (
            <span className="flex items-center gap-0.5 text-white/50">
              <Star size={9} className="text-amber-400 fill-amber-400" /> {rating}
            </span>
          )}
          {distance && (
            <span className="text-white/35 flex items-center gap-0.5">
              <MapPin size={8} /> {distance}
            </span>
          )}
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded-full bg-white/6 text-white/35 text-[11px]">{tag}</span>
            ))}
          </div>
        )}
        {spots && (
          <SpotsBar current={spots.current + (isJoined ? 1 : 0)} total={spots.total} />
        )}
        {onJoin && (
          <button
            onClick={onJoin}
            className={`w-full mt-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
              isJoined
                ? "bg-white/10 text-white/60"
                : "bg-[#4ECDC4]/15 text-[#4ECDC4] hover:bg-[#4ECDC4]/25"
            }`}
          >
            {isJoined ? t('category.unsubscribe') : t('category.join')}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Event mini-card ── */
function EventMiniCard({ event }: { event: Event }) {
  const { t } = useTranslation();
  const isGratis = !event.price || event.price === 0;
  return (
    <Link href={`/event/${event.id}`}>
      <div className="glass-card rounded-xl flex gap-2.5 pr-3 cursor-pointer hover:bg-white/8 transition-all">
        <div className="relative w-16 h-16 flex-shrink-0 rounded-l-xl overflow-hidden">
          <img src={getEventImage(event)} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex flex-col justify-center py-1.5 min-w-0 flex-1">
          <h3 className="text-white text-[12px] font-semibold line-clamp-1">{event.title}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-white/40 text-xs">{formatDanishDate(event.date)}</span>
            <span className={`px-1 py-0 rounded text-[11px] font-semibold ${isGratis ? "bg-[#4ECDC4]/20 text-[#4ECDC4]" : "bg-amber-500/20 text-amber-400"}`}>
              {isGratis ? t('events.free') : `${event.price} ${t('events.currency')}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Supabase place card (improved) ── */
function SupabasePlaceCard({ place }: { place: Place }) {
  const { t } = useTranslation();
  const isFree = place.smart_tags?.includes("gratis");
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-white text-[13px] font-semibold line-clamp-2 flex-1 pr-2">{place.name}</h3>
          {isFree && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#4ECDC4]/20 text-[#4ECDC4] text-[11px] font-bold whitespace-nowrap">{t('events.free')}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Star size={9} className="text-amber-400 fill-amber-400" />
          <span className="text-white/50 text-xs">{place.rating_avg?.toFixed(1)}</span>
          <span className="text-white/25">·</span>
          <span className="text-white/35 text-xs flex items-center gap-0.5">
            <MapPin size={8} />{place.city}
          </span>
          {place.region && place.region !== "Nordjylland" && (
            <>
              <span className="text-white/25">·</span>
              <span className="text-white/30 text-[11px]">{place.region}</span>
            </>
          )}
        </div>
        <p className="text-white/30 text-xs line-clamp-2 mb-1.5">{place.description}</p>
        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {place.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded-full bg-[#4ECDC4]/8 text-[#4ECDC4]/60 text-[8px]">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Collapsible section ── */
function Section({ title, icon, count, badge, children, defaultOpen = true }: {
  title: string; icon: string; count?: number; badge?: { text: string; color: string };
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-5 mb-2 w-full text-left"
      >
        <span className="text-sm">{icon}</span>
        <h2 className="text-white font-semibold text-sm">{title}</h2>
        {count !== undefined && (
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${badge ? badge.color : "bg-white/10 text-white/40"}`}>
            {badge ? badge.text : count}
          </span>
        )}
        <ChevronDown size={14} className={`text-white/30 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && children}
    </section>
  );
}

/* ── Subcategory chip ── */
function SubChip({ label, emoji, active, count, onClick }: { label: string; emoji: string; active: boolean; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all ${
        active
          ? "bg-[#4ECDC4] text-[#0a0f1a] shadow-lg shadow-[#4ECDC4]/20"
          : "glass-card text-white/60 hover:text-white hover:bg-white/10"
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {count > 0 && <span className={`text-[11px] ml-0.5 ${active ? "text-white/70" : "text-white/30"}`}>{count}</span>}
    </button>
  );
}

/* ── Active users avatars ── */
const AVATARS = [
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&crop=face",
];

function ActiveUsers({ count }: { count: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        {AVATARS.map((a, i) => (
          <img key={i} src={a} alt="" className="w-5 h-5 rounded-full border-2 border-[#0d1117] object-cover" loading="lazy" />
        ))}
      </div>
      <span className="text-white/40 text-xs">+{count} {t('category.active_users')}</span>
    </div>
  );
}

/* ── Smart suggestion chip (in autocomplete) ── */
function SuggestionChip({ node, onClick }: { node: TagNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/6 hover:bg-[#4ECDC4]/15 text-white/60 hover:text-[#4ECDC4] text-[11px] transition-all whitespace-nowrap"
    >
      <span>{node.emoji}</span>
      <span>{node.label}</span>
    </button>
  );
}


/* ═══════════════════════════════════════════════
   CATEGORY DETAIL PAGE — Smart Search Redesign
   ═══════════════════════════════════════════════ */
export default function CategoryDetail() {
  const { t } = useTranslation();

  // Lazy load data
  const [tagTree, setTagTree] = useState<any>(null);
  const [categoryFunctions, setCategoryFunctions] = useState<any>(null);

  useEffect(() => {
    // Load both datasets on component mount
    Promise.all([
      lazyLoadTagTree(),
      lazyLoadCategoryFunctions()
    ]).then(([tree, funcs]) => {
      setTagTree(tree);
      setCategoryFunctions(funcs);
    }).catch(err => console.error('Error loading data:', err));
  }, []);

  
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/kategori/:category");
  const category = params?.category || "";

  const catData = getCategoryByKey(category);
  const label = catData?.label || category;
  const emoji = catData?.emoji || getCategoryEmoji(category);
  const heroImg = catData?.image?.replace("w=400", "w=800");
  const subcats = catData?.subcategories || [];

  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<"alle" | "gratis" | "premium">("alle");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveSub(null);
    setSearchQuery("");
    setPriceFilter("alle");
    setShowSuggestions(false);
  }, [category]);
  const { joinEvent, leaveEvent, isJoined } = useJoin();

  /* ── Data sources ── */
  const { data: allJsonEvents } = useQuery<Event[]>({ queryKey: ["events"], queryFn: () => Promise.resolve(getEvents()), staleTime: 2 * 60 * 1000 });
  const { data: supabasePlaces } = useQuery<Place[]>({ queryKey: ["supabase-places-500"], queryFn: () => fetchPlaces({ limit: 500 }), staleTime: 30 * 60 * 1000 });
  const { data: supabaseEvents } = useQuery({ queryKey: ["supabase-events"], queryFn: fetchSupabaseEvents, staleTime: 2 * 60 * 1000 });

  /* ── Smart suggestions from tag tree ── */
  const suggestions = useMemo(() => {
    return getSmartSuggestions(searchQuery, category, tagTree);
  }, [searchQuery, category, tagTree]);

  /* ── Rich content from categoryContent.ts ── */
  const places = useMemo(() => {
    if (!categoryFunctions) return [];
    if (activeSub) return categoryFunctions.getSubcategoryPlaces(category, activeSub);
    return categoryFunctions.getCategoryPlaces(category);
  }, [category, activeSub, categoryFunctions]);

  const activities = useMemo(() => {
    if (!categoryFunctions) return [];
    if (activeSub) return categoryFunctions.getSubcategoryActivities(category, activeSub);
    return categoryFunctions.getCategoryActivities(category);
  }, [category, activeSub, categoryFunctions]);

  /* ── Matching events from events.json ── */
  const matchingEvents = useMemo(() => {
    const evts = allJsonEvents || [];
    const catLower = category.toLowerCase();
    const subLower = activeSub?.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    
    return evts.filter(e => {
      const eCat = (e.category || "").toLowerCase();
      const tags = (e.interest_tags || []).map(item => item.toLowerCase());
      const title = (e.title || "").toLowerCase();
      const desc = (e.description || "").toLowerCase();
      
      // Category match (broad)
      const matchesCat = eCat.includes(catLower) || tags.some(item => item.includes(catLower));
      
      if (!matchesCat) return false;
      
      // Search filter
      if (q) {
        const matchesQ = title.includes(q) || desc.includes(q) || tags.some(item => item.includes(q)) || eCat.includes(q);
        if (!matchesQ) return false;
      }
      
      // Sub filter
      if (subLower) {
        return eCat.includes(subLower) || tags.some(item => item.includes(subLower)) || title.includes(subLower) || desc.includes(subLower);
      }
      
      return true;
    }).slice(0, 6);
  }, [allJsonEvents, category, activeSub, searchQuery]);

  /* ── SMART Matching Supabase places — tag-tree aware ── */
  const matchingSupabasePlaces = useMemo(() => {
    if (!supabasePlaces) return [];
    const q = searchQuery.toLowerCase().trim();
    const relatedTags = getCategoryRelatedTags(category, tagTree);
    
    return supabasePlaces.filter(p => {
      const cats = (p.main_categories || []).map(c => c.toLowerCase());
      const tags = (p.tags || []).map(item => item.toLowerCase());
      const smartTags = (p.smart_tags || []).map(item => item.toLowerCase());
      const name = p.name.toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const allText = [...cats, ...tags, ...smartTags, name, desc];
      
      // Must match category (broad: check main_categories OR if tags overlap with category's related tags)
      const matchesCat = cats.some(c => {
        // Direct category name match
        if (c.includes(category)) return true;
        // Match against the 10 locked category labels
        const catLabel = (catData?.label || "").toLowerCase();
        if (catLabel && c.includes(catLabel)) return true;
        return false;
      }) || tags.some(item => relatedTags.includes(item)) || smartTags.some(item => relatedTags.includes(item));
      
      if (!matchesCat) return false;
      
      // Search filter — smart: expand query through tag tree
      if (q) {
        // Direct text match
        const directMatch = allText.some(item => item.includes(q));
        if (directMatch) return true;
        
        // Tag tree expansion: if user types "jazz", also match "musik", "koncert" etc.
        const tagResults = searchTags(q);
        const expandedTerms = tagResults.map(item => item.tag.toLowerCase());
        return tags.some(item => expandedTerms.includes(item)) || smartTags.some(item => expandedTerms.includes(item));
      }
      
      // Price filter
      if (priceFilter === "gratis") {
        return smartTags.includes("gratis");
      }
      if (priceFilter === "premium") {
        return !smartTags.includes("gratis");
      }
      
      return true;
    });
  }, [supabasePlaces, category, searchQuery, priceFilter, catData]);

  /* ── Subcategory info ── */
  const subInfo = activeSub ? SUBCATEGORY_INFO[activeSub] : null;

  /* ── Counts per subcategory ── */
  const subCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sub of subcats) {
      const p = categoryFunctions?.getSubcategoryPlaces(category, sub.key)?.length || 0;
      const a = categoryFunctions?.getSubcategoryActivities(category, sub.key)?.length || 0;
      counts[sub.key] = p + a;
    }
    return counts;
  }, [category, subcats]);

  /* ── Filter content by search query + price ── */
  const filteredPlaces = useMemo(() => {
    let result = places;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      // Smart search: expand through tag tree
      const tagResults = searchTags(q);
      const expandedTerms = [q, ...tagResults.map(item => item.tag.toLowerCase()), ...tagResults.map(item => item.label.toLowerCase())];

      result = result.filter(p =>
        expandedTerms.some(term =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags.some(tag => tag.toLowerCase().includes(term))
        )
      );
    }
    if (priceFilter === "gratis") result = result.filter(p => p.isFree);
    if (priceFilter === "premium") result = result.filter(p => !p.isFree && p.price && p.price > 0);
    return result;
  }, [places, searchQuery, priceFilter]);

  const filteredActivities = useMemo(() => {
    let result = activities;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const tagResults = searchTags(q);
      const expandedTerms = [q, ...tagResults.map(item => item.tag.toLowerCase()), ...tagResults.map(item => item.label.toLowerCase())];

      result = result.filter(a =>
        expandedTerms.some(term =>
          a.title.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term) ||
          a.tags.some(tag => tag.toLowerCase().includes(term))
        )
      );
    }
    if (priceFilter === "gratis") result = result.filter(a => a.price === 0);
    if (priceFilter === "premium") result = result.filter(a => a.price > 0);
    return result;
  }, [activities, searchQuery, priceFilter]);

  const totalLocalContent = filteredPlaces.length + filteredActivities.length;
  const totalDbContent = matchingSupabasePlaces.length;
  const totalContent = totalLocalContent + totalDbContent;
  const freeActivities = filteredActivities.filter(a => a.price === 0);
  const paidActivities = filteredActivities.filter(a => a.price > 0);

  const hasActiveFilter = searchQuery.trim().length > 0 || priceFilter !== "alle";

  // Apply suggestion
  const applySuggestion = useCallback((tag: TagNode) => {
    setSearchQuery(tag.label);
    setShowSuggestions(false);
    searchRef.current?.blur();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      className="relative min-h-svh pb-24"
      style={{ background: "#060a0f" }}
      data-testid="category-detail-page"
    >
      {/* ── Compact Hero ── */}
      <div className="relative w-full h-44 overflow-hidden">
        <img
          src={subInfo?.heroImage || heroImg || ""}
          alt={label}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-black/40 to-black/20" />
        <button
          onClick={() => activeSub ? setActiveSub(null) : setLocation("/udforsk")}
          className="absolute top-12 left-5 w-9 h-9 rounded-full glass-card flex items-center justify-center z-10"
          data-testid="btn-back"
        >
          <ArrowLeft size={18} className="text-white/70" />
        </button>
        <div className="absolute bottom-3 left-5 right-5">
          {activeSub && subInfo ? (
            <>
              <p className="text-white/50 text-[11px] mb-0.5">{emoji} {label}</p>
              <h1 className="text-white text-xl font-bold">{subInfo.emoji} {subInfo.label}</h1>
              <p className="text-white/50 text-xs mt-0.5">{subInfo.description}</p>
            </>
          ) : (
            <>
              <h1 className="text-white text-xl font-bold">{emoji} {label}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/50 text-xs">{totalContent} {t('category.experiences')}</span>
                <ActiveUsers count={subcats.length * 15 + 20} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Subcategory Filter Bar (sticky feel) ── */}
      {subcats.length > 0 && (
        <div className="px-5 mt-3 mb-2">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <SubChip
              label={t('category.all')}
              emoji={emoji}
              active={!activeSub}
              count={places.length + activities.length}
              onClick={() => setActiveSub(null)}
            />
            {subcats.map(sub => (
              <SubChip
                key={sub.key}
                label={sub.label}
                emoji={sub.emoji}
                active={activeSub === sub.key}
                count={subCounts[sub.key] || 0}
                onClick={() => setActiveSub(activeSub === sub.key ? null : sub.key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Smart Search + Gratis / Premium ── */}
      <div className="px-5 mt-2 mb-3 relative" data-testid="search-price-section" ref={suggestionsRef}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
              placeholder={t('category.search_in', { label })}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#4ECDC4]/40 focus:bg-white/8 transition-all"
              data-testid="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setPriceFilter(priceFilter === "gratis" ? "alle" : "gratis")}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              priceFilter === "gratis"
                ? "bg-[#4ECDC4] text-[#0a0f1a] shadow-lg shadow-[#4ECDC4]/25"
                : "bg-white/6 text-white/50 border border-white/10 hover:bg-white/10"
            }`}
            data-testid="btn-gratis"
          >
            {t('events.free')}
          </button>
          <button
            onClick={() => setPriceFilter(priceFilter === "premium" ? "alle" : "premium")}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              priceFilter === "premium"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                : "bg-white/6 text-white/50 border border-white/10 hover:bg-white/10"
            }`}
            data-testid="btn-premium"
          >
            {t('category.premium')}
          </button>
        </div>

        {/* ── Smart Autocomplete Suggestions ── */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-5 right-5 mt-1.5 z-20 glass-card rounded-xl border border-white/10 p-2.5 shadow-xl shadow-black/40">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} className="text-[#4ECDC4]" />
              <span className="text-white/40 text-xs font-medium">{t('category.suggestions_in', { label })}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map(s => (
                <SuggestionChip key={s.tag} node={s} onClick={() => applySuggestion(s)} />
              ))}
            </div>
          </div>
        )}

        {hasActiveFilter && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/40 text-xs">{totalContent} {t('category.results')}</span>
            <button
              onClick={() => { setSearchQuery(""); setPriceFilter("alle"); setShowSuggestions(false); }}
              className="text-[#4ECDC4] text-xs font-medium"
              data-testid="clear-filter-btn"
            >
              {t('category.reset')}
            </button>
          </div>
        )}
      </div>

      {/* ═══ CONTENT — compact grid layout ═══ */}
      <div className="space-y-5 mt-2">

        {/* ── Supabase steder (real data first!) ── */}
        {matchingSupabasePlaces.length > 0 && (
          <Section title={t('category.places_in_denmark')} icon="📍" count={matchingSupabasePlaces.length} badge={{ text: `${matchingSupabasePlaces.length}`, color: "bg-[#4ECDC4]/20 text-[#4ECDC4]" }} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2.5 px-5">
              {matchingSupabasePlaces.slice(0, 12).map(p => (
                <SupabasePlaceCard key={p.id} place={p} />
              ))}
            </div>
            {matchingSupabasePlaces.length > 12 && (
              <div className="px-5 mt-2">
                <button className="w-full py-2 rounded-xl bg-white/5 text-white/40 text-xs hover:bg-white/10 transition-colors">
                  {t('category.show_all_places', { count: matchingSupabasePlaces.length })}
                </button>
              </div>
            )}
          </Section>
        )}

        {/* ── Hardcoded steder — 2-column compact grid ── */}
        {filteredPlaces.length > 0 && (
          <Section title={t('category.places')} icon="🏟️" count={filteredPlaces.length} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2.5 px-5">
              {filteredPlaces.map(p => (
                <CompactCard
                  key={p.id}
                  image={p.image}
                  title={p.name}
                  subtitle={p.description}
                  badge={p.isFree ? { text: t('events.free'), color: "bg-[#4ECDC4]/80" } : p.price ? { text: `${p.price} ${t('events.currency')}`, color: "bg-amber-500/80" } : undefined}
                  rating={p.rating}
                  distance={p.distance}
                  tags={p.tags}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── Gratis aktiviteter — compact grid ── */}
        {freeActivities.length > 0 && (
          <Section title={t('events.free')} icon="🎯" count={freeActivities.length} badge={{ text: `${freeActivities.length}`, color: "bg-[#4ECDC4]/20 text-[#4ECDC4]" }} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2.5 px-5">
              {freeActivities.map(a => (
                <CompactCard
                  key={a.id}
                  image={a.image}
                  title={a.title}
                  subtitle={a.description}
                  emoji={a.emoji}
                  badge={{ text: t('events.free'), color: "bg-[#4ECDC4]/80" }}
                  distance={a.distance}
                  spots={a.spots}
                  onJoin={() => isJoined(a.id) ? leaveEvent(a.id) : joinEvent(a.id, a.title)}
                  isJoined={isJoined(a.id)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── Betalte oplevelser — compact grid ── */}
        {paidActivities.length > 0 && (
          <Section title={t('category.paid_experiences')} icon="💎" count={paidActivities.length} badge={{ text: `${paidActivities.length}`, color: "bg-amber-500/20 text-amber-400" }} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2.5 px-5">
              {paidActivities.map(a => (
                <CompactCard
                  key={a.id}
                  image={a.image}
                  title={a.title}
                  subtitle={a.description}
                  emoji={a.emoji}
                  badge={{ text: `${a.price} ${t('events.currency')}`, color: "bg-amber-500/80" }}
                  distance={a.distance}
                  spots={a.spots}
                  onJoin={() => isJoined(a.id) ? leaveEvent(a.id) : joinEvent(a.id, a.title)}
                  isJoined={isJoined(a.id)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── Events from events.json ── */}
        {matchingEvents.length > 0 && (
          <Section title={t('category.upcoming_events')} icon="🎪" count={matchingEvents.length} defaultOpen={matchingEvents.length <= 4}>
            <div className="space-y-2 px-5">
              {matchingEvents.map(e => <EventMiniCard key={e.id} event={e} />)}
            </div>
          </Section>
        )}

        {/* ── Empty state ── */}
        {totalContent === 0 && (
          <div className="flex flex-col items-center py-16 text-center px-5">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-white/60 text-sm">
              {hasActiveFilter ? t('category.no_results_with_filters') : t('category.no_experiences_yet')}
            </p>
            <p className="text-white/30 text-xs mt-1">
              {hasActiveFilter ? t('category.try_changing_filters') : t('category.be_first_create_activity')}
            </p>
            {hasActiveFilter ? (
              <button onClick={() => { setSearchQuery(""); setPriceFilter("alle"); }} className="mt-3 text-[#4ECDC4] text-sm font-medium">
                {t('category.reset_filters')}
              </button>
            ) : (
              <button onClick={() => setActiveSub(null)} className="mt-3 text-[#4ECDC4] text-sm font-medium">
                {t('category.show_all_in', { label })}
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
