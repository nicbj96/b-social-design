import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import {
  Bell, BellRing, Calendar, MessageCircle, UserPlus, UserCheck, Tag,
  ChevronRight, Inbox, Search, Check, X,
} from "lucide-react";
import { useNotifications, type Notification, type NotificationType } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/lib/supabase";
import UserSearch from "@/components/UserSearch";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const notifikationerCSS = `
${pageBase("nt")}

/* ── Stat pills row ── */
.nt-pills {
  display: flex; justify-content: center; gap: 10px;
  padding: 0 20px 16px; flex-wrap: wrap;
}
.nt-pill {
  padding: 9px 20px; border-radius: 100px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  font-size: 13px; color: var(--pg-white-dim); font-family: var(--sans);
  white-space: nowrap;
}
.nt-pill strong { color: var(--pg-white); font-weight: 600; }

/* ── Filter chips ── */
.nt-filters {
  display: flex; justify-content: center; gap: 8px;
  padding: 0 20px 24px; flex-wrap: wrap;
}

/* ── Content ── */
.nt-content { padding: 0 16px 32px; }

/* ── Group label ── */
.nt-group { margin-bottom: 8px; }
.nt-group-label {
  font-size: 11px; font-weight: 600; color: var(--pg-white-muted);
  text-transform: uppercase; letter-spacing: 2px; padding: 0 8px;
  margin-bottom: 8px; font-family: var(--sans);
}

/* ── Notification card ── */
.nt-card {
  width: 100%; display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; background: var(--glass-bg);
  border: 1px solid var(--glass-border); border-radius: 16px;
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  cursor: pointer; transition: all 0.25s; font-family: var(--sans);
  margin-bottom: 10px; text-align: left; border-left: none;
}
.nt-card:hover {
  background: var(--glass-bg-hover); border-color: var(--glass-border-hover);
}
.nt-card--unread { border-left: 2px solid var(--teal); }
.nt-card--read { opacity: 0.5; }
.nt-card--read:hover { opacity: 0.75; }

/* Avatar circle */
.nt-card-avatar {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.nt-card-avatar img {
  width: 100%; height: 100%; object-fit: cover;
}
.nt-card-avatar--icon {
  background: rgba(78,205,196,0.12);
}
/* type-specific icon colors */
.nt-card--event_invite .nt-card-avatar--icon   { background: rgba(78,205,196,0.12); color: #4ECDC4; }
.nt-card--friend_request .nt-card-avatar--icon { background: rgba(192,132,252,0.12); color: #c084fc; }
.nt-card--friend_accepted .nt-card-avatar--icon{ background: rgba(74,222,128,0.12); color: #4ade80; }
.nt-card--new_message .nt-card-avatar--icon    { background: rgba(96,165,250,0.12); color: #60a5fa; }
.nt-card--event_reminder .nt-card-avatar--icon { background: rgba(251,191,36,0.12); color: #fbbf24; }
.nt-card--tag_match .nt-card-avatar--icon      { background: rgba(249,115,22,0.12); color: #f97316; }

/* Card body */
.nt-card-body { flex: 1; min-width: 0; }
.nt-card-text {
  font-size: 14px; color: var(--pg-white); line-height: 1.45;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.nt-card--read .nt-card-text { color: var(--pg-white-dim); }
.nt-card-time {
  font-size: 11px; color: rgba(255,255,255,0.18); margin-top: 3px;
}

/* Card action button */
.nt-card-action {
  padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 500;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  color: var(--pg-white-dim); cursor: pointer; transition: all 0.25s;
  font-family: var(--sans); white-space: nowrap; flex-shrink: 0;
}
.nt-card-action:hover {
  background: var(--teal-dim); border-color: rgba(78,205,196,0.25);
  color: var(--teal);
}

/* Card chevron */
.nt-card-chevron {
  color: rgba(255,255,255,0.15); flex-shrink: 0; transition: transform 0.2s;
}
.nt-card:hover .nt-card-chevron {
  transform: translateX(2px); color: var(--pg-white-muted);
}

/* ── Friend request card actions ── */
.nt-fr-actions { display: flex; gap: 8px; flex-shrink: 0; }
.nt-fr-btn {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: all 0.25s;
}
.nt-fr-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.nt-fr-btn--accept {
  background: rgba(74,222,128,0.15); color: #4ade80;
  border: 1px solid rgba(74,222,128,0.2);
}
.nt-fr-btn--accept:hover:not(:disabled) {
  background: rgba(74,222,128,0.25); border-color: rgba(74,222,128,0.4);
  box-shadow: 0 4px 16px rgba(74,222,128,0.2); transform: translateY(-1px);
}
.nt-fr-btn--decline {
  background: rgba(248,113,113,0.15); color: #f87171;
  border: 1px solid rgba(248,113,113,0.2);
}
.nt-fr-btn--decline:hover:not(:disabled) {
  background: rgba(248,113,113,0.25); border-color: rgba(248,113,113,0.4);
  box-shadow: 0 4px 16px rgba(248,113,113,0.2); transform: translateY(-1px);
}

/* ── Ryd alle button ── */
.nt-clear-all {
  display: flex; justify-content: center; padding: 16px 0 96px;
}
.nt-clear-btn {
  padding: 10px 28px; border-radius: 100px; font-size: 13px; font-weight: 500;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  color: var(--pg-white-dim); cursor: pointer; transition: all 0.25s;
  font-family: var(--sans); backdrop-filter: blur(12px);
}
.nt-clear-btn:hover {
  background: var(--glass-bg-hover); border-color: var(--glass-border-hover);
  color: var(--pg-white);
}

/* ── Empty state ── */
.nt-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 0;
}
.nt-empty-icon {
  width: 64px; height: 64px; border-radius: 18px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
}
.nt-empty-title { font-size: 14px; font-weight: 500; color: var(--pg-white-dim); }
.nt-empty-sub { font-size: 12px; color: var(--pg-white-muted); margin-top: 4px; }

/* ── Loading ── */
.nt-spinner-wrap { display: flex; justify-content: center; padding: 80px 0; }
.nt-spinner {
  width: 24px; height: 24px; border: 2px solid rgba(78,205,196,0.2);
  border-top-color: var(--teal); border-radius: 50%;
  animation: nt-spin 0.75s linear infinite;
}
@keyframes nt-spin { to { transform: rotate(360deg); } }

/* ── Auth center ── */
.nt-center {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 0 24px;
}
.nt-login-text { font-size: 14px; color: var(--pg-white-dim); margin-top: 16px; }

/* ── Modal overlay ── */
.nt-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px); display: flex; align-items: center;
  justify-content: center; z-index: 50; padding: 16px;
}
.nt-modal-content {
  background: var(--bg); border: 1px solid var(--glass-border);
  border-radius: 20px; width: 100%; max-width: 480px;
  max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;
}

/* ── Mobile adjustments ── */
@media (max-width: 768px) {
  .nt-pills { gap: 6px; padding: 0 12px 12px; }
  .nt-pill { padding: 7px 14px; font-size: 12px; }
  .nt-filters { gap: 6px; padding: 0 12px 20px; }
  .nt-content { padding: 0 12px 32px; }
  .nt-card { padding: 12px 14px; gap: 10px; }
  .nt-card-avatar { width: 40px; height: 40px; }
  .nt-card-action { padding: 6px 12px; font-size: 11px; }
}
`;

/* ── Icon per notification type ── */
const TYPE_META: Record<NotificationType, { icon: typeof Bell; action: string }> = {
  event_invite:    { icon: Calendar, action: "Accepter" },
  friend_request:  { icon: UserPlus, action: "Se profil" },
  friend_accepted: { icon: UserCheck, action: "Se profil" },
  new_message:     { icon: MessageCircle, action: "Åbn chat" },
  event_reminder:  { icon: BellRing, action: "Se event" },
  tag_match:       { icon: Tag, action: "Se match" },
};

type FilterKey = "all" | "unread" | "friends" | "events";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "unread", label: "Ulæste" },
  { key: "friends", label: "Venner" },
  { key: "events", label: "Events" },
];

/* ── Date grouping helpers ── */
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function groupLabel(dateStr: string, t: (key: string) => string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const todayStart = startOfDay(now);
  const dStart = startOfDay(d);
  const diff = todayStart - dStart;

  if (diff <= 0) return t('notifications.today');
  if (diff <= 86400000) return t('notifications.yesterday');
  if (diff <= 7 * 86400000) return t('notifications.this_week');
  return t('notifications.older');
}

function timeAgo(dateStr: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const s = Math.floor((now - d) / 1000);
  if (s < 60) return t('notifications.just_now');
  if (s < 3600) return t('notifications.minutes_ago', { count: Math.floor(s / 60) });
  if (s < 86400) return t('notifications.hours_ago', { count: Math.floor(s / 3600) });
  if (s < 172800) return t('notifications.yesterday');
  return new Date(dateStr).toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

type GroupedNotifications = { label: string; items: Notification[] }[];

type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: {
    user_id: string;
    display_name: string | null;
    home_city: string | null;
  };
};

function groupNotifications(notifications: Notification[], t: (key: string) => string): GroupedNotifications {
  const order = [t('notifications.today'), t('notifications.yesterday'), t('notifications.this_week'), t('notifications.older')];
  const groups: Record<string, Notification[]> = {};
  for (const n of notifications) {
    const label = groupLabel(n.created_at, t);
    (groups[label] ??= []).push(n);
  }
  return order.filter(l => groups[l]?.length).map(label => ({ label, items: groups[label] }));
}

function filterNotifications(notifications: Notification[], filter: FilterKey): Notification[] {
  switch (filter) {
    case "unread": return notifications.filter(n => !n.is_read);
    case "friends": return notifications.filter(n => n.type === "friend_request" || n.type === "friend_accepted");
    case "events": return notifications.filter(n => n.type === "event_invite" || n.type === "event_reminder");
    default: return notifications;
  }
}

/* ── Page ── */
export default function Notifikationer() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { isLoggedIn, loading: authLoading, user } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loadingFriendRequests, setLoadingFriendRequests] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = filterNotifications(notifications, activeFilter);
  const grouped = groupNotifications(filtered, t);

  // Count today's notifications
  const todayCount = notifications.filter(n => {
    const diff = startOfDay(new Date()) - startOfDay(new Date(n.created_at));
    return diff <= 0;
  }).length;

  // Fetch pending friend requests
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    async function fetchPendingRequests() {
      setLoadingFriendRequests(true);
      try {
        const { data: requests, error } = await supabase
          .from("friend_requests")
          .select("id, sender_id, receiver_id, status, created_at")
          .eq("receiver_id", user!.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching friend requests:", error);
          setFriendRequests([]);
          return;
        }

        if (!requests || requests.length === 0) {
          setFriendRequests([]);
          return;
        }

        const requestsWithProfiles = await Promise.all(
          requests.map(async (req) => {
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("user_id, display_name, home_city")
              .eq("user_id", req.sender_id)
              .single();

            return {
              ...req,
              sender: profile || undefined,
            };
          })
        );

        setFriendRequests(requestsWithProfiles as FriendRequest[]);
      } catch (e) {
        console.error("Error in fetchPendingRequests:", e);
        setFriendRequests([]);
      }
      setLoadingFriendRequests(false);
    }

    fetchPendingRequests();
  }, [isLoggedIn, user]);

  function handleClick(n: Notification) {
    if (!n.is_read) markAsRead(n.id);
    const link = n.data?.link;
    if (link) setLocation(link);
  }

  async function handleAcceptFriend(reqId: string) {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", reqId);
      if (!error) setFriendRequests(prev => prev.filter(r => r.id !== reqId));
    } catch (e) {
      console.error("Error accepting friend request:", e);
    }
  }

  async function handleDeclineFriend(reqId: string) {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "declined" })
        .eq("id", reqId);
      if (!error) setFriendRequests(prev => prev.filter(r => r.id !== reqId));
    } catch (e) {
      console.error("Error declining friend request:", e);
    }
  }

  if (authLoading) {
    return (
      <div className="nt-root nt-center">
        <style>{notifikationerCSS}</style>
        <div className="nt-spinner" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="nt-root nt-center">
        <style>{notifikationerCSS}</style>
        <Inbox size={48} style={{ color: "rgba(255,255,255,0.15)" }} />
        <p className="nt-login-text">{t('notifications.login_to_see')}</p>
        <button
          onClick={() => setLocation("/auth")}
          className="nt-btn"
          style={{ marginTop: 16 }}
        >
          {t('notifications.log_in')}
        </button>
      </div>
    );
  }

  return (
    <div className="nt-root" ref={containerRef}>
      <style>{notifikationerCSS}</style>

      {/* Cover hero */}
      <div className="nt-cover">
        <img src="/notifikationer-hero.png" alt="" />
        <div className="nt-cover-overlay" />
      </div>

      {/* Identity */}
      <div className="nt-identity">
        <div className="nt-avatar">
          <Bell size={32} style={{ color: "rgba(255,255,255,0.7)" }} />
        </div>
        <h1 className="nt-identity-title"><em>Notifkationer</em></h1>
      </div>

      {/* Stat pills */}
      <div className="nt-pills">
        <div className="nt-pill">Ulæste: <strong>{unreadCount}</strong></div>
        <div className="nt-pill">I dag: <strong>{todayCount}</strong></div>
        <div className="nt-pill">Venneforespørgsler: <strong>{friendRequests.length}</strong></div>
      </div>

      {/* Filter chips */}
      <div className="nt-filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`nt-chip${activeFilter === f.key ? " active" : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="nt-content">
        {/* Friend request cards (shown in "all" or "friends" filter) */}
        {(activeFilter === "all" || activeFilter === "friends") &&
          !loadingFriendRequests && friendRequests.length > 0 && (
          <>
            {friendRequests.map(req => {
              const displayName = req.sender?.display_name || "Ukendt bruger";
              return (
                <button
                  key={req.id}
                  className="nt-card nt-card--unread nt-card--friend_request"
                  onClick={() => setLocation(`/profil/${req.sender_id}`)}
                >
                  <div className="nt-card-avatar nt-card-avatar--icon">
                    <UserPlus size={20} />
                  </div>
                  <div className="nt-card-body">
                    <p className="nt-card-text">{displayName} vil gerne være din ven.</p>
                    <p className="nt-card-time">{timeAgo(req.created_at, t)}</p>
                  </div>
                  <div className="nt-fr-actions" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleAcceptFriend(req.id)}
                      className="nt-card-action"
                      style={{ background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.2)", color: "#4ade80" }}
                    >
                      Accepter
                    </button>
                  </div>
                  <ChevronRight size={14} className="nt-card-chevron" />
                </button>
              );
            })}
          </>
        )}

        {/* Notifications */}
        {loading ? (
          <div className="nt-spinner-wrap">
            <div className="nt-spinner" />
          </div>
        ) : filtered.length === 0 && friendRequests.length === 0 ? (
          <div className="nt-empty">
            <div className="nt-empty-icon">
              <Bell size={28} style={{ color: "rgba(255,255,255,0.15)" }} />
            </div>
            <p className="nt-empty-title">{t('notifications.no_notifications')}</p>
            <p className="nt-empty-sub">{t('notifications.we_will_notify')}</p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.label} className="nt-group">
              <h2 className="nt-group-label">{group.label}</h2>
              {group.items.map(n => {
                const meta = TYPE_META[n.type] || TYPE_META.event_invite;
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    className={`nt-card nt-card--${n.type} ${n.is_read ? "nt-card--read" : "nt-card--unread"}`}
                    onClick={() => handleClick(n)}
                  >
                    <div className="nt-card-avatar nt-card-avatar--icon">
                      <Icon size={20} />
                    </div>
                    <div className="nt-card-body">
                      <p className="nt-card-text">{n.title}{n.body ? `: ${n.body}` : ""}</p>
                      <p className="nt-card-time">{timeAgo(n.created_at, t)}</p>
                    </div>
                    <span className="nt-card-action">{meta.action}</span>
                    <ChevronRight size={14} className="nt-card-chevron" />
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Ryd alle button */}
      {notifications.length > 0 && (
        <div className="nt-clear-all">
          <button onClick={markAllAsRead} className="nt-clear-btn">
            Ryd alle
          </button>
        </div>
      )}

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="nt-modal-overlay">
          <div className="nt-modal-content">
            <UserSearch open={showUserSearch} onClose={() => setShowUserSearch(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
