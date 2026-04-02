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

/* ── Sections ── */
.ms-section {
  padding: 18px; border-radius: 16px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  margin-bottom: 14px;
}
.ms-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
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

/* ── Event list ── */
.ms-event-list { display: flex; flex-direction: column; gap: 10px; }
.ms-event-item {
  display: flex; gap: 12px; padding: 8px; margin: 0 -8px;
  border-radius: 14px; text-decoration: none; color: inherit; transition: background 0.2s;
}
.ms-event-item:hover { background: rgba(255,255,255,0.04); }
.ms-event-thumb { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
.ms-event-info { min-width: 0; flex: 1; display: flex; flex-direction: column; justify-content: center; }
.ms-event-title {
  font-size: 14px; font-weight: 500; color: var(--pg-white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ms-event-date { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }
.ms-event-location { font-size: 12px; color: var(--teal); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── Friends text ── */
.ms-friends-text { font-size: 14px; color: rgba(255,255,255,0.45); }
.ms-friends-text strong { color: var(--pg-white); font-weight: 600; }
.ms-friends-text a, .ms-friends-empty a { color: var(--teal); text-decoration: none; }
.ms-friends-empty { font-size: 14px; color: rgba(255,255,255,0.25); }

/* ── Invite button ── */
.ms-invite-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 100px;
  background: rgba(78,205,196,0.12); color: var(--teal);
  font-size: 12px; font-weight: 500; text-decoration: none; transition: background 0.25s;
}
.ms-invite-btn:hover { background: rgba(78,205,196,0.22); }

/* ── Quick action cards ── */
.ms-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 4px; }
.ms-action-card {
  display: flex; flex-direction: column; padding: 20px;
  text-decoration: none; color: inherit;
  background: var(--glass-bg); backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px; transition: all 0.3s;
}
.ms-action-card:hover {
  background: var(--glass-bg-hover); border-color: rgba(78,205,196,0.25);
  transform: translateY(-2px); box-shadow: 0 8px 32px rgba(78,205,196,0.08);
}
.ms-action-icon { color: var(--teal); margin-bottom: 10px; }
.ms-action-title { font-size: 14px; font-weight: 600; color: var(--pg-white); }
.ms-action-desc { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 3px; }

/* ── Badges ── */
.ms-badges { display: flex; gap: 10px; flex-wrap: wrap; }
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
      <div className="ms-root" ref={containerRef}>

        {/* ── COVER HERO ── */}
        <div className="ms-cover" style={{ position: 'relative' }}>
          <img src="/profile-hero.png" alt="" />
          <div className="ms-cover-overlay" />
          <Link href="/indstillinger" className="ms-settings-btn" aria-label="Settings">
            <Settings size={17} />
          </Link>
        </div>

        {/* ── IDENTITY ── */}
        <div className="ms-identity ms-fade-up">
          <div className="ms-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} />
            ) : (
              displayInitial
            )}
          </div>
          <h1 className="ms-identity-title">{displayName}</h1>
          <p className="ms-identity-sub">{displayCity} · Medlem siden {joinedDate}</p>
        </div>

        {/* ── STATS ── */}
        <div className="ms-stats ms-fade-up ms-d1">
          <div className="ms-stat-card">
            <div className="ms-stat-val">{events.length}</div>
            <div className="ms-stat-lbl">{t('profile.events_count')}</div>
          </div>
          <div className="ms-stat-card">
            <div className="ms-stat-val">{friendCount !== null ? friendCount : (profile?.connections ?? 0)}</div>
            <div className="ms-stat-lbl">{t('profile.friends_count')}</div>
          </div>
          <div className="ms-stat-card">
            <div className="ms-stat-val">{selectedTags.length || uniqueCategories}</div>
            <div className="ms-stat-lbl">{t('profile.tags_count')}</div>
          </div>
        </div>

        {/* ── TWO-COLUMN CONTENT ── */}
        <div className="ms-cols ms-fade-up ms-d2">

          {/* Left: upcoming events */}
          <div className="ms-col-main">
            <div className="ms-section">
              <div className="ms-section-header">
                <h3 className="ms-section-title"><TrendingUp size={14} /> {t('events.upcoming')}</h3>
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

            <div className="ms-actions">
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

          {/* Right: interests + friends */}
          <div className="ms-col-side">
            <div className="ms-section">
              <div className="ms-section-header">
                <h3 className="ms-section-title"><Heart size={14} /> {t('tags.your_interests')}</h3>
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

            <div className="ms-section">
              <div className="ms-section-header">
                <h3 className="ms-section-title"><Award size={14} /> Badges</h3>
              </div>
              <div className="ms-badges">
                <div className="ms-badge" title="Early Adopter">⭐</div>
                <div className="ms-badge" title="Social Butterfly">{friendCount !== null && friendCount >= 5 ? '🦋' : '🔒'}</div>
                <div className="ms-badge" title="Eventgænger">{events.length >= 10 ? '🎪' : '🔒'}</div>
                <div className="ms-badge" title="Udforsk Danmark">{uniqueCategories >= 3 ? '🧭' : '🔒'}</div>
              </div>
            </div>

            <div className="ms-section">
              <div className="ms-section-header">
                <h3 className="ms-section-title"><Users size={14} /> Venner</h3>
                <Link href="/inviter" className="ms-invite-btn"><UserPlus size={12} /> Inviter</Link>
              </div>
              {friendCount !== null && friendCount > 0 ? (
                <p className="ms-friends-text">
                  Du har <strong>{friendCount}</strong> {friendCount === 1 ? "ven" : "venner"} på B-Social.
                </p>
              ) : (
                <p className="ms-friends-empty">
                  Ingen venner endnu — <Link href="/inviter">inviter dine venner</Link> og kom i gang.
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
