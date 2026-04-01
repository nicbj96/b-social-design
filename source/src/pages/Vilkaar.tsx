import { ArrowLeft, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const vilkaarCSS = `${pageBase("vk")}

/* ── Header bar ── */
.vk-header {
  position: sticky; top: 0; z-index: 30;
  padding: 48px 20px 12px;
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(to bottom, rgba(6,10,15,0.97) 60%, transparent);
}
.vk-back {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  color: var(--pg-white);
  cursor: pointer;
  transition: border-color 0.3s, background 0.3s;
}
.vk-back:hover {
  border-color: var(--teal);
  background: var(--glass-bg-hover);
}
.vk-title {
  flex: 1;
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 400;
  color: var(--pg-white);
}

/* ── Content area ── */
.vk-content {
  padding: 8px 20px 0;
  display: flex; flex-direction: column; gap: 16px;
}

/* ── Intro card ── */
.vk-intro {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 20px;
}
.vk-intro-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(78,205,196,0.12);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: var(--teal);
}
.vk-intro-brand {
  font-size: 14px; font-weight: 600; color: var(--pg-white);
}
.vk-intro-date {
  font-size: 12px; color: var(--pg-white-muted); margin-top: 2px;
}
.vk-intro-desc {
  font-size: 12px; color: var(--pg-white-dim); margin-top: 8px;
  line-height: 1.6;
}

/* ── Section cards ── */
.vk-section {
  padding: 20px;
}
.vk-section-title {
  font-size: 15px; font-weight: 600; color: var(--pg-white);
  margin-bottom: 12px;
}
.vk-section-body {
  display: flex; flex-direction: column; gap: 8px;
  font-size: 14px; color: var(--pg-white-dim); line-height: 1.65;
}

/* ── Bullet list ── */
.vk-list {
  list-style: none; padding: 0; margin: 4px 0 0;
  display: flex; flex-direction: column; gap: 6px;
}
.vk-li {
  display: flex; align-items: flex-start; gap: 8px;
}
.vk-bullet {
  margin-top: 8px; width: 5px; height: 5px;
  border-radius: 50%; background: var(--teal);
  flex-shrink: 0;
}

/* ── Links ── */
.vk-link {
  color: var(--teal);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}
.vk-link:hover { color: #6ee0d9; }

/* ── Contact box ── */
.vk-contact-box {
  padding: 12px;
  border-radius: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  display: flex; flex-direction: column; gap: 2px;
  font-size: 12px; color: var(--pg-white-dim);
  margin-top: 4px;
}
.vk-contact-name {
  font-size: 12px; font-weight: 500; color: var(--pg-white-muted);
}

/* ── Footer ── */
.vk-footer {
  text-align: center; padding: 12px 0 32px;
}
.vk-footer-line {
  font-size: 12px; color: rgba(255,255,255,0.18);
}
.vk-footer-line + .vk-footer-line {
  margin-top: 4px; color: rgba(255,255,255,0.12);
}

/* ── Cascade delays for sections ── */
.vk-section:nth-child(2)  { transition-delay: 0.05s; }
.vk-section:nth-child(3)  { transition-delay: 0.08s; }
.vk-section:nth-child(4)  { transition-delay: 0.11s; }
.vk-section:nth-child(5)  { transition-delay: 0.14s; }
.vk-section:nth-child(6)  { transition-delay: 0.17s; }
.vk-section:nth-child(7)  { transition-delay: 0.20s; }
.vk-section:nth-child(8)  { transition-delay: 0.23s; }
.vk-section:nth-child(9)  { transition-delay: 0.26s; }
.vk-section:nth-child(10) { transition-delay: 0.29s; }
.vk-section:nth-child(11) { transition-delay: 0.32s; }
.vk-section:nth-child(12) { transition-delay: 0.35s; }
`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="vk-glass vk-section vk-fade-up">
      <h2 className="vk-section-title">{title}</h2>
      <div className="vk-section-body">
        {children}
      </div>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="vk-li">
      <span className="vk-bullet" />
      <span>{children}</span>
    </li>
  );
}

export default function Vilkaar() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const containerRef = useFadeUp("vk");

  return (
    <>
      <style>{vilkaarCSS}</style>
      <div
        className="vk-root"
        ref={containerRef}
        data-testid="vilkaar-page"
      >
        {/* Header */}
        <div className="vk-header">
          <button
            onClick={() => setLocation(-1 as unknown as string)}
            className="vk-back"
            aria-label={t('legal.go_back')}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="vk-title">{t('legal.terms_title')}</h1>
          <LanguageSwitcher variant="toggle" />
        </div>

        <div className="vk-content">
          {/* Intro card */}
          <div className="vk-glass-strong vk-intro vk-fade-up">
            <div className="vk-intro-icon">
              <FileText size={20} />
            </div>
            <div>
              <p className="vk-intro-brand">B-Social.net</p>
              <p className="vk-intro-date">{t('legal.terms_effective_date')}</p>
              <p className="vk-intro-desc">
                {t('legal.terms_intro_description')}
              </p>
            </div>
          </div>

          {/* 1. Om B-Social */}
          <Section title={t('legal.terms_section1_title')}>
            <p>
              {t('legal.terms_section1_description')}
            </p>
            <p>
              {t('legal.terms_contact_label')}: <a href="mailto:kontakt@b-social.net" className="vk-link">kontakt@b-social.net</a>
            </p>
          </Section>

          {/* 2. Acceptbetingelser */}
          <Section title={t('legal.terms_section2_title')}>
            <p>
              {t('legal.terms_section2_intro')}
            </p>
            <ul className="vk-list">
              <Li>{t('legal.terms_accept_age')}</Li>
              <Li>{t('legal.terms_accept_read')}</Li>
              <Li>{t('legal.terms_accept_correct_info')}</Li>
              <Li>{t('legal.terms_accept_compliance')}</Li>
            </ul>
          </Section>

          {/* 3. Brugerkonto */}
          <Section title={t('legal.terms_section3_title')}>
            <p>
              {t('legal.terms_section3_responsibility')} <a href="mailto:kontakt@b-social.net" className="vk-link">kontakt@b-social.net</a>{t('legal.terms_section3_unauthorized_suffix')}
            </p>
            <p>
              {t('legal.terms_section3_google_oauth')}
            </p>
          </Section>

          {/* 4. Platformens formål */}
          <Section title={t('legal.terms_section4_title')}>
            <p>
              {t('legal.terms_section4_allowed_intro')}
            </p>
            <ul className="vk-list">
              <Li>{t('legal.terms_allowed_create_events')}</Li>
              <Li>{t('legal.terms_allowed_communicate')}</Li>
              <Li>{t('legal.terms_allowed_profile')}</Li>
            </ul>
            <p>{t('legal.terms_section4_not_allowed_intro')}</p>
            <ul className="vk-list">
              <Li>{t('legal.terms_not_allowed_commercial')}</Li>
              <Li>{t('legal.terms_not_allowed_spam')}</Li>
              <Li>{t('legal.terms_not_allowed_impersonation')}</Li>
              <Li>{t('legal.terms_not_allowed_illegal_content')}</Li>
              <Li>{t('legal.terms_not_allowed_security')}</Li>
              <Li>{t('legal.terms_not_allowed_data_collection')}</Li>
            </ul>
          </Section>

          {/* 5. Brugerindhold */}
          <Section title={t('legal.terms_section5_title')}>
            <p>
              {t('legal.terms_section5_ownership')}
            </p>
            <p>
              {t('legal.terms_section5_responsibility')}
            </p>
          </Section>

          {/* 6. Arrangementer */}
          <Section title={t('legal.terms_section6_title')}>
            <p>
              {t('legal.terms_section6_platform_role')}
            </p>
            <p>
              {t('legal.terms_section6_liability')}
            </p>
          </Section>

          {/* 7. Immaterialrettigheder */}
          <Section title={t('legal.terms_section7_title')}>
            <p>
              {t('legal.terms_section7_description')}
            </p>
          </Section>

          {/* 8. Ansvarsbegrænsning */}
          <Section title={t('legal.terms_section8_title')}>
            <p>
              {t('legal.terms_section8_intro')}
            </p>
            <ul className="vk-list">
              <Li>{t('legal.terms_liability_loss')}</Li>
              <Li>{t('legal.terms_liability_other_users')}</Li>
              <Li>{t('legal.terms_liability_downtime')}</Li>
              <Li>{t('legal.terms_liability_force_majeure')}</Li>
            </ul>
            <p>
              {t('legal.terms_section8_cap')}
            </p>
          </Section>

          {/* 9. Opsigelse */}
          <Section title={t('legal.terms_section9_title')}>
            <p>
              {t('legal.terms_section9_user_deletion')}
            </p>
            <p>
              {t('legal.terms_section9_suspension')}
            </p>
          </Section>

          {/* 10. Ændringer */}
          <Section title={t('legal.terms_section10_title')}>
            <p>
              {t('legal.terms_section10_description')}
            </p>
          </Section>

          {/* 11. Lovvalg */}
          <Section title={t('legal.terms_section11_title')}>
            <p>
              {t('legal.terms_section11_governing_law')}
            </p>
            <p>
              {t('legal.terms_section11_complaint')} <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="vk-link">ec.europa.eu/consumers/odr</a>.
            </p>
          </Section>

          {/* 12. Kontakt */}
          <Section title={t('legal.terms_section12_title')}>
            <p>
              {t('legal.terms_section12_intro')}
            </p>
            <div className="vk-contact-box">
              <p className="vk-contact-name">B-Social</p>
              <p>{t('legal.privacy_aalborg_denmark')}</p>
              <p>
                {t('legal.privacy_email_label')}:{" "}
                <a href="mailto:kontakt@b-social.net" className="vk-link">
                  kontakt@b-social.net
                </a>
              </p>
            </div>
          </Section>

          {/* Footer */}
          <div className="vk-footer vk-fade-up">
            <p className="vk-footer-line">{t('legal.terms_footer_line1')}</p>
            <p className="vk-footer-line">{t('legal.terms_footer_line2')}</p>
          </div>
        </div>
      </div>
    </>
  );
}
