import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOverkategoriForTag } from "@/lib/tagEngine";

export type LifeMode = "solo" | "par" | "med-børn" | "venner" | "gruppe";
export type PriceTier = "alle" | "gratis" | "hverdag" | "premium";

interface TagContextType {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  lifeMode: LifeMode;
  setLifeMode: (mode: LifeMode) => void;
  priceTier: PriceTier;
  setPriceTier: (tier: PriceTier) => void;
  city: string;
  setCity: (city: string) => void;
  cities: string[];
  setCities: (cities: string[]) => void;
  onboardingInterests: string[];
  setOnboardingInterests: (interests: string[]) => void;
  radius: number;
  setRadius: (radius: number) => void;
  /** Returns unique overkategorier the user has tags in */
  getSelectedOverkategorier: () => string[];
}

const TagContext = createContext<TagContextType>({
  selectedTags: [],
  setSelectedTags: () => {},
  lifeMode: "solo",
  setLifeMode: () => {},
  priceTier: "alle",
  setPriceTier: () => {},
  city: "Aalborg",
  setCity: () => {},
  cities: ["Aalborg"],
  setCities: () => {},
  onboardingInterests: [],
  setOnboardingInterests: () => {},
  radius: 10,
  setRadius: () => {},
  getSelectedOverkategorier: () => [],
});

export function TagProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [lifeMode, setLifeMode] = useState<LifeMode>("solo");
  const [priceTier, setPriceTier] = useState<PriceTier>("alle");
  const [city, setCityRaw] = useState("Aalborg");
  const [cities, setCities] = useState<string[]>(["Aalborg"]);
  const [onboardingInterests, setOnboardingInterests] = useState<string[]>([]);
  const [radius, setRadius] = useState(10);

  // Keep city in sync: city = first of cities
  const setCity = (c: string) => {
    setCityRaw(c);
    if (!cities.includes(c)) setCities(prev => [...prev, c]);
  };

  // Sync from profile whenever it loads or changes
  useEffect(() => {
    if (profile) {
      if (profile.city) { setCityRaw(profile.city); setCities([profile.city]); }
      if (profile.radius_km) setRadius(profile.radius_km);
      if (profile.interests && profile.interests.length > 0) {
        setOnboardingInterests(profile.interests);
        setSelectedTags(profile.interests);
      }
    }
  }, [profile]);

  // Derive unique overkategorier from the user's selected tags
  const getSelectedOverkategorier = useMemo(() => {
    return () => [...new Set(
      selectedTags.map(t => getOverkategoriForTag(t)).filter(Boolean) as string[]
    )];
  }, [selectedTags]);

  return (
    <TagContext.Provider value={{ selectedTags, setSelectedTags, lifeMode, setLifeMode, priceTier, setPriceTier, city, setCity, cities, setCities, onboardingInterests, setOnboardingInterests, radius, setRadius, getSelectedOverkategorier }}>
      {children}
    </TagContext.Provider>
  );
}

export function useTags() {
  return useContext(TagContext);
}
