import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, MapPin, Star, Share2, Bookmark, ExternalLink, Navigation, Clock, Accessibility, Info, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { supabase, type Place } from "@/lib/supabase";

/* ── Category → hero image ── */
const HERO_IMAGES: Record<string, string> = {
  shelter:     "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop",
  teltplads:   "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop",
  bålhytte:    "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=800&auto=format&fit=crop",
  bålplads:    "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=800&auto=format&fit=crop",
  strand:      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
  badning:     "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
  hundeskov:   "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop",
  hund:        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop",
  vandring:    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop",
  vandrerute:  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop",
  cykelrute:   "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop",
  cykling:     "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop",
  mtb:         "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&auto=format&fit=crop",
  mountainbike:"https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&auto=format&fit=crop",
  fiskeri:     "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&auto=format&fit=crop",
  lystfiskeri: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&auto=format&fit=crop",
  fiskesø:     "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&auto=format&fit=crop",
  fugletårn:   "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&auto=format&fit=crop",
  fuglekiggeri:"https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&auto=format&fit=crop",
  fitness:     "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop",
  dykning:     "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop",
  snorkel:     "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop",
  kitesurf:    "https://images.unsplash.com/photo-1559288031-6ff34e1540ff?w=800&auto=format&fit=crop",
  windsurf:    "https://images.unsplash.com/photo-1559288031-6ff34e1540ff?w=800&auto=format&fit=crop",
  kælkebakke:  "https://images.unsplash.com/photo-1516820612845-a13894592046?w=800&auto=format&fit=crop",
  vinterbadning:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&auto=format&fit=crop",
  discgolf:    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop",
  kajak:       "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&auto=format&fit=crop",
  kano:        "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&auto=format&fit=crop",
  løb:         "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop",
  ridning:     "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop",
  camping:     "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop",
  kultur:      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&auto=format&fit=crop",
  natur:       "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop",
  logi:        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop",
  aktiv:       "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop",
  wellness:    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop",
};

const DEFAULT_HERO = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop";

function getHeroImage(place: Place): string {
  // Check tags and metadata for best match
  const allTerms = [
    ...(place.tags || []),
    ...(place.main_categories || []),
    (place.metadata as any)?.facility_type || "",
  ].map(item => item.toLowerCase());

  for (const term of allTerms) {
    for (const [key, url] of Object.entries(HERO_IMAGES)) {
      if (term.includes(key) || key.includes(term)) return url;
    }
  }
  return DEFAULT_HERO;
}

export default function StedDetail() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/sted/:id");
  const rawId = params?.id || "";
  // Support both "sb-uuid" format (from Kort pins) and plain uuid
  const placeId = rawId.startsWith("sb-") ? rawId.slice(3) : rawId;

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!placeId) { setLoading(false); setError(true); return; }
    setLoading(true);
    supabase.from("places").select("*").eq("id", placeId).single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError(true); }
        else { setPlace(data as Place); }
        setLoading(false);
      });
  }, [placeId]);

  if (loading) {
    return (
      <div className="relative min-h-svh pb-24 flex items-center justify-center" style={{ background: "#060a0f" }}>
        <div className="w-8 h-8 border-2 border-[#4ECDC4]/30 border-t-[#4ECDC4] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="relative min-h-svh pb-24 flex items-center justify-center" style={{ background: "#060a0f" }}>
        <div className="text-center">
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-white/60 text-sm mb-4">{t('place.not_found')}</p>
          <button onClick={() => setLocation("/kort")} className="text-[#4ECDC4] text-sm font-medium">{t('place.back_to_map')}</button>
        </div>
      </div>
    );
  }

  const meta = place.metadata as any || {};
  const heroImg = getHeroImage(place);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  const mainCat = (place.main_categories || [])[0] || "";

  return (
    <div className="relative min-h-svh pb-24" style={{ background: "#060a0f" }} data-testid="sted-detail-page">
      {/* Hero image */}
      <div className="relative w-full h-56 overflow-hidden">
        <img src={heroImg} alt={place.name} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a0f] via-black/30 to-transparent" />
        <button onClick={() => window.history.back()} className="absolute top-12 left-5 w-9 h-9 rounded-full glass-card flex items-center justify-center z-10">
          <ArrowLeft size={18} className="text-white/70" />
        </button>
        {/* Category badge */}
        {mainCat && (
          <span className="absolute top-12 right-5 px-3 py-1 rounded-full text-[11px] font-bold text-white bg-[#4ECDC4]/80 backdrop-blur-sm">
            {mainCat}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-5 -mt-8 relative z-10">
        <h1 className="text-white text-xl font-serif mb-1 leading-tight" style={{ fontWeight: 400 }}>{place.name}</h1>

        {/* Location + rating */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {place.city && (
            <span className="flex items-center gap-1 text-white/50 text-sm">
              <MapPin size={13} /> {place.city}{place.region ? `, ${place.region}` : ""}
            </span>
          )}
          {place.rating_avg > 0 && (
            <span className="flex items-center gap-1 text-amber-400 text-sm font-medium">
              <Star size={13} fill="currentColor" /> {place.rating_avg.toFixed(1)}
              {place.rating_count > 0 && <span className="text-white/30 font-normal">({place.rating_count})</span>}
            </span>
          )}
        </div>

        {/* Description */}
        {place.description && (
          <p className="text-white/60 text-sm leading-relaxed mb-5">{place.description}</p>
        )}

        {/* Quick info chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {meta.season && meta.season !== "Ej relevant" && meta.season !== "" && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 text-white/60 text-xs">
              <Clock size={12} /> {meta.season}
            </span>
          )}
          {meta.handicap && meta.handicap.includes("Handicapegnet") && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 text-white/60 text-xs">
              <Accessibility size={12} /> {t('place.accessible')}
            </span>
          )}
          {meta.facility_type && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 text-white/60 text-xs">
              <Info size={12} /> {meta.facility_type}
            </span>
          )}
          {meta.route_length_km && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 text-white/60 text-xs">
              🛤️ {Number(meta.route_length_km).toFixed(1)} km
            </span>
          )}
        </div>

        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {place.tags.filter(tag => tag !== place.city).slice(0, 8).map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-[#4ECDC4]/10 text-[#4ECDC4] text-[11px] font-medium">{tag}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] font-semibold text-sm hover:bg-[#0ea572] transition-colors shadow-lg shadow-[#4ECDC4]/30">
            <Navigation size={16} /> {t('place.show_route')}
          </a>
          <button className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl glass-card text-white/70 font-semibold text-sm hover:bg-white/10 transition-colors">
            <Bookmark size={16} />
          </button>
        </div>

        {/* External links */}
        {(meta.booking_link || meta.external_link) && (
          <div className="space-y-2 mb-6">
            {meta.booking_link && meta.booking_link.trim() && (
              <a href={meta.booking_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-xl glass-card hover:bg-white/10 transition-colors">
                <span className="text-white/70 text-sm font-medium">{t('place.book_accommodation')}</span>
                <ExternalLink size={14} className="text-white/40" />
              </a>
            )}
            {meta.external_link && meta.external_link.trim() && (
              <a href={meta.external_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-xl glass-card hover:bg-white/10 transition-colors">
                <span className="text-white/70 text-sm font-medium">{t('place.read_more')}</span>
                <ExternalLink size={14} className="text-white/40" />
              </a>
            )}
          </div>
        )}

        {/* Coordinates card */}
        <div className="glass-card rounded-2xl overflow-hidden mb-6">
          <div className="relative h-28 bg-[#1a2035] flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center">
              <MapPin size={22} className="text-[#4ECDC4]" />
            </div>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-white/50 text-xs">
              {place.latitude.toFixed(4)}°N, {place.longitude.toFixed(4)}°E
            </p>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#4ECDC4] text-xs font-medium">
              Google Maps <ChevronRight size={12} />
            </a>
          </div>
        </div>

        {/* Organization info */}
        {meta.organization && meta.organization.trim() && (
          <div className="glass-card rounded-xl p-4 mb-6">
            <p className="text-white/30 text-xs uppercase tracking-wider mb-1">{t('place.responsible')}</p>
            <p className="text-white/70 text-sm">{meta.organization}</p>
          </div>
        )}

        {/* Attribution */}
        {meta.attribution && (
          <p className="text-white/20 text-xs text-center mb-4">{meta.attribution}</p>
        )}
      </div>

    </div>
  );
}
