import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, CreditCard, Users, FileText, Bell, Globe, Shield, BarChart3, Target, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

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

function SettingsRow({ icon: Icon, label, value, onClick, badge }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string;
  onClick?: () => void;
  badge?: { text: string; color: string };
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
    >
      <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center">
        <Icon size={16} className="text-white/60" />
      </div>
      <span className="flex-1 text-left text-sm font-medium text-white/80">{label}</span>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
          {badge.text}
        </span>
      )}
      {value && <span className="text-white/30 text-xs">{value}</span>}
      <ChevronRight size={14} className="text-white/20" />
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

export default function FirmaIndstillinger() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, profile } = useAuth();
  
  // State for toggles
  const [autoPublish, setAutoPublish] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  
  const companyName = "Aalborg Outdoor Events";
  const subscription = "Premium";
  const verified = true;

  return (
    <div
      className="relative min-h-svh pb-8"
      style={{ background: "#060a0f" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 pt-12 pb-3 px-5 flex items-center gap-3" style={{ background: "linear-gradient(to bottom, rgba(6,10,15,0.95) 60%, transparent)" }}>
        <button onClick={() => setLocation("/firma")} className="w-9 h-9 rounded-full glass-card flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-white text-xl font-serif" style={{ fontWeight: 400 }}>{t('firma.settings_title')}</h1>
      </div>

      <div className="px-5 mt-2 space-y-5">
        {/* Company Info Card */}
        <div className="glass-card-strong rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[#4ECDC4] to-[#059669] flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-base">{companyName}</h3>
                {verified && <CheckCircle2 size={16} className="text-[#4ECDC4]" />}
              </div>
              <p className="text-white/40 text-xs mt-0.5">{t('firma.settings_cvr_info')}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#4ECDC4]/15 text-[#4ECDC4]">
                  {subscription}
                </span>
                <span className="text-white/30 text-xs">{t('firma.settings_events_published', { count: 45 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Settings */}
        <SettingsGroup title={t('firma.settings_group_company')}>
          <SettingsRow
            icon={Building2}
            label={t('firma.settings_company_info')}
            value={t('firma.settings_edit')}
          />
          <SettingsRow
            icon={Shield}
            label={t('firma.settings_verification')}
            badge={{ text: t('firma.settings_verified'), color: "bg-[#4ECDC4]/15 text-[#4ECDC4]" }}
          />
          <SettingsRow
            icon={Users}
            label={t('firma.settings_team_members')}
            value={t('firma.settings_users_count', { count: 3 })}
          />
        </SettingsGroup>

        {/* Subscription & Billing */}
        <SettingsGroup title={t('firma.settings_group_subscription')}>
          <SettingsRow
            icon={CreditCard}
            label={t('firma.settings_subscription')}
            value={subscription}
          />
          <SettingsRow
            icon={FileText}
            label={t('firma.settings_payment_history')}
          />
          <SettingsRow
            icon={CreditCard}
            label={t('firma.settings_payment_method')}
            value="Visa ···· 4242"
          />
        </SettingsGroup>

        {/* Features & Automation */}
        <SettingsGroup title={t('firma.settings_group_features')}>
          <ToggleRow
            icon={Target}
            label={t('firma.settings_auto_publish')}
            enabled={autoPublish}
            onToggle={() => setAutoPublish(!autoPublish)}
          />
          <ToggleRow
            icon={BarChart3}
            label={t('firma.settings_advanced_analytics')}
            enabled={analyticsEnabled}
            onToggle={() => setAnalyticsEnabled(!analyticsEnabled)}
          />
          <ToggleRow
            icon={Bell}
            label={t('firma.settings_email_notifications')}
            enabled={emailNotifications}
            onToggle={() => setEmailNotifications(!emailNotifications)}
          />
        </SettingsGroup>

        {/* Preferences */}
        <SettingsGroup title={t('firma.settings_group_preferences')}>
          <SettingsRow
            icon={Globe}
            label={t('firma.settings_language')}
            value={t('firma.settings_language_danish')}
          />
        </SettingsGroup>

        {/* App info */}
        <div className="text-center pt-4 pb-8">
          <p className="text-white/20 text-xs">B-Social Business v1.0</p>
          <p className="text-white/15 text-xs">{t('firma.settings_made_with_love')}</p>
        </div>
      </div>
    </div>
  );
}
