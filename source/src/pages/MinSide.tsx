import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { getEvents } from "@/lib/data";
import { getEventImage, formatDanishDate } from "@/lib/eventHelpers";
import { Settings, Heart, MapPin, TrendingUp, Award, Users, Pencil } from "lucide-react";
import { MinSideSubNav } from "@/components/MinSideSubNav";
import { useAuth } from "@/context/AuthContext";
import { useTags } from "@/context/TagContext";
import { FeedTagEditor } from "@/components/FeedTagEditor";
import { supabase } from "@/lib/supabase";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const minSideCSS = `${pageBase("ms")}

/* ── Settings button (top-right of cover) ── */
.ms-settings-btn {
  position: absolute; top: 16px; right: 16px; z-index: 10;
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(6,10,15,0.55); backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; color: rgba(255,255,255,0.7);
  text-decoration: none;
}
.ms-settings-btn:hover { background: rgba(6,10,15,0.8); color: var(--teal); }

/* ── Stat pills row ── */
.ms-stat-pills {
  display: flex; justify-content: center; gap: 12px;
  padding: 0 20px 28px; flex-wrap: wrap;
}
.ms-stat-pill {
  padding: 10px 22px; border-radius: 100px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12);
  font-size: 14px; font-weight: 500; color: var(--pg-white);
  font-family: var(--sans); white-space: nowrap;
  transition: all 0.3s;
}
.ms-stat-pill strong {
  color: var(--pg-white); font-weight: 700; margin-right: 4px;
}
.ms-stat-pill:hover {
  border-color: rgba(78,205,196,0.3);
  background: rgba(78,205,196,0.06);
}

/* ── Sections ── */
.ms-section {
  padding: 20px; border-radius: 16px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  margin-bottom: 16px;
}
.ms-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.ms-section-title {
  font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7);
  text-transform: uppercase; letter-spacing: 1.5px;
  display: flex; align-items: center; gap: 8px;
}
.ms-section-title svg { color: var(--teal); }
.ms-section-link {
  font-size: 12px; color: var(--teal); text-decoration: none; transition: opacity 0.2s;
}
.ms-section-link:hover { opacity: 0.75; }

/* ── Horizontal event cards ── */
.ms-event-scroll {
  display: flex; gap: 14px; overflow-x: auto;
  padding-bottom: 4px; scroll-snap-type: x mandatory;
  -ms-overflow-style: none; scrollbar-width: none;
}
.ms-event-scroll::-webkit-scrollbar { display: none; }
.ms-event-card {
  flex: 0 0 160px; scroll-snap-align: start;
  text-decoration: none; color: inherit; transition: transform 0.25s;
}
.ms-event-card:hover { transform: translateY(-3px); }
.ms-event-card-img {
  width: 160px; height: 110px; border-radius: 14px;
  object-fit: cover; display: block;
}
.ms-event-card-title {
  font-size: 13px; font-weight: 500; color: var(--pg-white);
  margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Activity feed ── */
.ms-activity-list { display: flex; flex-direction: column; gap: 14px; }
.ms-activity-item {
  display: flex; gap: 12px; align-items: flex-start;
}
.ms-activity-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 14px; overflow: hidden;
}
.ms-activity-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ms-activity-text {
  font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.45;
}
.ms-activity-text strong { color: var(--pg-white); font-weight: 500; }
.ms-activity-text .ms-activity-loc { color: var(--teal); }

/* ── Edit interests button ── */
.ms-edit-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 100px;
  background: rgba(78,205,196,0.12); color: var(--teal);
  font-size: 12px; font-weight: 500; border: none; cursor: pointer;
  min-height: 36px; transition: background 0.25s; font-family: var(--sans);
}
.ms-edit-btn:hover { background: rgba(78,205,196,0.22); }

/* ── Tag pills ── */
.ms-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.ms-tag {
  padding: 6px 14px; background: rgba(78,205,196,0.12);
  color: var(--teal); border-radius: 100px;
  font-size: 12px; font-weight: 500; border: 1px solid rgba(78,205,196,0.15);
  transition: all 0.25s;
}
.ms-tag:hover { background: rgba(78,205,196,0.2); }
.ms-tags-empty {
  font-size: 13px; color: rgba(255,255,255,0.25);
  cursor: pointer; border: none; background: none;
  padding: 0; font-family: var(--sans); transition: color 0.2s;
}
.ms-tags-empty:hover { color: rgba(78,205,196,0.6); }

/* ── Badges ── */
.ms-badges { display: flex; gap: 12px; flex-wrap: wrap; }
.ms-badge-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.ms-badge {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; transition: all 0.3s;
}
.ms-badge:hover {
  transform: translateY(-2px);
  border-color: rgba(78,205,196,0.3);
  box-shadow: 0 4px 16px rgba(78,205,196,0.12);
}
.ms-badge-label {
  font-size: 10px; color: rgba(255,255,255,0.3); text-align: center;
  max-width: 56px; line-height: 1.2;
}

/* ── Friends row ── */
.ms-friends-row {
  display: flex; align-items: center; gap: 0;
}
.ms-friend-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  border: 2px solid var(--bg); overflow: hidden;
  background: rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
  margin-left: -8px; transition: transform 0.2s;
}
.ms-friend-avatar:first-child { margin-left: 0; }
.ms-friend-avatar:hover { transform: scale(1.1); z-index: 2; }
.ms-friend-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ms-friends-more {
  margin-left: 12px; font-size: 13px; color: var(--teal); font-weight: 500;
}
.ms-friends-empty {
  font-size: 13px; color: rgba(255,255,255,0.25);
}
.ms-friends-empty a { color: var(--teal); text-decoration: none; }

/* ── Mobile responsive ── */
@media (max-width: 768px) {
  .ms-stat-pills { gap: 8px; }
  .ms-stat-pill { padding: 8px 16px; font-size: 13px; }
  .ms-event-card { flex: 0 0 140px; }
  .ms-event-card-img { width: 140px; height: 96px; }
}
`;

export default function TestMinSide() {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { selectedTags } = useTags();
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [friendCount, setFriendCount] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("my_friends")
      .select("friend_id", { count: "exact", head: true })
      .then(({ count }) => setFriendCount(count ?? 0));
  }, [user]);

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000,
  });

  const upcomingEvents = useMemo(() => {
    const now = new Date().toISOString();
    return events.filter(e => e.date >= now).slice(0, 5);
  }, [events]);

  const topInterests = useMemo(() => {
    if (profile?.interests && profile.interests.length > 0) {
      return profile.interests.slice(0, 5);
    }
    if (selectedTags.length > 0) {
      return selectedTags.slice(0, 5);
    }
    const tagCounts: Record<string, number> = {};
    events.forEach(e => {
      (e.interest_tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }, [events, profile, selectedTags]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(events.map(e => e.category).filter(Boolean));
    return cats.size;
  }, [events]);

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || t('settings.default_user');
  const displayCity = profile?.city || "Danmark";
  const displayInitial = displayName[0]?.toUpperCase() || "?";
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("da-DK", { month: "long", year: "numeric" })
    : "2026";

  // Recent activity: derive from upcoming events as activity items
  const recentActivity = useMemo(() => {
    return events.slice(0, 3).map(e => ({
      id: e.id,
      text: `deltog i "${e.title}"`,
      location: e.location,
    }));
  }, [events]);

  return (
    <>
      <style>{minSideCSS}</style>
      <div className="ms-root" ref={containerRef}>

        {/* ── COVER HERO ── */}
        <div className="ms-cover" style={{ position: 'relative' }}>
          <img src="/profile-hero.png" alt="" loading="lazy" />
          <div className="ms-cover-overlay" />
          <Link href="/indstillinger" className="ms-settings-btn" aria-label="Settings">
            <Settings size={17} />
          </Link>
        </div>

        {/* ── IDENTITY ── */}
        <div className="ms-identity">
          <div className="ms-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} loading="lazy" />
            ) : (
              displayInitial
            )}
          </div>
          <h1 className="ms-identity-title">{displayName}</h1>
          <p className="ms-identity-sub">{displayCity} · Medlem siden {joinedDate}</p>
        </div>

        {/* ── STAT PILLS ── */}
        <div className="ms-stat-pills">
          <div className="ms-stat-pill"><strong>{events.length}</strong> Events</div>
          <div className="ms-stat-pill"><strong>{friendCount !== null ? friendCount : (profile?.connections ?? 0)}</strong> {t('profile.friends_count')}</div>
          <div className="ms-stat-pill"><strong>{selectedTags.length || uniqueCategories}</strong> {t('profile.tags_count')}</div>
        </div>

        <MinSideSubNav />

        {/* ── TWO-COLUMN CONTENT ── */}
        <div className="ms-cols">

          {/* Left column */}
          <div className="ms-col-main">

            {/* Upcoming events — horizontal scroll cards */}
            <div className="ms-section">
              <div className="ms-section-header">
                <h3 className="ms-section-title"><TrendingUp size={14} /> {t('events.upcoming')}</h3>
                <Link href="/udforsk" className="ms-section-link">{t('events.see_all')}</Link>
              </div>
              <div className="ms-event-scroll">
                {upcomingEvents.map(event => (
                  <Link key={event.id} href={`/event/${event.id}`} className="ms-event-card">
                    <img src={getEventImage(event)} alt={event.title} className="ms-event-card-img" loading="lazy" />
                    <p className="ms-event-card-title">{event.title}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="ms-section">
              <div className="ms-section-header">
                <h3 className="ms-section-title"><MapPin size={14} /> Seneste aktivitet</h3>
              </div>
              <div className="ms-activity-list">
                {recentActivity.map(a => (
                  <div key={a.id} className="ms-activity-item">
                    <div className="ms-activity-avatar">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" loading="lazy" />
                      ) : (
                        displayInitial
                      )}
                    </div>
                    <p className="ms-activity-text">
                      <strong>{displayName}</strong> {a.text}
                      {a.location && <><br /><span className="ms-activity-loc">{a.location}</span></>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="ms-col-side">

            {/* Interests */}
            <div className="ms-section">
              <div className="ms-section-header">
                <h3 className="ms-section-title"><Heart size={14} /> Interesser</h3>
                <button onClick={() => setTagEditorOpen(true)} className="ms-edit-btn">
                  <Pencil size={12} /> Rediger
                </button>
              </div>
              <div className="ms-tags">
                {topInterests.length > 0 ? (
                  topInterests.map(tag => <span key={tag} className="ms-tag">{tag}</span>)
                ) : (
                  <button onClick={() => setTagEditorOpen(true)} className="ms-tags-empty">
                    Ingen tags valgt endnu — tryk for at vælge interesser
                  </button>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="ms-section">
              <div className="ms-section-header">
                <h3 className="ms-section-title"><Award size={14} /> Badges</h3>
              </div>
              <div className="ms-badges">
                <div className="ms-badge-item">
                  <div className="ms-badge" title="Early Adopter">⭐</div>
                  <span className="ms-badge-label">Early Adopter</span>
                </div>
                <div className="ms-badge-item">
                  <div className="ms-badge" title="Tech">💻</div>
                  <span className="ms-badge-label">Tech</span>
                </div>
                <div className="ms-badge-item">
                  <div className="ms-badge" title="Community">🤝</div>
                  <span className="ms-badge-label">Community</span>
                </div>
                <div className="ms-badge-item">
                  <div className="ms-badge" title="Social Butterfly">
                    {friendCount !== null && friendCount >= 5 ? '🦋' : '🔒'}
                  </div>
                  <span className="ms-badge-label">Social Butterfly</span>
                </div>
                <div className="ms-badge-item">
                  <div className="ms-badge" title="Udforsk Danmark">
                    {uniqueCategories >= 3 ? '🧭' : '🔒'}
                  </div>
                  <span className="ms-badge-label">Udforsk</span>
                </div>
              </div>
            </div>

            {/* Friends */}
            <div className="ms-section">
              <div className="ms-section-header">
                <h3 className="ms-section-title"><Users size={14} /> Fælles venner</h3>
              </div>
              {friendCount !== null && friendCount > 0 ? (
                <div className="ms-friends-row">
                  {/* Placeholder avatars — real friend avatars would come from a friends query */}
                  {Array.from({ length: Math.min(friendCount, 6) }).map((_, i) => (
                    <div key={i} className="ms-friend-avatar">👤</div>
                  ))}
                  {friendCount > 6 && (
                    <span className="ms-friends-more">+{friendCount - 6} mere</span>
                  )}
                </div>
              ) : (
                <p className="ms-friends-empty">
                  Ingen venner endnu — <Link href="/inviter">inviter dine venner</Link>
                </p>
              )}
            </div>
          </div>

        </div>

        <FeedTagEditor open={tagEditorOpen} onClose={() => setTagEditorOpen(false)} />
      </div>
    </>
  );
}
