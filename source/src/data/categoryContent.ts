// DEPRECATED — All category content now comes from Supabase via tagData.ts hooks.
// Safe to delete.
export type CategoryPlace = { name: string; description: string; coordinates: [number, number] };
export type CategoryActivity = { title: string; description: string; emoji: string };
export function getCategoryPlaces(_slug: string): CategoryPlace[] { return []; }
export function getCategoryActivities(_slug: string): CategoryActivity[] { return []; }
export function getSubcategoryPlaces(_slug: string): CategoryPlace[] { return []; }
export function getSubcategoryActivities(_slug: string): CategoryActivity[] { return []; }
export function getCategoryContentCount(_slug: string): number { return 0; }
export const SUBCATEGORY_INFO: Record<string, any> = {};
