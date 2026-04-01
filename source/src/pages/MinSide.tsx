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

export default function TestMinSide() {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { selectedTags } = useTags();
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [friendCount, setFriendCount] = useState<number | null>(null);

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
    <div className="min-h-screen bg-[#060a0f] text-white pb-24">
      {/* Premium dark profile hero */}
      <div className="relative overflow-hidden pb-20 pt-6">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 0%, rgba(78,205,196,0.07) 0%, transparent 65%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 80% 100%, rgba(147,197,253,0.04) 0%, transparent 60%)" }} />
        </div>
        <div className="relative px-5">
          <div className="flex items-center justify-between mb-8">
            <div className="eyebrow">
              <div className="eyebrow-line" />
              {t('profile.my_page')}
            </div>
            <Link href="/indstillinger">
              <button className="w-9 h-9 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
                <Settings size={17} className="text-white/60" />
              </button>
            </Link>
          </div>
          <div className="flex items-end gap-5">
            {/* Avatar */}
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover avatar-ring flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl font-bold teal-glow"
                style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.2), rgba(147,197,253,0.15))", border: "1px solid rgba(78,205,196,0.3)", fontFamily: "'Instrument Serif', Georgia, serif", color: "#4ECDC4" }}
              >
                {displayInitial}
              </div>
            )}
            <div className="flex-1 min-w-0 pb-1">
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: "26px", letterSpacing: "-0.5px" }} className="text-white leading-tight truncate">
                {displayName}
              </h2>
              <p className="text-white/45 flex items-center gap-1 text-sm mt-1">
                <MapPin size={13} className="text-[#4ECDC4]" /> {displayCity}
              </p>
              <p className="text-white/25 text-xs mt-0.5">{t('profile.member_since')} {joinedDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-10 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          {[
            { icon: Calendar, value: events.length, label: t('profile.events_count') },
            { icon: Users, value: friendCount !== null ? friendCount : (profile?.connections ?? 0), label: t('profile.friends_count') },
            { icon: Award, value: selectedTags.length || uniqueCategories, label: t('profile.tags_count') },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="stat-card text-center">
              <Icon size={16} className="mx-auto mb-2 text-[#4ECDC4] opacity-70" />
              <div className="stat-num" style={{ fontSize: "26px" }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <Heart size={16} className="text-[#4ECDC4]" /> {t('tags.your_interests')}
            </h3>
            <button
              onClick={() => setTagEditorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#4ECDC4]/15 text-[#4ECDC4] text-xs font-medium hover:bg-[#4ECDC4]/25 transition-colors min-h-[44px]"
            >
              <Pencil size={12} />
              Rediger interesser
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {topInterests.length > 0 ? (
              topInterests.map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-[#4ECDC4]/15 text-[#4ECDC4] rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))
            ) : (
              <button
                onClick={() => setTagEditorOpen(true)}
                className="text-white/30 text-xs hover:text-[#4ECDC4]/70 transition-colors"
              >
                Ingen tags valgt endnu — tryk for at vælge interesser
              </button>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#4ECDC4]" /> {t('events.upcoming')}
            </h3>
            <Link href="/udforsk" className="text-xs text-[#4ECDC4]">{t('events.see_all')}</Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <Link key={event.id} href={`/event/${event.id}`} className="flex gap-3 hover:bg-white/5 rounded-xl p-1.5 -mx-1.5 transition-colors">
                <img src={getEventImage(event)} alt={event.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-white/40">{formatDanishDate(event.date)}</p>
                  <p className="text-xs text-[#4ECDC4] truncate">{event.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Venner section */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <Users size={16} className="text-[#4ECDC4]" /> Venner
            </h3>
            <Link href="/henvisning" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4ECDC4]/15 text-[#4ECDC4] text-xs font-medium hover:bg-[#4ECDC4]/25 transition-colors">
              <UserPlus size={12} />
              Invitér venner
            </Link>
          </div>
          {friendCount !== null && friendCount > 0 ? (
            <p className="text-sm text-white/50">
              Du har <span className="text-white font-semibold">{friendCount}</span> {friendCount === 1 ? "ven" : "venner"} på B-Social.
            </p>
          ) : (
            <p className="text-sm text-white/30">
              Ingen venner endnu — <Link href="/henvisning" className="text-[#4ECDC4] hover:underline">invitér dine venner</Link> og kom i gang.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/udforsk" className="glass-card rounded-2xl p-4 hover:ring-1 hover:ring-[#4ECDC4]/30 transition-all">
            <Calendar size={24} className="text-[#4ECDC4] mb-2" />
            <p className="font-semibold text-sm">{t('nav.udforsk')}</p>
            <p className="text-xs text-white/40">{t('profile.find_events')}</p>
          </Link>
          <Link href="/kort" className="glass-card rounded-2xl p-4 hover:ring-1 hover:ring-[#4ECDC4]/30 transition-all">
            <MapPin size={24} className="text-[#4ECDC4] mb-2" />
            <p className="font-semibold text-sm">{t('nav.kort')}</p>
            <p className="text-xs text-white/40">{t('profile.events_nearby')}</p>
          </Link>
        </div>
      </div>

      <FeedTagEditor open={tagEditorOpen} onClose={() => setTagEditorOpen(false)} />
    </div>
  );
}
