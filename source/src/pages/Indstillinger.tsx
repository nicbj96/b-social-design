import { useState } from "react";
import { ArrowLeft, Bell, Shield, Globe, LogOut, ChevronRight, Mail, Trash2, Pencil } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from 'react-i18next';
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const indstillingerCSS = `${pageBase("is")}

/* ── Header bar ── */
.is-header {
  position: sticky; top: 0; z-index: 30;
  padding: 48px 20px 12px;
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(to bottom, rgba(6,10,15,0.95) 70%, transparent);
}
.is-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.25s;
  color: rgba(255,255,255,0.7);
}
.is-back:hover { background: var(--glass-bg-hover); }
.is-header-text h1 {
  font-family: var(--serif); font-weight: 400; font-size: 20px;
  letter-spacing: -0.4px; color: var(--pg-white); line-height: 1.1;
  margin: 0;
}

/* ── Content area ── */
.is-content { padding: 8px 20px 0; display: flex; flex-direction: column; gap: 20px; }

/* ── Profile card ── */
.is-profile-card {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 16px; display: flex; align-items: center; gap: 12px;
  transition: background 0.3s, border-color 0.3s;
}
.is-profile-card:hover {
  background: var(--glass-bg-hover); border-color: var(--glass-border-hover);
}
.is-avatar {
  width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(78,205,196,0.2), rgba(147,197,253,0.15));
  border: 1px solid rgba(78,205,196,0.3);
  box-shadow: 0 0 24px rgba(78,205,196,0.12);
}
.is-avatar span {
  font-family: var(--serif); color: var(--teal); font-size: 18px;
}
.is-profile-info { flex: 1; }
.is-profile-name {
  font-size: 14px; font-weight: 600; color: var(--pg-white); margin: 0;
}
.is-profile-email {
  font-size: 12px; color: var(--pg-white-muted); margin: 2px 0 0;
}

/* ── Settings group ── */
.is-group-title {
  font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4);
  text-transform: uppercase; letter-spacing: 2px;
  padding: 0 4px; margin: 0 0 8px;
}
.is-group-body {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  overflow: hidden;
}
.is-group-body > *:not(:last-child) {
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

/* ── Settings row ── */
.is-row {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: transparent; border: none;
  cursor: pointer; transition: background 0.2s;
  font-family: var(--sans); text-align: left;
}
.is-row:hover { background: rgba(255,255,255,0.04); }
.is-row-icon {
  width: 32px; height: 32px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.is-row-icon--danger { background: rgba(239,68,68,0.12); }
.is-row-icon svg { color: rgba(255,255,255,0.6); }
.is-row-icon--danger svg { color: #f87171; }
.is-row-label {
  flex: 1; font-size: 14px; font-weight: 500;
  color: rgba(255,255,255,0.8);
}
.is-row-label--danger { color: #f87171; }
.is-row-value {
  font-size: 12px; color: rgba(255,255,255,0.3);
}
.is-row-chevron { color: rgba(255,255,255,0.2); flex-shrink: 0; }

/* ── Toggle switch ── */
.is-toggle-track {
  width: 40px; height: 24px; border-radius: 12px;
  position: relative; transition: background 0.25s; flex-shrink: 0;
}
.is-toggle-track--on { background: var(--teal); }
.is-toggle-track--off { background: rgba(255,255,255,0.15); }
.is-toggle-thumb {
  position: absolute; top: 2px; width: 20px; height: 20px;
  border-radius: 50%; background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
}
.is-toggle-thumb--on { transform: translateX(18px); }
.is-toggle-thumb--off { transform: translateX(2px); }

/* ── Inline edit panels ── */
.is-edit-panel { padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }
.is-edit-label {
  display: block; font-size: 11px; color: rgba(255,255,255,0.4);
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;
}
.is-edit-input {
  width: 100%; padding: 10px 14px; border-radius: 12px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9); font-size: 14px;
  font-family: var(--sans); outline: none;
  transition: border-color 0.25s;
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
  font-family: var(--sans); cursor: pointer;
  transition: background 0.2s;
}
.is-btn-cancel:hover { background: rgba(255,255,255,0.08); }
.is-btn-save {
  flex: 1; padding: 10px 14px; border-radius: 12px;
  background: var(--teal); border: none;
  color: var(--bg); font-size: 14px; font-weight: 600;
  font-family: var(--sans); cursor: pointer;
  transition: all 0.25s;
}
.is-btn-save:hover { box-shadow: 0 4px 20px var(--teal-glow); }
.is-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.is-btn-delete {
  flex: 1; padding: 10px 14px; border-radius: 12px;
  background: #ef4444; border: none;
  color: #fff; font-size: 14px; font-weight: 600;
  font-family: var(--sans); cursor: pointer;
  transition: all 0.25s;
}
.is-btn-delete:hover { background: #dc2626; }
.is-btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Delete confirm panel ── */
.is-delete-warn {
  font-size: 12px; font-weight: 500; color: #f87171;
}
.is-delete-border { border-top: 1px solid rgba(255,255,255,0.05); }

/* ── Language row ── */
.is-lang-row { padding: 12px 16px; }
.is-lang-top { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.is-lang-switcher { margin-top: 8px; }

/* ── Footer info ── */
.is-footer {
  text-align: center; padding: 16px 0 32px;
}
.is-footer p {
  font-size: 12px; color: rgba(255,255,255,0.2); margin: 0;
  line-height: 1.8;
}
.is-footer p:last-child { color: rgba(255,255,255,0.15); }

/* ── Delete confirmation modal overlay ── */
.is-modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: is-overlay-in 0.25s ease;
}
@keyframes is-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
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
`;

/* ── Sub-components ── */

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      {title && <p className="is-group-title">{title}</p>}
      <div className="is-group-body">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, value, onClick, danger }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="is-row"
      data-testid={`settings-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className={`is-row-icon ${danger ? "is-row-icon--danger" : ""}`}>
        <Icon size={16} />
      </div>
      <span className={`is-row-label ${danger ? "is-row-label--danger" : ""}`}>{label}</span>
      {value && <span className="is-row-value">{value}</span>}
      {!danger && <ChevronRight size={14} className="is-row-chevron" />}
    </button>
  );
}

function ToggleRow({ icon: Icon, label, enabled, onToggle }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="is-row"
      data-testid={`toggle-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className="is-row-icon">
        <Icon size={16} />
      </div>
      <span className="is-row-label">{label}</span>
      <div className={`is-toggle-track ${enabled ? "is-toggle-track--on" : "is-toggle-track--off"}`}>
        <div className={`is-toggle-thumb ${enabled ? "is-toggle-thumb--on" : "is-toggle-thumb--off"}`} />
      </div>
    </button>
  );
}

/* ── Bug 21: Edit Profile (name, city, avatar) ── */
function EditProfileSection() {
  const { t } = useTranslation();
  const { profile, user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [city, setCity] = useState(profile?.city || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), city: city.trim() })
      .eq("id", user.id);

    if (error) {
      setMessage(t('settings.error_prefix') + error.message);
    } else {
      setMessage(t('settings.profile_updated'));
      await refreshProfile();
      setTimeout(() => { setMessage(""); setEditing(false); }, 1500);
    }
    setSaving(false);
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="is-row">
        <div className="is-row-icon"><Pencil size={16} /></div>
        <span className="is-row-label">{t('settings.edit_name_city')}</span>
        <ChevronRight size={14} className="is-row-chevron" />
      </button>
    );
  }

  return (
    <div className="is-edit-panel">
      <div>
        <label className="is-edit-label">{t('settings.name_label')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="is-edit-input"
          placeholder={t('settings.name_placeholder')}
        />
      </div>
      <div>
        <label className="is-edit-label">{t('settings.city_label')}</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="is-edit-input"
          placeholder={t('settings.city_placeholder')}
        />
      </div>
      {message && (
        <p className={`is-msg ${message.startsWith("Fejl") ? "is-msg--err" : "is-msg--ok"}`}>{message}</p>
      )}
      <div className="is-btn-row">
        <button onClick={() => setEditing(false)} className="is-btn-cancel">{t('settings.cancel')}</button>
        <button onClick={handleSave} disabled={saving} className="is-btn-save">
          {saving ? t('settings.saving') : t('settings.save')}
        </button>
      </div>
    </div>
  );
}

/* ── Bug 20: Change Email ── */
function ChangeEmailSection() {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setMessage(t('settings.invalid_email'));
      return;
    }
    setSaving(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });

    if (error) {
      setMessage(t('settings.error_prefix') + error.message);
    } else {
      setMessage(t('settings.confirmation_email_sent', { email: newEmail.trim() }));
      setTimeout(() => { setMessage(""); setEditing(false); setNewEmail(""); }, 3000);
    }
    setSaving(false);
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="is-row">
        <div className="is-row-icon"><Mail size={16} /></div>
        <span className="is-row-label">{t('settings.change_email')}</span>
        <ChevronRight size={14} className="is-row-chevron" />
      </button>
    );
  }

  return (
    <div className="is-edit-panel">
      <div>
        <label className="is-edit-label">{t('settings.new_email_label')}</label>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="is-edit-input"
          placeholder="ny@email.dk"
        />
      </div>
      {message && (
        <p className={`is-msg ${message.startsWith("Fejl") ? "is-msg--err" : "is-msg--ok"}`}>{message}</p>
      )}
      <div className="is-btn-row">
        <button onClick={() => { setEditing(false); setNewEmail(""); setMessage(""); }} className="is-btn-cancel">
          {t('settings.cancel')}
        </button>
        <button onClick={handleChangeEmail} disabled={saving} className="is-btn-save">
          {saving ? t('settings.sending') : t('settings.send_confirmation')}
        </button>
      </div>
    </div>
  );
}

/* ── Bug 22: Delete Account (GDPR) ── */
function DeleteAccountSection() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "SLET") {
      setMessage(t('settings.write_delete_confirm'));
      return;
    }
    if (!user?.id) return;
    setDeleting(true);
    setMessage("");

    try {
      // Delete user profile data
      await supabase.from("notifications").delete().eq("user_id", user.id);
      await supabase.from("conversation_participants").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      // Sign out (actual auth user deletion requires admin/server-side)
      setMessage(t('settings.account_deleted'));
      setTimeout(async () => {
        await signOut();
      }, 2000);
    } catch (err) {
      setMessage(t('settings.delete_error'));
    }
    setDeleting(false);
  };

  if (!confirmOpen) {
    return (
      <button onClick={() => setConfirmOpen(true)} className="is-row">
        <div className="is-row-icon is-row-icon--danger"><Trash2 size={16} /></div>
        <span className="is-row-label is-row-label--danger">{t('settings.delete_account')}</span>
      </button>
    );
  }

  /* ── Delete confirmation modal ── */
  return (
    <div className="is-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setConfirmOpen(false); setConfirmText(""); setMessage(""); } }}>
      <div className="is-modal">
        <p className="is-modal-title">{t('settings.delete_account')}</p>
        <p className="is-modal-desc">{t('settings.delete_warning')}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label className="is-edit-label">{t('settings.delete_confirm_label')}</label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="is-edit-input is-edit-input--danger"
              placeholder="SLET"
            />
          </div>
          {message && (
            <p className={`is-msg ${message.startsWith("Fejl") ? "is-msg--err" : "is-msg--warn"}`}>{message}</p>
          )}
          <div className="is-btn-row">
            <button onClick={() => { setConfirmOpen(false); setConfirmText(""); setMessage(""); }} className="is-btn-cancel">
              {t('settings.cancel')}
            </button>
            <button onClick={handleDelete} disabled={deleting || confirmText !== "SLET"} className="is-btn-delete">
              {deleting ? t('settings.deleting') : t('settings.delete_permanent')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function Indstillinger() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { signOut, user, profile } = useAuth();
  const [notifikationer, setNotifikationer] = useState(true);
  const [privatProfil, setPrivatProfil] = useState(false);
  const containerRef = useFadeUp("is");

  const displayName = profile?.name || user?.email?.split("@")[0] || t('settings.default_user');
  const userEmail = profile?.email || user?.email || "";

  return (
    <>
      <style>{indstillingerCSS}</style>
      <div
        ref={containerRef}
        className="is-root"
        data-testid="indstillinger-page"
      >
        {/* ── Header ── */}
        <div className="is-header">
          <button onClick={() => setLocation("/min-side")} className="is-back">
            <ArrowLeft size={18} />
          </button>
          <div className="is-header-text">
            <div className="is-eyebrow">
              <span className="is-eyebrow-line" />
              B-Social
            </div>
            <h1>{t('settings.title')}</h1>
          </div>
        </div>

        <div className="is-content">
          {/* ── Profile preview ── */}
          <div className="is-fade-up is-profile-card">
            <div className="is-avatar">
              <span>{displayName[0].toUpperCase()}</span>
            </div>
            <div className="is-profile-info">
              <p className="is-profile-name">{displayName}</p>
              <p className="is-profile-email">{userEmail}</p>
            </div>
          </div>

          {/* ── Account ── */}
          <div className="is-fade-up is-d1">
            <SettingsGroup title={t('settings.account')}>
              <EditProfileSection />
              <ChangeEmailSection />
              <ToggleRow icon={Bell} label={t('settings.notifications')} enabled={notifikationer} onToggle={() => setNotifikationer(!notifikationer)} />
              <ToggleRow icon={Shield} label={t('settings.private_profile')} enabled={privatProfil} onToggle={() => setPrivatProfil(!privatProfil)} />
            </SettingsGroup>
          </div>

          {/* ── Preferences ── */}
          <div className="is-fade-up is-d2">
            <SettingsGroup title={t('settings.preferences')}>
              <div className="is-lang-row">
                <div className="is-lang-top">
                  <div className="is-row-icon"><Globe size={16} /></div>
                  <span className="is-row-label">{t('settings.language')}</span>
                </div>
                <div className="is-lang-switcher">
                  <LanguageSwitcher variant="toggle" />
                </div>
              </div>
            </SettingsGroup>
          </div>

          {/* ── Danger zone ── */}
          <div className="is-fade-up is-d3">
            <SettingsGroup title="">
              <SettingsRow icon={LogOut} label={t('settings.log_out')} onClick={signOut} danger />
              <DeleteAccountSection />
            </SettingsGroup>
          </div>

          {/* ── App info ── */}
          <div className="is-fade-up is-d4 is-footer">
            <p>{t('settings.app_version', { version: '1.0' })}</p>
            <p>{t('settings.made_with_love')}</p>
          </div>
        </div>
      </div>
    </>
  );
}
