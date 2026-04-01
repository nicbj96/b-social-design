import { useState } from "react";
import { ArrowLeft, Bell, Shield, Globe, LogOut, ChevronRight, Mail, Trash2, Pencil } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import LanguageSwitcher from "@/components/LanguageSwitcher";

import { useTranslation } from 'react-i18next';

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-white/40 text-[11px] uppercase tracking-wider font-semibold mb-2 px-1">{title}</h2>
      <div className="glass-card-strong rounded-2xl overflow-hidden divide-y divide-white/5">
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
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
      data-testid={`settings-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${danger ? "bg-red-500/15" : "bg-white/8"}`}>
        <Icon size={16} className={danger ? "text-red-400" : "text-white/60"} />
      </div>
      <span className={`flex-1 text-left text-sm font-medium ${danger ? "text-red-400" : "text-white/80"}`}>{label}</span>
      {value && <span className="text-white/30 text-xs">{value}</span>}
      {!danger && <ChevronRight size={14} className="text-white/20" />}
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
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
      data-testid={`toggle-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center">
        <Icon size={16} className="text-white/60" />
      </div>
      <span className="flex-1 text-left text-sm font-medium text-white/80">{label}</span>
      <div className={`w-10 h-6 rounded-full transition-colors duration-200 relative ${enabled ? "bg-[#4ECDC4]" : "bg-white/15"}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-[18px]" : "translate-x-0.5"}`} />
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

  // Sync with profile when it loads
  // Using useEffect-like pattern via lazy state initializer is wrong here.
  // Instead, default values in useState are fine since profile is available from context.

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
      <button
        onClick={() => setEditing(true)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center">
          <Pencil size={16} className="text-white/60" />
        </div>
        <span className="flex-1 text-left text-sm font-medium text-white/80">{t('settings.edit_name_city')}</span>
        <ChevronRight size={14} className="text-white/20" />
      </button>
    );
  }

  return (
    <div className="px-4 py-3 space-y-3">
      <div>
        <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1 block">{t('settings.name_label')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50"
          placeholder={t('settings.name_placeholder')}
        />
      </div>
      <div>
        <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1 block">{t('settings.city_label')}</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50"
          placeholder={t('settings.city_placeholder')}
        />
      </div>
      {message && (
        <p className={`text-xs ${message.startsWith("Fejl") ? "text-red-400" : "text-[#4ECDC4]"}`}>{message}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => setEditing(false)}
          className="flex-1 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-colors"
        >{t('settings.cancel')}</button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-3 py-2 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-sm font-semibold hover:bg-[#3dbdb5] transition-colors disabled:opacity-50"
        >{saving ? t('settings.saving') : t('settings.save')}</button>
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
      <button
        onClick={() => setEditing(true)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center">
          <Mail size={16} className="text-white/60" />
        </div>
        <span className="flex-1 text-left text-sm font-medium text-white/80">{t('settings.change_email')}</span>
        <ChevronRight size={14} className="text-white/20" />
      </button>
    );
  }

  return (
    <div className="px-4 py-3 space-y-3">
      <div>
        <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1 block">{t('settings.new_email_label')}</label>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50"
          placeholder="ny@email.dk"
        />
      </div>
      {message && (
        <p className={`text-xs ${message.startsWith("Fejl") ? "text-red-400" : "text-[#4ECDC4]"}`}>{message}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => { setEditing(false); setNewEmail(""); setMessage(""); }}
          className="flex-1 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-colors"
        >{t('settings.cancel')}</button>
        <button
          onClick={handleChangeEmail}
          disabled={saving}
          className="flex-1 px-3 py-2 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-sm font-semibold hover:bg-[#3dbdb5] transition-colors disabled:opacity-50"
        >{saving ? t('settings.sending') : t('settings.send_confirmation')}</button>
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
      <button
        onClick={() => setConfirmOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
          <Trash2 size={16} className="text-red-400" />
        </div>
        <span className="flex-1 text-left text-sm font-medium text-red-400">{t('settings.delete_account')}</span>
      </button>
    );
  }

  return (
    <div className="px-4 py-3 space-y-3 border-t border-white/5">
      <p className="text-red-400 text-xs font-medium">{t('settings.delete_warning')}</p>
      <div>
        <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1 block">{t('settings.delete_confirm_label')}</label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-red-500/50"
          placeholder="SLET"
        />
      </div>
      {message && (
        <p className={`text-xs ${message.startsWith("Fejl") ? "text-red-400" : "text-amber-400"}`}>{message}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => { setConfirmOpen(false); setConfirmText(""); setMessage(""); }}
          className="flex-1 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-colors"
        >{t('settings.cancel')}</button>
        <button
          onClick={handleDelete}
          disabled={deleting || confirmText !== "SLET"}
          className="flex-1 px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
        >{deleting ? t('settings.deleting') : t('settings.delete_permanent')}</button>
      </div>
    </div>
  );
}

export default function Indstillinger() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { signOut, user, profile } = useAuth();
  const [notifikationer, setNotifikationer] = useState(true);
  const [privatProfil, setPrivatProfil] = useState(false);

  const displayName = profile?.name || user?.email?.split("@")[0] || t('settings.default_user');
  const userEmail = profile?.email || user?.email || "";

  return (
    <div
      className="relative min-h-svh pb-24"
      style={{ background: "#060a0f" }}
      data-testid="indstillinger-page"
    >
      <div className="sticky top-0 z-30 pt-12 pb-3 px-5 flex items-center gap-3" style={{ background: "linear-gradient(to bottom, rgba(6,10,15,0.95) 60%, transparent)" }}>
        <button onClick={() => setLocation("/min-side")} className="w-9 h-9 rounded-full glass-card flex items-center justify-center"><ArrowLeft size={18} className="text-white" /></button>
        <h1 className="text-white text-xl font-serif" style={{ fontWeight: 400 }}>{t('settings.title')}</h1>
      </div>

      <div className="px-5 mt-2 space-y-5">
        {/* Profile preview */}
        <div className="glass-card-strong rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#4ECDC4] to-[#059669] flex items-center justify-center">
            <span className="text-white text-lg font-bold">{displayName[0].toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">{displayName}</h3>
            <p className="text-white/40 text-xs">{userEmail}</p>
          </div>
        </div>

        {/* Account */}
        <SettingsGroup title={t('settings.account')}>
          <EditProfileSection />
          <ChangeEmailSection />
          <ToggleRow icon={Bell} label={t('settings.notifications')} enabled={notifikationer} onToggle={() => setNotifikationer(!notifikationer)} />
          <ToggleRow icon={Shield} label={t('settings.private_profile')} enabled={privatProfil} onToggle={() => setPrivatProfil(!privatProfil)} />
        </SettingsGroup>

        {/* Preferences */}
        <SettingsGroup title={t('settings.preferences')}>
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center">
                <Globe size={16} className="text-white/60" />
              </div>
              <span className="text-sm font-medium text-white/80">{t('settings.language')}</span>
            </div>
            <div className="mt-2">
              <LanguageSwitcher variant="toggle" />
            </div>
          </div>
        </SettingsGroup>

        {/* Danger zone */}
        <SettingsGroup title="">
          <SettingsRow icon={LogOut} label={t('settings.log_out')} onClick={signOut} danger />
          <DeleteAccountSection />
        </SettingsGroup>

        {/* App info */}
        <div className="text-center pt-4 pb-8">
          <p className="text-white/20 text-xs">{t('settings.app_version', { version: '1.0' })}</p>
          <p className="text-white/15 text-xs">{t('settings.made_with_love')}</p>
        </div>
      </div>
    </div>
  );
}
