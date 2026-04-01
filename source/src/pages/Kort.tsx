import { useState, useMemo, useEffect, useRef } from "react";

// Leaflet core CSS — must be imported directly so Vite bundles it correctly
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker, useMap, CircleMarker, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { fetchPlacesInViewport, fetchEvents, type Place, type Event as SupabaseEvent, type MapBounds } from "@/lib/supabase";
import { useTranslation } from 'react-i18next';
import { useIsMobile } from "@/hooks/use-mobile";

// Prevent Leaflet from injecting default marker image (red pin)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: '', iconRetinaUrl: '', shadowUrl: '' });

import { Search, X, Plus, Minus, Navigation, Star, ExternalLink, Users, MapPin as MapPinIcon } from "lucide-react";

import { lazyLoadTagFunctions } from "@/lib/lazyDataLoader";
import { type PinCategory, type MapPin, HARDCODED_PINS, MAP_EUROPE_CODES } from "@/data/kortPins";
import { useJoin } from "@/context/JoinContext";
import { useTags } from "@/context/TagContext";
import { Link } from "wouter";

/* ══════════════════════════════════════════════
   KORT v3 — Dyb opdatering
   ══════════════════════════════════════════════ */

/* ── Country filter config ── */
const MAP_REGIONS: Record<string, { flag: string; label: string }> = {
  'DK': { flag: '🇩🇰', label: 'Danmark' },
  'SE': { flag: '🇸🇪', label: 'Sverige' },
  'NO': { flag: '🇳🇴', label: 'Norge' },
  'DE': { flag: '🇩🇪', label: 'Tyskland' },
  'GB': { flag: '🇬🇧', label: 'UK' },
  'FR': { flag: '🇫🇷', label: 'Frankrig' },
  'EUROPE': { flag: '🌍', label: 'Europa' },
  'ALL': { flag: '🌎', label: 'Hele verden' },
};

const MAP_COUNTRY_CHIPS = ['DK', 'SE', 'NO', 'DE', 'GB', 'FR', 'EUROPE', 'ALL'] as const;

const COUNTRY_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'DK': { lat: 56.26, lng: 9.50, zoom: 7 },
  'SE': { lat: 62.0, lng: 15.0, zoom: 5 },
  'NO': { lat: 64.0, lng: 12.0, zoom: 5 },
  'DE': { lat: 51.16, lng: 10.45, zoom: 6 },
  'GB': { lat: 54.0, lng: -2.0, zoom: 6 },
  'FR': { lat: 46.6, lng: 2.2, zoom: 6 },
  'ES': { lat: 40.0, lng: -3.7, zoom: 6 },
  'IT': { lat: 42.5, lng: 12.5, zoom: 6 },
  'EUROPE': { lat: 50.0, lng: 10.0, zoom: 4 },
  'ALL': { lat: 30.0, lng: 10.0, zoom: 2 },
};

/* ── Category config ── */
const CATEGORY_META: Record<string, { labelKey: string; emoji: string; hex: string }> = {
  // 10 locked categories
  events:      { labelKey: "map.categories.events",      emoji: "🎉", hex: "#eab308" },
  logi:        { labelKey: "map.categories.logi",        emoji: "🏕️", hex: "#b45309" },
  ture:        { labelKey: "map.categories.ture",        emoji: "🥾", hex: "#16a34a" },
  natur:       { labelKey: "map.categories.natur",       emoji: "🌿", hex: "#4ECDC4" },
  aktiv:       { labelKey: "map.categories.aktiv",       emoji: "⚽", hex: "#3b82f6" },
  mad:         { labelKey: "map.categories.mad",         emoji: "🍽️", hex: "#f59e0b" },
  kultur:      { labelKey: "map.categories.kultur",      emoji: "🎭", hex: "#a855f7" },
  rejser:      { labelKey: "map.categories.rejser",      emoji: "🚆", hex: "#0284c7" },
  communities: { labelKey: "map.categories.communities", emoji: "👥", hex: "#dc2626" },
  wellness:    { labelKey: "map.categories.wellness",    emoji: "🧘", hex: "#14b8a6" },
  // Legacy / sub-category pins
  sport:       { labelKey: "map.categories.sport",       emoji: "⚽", hex: "#3b82f6" },
  musik:       { labelKey: "map.categories.musik",       emoji: "🎵", hex: "#ec4899" },
  mad_hangout: { labelKey: "map.categories.mad_hangout", emoji: "🍽️", hex: "#f59e0b" },
  spil:        { labelKey: "map.categories.spil",        emoji: "🎲", hex: "#3b82f6" },
  mtb:         { labelKey: "map.categories.mtb",         emoji: "🚵", hex: "#f97316" },
  vandring:    { labelKey: "map.categories.vandring",    emoji: "🥾", hex: "#65a30d" },
  loeb:        { labelKey: "map.categories.loeb",        emoji: "🏃", hex: "#06b6d4" },
  hund:        { labelKey: "map.categories.hund",        emoji: "🐕", hex: "#ca8a04" },
  fiskeri:     { labelKey: "map.categories.fiskeri",     emoji: "🎣", hex: "#0d9488" },
  badning:     { labelKey: "map.categories.badning",     emoji: "🏊", hex: "#0ea5e9" },
  shelter:     { labelKey: "map.categories.shelter",     emoji: "⛺", hex: "#78716c" },
  dyrespot:    { labelKey: "map.categories.dyrespot",    emoji: "🦌", hex: "#15803d" },
  kreativt:    { labelKey: "map.categories.kreativt",    emoji: "🖌️", hex: "#f43f5e" },
  fitness:     { labelKey: "map.categories.fitness",     emoji: "💪", hex: "#ea580c" },
  outdoor:     { labelKey: "map.categories.outdoor",     emoji: "🌲", hex: "#16a34a" },
  socialt:     { labelKey: "map.categories.socialt",     emoji: "❤️", hex: "#dc2626" },
  karriere:    { labelKey: "map.categories.karriere",    emoji: "💼", hex: "#64748b" },
  tech:        { labelKey: "map.categories.tech",        emoji: "💻", hex: "#0891b2" },
  aktiv_sport: { labelKey: "map.categories.aktiv_sport", emoji: "🏃", hex: "#3b82f6" },
};

/* ── Header images per category for detail sheet ── */
const PIN_HEADER_IMAGES: Record<string, string> = {
  sport:    "https://images.unsplash.com/photo-1461896836934-bd45ba3ff2b3?w=600",
  kultur:   "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600",
  natur:    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600",
  musik:    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600",
  mad:      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
  mad_hangout: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
  spil:     "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600",
  events:   "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600",
  mtb:      "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=600",
  vandring: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",
  loeb:     "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600",
  hund:     "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600",
  fiskeri:  "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600",
  badning:  "https://images.unsplash.com/photo-1519314793478-81a89b69502e?w=600",
  shelter:  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600",
  dyrespot: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600",
  kreativt: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
  fitness:  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600",
  outdoor:  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600",
  socialt:  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600",
  karriere: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600",
  tech:     "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
  aktiv_sport: "https://images.unsplash.com/photo-1461896836934-bd45ba3ff2b3?w=600",
  // New 10 locked categories
  rejser:      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600",
  logi:        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600",
  wellness:    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600",
  communities: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600",
  ture:        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",
  aktiv:       "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600",
};
// City coordinate lookup
const CITY_COORDS: Record<string, [number, number]> = {
  "Aalborg": [57.048, 9.9187],
  "København": [55.676, 12.568],
  "Aarhus": [56.162, 10.203],
  "Odense": [55.396, 10.388],
  "Esbjerg": [55.467, 8.452],
  "Vejle": [55.711, 9.536],
  "Randers": [56.462, 10.036],
  "Viborg": [56.453, 9.402],
  "Herning": [56.139, 8.974],
  "Silkeborg": [56.170, 9.545],
  "Horsens": [55.862, 9.850],
  "Kolding": [55.490, 9.472],
  "Roskilde": [55.642, 12.080],
  "Hjørring": [57.464, 9.982],
  "Frederikshavn": [57.440, 10.536],
  "Slagelse": [55.402, 11.354],
  "Holbæk": [55.717, 11.713],
  "Næstved": [55.230, 11.760],
  "Helsingborg": [56.036, 12.614],
};

// Default fallback (Aalborg)
const DEFAULT_LAT = 57.048;
const DEFAULT_LNG = 9.9187;

/* ── Supabase place → category mapping ── */
const SUPABASE_CAT_MAP: Record<string, PinCategory> = {
  natur: "natur", hike: "natur", vandring: "vandring", hundeskov: "hund",
  shelter: "shelter", dyrespot: "dyrespot", fiskeri: "fiskeri",
  strand: "badning", badning: "badning", vand: "badning", badestrand: "badning",
  kultur: "kultur", museum: "kultur", kreativt: "kreativt",
  sport: "sport", aktiv_sport: "aktiv_sport", loeb: "loeb", mtb: "mtb", fitness: "fitness",
  mad: "mad", mad_hangout: "mad_hangout",
  // New 10 locked categories
  rejser: "rejser", transport: "rejser", tog: "rejser", bus: "rejser", faerge: "rejser",
  logi: "logi", camping: "logi", vandrerhjem: "logi", hytter: "logi", glamping: "logi",
  wellness: "wellness", yoga: "wellness", meditation: "wellness", sauna: "wellness",
  communities: "communities", bogklub: "communities", braetspil: "communities",
  ture: "ture", eventyr: "ture", kajak: "ture",
  aktiv: "aktiv",
};

function placeToPin(place: Place): MapPin | null {
  // Guard: skip places with missing or invalid coordinates
  const lat = place.latitude;
  const lng = place.longitude;
  if (lat == null || lng == null || !isFinite(lat) || !isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null; // (0,0) is ocean — invalid placeholder

  let cat: PinCategory = "natur";
  const cats = [...(place.main_categories || []), ...(place.tags || [])];
  for (const c of cats) {
    const key = c.toLowerCase().replace(/[\s-]/g, "");
    for (const [mapKey, val] of Object.entries(SUPABASE_CAT_MAP)) {
      if (key.includes(mapKey) || mapKey.includes(key)) { cat = val; break; }
    }
    if (cat !== "natur") break;
  }
  return {
    id: `sb-${place.id}`, name: place.name, lat, lng,
    category: cat, description: place.description, rating: place.rating_avg || 0,
    ratingCount: place.rating_count || 0, tags: place.tags, city: place.city, fromSupabase: true,
  };
}

/* ── Supabase event → MapPin ── */
function supabaseEventToPin(event: SupabaseEvent): MapPin | null {
  if (!event.latitude || !event.longitude) return null;
  return {
    id: `ev-${event.id}`,
    eventId: event.id,
    name: event.title,
    lat: event.latitude,
    lng: event.longitude,
    category: "events",
    description: event.description,
    rating: 0,
    isEvent: true,
    isSupabaseEvent: true,
    fromSupabase: true,
    tags: event.interest_tags || [],
    image: event.image_url || undefined,
    date: event.date,
    price: event.price,
    city: event.location,
  };
}

/* ── Pin icon: colored emoji circle ── */
function createEmojiIcon(emoji: string, hex: string, size: number = 32): L.DivIcon {
  return L.divIcon({
    className: "b-pin",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${hex};border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:${Math.round(size * 0.45)}px;line-height:1;">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/* ── Haversine distance ── */
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Map internal components ── */

// Component to listen for map movement and trigger viewport-based loading
function MapEventListener({ onBoundsChange }: { onBoundsChange: (bounds: MapBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
  });
  return null;
}

function ZoomControls() {
  const { t } = useTranslation();
  const map = useMap();
  return (
    <div className="absolute bottom-28 right-3 z-[1000] flex flex-col gap-1.5">
      <button onClick={() => map.zoomIn()} className="w-10 h-10 rounded-xl bg-[#0f142d]/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/15 transition-colors shadow-lg" data-testid="button-zoom-in">
        <Plus size={18} />
      </button>
      <button onClick={() => map.zoomOut()} className="w-10 h-10 rounded-xl bg-[#0f142d]/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/15 transition-colors shadow-lg" data-testid="button-zoom-out">
        <Minus size={18} />
      </button>
    </div>
  );
}

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const { t } = useTranslation();
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 0.8 }); }, [center, zoom, map]);
  return null;
}

/** Fix Leaflet tile rendering — invalidateSize on mount + resize + visibility */
function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    // Aggressive invalidateSize chain to handle async layout & SPA transitions
    const timers = [0, 50, 150, 300, 600, 1000, 2000].map(ms =>
      setTimeout(() => map.invalidateSize({ animate: false }), ms)
    );
    // ResizeObserver for sidebar/layout changes
    const container = map.getContainer();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => map.invalidateSize({ animate: false }));
    });
    ro.observe(container);
    // Also handle tab visibility changes
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => map.invalidateSize({ animate: false }), 100);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => { timers.forEach(clearTimeout); ro.disconnect(); document.removeEventListener('visibilitychange', onVisible); };
  }, [map]);
  return null;
}

const GEOAPIFY_KEY = "c6ed42e8addb457ebf24265a045b892b";

/* ── Inline nearby hotels for pin detail ── */
function PinNearbyHotels({ lat, lng, city }: { lat: number; lng: number; city: string }) {
  const [hotels, setHotels] = useState<{ name: string; dist: number; lat: number; lon: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadHotels = () => {
    if (hotels.length > 0) { setExpanded(!expanded); return; }
    setLoading(true);
    setExpanded(true);
    fetch(`https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lng},${lat},5000&limit=4&apiKey=${GEOAPIFY_KEY}`)
      .then(r => r.json())
      .then(data => {
        const h = (data.features || []).map((f: any) => {
          const p = f.properties;
          const dLat = (p.lat - lat) * 111320;
          const dLon = (p.lon - lng) * 111320 * Math.cos(lat * Math.PI / 180);
          return { name: p.name || "Hotel", dist: Math.round(Math.sqrt(dLat * dLat + dLon * dLon)), lat: p.lat, lon: p.lon };
        });
        setHotels(h);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="mt-2">
      <button
        onClick={loadHotels}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#003580]/80 text-white text-[11px] font-semibold hover:bg-[#003580] transition-colors"
      >
        {loading ? "Søger hoteller..." : expanded ? "🏨 Skjul hoteller" : "🏨 Vis hoteller nærby"}
      </button>
      {expanded && hotels.length > 0 && (
        <div className="mt-1.5 space-y-1">
          {hotels.map((h, i) => (
            <a
              key={i}
              href={`https://www.booking.com/searchresults.da.html?ss=${encodeURIComponent(h.name)}&latitude=${h.lat}&longitude=${h.lon}&radius=1&aid=304142`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/4 hover:bg-white/8 transition-colors"
            >
              <span className="text-white text-[11px] font-medium truncate flex-1">{h.name}</span>
              <span className="text-white/30 text-[10px] ml-2 flex-shrink-0">
                {h.dist < 1000 ? `${h.dist}m` : `${(h.dist / 1000).toFixed(1)}km`}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Pin detail bottom sheet ── */
function PinDetail({ pin, onClose }: { pin: MapPin; onClose: () => void }) {
  const { t } = useTranslation();
  const meta = CATEGORY_META[pin.category] || CATEGORY_META["natur"];
  const dist = distanceKm(DEFAULT_LAT, DEFAULT_LNG, pin.lat, pin.lng);
  const distText = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`;
  const headerImg = pin.image || PIN_HEADER_IMAGES[pin.category] || PIN_HEADER_IMAGES["natur"];

  return (
    <div className="absolute bottom-20 left-3 right-3 z-[1100] animate-in slide-in-from-bottom-4 duration-300" data-testid="pin-detail">
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15, 20, 45, 0.96)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Header image */}
        <div className="h-28 relative overflow-hidden">
          <img src={headerImg} alt={pin.name} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f142d] via-[#0f142d]/40 to-transparent" />
          {/* Category badge */}
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: pin.isSupabaseEvent ? "#f97316" : meta.hex }}>
            {pin.isSupabaseEvent ? `🎉 ${typeof t('map.event_label') === 'string' ? t('map.event_label') : 'Event'}` : `${meta.emoji} ${typeof t(meta.labelKey) === 'string' ? t(meta.labelKey) : meta.labelKey.split('.').pop() || ''}`}
          </span>
          {pin.fromSupabase && (
            <span className="absolute top-2.5 right-10 px-2 py-0.5 rounded-full bg-[#4ECDC4]/90 text-white text-[11px] font-bold">DB</span>
          )}
          <button onClick={onClose} className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60" data-testid="button-close-detail">
            <X size={14} />
          </button>
        </div>

        <div className="p-3.5">
          <h3 className="text-white font-bold text-[15px] leading-tight mb-1">{pin.name}</h3>

          {/* Rating + distance */}
          <div className="flex items-center gap-2 mb-2 text-[11px]">
            <div className="flex items-center gap-0.5">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-white/60">{pin.rating.toFixed(1)}</span>
              {pin.ratingCount ? <span className="text-white/30">({pin.ratingCount})</span> : null}
            </div>
            <span className="text-white/20">·</span>
            <span className="text-white/50 flex items-center gap-0.5"><MapPinIcon size={10} />{distText}</span>
            {pin.city && (<><span className="text-white/20">·</span><span className="text-white/50">{pin.city}</span></>)}
            {pin.difficultyKey && (
              <>
                <span className="text-white/20">·</span>
                <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  pin.difficultyKey === "map.difficulty.easy" ? "bg-green-500/20 text-green-400" :
                  pin.difficultyKey === "map.difficulty.medium" ? "bg-amber-500/20 text-amber-400" :
                  "bg-red-500/20 text-red-400"
                }`}>{typeof pin.difficultyKey === 'string' && typeof t(pin.difficultyKey) === 'string' ? t(pin.difficultyKey) : pin.difficultyKey?.split('.').pop() || ''}</span>
              </>
            )}
          </div>

          {/* Tags */}
          {pin.tags && pin.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {pin.tags.slice(0, 5).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 rounded-full bg-white/8 text-white/40 text-[11px]">{tag}</span>
              ))}
            </div>
          )}

          {/* Event date + price */}
          {pin.isSupabaseEvent && pin.date && (
            <div className="flex items-center gap-2 mb-2 text-[11px]">
              <span className="text-[#f97316] font-medium">
                {new Date(pin.date).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              {pin.price != null && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-white/60">{pin.price === 0 ? t('map.free') : `${pin.price} kr`}</span>
                </>
              )}
            </div>
          )}

          <p className="text-white/55 text-xs leading-relaxed mb-3">{pin.descriptionKey ? (typeof pin.descriptionKey === 'string' && typeof t(pin.descriptionKey) === 'string' ? t(pin.descriptionKey) : (pin.description || '')) : (pin.description || '')}</p>

          {/* Event spots */}
          {pin.isEvent && pin.spots && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/40 text-xs flex items-center gap-1"><Users size={10} />{pin.spots.current}/{pin.spots.total} {t('map.signed_up')}</span>
                <span className={`text-xs font-semibold ${(pin.spots.total - pin.spots.current) <= 1 ? "text-orange-400" : "text-[#4ECDC4]"}`}>
                  {pin.spots.total - pin.spots.current} {t('map.spots')}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full ${(pin.spots.total - pin.spots.current) <= 1 ? "bg-orange-400" : "bg-[#4ECDC4]"}`} style={{ width: `${(pin.spots.current / pin.spots.total) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {pin.isSupabaseEvent && pin.eventId ? (
              <>
                <Link href={`/event/${pin.eventId}`} className="flex-1 py-2.5 rounded-xl bg-[#f97316] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#ea580c] transition-colors">
                  {t('map.join')}
                </Link>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="py-2.5 px-3 rounded-xl bg-white/10 text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/15 transition-colors">
                  <Navigation size={13} />
                </a>
              </>
            ) : pin.fromSupabase ? (
              <>
                <Link href={`/sted/${pin.id.startsWith('sb-') ? pin.id.slice(3) : pin.id}`} className="flex-1 py-2.5 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#0ea572] transition-colors">
                  {t('map.see_more')}
                </Link>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="py-2.5 px-3 rounded-xl bg-white/10 text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/15 transition-colors">
                  <ExternalLink size={13} />
                </a>
              </>
            ) : (
              <>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#0ea572] transition-colors">
                  <Navigation size={13} /> {t('map.show_route')}
                </a>
                {pin.isEvent && (
                  <button className="flex-1 py-2.5 rounded-xl bg-[#f97316] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#ea580c] transition-colors">
                    {t('map.join')}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Inline nearby hotels */}
          <PinNearbyHotels lat={pin.lat} lng={pin.lng} city={pin.city || pin.name} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ KORT PAGE ═══════════════════ */
export default function Kort() {
  const { t } = useTranslation();
  const { city } = useTags();
  const [priceFilter, setPriceFilter] = useState<"alle" | "gratis" | "premium">("alle");
  const [search, setSearch] = useState("");
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [flyTo, setFlyTo] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const [showLayer, setShowLayer] = useState<"alle" | "steder" | "events" | "hoteller">("alle");
  const [tagSearchCache, setTagSearchCache] = useState<{ [query: string]: any[] }>({});
  const [mapCountry, setMapCountry] = useState<string>('DK');
  const searchRef = useRef<HTMLInputElement>(null);


  // Lazy load tag search function on demand
  useEffect(() => {
    if (search && !tagSearchCache[search.toLowerCase()]) {
      lazyLoadTagFunctions().then(({ searchTags }) => {
        const results = searchTags(search.toLowerCase());
        setTagSearchCache(prev => ({
          ...prev,
          [search.toLowerCase()]: results
        }));
      });
    }
  }, [search, tagSearchCache]);
  // Dynamic user location from profile city
  const [USER_LAT, USER_LNG] = CITY_COORDS[city] || [DEFAULT_LAT, DEFAULT_LNG];

  // Viewport-based loading state
  const [supabasePlaces, setSupabasePlaces] = useState<Place[]>([]);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [isLoadingViewport, setIsLoadingViewport] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cachedPlaceIdsRef = useRef<Set<string>>(new Set());

  // Fetch places within current viewport bounds with debounce
  const isMobile = useIsMobile();

  const fetchViewportPlaces = async (bounds: MapBounds) => {
    try {
      setIsLoadingViewport(true);
      const newPlaces = await fetchPlacesInViewport(
        bounds,
        mapCountry && mapCountry !== 'ALL' ? (mapCountry === 'DK' ? 'Denmark' : mapCountry) : undefined,
        isMobile
      );

      // Merge with existing places, avoiding duplicates
      setSupabasePlaces((prevPlaces) => {
        const existingIds = new Set(prevPlaces.map(p => p.id));
        const newUnique = newPlaces.filter(p => !existingIds.has(p.id));
        return [...prevPlaces, ...newUnique];
      });

      // Track cached place IDs to avoid re-fetching
      newPlaces.forEach(p => cachedPlaceIdsRef.current.add(p.id));
    } catch (error) {
      console.error("Error fetching viewport places:", error);
    } finally {
      setIsLoadingViewport(false);
    }
  };

  // Handle map movement with debounce (500ms)
  const handleMapBoundsChange = (bounds: MapBounds) => {
    setMapBounds(bounds);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchViewportPlaces(bounds);
    }, 500);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fetch Supabase events
  const { data: supabaseEvents } = useQuery<SupabaseEvent[]>({
    queryKey: ["supabase-events-map"],
    queryFn: fetchEvents,
    staleTime: 2 * 60 * 1000, // 2 min — events change often
  });

  // Convert events to pins
  const eventPins = useMemo(() => {
    return (supabaseEvents || [])
      .map(supabaseEventToPin)
      .filter((p): p is MapPin => p !== null);
  }, [supabaseEvents]);

  // Merge pins
  const allPins = useMemo(() => {
    const sbPinsRaw = (supabasePlaces || []).map(placeToPin);
    // Filter out places with invalid coordinates (placeToPin returns null for those)
    const sbPins = sbPinsRaw.filter((p): p is MapPin => p !== null);
    const sbNames = new Set(sbPins.map(p => p.name.toLowerCase()));
    const hardcodedFiltered = HARDCODED_PINS.filter(p => !sbNames.has(p.name.toLowerCase()));
    const placePins = [...sbPins, ...hardcodedFiltered];
    return [...placePins, ...eventPins];
  }, [supabasePlaces, eventPins]);

  const PREMIUM_CATS = useMemo(() => new Set(["kultur", "mad", "mad_hangout", "musik", "events", "karriere", "tech", "rejser", "logi"]), []);
  const GRATIS_CATS = useMemo(() => new Set(["natur", "vandring", "mtb", "loeb", "hund", "fiskeri", "badning", "shelter", "dyrespot", "outdoor", "sport", "aktiv_sport", "aktiv", "fitness", "socialt", "spil", "kreativt", "ture", "communities", "wellness"]), []);

  const filteredPins = useMemo(() => {
    return allPins.filter((p) => {
      // Guard: skip pins with invalid coordinates
      if (!isFinite(p.lat) || !isFinite(p.lng)) return false;
      // Layer toggle: events vs places
      if (showLayer === "events" && !p.isSupabaseEvent) return false;
      if (showLayer === "steder" && p.isSupabaseEvent) return false;
      if (showLayer === "hoteller") {
        // Filter to only show accommodation/hotel places from Supabase
        if (p.isSupabaseEvent) return false;
        const cats = (p.tags || []).join(',').toLowerCase() + ',' + (p.category || '').toLowerCase();
        if (!cats.includes('hotel') && !cats.includes('accommodation') && !cats.includes('logi') && !cats.includes('hostel') && !cats.includes('motel') && !cats.includes('resort')) return false;
      }
      if (priceFilter === "gratis" && PREMIUM_CATS.has(p.category)) return false;
      if (priceFilter === "premium" && GRATIS_CATS.has(p.category)) return false;
      const q = search.toLowerCase();
      if (!q) {
        // Country filter applied when no search query
        // Note: hardcoded pins don't have a country field — treat them as DK
        // Supabase events may have a country field via the event's country
        return true; // all pins are shown (hardcoded pins are all DK-based)
      }
      // Tag-tree-aware search (lazy loaded on demand)
      const tagResults = tagSearchCache[q] || [];
      const expandedTerms = [q, ...tagResults.map(item => item.tag.toLowerCase()), ...tagResults.map(item => item.label.toLowerCase())];
      const desc = p.descriptionKey && typeof p.descriptionKey === 'string' ? (typeof t(p.descriptionKey) === 'string' ? t(p.descriptionKey) as string : (p.description || '')) : (p.description || "");
      return expandedTerms.some(term =>
        p.name.toLowerCase().includes(term) ||
        desc.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    });
  }, [priceFilter, search, allPins, showLayer, t, PREMIUM_CATS, GRATIS_CATS]);

  // Note: country filtering on map pins will be extended once MapPin gains a `country` field.
  // For now, selecting a country chips flies the map to that country's center viewport.


  // Pre-create emoji icons for each category
  const categoryIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    for (const [key, meta] of Object.entries(CATEGORY_META)) {
      icons[key] = createEmojiIcon(meta.emoji, meta.hex, 34);
    }
    return icons;
  }, []);

  // Distinct pulsing icon for Supabase events (orange/coral)
  const supabaseEventIcon = useMemo(() => L.divIcon({
    className: "b-pin",
    html: `<div style="width:36px;height:36px;border-radius:50%;background:#f97316;border:3px solid rgba(255,255,255,0.95);box-shadow:0 0 14px rgba(249,115,22,0.6),0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1;animation:b-event-pulse 2s ease-out infinite;">🎉</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  }), []);

  function handleRecenter() {
    setFlyTo({ center: [USER_LAT, USER_LNG], zoom: 14 });
    setSelectedPin(null);
  }

  function handleCountrySelect(code: string) {
    setMapCountry(code);
    setSelectedPin(null);
    const center = COUNTRY_CENTERS[code];
    if (center) {
      setFlyTo({ center: [center.lat, center.lng], zoom: center.zoom });
    }
  }

  function handlePinClick(pin: MapPin) {
    setSelectedPin(pin);
    setFlyTo({ center: [pin.lat, pin.lng], zoom: 15 });
  }

  return (
    <div className="relative w-full h-svh pb-[72px]" data-testid="kort-page">
      {/* ── Search bar + Gratis / Premium ── */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-4 pb-2" style={{ background: "linear-gradient(to bottom, rgba(10,14,35,0.92) 60%, transparent)", paddingTop: "max(env(safe-area-inset-top, 12px), 48px)" }}>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              ref={searchRef}
              type="search"
              placeholder={t('map.search_places')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedPin(null); }}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50"
              style={{ background: "rgba(20, 26, 55, 0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
              data-testid="input-search-map"
            />
            {search && (
              <button onClick={() => { setSearch(""); searchRef.current?.blur(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => { setPriceFilter(priceFilter === "gratis" ? "alle" : "gratis"); setSelectedPin(null); }}
            className={`px-3.5 py-2.5 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
              priceFilter === "gratis" ? "bg-[#4ECDC4] text-[#0a0f1a] shadow-lg shadow-[#4ECDC4]/30" : "text-white/60 hover:text-white/80"
            }`}
            style={priceFilter !== "gratis" ? { background: "rgba(20, 26, 55, 0.9)", border: "1px solid rgba(255,255,255,0.1)" } : undefined}
            data-testid="filter-gratis"
          >
            {t('map.free')}
          </button>
          <button
            onClick={() => { setPriceFilter(priceFilter === "premium" ? "alle" : "premium"); setSelectedPin(null); }}
            className={`px-3.5 py-2.5 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
              priceFilter === "premium" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "text-white/60 hover:text-white/80"
            }`}
            style={priceFilter !== "premium" ? { background: "rgba(20, 26, 55, 0.9)", border: "1px solid rgba(255,255,255,0.1)" } : undefined}
            data-testid="filter-premium"
          >
            {t('map.premium')}
          </button>
        </div>
        {/* Layer toggle + pin count */}
        <div className="mt-2 px-1 flex items-center gap-3">
          <div className="flex gap-1.5">
            {(["alle", "steder", "events"] as const).map(layer => (
              <button
                key={layer}
                onClick={() => { setShowLayer(layer); setSelectedPin(null); }}
                className={`px-3 py-2 rounded-full text-xs font-semibold transition-all min-h-[44px] ${
                  showLayer === layer
                    ? layer === "events"
                      ? "bg-[#f97316] text-white"
                      : "bg-[#4ECDC4] text-[#0a0f1a]"
                    : "bg-white/8 text-white/40 hover:text-white/60"
                }`}
                data-testid={`filter-layer-${layer}`}
              >
                {layer === "alle" ? `📍 ${typeof t('map.all') === 'string' ? t('map.all') : 'Alle'}` : layer === "steder" ? `🏛️ ${typeof t('map.places') === 'string' ? t('map.places') : 'Steder'}` : `🎉 ${typeof t('map.events') === 'string' ? t('map.events') : 'Events'}`}
              </button>
            ))}
            <button
              onClick={() => { setShowLayer(showLayer === "hoteller" ? "alle" : "hoteller"); setSelectedPin(null); }}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition-all min-h-[44px] ${
                showLayer === "hoteller"
                  ? "bg-[#003580] text-white"
                  : "bg-[#003580]/40 text-white/70 hover:bg-[#003580]/60"
              }`}
            >
              🏨 Hoteller
            </button>
          </div>
          <span className="text-white/30 text-xs">
            {filteredPins.length} {showLayer === "events" ? t('map.events') : showLayer === "steder" ? t('map.places') : t('map.places')}
            {showLayer === "alle" && eventPins.length > 0 && ` (${eventPins.length} ${t('map.events')})`}
          </span>
        </div>

        {/* Country / Region chip bar */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {MAP_COUNTRY_CHIPS.map((code) => {
            const region = MAP_REGIONS[code];
            if (!region) return null;
            const isActive = mapCountry === code;
            return (
              <button
                key={code}
                onClick={() => handleCountrySelect(code)}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 min-h-[44px] ${
                  isActive
                    ? "bg-[#4ECDC4] text-[#0a0f1a] shadow-lg shadow-[#4ECDC4]/20"
                    : "text-white/60 hover:text-white/80"
                }`}
                style={!isActive ? { background: "rgba(20, 26, 55, 0.9)", border: "1px solid rgba(255,255,255,0.1)" } : undefined}
                data-testid={`map-country-${code}`}
              >
                <span>{region.flag}</span>
                {region.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Leaflet Map ── */}
      <MapContainer
        center={[USER_LAT, USER_LNG]}
        zoom={12}
        zoomControl={false}
        attributionControl={false}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "#0D1220" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MapResizeFix />

        {/* Map event listener for viewport-based loading */}
        <MapEventListener onBoundsChange={handleMapBoundsChange} />

        {/* User location pulse */}
        <CircleMarker center={[USER_LAT, USER_LNG]} radius={7} pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 1, weight: 3, opacity: 0.4 }} />
        <CircleMarker center={[USER_LAT, USER_LNG]} radius={18} pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.12, weight: 1, opacity: 0.2 }} />

        {/* Clustered pins — mobile optimized */}
        <MarkerClusterGroup
          chunkedLoading
          chunkInterval={100}
          chunkDelay={50}
          maxClusterRadius={isMobile ? 60 : 80}
          disableClusteringAtZoom={isMobile ? 17 : 18}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
            const size = count > 50 ? 48 : count > 20 ? 42 : 36;
            return L.divIcon({
              html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(16,185,129,0.85);border:2.5px solid rgba(255,255,255,0.8);box-shadow:0 2px 12px rgba(16,185,129,0.4);display:flex;align-items:center;justify-content:center;font-size:${size > 42 ? 14 : 12}px;font-weight:700;color:white;">${count}</div>`,
              className: "b-pin",
              iconSize: L.point(size, size),
            });
          }}
        >
          {filteredPins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={pin.isSupabaseEvent ? supabaseEventIcon : (categoryIcons[pin.category] || createEmojiIcon("📍", "#4ECDC4", 34))}
              eventHandlers={{ click: () => handlePinClick(pin) }}
            />
          ))}
        </MarkerClusterGroup>

        <ZoomControls />
        {flyTo && <MapRecenter center={flyTo.center} zoom={flyTo.zoom} />}
      </MapContainer>

      {/* ── Recenter button ── */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-28 left-3 z-[1000] w-10 h-10 rounded-xl bg-[#0f142d]/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#4ECDC4] hover:bg-white/15 transition-colors shadow-lg"
        data-testid="button-near-me"
      >
        <Navigation size={18} />
      </button>

      {/* ── Loading Indicator for Viewport Loading ── */}
      {isLoadingViewport && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[999] px-4 py-2 rounded-full bg-[#0f142d]/90 backdrop-blur-md border border-white/10 flex items-center gap-2" data-testid="loading-viewport">
          <div className="w-3 h-3 rounded-full bg-[#4ECDC4] animate-pulse" />
          <span className="text-white/70 text-xs font-medium">Loading places...</span>
        </div>
      )}

      {/* ── Pin Detail ── */}
      {selectedPin && <PinDetail pin={selectedPin} onClose={() => setSelectedPin(null)} />}

      <style>{`
        @keyframes b-event-pulse {
          0% { box-shadow: 0 0 14px rgba(249,115,22,0.6), 0 2px 8px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 22px rgba(249,115,22,0.9), 0 2px 8px rgba(0,0,0,0.4); }
          100% { box-shadow: 0 0 14px rgba(249,115,22,0.6), 0 2px 8px rgba(0,0,0,0.4); }
        }
      `}</style>
    </div>
  );
   }
