import { ArrowLeft, Shield } from "lucide-react";
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-white/90 font-medium text-sm">{title}</h3>
      <div className="text-white/70 text-sm leading-relaxed space-y-1">
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

export default function Privatlivspolitik() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  return (
    <div
      className="relative min-h-svh pb-16"
      style={{ background: "#060a0f" }}
      data-testid="privatlivspolitik-page"
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
        <h1 className="text-white text-xl font-serif flex-1" style={{ fontWeight: 400 }}>{t('legal.privacy_title')}</h1>
        <LanguageSwitcher variant="toggle" />
      </div>

      <div className="px-5 mt-2 space-y-4 overflow-x-hidden break-words">
        {/* Intro card */}
        <div className="glass-card-strong rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#4ECDC4]/15 flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-[#4ECDC4]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">B-Social.net</p>
            <p className="text-white/50 text-xs mt-0.5">{t('legal.privacy_last_updated')}</p>
            <p className="text-white/60 text-xs mt-2 leading-relaxed">
              {t('legal.privacy_intro_description')}
            </p>
          </div>
        </div>

        {/* 1. Dataansvarlig */}
        <Section title={t('legal.privacy_section1_title')}>
          <p>
            {t('legal.privacy_section1_responsible')}
          </p>
          <div className="glass-card rounded-xl p-3 space-y-0.5 text-white/60 text-xs">
            <p className="text-white/80 font-medium">B-Social</p>
            <p>{t('legal.privacy_aalborg_denmark')}</p>
            <p>{t('legal.privacy_email_label')}: <a href="mailto:kontakt@b-social.net" className="text-[#4ECDC4] underline underline-offset-2">kontakt@b-social.net</a></p>
            <p>{t('legal.privacy_website_label')}: <a href="https://b-social.net" className="text-[#4ECDC4] underline underline-offset-2">b-social.net</a></p>
          </div>
        </Section>

        {/* 2. Oplysninger vi indsamler */}
        <Section title={t('legal.privacy_section2_title')}>
          <SubSection title={t('legal.privacy_section2_1_title')}>
            <ul className="space-y-1.5">
              <Li>{t('legal.privacy_profile_name_email')}</Li>
              <Li>{t('legal.privacy_profile_avatar')}</Li>
              <Li>{t('legal.privacy_profile_city_interests')}</Li>
              <Li>{t('legal.privacy_profile_google_oauth')}</Li>
            </ul>
          </SubSection>
          <SubSection title={t('legal.privacy_section2_2_title')}>
            <ul className="space-y-1.5">
              <Li>{t('legal.privacy_activity_participation')}</Li>
              <Li>{t('legal.privacy_activity_messages')}</Li>
              <Li>{t('legal.privacy_activity_events_interactions')}</Li>
            </ul>
          </SubSection>
          <SubSection title={t('legal.privacy_section2_3_title')}>
            <ul className="space-y-1.5">
              <Li>{t('legal.privacy_location_city_radius')}</Li>
              <Li>{t('legal.privacy_location_no_gps')}</Li>
            </ul>
          </SubSection>
          <SubSection title={t('legal.privacy_section2_4_title')}>
            <ul className="space-y-1.5">
              <Li>{t('legal.privacy_technical_push_token')}</Li>
              <Li>{t('legal.privacy_technical_ip_browser')}</Li>
              <Li>{t('legal.privacy_technical_gtm')}</Li>
            </ul>
          </SubSection>
          <SubSection title={t('legal.privacy_section2_5_title')}>
            <p>
              {t('legal.privacy_ai_chat_description')}
            </p>
          </SubSection>
        </Section>

        {/* 3. Formål og retsgrundlag */}
        <Section title={t('legal.privacy_section3_title')}>
          <p>{t('legal.privacy_section3_intro')}</p>
          <div className="space-y-3 mt-1">
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_purpose_account')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_legal_basis_contract_b')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_purpose_events_matching')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_legal_basis_contract_b')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_purpose_communication')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_legal_basis_contract_b')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_purpose_analytics')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_legal_basis_legitimate_f')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_purpose_legal_obligations')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_legal_basis_obligation_c')}</p>
            </div>
          </div>
        </Section>

        {/* 4. Databehandlere og videregivelse */}
        <Section title={t('legal.privacy_section4_title')}>
          <p>
            {t('legal.privacy_section4_intro')}
          </p>
          <div className="space-y-3 mt-1">
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_processor_supabase')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_processor_supabase_desc')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_processor_cloudflare')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_processor_cloudflare_desc')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_processor_google')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_processor_google_desc')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_processor_cf_ai')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_processor_cf_ai_desc')}</p>
            </div>
          </div>
          <p className="mt-2">
            {t('legal.privacy_section4_no_third_party')}
          </p>
        </Section>

        {/* 5. Overførsler til tredjelande */}
        <Section title={t('legal.privacy_section5_title')}>
          <p>
            {t('legal.privacy_section5_eu_hosting')}
          </p>
          <p>
            {t('legal.privacy_section5_us_transfers')}
          </p>
        </Section>

        {/* 6. Opbevaringsperiode */}
        <Section title={t('legal.privacy_section6_title')}>
          <ul className="space-y-1.5">
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
            {t('legal.privacy_section7_intro')} <a href="mailto:kontakt@b-social.net" className="text-[#4ECDC4] underline underline-offset-2">kontakt@b-social.net</a>:
          </p>
          <div className="space-y-2 mt-1">
            <div className="glass-card rounded-xl p-3 space-y-0.5">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_right_access')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_right_access_desc')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-0.5">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_right_rectification')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_right_rectification_desc')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-0.5">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_right_erasure')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_right_erasure_desc')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-0.5">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_right_portability')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_right_portability_desc')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-0.5">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_right_objection')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_right_objection_desc')}</p>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-0.5">
              <p className="text-white/80 text-xs font-medium">{t('legal.privacy_right_restriction')}</p>
              <p className="text-white/50 text-xs">{t('legal.privacy_right_restriction_desc')}</p>
            </div>
          </div>
          <p className="mt-2">
            {t('legal.privacy_section7_response_time')}
          </p>
        </Section>

        {/* 8. Cookies */}
        <Section title={t('legal.privacy_section8_title')}>
          <p>
            {t('legal.privacy_section8_intro')}
          </p>
          <SubSection title={t('legal.privacy_cookies_necessary_title')}>
            <p>
              {t('legal.privacy_cookies_necessary_desc')}
            </p>
          </SubSection>
          <SubSection title={t('legal.privacy_cookies_analytics_title')}>
            <p>
              {t('legal.privacy_cookies_analytics_desc')}
            </p>
          </SubSection>
          <SubSection title={t('legal.privacy_cookies_pwa_title')}>
            <p>
              {t('legal.privacy_cookies_pwa_desc')}
            </p>
          </SubSection>
        </Section>

        {/* 9. Sikkerhed */}
        <Section title={t('legal.privacy_section9_title')}>
          <p>
            {t('legal.privacy_section9_intro')}
          </p>
          <ul className="space-y-1.5 mt-1">
            <Li>{t('legal.privacy_security_https')}</Li>
            <Li>{t('legal.privacy_security_rls')}</Li>
            <Li>{t('legal.privacy_security_encryption')}</Li>
            <Li>{t('legal.privacy_security_ddos')}</Li>
          </ul>
          <p>
            {t('legal.privacy_section9_breach_notice')}
          </p>
        </Section>

        {/* 10. Børn */}
        <Section title={t('legal.privacy_section10_title')}>
          <p>
            {t('legal.privacy_section10_description')} <a href="mailto:kontakt@b-social.net" className="text-[#4ECDC4] underline underline-offset-2">kontakt@b-social.net</a>{t('legal.privacy_section10_contact_suffix')}
          </p>
        </Section>

        {/* 11. Ændringer */}
        <Section title={t('legal.privacy_section11_title')}>
          <p>
            {t('legal.privacy_section11_description')}
          </p>
        </Section>

        {/* 12. Klage */}
        <Section title={t('legal.privacy_section12_title')}>
          <p>
            {t('legal.privacy_section12_intro')}
          </p>
          <div className="glass-card rounded-xl p-3 space-y-0.5 text-white/60 text-xs mt-1">
            <p className="text-white/80 font-medium">{t('legal.privacy_authority_name')}</p>
            <p>Carl Jacobsens Vej 35</p>
            <p>2500 Valby</p>
            <p>{t('legal.privacy_phone_label')}: +45 33 19 32 00</p>
            <p>
              {t('legal.privacy_website_label')}:{" "}
              <a
                href="https://www.datatilsynet.dk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4ECDC4] underline underline-offset-2"
              >
                datatilsynet.dk
              </a>
            </p>
          </div>
        </Section>

        {/* 13. Kontakt */}
        <Section title={t('legal.privacy_section13_title')}>
          <p>
            {t('legal.privacy_section13_intro')}
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
          <p className="text-white/20 text-xs">{t('legal.privacy_footer_line1')}</p>
          <p className="text-white/15 text-xs mt-1">{t('legal.privacy_footer_line2')}</p>
        </div>
      </div>
    </div>
  );
}
