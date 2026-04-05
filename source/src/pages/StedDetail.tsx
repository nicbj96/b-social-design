import { useState, useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, MapPin, Star, Share2, Bookmark, ExternalLink, Navigation, Clock, Accessibility, Info, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

import { supabase, type Place } from "@/lib/supabase";
import { useTagsForPlace } from "@/hooks/useTagData";
import TagPill from "@/components/TagPill";

/* ── Category → hero image ── */
const HERO_IMAGES: Record<string, string> = {
  shelter:     "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&fm=webp",
  teltplads:   "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop&fm=webp",
  bålhytte:    "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=800&auto=format&fit=crop&fm=webp",
  bålplads:    "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=800&auto=format&fit=crop&fm=webp",
  strand:      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&fm=webp",
  badning:     "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&fm=webp",
  hundeskov:   "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&fm=webp",
  hund:        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&fm=webp",
  vandring:    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop&fm=webp",
  vandrerute:  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop&fm=webp",
  cykelrute:   "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&fm=webp",
  cykling:     "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&fm=webp",
  mtb:         "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&auto=format&fit=crop&fm=webp",
  mountainbike:"https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&auto=format&fit=crop&fm=webp",
  fiskeri:     "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&auto=format&fit=crop&fm=webp",
  lystfiskeri: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&auto=format&fit=crop&fm=webp",
  fiskesø:     "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&auto=format&fit=crop&fm=webp",
  fugletårn:   "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&auto=format&fit=crop&fm=webp",
  fuglekiggeri:"https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&auto=format&fit=crop&fm=webp",
  fitness:     "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&fm=webp",
  dykning:     "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&fm=webp",
  snorkel:     "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&fm=webp",
  kitesurf:    "https://images.unsplash.com/photo-1559288031-6ff34e1540ff?w=800&auto=format&fit=crop&fm=webp",
  windsurf:    "https://images.unsplash.com/photo-1559288031-6ff34e1540ff?w=800&auto=format&fit=crop&fm=webp",
  kælkebakke:  "https://images.unsplash.com/photo-1516820612845-a13894592046?w=800&auto=format&fit=crop&fm=webp",
  vinterbadning:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&auto=format&fit=crop&fm=webp",
  discgolf:    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&fm=webp",
  kajak:       "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&auto=format&fit=crop&fm=webp",
  kano:        "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&auto=format&fit=crop&fm=webp",
  løb:         "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&fm=webp",
  ridning:     "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop&fm=webp",
  camping:     "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&fm=webp",
  kultur:      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&auto=format&fit=crop&fm=webp",
  natur:       "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&fm=webp",
  logi:        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&fm=webp",
  aktiv:       "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop&fm=webp",
  wellness:    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&fm=webp",
  yoga:        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&fm=webp",
  museum:      "https://images.unsplash.com/photo-1578321271385-cd66d387b246?w=800&auto=format&fit=crop&fm=webp",
  teater:      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&auto=format&fit=crop&fm=webp",
  restaurant:  "https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=800&auto=format&fit=crop&fm=webp",
  café:        "https://images.unsplash.com/photo-1502661402884-bee194c3ebda?w=800&auto=format&fit=crop&fm=webp",
  bar:         "https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=800&auto=format&fit=crop&fm=webp",
  hotel:       "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&fm=webp",
  havn:        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&fm=webp",
  bro:         "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&fm=webp",
  slot:        "https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=800&auto=format&fit=crop&fm=webp",
  kirke:       "https://images.unsplash.com/photo-1548013147-72caa4e41edd?w=800&auto=format&fit=crop&fm=webp",
  zoo:         "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&auto=format&fit=crop&fm=webp",
  akvarium:    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop&fm=webp",
  legeplads:   "https://images.unsplash.com/photo-1576169645919-51582a1b25c0?w=800&auto=format&fit=crop&fm=webp",
  picnic:      "https://images.unsplash.com/photo-1414235077418-3a91e9be593f?w=800&auto=format&fit=crop&fm=webp",
  grill:       "https://images.unsplash.com/photo-1555939594-58d7cb561404?w=800&auto=format&fit=crop&fm=webp",
  skateboard:  "https://images.unsplash.com/photo-1488348695476-3596ee1aa0d5?w=800&auto=format&fit=crop&fm=webp",
  golf:        "https://images.unsplash.com/photo-1459925456917-14bec96c68c6?w=800&auto=format&fit=crop&fm=webp",
  vandglid:    "https://images.unsplash.com/photo-1553090254-d3a9b3a29bed?w=800&auto=format&fit=crop&fm=webp",
  svømning:    "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&auto=format&fit=crop&fm=webp",
  surfer:      "https://images.unsplash.com/photo-1539874754509-aeb1d247e90f?w=800&auto=format&fit=crop&fm=webp",
  ski:         "https://images.unsplash.com/photo-1551632440-ff5385277ffe?w=800&auto=format&fit=crop&fm=webp",
  vandtur:     "https://images.unsplash.com/photo-1470252649378-9c29740ff023?w=800&auto=format&fit=crop&fm=webp",
  båd:         "https://images.unsplash.com/photo-1552466835-d9404e9fb0e1?w=800&auto=format&fit=crop&fm=webp",
};

/* ── City → hero image (secondary fallback) ── */
const CITY_IMAGES: Record<string, string> = {
  København:   "https://images.unsplash.com/photo-1512453681174-efc80e5dc0ae?w=800&auto=format&fit=crop&fm=webp",
  Aarhus:      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&fm=webp",
  Odense:      "https://images.unsplash.com/photo-1488747807830-63789f68bb65?w=800&auto=format&fit=crop&fm=webp",
  Aalborg:     "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&fm=webp",
  Randers:     "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&fm=webp",
};

/* ── Fallback rotation images (Danish landscapes) ── */
const FALLBACK_HEROES = [
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&fm=webp",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&fm=webp",
  "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=800&auto=format&fit=crop&fm=webp",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&fm=webp",
  "https://images.unsplash.com/photo-1434725039152-f716dbb29458?w=800&auto=format&fit=crop&fm=webp",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&fm=webp",
];

const DEFAULT_HERO = FALLBACK_HEROES[0];

function getHeroImage(place: Place): string {
  const allTerms = [
    ...(place.tags || []),
    ...(place.main_categories || []),
    (place.metadata as any)?.facility_type || "",
  ].map(item => item.toLowerCase());

  // Try to match by category/tag keywords
  for (const term of allTerms) {
    for (const [key, url] of Object.entries(HERO_IMAGES)) {
      if (term.includes(key) || key.includes(term)) return url;
    }
  }

  // Secondary fallback: check city for Denmark-specific images
  if (place.city) {
    const cityImage = CITY_IMAGES[place.city];
    if (cityImage) return cityImage;
  }

  // Tertiary fallback: rotation-based fallback using place ID hash
  const hash = place.id.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0);
  const idx = Math.abs(hash) % FALLBACK_HEROES.length;
  return FALLBACK_HEROES[idx];
}

const stedCSS = `
${pageBase("sd")}

/* ── Hero ── */
.sd-hero {
  position: relative; width: 100%; height: 280px; overflow: hidden;
}
.sd-hero img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
.sd-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(6,10,15,1) 0%, rgba(6,10,15,0.4) 40%, transparent 70%);
}
.sd-hero-top-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(6,10,15,0.4) 0%, transparent 35%);
}

/* ── Top controls ── */
.sd-back-btn {
  position: absolute; top: 48px; left: 20px; z-index: 10;
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; color: rgba(255,255,255,0.7);
}
.sd-back-btn:hover { background: rgba(255,255,255,0.18); }

/* ── Category badge ── */
.sd-cat-badge {
  position: absolute; top: 48px; right: 20px; z-index: 10;
  padding: 6px 14px; border-radius: 100px;
  background: rgba(78,205,196,0.2); backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(78,205,196,0.3);
  font-size: 11px; font-weight: 600; color: var(--teal);
  text-transform: uppercase; letter-spacing: 1px;
}

/* ── Content ── */
.sd-content {
  padding: 0 20px; margin-top: -32px; position: relative; z-index: 5;
  padding-bottom: 96px;
}
.sd-title {
  font-family: var(--serif); font-size: clamp(22px, 4.5vw, 32px);
  font-weight: 400; line-height: 1.15; color: var(--pg-white);
  margin-bottom: 8px;
}

/* ── Location + Rating ── */
.sd-meta-row {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  margin-bottom: 16px;
}
.sd-meta-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 13px; color: var(--pg-white-dim);
}
.sd-meta-item svg { width: 14px; height: 14px; }
.sd-meta-rating { color: #fbbf24; font-weight: 500; }
.sd-meta-rating svg { fill: currentColor; }
.sd-meta-rating-count { color: var(--pg-white-muted); font-weight: 400; }

/* ── Description ── */
.sd-desc {
  font-size: 14px; color: var(--pg-white-dim); line-height: 1.7;
  margin-bottom: 20px;
}

/* ── Info chips ── */
.sd-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.sd-info-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 100px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  font-size: 12px; color: var(--pg-white-dim);
  backdrop-filter: blur(8px);
}
.sd-info-chip svg { width: 13px; height: 13px; color: var(--teal); }

/* ── Tags ── */
.sd-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
.sd-tag {
  padding: 5px 12px; border-radius: 100px;
  background: rgba(78,205,196,0.08); border: 1px solid rgba(78,205,196,0.12);
  font-size: 11px; color: var(--teal); font-weight: 500;
}

/* ── Action buttons ── */
.sd-actions { display: flex; gap: 12px; margin-bottom: 24px; }
.sd-action-primary {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px; border-radius: 14px; border: none;
  background: var(--teal); color: var(--bg);
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.3s; font-family: var(--sans);
  box-shadow: 0 6px 24px var(--teal-glow);
  text-decoration: none;
}
.sd-action-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 32px var(--teal-glow);
}
.sd-action-primary svg { width: 16px; height: 16px; }
.sd-action-secondary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 20px; border-radius: 14px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  color: var(--pg-white-dim); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.3s;
}
.sd-action-secondary:hover {
  background: var(--glass-bg-hover); border-color: var(--glass-border-hover);
}
.sd-action-secondary svg { width: 16px; height: 16px; }

/* ── External links ── */
.sd-ext-link {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-radius: 14px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  cursor: pointer; transition: all 0.3s; text-decoration: none;
  margin-bottom: 8px;
}
.sd-ext-link:hover {
  background: var(--glass-bg-hover); border-color: var(--glass-border-hover);
}
.sd-ext-link span { font-size: 14px; color: var(--pg-white-dim); font-weight: 500; }
.sd-ext-link svg { width: 14px; height: 14px; color: var(--pg-white-muted); }

/* ── Coords card ── */
.sd-coords-card {
  border-radius: 16px; overflow: hidden;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  margin-bottom: 24px;
}
.sd-coords-map {
  height: 112px; background: rgba(26,32,53,0.8);
  display: flex; align-items: center; justify-content: center;
}
.sd-coords-pin {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(78,205,196,0.15); border: 1px solid rgba(78,205,196,0.2);
  display: flex; align-items: center; justify-content: center;
}
.sd-coords-pin svg { width: 22px; height: 22px; color: var(--teal); }
.sd-coords-footer {
  padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;
}
.sd-coords-text { font-size: 12px; color: var(--pg-white-dim); }
.sd-coords-link {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--teal); font-weight: 500;
  text-decoration: none;
}
.sd-coords-link svg { width: 12px; height: 12px; }

/* ── Org card ── */
.sd-org-card {
  padding: 16px; border-radius: 14px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  margin-bottom: 24px;
}
.sd-org-label {
  font-size: 11px; color: var(--pg-white-muted); text-transform: uppercase;
  letter-spacing: 1.5px; margin-bottom: 6px;
}
.sd-org-name { font-size: 14px; color: var(--pg-white-dim); }

/* ── Attribution ── */
.sd-attribution {
  font-size: 11px; color: rgba(255,255,255,0.12); text-align: center;
  margin-bottom: 16px;
}

/* ── Loading / Error ── */
.sd-loading {
  min-height: 100vh; background: var(--bg);
  display: flex; align-items: center; justify-content: center;
}
.sd-spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid rgba(78,205,196,0.2);
  border-top-color: var(--teal);
  animation: sd-spin 0.8s linear infinite;
}
@keyframes sd-spin { to { transform: rotate(360deg); } }

.sd-error {
  min-height: 100vh; background: var(--bg);
  display: flex; align-items: center; justify-content: center;
}
.sd-error-inner { text-align: center; }
.sd-error-emoji { font-size: 40px; margin-bottom: 12px; display: block; }
.sd-error-text { font-size: 14px; color: var(--pg-white-dim); margin-bottom: 16px; }
.sd-error-btn {
  color: var(--teal); font-size: 14px; font-weight: 500;
  background: none; border: none; cursor: pointer;
}

/* ── Responsive ── */
@media (min-width: 600px) {
  .sd-hero { height: 360px; }
  .sd-content { max-width: 640px; margin-left: auto; margin-right: auto; }
}
`;

export default function StedDetail() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/sted/:id");
  const rawId = params?.id || "";
  const placeId = rawId.startsWith("sb-") ? rawId.slice(3) : rawId;
  const containerRef = useFadeUp("sd");

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { toggle: toggleFavorite, isFavorite } = useFavorites();
  const { data: placeTags } = useTagsForPlace(place?.id ?? "");
  // Set dynamic page meta tags
  usePageMeta({
    title: place?.name || "Sted",
    description: place?.description ? place.description.slice(0, 160) : undefined,
    ogImage: place ? getHeroImage(place) : undefined,
  });

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
      <>
        <style>{stedCSS}</style>
        <div className="sd-loading">
          <div className="sd-spinner" />
        </div>
      </>
    );
  }

  if (error || !place) {
    return (
      <>
        <style>{stedCSS}</style>
        <div className="sd-error">
          <div className="sd-error-inner">
            <span className="sd-error-emoji">🔍</span>
            <p className="sd-error-text">{t('place.not_found')}</p>
            <button className="sd-error-btn" onClick={() => setLocation("/kort")}>{t('place.back_to_map')}</button>
          </div>
        </div>
      </>
    );
  }

  const meta = place.metadata as any || {};
  const heroImg = getHeroImage(place);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  const mainCat = (place.main_categories || [])[0] || "";

  return (
    <>
      <style>{stedCSS}</style>
      <div className="sd-root" ref={containerRef} data-testid="sted-detail-page">

        {/* ── Hero ── */}
        <div className="sd-hero">
          <img src={heroImg} alt={place.name} loading="eager" />
          <div className="sd-hero-overlay" />
          <div className="sd-hero-top-overlay" />
          <button className="sd-back-btn" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
          </button>
          {placeTags?.find(t => t.level === 1) && (
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-medium">
              {placeTags.find(t => t.level === 1)?.emoji} {placeTags.find(t => t.level === 1)?.name}
            </span>
          )}
        </div>

        {/* ── Content ── */}
        <div className="sd-content">
          <h1 className="sd-title sd-fade-up">{place.name}</h1>

          {/* Location + rating */}
          <div className="sd-meta-row sd-fade-up sd-d1">
            {place.city && (
              <span className="sd-meta-item">
                <MapPin /> {place.city}{place.region ? `, ${place.region}` : ""}
              </span>
            )}
            {place.rating_avg > 0 && (
              <span className="sd-meta-item sd-meta-rating">
                <Star /> {place.rating_avg.toFixed(1)}
                {place.rating_count > 0 && <span className="sd-meta-rating-count">({place.rating_count})</span>}
              </span>
            )}
          </div>

          {/* Description */}
          {place.description && (
            <p className="sd-desc sd-fade-up sd-d1">{place.description}</p>
          )}

          {/* Info chips */}
          <div className="sd-chips sd-fade-up sd-d2">
            {meta.season && meta.season !== "Ej relevant" && meta.season !== "" && (
              <span className="sd-info-chip"><Clock /> {meta.season}</span>
            )}
            {meta.handicap && meta.handicap.includes("Handicapegnet") && (
              <span className="sd-info-chip"><Accessibility /> {t('place.accessible')}</span>
            )}
            {meta.facility_type && (
              <span className="sd-info-chip"><Info /> {meta.facility_type}</span>
            )}
            {meta.route_length_km && (
              <span className="sd-info-chip">🛤️ {Number(meta.route_length_km).toFixed(1)} km</span>
            )}
          </div>

          {/* Tags */}
          {placeTags && placeTags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-white/60 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {placeTags.map(t => (
                  <TagPill key={t.slug} slug={t.slug} name={t.name} emoji={t.emoji} level={t.level} size="sm" clickable />
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="sd-actions sd-fade-up sd-d3">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="sd-action-primary">
              <Navigation /> {t('place.show_route')}
            </a>
            <button
              className="sd-action-secondary"
              onClick={() => setLocation(`/kort?lat=${place.latitude}&lng=${place.longitude}&zoom=14`)}
              title="Vis på kort"
            >
              <MapPin />
            </button>
            <button
              className="sd-action-secondary"
              onClick={() => toggleFavorite(place.id, "place")}
              title={isFavorite(place.id) ? "Fjern fra favoritter" : "Tilføj til favoritter"}
            >
              <Bookmark fill={isFavorite(place.id) ? "currentColor" : "none"} />
            </button>
          </div>

          {/* External links */}
          {(meta.booking_link || meta.external_link) && (
            <div className="sd-fade-up sd-d3" style={{ marginBottom: 24 }}>
              {meta.booking_link && meta.booking_link.trim() && (
                <a href={meta.booking_link} target="_blank" rel="noopener noreferrer" className="sd-ext-link">
                  <span>{t('place.book_accommodation')}</span>
                  <ExternalLink />
                </a>
              )}
              {meta.external_link && meta.external_link.trim() && (
                <a href={meta.external_link} target="_blank" rel="noopener noreferrer" className="sd-ext-link">
                  <span>{t('place.read_more')}</span>
                  <ExternalLink />
                </a>
              )}
            </div>
          )}

          {/* Coordinates card */}
          <div className="sd-coords-card sd-fade-up sd-d3">
            <div className="sd-coords-map">
              <div className="sd-coords-pin">
                <MapPin />
              </div>
            </div>
            <div className="sd-coords-footer">
              <span className="sd-coords-text">
                {place.latitude.toFixed(4)}°N, {place.longitude.toFixed(4)}°E
              </span>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="sd-coords-link">
                Google Maps <ChevronRight />
              </a>
            </div>
          </div>

          {/* Organization info */}
          {meta.organization && meta.organization.trim() && (
            <div className="sd-org-card sd-fade-up sd-d4">
              <p className="sd-org-label">{t('place.responsible')}</p>
              <p className="sd-org-name">{meta.organization}</p>
            </div>
          )}

          {/* Attribution */}
          {meta.attribution && (
            <p className="sd-attribution">{meta.attribution}</p>
          )}
        </div>
      </div>
    </>
  );
}
