import { ArrowLeft, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const privatlivCSS = `${pageBase("pv")}

/* ── Header bar ── */
.pv-header {
  position: sticky; top: 0; z-index: 30;
  padding: 48px 20px 12px;
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(to bottom, rgba(6,10,15,0.97) 60%, transparent);
}
.pv-back {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  color: var(--pg-white); cursor: pointer; transition: border-color 0.3s;
}
.pv-back:hover { border-color: var(--teal); }
.pv-title {
  flex: 1; font-family: var(--serif); font-size: 20px;
  font-weight: 400; color: var(--pg-white);
}

/* ── Content wrapper ── */
.pv-content {
  padding: 0 20px 96px; margin-top: 8px;
  display: flex; flex-direction: column; gap: 16px;
  overflow-x: hidden; word-break: break-word;
}

/* ── Intro card ── */
.pv-intro {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 20px; border-radius: 16px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
}
.pv-intro-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(78,205,196,0.15);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--teal);
}
.pv-intro-name { color: var(--pg-white); font-weight: 600; font-size: 14px; }
.pv-intro-date { color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 2px; }
.pv-intro-desc {
  color: rgba(255,255,255,0.6); font-size: 12px;
  margin-top: 8px; line-height: 1.55;
}

/* ── Section card ── */
.pv-section {
  padding: 20px; border-radius: 16px;
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  display: flex; flex-direction: column; gap: 12px;
  transition: background 0.3s, border-color 0.3s;
}
.pv-section:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}
.pv-section-title {
  color: var(--pg-white); font-weight: 600; font-size: 15px;
}
.pv-section-body {
  display: flex; flex-direction: column; gap: 8px;
  color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6;
}

/* ── Sub-section ── */
.pv-sub { display: flex; flex-direction: column; gap: 6px; }
.pv-sub-title {
  color: rgba(255,255,255,0.9); font-weight: 500; font-size: 14px;
}
.pv-sub-body {
  color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6;
  display: flex; flex-direction: column; gap: 4px;
}

/* ── List items ── */
.pv-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.pv-li {
  display: flex; align-items: flex-start; gap: 8px;
}
.pv-li-dot {
  margin-top: 7px; width: 5px; height: 5px; border-radius: 50%;
  background: var(--teal); flex-shrink: 0;
}

/* ── Inner info card ── */
.pv-info {
  padding: 12px; border-radius: 12px;
  background: var(--glass-bg); backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  display: flex; flex-direction: column; gap: 2px;
  color: rgba(255,255,255,0.6); font-size: 12px;
}
.pv-info-label {
  color: rgba(255,255,255,0.8); font-weight: 500;
}

/* ── Purpose / processor cards ── */
.pv-cards { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
.pv-card {
  padding: 12px; border-radius: 12px;
  background: var(--glass-bg); backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  display: flex; flex-direction: column; gap: 4px;
}
.pv-card-title {
  color: rgba(255,255,255,0.8); font-size: 12px; font-weight: 500;
}
.pv-card-desc {
  color: rgba(255,255,255,0.5); font-size: 12px;
}

/* ── Links ── */
.pv-link {
  color: var(--teal); text-decoration: underline;
  text-underline-offset: 3px; transition: opacity 0.2s;
}
.pv-link:hover { opacity: 0.8; }

/* ── Footer ── */
.pv-footer { text-align: center; padding: 8px 0 32px; }
.pv-footer p { font-size: 12px; }
.pv-footer-l1 { color: rgba(255,255,255,0.2); }
.pv-footer-l2 { color: rgba(255,255,255,0.15); margin-top: 4px; }
`;

/* ── Sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pv-section pv-fade-up">
      <h2 className="pv-section-title">{title}</h2>
      <div className="pv-section-body">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pv-sub">
      <h3 className="pv-sub-title">{title}</h3>
      <div className="pv-sub-body">{children}</div>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="pv-li">
      <span className="pv-li-dot" />
      <span>{children}</span>
    </li>
  );
}

/* ── Main component ── */

export default function Privatlivspolitik() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const containerRef = useFadeUp("pv");

  return (
    <>
      <style>{privatlivCSS}</style>
      <div
        className="pv-root"
        ref={containerRef}
        data-testid="privatlivspolitik-page"
      >
        {/* Header */}
        <div className="pv-header">
          <button
            onClick={() => setLocation(-1 as unknown as string)}
            className="pv-back"
            aria-label={t('legal.go_back')}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="pv-title">{t('legal.privacy_title')}</h1>
          <LanguageSwitcher variant="toggle" />
        </div>

        <div className="pv-content">
          {/* Intro card */}
          <div className="pv-intro pv-fade-up">
            <div className="pv-intro-icon">
              <Shield size={20} />
            </div>
            <div>
              <p className="pv-intro-name">B-Social.net</p>
              <p className="pv-intro-date">{t('legal.privacy_last_updated')}</p>
              <p className="pv-intro-desc">{t('legal.privacy_intro_description')}</p>
            </div>
          </div>

          {/* 1. Dataansvarlig */}
          <Section title={t('legal.privacy_section1_title')}>
            <p>{t('legal.privacy_section1_responsible')}</p>
            <div className="pv-info">
              <p className="pv-info-label">B-Social</p>
              <p>{t('legal.privacy_aalborg_denmark')}</p>
              <p>{t('legal.privacy_email_label')}: <a href="mailto:kontakt@b-social.net" className="pv-link">kontakt@b-social.net</a></p>
              <p>{t('legal.privacy_website_label')}: <a href="https://b-social.net" className="pv-link">b-social.net</a></p>
            </div>
          </Section>

          {/* 2. Oplysninger vi indsamler */}
          <Section title={t('legal.privacy_section2_title')}>
            <SubSection title={t('legal.privacy_section2_1_title')}>
              <ul className="pv-list">
                <Li>{t('legal.privacy_profile_name_email')}</Li>
                <Li>{t('legal.privacy_profile_avatar')}</Li>
                <Li>{t('legal.privacy_profile_city_interests')}</Li>
                <Li>{t('legal.privacy_profile_google_oauth')}</Li>
              </ul>
            </SubSection>
            <SubSection title={t('legal.privacy_section2_2_title')}>
              <ul className="pv-list">
                <Li>{t('legal.privacy_activity_participation')}</Li>
                <Li>{t('legal.privacy_activity_messages')}</Li>
                <Li>{t('legal.privacy_activity_events_interactions')}</Li>
              </ul>
            </SubSection>
            <SubSection title={t('legal.privacy_section2_3_title')}>
              <ul className="pv-list">
                <Li>{t('legal.privacy_location_city_radius')}</Li>
                <Li>{t('legal.privacy_location_no_gps')}</Li>
              </ul>
            </SubSection>
            <SubSection title={t('legal.privacy_section2_4_title')}>
              <ul className="pv-list">
                <Li>{t('legal.privacy_technical_push_token')}</Li>
                <Li>{t('legal.privacy_technical_ip_browser')}</Li>
                <Li>{t('legal.privacy_technical_gtm')}</Li>
              </ul>
            </SubSection>
            <SubSection title={t('legal.privacy_section2_5_title')}>
              <p>{t('legal.privacy_ai_chat_description')}</p>
            </SubSection>
          </Section>

          {/* 3. Formål og retsgrundlag */}
          <Section title={t('legal.privacy_section3_title')}>
            <p>{t('legal.privacy_section3_intro')}</p>
            <div className="pv-cards">
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_purpose_account')}</p>
                <p className="pv-card-desc">{t('legal.privacy_legal_basis_contract_b')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_purpose_events_matching')}</p>
                <p className="pv-card-desc">{t('legal.privacy_legal_basis_contract_b')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_purpose_communication')}</p>
                <p className="pv-card-desc">{t('legal.privacy_legal_basis_contract_b')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_purpose_analytics')}</p>
                <p className="pv-card-desc">{t('legal.privacy_legal_basis_legitimate_f')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_purpose_legal_obligations')}</p>
                <p className="pv-card-desc">{t('legal.privacy_legal_basis_obligation_c')}</p>
              </div>
            </div>
          </Section>

          {/* 4. Databehandlere og videregivelse */}
          <Section title={t('legal.privacy_section4_title')}>
            <p>{t('legal.privacy_section4_intro')}</p>
            <div className="pv-cards">
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_processor_supabase')}</p>
                <p className="pv-card-desc">{t('legal.privacy_processor_supabase_desc')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_processor_cloudflare')}</p>
                <p className="pv-card-desc">{t('legal.privacy_processor_cloudflare_desc')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_processor_google')}</p>
                <p className="pv-card-desc">{t('legal.privacy_processor_google_desc')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_processor_cf_ai')}</p>
                <p className="pv-card-desc">{t('legal.privacy_processor_cf_ai_desc')}</p>
              </div>
            </div>
            <p>{t('legal.privacy_section4_no_third_party')}</p>
          </Section>

          {/* 5. Overførsler til tredjelande */}
          <Section title={t('legal.privacy_section5_title')}>
            <p>{t('legal.privacy_section5_eu_hosting')}</p>
            <p>{t('legal.privacy_section5_us_transfers')}</p>
          </Section>

          {/* 6. Opbevaringsperiode */}
          <Section title={t('legal.privacy_section6_title')}>
            <ul className="pv-list">
              <Li>{t('legal.privacy_retention_profile')}</Li>
              <Li>{t('legal.privacy_retention_events')}</Li>
              <Li>{t('legal.privacy_retention_chat')}</Li>
              <Li>{t('legal.privacy_retention_push')}</Li>
              <Li>{t('legal.privacy_retention_analytics')}</Li>
            </ul>
          </Section>

          {/* 7. Dine rettigheder */}
          <Section title={t('legal.privacy_section7_title')}>
            <p>
              {t('legal.privacy_section7_intro')} <a href="mailto:kontakt@b-social.net" className="pv-link">kontakt@b-social.net</a>:
            </p>
            <div className="pv-cards">
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_right_access')}</p>
                <p className="pv-card-desc">{t('legal.privacy_right_access_desc')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_right_rectification')}</p>
                <p className="pv-card-desc">{t('legal.privacy_right_rectification_desc')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_right_erasure')}</p>
                <p className="pv-card-desc">{t('legal.privacy_right_erasure_desc')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_right_portability')}</p>
                <p className="pv-card-desc">{t('legal.privacy_right_portability_desc')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_right_objection')}</p>
                <p className="pv-card-desc">{t('legal.privacy_right_objection_desc')}</p>
              </div>
              <div className="pv-card">
                <p className="pv-card-title">{t('legal.privacy_right_restriction')}</p>
                <p className="pv-card-desc">{t('legal.privacy_right_restriction_desc')}</p>
              </div>
            </div>
            <p>{t('legal.privacy_section7_response_time')}</p>
          </Section>

          {/* 8. Cookies */}
          <Section title={t('legal.privacy_section8_title')}>
            <p>{t('legal.privacy_section8_intro')}</p>
            <SubSection title={t('legal.privacy_cookies_necessary_title')}>
              <p>{t('legal.privacy_cookies_necessary_desc')}</p>
            </SubSection>
            <SubSection title={t('legal.privacy_cookies_analytics_title')}>
              <p>{t('legal.privacy_cookies_analytics_desc')}</p>
            </SubSection>
            <SubSection title={t('legal.privacy_cookies_pwa_title')}>
              <p>{t('legal.privacy_cookies_pwa_desc')}</p>
            </SubSection>
          </Section>

          {/* 9. Sikkerhed */}
          <Section title={t('legal.privacy_section9_title')}>
            <p>{t('legal.privacy_section9_intro')}</p>
            <ul className="pv-list">
              <Li>{t('legal.privacy_security_https')}</Li>
              <Li>{t('legal.privacy_security_rls')}</Li>
              <Li>{t('legal.privacy_security_encryption')}</Li>
              <Li>{t('legal.privacy_security_ddos')}</Li>
            </ul>
            <p>{t('legal.privacy_section9_breach_notice')}</p>
          </Section>

          {/* 10. Børn */}
          <Section title={t('legal.privacy_section10_title')}>
            <p>
              {t('legal.privacy_section10_description')} <a href="mailto:kontakt@b-social.net" className="pv-link">kontakt@b-social.net</a>{t('legal.privacy_section10_contact_suffix')}
            </p>
          </Section>

          {/* 11. Ændringer */}
          <Section title={t('legal.privacy_section11_title')}>
            <p>{t('legal.privacy_section11_description')}</p>
          </Section>

          {/* 12. Klage */}
          <Section title={t('legal.privacy_section12_title')}>
            <p>{t('legal.privacy_section12_intro')}</p>
            <div className="pv-info">
              <p className="pv-info-label">{t('legal.privacy_authority_name')}</p>
              <p>Carl Jacobsens Vej 35</p>
              <p>2500 Valby</p>
              <p>{t('legal.privacy_phone_label')}: +45 33 19 32 00</p>
              <p>
                {t('legal.privacy_website_label')}:{" "}
                <a
                  href="https://www.datatilsynet.dk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pv-link"
                >
                  datatilsynet.dk
                </a>
              </p>
            </div>
          </Section>

          {/* 13. Kontakt */}
          <Section title={t('legal.privacy_section13_title')}>
            <p>{t('legal.privacy_section13_intro')}</p>
            <div className="pv-info">
              <p className="pv-info-label">B-Social</p>
              <p>{t('legal.privacy_aalborg_denmark')}</p>
              <p>
                {t('legal.privacy_email_label')}:{" "}
                <a href="mailto:kontakt@b-social.net" className="pv-link">
                  kontakt@b-social.net
                </a>
              </p>
            </div>
          </Section>

          {/* Footer */}
          <div className="pv-footer pv-fade-up">
            <p className="pv-footer-l1">{t('legal.privacy_footer_line1')}</p>
            <p className="pv-footer-l2">{t('legal.privacy_footer_line2')}</p>
          </div>
        </div>
      </div>
    </>
  );
}
