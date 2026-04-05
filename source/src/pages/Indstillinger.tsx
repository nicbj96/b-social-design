import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings, Bell, Shield, Globe, Moon, ChevronRight,
  User, Mail, Trash2, Pencil, LogOut, MapPin, Smartphone, MessageSquare,
  Camera, Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { MinSideSubNav } from "@/components/MinSideSubNav";
import { pageBase } from "@/lib/pageCSSBase";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { usePushNotifications } from "@/hooks/usePushNotifications";

/* ── Scoped CSS ── */
const indstillingerCSS = `${pageBase("is")}

/* ── Back nav ── */
.is-back {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 16px 20px 8px; color: var(--teal); font-size: 14px;
  font-weight: 500; text-decoration: none; font-family: var(--sans);
  transition: opacity 0.2s;
}
.is-back:hover { opacity: 0.75; }

/* ── Header ── */
.is-header {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px 20px;
}
.is-header-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(78,205,196,0.12); border: 1px solid rgba(78,205,196,0.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.is-header-icon svg { color: var(--teal); }
.is-header-title {
  font-family: var(--serif); font-size: 26px; font-weight: 400;
  color: var(--pg-white); margin: 0; letter-spacing: -0.5px;
}

/* ── Content area ── */
.is-content {
  padding: 0 20px 40px; display: flex; flex-direction: column; gap: 20px;
}

/* ── Profile card ── */
.is-profile-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px; border-radius: 16px;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  cursor: pointer; transition: background 0.3s, border-color 0.3s;
  text-decoration: none;
}
.is-profile-card:hover {
  background: var(--glass-bg-hover); border-color: var(--glass-border-hover);
}
.is-profile-avatar {
  width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, rgba(78,205,196,0.2), rgba(147,197,253,0.15));
  border: 2px solid rgba(78,205,196,0.35);
  box-shadow: 0 0 20px rgba(78,205,196,0.15);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--serif); font-size: 20px; color: var(--teal);
}
.is-profile-info { flex: 1; min-width: 0; }
.is-profile-name {
  font-size: 16px; font-weight: 600; color: var(--pg-white); margin: 0;
}
.is-profile-email {
  font-size: 12px; color: var(--pg-white-muted); margin: 2px 0 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.is-profile-city {
  font-size: 12px; color: rgba(78,205,196,0.8); margin: 2px 0 0;
  display: flex; align-items: center; gap: 4px;
}
.is-profile-chevron { color: rgba(255,255,255,0.25); flex-shrink: 0; }
.is-profile-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

/* ── Avatar upload ── */
.is-avatar-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 16px 16px 0;
}
.is-avatar-btn {
  position: relative; cursor: pointer; border-radius: 50%;
  display: inline-block;
}
.is-avatar-big {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(78,205,196,0.2), rgba(147,197,253,0.15));
  border: 2px solid rgba(78,205,196,0.35);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--serif); font-size: 26px; color: var(--teal);
  overflow: hidden; transition: opacity 0.2s;
}
.is-avatar-big img { width: 100%; height: 100%; object-fit: cover; }
.is-avatar-big:hover { opacity: 0.8; }
.is-avatar-overlay {
  position: absolute; bottom: 0; right: 0;
  width: 24px; height: 24px; border-radius: 50%;
  background: #4ecdc4; border: 2px solid var(--bg);
  display: flex; align-items: center; justify-content: center;
  color: #0d1117;
}
.is-avatar-overlay svg { width: 11px; height: 11px; }
.is-avatar-uploading {
  font-size: 12px; color: rgba(255,255,255,0.4);
  display: flex; align-items: center; gap: 5px;
}
.is-avatar-uploading svg { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Section card ── */
.is-card {
  border-radius: 16px; overflow: hidden;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
}
.is-card-title {
  font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4);
  text-transform: uppercase; letter-spacing: 2px;
  padding: 16px 16px 0; margin: 0;
}

/* ── Row ── */
.is-row {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: transparent; border: none;
  cursor: pointer; transition: background 0.2s;
  font-family: var(--sans); text-align: left;
}
.is-row:hover { background: rgba(255,255,255,0.04); }
.is-row + .is-row { border-top: 1px solid rgba(255,255,255,0.05); }
.is-row-label {
  flex: 1; font-size: 14px; font-weight: 500;
  color: rgba(255,255,255,0.85);
}
.is-row-label--danger { color: #f87171; }

/* ── Toggle switch (CSS-only) ── */
.is-toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
.is-toggle-track {
  position: relative; width: 44px; height: 26px;
  border-radius: 13px; flex-shrink: 0; cursor: pointer;
  transition: background 0.25s ease;
}
.is-toggle-track--on { background: var(--teal); }
.is-toggle-track--off { background: rgba(255,255,255,0.15); }
.is-toggle-thumb {
  position: absolute; top: 3px; width: 20px; height: 20px;
  border-radius: 50%; background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
}
.is-toggle-thumb--on { transform: translateX(21px); }
.is-toggle-thumb--off { transform: translateX(3px); }

/* ── Language selector buttons ── */
.is-lang-row { padding: 14px 16px; }
.is-lang-buttons {
  display: flex; gap: 8px; margin-top: 10px;
}
.is-lang-btn {
  flex: 1; padding: 10px 16px; border-radius: 12px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: var(--sans); transition: all 0.25s;
  border: 1.5px solid transparent; text-align: center;
}
.is-lang-btn--active {
  background: rgba(78,205,196,0.2); color: #fff;
  border-color: rgba(78,205,196,0.5);
  box-shadow: 0 0 12px rgba(78,205,196,0.2);
}
.is-lang-btn--inactive {
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5);
  border-color: rgba(255,255,255,0.08);
}
.is-lang-btn--inactive:hover {
  background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7);
}

/* ── Danger row ── */
.is-row-icon--danger { color: #f87171; }

/* ── Edit panels ── */
.is-edit-panel { padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }
.is-edit-label {
  display: block; font-size: 11px; color: rgba(255,255,255,0.4);
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;
}
.is-edit-input {
  width: 100%; padding: 10px 14px; border-radius: 12px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9); font-size: 14px;
  font-family: var(--sans); outline: none; transition: border-color 0.25s;
}
.is-edit-input:focus { border-color: rgba(78,205,196,0.5); }
.is-edit-input::placeholder { color: rgba(255,255,255,0.3); }
.is-edit-input--danger {
  background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.2);
}
.is-edit-input--danger:focus { border-color: rgba(239,68,68,0.5); }

.is-msg { font-size: 12px; }
.is-msg--ok { color: var(--teal); }
.is-msg--err { color: #f87171; }
.is-msg--warn { color: #fbbf24; }

.is-btn-row { display: flex; gap: 8px; }
.is-btn-cancel {
  flex: 1; padding: 10px 14px; border-radius: 12px;
  background: rgba(255,255,255,0.05); border: none;
  color: rgba(255,255,255,0.5); font-size: 14px;
  font-family: var(--sans); cursor: pointer; transition: background 0.2s;
}
.is-btn-cancel:hover { background: rgba(255,255,255,0.08); }
.is-btn-save {
  flex: 1; padding: 10px 14px; border-radius: 12px;
  background: var(--teal); border: none;
  color: var(--bg); font-size: 14px; font-weight: 600;
  font-family: var(--sans); cursor: pointer; transition: all 0.25s;
}
.is-btn-save:hover { box-shadow: 0 4px 20px var(--teal-glow); }
.is-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.is-btn-delete {
  flex: 1; padding: 10px 14px; border-radius: 12px;
  background: #ef4444; border: none;
  color: #fff; font-size: 14px; font-weight: 600;
  font-family: var(--sans); cursor: pointer; transition: all 0.25s;
}
.is-btn-delete:hover { background: #dc2626; }
.is-btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Delete confirm modal ── */
.is-modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; animation: is-overlay-in 0.25s ease;
}
@keyframes is-overlay-in { from { opacity: 0; } to { opacity: 1; } }
.is-modal {
  background: #0d1117; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px; padding: 24px; max-width: 380px; width: 100%;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  animation: is-modal-in 0.3s cubic-bezier(0.23,1,0.32,1);
}
@keyframes is-modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.is-modal-title {
  font-family: var(--serif); font-size: 22px; font-weight: 400;
  color: #f87171; margin: 0 0 8px;
}
.is-modal-desc {
  font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;
  margin: 0 0 20px;
}

/* ── Footer ── */
.is-footer {
  text-align: center; padding: 8px 0 32px;
}
.is-footer p {
  font-size: 12px; color: rgba(255,255,255,0.2); margin: 0; line-height: 1.8;
}
`;

/* ── Toggle component (CSS-only checkbox) ── */
function Toggle({ id, enabled, onToggle }: { id: string; enabled: boolean; onToggle: () => void }) {
  return (
    <label htmlFor={id} style={{ display: "inline-block", lineHeight: 0 }}>
      <input
        type="checkbox"
        id={id}
        className="is-toggle-input"
        checked={enabled}
        onChange={onToggle}
      />
      <div className={`is-toggle-track ${enabled ? "is-toggle-track--on" : "is-toggle-track--off"}`}>
        <div className={`is-toggle-thumb ${enabled ? "is-toggle-thumb--on" : "is-toggle-thumb--off"}`} />
      </div>
    </label>
  );
}

/* ── Toggle row ── */
function ToggleRow({ label, enabled, onToggle, id }: {
  label: string; enabled: boolean; onToggle: () => void; id: string;
}) {
  return (
    <div className="is-row" style={{ cursor: "default" }}>
      <span className="is-row-label">{label}</span>
      <Toggle id={id} enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

/* ── Edit Profile Section ── */
function EditProfileSection({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { profile, user, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [city, setCity] = useState(profile?.city || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Foto er for stort (maks 5 MB)");
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setMessage("Kun JPEG, PNG, WEBP og GIF er tilladt");
      return;
    }

    setAvatarUploading(true);
    setMessage("");

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      setMessage("Upload fejlede: " + upErr.message);
      setAvatarUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (dbErr) {
      setMessage("Kunne ikke gemme foto: " + dbErr.message);
    } else {
      setAvatarUrl(publicUrl);
      await refreshProfile();
    }
    setAvatarUploading(false);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), city: city.trim() })
      .eq("id", user.id);

    if (error) {
      setMessage(t("settings.error_prefix") + error.message);
    } else {
      setMessage(t("settings.profile_updated"));
      await refreshProfile();
      setTimeout(() => { setMessage(""); onClose(); }, 1500);
    }
    setSaving(false);
  };

  const initials = (profile?.display_name || profile?.name || "?")[0]?.toUpperCase();

  return (
    <div className="is-edit-panel">
      {/* ── Avatar upload ── */}
      <div className="is-avatar-wrap">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />
        <button
          className="is-avatar-btn"
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          disabled={avatarUploading}
          aria-label="Skift profilfoto"
        >
          <div className="is-avatar-big">
            {avatarUrl
              ? <img src={avatarUrl} alt="Avatar" />
              : initials}
          </div>
          <span className="is-avatar-overlay">
            {avatarUploading ? <Loader2 /> : <Camera />}
          </span>
        </button>
        {avatarUploading && (
          <span className="is-avatar-uploading">
            <Loader2 size={12} /> Uploader foto…
          </span>
        )}
      </div>

      <div>
        <label className="is-edit-label">{t("settings.name_label")}</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="is-edit-input" placeholder={t("settings.name_placeholder")}
        />
      </div>
      <div>
        <label className="is-edit-label">{t("settings.city_label")}</label>
        <input
          type="text" value={city} onChange={(e) => setCity(e.target.value)}
          className="is-edit-input" placeholder={t("settings.city_placeholder")}
        />
      </div>
      {message && (
        <p className={`is-msg ${message.startsWith("Fejl") || message.startsWith("Upload") || message.startsWith("Foto") || message.startsWith("Kun") || message.startsWith("Kunne") ? "is-msg--err" : "is-msg--ok"}`}>{message}</p>
      )}
      <div className="is-btn-row">
        <button onClick={onClose} className="is-btn-cancel">{t("settings.cancel")}</button>
        <button onClick={handleSave} disabled={saving} className="is-btn-save">
          {saving ? t("settings.saving") : t("settings.save")}
        </button>
      </div>
    </div>
  );
}

/* ── Delete Account Section ── */
function DeleteAccountSection() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "SLET") {
      setMessage(t("settings.write_delete_confirm"));
      return;
    }
    if (!user?.id) return;
    setDeleting(true);
    setMessage("");

    try {
      await supabase.from("notifications").delete().eq("user_id", user.id);
      await supabase.from("conversation_participants").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      setMessage(t("settings.account_deleted"));
      setTimeout(async () => { await signOut(); }, 2000);
    } catch {
      setMessage(t("settings.delete_error"));
    }
    setDeleting(false);
  };

  if (!confirmOpen) {
    return (
      <button onClick={() => setConfirmOpen(true)} className="is-row">
        <Trash2 size={16} className="is-row-icon--danger" />
        <span className="is-row-label is-row-label--danger">{t("settings.delete_account")}</span>
      </button>
    );
  }

  return (
    <div
      className="is-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) { setConfirmOpen(false); setConfirmText(""); setMessage(""); }
      }}
    >
      <div className="is-modal">
        <p className="is-modal-title">{t("settings.delete_account")}</p>
        <p className="is-modal-desc">{t("settings.delete_warning")}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label className="is-edit-label">{t("settings.delete_confirm_label")}</label>
            <input
              type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              className="is-edit-input is-edit-input--danger" placeholder="SLET"
            />
          </div>
          {message && (
            <p className={`is-msg ${message.startsWith("Fejl") ? "is-msg--err" : "is-msg--warn"}`}>{message}</p>
          )}
          <div className="is-btn-row">
            <button
              onClick={() => { setConfirmOpen(false); setConfirmText(""); setMessage(""); }}
              className="is-btn-cancel"
            >
              {t("settings.cancel")}
            </button>
            <button onClick={handleDelete} disabled={deleting || confirmText !== "SLET"} className="is-btn-delete">
              {deleting ? t("settings.deleting") : t("settings.delete_permanent")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Main Indstillinger page
   ══════════════════════════════════════ */
export default function Indstillinger() {
  const { t, i18n } = useTranslation();
  const { signOut, user, profile } = useAuth();

  /* ── Push notifications (real) ── */
  const { state: pushState, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications();
  const pushEnabled = pushState === "subscribed";
  const pushDisabled = pushState === "loading" || pushState === "unsupported" || pushState === "denied";

  /* ── Local toggle states ── */
  // pushNotif replaced by real hook above
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [profilSynlig, setProfilSynlig] = useState(true);
  const [placeringDeling, setPlaceringDeling] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  /* ── Language ── */
  const STORAGE_KEY = "b-social-language";
  const [lang, setLang] = useState<"da" | "en">(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as "da" | "en" | null;
    return saved && ["da", "en"].includes(saved) ? saved : "da";
  });

  const changeLang = useCallback((code: "da" | "en") => {
    setLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, [i18n]);

  /* ── User info ── */
  const displayName = profile?.name || user?.email?.split("@")[0] || "Bruger";
  const userEmail = profile?.email || user?.email || "";
  const userCity = profile?.city || "";

  /* ── Intersection observer for fade-up ── */
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll(".is-fade-up");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{indstillingerCSS}</style>
      <div ref={rootRef} className="is-root" data-testid="indstillinger-page">

        <MinSideSubNav />

        {/* ── Header ── */}
        <div className="is-header">
          <div className="is-header-icon"><Settings size={20} /></div>
          <h1 className="is-header-title">Indstillinger</h1>
        </div>

        <div className="is-content">

          {/* ── Profile card ── */}
          <div className="is-fade-up">
            {editingProfile ? (
              <div className="is-card">
                <EditProfileSection onClose={() => setEditingProfile(false)} />
              </div>
            ) : (
              <div className="is-profile-card" onClick={() => setEditingProfile(true)}>
                <div className="is-profile-avatar">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt={displayName} />
                    : (displayName[0]?.toUpperCase() || <User size={22} />)}
                </div>
                <div className="is-profile-info">
                  <p className="is-profile-name">{displayName}</p>
                  <p className="is-profile-email">{userEmail}</p>
                  {userCity && (
                    <p className="is-profile-city">
                      <MapPin size={11} />
                      {userCity}
                    </p>
                  )}
                </div>
                <ChevronRight size={18} className="is-profile-chevron" />
              </div>
            )}
          </div>

          {/* ── Notifikationer ── */}
          <div className="is-fade-up is-d1">
            <div className="is-card">
              <p className="is-card-title">Notifikationer</p>
              <ToggleRow
                id="tgl-push"
                label={
                  pushState === "denied" ? "Push-notifikationer (blokeret i browser)" :
                  pushState === "unsupported" ? "Push-notifikationer (ikke understøttet)" :
                  "Push-notifikationer"
                }
                enabled={pushEnabled}
                onToggle={pushDisabled ? () => {} : (pushEnabled ? pushUnsubscribe : pushSubscribe)}
              />
              <ToggleRow id="tgl-email" label="E-mailnotifikationer" enabled={emailNotif} onToggle={() => setEmailNotif(!emailNotif)} />
              <ToggleRow id="tgl-sms" label="SMS-notifikationer" enabled={smsNotif} onToggle={() => setSmsNotif(!smsNotif)} />
            </div>
          </div>

          {/* ── Privatliv ── */}
          <div className="is-fade-up is-d2">
            <div className="is-card">
              <p className="is-card-title">Privatliv</p>
              <ToggleRow id="tgl-profil" label="Profilsynlighed" enabled={profilSynlig} onToggle={() => setProfilSynlig(!profilSynlig)} />
              <ToggleRow id="tgl-placering" label="Placeringsdeling" enabled={placeringDeling} onToggle={() => setPlaceringDeling(!placeringDeling)} />
            </div>
          </div>

          {/* ── Sprog ── */}
          <div className="is-fade-up is-d3">
            <div className="is-card">
              <p className="is-card-title">Sprog</p>
              <div className="is-lang-row">
                <div className="is-lang-buttons">
                  <button
                    className={`is-lang-btn ${lang === "da" ? "is-lang-btn--active" : "is-lang-btn--inactive"}`}
                    onClick={() => changeLang("da")}
                  >
                    Dansk
                  </button>
                  <button
                    className={`is-lang-btn ${lang === "en" ? "is-lang-btn--active" : "is-lang-btn--inactive"}`}
                    onClick={() => changeLang("en")}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tema ── */}
          <div className="is-fade-up is-d4">
            <div className="is-card">
              <p className="is-card-title">Tema</p>
              <ToggleRow id="tgl-dark" label="M\u00f8rk tilstand" enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
            </div>
          </div>

          {/* ── Danger zone: Logout + Delete ── */}
          <div className="is-fade-up is-d4">
            <div className="is-card">
              <button onClick={signOut} className="is-row">
                <LogOut size={16} style={{ color: "#f87171" }} />
                <span className="is-row-label is-row-label--danger">{t("settings.log_out")}</span>
              </button>
              <DeleteAccountSection />
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="is-footer">
            <p>{t("settings.app_version", { version: "1.0" })}</p>
            <p>{t("settings.made_with_love")}</p>
          </div>
        </div>
      </div>
    </>
  );
}
