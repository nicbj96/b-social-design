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
import { TAG_TREE, type TagNode } from "@/lib/tagTree";
import { getTagNode, getRelatedTags } from "@/lib/tagEngine";

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
  volunteer: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  part_time: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  full_time: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  project: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

const STATUS_COLORS: Record<PositionStatus, string> = {
  open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  closed: "bg-white/5 text-muted-foreground border-white/10",
  draft: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

// Build selectable tag categories from TAG_TREE (use level-2 kategorier as options)
function getTagCategories(): { title: string; emoji: string; tags: { tag: string; label: string; emoji: string }[] }[] {
  return TAG_TREE.map((over) => ({
    title: over.label,
    emoji: over.emoji,
    tags: (over.children || []).map((kat) => ({ tag: kat.tag, label: kat.label, emoji: kat.emoji })),
  }));
}

const TAG_CATEGORIES = getTagCategories();

// Tag chip component
function TagChip({ label, emoji, selected, onClick }: { label: string; emoji?: string; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
        selected
          ? "bg-primary/20 text-primary border-primary/30"
          : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20"
      }`}
    >
      {emoji && <span className="mr-1">{emoji}</span>}
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span>{emoji}</span>
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
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
            className="px-2.5 py-1 rounded-full text-xs text-primary hover:bg-primary/10 transition-colors"
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
    <div className="relative w-10 h-10">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <circle cx="18" cy="18" r="16" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold">{score}</span>
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

export default function FirmaRekruttering() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"positions" | "candidates" | "create">("positions");
  const [positions, setPositions] = useState<Position[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [filterType, setFilterType] = useState<EmploymentType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<EmploymentType>("volunteer");
  const [newCity, setNewCity] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);

  // Candidate search tags
  const [searchTags, setSearchTags] = useState<string[]>([]);

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="eyebrow mb-2"><div className="eyebrow-line"/>B-Social Firma</div>
            <h1 className="text-2xl flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: "24px", letterSpacing: "-0.5px" }}>
              <Users size={24} className="text-primary" />
              {t('recruitment.title')}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t('recruitment.subtitle')}</p>
          </div>
          <button
            onClick={() => setActiveTab("create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            {t('recruitment.createRole')}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="stat-card text-center">
            <div className="stat-num text-primary">{positions.filter((p) => p.status === "open").length}</div>
            <div className="stat-label">{t('recruitment.stats.openRoles')}</div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-num text-purple-400">{positions.filter((p) => p.is_volunteer).length}</div>
            <div className="stat-label">{t('recruitment.stats.volunteers')}</div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-num text-blue-400">{positions.reduce((a, p) => a + p.applicants, 0)}</div>
            <div className="stat-label">{t('recruitment.stats.applicants')}</div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-num text-emerald-400">{allProfiles.length}</div>
            <div className="stat-label">{t('recruitment.stats.userProfiles')}</div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit">
          {(["positions", "candidates", "create"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "positions" ? t('recruitment.tabs.yourRoles') : tab === "candidates" ? t('recruitment.tabs.findCandidates') : t('recruitment.tabs.createRole')}
            </button>
          ))}
        </div>

        {/* POSITIONS TAB */}
        {activeTab === "positions" && (
          <div className="space-y-4">
            {loadingPositions && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            )}

            {!loadingPositions && (
              <>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={t('recruitment.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="premium-input pl-9"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {(["all", "volunteer", "part_time", "full_time", "project"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          filterType === type
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20"
                        }`}
                      >
                        {type === "all" ? t('recruitment.filterAll') : t(EMPLOYMENT_LABEL_KEYS[type])}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position list */}
                {filteredPositions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    <Briefcase size={28} className="mx-auto mb-3 opacity-40" />
                    {t('recruitment.noRolesFound')}
                  </div>
                )}

                <div className="space-y-3">
                  {filteredPositions.map((pos) => (
                    <div
                      key={pos.id}
                      className={`glass-card rounded-xl p-4 cursor-pointer transition-all hover:bg-white/5 ${
                        selectedPosition?.id === pos.id ? "ring-1 ring-primary/50" : ""
                      }`}
                      onClick={() => setSelectedPosition(selectedPosition?.id === pos.id ? null : pos)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{pos.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${EMPLOYMENT_COLORS[pos.employment_type]}`}>
                              {t(EMPLOYMENT_LABEL_KEYS[pos.employment_type])}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[pos.status]}`}>
                              {pos.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{pos.description}</p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {pos.tags.map((tag) => {
                              const node = getTagNode(tag);
                              return (
                                <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                                  {node?.emoji && <span className="mr-0.5">{node.emoji}</span>}
                                  {node?.label || tag}
                                </span>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {pos.city && <span className="flex items-center gap-1"><MapPin size={12} />{pos.city}</span>}
                            <span className="flex items-center gap-1"><UserPlus size={12} />{pos.applicants} {t('recruitment.applicantsLabel')}</span>
                            <span className="flex items-center gap-1"><Clock size={12} />{new Date(pos.created_at).toLocaleDateString("da-DK")}</span>
                          </div>
                        </div>
                        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${selectedPosition?.id === pos.id ? "rotate-180" : ""}`} />
                      </div>

                      {/* Expanded: show matched candidates from real profiles */}
                      {selectedPosition?.id === pos.id && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" />
                            {t('recruitment.bestCandidateMatches')}
                          </h4>
                          {loadingProfiles ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                              <Loader2 size={14} className="animate-spin" /> {t('recruitment.loadingProfiles')}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {getMatchedCandidates(pos.tags).slice(0, 5).map((c) => {
                                const sharedTags = (c.interests || []).filter((item) =>
                                  pos.tags.some((pt) => pt.toLowerCase() === item.toLowerCase())
                                );
                                return (
                                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                      {c.avatar_url ? (
                                        <img src={c.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                          {(c.name || "?")[0].toUpperCase()}
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium">{c.name || t('recruitment.anonymous')}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          {c.city && <span className="flex items-center gap-0.5"><MapPin size={10} />{c.city}</span>}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {sharedTags.slice(0, 3).map((item) => {
                                          const node = getTagNode(item);
                                          return (
                                            <span key={item} className="px-1.5 py-0.5 rounded text-xs bg-primary/15 text-primary">
                                              {node?.emoji} {node?.label || item}
                                            </span>
                                          );
                                        })}
                                      </div>
                                      <MatchRing score={c.matchScore} />
                                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                        <MessageSquare size={14} className="text-muted-foreground" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                              {getMatchedCandidates(pos.tags).length === 0 && (
                                <p className="text-xs text-muted-foreground py-2">{t('recruitment.noMatchesForTags')}</p>
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

        {/* CANDIDATES TAB */}
        {activeTab === "candidates" && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Search size={16} className="text-primary" />
                {t('recruitment.searchCandidatesTitle')}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">{t('recruitment.searchCandidatesDescription')}</p>
              <div className="space-y-4">
                {TAG_CATEGORIES.map((cat) => (
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
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t('recruitment.selectedTags', { count: searchTags.length })}</span>
                    <button onClick={() => setSearchTags([])} className="text-xs text-muted-foreground hover:text-foreground">{t('recruitment.clearAll')}</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {searchTags.map((tag) => {
                      const node = getTagNode(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleSearchTag(tag)}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 flex items-center gap-1"
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
              <div className="glass-card rounded-xl">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    {t('recruitment.matchedCandidates')}
                    <span className="text-xs text-muted-foreground font-normal">
                      ({loadingProfiles ? "..." : candidateResults.length} {t('recruitment.found')})
                    </span>
                  </h3>
                </div>
                {loadingProfiles ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {candidateResults.slice(0, 20).map((c) => {
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
                        <div key={c.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-3">
                            {c.avatar_url ? (
                              <img src={c.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                {(c.name || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">{c.name || t('recruitment.anonymous')}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {c.city && <span className="flex items-center gap-0.5"><MapPin size={10} />{c.city}</span>}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sharedTags.slice(0, 4).map((item) => {
                                  const node = getTagNode(item);
                                  return (
                                    <span key={item} className="px-1.5 py-0.5 rounded text-xs bg-primary/15 text-primary font-medium">
                                      {node?.emoji} {node?.label || item}
                                    </span>
                                  );
                                })}
                                {relatedMatches.slice(0, 2).map((item) => {
                                  const node = getTagNode(item);
                                  return (
                                    <span key={item} className="px-1.5 py-0.5 rounded text-xs bg-white/5 text-muted-foreground">
                                      {node?.emoji} {node?.label || item}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MatchRing score={c.matchScore} />
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title={t('recruitment.contact')}>
                              <MessageSquare size={16} className="text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {candidateResults.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        {t('recruitment.noUsersMatchTags')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CREATE TAB */}
        {activeTab === "create" && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Plus size={16} className="text-primary" />
                {t('recruitment.createNewRole')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('recruitment.form.titleLabel')}</label>
                  <input
                    type="text"
                    placeholder={t('recruitment.form.titlePlaceholder')}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('recruitment.form.descriptionLabel')}</label>
                  <textarea
                    placeholder={t('recruitment.form.descriptionPlaceholder')}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('recruitment.form.typeLabel')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(EMPLOYMENT_LABEL_KEYS) as EmploymentType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewType(type)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            newType === type
                              ? EMPLOYMENT_COLORS[type]
                              : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20"
                          }`}
                        >
                          {type === "volunteer" && <Heart size={12} className="inline mr-1" />}
                          {type !== "volunteer" && <Briefcase size={12} className="inline mr-1" />}
                          {t(EMPLOYMENT_LABEL_KEYS[type])}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('recruitment.form.cityLabel')}</label>
                    <input
                      type="text"
                      placeholder={t('recruitment.form.cityPlaceholder')}
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                {/* Tag selection from TAG_TREE */}
                <div>
                  <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                    <Tag size={14} className="text-primary" />
                    {t('recruitment.form.tagsLabel')}
                  </label>
                  <div className="space-y-4">
                    {TAG_CATEGORIES.map((cat) => (
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
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {newTags.map((tag) => {
                        const node = getTagNode(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 flex items-center gap-1"
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
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles size={14} className="text-primary" />
                      {t('recruitment.estimatedMatch', { count: loadingProfiles ? "..." : getMatchedCandidates(newTags).length })}
                    </h4>
                    {!loadingProfiles && (
                      <div className="flex -space-x-2">
                        {getMatchedCandidates(newTags).slice(0, 5).map((c) => (
                          c.avatar_url ? (
                            <img key={c.id} src={c.avatar_url} alt="" className="w-8 h-8 rounded-full border-2 border-background object-cover" loading="lazy" />
                          ) : (
                            <div key={c.id} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary">
                              {(c.name || "?")[0].toUpperCase()}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
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
                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
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
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    {t('recruitment.saveAsDraft')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}
