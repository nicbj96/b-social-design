import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Share2, Heart, MapPin, Users, Calendar, ExternalLink, Ticket, BedDouble, Star, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Event } from "@/lib/data";
import { getEventById } from "@/lib/data";
import { getCategoryEmoji, getEventImage, formatDanishDate } from "@/lib/eventHelpers";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const GEOAPIFY_KEY = "c6ed42e8addb457ebf24265a045b892b";

interface NearbyHotel {
  name: string;
  address: string;
  lat: number;
  lon: number;
  brand?: string;
  stars?: number;
  distance?: number;
}

async function fetchNearbyHotels(lat: number, lon: number): Promise<NearbyHotel[]> {
  try {
    const res = await fetch(
      `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lon},${lat},5000&limit=6&apiKey=${GEOAPIFY_KEY}`
    );
    const data = await res.json();
    return (data.features || []).map((f: any) => {
      const p = f.properties;
      const dLat = (p.lat - lat) * 111320;
      const dLon = (p.lon - lon) * 111320 * Math.cos(lat * Math.PI / 180);
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      return {
        name: p.name || "Hotel",
        address: p.address_line2 || p.formatted || "",
        lat: p.lat,
        lon: p.lon,
        brand: p.brand,
        stars: p.datasource?.raw?.stars ? parseInt(p.datasource.raw.stars) : undefined,
        distance: Math.round(dist),
      };
    });
  } catch {
    return [];
  }
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  const { data: event, isLoading } = useQuery<Event | null>({
    queryKey: ["event", id],
    queryFn: () => Promise.resolve(id ? getEventById(id) : null),
  });

  const handleJoin = () => {
    if (!user) {
      sessionStorage.setItem('returnTo', `/event/${id}`);
      setLocation("/auth");
      return;
    }
    setJoining(true);
    // Simulate a join action (no backend in static mode)
    setTimeout(() => {
      setJoined(true);
      setJoining(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="min-h-svh" style={{ background: "hsl(230,35%,8%)" }}>
        <Skeleton className="w-full h-72 bg-white/5" />
        <div className="px-5 pt-5 space-y-3">
          <Skeleton className="h-8 w-3/4 bg-white/5" />
          <Skeleton className="h-4 w-1/2 bg-white/5" />
          <Skeleton className="h-24 bg-white/5" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div
        className="min-h-svh flex flex-col items-center justify-center px-6"
        style={{ background: "hsl(230,35%,8%)" }}
      >
        <span className="text-5xl mb-4">🔍</span>
        <p className="text-white/60 text-base">{t('events.not_found')}</p>
        <button
          onClick={() => setLocation("/feed")}
          className="mt-4 px-6 py-2.5 rounded-2xl bg-[#4ECDC4] text-[#0a0f1a] font-medium text-sm"
        >
          {t('events.back_to_feed')}
        </button>
      </div>
    );
  }

  const heroImage = getEventImage(event);
  const isGratis = !event.price || event.price === 0;

  return (
    <div
      className="relative min-h-svh"
      style={{ background: "hsl(230,35%,8%)" }}
      data-testid="event-detail-page"
    >
      {/* Hero image */}
      <div className="relative h-72">
        <img
          src={heroImage}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e23] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-12">
          <button
            onClick={() => window.history.back()}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
            data-testid="button-back"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: event.title, url: window.location.href });
                }
              }}
              className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
              data-testid="button-share"
            >
              <Share2 size={16} className="text-white" />
            </button>
            <button
              onClick={() => setFavorited(!favorited)}
              className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
              data-testid="button-favorite"
            >
              <Heart
                size={16}
                className={favorited ? "text-red-400 fill-red-400" : "text-white"}
              />
            </button>
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
            {getCategoryEmoji(event.category || "")} {event.category}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isGratis ? "bg-[#4ECDC4]/90 text-white" : "bg-orange-500/90 text-white"
            }`}
          >
            {isGratis ? t('events.free') : `${event.price} ${t('events.currency')}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-32">
        <h1 className="text-white text-2xl font-bold leading-tight mb-4">{event.title}</h1>

        {/* Info pills */}
        <div className="flex flex-col gap-2 mb-5">
          {event.date && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Calendar size={15} className="text-[#4ECDC4] flex-shrink-0" />
              <span>{formatDanishDate(event.date)}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <MapPin size={15} className="text-[#4ECDC4] flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
          {event.max_participants && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Users size={15} className="text-[#4ECDC4] flex-shrink-0" />
              <span>{t('events.up_to_participants', { count: event.max_participants })}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="glass-card rounded-2xl p-4 mb-5">
            <h3 className="text-white font-semibold text-sm mb-2">{t('events.about_experience')}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Tags */}
        {event.interest_tags && event.interest_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {event.interest_tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Affiliate ticket links — shown for ticketmaster/seatgeek events */}
        {event.source && ['ticketmaster', 'seatgeek'].includes(event.source) && (
          <div className="mb-6">
            {event.source === 'ticketmaster' && (
              <a
                href={event.url || `https://www.ticketmaster.com/search?q=${encodeURIComponent(event.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#026CDF] text-white text-sm font-bold hover:bg-[#0256B3] transition-colors min-h-[44px]"
              >
                <Ticket size={16} />
                Køb billetter på Ticketmaster
                <ExternalLink size={14} />
              </a>
            )}
            {event.source === 'seatgeek' && (
              <a
                href={event.url || `https://seatgeek.com/search?search=${encodeURIComponent(event.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#4CAF50] text-white text-sm font-bold hover:bg-[#43A047] transition-colors min-h-[44px]"
              >
                <Ticket size={16} />
                Køb billetter på SeatGeek
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}

        {/* Nearby Hotels — intelligent section */}
        <NearbyHotelsSection event={event} />
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 pb-8 glass-nav">
        <button
          onClick={handleJoin}
          disabled={joined || joining}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200 ${
            joined
              ? "bg-white/10 text-[#4ECDC4] border border-[#4ECDC4]/30"
              : "bg-[#4ECDC4] text-[#0a0f1a] hover:bg-[#3dbdb5] active:scale-98 shadow-lg shadow-[#4ECDC4]/20"
          }`}
          data-testid="button-deltag"
        >
          {joined ? t('events.joined') : joining ? t('events.joining') : t('events.join_experience')}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NEARBY HOTELS SECTION — Geoapify + Booking.com affiliate
   ═══════════════════════════════════════════════ */
function NearbyHotelsSection({ event }: { event: Event }) {
  const [hotels, setHotels] = useState<NearbyHotel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!event.latitude || !event.longitude) return;
    setLoading(true);
    fetchNearbyHotels(event.latitude, event.longitude)
      .then(h => { setHotels(h); setLoading(false); })
      .catch(() => setLoading(false));
  }, [event.latitude, event.longitude]);

  if (!event.latitude || !event.longitude) {
    // Fallback: simple Booking.com link based on location text
    if (!event.location) return null;
    return (
      <div className="mb-6">
        <a
          href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(event.location.split(',')[0])}${event.date ? `&checkin=${event.date.split('T')[0]}` : ''}&aid=304142`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#003580] text-white text-sm font-bold hover:bg-[#00264D] transition-colors min-h-[44px]"
        >
          <BedDouble size={16} />
          Find overnatning nær eventet
          <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  const checkinParam = event.date ? `&checkin=${event.date.split('T')[0]}` : '';
  const bookingSearchUrl = `https://www.booking.com/searchresults.da.html?ss=${encodeURIComponent(event.location?.split(',')[0] || 'Hotel')}&latitude=${event.latitude}&longitude=${event.longitude}${checkinParam}&aid=304142`;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <BedDouble size={16} className="text-[#4ECDC4]" />
        <h3 className="text-white font-semibold text-sm">Hoteller i nærheden</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-white/40 text-sm">
          <Loader2 size={14} className="animate-spin" /> Søger hoteller...
        </div>
      ) : hotels.length > 0 ? (
        <div className="space-y-2">
          {hotels.map((hotel, i) => (
            <a
              key={i}
              href={`https://www.booking.com/searchresults.da.html?ss=${encodeURIComponent(hotel.name)}&latitude=${hotel.lat}&longitude=${hotel.lon}&radius=1${checkinParam}&aid=304142`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-xl bg-white/4 border border-white/6 hover:bg-white/8 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#003580]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BedDouble size={16} className="text-[#003580]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate group-hover:text-[#4ECDC4] transition-colors">{hotel.name}</p>
                <p className="text-white/40 text-xs truncate">{hotel.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  {hotel.brand && <span className="text-white/30 text-[10px]">{hotel.brand}</span>}
                  {hotel.distance && (
                    <span className="text-white/30 text-[10px]">
                      {hotel.distance < 1000 ? `${hotel.distance} m` : `${(hotel.distance / 1000).toFixed(1)} km`} fra eventet
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink size={12} className="text-white/20 group-hover:text-white/50 mt-1 flex-shrink-0" />
            </a>
          ))}
        </div>
      ) : null}

      {/* See all on Booking.com */}
      <a
        href={bookingSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full mt-3 py-3 rounded-xl bg-[#003580] text-white text-sm font-bold hover:bg-[#00264D] transition-colors min-h-[44px]"
      >
        Se alle hoteller på Booking.com
        <ExternalLink size={14} />
      </a>
      <p className="text-white/15 text-[10px] text-center mt-1">Sammenlign priser på hoteller, lejligheder og mere</p>
    </div>
  );
}
