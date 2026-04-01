import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, Building2, Check, Heart, Zap, Crown, Sparkles, Gift } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const firmaAuthCSS = `${pageBase("fa")}

/* ── Hero section ── */
.fa-hero {
  position: relative;
  width: 100%;
  min-height: 44vh;
  background: url('/firma-hero.png') center/cover no-repeat;
  display: flex;
  flex-direction: column;
}
.fa-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(6,10,15,0.25) 0%,
    rgba(6,10,15,0.6) 50%,
    rgba(6,10,15,1) 100%
  );
}

/* ── Back button ── */
.fa-back {
  position: relative; z-index: 2;
  width: 38px; height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: rgba(255,255,255,0.9);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  transition: background 0.25s;
  margin: 48px 0 0 20px;
}
.fa-back:hover { background: rgba(255,255,255,0.14); }

/* ── Hero content ── */
.fa-hero-content {
  position: relative; z-index: 2;
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: flex-end;
  padding: 0 24px 40px; text-align: center;
}
.fa-title {
  font-family: var(--serif);
  font-size: clamp(34px, 5vw, 52px);
  font-weight: 400; line-height: 1.08;
  letter-spacing: -0.5px;
  color: var(--pg-white); margin: 16px 0 12px;
}
.fa-title em { font-style: italic; color: var(--teal); }
.fa-subtitle {
  font-size: 14px; color: var(--pg-white-dim);
  max-width: 400px; line-height: 1.55;
}
.fa-badge {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 16px; padding: 6px 14px;
  border-radius: 100px;
  background: rgba(78,205,196,0.1);
  border: 1px solid rgba(78,205,196,0.2);
  font-size: 11px; font-weight: 700;
  color: var(--teal); text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ── Form area ── */
.fa-form-area {
  flex: 1; display: flex; flex-direction: column;
  align-items: center;
  padding: 32px 20px 64px;
}

/* ── Form card (premium glass) ── */
.fa-form-card {
  width: 100%; max-width: 680px;
  border-radius: 24px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 28px;
  display: flex; flex-direction: column; gap: 24px;
}
@media (min-width: 640px) {
  .fa-form-card { padding: 36px; }
}

/* ── Warning / error banners ── */
.fa-warning {
  padding: 14px 18px; border-radius: 14px;
  background: rgba(234,179,8,0.12);
  border: 1px solid rgba(234,179,8,0.22);
  color: #fcd34d; font-size: 13px; text-align: center;
  line-height: 1.5;
}
.fa-warning-link {
  text-decoration: underline; cursor: pointer;
  font-weight: 600; color: #fcd34d;
  background: none; border: none; font-size: inherit;
  font-family: inherit;
}
.fa-error {
  padding: 12px 16px; border-radius: 14px;
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.25);
  color: #fca5a5; font-size: 13px; text-align: center;
}

/* ── Section heading inside form ── */
.fa-section-title {
  font-size: 11px; font-weight: 600;
  color: var(--pg-white-dim);
  text-transform: uppercase; letter-spacing: 1.8px;
}

/* ── Label ── */
.fa-field-label {
  font-size: 12px; font-weight: 500;
  color: rgba(255,255,255,0.5);
  padding-left: 4px; margin-bottom: 4px;
}

/* ── Field group ── */
.fa-fields { display: flex; flex-direction: column; gap: 16px; }
.fa-field { display: flex; flex-direction: column; gap: 4px; }
.fa-field-row {
  display: grid; grid-template-columns: 1fr; gap: 16px;
}
@media (min-width: 640px) {
  .fa-field-row { grid-template-columns: 1fr 1fr; }
}

/* ── Plan selection ── */
.fa-plans-header { display: flex; flex-direction: column; gap: 4px; }
.fa-plans-sub { font-size: 12px; color: var(--pg-white-muted); }
.fa-plans-grid { display: flex; flex-direction: column; gap: 12px; }

.fa-plan-card {
  position: relative; padding: 18px;
  border-radius: 16px; text-align: left;
  cursor: pointer; border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s; outline: none;
  font-family: var(--sans);
}
.fa-plan-card:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.15);
}
.fa-plan-card.fa-plan-selected {
  background: rgba(78,205,196,0.1);
  border-color: rgba(78,205,196,0.45);
  box-shadow: 0 0 0 1px rgba(78,205,196,0.2),
              0 8px 32px rgba(78,205,196,0.08);
}

/* Check circle on selected plan */
.fa-plan-check {
  position: absolute; top: 14px; right: 14px;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--teal);
  display: flex; align-items: center; justify-content: center;
}

/* Popular badge */
.fa-plan-popular {
  position: absolute; top: 14px; right: 44px;
  padding: 3px 10px; border-radius: 100px;
  background: rgba(78,205,196,0.15);
  color: var(--teal); font-size: 10px;
  font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Plan header row */
.fa-plan-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 4px; flex-wrap: wrap;
}
.fa-plan-name {
  font-size: 14px; font-weight: 600;
  color: var(--pg-white);
}
.fa-plan-free-chip {
  padding: 2px 10px; border-radius: 100px;
  font-size: 11px; font-weight: 700;
  background: rgba(78,205,196,0.12);
  color: var(--teal);
  border: 1px solid rgba(78,205,196,0.18);
}

/* Revenue share row */
.fa-plan-revenue {
  display: flex; align-items: center; gap: 6px;
  margin: 4px 0 10px;
}
.fa-plan-revenue-text {
  font-size: 12px; color: rgba(255,255,255,0.6);
  font-weight: 500;
}

/* Feature list */
.fa-plan-features {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 5px;
}
.fa-plan-feature {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; color: rgba(255,255,255,0.4);
}
.fa-plan-feature svg { flex-shrink: 0; }

/* Ideal-for text */
.fa-plan-ideal {
  font-size: 11px; color: rgba(255,255,255,0.2);
  margin-top: 8px;
}

/* Plan icon colors */
.fa-icon-emerald { color: #34d399; }
.fa-icon-teal { color: var(--teal); }
.fa-icon-purple { color: #c084fc; }

/* ── Submit button ── */
.fa-submit {
  width: 100%; padding: 16px 28px;
  border-radius: 16px;
  background: var(--teal); color: var(--bg);
  border: none; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.3s;
  font-family: var(--sans);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 8px 32px rgba(78,205,196,0.2);
  margin-top: 8px;
}
.fa-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 40px rgba(78,205,196,0.3);
}
.fa-submit:active { transform: scale(0.98); }
.fa-submit:disabled {
  opacity: 0.55; cursor: not-allowed;
  transform: none; box-shadow: none;
}

/* ── Spinner ── */
@keyframes fa-spin { to { transform: rotate(360deg); } }
.fa-spinner { animation: fa-spin 0.8s linear infinite; }

/* ── Terms ── */
.fa-terms {
  text-align: center; font-size: 12px;
  color: var(--pg-white-muted); line-height: 1.6;
}
.fa-terms-link {
  color: rgba(255,255,255,0.45);
  text-decoration: underline; cursor: pointer;
  background: none; border: none;
  font-size: inherit; font-family: inherit;
}
`;

/* ── Plan definitions ── */
type Plan = "starter" | "vaekst" | "partner";

const PLANS: {
  id: Plan;
  nameKey: string;
  revenueShare: string;
  revenueSharePct: number;
  features: string[];
  idealForKey: string;
  icon: typeof Heart;
  iconClass: string;
  highlight?: boolean;
}[] = [
  {
    id: "starter",
    nameKey: "pricing.starter",
    revenueShare: "0%",
    revenueSharePct: 0,
    icon: Heart,
    iconClass: "fa-icon-emerald",
    features: ["pricing.feature_starter_1", "pricing.feature_starter_2", "pricing.feature_starter_3", "pricing.feature_starter_4"],
    idealForKey: "pricing.ideal_for_starter",
  },
  {
    id: "vaekst",
    nameKey: "pricing.vaekst",
    revenueShare: "5%",
    revenueSharePct: 5,
    highlight: true,
    icon: Zap,
    iconClass: "fa-icon-teal",
    features: ["pricing.feature_vaekst_1", "pricing.feature_vaekst_2", "pricing.feature_vaekst_3", "pricing.feature_vaekst_4", "pricing.feature_vaekst_5"],
    idealForKey: "pricing.ideal_for_vaekst",
  },
  {
    id: "partner",
    nameKey: "pricing.partner",
    revenueShare: "3%",
    revenueSharePct: 3,
    icon: Crown,
    iconClass: "fa-icon-purple",
    features: ["pricing.feature_partner_1", "pricing.feature_partner_2", "pricing.feature_partner_3", "pricing.feature_partner_4", "pricing.feature_partner_5"],
    idealForKey: "pricing.ideal_for_partner",
  },
];

export default function FirmaAuth() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, isLoggedIn, refreshProfile } = useAuth();
  const containerRef = useFadeUp("fa");

  // Restore form data from sessionStorage (in case user was redirected to auth)
  const savedForm = typeof window !== 'undefined' ? sessionStorage.getItem('firma_form_data') : null;
  const parsed = savedForm ? JSON.parse(savedForm) : null;

  const [companyName, setCompanyName] = useState(parsed?.companyName || "");
  const [cvr, setCvr] = useState(parsed?.cvr || "");
  const [email, setEmail] = useState(parsed?.email || "");
  const [phone, setPhone] = useState(parsed?.phone || "");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(parsed?.selectedPlan || "starter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear saved form data once restored
  if (parsed) sessionStorage.removeItem('firma_form_data');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLoggedIn) {
      // Save form data before redirecting to auth
      sessionStorage.setItem('firma_form_data', JSON.stringify({ companyName, cvr, email, phone, selectedPlan }));
      setLocation('/auth?returnTo=/firma/auth');
      return;
    }

    if (!companyName.trim()) {
      setError(t('firma.company_name_required'));
      return;
    }
    if (!cvr.trim() || cvr.length < 8) {
      setError(t('firma.cvr_required'));
      return;
    }
    if (!email.trim()) {
      setError(t('firma.email_required'));
      return;
    }

    setLoading(true);

    try {
      // 1. Create company entry
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: companyName.trim(),
          cvr: cvr.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          plan: selectedPlan,
          created_by: user!.id,
        })
        .select("id")
        .single();

      if (companyError) {
        if (companyError.message.includes("duplicate") || companyError.message.includes("unique")) {
          setError(t('firma.duplicate_cvr'));
        } else {
          setError(t('firma.create_error', { message: companyError.message }));
        }
        setLoading(false);
        return;
      }

      // 2. Create company_members entry
      const { error: memberError } = await supabase
        .from("company_members")
        .insert({
          company_id: company.id,
          user_id: user!.id,
          role: "owner",
        });

      if (memberError) {
        console.error("Company member creation error:", memberError);
      }

      // 3. Update user profile role to 'firma'
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "firma" })
        .eq("id", user!.id);

      if (profileError) {
        console.error("Profile role update error:", profileError);
      }

      // 4. Refresh profile to pick up new role + companyId
      await refreshProfile();

      // 5. Redirect to firma dashboard
      setLocation("/firma");
    } catch (err) {
      setError(t('firma.unexpected_error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{firmaAuthCSS}</style>
      <div className="fa-root" ref={containerRef}>

        {/* ── Cinematic hero ── */}
        <div className="fa-hero">
          <div className="fa-hero-overlay" />

          {/* Back button */}
          <button className="fa-back" onClick={() => setLocation("/feed")}>
            <ArrowLeft size={18} />
          </button>

          {/* Hero content */}
          <div className="fa-hero-content fa-fade-up">
            <div className="fa-eyebrow">
              <span className="fa-eyebrow-line" />
              B-Social Firma
              <span className="fa-eyebrow-line" />
            </div>

            <h1 className="fa-title">
              Bliv en del af <em>B-Social</em>
            </h1>

            <p className="fa-subtitle">
              {t('firma.start_free')}
            </p>

            <div className="fa-badge">
              <Gift size={12} />
              <span>{t('firma.all_plans_free_badge')}</span>
            </div>
          </div>
        </div>

        {/* ── Form area ── */}
        <div className="fa-form-area">
          <div className="fa-form-card fa-fade-up fa-d1">

            {/* Not-logged-in warning */}
            {!isLoggedIn && (
              <div className="fa-warning">
                {t('auth.must_be_logged_in')}{" "}
                <button
                  className="fa-warning-link"
                  onClick={() => setLocation("/auth")}
                >
                  {t('auth.login_here')}
                </button>
              </div>
            )}

            {isLoggedIn && (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                {error && (
                  <div className="fa-error">{error}</div>
                )}

                {/* Company info */}
                <div className="fa-fields fa-fade-up fa-d2">
                  <h2 className="fa-section-title">{t('firma.company_info')}</h2>

                  <div className="fa-field">
                    <label className="fa-field-label">{t('firma.company_name')}</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="F.eks. Aalborg Fitness"
                      required
                      className="fa-input"
                    />
                  </div>

                  <div className="fa-field">
                    <label className="fa-field-label">{t('firma.cvr')}</label>
                    <input
                      type="text"
                      value={cvr}
                      onChange={(e) => setCvr(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      placeholder="12345678"
                      required
                      maxLength={8}
                      className="fa-input"
                    />
                  </div>

                  <div className="fa-field-row">
                    <div className="fa-field">
                      <label className="fa-field-label">{t('firma.company_email')}</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="kontakt@firma.dk"
                        required
                        className="fa-input"
                      />
                    </div>
                    <div className="fa-field">
                      <label className="fa-field-label">{t('firma.phone_optional')}</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+45 12 34 56 78"
                        className="fa-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Plan selection */}
                <div className="fa-fade-up fa-d3" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="fa-plans-header">
                    <h2 className="fa-section-title">{t('firma.choose_plan')}</h2>
                    <p className="fa-plans-sub">{t('firma.all_plans_free')}</p>
                  </div>

                  <div className="fa-plans-grid">
                    {PLANS.map((plan) => {
                      const Icon = plan.icon;
                      const isSelected = selectedPlan === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`fa-plan-card${isSelected ? " fa-plan-selected" : ""}`}
                        >
                          {isSelected && (
                            <span className="fa-plan-check">
                              <Check size={12} color="#fff" />
                            </span>
                          )}
                          {plan.highlight && (
                            <span className="fa-plan-popular">
                              {t('pricing.popular')}
                            </span>
                          )}

                          <div className="fa-plan-header">
                            <Icon size={16} className={plan.iconClass} />
                            <span className="fa-plan-name">{t(plan.nameKey)}</span>
                            <span className="fa-plan-free-chip">{t('pricing.free_badge')}</span>
                          </div>

                          <div className="fa-plan-revenue">
                            <Sparkles size={12} className={plan.iconClass} />
                            <span className="fa-plan-revenue-text">
                              {plan.revenueSharePct === 0
                                ? t('pricing.no_revenue_share')
                                : t('pricing.revenue_share_of', { pct: plan.revenueShare })}
                            </span>
                          </div>

                          <ul className="fa-plan-features">
                            {plan.features.map((f) => (
                              <li key={f} className="fa-plan-feature">
                                <Check size={10} style={{ color: "var(--teal)" }} />
                                {t(f)}
                              </li>
                            ))}
                          </ul>

                          <p className="fa-plan-ideal">
                            {t('pricing.ideal_for', { audience: t(plan.idealForKey) })}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !isLoggedIn}
                  className="fa-submit fa-fade-up fa-d4"
                >
                  {loading && <Loader2 size={18} className="fa-spinner" />}
                  {loading ? t('firma.creating_company') : t('firma.create_account_free')}
                </button>
              </form>
            )}

            {/* Terms */}
            <p className="fa-terms">
              {t('auth.terms')}{" "}
              <button
                className="fa-terms-link"
                onClick={() => setLocation("/vilkaar")}
              >
                vilkår
              </button>{" "}
              og{" "}
              <button
                className="fa-terms-link"
                onClick={() => setLocation("/privatlivspolitik")}
              >
                {t('auth.privacy')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
