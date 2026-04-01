import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, CreditCard, Users, FileText, Bell, Globe, Shield, BarChart3, Target, ChevronRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const firmaIndstillingerCSS = `
${pageBase("fi")}

/* ── Header ── */
.fi-header {
  position: sticky; top: 0; z-index: 30;
  padding: 48px 20px 12px;
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(to bottom, rgba(6,10,15,0.95) 60%, transparent);
}
.fi-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.25s; color: var(--pg-white);
}
.fi-back:hover {
  background: var(--glass-bg-hover); border-color: var(--glass-border-hover);
}
.fi-header-text { display: flex; flex-direction: column; gap: 4px; }
.fi-title {
  font-family: var(--serif); font-size: 22px; font-weight: 400;
  letter-spacing: -0.5px; color: var(--pg-white); margin: 0;
}

/* ── Content wrapper ── */
.fi-content {
  padding: 8px 20px 0; display: flex; flex-direction: column; gap: 20px;
}

/* ── Company card ── */
.fi-company-card {
  padding: 18px;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
}
.fi-company-inner { display: flex; align-items: center; gap: 14px; }
.fi-company-avatar {
  width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--teal), #059669);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}
.fi-company-info { flex: 1; min-width: 0; }
.fi-company-name-row { display: flex; align-items: center; gap: 8px; }
.fi-company-name {
  font-size: 16px; font-weight: 600; color: var(--pg-white); margin: 0;
}
.fi-company-verified { color: var(--teal); flex-shrink: 0; }
.fi-company-sub {
  font-size: 12px; color: var(--pg-white-muted); margin-top: 2px;
}
.fi-company-tags { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.fi-badge {
  padding: 2px 10px; border-radius: 100px;
  font-size: 12px; font-weight: 500;
  background: var(--teal-dim); color: var(--teal);
}
.fi-events-count {
  font-size: 12px; color: var(--pg-white-muted);
}

/* ── Settings group ── */
.fi-group-title {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 2px; color: var(--pg-white-muted);
  padding: 0 4px; margin-bottom: 8px;
}
.fi-group-card {
  background: rgba(255,255,255,0.08); backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
  overflow: hidden;
}
.fi-group-divider {
  height: 1px; background: rgba(255,255,255,0.05); margin: 0;
}

/* ── Settings row ── */
.fi-row {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: transparent; border: none;
  cursor: pointer; transition: background 0.2s; font-family: var(--sans);
  text-align: left;
}
.fi-row:hover { background: rgba(255,255,255,0.04); }
.fi-row-icon {
  width: 32px; height: 32px; border-radius: 12px;
  background: rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  color: var(--pg-white-dim); flex-shrink: 0;
}
.fi-row-label {
  flex: 1; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.8);
}
.fi-row-value {
  font-size: 12px; color: var(--pg-white-muted);
}
.fi-row-badge {
  padding: 2px 10px; border-radius: 100px;
  font-size: 12px; font-weight: 500;
}
.fi-row-chevron { color: rgba(255,255,255,0.15); flex-shrink: 0; }

/* ── Toggle ── */
.fi-toggle-track {
  width: 40px; height: 24px; border-radius: 100px;
  position: relative; transition: background 0.25s; flex-shrink: 0;
}
.fi-toggle-track--on { background: var(--teal); }
.fi-toggle-track--off { background: rgba(255,255,255,0.12); }
.fi-toggle-thumb {
  position: absolute; top: 2px; width: 20px; height: 20px;
  border-radius: 50%; background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  transition: transform 0.25s;
}
.fi-toggle-thumb--on { transform: translateX(18px); }
.fi-toggle-thumb--off { transform: translateX(2px); }

/* ── Footer ── */
.fi-footer {
  text-align: center; padding: 24px 0 40px;
}
.fi-footer-line {
  font-size: 12px; margin: 0;
}
.fi-footer-line--dim { color: var(--pg-white-muted); }
.fi-footer-line--faint { color: rgba(255,255,255,0.12); margin-top: 2px; }
`;

/* ── Sub-components ── */

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="fi-group-title">{title}</div>
      <div className="fi-group-card">
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
    <button onClick={onClick} className="fi-row">
      <div className="fi-row-icon">
        <Icon size={16} />
      </div>
      <span className="fi-row-label">{label}</span>
      {badge && (
        <span className="fi-row-badge" style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}>
          {badge.text}
        </span>
      )}
      {value && <span className="fi-row-value">{value}</span>}
      <ChevronRight size={14} className="fi-row-chevron" />
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
    <button onClick={onToggle} className="fi-row">
      <div className="fi-row-icon">
        <Icon size={16} />
      </div>
      <span className="fi-row-label">{label}</span>
      <div className={`fi-toggle-track ${enabled ? "fi-toggle-track--on" : "fi-toggle-track--off"}`}>
        <div className={`fi-toggle-thumb ${enabled ? "fi-toggle-thumb--on" : "fi-toggle-thumb--off"}`} />
      </div>
    </button>
  );
}

function GroupDivider() {
  return <div className="fi-group-divider" />;
}

/* ── Main page ── */

export default function FirmaIndstillinger() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, profile } = useAuth();
  const containerRef = useFadeUp("fi");

  // State for toggles
  const [autoPublish, setAutoPublish] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const companyName = "Aalborg Outdoor Events";
  const subscription = "Premium";
  const verified = true;

  return (
    <>
      <style>{firmaIndstillingerCSS}</style>
      <div className="fi-root" ref={containerRef}>

        {/* Header */}
        <div className="fi-header">
          <button onClick={() => setLocation("/firma")} className="fi-back">
            <ArrowLeft size={18} />
          </button>
          <div className="fi-header-text">
            <div className="fi-eyebrow"><div className="fi-eyebrow-line" />B-Social Firma</div>
            <h1 className="fi-title">{t('firma.settings_title')}</h1>
          </div>
        </div>

        <div className="fi-content">

          {/* Company Info Card */}
          <div className="fi-company-card fi-fade-up">
            <div className="fi-company-inner">
              <div className="fi-company-avatar">
                <Building2 size={24} />
              </div>
              <div className="fi-company-info">
                <div className="fi-company-name-row">
                  <h3 className="fi-company-name">{companyName}</h3>
                  {verified && <CheckCircle2 size={16} className="fi-company-verified" />}
                </div>
                <p className="fi-company-sub">{t('firma.settings_cvr_info')}</p>
                <div className="fi-company-tags">
                  <span className="fi-badge">{subscription}</span>
                  <span className="fi-events-count">{t('firma.settings_events_published', { count: 45 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Settings */}
          <div className="fi-fade-up fi-d1">
            <SettingsGroup title={t('firma.settings_group_company')}>
              <SettingsRow
                icon={Building2}
                label={t('firma.settings_company_info')}
                value={t('firma.settings_edit')}
              />
              <GroupDivider />
              <SettingsRow
                icon={Shield}
                label={t('firma.settings_verification')}
                badge={{ text: t('firma.settings_verified'), color: "teal" }}
              />
              <GroupDivider />
              <SettingsRow
                icon={Users}
                label={t('firma.settings_team_members')}
                value={t('firma.settings_users_count', { count: 3 })}
              />
            </SettingsGroup>
          </div>

          {/* Subscription & Billing */}
          <div className="fi-fade-up fi-d2">
            <SettingsGroup title={t('firma.settings_group_subscription')}>
              <SettingsRow
                icon={CreditCard}
                label={t('firma.settings_subscription')}
                value={subscription}
              />
              <GroupDivider />
              <SettingsRow
                icon={FileText}
                label={t('firma.settings_payment_history')}
              />
              <GroupDivider />
              <SettingsRow
                icon={CreditCard}
                label={t('firma.settings_payment_method')}
                value="Visa ···· 4242"
              />
            </SettingsGroup>
          </div>

          {/* Features & Automation */}
          <div className="fi-fade-up fi-d3">
            <SettingsGroup title={t('firma.settings_group_features')}>
              <ToggleRow
                icon={Target}
                label={t('firma.settings_auto_publish')}
                enabled={autoPublish}
                onToggle={() => setAutoPublish(!autoPublish)}
              />
              <GroupDivider />
              <ToggleRow
                icon={BarChart3}
                label={t('firma.settings_advanced_analytics')}
                enabled={analyticsEnabled}
                onToggle={() => setAnalyticsEnabled(!analyticsEnabled)}
              />
              <GroupDivider />
              <ToggleRow
                icon={Bell}
                label={t('firma.settings_email_notifications')}
                enabled={emailNotifications}
                onToggle={() => setEmailNotifications(!emailNotifications)}
              />
            </SettingsGroup>
          </div>

          {/* Preferences */}
          <div className="fi-fade-up fi-d4">
            <SettingsGroup title={t('firma.settings_group_preferences')}>
              <SettingsRow
                icon={Globe}
                label={t('firma.settings_language')}
                value={t('firma.settings_language_danish')}
              />
            </SettingsGroup>
          </div>

          {/* App info */}
          <div className="fi-footer fi-fade-up fi-d4">
            <p className="fi-footer-line fi-footer-line--dim">B-Social Business v1.0</p>
            <p className="fi-footer-line fi-footer-line--faint">{t('firma.settings_made_with_love')}</p>
          </div>

        </div>
      </div>
    </>
  );
}
