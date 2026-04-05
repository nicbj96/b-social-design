/**
 * NotificationBell — bell icon with unread badge + inline dropdown
 *
 * Shows the 10 most recent notifications in a popover without
 * leaving the current page. Clicking a notification navigates and
 * marks it as read. Used in the desktop sidebar.
 */

import { useRef, useState, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useNotifications } from "@/context/NotificationContext";
import type { Notification } from "@/context/NotificationContext";

/* ── CSS ──────────────────────────────────────────────────────────────────── */

const css = `
/* ── Bell button ── */
.nb-btn {
  position: relative; background: none; border: none; cursor: pointer;
  padding: 4px; border-radius: 10px; transition: background 0.2s;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.6);
}
.nb-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9); }
.nb-btn.has-unread { color: #4ecdc4; }
.nb-badge {
  position: absolute; top: -2px; right: -2px;
  min-width: 16px; height: 16px; padding: 0 4px;
  background: #ef4444; border-radius: 8px;
  font-size: 10px; font-weight: 700; color: #fff;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid var(--bg);
  animation: nbPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes nbPop {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}

/* ── Dropdown ── */
.nb-drop {
  position: absolute; left: 56px; top: 0; z-index: 9999;
  width: 320px; border-radius: 18px; overflow: hidden;
  background: rgba(15,20,27,0.97);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(78,205,196,0.06);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  animation: nbSlide 0.2s ease-out;
}
@keyframes nbSlide {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
.nb-drop-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.nb-drop-title {
  font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.8);
  display: flex; align-items: center; gap: 6px;
}
.nb-drop-title svg { color: #4ecdc4; }
.nb-mark-all {
  background: none; border: none; cursor: pointer;
  font-size: 11px; color: rgba(78,205,196,0.7); font-family: var(--sans);
  display: flex; align-items: center; gap: 4px; padding: 0;
  transition: color 0.2s;
}
.nb-mark-all:hover { color: #4ecdc4; }
.nb-mark-all svg { width: 11px; height: 11px; }

/* ── Notification items ── */
.nb-list { max-height: 400px; overflow-y: auto; }
.nb-list::-webkit-scrollbar { width: 4px; }
.nb-list::-webkit-scrollbar-track { background: transparent; }
.nb-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.nb-item {
  display: flex; gap: 12px; padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  cursor: pointer; transition: background 0.2s;
}
.nb-item:hover { background: rgba(255,255,255,0.04); }
.nb-item:last-child { border-bottom: none; }
.nb-item.unread { background: rgba(78,205,196,0.04); }
.nb-item.unread:hover { background: rgba(78,205,196,0.07); }
.nb-dot-wrap {
  padding-top: 4px; flex-shrink: 0;
}
.nb-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #4ecdc4; display: block;
}
.nb-dot.read { background: rgba(255,255,255,0.12); }
.nb-item-body { flex: 1; min-width: 0; }
.nb-item-title {
  font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85);
  margin: 0 0 3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.nb-item-body-text {
  font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.nb-item-time { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 4px; }

/* ── Footer ── */
.nb-footer {
  padding: 10px 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
  text-align: center;
}
.nb-footer-link {
  font-size: 12px; color: rgba(78,205,196,0.7); background: none; border: none;
  cursor: pointer; font-family: var(--sans); font-weight: 500; padding: 0;
  transition: color 0.2s;
}
.nb-footer-link:hover { color: #4ecdc4; }
.nb-empty {
  padding: 32px 16px; text-align: center;
  font-size: 13px; color: rgba(255,255,255,0.2);
}
`;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'Lige nu';
  if (diff < 3600)  return `${Math.floor(diff / 60)} min. siden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} t. siden`;
  const d = Math.floor(diff / 86400);
  return `${d} dag${d > 1 ? 'e' : ''} siden`;
}

/* ── Component ───────────────────────────────────────────────────────────── */

interface Props {
  /** Size passed to the Bell icon */
  size?: number;
}

export default function NotificationBell({ size = 20 }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleItemClick = async (n: Notification) => {
    if (!n.is_read) await markAsRead(n.id);
    const url = n.data?.url as string | undefined;
    if (url) {
      setLocation(url);
    } else if (n.data?.event_id) {
      setLocation(`/event/${n.data.event_id}`);
    } else {
      setLocation('/notifikationer');
    }
    setOpen(false);
  };

  const recent = notifications.slice(0, 10);

  return (
    <>
      <style>{css}</style>
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <button
          className={`nb-btn${unreadCount > 0 ? ' has-unread' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={`Notifikationer${unreadCount > 0 ? ` (${unreadCount} ulæste)` : ''}`}
        >
          <Bell size={size} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="nb-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        {open && (
          <div className="nb-drop">
            {/* Header */}
            <div className="nb-drop-header">
              <span className="nb-drop-title">
                <Bell size={14} />
                Notifikationer
              </span>
              {unreadCount > 0 && (
                <button className="nb-mark-all" onClick={() => markAllAsRead()}>
                  <CheckCheck />
                  Markér alle som læst
                </button>
              )}
            </div>

            {/* List */}
            <div className="nb-list">
              {recent.length === 0 ? (
                <p className="nb-empty">Ingen notifikationer endnu</p>
              ) : (
                recent.map((n) => (
                  <div
                    key={n.id}
                    className={`nb-item${!n.is_read ? ' unread' : ''}`}
                    onClick={() => handleItemClick(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleItemClick(n)}
                  >
                    <div className="nb-dot-wrap">
                      <span className={`nb-dot${n.is_read ? ' read' : ''}`} />
                    </div>
                    <div className="nb-item-body">
                      <p className="nb-item-title">{n.title}</p>
                      {n.body && <p className="nb-item-body-text">{n.body}</p>}
                      <p className="nb-item-time">{relTime(n.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="nb-footer">
              <button
                className="nb-footer-link"
                onClick={() => { setLocation('/notifikationer'); setOpen(false); }}
              >
                Se alle notifikationer →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
