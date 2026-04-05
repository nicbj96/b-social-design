// DEPRECATED — Map pin types moved to Kort.tsx, hardcoded pins removed.
// Safe to delete.
export type PinCategory =
  | "sport" | "kultur" | "natur" | "musik" | "mad" | "spil" | "events"
  | "mtb" | "vandring" | "loeb" | "hund" | "fiskeri" | "badning" | "shelter"
  | "dyrespot" | "kreativt" | "fitness" | "outdoor" | "socialt" | "karriere"
  | "tech" | "aktiv_sport" | "mad_hangout" | "rejser" | "logi" | "wellness"
  | "communities" | "ture" | "aktiv";

export interface MapPin {
  id: string; name: string; lat: number; lng: number;
  category: PinCategory; description?: string; rating: number;
  ratingCount?: number; isEvent?: boolean; tags?: string[];
  city?: string; fromSupabase?: boolean; image?: string;
  date?: string; price?: number | null; eventId?: string;
}

export const HARDCODED_PINS: MapPin[] = [];
export const SUPPORTED_COUNTRIES: string[] = [];
