import FirmaLayout from "@/components/FirmaLayout";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  Briefcase,
  Heart,
  MapPin,
  Clock,
  Search,
  Plus,
  X,
  ChevronDown,
  Star,
  MessageSquare,
  Tag,
  Sparkles,
  Loader2,
} from "lucide-react";
import { supabase, fetchProfiles, type Profile } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { TagNode } from "@/lib/tagTree";
import { lazyLoadTagTree } from "@/lib/lazyDataLoader";
import { getTagNode, getRelatedTags } from "@/lib/tagEngine";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

type EmploymentType = "volunteer" | "part_time" | "full_time" | "project";
type PositionStatus = "open" | "closed" | "draft";

interface Position {
  id: string;
  title: string;
  description: string;
  employment_type: EmploymentType;
  is_volunteer: boolean;
  city: string;
  tags: string[];
  status: PositionStatus;
  applicants: number;
  created_at: string;
}

const EMPLOYMENT_LABEL_KEYS: Record<EmploymentType, string> = {
  volunteer: "recruitment.employmentType.volunteer",
  part_time: "recruitment.employmentType.partTime",
  full_time: "recruitment.employmentType.fullTime",
  project: "recruitment.employmentType.project",
};

const EMPLOYMENT_COLORS: Record<EmploymentType, string> = {
  volunteer: "fr-badge-purple",
  part_time: "fr-badge-blue",
  full_time: "fr-badge-emerald",
  project: "fr-badge-yellow",
};

const STATUS_COLORS: Record<PositionStatus, string> = {
  open: "fr-badge-emerald",
  closed: "fr-badge-muted",
  draft: "fr-badge-yellow",
};

// Build selectable tag categories from TAG_TREE (use level-2 kategorier as options)
// This will be loaded lazily within the component

// Tag chip component
function TagChip({ label, emoji, selected, onClick }: { label: string; emoji?: string; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={selected ? "fr-tag-chip fr-tag-chip-active" : "fr-tag-chip"}
    >
      {emoji && <span style={{ marginRight: 4 }}>{emoji}</span>}
      {label}
    </button>
  );
}

// Tag category selector — uses TAG_TREE
function TagCategorySelector({
  title,
  emoji,
  tags,
  selectedTags,
  onToggle,
}: {
  title: string;
  emoji: string;
  tags: { tag: string; label: string; emoji: string }[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const visibleTags = expanded ? tags : tags.slice(0, 5);
  return (
    <div className="fr-tag-cat">
      <div className="fr-tag-cat-title">
        <span>{emoji}</span>
        {title}
      </div>
      <div className="fr-tag-wrap">
        {visibleTags.map((item) => (
          <TagChip
            key={item.tag}
            label={item.label}
            emoji={item.emoji}
            selected={selectedTags.includes(item.tag)}
            onClick={() => onToggle(item.tag)}
          />
        ))}
        {tags.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="fr-tag-more"
          >
            {expanded ? t('recruitment.showLess') : `+${tags.length - 5} ${t('recruitment.more')}`}
          </button>
        )}
      </div>
    </div>
  );
}

// Match score ring
function MatchRing({ score }: { score: number }) {
  const c = 2 * Math.PI * 16;
  const offset = c - (score / 100) * c;
  const color = score >= 90 ? "#4ECDC4" : score >= 80 ? "#60a5fa" : "#fbbf24";
  return (
    <div className="fr-ring-wrap">
      <svg className="fr-ring-svg" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <circle cx="18" cy="18" r="16" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="fr-ring-label">
        <span className="fr-ring-num">{score}</span>
      </div>
    </div>
  );
}

// Score a candidate profile against position tags using tag-tree hierarchy
function scoreCandidateMatch(candidateTags: string[], positionTags: string[]): number {
  if (positionTags.length === 0 || candidateTags.length === 0) return 0;

  const candidateSet = new Set(candidateTags.map((item) => item.toLowerCase()));
  let score = 0;
  const maxScore = positionTags.length * 10;

  for (const pt of positionTags) {
    const ptLower = pt.toLowerCase();
    if (candidateSet.has(ptLower)) {
      score += 10; // Direct match
      continue;
    }
    // Check related tags
    const related = getRelatedTags(pt);
    for (const rt of related) {
      if (candidateSet.has(rt.toLowerCase())) {
        score += 4; // Related match
        break;
      }
    }
  }

  return Math.min(99, Math.round((score / maxScore) * 100));
}

/* ── Scoped CSS ── */
const firmaRekrutteringCSS = `
${pageBase("fr")}

/* ── Page layout ── */
.fr-page { display: flex; flex-direction: column; gap: 28px; padding: 32px 0; }

/* ── Header row ── */
.fr-header {
  display: flex; flex-direction: column; gap: 16px;
}
@media (min-width: 640px) {
  .fr-header { flex-direction: row; align-items: center; justify-content: space-between; }
}
.fr-header-title {
  font-family: var(--serif);
  font-size: 24px; font-weight: 400; letter-spacing: -0.5px;
  display: flex; align-items: center; gap: 8px;
  color: var(--pg-white);
}
.fr-header-sub { font-size: 13px; color: var(--pg-white-muted); margin-top: 4px; }

/* ── Stats grid ── */
.fr-stats {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
@media (min-width: 640px) {
  .fr-stats { grid-template-columns: repeat(4, 1fr); }
}
.fr-stat-card {
  background: var(--glass-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 20px; text-align: center;
  transition: border-color 0.3s, background 0.3s;
}
.fr-stat-card:hover { background: var(--glass-bg-hover); border-color: var(--glass-border-hover); }
.fr-stat-val {
  font-family: var(--serif); font-size: 28px; font-weight: 400; line-height: 1;
}
.fr-stat-val-teal { color: var(--teal); }
.fr-stat-val-purple { color: #a78bfa; }
.fr-stat-val-blue { color: #60a5fa; }
.fr-stat-val-emerald { color: #34d399; }
.fr-stat-lbl {
  font-size: 11px; color: var(--pg-white-muted);
  text-transform: uppercase; letter-spacing: 1.5px; margin-top: 6px;
}

/* ── Tabs ── */
.fr-tabs {
  display: flex; gap: 4px; padding: 4px;
  background: rgba(255,255,255,0.04); border-radius: 12px; width: fit-content;
}
.fr-tab {
  padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;
  color: var(--pg-white-muted); cursor: pointer; border: none; background: none;
  font-family: var(--sans); transition: all 0.25s;
}
.fr-tab:hover { color: var(--pg-white-dim); }
.fr-tab-active {
  background: var(--teal); color: var(--bg); font-weight: 600;
}

/* ── Filters row ── */
.fr-filters {
  display: flex; flex-direction: column; gap: 12px;
}
@media (min-width: 640px) {
  .fr-filters { flex-direction: row; }
}
.fr-search-wrap { position: relative; flex: 1; }
.fr-search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: var(--pg-white-muted); pointer-events: none;
}
.fr-search-input {
  width: 100%; padding: 12px 18px 12px 40px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; color: var(--pg-white); font-size: 14px;
  font-family: var(--sans); outline: none; transition: border-color 0.25s;
}
.fr-search-input:focus { border-color: rgba(78,205,196,0.4); }
.fr-search-input::placeholder { color: rgba(255,255,255,0.3); }
.fr-filter-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.fr-filter-btn {
  padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 500;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04);
  color: var(--pg-white-muted); cursor: pointer; font-family: var(--sans);
  transition: all 0.25s;
}
.fr-filter-btn:hover { border-color: rgba(255,255,255,0.15); }
.fr-filter-btn-active {
  background: var(--teal-dim); color: var(--teal);
  border-color: rgba(78,205,196,0.25);
}

/* ── Badges ── */
.fr-badge {
  display: inline-flex; padding: 2px 10px; border-radius: 100px;
  font-size: 11px; font-weight: 500; border: 1px solid;
  font-family: var(--sans);
}
.fr-badge-purple { background: rgba(167,139,250,0.12); color: #a78bfa; border-color: rgba(167,139,250,0.2); }
.fr-badge-blue { background: rgba(96,165,250,0.12); color: #60a5fa; border-color: rgba(96,165,250,0.2); }
.fr-badge-emerald { background: rgba(52,211,153,0.12); color: #34d399; border-color: rgba(52,211,153,0.2); }
.fr-badge-yellow { background: rgba(251,191,36,0.12); color: #fbbf24; border-color: rgba(251,191,36,0.2); }
.fr-badge-muted { background: rgba(255,255,255,0.04); color: var(--pg-white-muted); border-color: rgba(255,255,255,0.08); }

/* ── Position card (glass) ── */
.fr-pos-card {
  background: var(--glass-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 20px; cursor: pointer; transition: all 0.3s;
}
.fr-pos-card:hover { background: var(--glass-bg-hover); border-color: var(--glass-border-hover); }
.fr-pos-card-selected { border-color: rgba(78,205,196,0.35); box-shadow: 0 0 0 1px rgba(78,205,196,0.15); }
.fr-pos-top { display: flex; align-items: flex-start; justify-content: space-between; }
.fr-pos-body { flex: 1; }
.fr-pos-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
.fr-pos-title { font-size: 14px; font-weight: 600; color: var(--pg-white); }
.fr-pos-desc { font-size: 12px; color: var(--pg-white-muted); margin-bottom: 8px; }
.fr-pos-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.fr-pos-tag {
  padding: 2px 10px; border-radius: 100px; font-size: 11px;
  background: var(--teal-dim); color: var(--teal); border: 1px solid rgba(78,205,196,0.2);
}
.fr-pos-meta { display: flex; align-items: center; gap: 16px; font-size: 12px; color: var(--pg-white-muted); }
.fr-pos-meta-item { display: flex; align-items: center; gap: 4px; }
.fr-pos-chevron { color: var(--pg-white-muted); transition: transform 0.3s; }
.fr-pos-chevron-open { transform: rotate(180deg); }

/* ── Position expanded candidates ── */
.fr-pos-expand {
  margin-top: 16px; padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.fr-pos-expand-title {
  font-size: 14px; font-weight: 500; color: var(--pg-white);
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}

/* ── Candidate row ── */
.fr-cand-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; border-radius: 12px;
  transition: background 0.2s;
}
.fr-cand-row:hover { background: rgba(255,255,255,0.04); }
.fr-cand-left { display: flex; align-items: center; gap: 12px; }
.fr-cand-avatar {
  width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
}
.fr-cand-avatar-placeholder {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--teal-dim); display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--teal);
}
.fr-cand-avatar-lg { width: 44px; height: 44px; }
.fr-cand-avatar-placeholder-lg { width: 44px; height: 44px; font-size: 14px; }
.fr-cand-name { font-size: 13px; font-weight: 500; color: var(--pg-white); }
.fr-cand-city { font-size: 11px; color: var(--pg-white-muted); display: flex; align-items: center; gap: 3px; }
.fr-cand-right { display: flex; align-items: center; gap: 10px; }
.fr-cand-tags { display: flex; flex-wrap: wrap; gap: 4px; max-width: 200px; }
.fr-cand-tag-match {
  padding: 2px 8px; border-radius: 6px; font-size: 11px;
  background: rgba(78,205,196,0.12); color: var(--teal);
}
.fr-cand-tag-related {
  padding: 2px 8px; border-radius: 6px; font-size: 11px;
  background: rgba(255,255,255,0.04); color: var(--pg-white-muted);
}
.fr-cand-tag-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.fr-msg-btn {
  padding: 6px; border-radius: 10px; background: none; border: none;
  cursor: pointer; color: var(--pg-white-muted); transition: background 0.2s;
}
.fr-msg-btn:hover { background: rgba(255,255,255,0.08); }

/* ── Match ring ── */
.fr-ring-wrap { position: relative; width: 40px; height: 40px; flex-shrink: 0; }
.fr-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.fr-ring-label {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
}
.fr-ring-num { font-size: 11px; font-weight: 700; color: var(--pg-white); }

/* ── Tag chips ── */
.fr-tag-chip {
  padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 500;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04);
  color: var(--pg-white-muted); cursor: pointer; font-family: var(--sans);
  transition: all 0.25s; display: inline-flex; align-items: center;
}
.fr-tag-chip:hover { border-color: rgba(255,255,255,0.18); }
.fr-tag-chip-active {
  background: var(--teal-dim); color: var(--teal); border-color: rgba(78,205,196,0.25);
}
.fr-tag-more {
  padding: 6px 12px; border-radius: 100px; font-size: 12px;
  color: var(--teal); background: none; border: none; cursor: pointer;
  font-family: var(--sans); transition: background 0.2s;
}
.fr-tag-more:hover { background: rgba(78,205,196,0.08); }
.fr-tag-cat { display: flex; flex-direction: column; gap: 8px; }
.fr-tag-cat-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 500; color: var(--pg-white-muted);
}
.fr-tag-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.fr-selected-row {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
}
.fr-selected-label { font-size: 13px; font-weight: 500; color: var(--pg-white); }
.fr-clear-btn {
  font-size: 12px; color: var(--pg-white-muted); background: none; border: none;
  cursor: pointer; font-family: var(--sans); transition: color 0.2s;
}
.fr-clear-btn:hover { color: var(--pg-white); }
.fr-removable-chip {
  padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 500;
  background: var(--teal-dim); color: var(--teal);
  border: 1px solid rgba(78,205,196,0.25); cursor: pointer;
  display: inline-flex; align-items: center; gap: 4px; font-family: var(--sans);
}

/* ── Candidates tab glass card ── */
.fr-cand-glass {
  background: var(--glass-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  overflow: hidden;
}
.fr-cand-glass-pad { padding: 20px; }
.fr-cand-glass-header {
  padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.fr-cand-divider { border-top: 1px solid rgba(255,255,255,0.04); }
.fr-section-title {
  font-size: 14px; font-weight: 600; color: var(--pg-white);
  display: flex; align-items: center; gap: 8px;
}
.fr-section-sub { font-size: 12px; color: var(--pg-white-muted); margin-bottom: 16px; margin-top: 4px; }
.fr-section-count { font-size: 12px; color: var(--pg-white-muted); font-weight: 400; }
.fr-border-top { margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }

/* ── Create form ── */
.fr-form-group { display: flex; flex-direction: column; gap: 6px; }
.fr-form-label { font-size: 13px; font-weight: 500; color: var(--pg-white); display: flex; align-items: center; gap: 6px; }
.fr-form-input {
  width: 100%; padding: 12px 16px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; color: var(--pg-white); font-size: 14px;
  font-family: var(--sans); outline: none; transition: border-color 0.25s;
  box-sizing: border-box;
}
.fr-form-input:focus { border-color: rgba(78,205,196,0.4); }
.fr-form-input::placeholder { color: rgba(255,255,255,0.3); }
.fr-form-textarea { resize: none; min-height: 80px; }
.fr-form-grid {
  display: grid; grid-template-columns: 1fr; gap: 16px;
}
@media (min-width: 640px) {
  .fr-form-grid { grid-template-columns: 1fr 1fr; }
}
.fr-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.fr-type-btn {
  padding: 10px 14px; border-radius: 10px; font-size: 12px; font-weight: 500;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04);
  color: var(--pg-white-muted); cursor: pointer; font-family: var(--sans);
  transition: all 0.25s; display: inline-flex; align-items: center; gap: 4px;
}
.fr-type-btn:hover { border-color: rgba(255,255,255,0.15); }

/* ── Preview match box ── */
.fr-preview-match {
  padding: 16px; border-radius: 14px;
  background: rgba(78,205,196,0.05); border: 1px solid rgba(78,205,196,0.1);
}
.fr-preview-title {
  font-size: 13px; font-weight: 500; color: var(--pg-white);
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.fr-avatar-stack { display: flex; }
.fr-avatar-stack > * { margin-left: -8px; }
.fr-avatar-stack > *:first-child { margin-left: 0; }
.fr-avatar-stack-img {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid var(--bg); object-fit: cover;
}
.fr-avatar-stack-ph {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid var(--bg); background: var(--teal-dim);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: var(--teal);
}

/* ── Action buttons ── */
.fr-actions { display: flex; gap: 12px; padding-top: 8px; }

/* ── Empty state ── */
.fr-empty {
  text-align: center; padding: 48px 0;
  color: var(--pg-white-muted); font-size: 13px;
}
.fr-empty-icon { margin: 0 auto 12px; opacity: 0.4; }

/* ── Loader ── */
.fr-loader {
  display: flex; align-items: center; justify-content: center; padding: 48px 0;
}
.fr-loader-inline {
  display: flex; align-items: center; gap: 8px; font-size: 12px;
  color: var(--pg-white-muted); padding: 8px 0;
}
@keyframes fr-spin { to { transform: rotate(360deg); } }
.fr-spin { animation: fr-spin 1s linear infinite; }

/* ── Flex / spacing helpers ── */
.fr-gap-4 { display: flex; flex-direction: column; gap: 16px; }
.fr-gap-3 { display: flex; flex-direction: column; gap: 12px; }
`;

export default function FirmaRekruttering() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const containerRef = useFadeUp("fr");
  const [activeTab, setActiveTab] = useState<"positions" | "candidates" | "create">("positions");
  const [positions, setPositions] = useState<Position[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [filterType, setFilterType] = useState<EmploymentType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tagCategories, setTagCategories] = useState<{ title: string; emoji: string; tags: { tag: string; label: string; emoji: string }[] }[]>([]);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<EmploymentType>("volunteer");
  const [newCity, setNewCity] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);

  // Candidate search tags
  const [searchTags, setSearchTags] = useState<string[]>([]);

  // Load tagCategories lazily on mount
  useEffect(() => {
    lazyLoadTagTree()
      .then(TAG_TREE => {
        const categories = TAG_TREE.map((over) => ({
          title: over.label,
          emoji: over.emoji,
          tags: (over.children || []).map((kat) => ({ tag: kat.tag, label: kat.label, emoji: kat.emoji })),
        }));
        setTagCategories(categories);
      })
      .catch(err => {
        console.error("[FirmaRekruttering] Failed to load tag categories:", err);
        setTagCategories([]);
      });
  }, []);

  // Load positions from Supabase
  useEffect(() => {
    loadPositions();
  }, [user]);

  async function loadPositions() {
    if (!user) { setLoadingPositions(false); return; }
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setLoadingPositions(false);
      return;
    }

    setPositions(data.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description || "",
      employment_type: p.employment_type || "volunteer",
      is_volunteer: p.employment_type === "volunteer",
      city: p.city || "",
      tags: p.tags || [],
      status: p.status || "open",
      applicants: p.applicant_count || 0,
      created_at: p.created_at,
    })));
    setLoadingPositions(false);
  }

  // Load real profiles when candidate tab is active or when a position is expanded
  async function loadProfiles() {
    if (allProfiles.length > 0) return; // already loaded
    setLoadingProfiles(true);
    const profiles = await fetchProfiles();
    setAllProfiles(profiles);
    setLoadingProfiles(false);
  }

  useEffect(() => {
    if (activeTab === "candidates" || selectedPosition) {
      loadProfiles();
    }
  }, [activeTab, selectedPosition]);

  const toggleTag = (tag: string) => {
    setNewTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : prev.length < 8 ? [...prev, tag] : prev);
  };

  const toggleSearchTag = (tag: string) => {
    setSearchTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : prev.length < 8 ? [...prev, tag] : prev);
  };

  const filteredPositions = positions.filter((p) => {
    if (filterType !== "all" && p.employment_type !== filterType) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getMatchedCandidates = (tags: string[]) => {
    return allProfiles
      .filter((p) => p.interests && p.interests.length > 0)
      .map((p) => ({
        ...p,
        matchScore: scoreCandidateMatch(p.interests || [], tags),
      }))
      .filter((c) => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const candidateResults = searchTags.length > 0 ? getMatchedCandidates(searchTags) : [];

  return (
    <FirmaLayout>
      <style>{firmaRekrutteringCSS}</style>
      <div className="fr-root" ref={containerRef}>
        <div className="fr-page">

          {/* ── Header ── */}
          <div className="fr-header fr-fade-up">
            <div>
              <div className="fr-eyebrow" style={{ marginBottom: 8 }}>
                <div className="fr-eyebrow-line" />
                B-Social Firma
              </div>
              <h1 className="fr-header-title">
                <Users size={24} style={{ color: "var(--teal)" }} />
                {t('recruitment.title')}
              </h1>
              <p className="fr-header-sub">{t('recruitment.subtitle')}</p>
            </div>
            <button
              onClick={() => setActiveTab("create")}
              className="fr-btn"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Plus size={16} />
              {t('recruitment.createRole')}
            </button>
          </div>

          {/* ── Stats row ── */}
          <div className="fr-stats fr-fade-up fr-d1">
            <div className="fr-stat-card">
              <div className="fr-stat-val fr-stat-val-teal">{positions.filter((p) => p.status === "open").length}</div>
              <div className="fr-stat-lbl">{t('recruitment.stats.openRoles')}</div>
            </div>
            <div className="fr-stat-card">
              <div className="fr-stat-val fr-stat-val-purple">{positions.filter((p) => p.is_volunteer).length}</div>
              <div className="fr-stat-lbl">{t('recruitment.stats.volunteers')}</div>
            </div>
            <div className="fr-stat-card">
              <div className="fr-stat-val fr-stat-val-blue">{positions.reduce((a, p) => a + p.applicants, 0)}</div>
              <div className="fr-stat-lbl">{t('recruitment.stats.applicants')}</div>
            </div>
            <div className="fr-stat-card">
              <div className="fr-stat-val fr-stat-val-emerald">{allProfiles.length}</div>
              <div className="fr-stat-lbl">{t('recruitment.stats.userProfiles')}</div>
            </div>
          </div>

          {/* ── Tab navigation ── */}
          <div className="fr-tabs fr-fade-up fr-d2">
            {(["positions", "candidates", "create"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`fr-tab${activeTab === tab ? " fr-tab-active" : ""}`}
              >
                {tab === "positions" ? t('recruitment.tabs.yourRoles') : tab === "candidates" ? t('recruitment.tabs.findCandidates') : t('recruitment.tabs.createRole')}
              </button>
            ))}
          </div>

          {/* ── POSITIONS TAB ── */}
          {activeTab === "positions" && (
            <div className="fr-gap-4 fr-fade-up fr-d3">
              {loadingPositions && (
                <div className="fr-loader">
                  <Loader2 size={24} className="fr-spin" style={{ color: "var(--teal)" }} />
                </div>
              )}

              {!loadingPositions && (
                <>
                  {/* Filters */}
                  <div className="fr-filters">
                    <div className="fr-search-wrap">
                      <Search size={16} className="fr-search-icon" />
                      <input
                        type="text"
                        placeholder={t('recruitment.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="fr-search-input"
                      />
                    </div>
                    <div className="fr-filter-btns">
                      {(["all", "volunteer", "part_time", "full_time", "project"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`fr-filter-btn${filterType === type ? " fr-filter-btn-active" : ""}`}
                        >
                          {type === "all" ? t('recruitment.filterAll') : t(EMPLOYMENT_LABEL_KEYS[type])}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position list */}
                  {filteredPositions.length === 0 && (
                    <div className="fr-empty">
                      <Briefcase size={28} className="fr-empty-icon" />
                      {t('recruitment.noRolesFound')}
                    </div>
                  )}

                  <div className="fr-gap-3">
                    {filteredPositions.map((pos) => (
                      <div
                        key={pos.id}
                        className={`fr-pos-card${selectedPosition?.id === pos.id ? " fr-pos-card-selected" : ""}`}
                        onClick={() => setSelectedPosition(selectedPosition?.id === pos.id ? null : pos)}
                      >
                        <div className="fr-pos-top">
                          <div className="fr-pos-body">
                            <div className="fr-pos-title-row">
                              <span className="fr-pos-title">{pos.title}</span>
                              <span className={`fr-badge ${EMPLOYMENT_COLORS[pos.employment_type]}`}>
                                {t(EMPLOYMENT_LABEL_KEYS[pos.employment_type])}
                              </span>
                              <span className={`fr-badge ${STATUS_COLORS[pos.status]}`}>
                                {pos.status}
                              </span>
                            </div>
                            <p className="fr-pos-desc">{pos.description}</p>
                            <div className="fr-pos-tags">
                              {pos.tags.map((tag) => {
                                const node = getTagNode(tag);
                                return (
                                  <span key={tag} className="fr-pos-tag">
                                    {node?.emoji && <span style={{ marginRight: 2 }}>{node.emoji}</span>}
                                    {node?.label || tag}
                                  </span>
                                );
                              })}
                            </div>
                            <div className="fr-pos-meta">
                              {pos.city && <span className="fr-pos-meta-item"><MapPin size={12} />{pos.city}</span>}
                              <span className="fr-pos-meta-item"><UserPlus size={12} />{pos.applicants} {t('recruitment.applicantsLabel')}</span>
                              <span className="fr-pos-meta-item"><Clock size={12} />{new Date(pos.created_at).toLocaleDateString("da-DK")}</span>
                            </div>
                          </div>
                          <ChevronDown size={16} className={`fr-pos-chevron${selectedPosition?.id === pos.id ? " fr-pos-chevron-open" : ""}`} />
                        </div>

                        {/* Expanded: show matched candidates from real profiles */}
                        {selectedPosition?.id === pos.id && (
                          <div className="fr-pos-expand">
                            <h4 className="fr-pos-expand-title">
                              <Sparkles size={14} style={{ color: "var(--teal)" }} />
                              {t('recruitment.bestCandidateMatches')}
                            </h4>
                            {loadingProfiles ? (
                              <div className="fr-loader-inline">
                                <Loader2 size={14} className="fr-spin" /> {t('recruitment.loadingProfiles')}
                              </div>
                            ) : (
                              <div className="fr-gap-3">
                                {getMatchedCandidates(pos.tags).slice(0, 5).map((c) => {
                                  const sharedTags = (c.interests || []).filter((item) =>
                                    pos.tags.some((pt) => pt.toLowerCase() === item.toLowerCase())
                                  );
                                  return (
                                    <div key={c.id} className="fr-cand-row">
                                      <div className="fr-cand-left">
                                        {c.avatar_url ? (
                                          <img src={c.avatar_url} alt="" className="fr-cand-avatar" loading="lazy" />
                                        ) : (
                                          <div className="fr-cand-avatar-placeholder">
                                            {(c.name || "?")[0].toUpperCase()}
                                          </div>
                                        )}
                                        <div>
                                          <p className="fr-cand-name">{c.name || t('recruitment.anonymous')}</p>
                                          {c.city && (
                                            <span className="fr-cand-city"><MapPin size={10} />{c.city}</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="fr-cand-right">
                                        <div className="fr-cand-tags">
                                          {sharedTags.slice(0, 3).map((item) => {
                                            const node = getTagNode(item);
                                            return (
                                              <span key={item} className="fr-cand-tag-match">
                                                {node?.emoji} {node?.label || item}
                                              </span>
                                            );
                                          })}
                                        </div>
                                        <MatchRing score={c.matchScore} />
                                        <button className="fr-msg-btn">
                                          <MessageSquare size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                                {getMatchedCandidates(pos.tags).length === 0 && (
                                  <p className="fr-text-sm" style={{ padding: "8px 0" }}>{t('recruitment.noMatchesForTags')}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── CANDIDATES TAB ── */}
          {activeTab === "candidates" && (
            <div className="fr-gap-4 fr-fade-up fr-d3">
              <div className="fr-cand-glass fr-cand-glass-pad">
                <h3 className="fr-section-title" style={{ marginBottom: 4 }}>
                  <Search size={16} style={{ color: "var(--teal)" }} />
                  {t('recruitment.searchCandidatesTitle')}
                </h3>
                <p className="fr-section-sub">{t('recruitment.searchCandidatesDescription')}</p>
                <div className="fr-gap-4">
                  {tagCategories.map((cat) => (
                    <TagCategorySelector
                      key={cat.title}
                      title={cat.title}
                      emoji={cat.emoji}
                      tags={cat.tags}
                      selectedTags={searchTags}
                      onToggle={toggleSearchTag}
                    />
                  ))}
                </div>
                {searchTags.length > 0 && (
                  <div className="fr-border-top">
                    <div className="fr-selected-row">
                      <span className="fr-selected-label">{t('recruitment.selectedTags', { count: searchTags.length })}</span>
                      <button onClick={() => setSearchTags([])} className="fr-clear-btn">{t('recruitment.clearAll')}</button>
                    </div>
                    <div className="fr-tag-wrap">
                      {searchTags.map((tag) => {
                        const node = getTagNode(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleSearchTag(tag)}
                            className="fr-removable-chip"
                          >
                            {node?.emoji} {node?.label || tag} <X size={10} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Candidate results from real profiles */}
              {searchTags.length > 0 && (
                <div className="fr-cand-glass">
                  <div className="fr-cand-glass-header">
                    <h3 className="fr-section-title">
                      <Sparkles size={16} style={{ color: "var(--teal)" }} />
                      {t('recruitment.matchedCandidates')}
                      <span className="fr-section-count">
                        ({loadingProfiles ? "..." : candidateResults.length} {t('recruitment.found')})
                      </span>
                    </h3>
                  </div>
                  {loadingProfiles ? (
                    <div className="fr-loader">
                      <Loader2 size={20} className="fr-spin" style={{ color: "var(--teal)" }} />
                    </div>
                  ) : (
                    <div>
                      {candidateResults.slice(0, 20).map((c, idx) => {
                        const sharedTags = (c.interests || []).filter((item) =>
                          searchTags.some((st) => st.toLowerCase() === item.toLowerCase())
                        );
                        const relatedMatches = (c.interests || []).filter((item) => {
                          const itemLower = item.toLowerCase();
                          return searchTags.some((st) =>
                            getRelatedTags(st).some((rt) => rt.toLowerCase() === itemLower)
                          ) && !sharedTags.some((s) => s.toLowerCase() === itemLower);
                        });

                        return (
                          <div key={c.id} className="fr-cand-row" style={idx > 0 ? { borderTop: "1px solid rgba(255,255,255,0.04)" } : undefined}>
                            <div className="fr-cand-left">
                              {c.avatar_url ? (
                                <img src={c.avatar_url} alt="" className="fr-cand-avatar fr-cand-avatar-lg" loading="lazy" />
                              ) : (
                                <div className="fr-cand-avatar-placeholder fr-cand-avatar-placeholder-lg">
                                  {(c.name || "?")[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="fr-cand-name">{c.name || t('recruitment.anonymous')}</p>
                                {c.city && (
                                  <span className="fr-cand-city"><MapPin size={10} />{c.city}</span>
                                )}
                                <div className="fr-cand-tag-list">
                                  {sharedTags.slice(0, 4).map((item) => {
                                    const node = getTagNode(item);
                                    return (
                                      <span key={item} className="fr-cand-tag-match">
                                        {node?.emoji} {node?.label || item}
                                      </span>
                                    );
                                  })}
                                  {relatedMatches.slice(0, 2).map((item) => {
                                    const node = getTagNode(item);
                                    return (
                                      <span key={item} className="fr-cand-tag-related">
                                        {node?.emoji} {node?.label || item}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="fr-cand-right">
                              <MatchRing score={c.matchScore} />
                              <button className="fr-msg-btn" title={t('recruitment.contact')}>
                                <MessageSquare size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {candidateResults.length === 0 && (
                        <div className="fr-empty">
                          {t('recruitment.noUsersMatchTags')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── CREATE TAB ── */}
          {activeTab === "create" && (
            <div className="fr-gap-4 fr-fade-up fr-d3">
              <div className="fr-cand-glass fr-cand-glass-pad">
                <h3 className="fr-section-title" style={{ marginBottom: 16 }}>
                  <Plus size={16} style={{ color: "var(--teal)" }} />
                  {t('recruitment.createNewRole')}
                </h3>
                <div className="fr-gap-4">
                  <div className="fr-form-group">
                    <label className="fr-form-label">{t('recruitment.form.titleLabel')}</label>
                    <input
                      type="text"
                      placeholder={t('recruitment.form.titlePlaceholder')}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="fr-form-input"
                    />
                  </div>
                  <div className="fr-form-group">
                    <label className="fr-form-label">{t('recruitment.form.descriptionLabel')}</label>
                    <textarea
                      placeholder={t('recruitment.form.descriptionPlaceholder')}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      rows={3}
                      className="fr-form-input fr-form-textarea"
                    />
                  </div>
                  <div className="fr-form-grid">
                    <div className="fr-form-group">
                      <label className="fr-form-label">{t('recruitment.form.typeLabel')}</label>
                      <div className="fr-type-grid">
                        {(Object.keys(EMPLOYMENT_LABEL_KEYS) as EmploymentType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setNewType(type)}
                            className={`fr-type-btn${newType === type ? "" : ""}`}
                            style={newType === type ? {
                              background: type === "volunteer" ? "rgba(167,139,250,0.12)" : type === "part_time" ? "rgba(96,165,250,0.12)" : type === "full_time" ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)",
                              color: type === "volunteer" ? "#a78bfa" : type === "part_time" ? "#60a5fa" : type === "full_time" ? "#34d399" : "#fbbf24",
                              borderColor: type === "volunteer" ? "rgba(167,139,250,0.3)" : type === "part_time" ? "rgba(96,165,250,0.3)" : type === "full_time" ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)",
                            } : undefined}
                          >
                            {type === "volunteer" ? <Heart size={12} /> : <Briefcase size={12} />}
                            {t(EMPLOYMENT_LABEL_KEYS[type])}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="fr-form-group">
                      <label className="fr-form-label">{t('recruitment.form.cityLabel')}</label>
                      <input
                        type="text"
                        placeholder={t('recruitment.form.cityPlaceholder')}
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="fr-form-input"
                      />
                    </div>
                  </div>

                  {/* Tag selection from TAG_TREE */}
                  <div className="fr-form-group">
                    <label className="fr-form-label">
                      <Tag size={14} style={{ color: "var(--teal)" }} />
                      {t('recruitment.form.tagsLabel')}
                    </label>
                    <div className="fr-gap-4">
                      {tagCategories.map((cat) => (
                        <TagCategorySelector
                          key={cat.title}
                          title={cat.title}
                          emoji={cat.emoji}
                          tags={cat.tags}
                          selectedTags={newTags}
                          onToggle={toggleTag}
                        />
                      ))}
                    </div>
                    {newTags.length > 0 && (
                      <div className="fr-tag-wrap" style={{ marginTop: 12 }}>
                        {newTags.map((tag) => {
                          const node = getTagNode(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className="fr-removable-chip"
                            >
                              {node?.emoji} {node?.label || tag} <X size={10} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Preview matched candidates from real profiles */}
                  {newTags.length > 0 && (
                    <div className="fr-preview-match">
                      <h4 className="fr-preview-title">
                        <Sparkles size={14} style={{ color: "var(--teal)" }} />
                        {t('recruitment.estimatedMatch', { count: loadingProfiles ? "..." : getMatchedCandidates(newTags).length })}
                      </h4>
                      {!loadingProfiles && (
                        <div className="fr-avatar-stack">
                          {getMatchedCandidates(newTags).slice(0, 5).map((c) => (
                            c.avatar_url ? (
                              <img key={c.id} src={c.avatar_url} alt="" className="fr-avatar-stack-img" loading="lazy" />
                            ) : (
                              <div key={c.id} className="fr-avatar-stack-ph">
                                {(c.name || "?")[0].toUpperCase()}
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="fr-actions">
                    <button
                      onClick={async () => {
                        if (!newTitle.trim()) return;
                        await supabase.from("positions").insert({
                          title: newTitle.trim(),
                          description: newDesc.trim(),
                          employment_type: newType,
                          city: newCity.trim(),
                          tags: newTags,
                          status: "open",
                          company_id: user?.id,
                        });
                        setNewTitle(""); setNewDesc(""); setNewTags([]); setNewCity("");
                        setActiveTab("positions");
                        loadPositions();
                      }}
                      className="fr-btn"
                      style={{ flex: 1 }}
                    >
                      {t('recruitment.publishRole')}
                    </button>
                    <button
                      onClick={async () => {
                        if (!newTitle.trim()) return;
                        await supabase.from("positions").insert({
                          title: newTitle.trim(),
                          description: newDesc.trim(),
                          employment_type: newType,
                          city: newCity.trim(),
                          tags: newTags,
                          status: "draft",
                          company_id: user?.id,
                        });
                        setNewTitle(""); setNewDesc(""); setNewTags([]); setNewCity("");
                        setActiveTab("positions");
                        loadPositions();
                      }}
                      className="fr-btn-ghost"
                    >
                      {t('recruitment.saveAsDraft')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </FirmaLayout>
  );
}
