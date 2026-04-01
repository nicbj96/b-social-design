import FirmaLayout from "@/components/FirmaLayout";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  ArrowRight,
  Receipt,
  Zap,
  Crown,
  Building2,
  Heart,
  TrendingUp,
  Sparkles,
  Loader2,
  Percent,
  Gift,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

type Plan = "starter" | "vaekst" | "partner";

interface PlanDef {
  id: Plan;
  nameKey: string;
  taglineKey: string;
  price: string;
  revenueShare: string;
  revenueSharePct: number;
  highlight?: boolean;
  icon: typeof Heart;
  color: string;
  features: string[];
  idealForKey: string;
}

const PLANS: PlanDef[] = [
  {
    id: "starter",
    nameKey: "pricing.starter",
    taglineKey: "pricing.always_free",
    price: "0 kr/md",
    revenueShare: "0%",
    revenueSharePct: 0,
    icon: Heart,
    color: "#34d399",
    features: [
      "pricing.feature_starter_1",
      "pricing.feature_starter_2",
      "pricing.feature_starter_3",
      "pricing.feature_starter_4",
    ],
    idealForKey: "pricing.ideal_for_starter",
  },
  {
    id: "vaekst",
    nameKey: "pricing.vaekst",
    taglineKey: "pricing.no_fixed_costs",
    price: "Betaler ved succes",
    revenueShare: "5%",
    revenueSharePct: 5,
    highlight: true,
    icon: Zap,
    color: "#4ECDC4",
    features: [
      "pricing.feature_vaekst_1",
      "pricing.feature_vaekst_2_full",
      "pricing.feature_vaekst_3",
      "pricing.feature_vaekst_4_full",
      "pricing.feature_vaekst_5",
    ],
    idealForKey: "pricing.ideal_for_vaekst",
  },
  {
    id: "partner",
    nameKey: "pricing.partner",
    taglineKey: "pricing.lower_rate",
    price: "Laveste provision",
    revenueShare: "3%",
    revenueSharePct: 3,
    icon: Crown,
    color: "#c084fc",
    features: [
      "pricing.feature_partner_1",
      "pricing.feature_partner_2",
      "pricing.feature_partner_3",
      "pricing.feature_partner_4",
      "pricing.feature_partner_5_full",
      "pricing.feature_partner_6",
    ],
    idealForKey: "pricing.ideal_for_partner",
  },
];

interface RevenueMonth {
  month: string;
  revenue: number;
  bsocialShare: number;
  status: "settled" | "pending";
}

/* ── Scoped CSS ── */
const firmaFaktureringCSS = `
${pageBase("ff")}

/* ── Page section spacing ── */
.ff-sections { display: flex; flex-direction: column; gap: 28px; padding: 0 0 48px; }

/* ── Header ── */
.ff-header { margin-bottom: 4px; }
.ff-title {
  font-family: var(--serif);
  font-size: clamp(26px, 3.5vw, 40px);
  font-weight: 400;
  letter-spacing: -0.5px;
  line-height: 1.1;
  color: var(--pg-white);
}
.ff-title em { font-style: italic; color: var(--teal); }
.ff-subtitle {
  font-size: 14px;
  color: var(--pg-white-muted);
  margin-top: 6px;
  line-height: 1.5;
}

/* ── Revenue share banner ── */
.ff-banner {
  background: linear-gradient(135deg, rgba(78,205,196,0.08) 0%, rgba(78,205,196,0.02) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(78,205,196,0.2);
  border-radius: 16px;
  padding: 22px 24px;
}
.ff-banner-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.ff-banner-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ff-banner-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  background: rgba(78,205,196,0.15);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ff-banner-icon svg { color: var(--teal); }
.ff-banner-plan {
  font-size: 17px;
  font-weight: 600;
  color: var(--pg-white);
  display: flex;
  align-items: center;
  gap: 10px;
}
.ff-badge {
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ff-badge-teal {
  background: rgba(78,205,196,0.15);
  color: var(--teal);
  border: 1px solid rgba(78,205,196,0.2);
}
.ff-badge-green {
  background: rgba(52,211,153,0.15);
  color: #34d399;
  border: 1px solid rgba(52,211,153,0.2);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}
.ff-banner-desc {
  font-size: 13px;
  color: var(--pg-white-muted);
  margin-top: 2px;
}

/* ── Revenue stat cards ── */
.ff-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 640px) {
  .ff-stats-grid { grid-template-columns: 1fr; }
}
.ff-stat-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 22px 20px;
  transition: all 0.3s;
}
.ff-stat-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  transform: translateY(-2px);
}
.ff-stat-card-label {
  font-size: 11px;
  color: var(--pg-white-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 500;
}
.ff-stat-card-value {
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 400;
  color: var(--pg-white);
  line-height: 1;
  margin-top: 8px;
}
.ff-stat-card-value-green { color: #34d399; }

/* ── Info callout ── */
.ff-callout {
  background: rgba(96,165,250,0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(96,165,250,0.12);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.ff-callout-icon { color: #60a5fa; flex-shrink: 0; margin-top: 2px; }
.ff-callout-title { font-size: 14px; font-weight: 500; color: #93bbfd; }
.ff-callout-desc { font-size: 12px; color: var(--pg-white-muted); margin-top: 4px; line-height: 1.5; }

/* ── Plans section ── */
.ff-plans-header { margin-bottom: 4px; }
.ff-plans-title {
  font-family: var(--serif);
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 400;
  color: var(--pg-white);
}
.ff-plans-desc {
  font-size: 12px;
  color: var(--pg-white-muted);
  margin-top: 4px;
}
.ff-plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}
@media (max-width: 1024px) {
  .ff-plans-grid { grid-template-columns: 1fr; }
}

/* ── Plan card ── */
.ff-plan {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.35s;
}
.ff-plan:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  transform: translateY(-2px);
}
.ff-plan-highlight {
  border-color: rgba(78,205,196,0.3);
  box-shadow: 0 0 0 1px rgba(78,205,196,0.15), 0 8px 32px rgba(78,205,196,0.06);
}
.ff-plan-current {
  box-shadow: 0 0 0 1px rgba(78,205,196,0.35);
}
.ff-plan-popular {
  position: absolute;
  top: -12px; left: 50%; transform: translateX(-50%);
  padding: 4px 16px;
  border-radius: 100px;
  background: var(--teal);
  color: var(--bg);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
}
.ff-plan-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.ff-plan-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--pg-white);
}
.ff-plan-tagline {
  font-size: 12px;
  color: var(--pg-white-muted);
  margin-bottom: 16px;
}

/* Price block */
.ff-plan-price {
  margin-bottom: 18px;
}
.ff-plan-price-amount {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 400;
  color: var(--pg-white);
  line-height: 1;
}
.ff-plan-price-period {
  font-size: 12px;
  color: var(--pg-white-muted);
  margin-left: 6px;
}
.ff-plan-share {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--pg-white);
}

/* Features list */
.ff-plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ff-plan-feature {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--pg-white-muted);
  line-height: 1.4;
}
.ff-plan-feature svg { color: var(--teal); flex-shrink: 0; margin-top: 2px; }

/* Ideal for */
.ff-plan-ideal {
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 16px;
}
.ff-plan-ideal p {
  font-size: 12px;
  color: var(--pg-white-muted);
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Plan CTA */
.ff-plan-cta-current {
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(78,205,196,0.1);
  color: var(--teal);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
}
.ff-plan-cta-switch {
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  color: var(--pg-white);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer;
  transition: all 0.25s;
  font-family: var(--sans);
  width: 100%;
}
.ff-plan-cta-switch:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(78,205,196,0.3);
  color: var(--teal);
}
.ff-plan-cta-switch:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Revenue table ── */
.ff-table-wrap {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
}
.ff-table-header {
  padding: 18px 22px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ff-table-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--pg-white);
  display: flex;
  align-items: center;
  gap: 8px;
}
.ff-table-title svg { color: var(--teal); }
.ff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.ff-table thead tr { border-bottom: 1px solid rgba(255,255,255,0.08); }
.ff-table th {
  padding: 12px 22px;
  font-size: 11px;
  font-weight: 500;
  color: var(--pg-white-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: left;
}
.ff-table th:not(:first-child) { text-align: right; }
.ff-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.2s;
}
.ff-table tbody tr:last-child { border-bottom: none; }
.ff-table tbody tr:hover { background: rgba(255,255,255,0.03); }
.ff-table td {
  padding: 14px 22px;
  color: var(--pg-white);
}
.ff-table td:not(:first-child) { text-align: right; }
.ff-table td:first-child { font-weight: 500; }
.ff-td-muted { color: var(--pg-white-muted) !important; }
.ff-td-green { color: #34d399 !important; font-weight: 500; }

/* Status badge */
.ff-status {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
}
.ff-status-settled {
  background: rgba(52,211,153,0.12);
  color: #34d399;
  border-color: rgba(52,211,153,0.2);
}
.ff-status-pending {
  background: rgba(250,204,21,0.12);
  color: #facc15;
  border-color: rgba(250,204,21,0.2);
}

/* ── Empty state ── */
.ff-empty {
  padding: 48px 24px;
  text-align: center;
}
.ff-empty svg { margin: 0 auto 14px; color: rgba(255,255,255,0.2); }
.ff-empty-title { font-size: 14px; font-weight: 500; color: var(--pg-white-muted); }
.ff-empty-desc { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 6px; }

/* ── Value proposition footer ── */
.ff-footer {
  background: linear-gradient(135deg, rgba(78,205,196,0.06) 0%, rgba(192,132,252,0.05) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 22px 24px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.ff-footer svg { color: var(--teal); flex-shrink: 0; margin-top: 2px; }
.ff-footer-title { font-size: 14px; font-weight: 600; color: var(--pg-white); }
.ff-footer-desc { font-size: 13px; color: var(--pg-white-muted); margin-top: 4px; line-height: 1.6; }

/* ── Loading ── */
.ff-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 128px 0;
}
.ff-spin { animation: ff-spin-kf 1s linear infinite; color: var(--teal); }
@keyframes ff-spin-kf { to { transform: rotate(360deg); } }

/* ── Responsive overflow ── */
.ff-table-scroll { overflow-x: auto; }
`;

export default function FirmaFakturering() {
  const { t } = useTranslation();
  const { user, companyId } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<Plan>("starter");
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [revenueHistory, setRevenueHistory] = useState<RevenueMonth[]>([]);
  const containerRef = useFadeUp("ff");

  // Load company plan from Supabase
  useEffect(() => {
    async function load() {
      if (!user?.id) { setLoading(false); return; }

      // Fetch company
      let cId = companyId;
      if (!cId) {
        const { data } = await supabase
          .from("companies")
          .select("id, plan")
          .eq("created_by", user.id)
          .limit(1)
          .single();
        if (data) {
          cId = data.id;
          const p = data.plan as Plan;
          if (["starter", "vaekst", "partner"].includes(p)) setCurrentPlan(p);
        }
      } else {
        const { data } = await supabase
          .from("companies")
          .select("plan")
          .eq("id", cId)
          .single();
        if (data) {
          const p = data.plan as Plan;
          if (["starter", "vaekst", "partner"].includes(p)) setCurrentPlan(p);
        }
      }

      // Try to load revenue data (table may not exist yet)
      try {
        const { data: revData } = await supabase
          .from("company_revenue")
          .select("month, revenue, bsocial_share, status")
          .eq("company_id", cId)
          .order("month", { ascending: false })
          .limit(12);

        if (revData && revData.length > 0) {
          setRevenueHistory(revData.map((r: any) => ({
            month: r.month,
            revenue: r.revenue || 0,
            bsocialShare: r.bsocial_share || 0,
            status: r.status || "settled",
          })));
          // Current month revenue
          const now = new Date();
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
          const currentEntry = revData.find((r: any) => r.month === currentMonth);
          if (currentEntry) setMonthlyRevenue(currentEntry.revenue || 0);
        }
      } catch {
        // Table doesn't exist yet — that's fine
      }

      setLoading(false);
    }
    load();
  }, [user?.id, companyId]);

  const currentPlanDef = PLANS.find((p) => p.id === currentPlan)!;
  const bsocialShare = Math.round(monthlyRevenue * (currentPlanDef.revenueSharePct / 100));

  async function handlePlanChange(newPlan: Plan) {
    if (newPlan === currentPlan || changingPlan) return;
    setChangingPlan(true);

    const cId = companyId;
    if (cId) {
      await supabase
        .from("companies")
        .update({ plan: newPlan })
        .eq("id", cId);
    }

    setCurrentPlan(newPlan);
    setChangingPlan(false);
  }

  if (loading) {
    return (
      <FirmaLayout>
        <style>{firmaFaktureringCSS}</style>
        <div className="ff-root">
          <div className="ff-loading">
            <Loader2 size={32} className="ff-spin" />
          </div>
        </div>
      </FirmaLayout>
    );
  }

  return (
    <FirmaLayout>
      <style>{firmaFaktureringCSS}</style>
      <div className="ff-root" ref={containerRef}>
        <div className="ff-sections">

          {/* ── Header ── */}
          <div className="ff-header ff-fade-up">
            <div className="ff-eyebrow">
              <div className="ff-eyebrow-line" />
              B-Social Firma
            </div>
            <h1 className="ff-title">{t('pricing.billing_title')}</h1>
            <p className="ff-subtitle">{t('pricing.billing_desc')}</p>
          </div>

          {/* ── Revenue share banner ── */}
          <div className="ff-banner ff-fade-up ff-d1">
            <div className="ff-banner-inner">
              <div className="ff-banner-left">
                <div className="ff-banner-icon">
                  <Percent size={24} />
                </div>
                <div>
                  <div className="ff-banner-plan">
                    {t(currentPlanDef.nameKey)}
                    <span className="ff-badge ff-badge-teal">
                      {currentPlanDef.revenueShare} {t('firma.revenue_share')}
                    </span>
                  </div>
                  <p className="ff-banner-desc">
                    {currentPlanDef.revenueSharePct === 0
                      ? t('pricing.no_costs')
                      : t('pricing.bsocial_takes', { pct: currentPlanDef.revenueShare })}
                  </p>
                </div>
              </div>
              <div>
                <span className="ff-badge ff-badge-green">
                  <Gift size={12} />
                  {t('pricing.free_badge')}
                </span>
              </div>
            </div>
          </div>

          {/* ── Monthly revenue overview ── */}
          <div className="ff-stats-grid ff-fade-up ff-d2">
            <div className="ff-stat-card">
              <p className="ff-stat-card-label">{t('pricing.your_revenue')}</p>
              <p className="ff-stat-card-value">{monthlyRevenue.toLocaleString("da-DK")} kr</p>
            </div>
            <div className="ff-stat-card">
              <p className="ff-stat-card-label">{t('pricing.bsocial_share', { pct: currentPlanDef.revenueShare })}</p>
              <p className="ff-stat-card-value">{bsocialShare.toLocaleString("da-DK")} kr</p>
            </div>
            <div className="ff-stat-card">
              <p className="ff-stat-card-label">{t('pricing.your_profit')}</p>
              <p className="ff-stat-card-value ff-stat-card-value-green">
                {(monthlyRevenue - bsocialShare).toLocaleString("da-DK")} kr
              </p>
            </div>
          </div>

          {/* ── Competitor comparison callout ── */}
          <div className="ff-callout ff-fade-up ff-d2">
            <Info size={16} className="ff-callout-icon" />
            <div>
              <p className="ff-callout-title">{t('pricing.compare_title')}</p>
              <p className="ff-callout-desc">
                {t('pricing.compare_desc', { pct: currentPlanDef.revenueShare })}
              </p>
            </div>
          </div>

          {/* ── Plans grid ── */}
          <div className="ff-fade-up ff-d3">
            <div className="ff-plans-header">
              <h2 className="ff-plans-title">{t('pricing.choose_plan')}</h2>
              <p className="ff-plans-desc">{t('pricing.choose_plan_desc')}</p>
            </div>
            <div className="ff-plans-grid">
              {PLANS.map((plan) => {
                const isCurrent = plan.id === currentPlan;
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.id}
                    className={`ff-plan${plan.highlight ? " ff-plan-highlight" : ""}${isCurrent ? " ff-plan-current" : ""}`}
                  >
                    {plan.highlight && (
                      <div className="ff-plan-popular">
                        {t('pricing.most_popular')}
                      </div>
                    )}

                    <div className="ff-plan-head">
                      <Icon size={18} style={{ color: plan.color }} />
                      <span className="ff-plan-name">{t(plan.nameKey)}</span>
                    </div>

                    <p className="ff-plan-tagline">{t(plan.taglineKey)}</p>

                    {/* Price & revenue share */}
                    <div className="ff-plan-price">
                      <span className="ff-plan-price-amount">0 kr</span>
                      <span className="ff-plan-price-period">/md</span>
                      <div className="ff-plan-share">
                        <Sparkles size={12} style={{ color: plan.color }} />
                        <span>
                          {plan.revenueSharePct === 0
                            ? t('pricing.no_revenue_share')
                            : t('pricing.revenue_share_of', { pct: plan.revenueShare })}
                        </span>
                      </div>
                    </div>

                    <ul className="ff-plan-features">
                      {plan.features.map((f) => (
                        <li key={f} className="ff-plan-feature">
                          <Check size={14} />
                          <span>{t(f)}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="ff-plan-ideal">
                      <p>
                        <TrendingUp size={10} />
                        {t('pricing.ideal_for', { audience: t(plan.idealForKey) })}
                      </p>
                    </div>

                    {isCurrent ? (
                      <div className="ff-plan-cta-current">
                        <Check size={14} />
                        {t('pricing.current_plan')}
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePlanChange(plan.id)}
                        disabled={changingPlan}
                        className="ff-plan-cta-switch"
                      >
                        {changingPlan ? (
                          <Loader2 size={14} className="ff-spin" />
                        ) : (
                          <ArrowRight size={14} />
                        )}
                        {PLANS.findIndex((p) => p.id === plan.id) > PLANS.findIndex((p) => p.id === currentPlan)
                          ? t('pricing.upgrade')
                          : t('pricing.switch_to')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Revenue history / invoices ── */}
          <div className="ff-table-wrap ff-fade-up ff-d3">
            <div className="ff-table-header">
              <h2 className="ff-table-title">
                <Receipt size={16} />
                {t('pricing.revenue_history')}
              </h2>
            </div>
            {revenueHistory.length > 0 ? (
              <div className="ff-table-scroll">
                <table className="ff-table">
                  <thead>
                    <tr>
                      <th>{t('pricing.month')}</th>
                      <th>{t('pricing.revenue')}</th>
                      <th>{t('pricing.bsocial_cut')}</th>
                      <th>{t('pricing.profit')}</th>
                      <th>{t('pricing.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueHistory.map((r) => (
                      <tr key={r.month}>
                        <td>{r.month}</td>
                        <td>{r.revenue.toLocaleString("da-DK")} kr</td>
                        <td className="ff-td-muted">{r.bsocialShare.toLocaleString("da-DK")} kr</td>
                        <td className="ff-td-green">{(r.revenue - r.bsocialShare).toLocaleString("da-DK")} kr</td>
                        <td>
                          <span className={`ff-status ${r.status === "settled" ? "ff-status-settled" : "ff-status-pending"}`}>
                            {r.status === "settled" ? t('pricing.settled') : t('pricing.pending')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="ff-empty">
                <Receipt size={28} />
                <p className="ff-empty-title">{t('pricing.no_billing_yet')}</p>
                <p className="ff-empty-desc">{t('pricing.no_billing_desc')}</p>
              </div>
            )}
          </div>

          {/* ── Value proposition footer ── */}
          <div className="ff-footer ff-fade-up ff-d4">
            <Sparkles size={20} />
            <div>
              <p className="ff-footer-title">{t('pricing.pay_when_earn')}</p>
              <p className="ff-footer-desc">{t('pricing.pay_when_earn_desc')}</p>
            </div>
          </div>

        </div>
      </div>
    </FirmaLayout>
  );
}
