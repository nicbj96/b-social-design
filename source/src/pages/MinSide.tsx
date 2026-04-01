import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { getEvents } from "@/lib/data";
import { getEventImage, formatDanishDate } from "@/lib/eventHelpers";
import { Settings, Calendar, Heart, MapPin, TrendingUp, Award, Users, Pencil, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTags } from "@/context/TagContext";
import { FeedTagEditor } from "@/components/FeedTagEditor";
import { supabase } from "@/lib/supabase";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const minSideCSS = `${pageBase("ms")}

/* ── Hero section ── */
.ms-hero {
  position: relative;
  overflow: hidden;
  padding: 0 0 80px 0;
}
.ms-hero-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0.25;
  filter: blur(1px);
}
.ms-hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(
    180deg,
    rgba(6,10,15,0.3) 0%,
    rgba(6,10,15,0.6) 50%,
    rgba(6,10,15,1) 100%
  );
}
.ms-hero-ambient-1 {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 80% 60% at 30% 0%, rgba(78,205,196,0.09) 0%, transparent 65%);
}
.ms-hero-ambient-2 {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 60% 50% at 80% 100%, rgba(147,197,253,0.05) 0%, transparent 60%);
}
.ms-hero-inner {
  position: relative; z-index: 2;
  padding: 24px 20px 0;
}

/* ── Top bar ── */
.ms-topbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 32px;
}
.ms-settings-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; color: rgba(255,255,255,0.5);
}
.ms-settings-btn:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  color: var(--teal);
}

/* ── Avatar ── */
.ms-profile-row {
  display: flex; align-items: flex-end; gap: 20px;
}
.ms-avatar {
  width: 88px; height: 88px; border-radius: 20px;
  flex-shrink: 0; object-fit: cover;
  box-shadow: 0 0 0 3px rgba(78,205,196,0.3), 0 0 24px rgba(78,205,196,0.15);
  transition: box-shadow 0.4s;
}
.ms-avatar:hover {
  box-shadow: 0 0 0 3px rgba(78,205,196,0.5), 0 0 32px rgba(78,205,196,0.25);
}
.ms-avatar-fallback {
  width: 88px; height: 88px; border-radius: 20px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 34px; font-weight: 700;
  font-family: var(--serif);
  color: var(--teal);
  background: linear-gradient(135deg, rgba(78,205,196,0.18), rgba(147,197,253,0.12));
  border: 2px solid rgba(78,205,196,0.35);
  box-shadow: 0 0 24px rgba(78,205,196,0.15);
  transition: box-shadow 0.4s;
}
.ms-avatar-fallback:hover {
  box-shadow: 0 0 0 3px rgba(78,205,196,0.4), 0 0 32px rgba(78,205,196,0.2);
}
.ms-profile-info {
  flex: 1; min-width: 0; padding-bottom: 4px;
}
.ms-name {
  font-family: var(--serif);
  font-weight: 400; font-size: 28px;
  letter-spacing: -0.5px;
  color: var(--pg-white);
  line-height: 1.15;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ms-city {
  display: flex; align-items: center; gap: 5px;
  font-size: 14px; color: rgba(255,255,255,0.45);
  margin-top: 6px;
}
.ms-city svg { color: var(--teal); }
.ms-joined {
  font-size: 12px; color: rgba(255,255,255,0.2);
  margin-top: 3px;
}

/* ── Body content ── */
.ms-body {
  position: relative; z-index: 2;
  padding: 0 20px;
  margin-top: -40px;
  display: flex; flex-direction: column; gap: 16px;
}

/* ── Stat cards row ── */
.ms-stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.ms-stat-card {
  text-align: center;
  padding: 18px 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  transition: all 0.3s;
}
.ms-stat-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  transform: translateY(-2px);
}
.ms-stat-icon {
  color: var(--teal); opacity: 0.7;
  margin: 0 auto 8px;
  display: flex; justify-content: center;
}
.ms-stat-value {
  font-family: var(--serif);
  font-size: 28px; font-weight: 400;
  color: var(--pg-white); line-height: 1;
}
.ms-stat-label-text {
  font-size: 11px; color: rgba(255,255,255,0.25);
  text-transform: uppercase; letter-spacing: 1.2px;
  margin-top: 6px;
}

/* ── Sections (interests, upcoming, friends) ── */
.ms-section {
  padding: 18px;
}
.ms-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.ms-section-title {
  font-size: 14px; font-weight: 600;
  color: rgba(255,255,255,0.7);
  display: flex; align-items: center; gap: 8px;
}
.ms-section-title svg { color: var(--teal); }
.ms-section-link {
  font-size: 12px; color: var(--teal);
  text-decoration: none; transition: opacity 0.2s;
}
.ms-section-link:hover { opacity: 0.75; }

/* ── Edit interests button ── */
.ms-edit-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 16px; border-radius: 14px;
  background: rgba(78,205,196,0.12);
  color: var(--teal); font-size: 12px; font-weight: 500;
  border: none; cursor: pointer;
  min-height: 44px; transition: background 0.25s;
  font-family: var(--sans);
}
.ms-edit-btn:hover { background: rgba(78,205,196,0.22); }

/* ── Tag pills ── */
.ms-tags {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.ms-tag {
  padding: 7px 16px;
  background: rgba(78,205,196,0.12);
  color: var(--teal); border-radius: 100px;
  font-size: 12px; font-weight: 500;
  border: 1px solid rgba(78,205,196,0.15);
  transition: all 0.25s;
}
.ms-tag:hover {
  background: rgba(78,205,196,0.2);
  border-color: rgba(78,205,196,0.3);
}
.ms-tags-empty {
  font-size: 13px; color: rgba(255,255,255,0.25);
  cursor: pointer; border: none; background: none;
  padding: 0; font-family: var(--sans);
  transition: color 0.2s;
}
.ms-tags-empty:hover { color: rgba(78,205,196,0.6); }

/* ── Event list items ── */
.ms-event-list {
  display: flex; flex-direction: column; gap: 10px;
}
.ms-event-item {
  display: flex; gap: 12px;
  padding: 8px; margin: 0 -8px;
  border-radius: 14px;
  text-decoration: none; color: inherit;
  transition: background 0.2s;
}
.ms-event-item:hover { background: rgba(255,255,255,0.04); }
.ms-event-thumb {
  width: 56px; height: 56px; border-radius: 14px;
  object-fit: cover; flex-shrink: 0;
}
.ms-event-info {
  min-width: 0; flex: 1;
  display: flex; flex-direction: column; justify-content: center;
}
.ms-event-title {
  font-size: 14px; font-weight: 500;
  color: var(--pg-white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ms-event-date {
  font-size: 12px; color: rgba(255,255,255,0.35);
  margin-top: 2px;
}
.ms-event-location {
  font-size: 12px; color: var(--teal);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: 1px;
}

/* ── Friends section text ── */
.ms-friends-text {
  font-size: 14px; color: rgba(255,255,255,0.45);
}
.ms-friends-text strong {
  color: var(--pg-white); font-weight: 600;
}
.ms-friends-text a {
  color: var(--teal); text-decoration: none;
}
.ms-friends-text a:hover { text-decoration: underline; }
.ms-friends-empty {
  font-size: 14px; color: rgba(255,255,255,0.25);
}
.ms-friends-empty a {
  color: var(--teal); text-decoration: none;
}
.ms-friends-empty a:hover { text-decoration: underline; }

/* ── Invite button ── */
.ms-invite-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 14px;
  background: rgba(78,205,196,0.12);
  color: var(--teal); font-size: 12px; font-weight: 500;
  text-decoration: none; transition: background 0.25s;
}
.ms-invite-btn:hover { background: rgba(78,205,196,0.22); }

/* ── Quick action cards ── */
.ms-actions {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.ms-action-card {
  display: flex; flex-direction: column;
  padding: 20px;
  text-decoration: none; color: inherit;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  transition: all 0.3s;
}
.ms-action-card:hover {
  background: var(--glass-bg-hover);
  border-color: rgba(78,205,196,0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(78,205,196,0.08);
}
.ms-action-icon {
  color: var(--teal); margin-bottom: 10px;
}
.ms-action-title {
  font-size: 14px; font-weight: 600;
  color: var(--pg-white);
}
.ms-action-desc {
  font-size: 12px; color: rgba(255,255,255,0.35);
  margin-top: 3px;
}

/* ── Bottom padding for nav ── */
.ms-bottom-pad { padding-bottom: 96px; }
`;

export default function TestMinSide() {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { selectedTags } = useTags();
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [friendCount, setFriendCount] = useState<number | null>(null);
  const containerRef = useFadeUp("ms");

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
    staleTime: 5 * 60 * 1000, // 5 min — global default fine for profile page
  });

  // Show upcoming events as suggestions (filter out past events)
  const upcomingEvents = useMemo(() => {
    const now = new Date().toISOString();
    return events.filter(e => e.date >= now).slice(0, 5);
  }, [events]);

  // Derive dynamic interests from user profile tags first, then event tags as fallback
  const topInterests = useMemo(() => {
    // Use profile interests/tags if available
    if (profile?.interests && profile.interests.length > 0) {
      return profile.interests.slice(0, 5);
    }
    if (selectedTags.length > 0) {
      return selectedTags.slice(0, 5);
    }
    // Fallback: derive from event tags
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

  // Derive unique categories count as "badges"
  const uniqueCategories = useMemo(() => {
    const cats = new Set(events.map(e => e.category).filter(Boolean));
    return cats.size;
  }, [events]);

  // Use real profile data
  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || t('settings.default_user');
  const displayCity = profile?.city || "Danmark";
  const displayInitial = displayName[0]?.toUpperCase() || "?";
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("da-DK", { month: "long", year: "numeric" })
    : "2026";

  return (
    <>
      <style>{minSideCSS}</style>
      <div className="ms-root ms-bottom-pad" ref={containerRef}>

        {/* ── Hero ── */}
        <div className="ms-hero">
          <img
            src="/profile-hero.png"
            alt=""
            className="ms-hero-img"
            loading="eager"
          />
          <div className="ms-hero-gradient" />
          <div className="ms-hero-ambient-1" aria-hidden="true" />
          <div className="ms-hero-ambient-2" aria-hidden="true" />

          <div className="ms-hero-inner">
            {/* Top bar */}
            <div className="ms-topbar ms-fade-up">
              <div className="ms-eyebrow">
                <div className="ms-eyebrow-line" />
                {t('profile.my_page')}
              </div>
              <Link href="/indstillinger">
                <button className="ms-settings-btn" aria-label="Settings">
                  <Settings size={17} />
                </button>
              </Link>
            </div>

            {/* Avatar + info */}
            <div className="ms-profile-row ms-fade-up ms-d1">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="ms-avatar"
                  loading="lazy"
                />
              ) : (
                <div className="ms-avatar-fallback">
                  {displayInitial}
                </div>
              )}
              <div className="ms-profile-info">
                <h2 className="ms-name">{displayName}</h2>
                <p className="ms-city">
                  <MapPin size={13} /> {displayCity}
                </p>
                <p className="ms-joined">{t('profile.member_since')} {joinedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="ms-body">

          {/* Stats row */}
          <div className="ms-stats-row ms-fade-up ms-d2">
            {[
              { icon: Calendar, value: events.length, label: t('profile.events_count') },
              { icon: Users, value: friendCount !== null ? friendCount : (profile?.connections ?? 0), label: t('profile.friends_count') },
              { icon: Award, value: selectedTags.length || uniqueCategories, label: t('profile.tags_count') },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="ms-stat-card">
                <div className="ms-stat-icon"><Icon size={16} /></div>
                <div className="ms-stat-value">{value}</div>
                <div className="ms-stat-label-text">{label}</div>
              </div>
            ))}
          </div>

          {/* Interests */}
          <div className="ms-glass ms-section ms-fade-up ms-d3">
            <div className="ms-section-header">
              <h3 className="ms-section-title">
                <Heart size={16} /> {t('tags.your_interests')}
              </h3>
              <button
                onClick={() => setTagEditorOpen(true)}
                className="ms-edit-btn"
              >
                <Pencil size={12} />
                Rediger interesser
              </button>
            </div>
            <div className="ms-tags">
              {topInterests.length > 0 ? (
                topInterests.map(tag => (
                  <span key={tag} className="ms-tag">{tag}</span>
                ))
              ) : (
                <button
                  onClick={() => setTagEditorOpen(true)}
                  className="ms-tags-empty"
                >
                  Ingen tags valgt endnu — tryk for at vaelge interesser
                </button>
              )}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="ms-glass ms-section ms-fade-up ms-d4">
            <div className="ms-section-header">
              <h3 className="ms-section-title">
                <TrendingUp size={16} /> {t('events.upcoming')}
              </h3>
              <Link href="/udforsk" className="ms-section-link">{t('events.see_all')}</Link>
            </div>
            <div className="ms-event-list">
              {upcomingEvents.map(event => (
                <Link key={event.id} href={`/event/${event.id}`} className="ms-event-item">
                  <img src={getEventImage(event)} alt={event.title} className="ms-event-thumb" loading="lazy" />
                  <div className="ms-event-info">
                    <p className="ms-event-title">{event.title}</p>
                    <p className="ms-event-date">{formatDanishDate(event.date)}</p>
                    <p className="ms-event-location">{event.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Friends */}
          <div className="ms-glass ms-section ms-fade-up">
            <div className="ms-section-header">
              <h3 className="ms-section-title">
                <Users size={16} /> Venner
              </h3>
              <Link href="/henvisning" className="ms-invite-btn">
                <UserPlus size={12} />
                Inviter venner
              </Link>
            </div>
            {friendCount !== null && friendCount > 0 ? (
              <p className="ms-friends-text">
                Du har <strong>{friendCount}</strong> {friendCount === 1 ? "ven" : "venner"} pa B-Social.
              </p>
            ) : (
              <p className="ms-friends-empty">
                Ingen venner endnu — <Link href="/henvisning">inviter dine venner</Link> og kom i gang.
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="ms-actions ms-fade-up">
            <Link href="/udforsk" className="ms-action-card">
              <div className="ms-action-icon"><Calendar size={24} /></div>
              <p className="ms-action-title">{t('nav.udforsk')}</p>
              <p className="ms-action-desc">{t('profile.find_events')}</p>
            </Link>
            <Link href="/kort" className="ms-action-card">
              <div className="ms-action-icon"><MapPin size={24} /></div>
              <p className="ms-action-title">{t('nav.kort')}</p>
              <p className="ms-action-desc">{t('profile.events_nearby')}</p>
            </Link>
          </div>

        </div>

        <FeedTagEditor open={tagEditorOpen} onClose={() => setTagEditorOpen(false)} />
      </div>
    </>
  );
}
