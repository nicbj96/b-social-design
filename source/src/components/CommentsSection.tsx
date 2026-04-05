/**
 * CommentsSection — shared component for EventDetail and StedDetail
 *
 * Props:
 *   entityType: 'event' | 'place'
 *   entityId:   string (UUID)
 *
 * Queries:  comments table joined with profiles (name, avatar_url)
 * Inserts:  authenticated users only — anon users see a login prompt
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface CommentRow {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles: {
    name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

/* ── Scoped CSS ───────────────────────────────────────────────────────────── */

const css = `
.cs-wrap {
  margin-bottom: 32px;
}
.cs-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
}
.cs-header svg { color: var(--teal); width: 16px; height: 16px; }
.cs-title {
  font-size: 12px; font-weight: 600; color: var(--teal);
  text-transform: uppercase; letter-spacing: 1.5px;
}

/* ── Input row ── */
.cs-input-row {
  display: flex; gap: 10px; margin-bottom: 20px; align-items: flex-end;
}
.cs-textarea {
  flex: 1; padding: 12px 14px; border-radius: 14px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9); font-size: 14px;
  font-family: var(--sans); resize: none; outline: none;
  transition: all 0.25s; line-height: 1.5; min-height: 44px;
}
.cs-textarea:focus {
  background: rgba(255,255,255,0.08);
  border-color: rgba(78,205,196,0.4);
  box-shadow: 0 0 0 3px rgba(78,205,196,0.08);
}
.cs-textarea::placeholder { color: rgba(255,255,255,0.3); }
.cs-send-btn {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: var(--teal); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.25s; color: var(--bg);
}
.cs-send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px var(--teal-glow); }
.cs-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cs-send-btn svg { width: 16px; height: 16px; }

/* ── Login prompt ── */
.cs-login-prompt {
  padding: 14px 18px; border-radius: 14px;
  background: rgba(78,205,196,0.06); border: 1px solid rgba(78,205,196,0.12);
  font-size: 13px; color: var(--pg-white-dim);
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.cs-login-link {
  font-size: 13px; font-weight: 600; color: var(--teal);
  background: none; border: none; cursor: pointer; padding: 0;
  font-family: var(--sans);
}
.cs-login-link:hover { text-decoration: underline; }

/* ── Comment list ── */
.cs-list { display: flex; flex-direction: column; gap: 12px; }
.cs-comment {
  display: flex; gap: 10px; align-items: flex-start;
}
.cs-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: rgba(78,205,196,0.12); border: 1px solid rgba(78,205,196,0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: var(--teal); overflow: hidden;
}
.cs-avatar img { width: 100%; height: 100%; object-fit: cover; }
.cs-body { flex: 1; min-width: 0; }
.cs-meta {
  display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
}
.cs-name { font-size: 13px; font-weight: 600; color: var(--pg-white); }
.cs-time { font-size: 11px; color: rgba(255,255,255,0.3); }
.cs-text {
  font-size: 14px; color: var(--pg-white-dim); line-height: 1.6;
  word-break: break-word;
}
.cs-delete-btn {
  padding: 4px; border-radius: 6px; background: none; border: none;
  color: rgba(255,255,255,0.15); cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center;
}
.cs-delete-btn:hover { color: #f87171; background: rgba(239,68,68,0.08); }
.cs-delete-btn svg { width: 12px; height: 12px; }

/* ── Empty / loading states ── */
.cs-empty {
  font-size: 13px; color: rgba(255,255,255,0.2);
  text-align: center; padding: 16px 0;
}
.cs-loading {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: rgba(255,255,255,0.25);
  padding: 8px 0;
}
.cs-loading svg { animation: spin 1s linear infinite; width: 14px; height: 14px; }
@keyframes spin { to { transform: rotate(360deg); } }
`;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatRelative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return 'Lige nu';
  if (diff < 3600) return `${Math.floor(diff / 60)} min. siden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} t. siden`;
  return new Date(iso).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

/* ── Component ───────────────────────────────────────────────────────────── */

interface Props {
  entityType: 'event' | 'place';
  entityId: string;
}

export default function CommentsSection({ entityType, entityId }: Props) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [comments, setComments]   = useState<CommentRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [text, setText]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Load comments ──────────────────────────────────────────────────────
  const loadComments = async () => {
    const col = entityType === 'event' ? 'event_id' : 'place_id';
    const { data, error } = await supabase
      .from('comments')
      .select('id, content, user_id, created_at, profiles(name, full_name, avatar_url)')
      .eq(col, entityId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) {
      setComments(data as unknown as CommentRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (entityId) loadComments();
  }, [entityId, entityType]);

  // ── Auto-grow textarea ─────────────────────────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user || !text.trim() || submitting) return;
    setSubmitting(true);

    const col = entityType === 'event' ? 'event_id' : 'place_id';
    const { error } = await supabase.from('comments').insert({
      [col]: entityId,
      user_id: user.id,
      content: text.trim(),
    });

    if (!error) {
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      await loadComments();
    }
    setSubmitting(false);
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  // ── Key handler ────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="cs-wrap">
        {/* Header */}
        <div className="cs-header">
          <MessageCircle />
          <span className="cs-title">
            Kommentarer {comments.length > 0 && `(${comments.length})`}
          </span>
        </div>

        {/* Input or login prompt */}
        {user ? (
          <div className="cs-input-row">
            <textarea
              ref={textareaRef}
              className="cs-textarea"
              placeholder="Skriv en kommentar… (Ctrl+Enter for at sende)"
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="cs-send-btn"
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              aria-label="Send kommentar"
            >
              {submitting
                ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
                : <Send />}
            </button>
          </div>
        ) : (
          <div className="cs-login-prompt">
            <span>Log ind for at kommentere</span>
            <button
              className="cs-login-link"
              onClick={() => {
                sessionStorage.setItem('returnTo', window.location.pathname);
                setLocation('/auth');
              }}
            >
              Log ind →
            </button>
          </div>
        )}

        {/* Comment list */}
        {loading ? (
          <div className="cs-loading">
            <Loader2 /> Henter kommentarer…
          </div>
        ) : comments.length === 0 ? (
          <p className="cs-empty">Ingen kommentarer endnu — vær den første!</p>
        ) : (
          <div className="cs-list">
            {comments.map((c) => {
              const profile = c.profiles;
              const name = profile?.full_name || profile?.name || 'Anonym';
              const initials = name.charAt(0).toUpperCase();
              const isOwn = user?.id === c.user_id;

              return (
                <div key={c.id} className="cs-comment">
                  {/* Avatar */}
                  <div className="cs-avatar">
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt={name} />
                      : initials}
                  </div>

                  {/* Body */}
                  <div className="cs-body">
                    <div className="cs-meta">
                      <span className="cs-name">{name}</span>
                      <span className="cs-time">{formatRelative(c.created_at)}</span>
                      {isOwn && (
                        <button
                          className="cs-delete-btn"
                          onClick={() => handleDelete(c.id)}
                          aria-label="Slet kommentar"
                        >
                          <Trash2 />
                        </button>
                      )}
                    </div>
                    <p className="cs-text">{c.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
