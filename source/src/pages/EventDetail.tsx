import { useState, useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useParams, useLocation, Link } from "wouter";
import { ArrowLeft, Share2, Heart, MapPin, Users, Calendar, ExternalLink, Ticket, BedDouble, Star, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Event } from "@/lib/data";
import { getEventById } from "@/lib/data";
import { getCategoryEmoji, getEventImage, formatDanishDate } from "@/lib/eventHelpers";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";
import { gradients } from "@/lib/designTokens";
import { useTagsForEvent } from "@/hooks/useTagData";
import TagPill from "@/components/TagPill";

/* ─────────────────────────────────────────────
   B-Social Event Detail — Premium Redesign
   Scoped CSS prefix: ed-
   ───────────────────────────────────────────── */

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

const eventDetailCSS = `
${pageBase("ed")}

/* ── Hero ── */
.ed-hero {
  position: relative; height: 420px; overflow: hidden;
}
.ed-hero img {
  width: 100%; height: 100%; object-fit: cover;
}
.ed-hero-gradient-bottom {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(6,10,15,1) 0%, rgba(6,10,15,0.6) 40%, transparent 70%);
}
.ed-hero-gradient-top {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(6,10,15,0.5) 0%, transparent 40%);
}

/* ── Top controls ── */
.ed-top-bar {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 48px 20px 16px;
  z-index: 10;
}
.ed-icon-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; color: rgba(255,255,255,0.9);
}
.ed-icon-btn:hover {
  background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.2);
}
.ed-icon-btn svg { width: 18px; height: 18px; }
.ed-icon-btn-row { display: flex; gap: 8px; }

/* ── Hero badges ── */
.ed-hero-badges {
  position: absolute; bottom: 24px; left: 20px; right: 20px;
  display: flex; align-items: flex-end; justify-content: space-between;
  z-index: 10;
}
.ed-badge {
  padding: 6px 14px; border-radius: 100px; font-size: 13px; font-weight: 500;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
}
.ed-badge-cat {
  background: rgba(6,10,15,0.6); color: rgba(255,255,255,0.9);
}
.ed-badge-free {
  background: rgba(78,205,196,0.2); color: var(--teal);
  border-color: rgba(78,205,196,0.3);
}
.ed-badge-paid {
  background: rgba(255,152,0,0.2); color: #ffb74d;
  border-color: rgba(255,152,0,0.3);
}

/* ── Content ── */
.ed-content {
  padding: 0 20px 160px; margin-top: -24px; position: relative; z-index: 5;
}
.ed-title {
  font-family: var(--serif); font-size: clamp(26px, 5vw, 36px);
  font-weight: 400; line-height: 1.1; letter-spacing: -0.5px;
  color: var(--pg-white); margin-bottom: 20px;
}

/* ── Info row ── */
.ed-info-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.ed-info-item {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; color: var(--pg-white-dim);
}
.ed-info-item svg { color: var(--teal); flex-shrink: 0; width: 16px; height: 16px; }

/* ── Description card ── */
.ed-desc-card {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 20px; margin-bottom: 24px;
}
.ed-desc-title {
  font-size: 12px; font-weight: 600; color: var(--teal);
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;
}
.ed-desc-text {
  font-size: 14px; color: var(--pg-white-dim); line-height: 1.7;
}

/* ── Tags ── */
.ed-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
.ed-tag {
  padding: 6px 14px; border-radius: 100px;
  background: rgba(78,205,196,0.08); border: 1px solid rgba(78,205,196,0.12);
  font-size: 12px; color: var(--teal); font-weight: 500;
  transition: all 0.25s;
}
.ed-tag:hover { background: rgba(78,205,196,0.15); }

/* ── Affiliate buttons ── */
.ed-affiliate-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 14px; border-radius: 14px;
  font-size: 14px; font-weight: 600; transition: all 0.3s;
  border: none; cursor: pointer; text-decoration: none;
  min-height: 48px; color: white;
}
.ed-affiliate-btn svg { width: 16px; height: 16px; }
.ed-affiliate-btn:hover { transform: translateY(-1px); }
.ed-affiliate-tm {
  background: linear-gradient(135deg, #026CDF 0%, #0256B3 100%);
  box-shadow: 0 4px 20px rgba(2,108,223,0.3);
}
.ed-affiliate-tm:hover { box-shadow: 0 6px 28px rgba(2,108,223,0.4); }
.ed-affiliate-sg {
  background: linear-gradient(135deg, #4CAF50 0%, #43A047 100%);
  box-shadow: 0 4px 20px rgba(76,175,80,0.3);
}
.ed-affiliate-sg:hover { box-shadow: 0 6px 28px rgba(76,175,80,0.4); }
.ed-affiliate-booking {
  background: linear-gradient(135deg, #003580 0%, #00264D 100%);
  box-shadow: 0 4px 20px rgba(0,53,128,0.3);
}
.ed-affiliate-booking:hover { box-shadow: 0 6px 28px rgba(0,53,128,0.4); }

/* ── Hotels section ── */
.ed-hotels-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
}
.ed-hotels-header svg { color: var(--teal); width: 18px; height: 18px; }
.ed-hotels-header h3 {
  font-family: var(--serif); font-size: 20px; font-weight: 400;
  color: var(--pg-white);
}
.ed-hotel-card {
  display: flex; align-items: flex-start; gap: 14px; padding: 14px;
  border-radius: 14px; background: var(--glass-bg);
  border: 1px solid var(--glass-border); cursor: pointer;
  transition: all 0.3s; text-decoration: none; margin-bottom: 8px;
}
.ed-hotel-card:hover {
  background: var(--glass-bg-hover); border-color: var(--glass-border-hover);
  transform: translateY(-1px);
}
.ed-hotel-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(0,53,128,0.15); border: 1px solid rgba(0,53,128,0.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ed-hotel-icon svg { color: #5B9BD5; width: 18px; height: 18px; }
.ed-hotel-info { flex: 1; min-width: 0; }
.ed-hotel-name {
  font-size: 14px; font-weight: 500; color: var(--pg-white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color 0.25s;
}
.ed-hotel-card:hover .ed-hotel-name { color: var(--teal); }
.ed-hotel-addr {
  font-size: 12px; color: var(--pg-white-muted); margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ed-hotel-meta {
  display: flex; align-items: center; gap: 8px; margin-top: 4px;
}
.ed-hotel-meta span {
  font-size: 10px; color: rgba(255,255,255,0.2);
}
.ed-hotel-arrow {
  color: rgba(255,255,255,0.15); flex-shrink: 0; margin-top: 4px;
  transition: color 0.25s;
}
.ed-hotel-card:hover .ed-hotel-arrow { color: rgba(255,255,255,0.4); }
.ed-hotels-note {
  font-size: 10px; color: rgba(255,255,255,0.12); text-align: center;
  margin-top: 8px;
}

/* ── Fixed bottom CTA ── */
.ed-bottom-cta {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 430px; padding: 16px 20px 32px;
  background: rgba(6,10,15,0.85); backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255,255,255,0.06);
  z-index: 50;
}
.ed-rsvp-count {
  text-align: center; font-size: 13px; color: var(--pg-white-muted);
  margin-bottom: 8px;
}
.ed-join-btn {
  width: 100%; padding: 16px; border-radius: 14px;
  font-size: 15px; font-weight: 600; border: none; cursor: pointer;
  transition: all 0.3s; font-family: var(--sans);
}
.ed-join-btn-active {
  background: var(--teal); color: var(--bg);
  box-shadow: 0 8px 32px var(--teal-glow);
}
.ed-join-btn-active:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 40px var(--teal-glow);
}
.ed-join-btn-joined {
  background: rgba(78,205,196,0.08); color: var(--teal);
  border: 1px solid rgba(78,205,196,0.2);
}

/* ── Loading skeleton ── */
.ed-skeleton {
  min-height: 100vh; background: var(--bg);
}

/* ── Not found ── */
.ed-not-found {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 24px;
  background: var(--bg); color: var(--pg-white);
  font-family: var(--sans);
}
.ed-not-found-emoji { font-size: 56px; margin-bottom: 16px; }
.ed-not-found-text { font-size: 15px; color: var(--pg-white-dim); margin-bottom: 20px; }
.ed-not-found-links {
  display: flex; gap: 16px; margin-top: 12px;
}
.ed-not-found-links a {
  font-size: 13px; color: var(--pg-white-muted);
  text-decoration: none; transition: color 0.25s;
}
.ed-not-found-links a:hover { color: var(--teal); }

/* ── Related navigation ── */
.ed-related-nav {
  display: flex; gap: 12px; flex-wrap: wrap;
  margin-bottom: 28px;
}
.ed-related-link {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 100px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  font-size: 13px; font-weight: 500; color: var(--pg-white-dim);
  text-decoration: none; transition: all 0.25s;
}
.ed-related-link:hover {
  border-color: rgba(78,205,196,0.3); color: var(--teal);
}

/* ── Responsive ── */
@media (min-width: 600px) {
  .ed-hero { height: 480px; }
  .ed-content { max-width: 640px; margin-left: auto; margin-right: auto; }
}
`;

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  const containerRef = useFadeUp("ed");

  const { data: event, isLoading } = useQuery<Event | null>({
    queryKey: ["event", id],
    queryFn: () => Promise.resolve(id ? getEventById(id) : null),
    staleTime: 5 * 60 * 1000,
  });

  const { data: eventTags } = useTagsForEvent(event?.id ?? "");
  // Set dynamic page meta tags
  usePageMeta({
    title: event?.title || "Event",
    description: event?.description ? event.description.slice(0, 160) : undefined,
    ogImage: event?.image_url ?? undefined,
  });

  useEffect(() => {
    if (!user || !id) return;
    supabase.from("event_rsvps").select("status").eq("event_id", id).eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setJoined(true); });
  }, [user, id]);

  useEffect(() => {
    if (!id) return;
    supabase.from("event_rsvps").select("*", { count: 'exact' }).eq("event_id", id).eq("status", "going")
      .then(({ count }) => { if (count !== null) setRsvpCount(count); });
  }, [id]);

  const handleJoin = async () => {
    if (!user) {
      sessionStorage.setItem('returnTo', `/event/${id}`);
      setLocation("/auth");
      return;
    }
    setJoining(true);
    try {
      const { error } = await supabase
        .from("event_rsvps")
        .upsert({ event_id: id, user_id: user.id, status: 'going' }, { onConflict: 'event_id,user_id' });
      if (!error) setJoined(true);
    } catch (e) {
      console.error(e);
    } finally {
      setJoining(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title ?? "Event",
          text: event?.description || event?.title || "Event",
          url: window.location.href,
        });
      } catch (e) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Event link copied to clipboard!');
      } catch (e) {
        console.error("Copy failed:", e);
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <style>{eventDetailCSS}</style>
        <div className="ed-skeleton">
          <Skeleton className="w-full h-72 bg-white/5" />
          <div style={{ padding: '20px' }}>
            <Skeleton className="h-8 w-3/4 bg-white/5 mb-3" />
            <Skeleton className="h-4 w-1/2 bg-white/5 mb-3" />
            <Skeleton className="h-24 bg-white/5" />
          </div>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <style>{eventDetailCSS}</style>
        <div className="ed-not-found">
          <span className="ed-not-found-emoji">🔍</span>
          <p className="ed-not-found-text">{t('events.not_found')}</p>
          <button className="ed-btn" onClick={() => setLocation("/feed")}>
            {t('events.back_to_feed')}
          </button>
          <div className="ed-not-found-links">
            <Link href="/udforsk">Udforsk events</Link>
            <Link href="/kort">Se kort</Link>
          </div>
        </div>
      </>
    );
  }

  const heroImage = getEventImage(event);
  const isGratis = !event.price || event.price === 0;

  return (
    <>
      <style>{eventDetailCSS}</style>
      <div className="ed-root" ref={containerRef} data-testid="event-detail-page">

        {/* ── Hero ── */}
        <div className="ed-hero">
          <img src={heroImage} alt={event.title} loading="eager" />
          <div className="ed-hero-gradient-bottom" />
          <div className="ed-hero-gradient-top" />

          {/* Top controls */}
          <div className="ed-top-bar">
            <button className="ed-icon-btn" onClick={() => window.history.back()} data-testid="button-back">
              <ArrowLeft />
            </button>
            <div className="ed-icon-btn-row">
              <button
                className="ed-icon-btn"
                onClick={handleShare}
                data-testid="button-share"
              >
                <Share2 />
              </button>
              <button
                className="ed-icon-btn"
                onClick={() => setFavorited(!favorited)}
                data-testid="button-favorite"
                style={favorited ? { background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' } : undefined}
              >
                <Heart style={favorited ? { color: '#f87171', fill: '#f87171' } : undefined} />
              </button>
            </div>
          </div>

          {/* Hero badges */}
          <div className="ed-hero-badges">
            <span className="ed-badge ed-badge-cat">
              {getCategoryEmoji(event.category || "")} {event.category}
            </span>
            <span className={`ed-badge ${isGratis ? 'ed-badge-free' : 'ed-badge-paid'}`}>
              {isGratis ? t('events.free') : `${event.price} ${t('events.currency')}`}
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="ed-content">
          <h1 className="ed-title ed-fade-up">{event.title}</h1>

          {/* Info list */}
          <div className="ed-info-list ed-fade-up ed-d1">
            {event.date && (
              <div className="ed-info-item">
                <Calendar />
                <span>{formatDanishDate(event.date)}</span>
              </div>
            )}
            {event.location && (
              <div className="ed-info-item">
                <MapPin />
                <span>{event.location}</span>
              </div>
            )}
            {event.max_participants && (
              <div className="ed-info-item">
                <Users />
                <span>{t('events.up_to_participants', { count: event.max_participants })}</span>
              </div>
            )}
            {/* Price display */}
            <div className="ed-info-item">
              <Ticket />
              <span>
                {!event.price || event.price === 0
                  ? 'Gratis'
                  : `fra ${event.price} kr`
                }
              </span>
            </div>
          </div>

          {/* Map mini-pin */}
          {event.latitude && event.longitude && (
            <div className="ed-desc-card ed-fade-up ed-d2">
              <div className="ed-desc-title">Placering</div>
              <Link href={`/kort?lat=${event.latitude}&lng=${event.longitude}`} className="ed-related-link" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                <MapPin size={14} /> Vis på kort
              </Link>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="ed-desc-card ed-fade-up ed-d2">
              <div className="ed-desc-title">{t('events.about_experience')}</div>
              <p className="ed-desc-text">{event.description}</p>
            </div>
          )}

          {/* Tags */}
          {eventTags && eventTags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-white/60 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {eventTags.map(t => (
                  <TagPill key={t.slug} slug={t.slug} name={t.name} emoji={t.emoji} level={t.level} size="sm" clickable />
                ))}
              </div>
            </div>
          )}

          {/* Related navigation */}
          <div className="ed-related-nav ed-fade-up ed-d3">
            <Link href="/feed" className="ed-related-link">Tilbage til feed</Link>
            <Link href="/udforsk" className="ed-related-link">Udforsk events</Link>
            <Link href="/kort" className="ed-related-link">Se kort</Link>
          </div>

          {/* Affiliate ticket links */}
          {event.source && ['ticketmaster', 'seatgeek'].includes(event.source) && (
            <div className="ed-fade-up ed-d3" style={{ marginBottom: 24 }}>
              {event.source === 'ticketmaster' && (
                <a
                  href={event.url || `https://www.ticketmaster.com/search?q=${encodeURIComponent(event.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-affiliate-btn ed-affiliate-tm"
                >
                  <Ticket /> Køb billetter på Ticketmaster <ExternalLink />
                </a>
              )}
              {event.source === 'seatgeek' && (
                <a
                  href={event.url || `https://seatgeek.com/search?search=${encodeURIComponent(event.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-affiliate-btn ed-affiliate-sg"
                >
                  <Ticket /> Køb billetter på SeatGeek <ExternalLink />
                </a>
              )}
            </div>
          )}

          {/* Nearby Hotels */}
          <div className="ed-fade-up ed-d3">
            <NearbyHotelsSection event={event} />
          </div>
        </div>

        {/* ── Fixed bottom CTA ── */}
        <div className="ed-bottom-cta">
          <div className="ed-rsvp-count">{rsvpCount} {rsvpCount === 1 ? 'deltager' : 'deltagere'}</div>
          <button
            onClick={handleJoin}
            disabled={joined || joining}
            className={`ed-join-btn ${joined ? 'ed-join-btn-joined' : 'ed-join-btn-active'}`}
            data-testid="button-deltag"
          >
            {joined ? t('events.joined') : joining ? t('events.joining') : t('events.join_experience')}
          </button>
        </div>
      </div>
    </>
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
    if (!event.location) return null;
    return (
      <div style={{ marginBottom: 24 }}>
        <a
          href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(event.location.split(',')[0])}${event.date ? `&checkin=${event.date.split('T')[0]}` : ''}&aid=304142`}
          target="_blank"
          rel="noopener noreferrer"
          className="ed-affiliate-btn ed-affiliate-booking"
        >
          <BedDouble /> Find overnatning nær eventet <ExternalLink />
        </a>
      </div>
    );
  }

  const checkinParam = event.date ? `&checkin=${event.date.split('T')[0]}` : '';
  const bookingSearchUrl = `https://www.booking.com/searchresults.da.html?ss=${encodeURIComponent(event.location?.split(',')[0] || 'Hotel')}&latitude=${event.latitude}&longitude=${event.longitude}${checkinParam}&aid=304142`;

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="ed-hotels-header">
        <BedDouble />
        <h3>Hoteller i nærheden</h3>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          <Loader2 size={14} className="animate-spin" /> Søger hoteller...
        </div>
      ) : hotels.length > 0 ? (
        <div>
          {hotels.map((hotel, i) => (
            <a
              key={i}
              href={`https://www.booking.com/searchresults.da.html?ss=${encodeURIComponent(hotel.name)}&latitude=${hotel.lat}&longitude=${hotel.lon}&radius=1${checkinParam}&aid=304142`}
              target="_blank"
              rel="noopener noreferrer"
              className="ed-hotel-card"
            >
              <div className="ed-hotel-icon">
                <BedDouble />
              </div>
              <div className="ed-hotel-info">
                <p className="ed-hotel-name">{hotel.name}</p>
                <p className="ed-hotel-addr">{hotel.address}</p>
                <div className="ed-hotel-meta">
                  {hotel.brand && <span>{hotel.brand}</span>}
                  {hotel.distance && (
                    <span>
                      {hotel.distance < 1000 ? `${hotel.distance} m` : `${(hotel.distance / 1000).toFixed(1)} km`} fra eventet
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink size={12} className="ed-hotel-arrow" />
            </a>
          ))}
        </div>
      ) : null}

      <a
        href={bookingSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ed-affiliate-btn ed-affiliate-booking"
        style={{ marginTop: 12 }}
      >
        Se alle hoteller på Booking.com <ExternalLink />
      </a>
      <p className="ed-hotels-note">Sammenlign priser på hoteller, lejligheder og mere</p>
    </div>
  );
}
