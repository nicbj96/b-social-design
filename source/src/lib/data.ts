// Live data layer — fetches from Supabase with static JSON fallback
import { supabase } from "./supabase";
import { logger } from "./logger";

export type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  image_url: string | null;
  date: string;
  category: string;
  max_participants: number;
  created_by: string | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  price: number | null;
  interest_tags: string[] | null;
  suitable_for_modes: string[] | null;
  weather_suitable: string[] | null;
  indoor_outdoor: string | null;
  category_level: number | null;
  min_required_participants: number | null;
  country: string | null;
  source?: string | null;
  url?: string | null;
};

let _cachedEvents: Event[] | null = null;
let _cachedStaticEvents: Event[] | null = null;

/** Fetch static fallback events from public directory (lazy-loaded, not bundled) */
async function getStaticEvents(): Promise<Event[]> {
  if (_cachedStaticEvents) return _cachedStaticEvents;

  try {
    const response = await fetch("/events.json");
    if (!response.ok) throw new Error(`Failed to fetch events.json: ${response.status}`);
    _cachedStaticEvents = await response.json() as Event[];
    return _cachedStaticEvents ?? [];
  } catch (e) {
    logger.warn("Failed to load static events fallback:", e);
    return [];
  }
}

/** Fetch all events — live from Supabase, fallback to static JSON */
export async function getEvents(): Promise<Event[]> {
  // Return cache if available
  if (_cachedEvents) return _cachedEvents;

  try {
    // Paginate to get ALL future events (Supabase defaults to 1000 row limit)
    const todayISO = new Date().toISOString().split("T")[0];
    const all: Event[] = [];
    let from = 0;
    const PAGE = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", todayISO)
        .or("status.eq.active,status.is.null")
        .order("date", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) { logger.warn("Supabase fetch error:", error); break; }
      if (!data || data.length === 0) break;
      all.push(...(data as Event[]));
      if (data.length < PAGE) break;
      from += PAGE;
    }

    if (all.length > 0) {
      _cachedEvents = all;
      // Refresh cache every 10 minutes
      setTimeout(() => { _cachedEvents = null; }, 10 * 60 * 1000);
      return _cachedEvents;
    }
  } catch (e) {
    logger.warn("Supabase fetch failed, using static fallback:", e);
  }

  // Fallback: static JSON sorted by date, filter out past events
  const now = new Date().toISOString().split("T")[0];
  const staticEvents = await getStaticEvents();
  const fallback = (staticEvents as Event[])
    .filter((e) => e.date >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return fallback;
}

/** Get single event by id */
export async function getEventById(id: string): Promise<Event | null> {
  const events = await getEvents();
  return events.find((e) => e.id === id) ?? null;
}

/** Get events filtered by interest tags */
export async function getEventsByTags(tags: string[]): Promise<Event[]> {
  const events = await getEvents();
  if (tags.length === 0) return events;
  return events.filter(
    (e) =>
      e.interest_tags?.some((t) => tags.includes(t)) ||
      tags.includes(e.category?.toLowerCase())
  );
}
