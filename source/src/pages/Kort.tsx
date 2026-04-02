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
import { pageBase } from "@/lib/pageCSSBase";

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
    <div className="kt-zoom-group">
      <button onClick={() => map.zoomIn()} className="kt-zoom-btn" data-testid="button-zoom-in">
        <Plus size={18} />
      </button>
      <button onClick={() => map.zoomOut()} className="kt-zoom-btn" data-testid="button-zoom-out">
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
    <div className="kt-hotels">
      <button onClick={loadHotels} className="kt-hotels-btn">
        {loading ? "Soger hoteller..." : expanded ? "Skjul hoteller" : "Vis hoteller naerby"}
      </button>
      {expanded && hotels.length > 0 && (
        <div className="kt-hotels-list">
          {hotels.map((h, i) => (
            <a
              key={i}
              href={`https://www.booking.com/searchresults.da.html?ss=${encodeURIComponent(h.name)}&latitude=${h.lat}&longitude=${h.lon}&radius=1&aid=304142`}
              target="_blank"
              rel="noopener noreferrer"
              className="kt-hotel-row"
            >
              <span className="kt-hotel-name">{h.name}</span>
              <span className="kt-hotel-dist">
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
    <div className="kt-detail" data-testid="pin-detail">
      <div className="kt-detail-card">
        {/* Header image */}
        <div className="kt-detail-hero">
          <img src={headerImg} alt={pin.name} className="kt-detail-hero-img" loading="eager" />
          <div className="kt-detail-hero-grad" />
          {/* Category badge */}
          <span className="kt-detail-badge" style={{ background: pin.isSupabaseEvent ? "#f97316" : meta.hex }}>
            {pin.isSupabaseEvent ? `🎉 ${typeof t('map.event_label') === 'string' ? t('map.event_label') : 'Event'}` : `${meta.emoji} ${typeof t(meta.labelKey) === 'string' ? t(meta.labelKey) : meta.labelKey.split('.').pop() || ''}`}
          </span>
          {pin.fromSupabase && (
            <span className="kt-detail-db-badge">DB</span>
          )}
          <button onClick={onClose} className="kt-detail-close" data-testid="button-close-detail">
            <X size={14} />
          </button>
        </div>

        <div className="kt-detail-body">
          <h3 className="kt-detail-title">{pin.name}</h3>

          {/* Rating + distance */}
          <div className="kt-detail-meta">
            <div className="kt-detail-rating">
              <Star size={11} className="kt-star-icon" />
              <span className="kt-detail-rating-val">{pin.rating.toFixed(1)}</span>
              {pin.ratingCount ? <span className="kt-detail-rating-count">({pin.ratingCount})</span> : null}
            </div>
            <span className="kt-detail-sep" />
            <span className="kt-detail-dist"><MapPinIcon size={10} />{distText}</span>
            {pin.city && (<><span className="kt-detail-sep" /><span className="kt-detail-city">{pin.city}</span></>)}
            {pin.difficultyKey && (
              <>
                <span className="kt-detail-sep" />
                <span className={`kt-difficulty ${
                  pin.difficultyKey === "map.difficulty.easy" ? "kt-diff-easy" :
                  pin.difficultyKey === "map.difficulty.medium" ? "kt-diff-med" :
                  "kt-diff-hard"
                }`}>{typeof pin.difficultyKey === 'string' && typeof t(pin.difficultyKey) === 'string' ? t(pin.difficultyKey) : pin.difficultyKey?.split('.').pop() || ''}</span>
              </>
            )}
          </div>

          {/* Tags */}
          {pin.tags && pin.tags.length > 0 && (
            <div className="kt-detail-tags">
              {pin.tags.slice(0, 5).map(tag => (
                <span key={tag} className="kt-detail-tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Event date + price */}
          {pin.isSupabaseEvent && pin.date && (
            <div className="kt-detail-event-info">
              <span className="kt-detail-event-date">
                {new Date(pin.date).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              {pin.price != null && (
                <>
                  <span className="kt-detail-sep" />
                  <span className="kt-detail-event-price">{pin.price === 0 ? t('map.free') : `${pin.price} kr`}</span>
                </>
              )}
            </div>
          )}

          <p className="kt-detail-desc">{pin.descriptionKey ? (typeof pin.descriptionKey === 'string' && typeof t(pin.descriptionKey) === 'string' ? t(pin.descriptionKey) : (pin.description || '')) : (pin.description || '')}</p>

          {/* Event spots */}
          {pin.isEvent && pin.spots && (
            <div className="kt-detail-spots">
              <div className="kt-detail-spots-row">
                <span className="kt-detail-spots-info"><Users size={10} />{pin.spots.current}/{pin.spots.total} {t('map.signed_up')}</span>
                <span className={`kt-detail-spots-left ${(pin.spots.total - pin.spots.current) <= 1 ? "kt-spots-low" : ""}`}>
                  {pin.spots.total - pin.spots.current} {t('map.spots')}
                </span>
              </div>
              <div className="kt-progress-track">
                <div className={`kt-progress-fill ${(pin.spots.total - pin.spots.current) <= 1 ? "kt-progress-warn" : ""}`} style={{ width: `${(pin.spots.current / pin.spots.total) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="kt-detail-actions">
            {pin.isSupabaseEvent && pin.eventId ? (
              <>
                <Link href={`/event/${pin.eventId}`} className="kt-action-primary kt-action-event">
                  {t('map.join')}
                </Link>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="kt-action-secondary">
                  <Navigation size={13} />
                </a>
              </>
            ) : pin.fromSupabase ? (
              <>
                <Link href={`/sted/${pin.id.startsWith('sb-') ? pin.id.slice(3) : pin.id}`} className="kt-action-primary">
                  {t('map.see_more')}
                </Link>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="kt-action-secondary">
                  <ExternalLink size={13} />
                </a>
              </>
            ) : (
              <>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="kt-action-primary">
                  <Navigation size={13} /> {t('map.show_route')}
                </a>
                {pin.isEvent && (
                  <button className="kt-action-primary kt-action-event">
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

/* ── Scoped CSS ── */
const kortCSS = `${pageBase("kt")}

/* ── Kort wrapper (NOT the map itself) ── */
.kt-wrapper {
  position: relative;
  width: 100%;
  height: 100svh;
  padding-bottom: 0;
  font-family: var(--sans);
  overflow: hidden;
  background: var(--bg, #060a0f);
}

/* ══════════ SEARCH BAR OVERLAY ══════════ */
.kt-search-overlay {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 0 16px 8px;
  padding-top: max(env(safe-area-inset-top, 12px), 48px);
  background: linear-gradient(to bottom, rgba(6,10,15,0.94) 60%, rgba(6,10,15,0.6) 85%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.kt-search-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.kt-search-wrap {
  position: relative;
  flex: 1;
}
.kt-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.35);
  pointer-events: none;
}
.kt-search-input {
  width: 100%;
  padding: 11px 36px 11px 42px;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  color: var(--pg-white);
  font-size: 14px;
  font-family: var(--sans);
  outline: none;
  transition: border-color 0.25s, background 0.25s;
}
.kt-search-input:focus {
  border-color: rgba(78,205,196,0.4);
  background: rgba(255,255,255,0.09);
}
.kt-search-input::placeholder { color: rgba(255,255,255,0.3); }

.kt-search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none; border: none; padding: 4px;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  transition: color 0.2s;
}
.kt-search-clear:hover { color: var(--pg-white); }

/* ── Price filter pills ── */
.kt-price-btn {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--sans);
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255,255,255,0.55);
}
.kt-price-btn:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.08); }
.kt-price-btn.active-gratis {
  background: var(--teal);
  color: var(--bg);
  border-color: var(--teal);
  box-shadow: 0 4px 20px var(--teal-glow);
}
.kt-price-btn.active-premium {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
  box-shadow: 0 4px 20px rgba(245,158,11,0.3);
}

/* ══════════ LAYER TOGGLES ══════════ */
.kt-layer-row {
  margin-top: 10px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.kt-layer-group { display: flex; gap: 6px; }

.kt-layer-btn {
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--sans);
  transition: all 0.25s;
  min-height: 40px;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
}
.kt-layer-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
.kt-layer-btn.active {
  background: var(--teal);
  color: var(--bg);
  border-color: var(--teal);
  box-shadow: 0 2px 14px var(--teal-glow);
}
.kt-layer-btn.active-event {
  background: #f97316;
  color: #fff;
  border-color: #f97316;
  box-shadow: 0 2px 14px rgba(249,115,22,0.35);
}
.kt-layer-btn.active-hotel {
  background: #003580;
  color: #fff;
  border-color: #003580;
  box-shadow: 0 2px 14px rgba(0,53,128,0.35);
}
.kt-layer-btn.hotel-inactive {
  background: rgba(0,53,128,0.35);
  color: rgba(255,255,255,0.65);
  border-color: rgba(0,53,128,0.3);
}
.kt-layer-btn.hotel-inactive:hover { background: rgba(0,53,128,0.55); }

.kt-pin-count {
  color: rgba(255,255,255,0.3);
  font-size: 12px;
  font-family: var(--sans);
  white-space: nowrap;
}

/* ══════════ COUNTRY CHIPS ══════════ */
.kt-country-row {
  margin-top: 10px;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.kt-country-row::-webkit-scrollbar { display: none; }

.kt-country-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--sans);
  white-space: nowrap;
  flex-shrink: 0;
  min-height: 40px;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.55);
}
.kt-country-chip:hover {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.75);
}
.kt-country-chip.active {
  background: var(--teal);
  color: var(--bg);
  border-color: var(--teal);
  box-shadow: 0 3px 16px var(--teal-glow);
  font-weight: 700;
}

/* ══════════ ZOOM / FAB BUTTONS ══════════ */
.kt-zoom-group {
  position: absolute;
  bottom: 112px;
  right: 12px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.kt-zoom-btn {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(6,10,15,0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.75);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.kt-zoom-btn:hover {
  background: rgba(255,255,255,0.12);
  color: var(--pg-white);
}

.kt-recenter-btn {
  position: absolute;
  bottom: 112px;
  left: 12px;
  z-index: 1000;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(6,10,15,0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--teal);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.kt-recenter-btn:hover {
  background: rgba(78,205,196,0.12);
  border-color: rgba(78,205,196,0.25);
}

/* ══════════ LOADING INDICATOR ══════════ */
.kt-loading {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 100px;
  background: rgba(6,10,15,0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
}
.kt-loading-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--teal);
  animation: kt-pulse 1.5s ease-in-out infinite;
}
.kt-loading-text {
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  font-weight: 500;
  font-family: var(--sans);
}

@keyframes kt-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* ══════════ PIN DETAIL BOTTOM SHEET ══════════ */
.kt-detail {
  position: absolute;
  bottom: 80px;
  left: 12px;
  right: 12px;
  z-index: 1100;
  animation: kt-slide-up 0.35s cubic-bezier(0.23,1,0.32,1) both;
}

@keyframes kt-slide-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.kt-detail-card {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(10,15,30,0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(78,205,196,0.06);
}

.kt-detail-hero {
  height: 120px;
  position: relative;
  overflow: hidden;
}
.kt-detail-hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.kt-detail-hero-grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10,15,30,1) 0%, rgba(10,15,30,0.35) 50%, transparent 100%);
}

.kt-detail-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--sans);
  color: #fff;
  backdrop-filter: blur(8px);
}
.kt-detail-db-badge {
  position: absolute;
  top: 10px;
  right: 38px;
  padding: 3px 8px;
  border-radius: 100px;
  background: rgba(78,205,196,0.85);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--sans);
}
.kt-detail-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  transition: background 0.2s;
}
.kt-detail-close:hover { background: rgba(0,0,0,0.6); }

.kt-detail-body { padding: 14px; }

.kt-detail-title {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 400;
  color: var(--pg-white);
  line-height: 1.2;
  margin: 0 0 6px;
}

.kt-detail-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 11px;
  flex-wrap: wrap;
}
.kt-detail-rating { display: flex; align-items: center; gap: 3px; }
.kt-star-icon { color: #fbbf24; fill: #fbbf24; }
.kt-detail-rating-val { color: rgba(255,255,255,0.6); }
.kt-detail-rating-count { color: rgba(255,255,255,0.25); }
.kt-detail-sep {
  width: 3px; height: 3px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  flex-shrink: 0;
}
.kt-detail-dist {
  color: rgba(255,255,255,0.45);
  display: flex;
  align-items: center;
  gap: 3px;
}
.kt-detail-city { color: rgba(255,255,255,0.45); }

.kt-difficulty {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--sans);
}
.kt-diff-easy { background: rgba(34,197,94,0.15); color: #4ade80; }
.kt-diff-med  { background: rgba(245,158,11,0.15); color: #fbbf24; }
.kt-diff-hard { background: rgba(239,68,68,0.15); color: #f87171; }

.kt-detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}
.kt-detail-tag {
  padding: 3px 8px;
  border-radius: 100px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.4);
  font-size: 11px;
  font-family: var(--sans);
}

.kt-detail-event-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 11px;
}
.kt-detail-event-date {
  color: #f97316;
  font-weight: 500;
  font-family: var(--sans);
}
.kt-detail-event-price { color: rgba(255,255,255,0.55); }

.kt-detail-desc {
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  line-height: 1.55;
  margin: 0 0 12px;
  font-family: var(--sans);
}

.kt-detail-spots { margin-bottom: 12px; }
.kt-detail-spots-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.kt-detail-spots-info {
  color: rgba(255,255,255,0.4);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.kt-detail-spots-left {
  font-size: 12px;
  font-weight: 600;
  color: var(--teal);
}
.kt-detail-spots-left.kt-spots-low { color: #fb923c; }

.kt-progress-track {
  height: 5px;
  border-radius: 100px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}
.kt-progress-fill {
  height: 100%;
  border-radius: 100px;
  background: var(--teal);
  transition: width 0.4s ease;
}
.kt-progress-fill.kt-progress-warn { background: #fb923c; }

/* ── Detail action buttons ── */
.kt-detail-actions {
  display: flex;
  gap: 8px;
}
.kt-action-primary {
  flex: 1;
  padding: 10px 0;
  border-radius: 14px;
  background: var(--teal);
  color: var(--bg);
  font-size: 12px;
  font-weight: 600;
  font-family: var(--sans);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: all 0.2s;
}
.kt-action-primary:hover {
  box-shadow: 0 4px 16px var(--teal-glow);
  transform: translateY(-1px);
}
.kt-action-primary.kt-action-event {
  background: #f97316;
  color: #fff;
}
.kt-action-primary.kt-action-event:hover {
  box-shadow: 0 4px 16px rgba(249,115,22,0.4);
}
.kt-action-secondary {
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--pg-white);
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}
.kt-action-secondary:hover {
  background: rgba(255,255,255,0.12);
}

/* ── Nearby hotels ── */
.kt-hotels { margin-top: 10px; }
.kt-hotels-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 9px 0;
  border-radius: 14px;
  background: rgba(0,53,128,0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0,53,128,0.4);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--sans);
  cursor: pointer;
  transition: all 0.2s;
}
.kt-hotels-btn:hover { background: rgba(0,53,128,0.9); }

.kt-hotels-list {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kt-hotel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  text-decoration: none;
  transition: background 0.2s;
}
.kt-hotel-row:hover { background: rgba(255,255,255,0.08); }
.kt-hotel-name {
  color: var(--pg-white);
  font-size: 11px;
  font-weight: 500;
  font-family: var(--sans);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.kt-hotel-dist {
  color: rgba(255,255,255,0.25);
  font-size: 10px;
  font-family: var(--sans);
  margin-left: 8px;
  flex-shrink: 0;
}

/* ── Event pulse (pin marker animation) ── */
@keyframes b-event-pulse {
  0% { box-shadow: 0 0 14px rgba(249,115,22,0.6), 0 2px 8px rgba(0,0,0,0.4); }
  50% { box-shadow: 0 0 22px rgba(249,115,22,0.9), 0 2px 8px rgba(0,0,0,0.4); }
  100% { box-shadow: 0 0 14px rgba(249,115,22,0.6), 0 2px 8px rgba(0,0,0,0.4); }
}

/* ══════════ SPLIT-VIEW LAYOUT ══════════ */
.kt-split {
  display: flex;
  height: calc(100vh - 60px);
  width: 100%;
  position: relative;
}
.kt-map-pane {
  flex: 0 0 60%;
  position: relative;
  height: 100%;
  min-width: 0;
}
.kt-list-pane {
  flex: 0 0 40%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg, rgba(255,255,255,0.04));
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid var(--glass-border, rgba(255,255,255,0.08));
  overflow: hidden;
}

/* ── List pane header ── */
.kt-lp-header {
  padding: 20px 20px 0;
  flex-shrink: 0;
}
.kt-lp-search-wrap {
  position: relative;
  margin-bottom: 14px;
}
.kt-lp-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.3);
  pointer-events: none;
}
.kt-lp-search {
  width: 100%;
  padding: 12px 40px 12px 42px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  color: var(--pg-white);
  font-size: 14px;
  font-family: var(--sans);
  outline: none;
  transition: border-color 0.25s;
}
.kt-lp-search:focus {
  border-color: rgba(78,205,196,0.4);
}
.kt-lp-search::placeholder { color: rgba(255,255,255,0.3); }
.kt-lp-search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none; border: none; padding: 4px;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
}
.kt-lp-search-clear:hover { color: var(--pg-white); }

/* ── Filter toggle buttons ── */
.kt-lp-filters {
  display: flex;
  gap: 8px;
  padding-bottom: 14px;
  overflow-x: auto;
  scrollbar-width: none;
}
.kt-lp-filters::-webkit-scrollbar { display: none; }

.kt-lp-filter-btn {
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--sans);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.5);
  flex-shrink: 0;
}
.kt-lp-filter-btn:hover {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.75);
}
.kt-lp-filter-btn.active {
  background: var(--teal);
  color: var(--bg);
  border-color: var(--teal);
  box-shadow: 0 2px 12px var(--teal-glow);
}
.kt-lp-filter-btn.active-event {
  background: #f97316;
  color: #fff;
  border-color: #f97316;
  box-shadow: 0 2px 12px rgba(249,115,22,0.3);
}

.kt-lp-count {
  padding: 0 20px 10px;
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  font-family: var(--sans);
  flex-shrink: 0;
}

/* ── Scrollable venue list ── */
.kt-lp-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
}
.kt-lp-list::-webkit-scrollbar { width: 6px; }
.kt-lp-list::-webkit-scrollbar-track { background: transparent; }
.kt-lp-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

.kt-lp-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid transparent;
  margin-bottom: 4px;
}
.kt-lp-item:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.06);
}
.kt-lp-item.active {
  background: rgba(78,205,196,0.08);
  border-color: rgba(78,205,196,0.18);
}

/* Thumbnail */
.kt-lp-thumb {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255,255,255,0.06);
}
.kt-lp-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.kt-lp-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(255,255,255,0.04);
}

/* Item info */
.kt-lp-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.kt-lp-name {
  font-family: var(--serif);
  font-size: 15px;
  color: var(--pg-white);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kt-lp-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}
.kt-lp-dist {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(78,205,196,0.12);
  color: var(--teal);
  font-weight: 600;
  font-family: var(--sans);
  font-size: 10px;
}
.kt-lp-cat {
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 600;
  font-family: var(--sans);
  color: #fff;
}
.kt-lp-city {
  color: rgba(255,255,255,0.3);
  font-size: 11px;
  font-family: var(--sans);
}
.kt-lp-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  color: rgba(255,255,255,0.45);
  font-size: 11px;
}
.kt-lp-rating svg { color: #fbbf24; fill: #fbbf24; }
.kt-lp-event-date {
  color: #f97316;
  font-weight: 500;
  font-size: 11px;
  font-family: var(--sans);
}

/* ── Empty state ── */
.kt-lp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255,255,255,0.25);
  font-size: 14px;
  font-family: var(--sans);
  text-align: center;
  gap: 8px;
}
.kt-lp-empty-icon { font-size: 32px; opacity: 0.4; }

/* ── Mobile toggle for split view ── */
.kt-mobile-toggle {
  display: none;
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1200;
  padding: 10px 24px;
  border-radius: 100px;
  background: rgba(6,10,15,0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(78,205,196,0.3);
  color: var(--teal);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--sans);
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  transition: all 0.25s;
}
.kt-mobile-toggle:hover {
  background: rgba(78,205,196,0.12);
  border-color: var(--teal);
}

/* ── Mobile: stack vertically ── */
@media (max-width: 768px) {
  .kt-split {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 60px);
  }
  .kt-map-pane {
    flex: none;
    height: 55vh;
    width: 100%;
  }
  .kt-map-pane.kt-hidden { display: none; }
  .kt-list-pane {
    flex: 1;
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--glass-border, rgba(255,255,255,0.08));
    max-height: 45vh;
  }
  .kt-list-pane.kt-hidden { display: none; }
  .kt-mobile-toggle { display: block; }

  /* Adjust search overlay for split view mobile */
  .kt-search-overlay {
    padding-top: max(env(safe-area-inset-top, 8px), 12px);
  }
}

/* ── Desktop: hide mobile toggle ── */
@media (min-width: 769px) {
  .kt-mobile-toggle { display: none; }

  /* Move search overlay into map pane context */
  .kt-map-pane .kt-search-overlay {
    padding-top: max(env(safe-area-inset-top, 12px), 12px);
  }

  /* Adjust detail sheet to be within map pane */
  .kt-map-pane .kt-detail {
    left: 12px;
    right: 12px;
    bottom: 20px;
    max-width: 400px;
  }

  /* Adjust zoom/recenter buttons for map pane */
  .kt-map-pane .kt-zoom-group {
    bottom: 24px;
    right: 12px;
  }
  .kt-map-pane .kt-recenter-btn {
    bottom: 24px;
    left: 12px;
  }
}
`;

/* ── List panel filter categories ── */
const LIST_FILTERS = [
  { key: "alle", label: "Alle", emoji: "📍" },
  { key: "steder", label: "Steder", emoji: "🏛️" },
  { key: "events", label: "Events", emoji: "🎉" },
  { key: "mad", label: "Mad", emoji: "🍽️" },
  { key: "kultur", label: "Kultur", emoji: "🎭" },
  { key: "natur", label: "Natur", emoji: "🌿" },
  { key: "aktiv", label: "Aktiv", emoji: "⚽" },
] as const;

/* ── List panel item component ── */
function ListPanelItem({
  pin, isActive, userLat, userLng, onClick
}: {
  pin: MapPin; isActive: boolean; userLat: number; userLng: number; onClick: () => void;
}) {
  const meta = CATEGORY_META[pin.category] || CATEGORY_META["natur"];
  const dist = distanceKm(userLat, userLng, pin.lat, pin.lng);
  const distText = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
  const headerImg = pin.image || PIN_HEADER_IMAGES[pin.category] || null;

  return (
    <div className={`kt-lp-item ${isActive ? "active" : ""}`} onClick={onClick}>
      <div className="kt-lp-thumb">
        {headerImg ? (
          <img src={headerImg} alt={pin.name} loading="lazy" />
        ) : (
          <div className="kt-lp-thumb-placeholder">{meta.emoji}</div>
        )}
      </div>
      <div className="kt-lp-info">
        <div className="kt-lp-name">{pin.name}</div>
        <div className="kt-lp-meta">
          <span className="kt-lp-dist">
            <MapPinIcon size={9} />{distText}
          </span>
          <span className="kt-lp-cat" style={{ background: pin.isSupabaseEvent ? "#f97316" : meta.hex }}>
            {pin.isSupabaseEvent ? "Event" : (meta.labelKey.split('.').pop() || pin.category)}
          </span>
          {pin.city && <span className="kt-lp-city">{pin.city}</span>}
        </div>
        <div className="kt-lp-meta">
          {pin.rating > 0 && (
            <span className="kt-lp-rating">
              <Star size={10} />{pin.rating.toFixed(1)}
            </span>
          )}
          {pin.isSupabaseEvent && pin.date && (
            <span className="kt-lp-event-date">
              {new Date(pin.date).toLocaleDateString("da-DK", { day: "numeric", month: "short" })}
            </span>
          )}
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
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [listFilter, setListFilter] = useState<string>("alle");
  const searchRef = useRef<HTMLInputElement>(null);
  const listSearchRef = useRef<HTMLInputElement>(null);


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

  // List panel: further filter by list panel category and sort by distance
  const listPanelPins = useMemo(() => {
    let pins = filteredPins;
    if (listFilter === "events") {
      pins = pins.filter(p => p.isSupabaseEvent);
    } else if (listFilter === "steder") {
      pins = pins.filter(p => !p.isSupabaseEvent);
    } else if (listFilter !== "alle") {
      // Category-specific filter (mad, kultur, natur, aktiv)
      const catKey = listFilter.toLowerCase();
      pins = pins.filter(p => {
        const pCat = p.category.toLowerCase();
        // Include sub-categories
        if (catKey === "mad") return pCat === "mad" || pCat === "mad_hangout";
        if (catKey === "kultur") return pCat === "kultur" || pCat === "kreativt" || pCat === "musik";
        if (catKey === "natur") return pCat === "natur" || pCat === "vandring" || pCat === "outdoor" || pCat === "dyrespot" || pCat === "shelter" || pCat === "fiskeri" || pCat === "badning";
        if (catKey === "aktiv") return pCat === "aktiv" || pCat === "aktiv_sport" || pCat === "sport" || pCat === "mtb" || pCat === "loeb" || pCat === "fitness";
        return pCat.includes(catKey);
      });
    }
    // Sort by distance from user
    return [...pins].sort((a, b) => {
      const distA = distanceKm(USER_LAT, USER_LNG, a.lat, a.lng);
      const distB = distanceKm(USER_LAT, USER_LNG, b.lat, b.lng);
      return distA - distB;
    }).slice(0, 100); // Cap at 100 for performance
  }, [filteredPins, listFilter, USER_LAT, USER_LNG]);


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
    <>
      <style>{kortCSS}</style>
      <div className="kt-wrapper" data-testid="kort-page">
        <div className="kt-split">

          {/* ════════ LEFT: MAP PANE (60%) ════════ */}
          <div className={`kt-map-pane ${isMobile && mobileView === "list" ? "kt-hidden" : ""}`}>
            {/* ── Search bar + Gratis / Premium ── */}
            <div className="kt-search-overlay">
              <div className="kt-search-row">
                <div className="kt-search-wrap">
                  <Search size={15} className="kt-search-icon" />
                  <input
                    ref={searchRef}
                    type="search"
                    placeholder={t('map.search_places')}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setSelectedPin(null); }}
                    className="kt-search-input"
                    data-testid="input-search-map"
                  />
                  {search && (
                    <button onClick={() => { setSearch(""); searchRef.current?.blur(); }} className="kt-search-clear">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { setPriceFilter(priceFilter === "gratis" ? "alle" : "gratis"); setSelectedPin(null); }}
                  className={`kt-price-btn ${priceFilter === "gratis" ? "active-gratis" : ""}`}
                  data-testid="filter-gratis"
                >
                  {t('map.free')}
                </button>
                <button
                  onClick={() => { setPriceFilter(priceFilter === "premium" ? "alle" : "premium"); setSelectedPin(null); }}
                  className={`kt-price-btn ${priceFilter === "premium" ? "active-premium" : ""}`}
                  data-testid="filter-premium"
                >
                  {t('map.premium')}
                </button>
              </div>

              {/* Layer toggle + pin count */}
              <div className="kt-layer-row">
                <div className="kt-layer-group">
                  {(["alle", "steder", "events"] as const).map(layer => (
                    <button
                      key={layer}
                      onClick={() => { setShowLayer(layer); setSelectedPin(null); }}
                      className={`kt-layer-btn ${
                        showLayer === layer
                          ? layer === "events" ? "active-event" : "active"
                          : ""
                      }`}
                      data-testid={`filter-layer-${layer}`}
                    >
                      {layer === "alle" ? `📍 ${typeof t('map.all') === 'string' ? t('map.all') : 'Alle'}` : layer === "steder" ? `🏛️ ${typeof t('map.places') === 'string' ? t('map.places') : 'Steder'}` : `🎉 ${typeof t('map.events') === 'string' ? t('map.events') : 'Events'}`}
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowLayer(showLayer === "hoteller" ? "alle" : "hoteller"); setSelectedPin(null); }}
                    className={`kt-layer-btn ${
                      showLayer === "hoteller" ? "active-hotel" : "hotel-inactive"
                    }`}
                  >
                    🏨 Hoteller
                  </button>
                </div>
                <span className="kt-pin-count">
                  {filteredPins.length} {showLayer === "events" ? t('map.events') : showLayer === "steder" ? t('map.places') : t('map.places')}
                  {showLayer === "alle" && eventPins.length > 0 && ` (${eventPins.length} ${t('map.events')})`}
                </span>
              </div>

              {/* Country / Region chip bar */}
              <div className="kt-country-row">
                {MAP_COUNTRY_CHIPS.map((code) => {
                  const region = MAP_REGIONS[code];
                  if (!region) return null;
                  const isActive = mapCountry === code;
                  return (
                    <button
                      key={code}
                      onClick={() => handleCountrySelect(code)}
                      className={`kt-country-chip ${isActive ? "active" : ""}`}
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
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "#060a0f" }}
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
              className="kt-recenter-btn"
              data-testid="button-near-me"
            >
              <Navigation size={18} />
            </button>

            {/* ── Loading Indicator for Viewport Loading ── */}
            {isLoadingViewport && (
              <div className="kt-loading" data-testid="loading-viewport">
                <div className="kt-loading-dot" />
                <span className="kt-loading-text">Loading places...</span>
              </div>
            )}

            {/* ── Pin Detail ── */}
            {selectedPin && <PinDetail pin={selectedPin} onClose={() => setSelectedPin(null)} />}
          </div>

          {/* ════════ RIGHT: LIST PANE (40%) ════════ */}
          <div className={`kt-list-pane ${isMobile && mobileView === "map" ? "kt-hidden" : ""}`}>
            {/* List header with search + filters */}
            <div className="kt-lp-header">
              <div className="kt-lp-search-wrap">
                <Search size={15} className="kt-lp-search-icon" />
                <input
                  ref={listSearchRef}
                  type="search"
                  placeholder="Sog steder og events..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedPin(null); }}
                  className="kt-lp-search"
                />
                {search && (
                  <button onClick={() => { setSearch(""); listSearchRef.current?.blur(); }} className="kt-lp-search-clear">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter toggle buttons */}
              <div className="kt-lp-filters">
                {LIST_FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setListFilter(f.key)}
                    className={`kt-lp-filter-btn ${
                      listFilter === f.key
                        ? f.key === "events" ? "active-event" : "active"
                        : ""
                    }`}
                  >
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Result count */}
            <div className="kt-lp-count">
              {listPanelPins.length} resultater {listFilter !== "alle" ? `i ${LIST_FILTERS.find(f => f.key === listFilter)?.label || listFilter}` : ""}
            </div>

            {/* Scrollable venue/event list */}
            <div className="kt-lp-list">
              {listPanelPins.length === 0 ? (
                <div className="kt-lp-empty">
                  <div className="kt-lp-empty-icon">🔍</div>
                  <div>Ingen resultater fundet</div>
                </div>
              ) : (
                listPanelPins.map(pin => (
                  <ListPanelItem
                    key={pin.id}
                    pin={pin}
                    isActive={selectedPin?.id === pin.id}
                    userLat={USER_LAT}
                    userLng={USER_LNG}
                    onClick={() => handlePinClick(pin)}
                  />
                ))
              )}
            </div>
          </div>

        </div>{/* end kt-split */}

        {/* ── Mobile toggle button ── */}
        <button
          className="kt-mobile-toggle"
          onClick={() => setMobileView(mobileView === "map" ? "list" : "map")}
        >
          {mobileView === "map" ? "📋 Vis liste" : "🗺️ Vis kort"}
        </button>
      </div>
    </>
  );
}
