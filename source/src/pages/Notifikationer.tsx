import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  Bell, BellRing, Calendar, MessageCircle, UserPlus, UserCheck, Tag, ChevronRight, CheckCheck, Inbox, Search, Check, X,
} from "lucide-react";
import { useNotifications, type Notification, type NotificationType } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/lib/supabase";
import UserSearch from "@/components/UserSearch";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const notifikationerCSS = `
${pageBase("nf")}

/* ── Header ── */
.nf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 24px 20px;
}
.nf-title {
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 400;
  color: var(--pg-white);
  line-height: 1.1;
}
.nf-title-accent {
  color: var(--teal);
  font-style: italic;
}
.nf-unread-count {
  font-size: 12px;
  color: var(--pg-white-muted);
  margin-top: 4px;
}
.nf-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nf-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pg-white-dim);
  cursor: pointer;
  transition: all 0.25s;
  backdrop-filter: blur(12px);
}
.nf-icon-btn:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  color: var(--teal);
}
.nf-mark-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--pg-white-dim);
  font-size: 12px;
  font-family: var(--sans);
  cursor: pointer;
  transition: all 0.25s;
  backdrop-filter: blur(12px);
}
.nf-mark-all-btn:hover {
  background: var(--teal-dim);
  border-color: rgba(78,205,196,0.25);
  color: var(--teal);
}

/* ── Content area ── */
.nf-content {
  padding: 0 16px 96px;
}

/* ── Section label ── */
.nf-section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--pg-white-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 0 8px;
  margin-bottom: 12px;
  font-family: var(--sans);
}

/* ── Group ── */
.nf-group {
  margin-bottom: 28px;
}
.nf-group-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── Notification row ── */
.nf-row {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: var(--sans);
}
.nf-row:hover {
  background: var(--glass-bg);
}
.nf-row--read {
  opacity: 0.5;
}
.nf-row--read:hover {
  opacity: 0.75;
}

/* Type-specific icon containers */
.nf-row-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.25s;
}
.nf-row:hover .nf-row-icon {
  transform: scale(1.05);
}

/* Type accents */
.nf-type-event_invite .nf-row-icon    { background: rgba(78,205,196,0.12); color: #4ECDC4; }
.nf-type-friend_request .nf-row-icon  { background: rgba(192,132,252,0.12); color: #c084fc; }
.nf-type-friend_accepted .nf-row-icon { background: rgba(74,222,128,0.12); color: #4ade80; }
.nf-type-new_message .nf-row-icon     { background: rgba(96,165,250,0.12); color: #60a5fa; }
.nf-type-event_reminder .nf-row-icon  { background: rgba(251,191,36,0.12); color: #fbbf24; }
.nf-type-tag_match .nf-row-icon       { background: rgba(249,115,22,0.12); color: #f97316; }

/* Left accent bar on unread */
.nf-type-event_invite.nf-row--unread    { border-left: 2px solid rgba(78,205,196,0.5); }
.nf-type-friend_request.nf-row--unread  { border-left: 2px solid rgba(192,132,252,0.5); }
.nf-type-friend_accepted.nf-row--unread { border-left: 2px solid rgba(74,222,128,0.5); }
.nf-type-new_message.nf-row--unread     { border-left: 2px solid rgba(96,165,250,0.5); }
.nf-type-event_reminder.nf-row--unread  { border-left: 2px solid rgba(251,191,36,0.5); }
.nf-type-tag_match.nf-row--unread       { border-left: 2px solid rgba(249,115,22,0.5); }

.nf-row-body {
  flex: 1;
  min-width: 0;
}
.nf-row-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nf-row-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--pg-white);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nf-row--read .nf-row-title {
  color: var(--pg-white-dim);
}
.nf-row-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--teal);
  flex-shrink: 0;
  box-shadow: 0 0 8px var(--teal-glow);
}
.nf-row-body-text {
  font-size: 12px;
  color: var(--pg-white-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
  line-height: 1.4;
}
.nf-row-time {
  font-size: 11px;
  color: rgba(255,255,255,0.18);
  margin-top: 4px;
}
.nf-row-chevron {
  color: rgba(255,255,255,0.15);
  flex-shrink: 0;
  margin-top: 12px;
  transition: transform 0.2s;
}
.nf-row:hover .nf-row-chevron {
  transform: translateX(2px);
  color: var(--pg-white-muted);
}

/* ── Friend requests ── */
.nf-fr-section {
  margin-bottom: 32px;
}
.nf-fr-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.nf-fr-card {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  transition: all 0.25s;
}
.nf-fr-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}
.nf-fr-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}
.nf-fr-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--pg-white);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nf-fr-city {
  font-size: 12px;
  color: var(--pg-white-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nf-fr-time {
  font-size: 11px;
  color: rgba(255,255,255,0.18);
  margin-top: 3px;
}
.nf-fr-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.nf-fr-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.25s;
}
.nf-fr-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.nf-fr-btn--accept {
  background: rgba(74,222,128,0.15);
  color: #4ade80;
  border: 1px solid rgba(74,222,128,0.2);
}
.nf-fr-btn--accept:hover:not(:disabled) {
  background: rgba(74,222,128,0.25);
  border-color: rgba(74,222,128,0.4);
  box-shadow: 0 4px 16px rgba(74,222,128,0.2);
  transform: translateY(-1px);
}
.nf-fr-btn--decline {
  background: rgba(248,113,113,0.15);
  color: #f87171;
  border: 1px solid rgba(248,113,113,0.2);
}
.nf-fr-btn--decline:hover:not(:disabled) {
  background: rgba(248,113,113,0.25);
  border-color: rgba(248,113,113,0.4);
  box-shadow: 0 4px 16px rgba(248,113,113,0.2);
  transform: translateY(-1px);
}

/* ── Empty state ── */
.nf-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
.nf-empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.nf-empty-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--pg-white-dim);
}
.nf-empty-sub {
  font-size: 12px;
  color: var(--pg-white-muted);
  margin-top: 4px;
}

/* ── Loading spinner ── */
.nf-spinner-wrap {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
.nf-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(78,205,196,0.2);
  border-top-color: var(--teal);
  border-radius: 50%;
  animation: nf-spin 0.75s linear infinite;
}
@keyframes nf-spin {
  to { transform: rotate(360deg); }
}

/* ── Auth states ── */
.nf-center {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
}
.nf-login-text {
  font-size: 14px;
  color: var(--pg-white-dim);
  margin-top: 16px;
}

/* ── Modal overlay ── */
.nf-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}
.nf-modal-content {
  background: var(--bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header teal line ── */
.nf-header-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--teal), transparent);
  opacity: 0.4;
  margin: 0 24px;
}
`;

/* ── Icon + color per notification type ── */
const TYPE_META: Record<NotificationType, { icon: typeof Bell }> = {
  event_invite:    { icon: Calendar },
  friend_request:  { icon: UserPlus },
  friend_accepted: { icon: UserCheck },
  new_message:     { icon: MessageCircle },
  event_reminder:  { icon: BellRing },
  tag_match:       { icon: Tag },
};

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
    id: string;
    name: string | null;
    city: string | null;
    avatar_url: string | null;
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

/* ── Single notification row ── */
function NotificationRow({ n, onClick }: { n: Notification; onClick: () => void }) {
  const { t } = useTranslation();
  const meta = TYPE_META[n.type] || TYPE_META.event_invite;
  const Icon = meta.icon;

  return (
    <button
      onClick={onClick}
      className={`nf-row nf-type-${n.type} ${n.is_read ? "nf-row--read" : "nf-row--unread"}`}
    >
      <div className="nf-row-icon">
        <Icon size={18} />
      </div>
      <div className="nf-row-body">
        <div className="nf-row-title-row">
          <p className="nf-row-title">{n.title}</p>
          {!n.is_read && <span className="nf-row-dot" />}
        </div>
        <p className="nf-row-body-text">{n.body}</p>
        <p className="nf-row-time">{timeAgo(n.created_at, t)}</p>
      </div>
      <ChevronRight size={14} className="nf-row-chevron" />
    </button>
  );
}

/* ── Friend request card ── */
function FriendRequestCard({ req, onUpdate }: { req: FriendRequest; onUpdate: () => void }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [updating, setUpdating] = useState(false);

  const displayName = req.sender?.display_name || "Ukendt bruger";
  const displayCity = req.sender?.home_city || "";

  async function handleAccept() {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", req.id);
      if (!error) {
        onUpdate();
      }
    } catch (e) {
      console.error("Error accepting friend request:", e);
    }
    setUpdating(false);
  }

  async function handleDecline() {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "declined" })
        .eq("id", req.id);
      if (!error) {
        onUpdate();
      }
    } catch (e) {
      console.error("Error declining friend request:", e);
    }
    setUpdating(false);
  }

  return (
    <div className="nf-fr-card">
      <div
        className="nf-fr-info"
        onClick={() => setLocation(`/profil/${req.sender_id}`)}
      >
        <p className="nf-fr-name">{displayName}</p>
        {displayCity && <p className="nf-fr-city">{displayCity}</p>}
        <p className="nf-fr-time">{timeAgo(req.created_at, t)}</p>
      </div>
      <div className="nf-fr-actions">
        <button
          onClick={handleAccept}
          disabled={updating}
          className="nf-fr-btn nf-fr-btn--accept"
          title={t('notifications.accept') || 'Accepter'}
        >
          <Check size={16} />
        </button>
        <button
          onClick={handleDecline}
          disabled={updating}
          className="nf-fr-btn nf-fr-btn--decline"
          title={t('notifications.decline') || 'Afvis'}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
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
  const containerRef = useFadeUp("nf");

  const grouped = groupNotifications(notifications, t);

  // Fetch pending friend requests
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    async function fetchPendingRequests() {
      setLoadingFriendRequests(true);
      try {
        const { data: requests, error } = await supabase
          .from("friend_requests")
          .select("id, sender_id, receiver_id, status, created_at")
          .eq("receiver_id", user.id)
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

        // Fetch sender profiles
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

        setFriendRequests(requestsWithProfiles);
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

  if (authLoading) {
    return (
      <div className="nf-root nf-center">
        <style>{notifikationerCSS}</style>
        <div className="nf-spinner" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="nf-root nf-center">
        <style>{notifikationerCSS}</style>
        <Inbox size={48} style={{ color: "rgba(255,255,255,0.15)" }} />
        <p className="nf-login-text">{t('notifications.login_to_see')}</p>
        <button
          onClick={() => setLocation("/auth")}
          className="nf-btn"
          style={{ marginTop: 16 }}
        >
          {t('notifications.log_in')}
        </button>
      </div>
    );
  }

  return (
    <div className="nf-root" ref={containerRef}>
      <style>{notifikationerCSS}</style>

      {/* Header */}
      <div className="nf-header nf-fade-up">
        <div>
          <h1 className="nf-title">
            {t('notifications.title')}<span className="nf-title-accent">.</span>
          </h1>
          {unreadCount > 0 && (
            <p className="nf-unread-count">{unreadCount} {t('notifications.unread')}</p>
          )}
        </div>
        <div className="nf-header-actions">
          <button
            onClick={() => setShowUserSearch(true)}
            className="nf-icon-btn"
            title={t('notifications.search_users') || 'Sog brugere'}
          >
            <Search size={18} />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="nf-mark-all-btn">
              <CheckCheck size={14} />
              {t('notifications.mark_all_read')}
            </button>
          )}
        </div>
      </div>

      <div className="nf-header-line nf-fade-up nf-d1" />

      {/* Content */}
      <div className="nf-content">
        {/* Friend Requests Section */}
        {!loadingFriendRequests && friendRequests.length > 0 && (
          <div className="nf-fr-section nf-fade-up nf-d2">
            <h2 className="nf-section-label">
              {t('notifications.friend_requests') || 'Venneanmodninger'}
            </h2>
            <div className="nf-fr-list">
              {friendRequests.map(req => (
                <FriendRequestCard
                  key={req.id}
                  req={req}
                  onUpdate={() => {
                    setFriendRequests(prev => prev.filter(r => r.id !== req.id));
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {loading ? (
          <div className="nf-spinner-wrap">
            <div className="nf-spinner" />
          </div>
        ) : notifications.length === 0 && friendRequests.length === 0 ? (
          <div className="nf-empty nf-fade-up nf-d2">
            <div className="nf-empty-icon">
              <Bell size={28} style={{ color: "rgba(255,255,255,0.15)" }} />
            </div>
            <p className="nf-empty-title">{t('notifications.no_notifications')}</p>
            <p className="nf-empty-sub">{t('notifications.we_will_notify')}</p>
          </div>
        ) : (
          grouped.map((group, gi) => (
            <div key={group.label} className={`nf-group nf-fade-up nf-d${Math.min(gi + 2, 4)}`}>
              <h2 className="nf-section-label">{group.label}</h2>
              <div className="nf-group-items">
                {group.items.map(n => (
                  <NotificationRow key={n.id} n={n} onClick={() => handleClick(n)} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="nf-modal-overlay">
          <div className="nf-modal-content">
            <UserSearch onClose={() => setShowUserSearch(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
