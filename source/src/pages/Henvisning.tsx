import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Copy,
  Check,
  LogIn,
  ArrowLeft,
  TrendingUp,
  Users,
  Wallet,
  Clock,
  ChevronRight,
  Banknote,
  Gift,
  Link2,
  CircleDollarSign,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface ReferredUser {
  id: string;
  name: string;
  city?: string;
  created_at: string;
}

export default function Henvisning() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [referredCount, setReferredCount] = useState<number | null>(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  const referralLink = user ? `https://b-social.net/?ref=${user.id}` : "";

  useEffect(() => {
    if (!user) return;
    setLoadingReferrals(true);
    // Query profiles that signed up with this user's referral code
    supabase
      .from("profiles")
      .select("id, name, city, created_at")
      .eq("referred_by", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error && data) {
          setReferredUsers(data as ReferredUser[]);
          setReferredCount(data.length);
        } else {
          setReferredCount(0);
        }
        setLoadingReferrals(false);
      });
  }, [user]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // ─── Anonymous view ───────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#060a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Icon + headline */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-500/20 mb-6">
              <CircleDollarSign size={38} className="text-emerald-400" />
            </div>
            <h1 className="text-3xl font-serif text-white mb-3" style={{ fontWeight: 400 }}>Tjen penge med B-Social</h1>
            <p className="text-white/50 text-base leading-relaxed max-w-xs mx-auto">
              Del dit link — og tjen provision hver gang dine henvisninger bruger platformen.
            </p>
          </div>

          {/* Preview steps */}
          <div className="space-y-3 mb-10">
            {[
              { icon: "🔗", text: "Del dit personlige henvisningslink" },
              { icon: "👤", text: "Nye brugere opretter konto via dit link" },
              { icon: "💰", text: "Tjen provision når de køber billetter eller bruger Firma" },
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-2xl px-5 py-4"
              >
                <span className="text-2xl">{step.icon}</span>
                <span className="text-white/70 text-sm font-medium">{step.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setLocation("/auth")}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-semibold text-base hover:bg-emerald-400 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mb-3"
          >
            <LogIn size={18} />
            Log ind for at starte med at tjene penge
          </button>
          <button
            onClick={() => setLocation("/feed")}
            className="w-full py-3 rounded-2xl bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Tilbage til feed
          </button>
        </div>
      </div>
    );
  }

  // ─── Logged-in view ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/8 bg-[#060a0f]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center gap-4">
          <button
            onClick={() => setLocation("/feed")}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <CircleDollarSign size={20} className="text-emerald-400" />
            <h1 className="text-lg font-bold">Tjen penge med B-Social</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-5">

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/50 via-teal-900/30 to-[#060a0f] border border-emerald-500/20 p-6">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">💰</span>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 rounded-full">
                Passiv indkomst
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2 leading-tight">
              Henvisningsprogram
            </h2>
            <p className="text-white/55 text-sm leading-relaxed max-w-sm">
              Del dit unikke link og tjen provision når dine henvisninger opretter en Firma-konto og køber billetter på B-Social.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: <Users size={18} className="text-[#4ECDC4]" />,
              bg: "bg-[#4ECDC4]/10",
              label: "Henviste brugere",
              value: referredCount === null ? "–" : String(referredCount),
            },
            {
              icon: <Clock size={18} className="text-amber-400" />,
              bg: "bg-amber-400/10",
              label: "Ventende provision",
              value: "0 kr",
            },
            {
              icon: <Wallet size={18} className="text-emerald-400" />,
              bg: "bg-emerald-400/10",
              label: "Udbetalt",
              value: "0 kr",
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-4 flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-white/40 text-xs leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Referral link card */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={16} className="text-emerald-400" />
            <p className="text-white/70 text-sm font-semibold">Dit henvisningslink</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-black/30 rounded-xl px-3 py-2.5 text-white/60 text-sm font-mono truncate border border-white/8">
              {referralLink}
            </div>
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                copied
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-emerald-500 text-white hover:bg-emerald-400"
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Kopieret!" : "Kopiér"}
            </button>
          </div>
          <p className="text-white/30 text-xs mt-3">
            Del dette link på sociale medier, i din bio eller direkte til kontakter.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-5 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            Sådan virker det
          </h3>
          <div className="space-y-5">
            {[
              {
                icon: "🔗",
                title: "Del dit link",
                desc: "Kopiér dit personlige link og del det overalt — sociale medier, e-mail eller direkte til din netværk.",
              },
              {
                icon: "👤",
                title: "Nye brugere opretter konto",
                desc: "Når nogen klikker på dit link og opretter en konto, registreres de automatisk under dig.",
              },
              {
                icon: "💰",
                title: "Tjen provision",
                desc: "Hver gang dine henvisninger køber billetter til events eller opgraderer til Firma, tjener du provision.",
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 text-xl">
                  {step.icon}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-semibold text-white mb-0.5">{step.title}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="absolute left-[calc(2.5rem+1.25rem)] mt-10 h-5 w-px bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Commission rates */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-5 uppercase tracking-wider flex items-center gap-2">
            <Banknote size={14} className="text-emerald-400" />
            Provisionssatser — Firma abonnementer
          </h3>
          <div className="space-y-3">
            {[
              {
                plan: "Starter",
                bsocial: "0% rev. share",
                yourCut: "0 kr",
                desc: "Gratis plan — ingen omsætningsdeling",
                accent: "text-white/40",
                bg: "bg-white/3",
                border: "border-white/8",
              },
              {
                plan: "Vækst",
                bsocial: "5% rev. share",
                yourCut: "0,5% af omsætning",
                desc: "Du får 10% af B-Socials andel",
                accent: "text-[#4ECDC4]",
                bg: "bg-[#4ECDC4]/5",
                border: "border-[#4ECDC4]/20",
              },
              {
                plan: "Partner",
                bsocial: "3% rev. share",
                yourCut: "0,3% af omsætning",
                desc: "Du får 10% af B-Socials andel",
                accent: "text-emerald-400",
                bg: "bg-emerald-500/5",
                border: "border-emerald-500/20",
              },
            ].map((row) => (
              <div
                key={row.plan}
                className={`${row.bg} border ${row.border} rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm font-bold ${row.accent}`}>{row.plan}</span>
                    <span className="text-white/30 text-xs">{row.bsocial}</span>
                  </div>
                  <p className="text-white/40 text-xs">{row.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${row.accent}`}>{row.yourCut}</p>
                  <p className="text-white/30 text-xs">din provision</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/25 text-xs mt-4 leading-relaxed">
            Provision beregnes automatisk og udbetales månedligt. Minimum udbetaling: 100 kr. Stripe-integration kommer snart.
          </p>
        </div>

        {/* Referred users list */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Gift size={14} className="text-emerald-400" />
              Dine henvisninger ({referredCount === null ? "–" : referredCount})
            </h3>
          </div>

          {loadingReferrals ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-white/10 rounded w-32" />
                    <div className="h-2 bg-white/5 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : referredUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔗</div>
              <p className="text-white/40 text-sm">Ingen henvisninger endnu</p>
              <p className="text-white/25 text-xs mt-1">
                Del dit link for at komme i gang
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {referredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                    {u.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.name}</p>
                    <p className="text-xs text-white/35">
                      {u.city ? `${u.city} · ` : ""}Tilmeldt {formatDate(u.created_at)}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-white/20 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom note */}
        <div className="text-center py-2 pb-6">
          <p className="text-white/25 text-xs leading-relaxed max-w-xs mx-auto">
            Provisionssystemet er under udvikling. Alle henvisninger registreres nu og vil tælle med, når udbetaling aktiveres.
          </p>
        </div>

      </div>
    </div>
  );
}
