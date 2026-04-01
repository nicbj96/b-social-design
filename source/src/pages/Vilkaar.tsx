import { ArrowLeft, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <h2 className="text-white font-semibold text-base">{title}</h2>
      <div className="space-y-2 text-white/70 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#4ECDC4] flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

export default function Vilkaar() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  return (
    <div
      className="relative min-h-svh pb-16"
      style={{ background: "#060a0f" }}
      data-testid="vilkaar-page"
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 pt-12 pb-3 px-5 flex items-center gap-3"
        style={{ background: "linear-gradient(to bottom, rgba(6,10,15,0.97) 60%, transparent)" }}
      >
        <button
          onClick={() => setLocation(-1 as unknown as string)}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
          aria-label={t('legal.go_back')}
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-white text-xl font-serif flex-1" style={{ fontWeight: 400 }}>{t('legal.terms_title')}</h1>
        <LanguageSwitcher variant="toggle" />
      </div>

      <div className="px-5 mt-2 space-y-4">
        {/* Intro card */}
        <div className="glass-card-strong rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">B-Social.net</p>
            <p className="text-white/50 text-xs mt-0.5">{t('legal.terms_effective_date')}</p>
            <p className="text-white/60 text-xs mt-2 leading-relaxed">
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
            {t('legal.terms_contact_label')}: <a href="mailto:kontakt@b-social.net" className="text-[#4ECDC4] underline underline-offset-2">kontakt@b-social.net</a>
          </p>
        </Section>

        {/* 2. Acceptbetingelser */}
        <Section title={t('legal.terms_section2_title')}>
          <p>
            {t('legal.terms_section2_intro')}
          </p>
          <ul className="space-y-1.5 mt-1">
            <Li>{t('legal.terms_accept_age')}</Li>
            <Li>{t('legal.terms_accept_read')}</Li>
            <Li>{t('legal.terms_accept_correct_info')}</Li>
            <Li>{t('legal.terms_accept_compliance')}</Li>
          </ul>
        </Section>

        {/* 3. Brugerkonto */}
        <Section title={t('legal.terms_section3_title')}>
          <p>
            {t('legal.terms_section3_responsibility')} <a href="mailto:kontakt@b-social.net" className="text-[#4ECDC4] underline underline-offset-2">kontakt@b-social.net</a>{t('legal.terms_section3_unauthorized_suffix')}
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
          <ul className="space-y-1.5 mt-1">
            <Li>{t('legal.terms_allowed_create_events')}</Li>
            <Li>{t('legal.terms_allowed_communicate')}</Li>
            <Li>{t('legal.terms_allowed_profile')}</Li>
          </ul>
          <p className="mt-2">{t('legal.terms_section4_not_allowed_intro')}</p>
          <ul className="space-y-1.5 mt-1">
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
          <ul className="space-y-1.5 mt-1">
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
            {t('legal.terms_section11_complaint')} <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[#4ECDC4] underline underline-offset-2">ec.europa.eu/consumers/odr</a>.
          </p>
        </Section>

        {/* 12. Kontakt */}
        <Section title={t('legal.terms_section12_title')}>
          <p>
            {t('legal.terms_section12_intro')}
          </p>
          <div className="glass-card rounded-xl p-3 space-y-0.5 text-white/60 text-xs mt-1">
            <p className="text-white/80 font-medium">B-Social</p>
            <p>{t('legal.privacy_aalborg_denmark')}</p>
            <p>
              {t('legal.privacy_email_label')}:{" "}
              <a href="mailto:kontakt@b-social.net" className="text-[#4ECDC4] underline underline-offset-2">
                kontakt@b-social.net
              </a>
            </p>
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center pt-2 pb-8">
          <p className="text-white/20 text-xs">{t('legal.terms_footer_line1')}</p>
          <p className="text-white/15 text-xs mt-1">{t('legal.terms_footer_line2')}</p>
        </div>
      </div>
    </div>
  );
}
