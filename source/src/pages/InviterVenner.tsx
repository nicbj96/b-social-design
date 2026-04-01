import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Copy,
  Check,
  Users,
  LogIn,
  Link2,
  ArrowLeft,
  Share2,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

export default function InviterVenner() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [friendCount, setFriendCount] = useState<number | null>(null);

  const referralLink = user ? `https://b-social.net/?ref=${user.id}` : "";

  useEffect(() => {
    if (!user) return;
    // my_friends is a view of accepted friendships for the current user
    supabase
      .from("my_friends")
      .select("friend_id", { count: "exact", head: true })
      .then(({ count }) => {
        setFriendCount(count ?? 0);
      });
  }, [user]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select the text
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

  function shareOnFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank", "width=600,height=400");
  }

  function shareOnX() {
    const text = encodeURIComponent("Kom med på B-Social — find events og mød nye folk 🎉");
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank", "width=600,height=400");
  }

  // ─── Anonymous view ───────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#060a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4ECDC4]/30 to-[#4ECDC4]/10 border border-[#4ECDC4]/20 mb-6">
              <Link2 size={36} className="text-[#4ECDC4]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Del B-Social</h1>
            <p className="text-white/50 text-base leading-relaxed max-w-xs mx-auto">
              Log ind for at få dit personlige link og inviter venner direkte.
            </p>
          </div>

          {/* Steps preview */}
          <div className="space-y-3 mb-10">
            {[
              { icon: "📤", text: "Del dit link med venner" },
              { icon: "👤", text: "De opretter en konto" },
              { icon: "🎉", text: "I bliver venner automatisk" },
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
            className="w-full py-4 rounded-2xl bg-[#4ECDC4] text-[#0a0f1a] font-semibold text-base hover:bg-[#3dbdb5] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#4ECDC4]/20 flex items-center justify-center gap-2 mb-3"
          >
            <LogIn size={18} />
            Log ind for at få dit link
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
        <div className="max-w-xl mx-auto px-5 h-16 flex items-center gap-4">
          <button
            onClick={() => setLocation("/feed")}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Link2 size={20} className="text-[#4ECDC4]" />
            <h1 className="text-lg font-bold">Invitér venner</h1>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 py-8 space-y-5">

        {/* Hero */}
        <div className="text-center py-4">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Del B-Social</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Send dit link til venner — når de opretter en konto via dit link, bliver I venner automatisk.
          </p>
        </div>

        {/* Referral link card */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">
            Dit personlige link
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-black/30 rounded-xl px-3 py-2.5 text-white/70 text-sm font-mono truncate border border-white/8">
              {referralLink}
            </div>
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                copied
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-[#4ECDC4] text-[#0a0f1a] hover:bg-[#3dbdb5]"
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Kopieret!" : "Kopiér link"}
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={shareOnFacebook}
            className="flex items-center justify-center gap-2 bg-[#1877F2]/20 text-[#4a9eff] border border-[#1877F2]/30 rounded-2xl py-3.5 text-sm font-medium hover:bg-[#1877F2]/30 transition-all"
          >
            <Share2 size={16} />
            Del på Facebook
          </button>
          <button
            onClick={shareOnX}
            className="flex items-center justify-center gap-2 bg-white/8 text-white/70 border border-white/12 rounded-2xl py-3.5 text-sm font-medium hover:bg-white/12 transition-all"
          >
            <Share2 size={16} />
            Del på X
          </button>
        </div>

        {/* How it works */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">
            Sådan virker det
          </h3>
          <div className="space-y-4">
            {[
              {
                icon: <span className="text-xl">📤</span>,
                title: "Del dit link med venner",
                desc: "Kopiér linket og send det på beskeder, sociale medier eller direkte.",
              },
              {
                icon: <span className="text-xl">👤</span>,
                title: "De opretter en konto",
                desc: "Din ven klikker på linket og opretter en profil på B-Social.",
              },
              {
                icon: <span className="text-xl">🎉</span>,
                title: "I bliver venner automatisk",
                desc: "Når de er klar, dukker de op i din venneliste med det samme.",
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Friend count */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4ECDC4]/15 flex items-center justify-center flex-shrink-0">
            <Users size={22} className="text-[#4ECDC4]" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {friendCount === null ? "–" : friendCount}
            </p>
            <p className="text-white/50 text-sm">
              {friendCount === 1 ? "ven på B-Social" : "venner på B-Social"}
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setLocation("/venner")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 text-white/60 text-xs font-medium hover:bg-white/12 transition-all"
            >
              <UserPlus size={14} />
              Se venner
            </button>
          </div>
        </div>

        {/* CTA bottom */}
        <div className="text-center py-2">
          <p className="text-white/30 text-xs">
            Del B-Social — find events og mød folk med de samme interesser 🎊
          </p>
        </div>

      </div>
    </div>
  );
}
