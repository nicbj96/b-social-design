import { createClient } from "@supabase/supabase-js";
import i18n from "./i18n";

// Supabase credentials — loaded from environment variables
// For local development, create a .env file with:
//   VITE_SUPABASE_URL=https://rbengtfrthqdfbcdcugp.supabase.co
//   VITE_SUPABASE_ANON_KEY=<your-anon-key>
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("[B-Social] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

/* ── Types matching Supabase schema ── */

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
  weather_suitable: string | null;
  indoor_outdoor: string | null;
  category_level: string | null;
  country: string | null;
};

export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  location: string | null;
  city: string | null;
  interests: string[] | null;
  vibe_tags: string[] | null;
  created_at: string;
  updated_at: string | null;
};

export type Place = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  main_categories: string[];
  tags: string[];
  smart_tags: string[];
  metadata: Record<string, any> | null;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
};

export type SupabaseRoute = {
  id: string;
  place_id: string;
  name: string;
  description: string;
  activity_type: string;
  distance_km: number;
  difficulty: string;
  loop: boolean;
  surface: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

/* ── API helpers ── */

export async function fetchPlaces(options?: {
  country?: string;
  categories?: string[];
  limit?: number;
  offset?: number;
  bbox?: { minLat: number; maxLat: number; minLon: number; maxLon: number };
}): Promise<Place[]> {
  const limit = options?.limit || 500;
  const offset = options?.offset || 0;

  let query = supabase
    .from("places")
    .select("*")
    .order("quality_score", { ascending: false, nullsFirst: false })
    .order("rating_avg", { ascending: false, nullsFirst: false });

  // Geographic bounding box filter (most efficient for map views)
  if (options?.bbox) {
    query = query
      .gte("latitude", options.bbox.minLat)
      .lte("latitude", options.bbox.maxLat)
      .gte("longitude", options.bbox.minLon)
      .lte("longitude", options.bbox.maxLon);
  }

  // Country filter
  if (options?.country) {
    query = query.eq("country", options.country);
  }

  // Category filter
  if (options?.categories && options.categories.length > 0) {
    query = query.overlaps("main_categories", options.categories);
  }

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) { console.error("fetchPlaces error:", error); return []; }
  return data || [];
}

export async function fetchRoutes(): Promise<SupabaseRoute[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*");
  if (error) { console.error("fetchRoutes error:", error); return []; }
  return data || [];
}

export type RouteWithPlace = SupabaseRoute & {
  places: { latitude: number | null; longitude: number | null; city: string | null; country: string | null } | null;
};

/** Fetch routes joined with their place's coordinates — for map display */
export async function fetchRoutesForMap(): Promise<RouteWithPlace[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*, places(latitude, longitude, city, country)");
  if (error) { console.error("fetchRoutesForMap error:", error); return []; }
  return (data as RouteWithPlace[]) || [];
}

export async function fetchEvents(): Promise<Event[]> {
  // Paginate to get active/future events only (Supabase defaults to 1000 row limit)
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
    if (error) { console.error("fetchEvents error:", error); break; }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchReviews error:", error); return []; }
  return data || [];
}

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*");
  if (error) { console.error("fetchProfiles error:", error); return []; }
  return data || [];
}

/** Fetch the 5 newest places, sorted by created_at DESC */
export async function fetchNewestPlaces(limit = 5): Promise<Place[]> {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("fetchNewestPlaces error:", error); return []; }
  return data || [];
}

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/** Fetch places within viewport bounds (lightweight columns, limit 500 desktop / 200 mobile) */
export async function fetchPlacesInViewport(
  bounds: MapBounds,
  country?: string,
  isMobile?: boolean,
  categories?: string[],
): Promise<Place[]> {
  // Reduce marker limit on mobile to improve clustering performance
  const limit = isMobile ? 200 : 500;

  let query = supabase
    .from("places")
    .select("id,name,latitude,longitude,city,country,main_categories,tags,rating_avg,quality_score")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .gte("latitude", bounds.south)
    .lte("latitude", bounds.north)
    .gte("longitude", bounds.west)
    .lte("longitude", bounds.east)
    .order("quality_score", { ascending: false, nullsFirst: false })
    .order("rating_avg", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (country && country !== 'ALL') {
    query = query.eq("country", country);
  }
  if (categories && categories.length > 0) {
    query = query.overlaps("main_categories", categories);
  }

  const { data, error } = await query;
  if (error) { console.error("fetchPlacesInViewport error:", error); return []; }
  return (data as unknown as Place[]) || [];
}

/** Fetch places with optional limit */
// Paginate ALL places for map view (lightweight columns only)
export async function fetchAllPlacesForMap(country?: string): Promise<Place[]> {
  const all: Place[] = [];
  let from = 0;
  const PAGE = 5000;
  while (true) {
    let query = supabase
      .from("places")
      .select("id,name,latitude,longitude,city,country,main_categories,tags,rating_avg,quality_score")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("quality_score", { ascending: false, nullsFirst: false });
    if (country && country !== 'ALL') {
      query = query.eq("country", country);
    }
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error) { console.error("fetchAllPlacesForMap error:", error); break; }
    if (!data || data.length === 0) break;
    all.push(...(data as unknown as Place[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

export async function fetchPlacesWithLimit(limit = 50): Promise<Place[]> {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("fetchPlacesWithLimit error:", error); return []; }
  return data || [];
}

/* ── Notification helpers ── */

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, any>,
) {
  return supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    data: data ?? null,
    is_read: false,
  });
}

export async function createTagMatchNotification(userId: string, event: Event) {
  const tag = event.interest_tags?.[0] || event.category;
  const title = i18n.t("notifications.tag_match_title", { tag });
  return createNotification(
    userId,
    "tag_match",
    title,
    event.title,
    { link: `/event/${event.id}`, event_id: event.id },
  );
}

export async function createEventInviteNotification(
  userId: string,
  eventTitle: string,
  eventId: string,
  inviterName: string,
) {
  const title = i18n.t("notifications.event_invite_title", { name: inviterName });
  return createNotification(
    userId,
    "event_invite",
    title,
    eventTitle,
    { link: `/event/${eventId}`, event_id: eventId },
  );
}

export async function createFriendRequestNotification(
  userId: string,
  fromName: string,
  fromId: string,
) {
  const title = i18n.t("notifications.friend_request_title", { name: fromName });
  const body = i18n.t("notifications.friend_request_body");
  return createNotification(
    userId,
    "friend_request",
    title,
    body,
    { link: `/profil/${fromId}`, from_user_id: fromId },
  );
}

/** Count places by city */
export async function fetchPlaceCounts(): Promise<{ aalborg: number; nordjylland: number }> {
  const { data, error } = await supabase
    .from("places")
    .select("city, region");
  if (error) { console.error("fetchPlaceCounts error:", error); return { aalborg: 0, nordjylland: 0 }; }
  const all = data || [];
  const aalborg = all.filter(p => p.city?.toLowerCase() === "aalborg").length;
  const nordjylland = all.length; // All 60 are in Nordjylland
  return { aalborg, nordjylland };
}
