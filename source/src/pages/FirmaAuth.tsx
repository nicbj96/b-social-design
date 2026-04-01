import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, Building2, Check, Heart, Zap, Crown, Sparkles, Gift } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type Plan = "starter" | "vaekst" | "partner";

const PLANS: {
  id: Plan;
  nameKey: string;
  revenueShare: string;
  revenueSharePct: number;
  features: string[];
  idealForKey: string;
  icon: typeof Heart;
  color: string;
  highlight?: boolean;
}[] = [
  {
    id: "starter",
    nameKey: "pricing.starter",
    revenueShare: "0%",
    revenueSharePct: 0,
    icon: Heart,
    color: "text-emerald-400",
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
    color: "text-[#4ECDC4]",
    features: ["pricing.feature_vaekst_1", "pricing.feature_vaekst_2", "pricing.feature_vaekst_3", "pricing.feature_vaekst_4", "pricing.feature_vaekst_5"],
    idealForKey: "pricing.ideal_for_vaekst",
  },
  {
    id: "partner",
    nameKey: "pricing.partner",
    revenueShare: "3%",
    revenueSharePct: 3,
    icon: Crown,
    color: "text-purple-400",
    features: ["pricing.feature_partner_1", "pricing.feature_partner_2", "pricing.feature_partner_3", "pricing.feature_partner_4", "pricing.feature_partner_5"],
    idealForKey: "pricing.ideal_for_partner",
  },
];

export default function FirmaAuth() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, isLoggedIn, refreshProfile } = useAuth();

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
    <div className="relative min-h-svh flex flex-col" style={{ background: "#060a0f" }}>

      {/* ── Cinematic header ── */}
      <div
        className="relative w-full min-h-[40vh] bg-cover bg-center flex flex-col"
        style={{ backgroundImage: "url('/aurora.jpg')" }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(6,10,15,0.3) 0%, rgba(6,10,15,0.85) 100%)",
          }}
        />

        {/* Back button — overlaid top-left */}
        <div className="relative z-10 pt-12 px-5">
          <button
            onClick={() => setLocation("/feed")}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors backdrop-blur-sm"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
        </div>

        {/* Header copy */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-10 px-6 text-center">
          {/* Eyebrow */}
          <div className="eyebrow mb-4">
            <div className="eyebrow-line" />
            B-Social Firma
            <div className="eyebrow-line" />
          </div>

          {/* Main heading */}
          <h1
            className="text-white text-4xl leading-tight mb-3"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              letterSpacing: "-0.5px",
            }}
          >
            Bliv en del af{" "}
            <em className="not-italic text-[#4ECDC4]">B-Social</em>
          </h1>

          <p className="text-white/55 text-sm max-w-sm">
            {t('firma.start_free')}
          </p>

          <div className="flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Gift size={12} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-bold">{t('firma.all_plans_free_badge')}</span>
          </div>
        </div>
      </div>

      {/* ── Form area ── */}
      <div className="flex-1 flex flex-col items-center px-5 pb-16 pt-8">
        <div
          className="w-full max-w-2xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Not-logged-in warning */}
          {!isLoggedIn && (
            <div className="p-4 rounded-2xl bg-yellow-500/15 border border-yellow-500/25 text-yellow-300 text-sm text-center">
              {t('auth.must_be_logged_in')}{" "}
              <span
                className="underline cursor-pointer font-semibold"
                onClick={() => setLocation("/auth")}
              >
                {t('auth.login_here')}
              </span>
            </div>
          )}

          {isLoggedIn && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Company info */}
              <div className="space-y-4">
                <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                  {t('firma.company_info')}
                </h2>

                <div className="space-y-1">
                  <label className="text-white/60 text-xs font-medium pl-1">{t('firma.company_name')}</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="F.eks. Aalborg Fitness"
                    required
                    className="premium-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 text-xs font-medium pl-1">{t('firma.cvr')}</label>
                  <input
                    type="text"
                    value={cvr}
                    onChange={(e) => setCvr(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="12345678"
                    required
                    maxLength={8}
                    className="premium-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-white/60 text-xs font-medium pl-1">{t('firma.company_email')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kontakt@firma.dk"
                      required
                      className="premium-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/60 text-xs font-medium pl-1">{t('firma.phone_optional')}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+45 12 34 56 78"
                      className="premium-input"
                    />
                  </div>
                </div>
              </div>

              {/* Plan selection */}
              <div className="space-y-3">
                <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                  {t('firma.choose_plan')}
                </h2>
                <p className="text-white/30 text-xs">{t('firma.all_plans_free')}</p>
                <div className="grid grid-cols-1 gap-3">
                  {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative p-4 rounded-2xl border text-left transition-all ${
                          selectedPlan === plan.id
                            ? "bg-[#4ECDC4]/15 border-[#4ECDC4]/50 ring-1 ring-[#4ECDC4]/30"
                            : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
                        }`}
                      >
                        {selectedPlan === plan.id && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#4ECDC4] flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                        {plan.highlight && (
                          <div className="absolute top-3 right-10 px-2 py-0.5 rounded-full bg-[#4ECDC4]/20 text-[#4ECDC4] text-[11px] font-bold uppercase">
                            {t('pricing.popular')}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={16} className={plan.color} />
                          <span className="text-white font-semibold text-sm">{t(plan.nameKey)}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            {t('pricing.free_badge')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 mb-2">
                          <Sparkles size={12} className={plan.color} />
                          <span className="text-white/70 text-xs font-medium">
                            {plan.revenueSharePct === 0
                              ? t('pricing.no_revenue_share')
                              : t('pricing.revenue_share_of', { pct: plan.revenueShare })}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {plan.features.map((f) => (
                            <li key={f} className="text-white/40 text-xs flex items-center gap-1.5">
                              <Check size={10} className="text-[#4ECDC4] shrink-0" />
                              {t(f)}
                            </li>
                          ))}
                        </ul>
                        <p className="text-white/25 text-xs mt-2">{t('pricing.ideal_for', { audience: t(plan.idealForKey) })}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !isLoggedIn}
                className="w-full py-4 rounded-2xl bg-[#4ECDC4] text-[#0a0f1a] font-semibold text-base hover:bg-[#3dbdb5] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#4ECDC4]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? t('firma.creating_company') : t('firma.create_account_free')}
              </button>
            </form>
          )}

          {/* Terms */}
          <p className="text-center text-white/30 text-xs leading-relaxed">
            {t('auth.terms')}{" "}
            <span
              className="text-white/50 underline cursor-pointer"
              onClick={() => setLocation("/vilkaar")}
            >
              vilkår
            </span>{" "}
            og{" "}
            <span
              className="text-white/50 underline cursor-pointer"
              onClick={() => setLocation("/privatlivspolitik")}
            >
              {t('auth.privacy')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
