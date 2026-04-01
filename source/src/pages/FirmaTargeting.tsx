import FirmaLayout from "@/components/FirmaLayout";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Target, Users, Search, ChevronRight, Check, X, Sparkles, MapPin, Info, Save, Download, Loader2 } from "lucide-react";
import { TAG_TREE } from "@/lib/tagTree";
import { estimateFirmaReach } from "@/lib/tagEngine";
import { supabase } from "@/lib/supabase";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── scoped CSS ── */
const firmaTargetingCSS = `${pageBase("ft")}

/* ── Layout ── */
.ft-page { padding: 48px 0; max-width: 1200px; margin: 0 auto; }
.ft-header { margin-bottom: 40px; }

.ft-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
}
@media (min-width: 1024px) {
  .ft-grid { grid-template-columns: 2fr 1fr; }
}

/* ── Loading ── */
.ft-loading {
  display: flex; align-items: center; justify-content: center;
  padding: 80px 0; gap: 10px;
}
.ft-spinner {
  animation: ft-spin 1s linear infinite;
  color: var(--teal);
}
@keyframes ft-spin { to { transform: rotate(360deg); } }

/* ── Search input ── */
.ft-search-wrap { position: relative; margin-bottom: 8px; }
.ft-search-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--pg-white-muted); pointer-events: none;
}
.ft-search { padding-left: 44px !important; }

/* ── Presets row ── */
.ft-presets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.ft-preset-btn {
  padding: 7px 14px; border-radius: 10px; font-size: 12px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  color: var(--pg-white-dim); cursor: pointer; transition: all 0.25s;
  font-family: var(--sans); display: inline-flex; align-items: center; gap: 5px;
}
.ft-preset-btn:hover {
  background: rgba(78,205,196,0.1); color: var(--teal);
  border-color: rgba(78,205,196,0.3);
}

/* ── Category accordion (glass tree nav) ── */
.ft-cat {
  background: var(--glass-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px; overflow: hidden;
  margin-bottom: 12px; transition: border-color 0.3s;
}
.ft-cat:hover { border-color: var(--glass-border-hover); }
.ft-cat-header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; background: transparent; border: none;
  color: var(--pg-white); cursor: pointer; transition: background 0.2s;
  font-family: var(--sans);
}
.ft-cat-header:hover { background: rgba(255,255,255,0.03); }
.ft-cat-name { font-size: 14px; font-weight: 500; }
.ft-cat-meta { display: flex; align-items: center; gap: 10px; }
.ft-cat-count { font-size: 12px; color: var(--pg-white-muted); }
.ft-cat-chevron {
  transition: transform 0.25s; color: var(--pg-white-muted);
}
.ft-cat-chevron.open { transform: rotate(90deg); }

/* ── Tag chips inside category ── */
.ft-tags { padding: 0 20px 20px; display: flex; flex-wrap: wrap; gap: 8px; }
.ft-tag {
  padding: 7px 16px; border-radius: 100px; font-size: 12px;
  border: 1px solid var(--glass-border); background: rgba(255,255,255,0.04);
  color: var(--pg-white-dim); cursor: pointer; transition: all 0.25s;
  font-family: var(--sans); display: inline-flex; align-items: center; gap: 5px;
}
.ft-tag:hover {
  border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.07);
}
.ft-tag.selected {
  background: rgba(78,205,196,0.15); border-color: var(--teal);
  color: var(--teal); font-weight: 500;
}
.ft-tag-reach { color: var(--pg-white-muted); margin-left: 2px; }

/* ── Sidebar panels (glass) ── */
.ft-sidebar { display: flex; flex-direction: column; gap: 20px; }

.ft-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 24px;
  transition: border-color 0.3s;
}
.ft-panel:hover { border-color: var(--glass-border-hover); }
.ft-panel-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.ft-panel-title {
  font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px;
  color: var(--pg-white);
}
.ft-panel-title svg { color: var(--teal); }

/* ── Selected tags display ── */
.ft-selected-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.ft-sel-tag {
  padding: 5px 12px; border-radius: 100px; font-size: 11px;
  background: rgba(78,205,196,0.15); border: 1px solid rgba(78,205,196,0.25);
  color: var(--teal); display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--sans);
}
.ft-sel-remove {
  background: none; border: none; color: var(--teal); cursor: pointer;
  padding: 0; display: inline-flex; opacity: 0.6; transition: opacity 0.2s;
}
.ft-sel-remove:hover { opacity: 1; }

.ft-clear-btn {
  font-size: 12px; color: var(--pg-white-muted); background: none;
  border: none; cursor: pointer; display: flex; align-items: center; gap: 4px;
  transition: color 0.2s; font-family: var(--sans);
}
.ft-clear-btn:hover { color: #f87171; }

.ft-empty { font-size: 13px; color: var(--pg-white-muted); }

/* ── Reach meter ── */
.ft-reach { padding-top: 18px; margin-top: 18px; border-top: 1px solid rgba(255,255,255,0.06); }
.ft-reach-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.ft-reach-label { font-size: 12px; color: var(--pg-white-muted); text-transform: uppercase; letter-spacing: 1px; }
.ft-reach-val {
  font-family: var(--serif); font-size: 22px; font-weight: 400;
  color: var(--teal); line-height: 1;
}
.ft-reach-track {
  width: 100%; height: 6px; background: rgba(255,255,255,0.08);
  border-radius: 100px; overflow: hidden; position: relative;
}
.ft-reach-bar {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, var(--teal), #34d399);
  transition: width 0.6s cubic-bezier(0.23,1,0.32,1);
  box-shadow: 0 0 12px var(--teal-glow);
}
.ft-reach-sub { font-size: 11px; color: var(--pg-white-muted); margin-top: 8px; }

/* ── Save preset row ── */
.ft-save-row {
  padding-top: 18px; margin-top: 18px; border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; gap: 8px;
}
.ft-save-input { flex: 1; font-size: 12px; }
.ft-save-btn {
  padding: 10px 16px; background: var(--teal); color: var(--bg);
  border: none; border-radius: 12px; cursor: pointer;
  transition: all 0.25s; display: flex; align-items: center;
}
.ft-save-btn:hover { box-shadow: 0 4px 16px var(--teal-glow); }
.ft-save-btn:disabled { opacity: 0.25; cursor: not-allowed; }

/* ── Persona cards (glass) ── */
.ft-persona {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px; border-radius: 14px;
  transition: background 0.2s; cursor: default;
}
.ft-persona:hover { background: rgba(255,255,255,0.04); }
.ft-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(78,205,196,0.15); border: 1px solid rgba(78,205,196,0.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: var(--teal); flex-shrink: 0;
}
.ft-persona-info { flex: 1; min-width: 0; }
.ft-persona-name { font-size: 14px; font-weight: 500; color: var(--pg-white); }
.ft-persona-detail {
  font-size: 12px; color: var(--pg-white-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: flex; align-items: center; gap: 4px;
}
.ft-match { font-size: 13px; font-weight: 600; flex-shrink: 0; }
.ft-match-high { color: #34d399; }
.ft-match-mid { color: #fbbf24; }
.ft-match-low { color: var(--pg-white-muted); }

/* ── Info panel ── */
.ft-info {
  background: rgba(78,205,196,0.06);
  border: 1px solid rgba(78,205,196,0.15);
  border-radius: 16px; padding: 20px;
  display: flex; gap: 12px;
}
.ft-info-icon { flex-shrink: 0; color: var(--teal); margin-top: 2px; }
.ft-info-text { font-size: 13px; color: rgba(78,205,196,0.7); line-height: 1.55; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .ft-page { padding: 24px 16px; }
  .ft-panel { padding: 18px; }
}
`;

interface TagWithReach {
  name: string;
  tag: string;
  emoji: string;
  reach: number;
  selected: boolean;
}

interface TagCategory {
  name: string;
  emoji: string;
  tag: string;
  tags: TagWithReach[];
}

interface MatchingPersona {
  navn: string;
  interesser: string[];
  lokation: string;
  avatar: string;
  match: number;
}

export default function FirmaTargeting() {
  const { t } = useTranslation();
  const containerRef = useFadeUp("ft");
  const [categories, setCategories] = useState<TagCategory[]>([]);
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [presetName, setPresetName] = useState("");
  const [presets, setPresets] = useState<{ name: string; tags: string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [allUserTags, setAllUserTags] = useState<string[][]>([]);
  const [matchingPersonas, setMatchingPersonas] = useState<MatchingPersona[]>([]);

  // Fetch real profile data from Supabase and build categories from TAG_TREE
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Fetch all profiles with their interests
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, name, interests, city, avatar_url");

      if (error) {
        console.error("FirmaTargeting: error fetching profiles", error);
        setLoading(false);
        return;
      }

      const allProfiles = profiles || [];
      setTotalUsers(allProfiles.length);

      // Collect all user tag arrays for reach estimation
      const userTagArrays = allProfiles
        .map(p => p.interests as string[] | null)
        .filter((tags): tags is string[] => Array.isArray(tags) && tags.length > 0);
      setAllUserTags(userTagArrays);

      // Count how many profiles have each tag in their interests
      const tagCounts = new Map<string, number>();
      for (const tags of userTagArrays) {
        for (const tag of tags) {
          const key = tag.toLowerCase();
          tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
        }
      }

      // Build categories from TAG_TREE with real reach counts
      const built: TagCategory[] = TAG_TREE.map(parent => ({
        name: parent.label,
        emoji: parent.emoji,
        tag: parent.tag,
        tags: (parent.children || []).map(child => ({
          name: child.label,
          tag: child.tag,
          emoji: child.emoji,
          reach: tagCounts.get(child.tag.toLowerCase()) || 0,
          selected: false,
        })),
      }));

      setCategories(built);

      // Store sample personas from actual profiles
      const samplePersonas: MatchingPersona[] = allProfiles
        .filter(p => p.name && Array.isArray(p.interests) && p.interests.length > 0)
        .slice(0, 5)
        .map(p => ({
          navn: p.name || t('firma.targeting_default_user'),
          interesser: (p.interests as string[]).slice(0, 3),
          lokation: (p.city as string) || t('firma.targeting_default_region'),
          avatar: (p.name as string)?.[0]?.toUpperCase() || "?",
          match: 0,
        }));
      setMatchingPersonas(samplePersonas);

      // Expand first non-empty category by default
      const firstWithReach = built.find(c => c.tags.some(item => item.reach > 0));
      if (firstWithReach) setExpandedCat(firstWithReach.name);
      else if (built.length > 0) setExpandedCat(built[0].name);

      setLoading(false);
    }

    loadData();
  }, []);

  // Load saved presets
  useEffect(() => {
    try {
      const saved = localStorage.getItem("targeting-presets");
      if (saved) setPresets(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const toggleTag = (catName: string, tagKey: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.name === catName
          ? { ...cat, tags: cat.tags.map(item => item.tag === tagKey ? { ...item, selected: !item.selected } : item) }
          : cat
      )
    );
  };

  const selectedTags = useMemo(
    () => categories.flatMap(c => c.tags.filter(item => item.selected)),
    [categories]
  );

  // Calculate real reach using tagEngine
  const totalReach = useMemo(() => {
    if (selectedTags.length === 0) return 0;
    const firmaTags = selectedTags.map(item => item.tag);
    return estimateFirmaReach(firmaTags, allUserTags);
  }, [selectedTags, allUserTags]);

  // Update persona match scores when selection changes
  const personas = useMemo(() => {
    if (selectedTags.length === 0) return matchingPersonas.map(p => ({ ...p, match: 0 }));
    const selectedSet = new Set(selectedTags.map(item => item.tag.toLowerCase()));
    return matchingPersonas.map(p => {
      const userTags = p.interesser.map(i => i.toLowerCase());
      const overlap = userTags.filter(tag => selectedSet.has(tag)).length;
      const match = Math.round((overlap / Math.max(userTags.length, 1)) * 100);
      return { ...p, match };
    }).sort((a, b) => b.match - a.match);
  }, [selectedTags, matchingPersonas]);

  const savePreset = () => {
    if (!presetName || selectedTags.length === 0) return;
    const newPresets = [...presets, { name: presetName, tags: selectedTags.map(item => item.tag) }];
    setPresets(newPresets);
    localStorage.setItem("targeting-presets", JSON.stringify(newPresets));
    setPresetName("");
  };

  const loadPreset = (preset: { name: string; tags: string[] }) => {
    const presetSet = new Set(preset.tags);
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        tags: cat.tags.map(item => ({ ...item, selected: presetSet.has(item.tag) })),
      }))
    );
  };

  const clearAll = () => {
    setCategories(prev =>
      prev.map(cat => ({ ...cat, tags: cat.tags.map(item => ({ ...item, selected: false })) }))
    );
  };

  const reachPct = totalUsers > 0 ? Math.min((totalReach / totalUsers) * 100, 100) : 0;

  return (
    <FirmaLayout>
      <style>{firmaTargetingCSS}</style>
      <div className="ft-root" ref={containerRef}>
        <div className="ft-page">

          {/* ── Header ── */}
          <div className="ft-header ft-fade-up">
            <div className="ft-eyebrow">
              <span className="ft-eyebrow-line" />
              B-Social Firma
            </div>
            <h1 className="ft-h2" style={{ marginTop: 12 }}>
              {t('firma.targeting_title')}
            </h1>
            <p className="ft-text" style={{ marginTop: 8 }}>
              {t('firma.targeting_subtitle')}
              {totalUsers > 0 && (
                <span style={{ marginLeft: 6, color: 'var(--teal)' }}>
                  ({totalUsers.toLocaleString()} {t('firma.targeting_users_in_database')})
                </span>
              )}
            </p>
          </div>

          {loading ? (
            <div className="ft-loading ft-fade-up">
              <Loader2 size={22} className="ft-spinner" />
              <span className="ft-text-sm">{t('firma.targeting_loading')}</span>
            </div>
          ) : (
            <div className="ft-grid">

              {/* ══════ Left column: tag tree navigator ══════ */}
              <div className="ft-fade-up ft-d1">

                {/* Search */}
                <div className="ft-search-wrap">
                  <Search size={16} className="ft-search-icon" />
                  <input
                    type="text"
                    placeholder={t('firma.targeting_search_tags')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ft-input ft-search"
                  />
                </div>

                {/* Presets */}
                {presets.length > 0 && (
                  <div className="ft-presets">
                    {presets.map((p) => (
                      <button key={p.name} onClick={() => loadPreset(p)} className="ft-preset-btn">
                        <Download size={11} />
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Category accordion */}
                {categories
                  .filter(cat => !search || cat.tags.some(item => item.name.toLowerCase().includes(search.toLowerCase())))
                  .map((cat, idx) => (
                    <div key={cat.tag} className={`ft-cat ft-fade-up ft-d${Math.min(idx % 4 + 1, 4)}`}>
                      <button
                        onClick={() => setExpandedCat(expandedCat === cat.name ? null : cat.name)}
                        className="ft-cat-header"
                      >
                        <span className="ft-cat-name">
                          {cat.emoji} {cat.name}
                        </span>
                        <span className="ft-cat-meta">
                          <span className="ft-cat-count">
                            {cat.tags.filter(item => item.selected).length} {t('firma.targeting_selected')}
                          </span>
                          <ChevronRight
                            size={14}
                            className={`ft-cat-chevron${expandedCat === cat.name ? " open" : ""}`}
                          />
                        </span>
                      </button>

                      {expandedCat === cat.name && (
                        <div className="ft-tags">
                          {cat.tags
                            .filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()))
                            .map((tag) => (
                              <button
                                key={tag.tag}
                                onClick={() => toggleTag(cat.name, tag.tag)}
                                className={`ft-tag${tag.selected ? " selected" : ""}`}
                              >
                                {tag.selected && <Check size={10} />}
                                {tag.emoji} {tag.name}
                                <span className="ft-tag-reach">
                                  ({tag.reach.toLocaleString()})
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* ══════ Right column: sidebar ══════ */}
              <div className="ft-sidebar">

                {/* ── Selected tags + reach meter panel ── */}
                <div className="ft-panel ft-fade-up ft-d2">
                  <div className="ft-panel-head">
                    <span className="ft-panel-title">
                      <Target size={15} />
                      {t('firma.targeting_selected_tags')}
                    </span>
                    {selectedTags.length > 0 && (
                      <button onClick={clearAll} className="ft-clear-btn">
                        <X size={12} />
                        {t('firma.targeting_clear')}
                      </button>
                    )}
                  </div>

                  {selectedTags.length === 0 ? (
                    <p className="ft-empty">{t('firma.targeting_no_tags_selected')}</p>
                  ) : (
                    <div className="ft-selected-tags">
                      {selectedTags.map((item) => (
                        <span key={item.tag} className="ft-sel-tag">
                          {item.emoji} {item.name}
                          <button
                            className="ft-sel-remove"
                            onClick={() => {
                              const cat = categories.find(c => c.tags.some(tag => tag.tag === item.tag));
                              if (cat) toggleTag(cat.name, item.tag);
                            }}
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reach meter */}
                  <div className="ft-reach">
                    <div className="ft-reach-row">
                      <span className="ft-reach-label">{t('firma.targeting_estimated_reach')}</span>
                      <span className="ft-reach-val">{totalReach.toLocaleString()}</span>
                    </div>
                    <div className="ft-reach-track">
                      <div className="ft-reach-bar" style={{ width: `${reachPct}%` }} />
                    </div>
                    <p className="ft-reach-sub">
                      {t('firma.targeting_of_users_in_database', { count: totalUsers.toLocaleString() })}
                    </p>
                  </div>

                  {/* Save preset */}
                  <div className="ft-save-row">
                    <input
                      type="text"
                      placeholder={t('firma.targeting_save_as_preset')}
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="ft-input ft-save-input"
                    />
                    <button
                      onClick={savePreset}
                      disabled={!presetName || selectedTags.length === 0}
                      className="ft-save-btn"
                    >
                      <Save size={14} />
                    </button>
                  </div>
                </div>

                {/* ── Matching personas panel ── */}
                <div className="ft-panel ft-fade-up ft-d3">
                  <div className="ft-panel-head">
                    <span className="ft-panel-title">
                      <Sparkles size={15} />
                      {t('firma.targeting_matching_personas')}
                    </span>
                  </div>

                  {personas.length === 0 ? (
                    <p className="ft-empty">{t('firma.targeting_no_user_data')}</p>
                  ) : (
                    personas.map((p) => (
                      <div key={p.navn} className="ft-persona">
                        <div className="ft-avatar">{p.avatar}</div>
                        <div className="ft-persona-info">
                          <div className="ft-persona-name">{p.navn}</div>
                          <div className="ft-persona-detail">
                            {p.interesser.join(", ")} &ndash; <MapPin size={10} /> {p.lokation}
                          </div>
                        </div>
                        <span className={`ft-match ${p.match > 50 ? "ft-match-high" : p.match > 0 ? "ft-match-mid" : "ft-match-low"}`}>
                          {p.match}%
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* ── Info panel ── */}
                <div className="ft-info ft-fade-up ft-d4">
                  <Info size={16} className="ft-info-icon" />
                  <p className="ft-info-text">
                    {t('firma.targeting_info_text')}
                  </p>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </FirmaLayout>
  );
}
