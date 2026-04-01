import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useTags } from "@/context/TagContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { searchTags, getOverkategorier, type TagNode } from "@/lib/tagTree";
import { getOverkategoriForTag } from "@/lib/tagEngine";
import { Check, MapPin, Compass, Loader2, Search, X, ChevronDown, Sparkles, SlidersHorizontal, Plus } from "lucide-react";

/* ── Alle danske byer ── */
const DANISH_CITIES = [
  "Aalborg","Aarhus","København","Odense","Esbjerg","Randers","Kolding","Horsens",
  "Vejle","Roskilde","Herning","Silkeborg","Næstved","Fredericia","Viborg","Køge",
  "Holstebro","Taastrup","Slagelse","Hillerød","Holbæk","Sønderborg","Svendborg",
  "Hjørring","Frederikshavn","Nørresundby","Ringsted","Haderslev","Skive","Birkerød",
  "Helsingør","Frederiksberg","Gentofte","Gladsaxe","Lyngby","Ballerup","Hvidovre",
  "Brøndby","Albertslund","Ishøj","Vallensbæk","Greve","Solrød","Stevns","Faxe",
  "Vordingborg","Guldborgsund","Lolland","Bornholm","Kalundborg","Odsherred",
  "Sorø","Lejre","Skanderborg","Favrskov","Hedensted","Billund","Varde","Vejen",
  "Tønder","Aabenraa","Fanø","Frederikssund","Halsnæs","Gribskov","Rudersdal",
  "Furesø","Allerød","Hørsholm","Dragør","Tårnby","Thisted","Morsø","Lemvig",
  "Struer","Ringkøbing-Skjern","Ikast-Brande","Norddjurs","Syddjurs","Odder",
  "Samsø","Mariagerfjord","Rebild","Vesthimmerland","Jammerbugt","Brønderslev",
  "Læsø","Nyborg","Assens","Faaborg-Midtfyn","Kerteminde","Nordfyns","Langeland","Ærø",
  "Middelfart","Frederiksberg","Nykøbing Falster","Nykøbing Mors","Skagen","Blokhus",
  "Løkken","Hvide Sande","Sæby","Grenaa","Ebeltoft","Ry","Brande","Give","Jelling",
  "Bramming","Ribe","Toftlund","Padborg","Kruså","Augustenborg","Nordborg","Gudhjem",
  "Rønne","Nexø","Allinge","Hasle","Maribo","Nakskov","Sasksøbing","Stege",
];

const ZIP_TO_CITY: Record<string, string> = {
  "9000":"Aalborg","8000":"Aarhus","1000":"København","5000":"Odense","6700":"Esbjerg",
  "8900":"Randers","6000":"Kolding","8700":"Horsens","7100":"Vejle","4000":"Roskilde",
  "7400":"Herning","8600":"Silkeborg","4700":"Næstved","7000":"Fredericia","8800":"Viborg",
  "4600":"Køge","7500":"Holstebro","2630":"Taastrup","4200":"Slagelse","3400":"Hillerød",
  "4300":"Holbæk","6400":"Sønderborg","5700":"Svendborg","9800":"Hjørring",
  "9900":"Frederikshavn","9400":"Nørresundby","4100":"Ringsted","6100":"Haderslev",
  "7800":"Skive","3460":"Birkerød","3000":"Helsingør","2000":"Frederiksberg",
  "2820":"Gentofte","2860":"Søborg","2800":"Lyngby","2750":"Ballerup","2650":"Hvidovre",
  "2605":"Brøndby","2620":"Albertslund","2635":"Ishøj","2625":"Vallensbæk","2670":"Greve",
  "2680":"Solrød","4640":"Faxe","4760":"Vordingborg","3700":"Rønne","4400":"Kalundborg",
  "4180":"Sorø","4320":"Lejre","8660":"Skanderborg","8700":"Horsens","7190":"Billund",
  "6800":"Varde","6600":"Vejen","6270":"Tønder","6200":"Aabenraa","6720":"Fanø",
  "3600":"Frederikssund","3500":"Værløse","2970":"Hørsholm","2791":"Dragør",
  "2770":"Kastrup","7700":"Thisted","7620":"Lemvig","7600":"Struer","8500":"Grenaa",
  "8400":"Ebeltoft","8680":"Ry","7330":"Brande","7323":"Give","7300":"Jelling",
  "6740":"Bramming","6760":"Ribe","6520":"Toftlund","6330":"Padborg","6440":"Augustenborg",
  "6430":"Nordborg","3760":"Gudhjem","3730":"Nexø","3770":"Allinge","3790":"Hasle",
  "4930":"Maribo","4900":"Nakskov","4990":"Sasksøbing","4780":"Stege",
};

function lookupZip(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d{4}$/.test(trimmed)) return ZIP_TO_CITY[trimmed] || null;
  return null;
}

const ALL_CITIES = [...new Set(DANISH_CITIES)].sort((a, b) => a.localeCompare(b, "da"));

const POPULAR_CITIES = [
  { name: "København", emoji: "🏰" },
  { name: "Aarhus", emoji: "🏙️" },
  { name: "Aalborg", emoji: "🏠" },
  { name: "Odense", emoji: "🌷" },
  { name: "Esbjerg", emoji: "⚓" },
  { name: "Vejle", emoji: "🌊" },
];

const RADIUS_PRESETS = [
  { km: 10, label: "10 km", desc: "Nærområde" },
  { km: 25, label: "25 km", desc: "Regionen" },
  { km: 50, label: "50+", desc: "Større område" },
  { km: 100, label: "100 km", desc: "Landsdelen" },
  { km: 0, label: "Hele DK", desc: "Alt i Danmark" },
];

function countSelected(node: TagNode, selected: Set<string>): number {
  let count = selected.has(node.tag) ? 1 : 0;
  if (node.children) {
    for (const c of node.children) count += countSelected(c, selected);
  }
  return count;
}

function getAllDescendantTags(node: TagNode): string[] {
  const tags: string[] = [];
  if (node.children) {
    for (const c of node.children) {
      tags.push(c.tag);
      tags.push(...getAllDescendantTags(c));
    }
  }
  return tags;
}

function KategoriRow({ kat, selectedTags, onToggle, onSelectAll }: {
  kat: TagNode;
  selectedTags: Set<string>;
  onToggle: (tag: string) => void;
  onSelectAll: (tags: string[]) => void;
}) {
  const children = kat.children || [];
  const katSelected = selectedTags.has(kat.tag);
  const childCount = children.filter(c => selectedTags.has(c.tag)).length;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (katSelected && children.length > 0) setExpanded(true);
  }, [katSelected]);

  const handleKatClick = () => {
    if (katSelected) {
      onToggle(kat.tag);
    } else {
      onSelectAll([kat.tag, ...children.map(c => c.tag)]);
      if (children.length > 0) setExpanded(true);
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleKatClick}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
          katSelected ? "bg-[#4ECDC4]/15 ring-1 ring-[#4ECDC4]/30" : "bg-white/4 hover:bg-white/6"
        }`}
        data-testid={`tag-kat-${kat.tag}`}
      >
        <span className="text-sm">{kat.emoji}</span>
        <span className={`flex-1 text-xs font-semibold ${katSelected ? "text-[#4ECDC4]" : "text-white/70"}`}>
          {kat.label}
        </span>
        {childCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-[#4ECDC4]/20 text-[#4ECDC4] text-[8px] font-bold">{childCount}</span>
        )}
        <div className={`w-4 h-4 rounded flex items-center justify-center ${
          katSelected ? "bg-[#4ECDC4]" : "bg-white/10"
        }`}>
          {katSelected && <Check size={10} className="text-white" />}
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
        <div className="pl-6 flex flex-wrap gap-1">
          {children.map(under => {
            const active = selectedTags.has(under.tag);
            return (
              <button
                key={under.tag}
                onClick={() => onToggle(under.tag)}
                className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-[#4ECDC4]/20 text-[#4ECDC4] ring-1 ring-[#4ECDC4]/30"
                    : "bg-white/5 text-white/40 hover:bg-white/8 hover:text-white/60"
                }`}
                data-testid={`tag-under-${under.tag}`}
              >
                <span>{under.emoji}</span>
                <span>{under.label}</span>
                {active && <Check size={8} className="ml-0.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
function OverkategoriGroup({ over, selectedTags, onToggle, onSelectAll, forceExpand }: {
  over: TagNode;
  selectedTags: Set<string>;
  onToggle: (tag: string) => void;
  onSelectAll: (tags: string[]) => void;
  forceExpand?: boolean;
}) {
  const kategorier = over.children || [];
  const overSelected = selectedTags.has(over.tag);
  const selCount = countSelected(over, selectedTags) - (overSelected ? 1 : 0);
  const hasSelections = overSelected || selCount > 0;
  const [expanded, setExpanded] = useState(forceExpand || false);

  useEffect(() => {
    if (forceExpand) setExpanded(true);
  }, [forceExpand]);

  useEffect(() => {
    if (overSelected && kategorier.length > 0) setExpanded(true);
  }, [overSelected]);

  const handleOverClick = () => {
    if (overSelected) {
      onToggle(over.tag);
    } else {
      const all = [over.tag, ...getAllDescendantTags(over)];
      onSelectAll(all);
      if (kategorier.length > 0) setExpanded(true);
    }
  };

  return (
    <div className={`rounded-2xl overflow-hidden transition-all duration-200 ${
      hasSelections ? "bg-[#4ECDC4]/8 ring-1 ring-[#4ECDC4]/30" : "bg-white/4 ring-1 ring-white/6"
    }`}>
      <button
        onClick={handleOverClick}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left"
        data-testid={`tag-over-${over.tag}`}
      >
        <span className="text-lg">{over.emoji}</span>
        <span className={`flex-1 text-sm font-semibold ${overSelected ? "text-[#4ECDC4]" : "text-white/80"}`}>
          {over.label}
        </span>
        {selCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-[#4ECDC4]/20 text-[#4ECDC4] text-[11px] font-bold">{selCount}</span>
        )}
        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
          overSelected ? "bg-[#4ECDC4] shadow-sm shadow-[#4ECDC4]/30" : "bg-white/10"
        }`}>
          {overSelected && <Check size={12} className="text-white" />}
        </div>
        {kategorier.length > 0 && (
          <ChevronDown
            size={14}
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className={`text-white/30 transition-transform cursor-pointer hover:text-white/60 ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {expanded && kategorier.length > 0 && (
        <div className="px-3 pb-3 pt-1 space-y-1.5">
          {kategorier.map(kat => (
            <KategoriRow
              key={kat.tag}
              kat={kat}
              selectedTags={selectedTags}
              onToggle={onToggle}
              onSelectAll={onSelectAll}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResultChip({ node, isSelected, onToggle }: {
  node: TagNode; isSelected: boolean; onToggle: (tag: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(node.tag)}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
        isSelected
          ? "bg-[#4ECDC4]/20 text-[#4ECDC4] ring-1 ring-[#4ECDC4]/40"
          : "bg-white/6 text-white/50 hover:bg-white/10 hover:text-white/70"
      }`}
    >
      <span className="text-xs">{node.emoji}</span>
      <span>{node.label}</span>
      {isSelected ? <Check size={10} className="ml-0.5" /> : <span className="text-white/20 ml-0.5">+</span>}
    </button>
  );
}

export default function Onboarding() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { setCity, setCities, setOnboardingInterests, setSelectedTags: setContextTags, setRadius } = useTags();
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [zipMatch, setZipMatch] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [tagSearch, setTagSearch] = useState("");
  const tagSearchRef = useRef<HTMLInputElement>(null);

  const [selectedRadius, setSelectedRadius] = useState(25);
  const [saving, setSaving] = useState(false);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return [];
    const q = citySearch.trim();
    const zipCity = lookupZip(q);
    if (zipCity) return [zipCity];
    const lower = q.toLowerCase();
    return ALL_CITIES.filter(c => c.toLowerCase().includes(lower) && !selectedCities.includes(c)).slice(0, 8);
  }, [citySearch, selectedCities]);

  useEffect(() => {
    setZipMatch(lookupZip(citySearch.trim()));
  }, [citySearch]);

  const searchResults = useMemo(() => {
    if (!tagSearch.trim()) return [];
    return searchTags(tagSearch).slice(0, 20);
  }, [tagSearch]);

  const isSearching = tagSearch.trim().length > 0;

  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) &&
          searchRef.current && !searchRef.current.contains(target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addCity = (city: string) => {
    if (!selectedCities.includes(city)) {
      setSelectedCities(prev => [...prev, city]);
    }
    setCitySearch("");
    setShowCityDropdown(false);
    setZipMatch(null);
  };

  const removeCity = (city: string) => {
    setSelectedCities(prev => prev.filter(c => c !== city));
  };

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const selectAllTags = useCallback((tags: string[]) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      for (const tag of tags) next.add(tag);
      return next;
    });
  }, []);

  const handleFinish = async () => {
    setSaving(true);
    const tagArray = [...selectedTags];
    const vibeKeys = [...new Set(
      tagArray.map(tag => getOverkategoriForTag(tag)).filter(Boolean) as string[]
    )];
    const primaryCity = selectedCities[0] || "";

    setCity(primaryCity);
    setCities(selectedCities);
    setOnboardingInterests(tagArray);
    setContextTags(tagArray);
    setRadius(selectedRadius);

    if (user?.id) {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          city: primaryCity,
          interests: tagArray,
          vibe_tags: vibeKeys,
          radius_km: selectedRadius,
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (error) console.error("Onboarding save error:", error);
      await refreshProfile();
    }

    setSaving(false);
    setLocation("/feed");
  };

  const tagCount = selectedTags.size;
  const radiusLabel = selectedRadius === 0 ? t('onboarding.all_dk') : `${selectedRadius} km`;
  const radiusCircleSize = selectedRadius === 0 ? 200 : Math.min(80 + (selectedRadius / 200) * 120, 200);

  return (
    <div
      className="relative min-h-svh flex flex-col"
      style={{ background: "#060a0f" }}
      data-testid="onboarding-page"
    >
      <div className="flex gap-2 px-8 pt-14 pb-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-[#4ECDC4]" : "bg-white/15"}`} />
        ))}
      </div>
      <div className="px-8 pb-1">
        <span className="text-white/25 text-xs font-medium">{t('common.step_of', { step, total: totalSteps })}</span>
      </div>

      <div className="flex-1 px-6 pt-3 pb-8 flex flex-col overflow-hidden">

        {step === 1 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/15 flex items-center justify-center">
                <MapPin size={20} className="text-[#4ECDC4]" />
              </div>
              <div>
                <h1 className="text-white text-xl font-serif" style={{ fontWeight: 400 }}>{t('onboarding.where_experience')}</h1>
                <p className="text-white/40 text-sm">{t('onboarding.select_cities')}</p>
              </div>
            </div>

            <div className="relative mb-3">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                ref={searchRef}
                type="text"
                inputMode="search"
                value={citySearch}
                onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                onFocus={() => citySearch && setShowCityDropdown(true)}
                placeholder={t('onboarding.city_or_zip')}
                className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/60 focus:border-[#4ECDC4]/40 transition-all"
                data-testid="input-city-search"
              />
              {citySearch && (
                <button onClick={() => { setCitySearch(""); setShowCityDropdown(false); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"><X size={16} /></button>
              )}
              {showCityDropdown && filteredCities.length > 0 && (
                <div ref={dropdownRef} className="absolute top-full mt-1.5 left-0 right-0 rounded-xl bg-[#1a1f2e] border border-white/10 shadow-xl z-50 max-h-[200px] overflow-y-auto">
                  {filteredCities.map(city => {
                    const alreadyAdded = selectedCities.includes(city);
                    return (
                      <button key={city} onClick={() => !alreadyAdded && addCity(city)} className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/8 flex items-center gap-2 ${alreadyAdded ? "text-[#4ECDC4] bg-[#4ECDC4]/10" : "text-white/80"}`}>
                        <MapPin size={14} className="text-white/30 shrink-0" />
                        <span className="flex-1">{city}</span>
                        {zipMatch && <span className="text-white/30 text-xs">({citySearch})</span>}
                        {alreadyAdded ? <Check size={14} className="text-[#4ECDC4]" /> : <Plus size={14} className="text-white/30" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedCities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCities.map((city, i) => (
                  <div key={city} className="px-3 py-1.5 rounded-full bg-[#4ECDC4]/15 border border-[#4ECDC4]/30 flex items-center gap-1.5 animate-in fade-in duration-200">
                    <MapPin size={12} className="text-[#4ECDC4]" />
                    <span className="text-[#4ECDC4] text-sm font-medium">{city}</span>
                    {i === 0 && <span className="text-[#4ECDC4]/40 text-[11px]">{t('onboarding.primary')}</span>}
                    <button onClick={() => removeCity(city)} className="ml-0.5 text-[#4ECDC4]/60 hover:text-[#4ECDC4]"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">{t('onboarding.popular_cities')}</p>
            <div className="grid grid-cols-3 gap-2.5">
              {POPULAR_CITIES.map(c => {
                const active = selectedCities.includes(c.name);
                return (
                  <button key={c.name} onClick={() => active ? removeCity(c.name) : addCity(c.name)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl transition-all ${
                      active
                        ? "bg-[#4ECDC4]/15 ring-1 ring-[#4ECDC4]/40"
                        : "bg-white/5 ring-1 ring-white/8 hover:bg-white/8"
                    }`}
                    data-testid={`city-${c.name}`}
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className={`text-xs font-medium ${active ? "text-[#4ECDC4]" : "text-white/60"}`}>{c.name}</span>
                    {active && <Check size={12} className="text-[#4ECDC4]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex-1" />

            <button
              onClick={() => selectedCities.length > 0 ? setStep(2) : null}
              disabled={selectedCities.length === 0}
              className="w-full py-4 rounded-2xl bg-[#4ECDC4] text-[#0a0f1a] font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3dbdb5] active:scale-[0.98] transition-all shadow-lg mt-4"
              data-testid="button-next-step-1"
            >
              {t('common.continue')}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/15 flex items-center justify-center">
                <Sparkles size={20} className="text-[#4ECDC4]" />
              </div>
              <div>
                <h1 className="text-white text-xl font-serif" style={{ fontWeight: 400 }}>{t('onboarding.what_interests')}</h1>
                <p className="text-white/40 text-sm">{t('onboarding.select_interests')}</p>
              </div>
            </div>

            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                ref={tagSearchRef}
                type="text"
                value={tagSearch}
                onChange={e => setTagSearch(e.target.value)}
                placeholder={t('tags.search')}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/8 border border-white/12 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#4ECDC4]/40 transition-all"
                data-testid="input-tag-search"
              />
              {tagSearch && (
                <button onClick={() => setTagSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30"><X size={12} /></button>
              )}
            </div>

            {tagCount > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#4ECDC4] text-xs font-bold">{t('tags.selected_count', { count: tagCount })}</span>
                <button onClick={() => setSelectedTags(new Set())} className="text-white/30 text-xs">{t('tags.reset')}</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5" style={{ scrollbarWidth: "none" }}>
              {isSearching ? (
                searchResults.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {searchResults.map(node => (
                      <SearchResultChip
                        key={node.tag}
                        node={node}
                        isSelected={selectedTags.has(node.tag)}
                        onToggle={toggleTag}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-white/25 text-xs text-center py-4">{t('tags.no_match', { query: tagSearch })}</p>
                )
              ) : (
                getOverkategorier().map(over => (
                  <OverkategoriGroup
                    key={over.tag}
                    over={over}
                    selectedTags={selectedTags}
                    onToggle={toggleTag}
                    onSelectAll={selectAllTags}
                  />
                ))
              )}
            </div>

            <div className="flex gap-3 mt-3">
              <button onClick={() => setStep(1)} className="px-5 py-3.5 rounded-2xl bg-white/8 text-white/60 font-medium text-sm">
                {t('common.back')}
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-2xl bg-[#4ECDC4] text-[#0a0f1a] font-semibold text-sm hover:bg-[#3dbdb5] active:scale-[0.98] transition-all shadow-lg"
                data-testid="button-next-step-2"
              >
                {tagCount > 0 ? t('onboarding.continue_with', { count: tagCount }) : t('common.continue')}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/15 flex items-center justify-center">
                <Compass size={20} className="text-[#4ECDC4]" />
              </div>
              <div>
                <h1 className="text-white text-xl font-serif" style={{ fontWeight: 400 }}>{t('onboarding.how_far')}</h1>
                <p className="text-white/40 text-sm">{t('onboarding.set_radius')}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                className="rounded-full border-2 border-[#4ECDC4]/30 bg-[#4ECDC4]/5 flex items-center justify-center mb-6 transition-all duration-300"
                style={{ width: radiusCircleSize, height: radiusCircleSize }}
              >
                <div className="text-center">
                  <p className="text-[#4ECDC4] font-bold text-2xl">{radiusLabel}</p>
                  <p className="text-white/30 text-xs">{t('onboarding.radius')}</p>
                </div>
              </div>

              <p className="text-white/50 text-sm text-center mb-4">
                {t('onboarding.experiences_within')} <span className="text-[#4ECDC4] font-semibold">{radiusLabel}</span> {t('onboarding.of_city', { city: selectedCities[0] || t('onboarding.your_city') })}
              </p>

              <div className="w-full px-4 mb-6">
                <input type="range" min="0" max="250" step="5" value={selectedRadius} onChange={e => setSelectedRadius(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #4ECDC4 0%, #4ECDC4 ${(selectedRadius / 250) * 100}%, rgba(255,255,255,0.15) ${(selectedRadius / 250) * 100}%, rgba(255,255,255,0.15) 100%)` }}
                  data-testid="radius-slider"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-white/30 text-xs">{t('onboarding.all_dk')}</span>
                  <span className="text-white/30 text-xs">250 km</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {RADIUS_PRESETS.map(p => {
                  const active = selectedRadius === p.km;
                  return (
                    <button key={p.km} onClick={() => setSelectedRadius(p.km)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center min-w-[60px] ${active ? "bg-[#4ECDC4] text-[#0a0f1a] shadow-lg shadow-[#4ECDC4]/20" : "bg-white/5 text-white/40 border border-white/8 hover:bg-white/10"}`}>
                      <span>{p.km === 0 ? t('onboarding.all_dk') : p.label}</span>
                      <span className={`text-[11px] mt-0.5 ${active ? "text-white/70" : "text-white/25"}`}>{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl bg-white/4 border border-white/8 px-4 py-3 mb-3 mt-4">
              <p className="text-white/30 text-xs uppercase tracking-wider font-semibold mb-2">{t('onboarding.your_profile')}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 rounded-lg bg-white/8 text-white/60 text-xs flex items-center gap-1"><MapPin size={10} /> {selectedCities.join(", ")}</span>
                <span className="px-2 py-1 rounded-lg bg-[#4ECDC4]/15 text-[#4ECDC4] text-xs font-semibold">{t('onboarding.tags_count', { count: tagCount })}</span>
                <span className="px-2 py-1 rounded-lg bg-white/8 text-white/60 text-xs">{radiusLabel}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={handleFinish} disabled={saving} className="w-full py-4 rounded-2xl bg-[#4ECDC4] text-[#0a0f1a] font-semibold text-base hover:bg-[#3dbdb5] active:scale-[0.98] transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-60" data-testid="button-kom-i-gang-onboarding">
                {saving && <Loader2 size={18} className="animate-spin" />}
                {saving ? t('onboarding.setting_up') : t('onboarding.start_feed')}
              </button>
              <button onClick={() => setStep(2)} className="text-white/40 text-sm hover:text-white/60 transition-colors">{t('common.back')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
          }
