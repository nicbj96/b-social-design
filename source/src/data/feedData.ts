// DEPRECATED — Feed data now comes from Supabase via useEventsByTag/usePlacesByTag hooks.
// Safe to delete.
export type SocialActivity = {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  emoji: string;
  image: string;
  location: string;
  distance: string;
  spots: { current: number; total: number };
  tags: string[];
  category: string;
  price: number;
};
export const OPLEVELSER_NAER_DIG: SocialActivity[] = [];
export const OPLEVELSER_I_DIN_BY: SocialActivity[] = [];
export const OPLEVELSER_HELE_LANDET: SocialActivity[] = [];
