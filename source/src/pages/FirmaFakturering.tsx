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
    color: "text-emerald-400",
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
    color: "text-[#4ECDC4]",
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
    color: "text-purple-400",
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

export default function FirmaFakturering() {
  const { t } = useTranslation();
  const { user, companyId } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<Plan>("starter");
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [revenueHistory, setRevenueHistory] = useState<RevenueMonth[]>([]);

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
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </FirmaLayout>
    );
  }

  return (
    <FirmaLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif" style={{ fontWeight: 400 }}>{t('pricing.billing_title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('pricing.billing_desc')}
          </p>
        </div>

        {/* Revenue share banner */}
        <div className="glass-card rounded-xl p-5 border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Percent size={24} className="text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg">{t(currentPlanDef.nameKey)}</p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-primary/15 text-primary border border-primary/20">
                    {currentPlanDef.revenueShare} {t('firma.revenue_share')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPlanDef.revenueSharePct === 0
                    ? t('pricing.no_costs')
                    : t('pricing.bsocial_takes', { pct: currentPlanDef.revenueShare })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                <Gift size={12} />
                {t('pricing.free_badge')}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly revenue overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{t('pricing.your_revenue')}</p>
            <p className="text-2xl font-bold">{monthlyRevenue.toLocaleString("da-DK")} kr</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{t('pricing.bsocial_share', { pct: currentPlanDef.revenueShare })}</p>
            <p className="text-2xl font-bold">{bsocialShare.toLocaleString("da-DK")} kr</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{t('pricing.your_profit')}</p>
            <p className="text-2xl font-bold text-emerald-400">{(monthlyRevenue - bsocialShare).toLocaleString("da-DK")} kr</p>
          </div>
        </div>

        {/* Competitor comparison */}
        <div className="glass-card rounded-xl p-4 border border-blue-500/10 bg-blue-500/5">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-300">{t('pricing.compare_title')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('pricing.compare_desc', { pct: currentPlanDef.revenueShare })}
              </p>
            </div>
          </div>
        </div>

        {/* Plans grid */}
        <div>
          <h2 className="font-semibold mb-1">{t('pricing.choose_plan')}</h2>
          <p className="text-xs text-muted-foreground mb-4">{t('pricing.choose_plan_desc')}</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`glass-card rounded-xl p-5 flex flex-col relative transition-all ${
                    plan.highlight ? "border border-primary/30 ring-1 ring-primary/20" : ""
                  } ${isCurrent ? "ring-1 ring-primary/40" : ""}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
                      {t('pricing.most_popular')}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} className={plan.color} />
                    <h3 className="font-bold">{t(plan.nameKey)}</h3>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{t(plan.taglineKey)}</p>

                  {/* Price & revenue share */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">0 kr</span>
                      <span className="text-xs text-muted-foreground">/md</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Sparkles size={12} className={plan.color} />
                      <span className="text-sm font-semibold">
                        {plan.revenueSharePct === 0
                          ? t('pricing.no_revenue_share')
                          : t('pricing.revenue_share_of', { pct: plan.revenueShare })}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 flex-1 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check size={14} className="text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{t(f)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-white/5 mb-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp size={10} />
                      {t('pricing.ideal_for', { audience: t(plan.idealForKey) })}
                    </p>
                  </div>

                  {isCurrent ? (
                    <div className="px-3 py-2.5 rounded-lg bg-primary/10 text-primary text-sm text-center font-medium flex items-center justify-center gap-2">
                      <Check size={14} />
                      {t('pricing.current_plan')}
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={changingPlan}
                      className="px-3 py-2.5 rounded-lg bg-white/5 text-sm text-foreground hover:bg-white/10 transition-colors text-center flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {changingPlan ? (
                        <Loader2 size={14} className="animate-spin" />
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

        {/* Revenue history / invoices */}
        <div className="glass-card rounded-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Receipt size={16} className="text-primary" />
              {t('pricing.revenue_history')}
            </h2>
          </div>
          {revenueHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">{t('pricing.month')}</th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">{t('pricing.revenue')}</th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">{t('pricing.bsocial_cut')}</th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">{t('pricing.profit')}</th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">{t('pricing.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {revenueHistory.map((r) => (
                    <tr key={r.month} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-medium">{r.month}</td>
                      <td className="px-4 py-3 text-right">{r.revenue.toLocaleString("da-DK")} kr</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{r.bsocialShare.toLocaleString("da-DK")} kr</td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-medium">{(r.revenue - r.bsocialShare).toLocaleString("da-DK")} kr</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${
                          r.status === "settled"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
                        }`}>
                          {r.status === "settled" ? t('pricing.settled') : t('pricing.pending')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Receipt size={28} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground font-medium">{t('pricing.no_billing_yet')}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {t('pricing.no_billing_desc')}
              </p>
            </div>
          )}
        </div>

        {/* Value proposition footer */}
        <div className="glass-card rounded-xl p-5 bg-gradient-to-r from-primary/5 to-purple-500/5 border border-white/5">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">{t('pricing.pay_when_earn')}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t('pricing.pay_when_earn_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
