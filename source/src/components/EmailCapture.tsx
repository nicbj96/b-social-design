import { useState, useEffect } from "react";
import { Mail, X, ArrowRight, Check, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

// ═══════════════════════════════════════════════
// 3 PLACEMENTS:
// 1. <EmailCaptureInline /> — in feed hero area
// 2. <EmailCaptureFooter /> — sticky footer bar after scroll
// 3. <EmailCaptureExitIntent /> — popup when mouse leaves viewport
// ═══════════════════════════════════════════════

async function subscribe(email: string, source: string, page: string) {
  const { error } = await supabase.from("email_subscribers").insert({
    email: email.trim().toLowerCase(),
    source,
    page,
    status: "active",
  });
  if (error?.message?.includes("duplicate")) return { ok: true, duplicate: true };
  if (error) return { ok: false, error: error.message };
  return { ok: true, duplicate: false };
}

// ─── 1. INLINE: Goes in Feed hero section ───────────────────────────────────

export function EmailCaptureInline() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [location] = useLocation();

  if (state === "success") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#4ECDC4]/10 border border-[#4ECDC4]/20">
        <Check size={18} className="text-[#4ECDC4] flex-shrink-0" />
        <p className="text-sm text-[#4ECDC4]">Du er tilmeldt. Vi sender dig de bedste oplevelser.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setState("loading");
        const result = await subscribe(email, "inline-feed", location);
        setState(result.ok ? "success" : "error");
      }}
      className="flex gap-2 w-full max-w-md"
    >
      <div className="relative flex-1">
        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Din e-mail"
          required
          className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/8 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50 min-h-[44px]"
        />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="px-4 py-3 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-sm font-semibold hover:bg-[#3dbdb5] transition-colors min-h-[44px] flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
      >
        {state === "loading" ? "..." : <>Tilmeld <ArrowRight size={14} /></>}
      </button>
    </form>
  );
}

// ─── 2. FOOTER BAR: Appears after scrolling 50% ─────────────────────────────

export function EmailCaptureFooter() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [location] = useLocation();

  useEffect(() => {
    // Don't show if already subscribed or dismissed
    if (localStorage.getItem("bsocial_email_subscribed") === "true") return;
    if (localStorage.getItem("bsocial_email_dismissed") === "true") return;

    const handler = () => {
      const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPct > 0.3 && !dismissed) setVisible(true);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [dismissed]);

  if (!visible || dismissed || state === "success") return null;

  return (
    <div data-email-footer className="fixed bottom-[164px] left-3 right-3 z-[9998] bg-[#060a0f]/95 backdrop-blur-lg border border-white/10 rounded-2xl px-4 py-3 shadow-2xl shadow-black/50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-4">
      <button
        onClick={() => { setDismissed(true); localStorage.setItem("bsocial_email_dismissed", "true"); }}
        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-colors"
        aria-label="Luk"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#4ECDC4]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bell size={16} className="text-[#4ECDC4]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold mb-0.5">Gå ikke glip af events</p>
          <p className="text-white/40 text-xs mb-2">Få ugentlige anbefalinger direkte i din indbakke</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!email.trim()) return;
              setState("loading");
              const result = await subscribe(email, "footer-bar", location);
              if (result.ok) {
                setState("success");
                localStorage.setItem("bsocial_email_subscribed", "true");
                setTimeout(() => setDismissed(true), 2000);
              }
            }}
            className="flex gap-1.5"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.dk"
              required
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/8 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="px-3 py-2 rounded-lg bg-[#4ECDC4] text-[#0a0f1a] text-xs font-bold hover:bg-[#3dbdb5] transition-colors min-h-[44px] flex-shrink-0 disabled:opacity-50"
            >
              {state === "loading" ? "..." : "Tilmeld"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── 3. EXIT INTENT: Popup when leaving the page ─────────────────────────────

export function EmailCaptureExitIntent() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [location] = useLocation();

  useEffect(() => {
    if (localStorage.getItem("bsocial_email_subscribed") === "true") return;
    if (localStorage.getItem("bsocial_exit_shown") === "true") return;

    // Only trigger on desktop (mouse leave) — mobile uses footer bar instead
    const handler = (e: MouseEvent) => {
      if (e.clientY < 10) {
        setShow(true);
        localStorage.setItem("bsocial_exit_shown", "true");
        document.removeEventListener("mouseout", handler);
      }
    };

    // Delay activation by 15 seconds
    const timer = setTimeout(() => {
      document.addEventListener("mouseout", handler);
    }, 15000);

    return () => { clearTimeout(timer); document.removeEventListener("mouseout", handler); };
  }, []);

  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShow(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [show]);

  if (!show || state === "success") return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" onClick={() => setShow(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#060a0f] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Luk"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#4ECDC4]/15 flex items-center justify-center mx-auto mb-3">
            <Mail size={24} className="text-[#4ECDC4]" />
          </div>
          <h3 className="text-white text-lg font-bold mb-1">Vent — gå ikke glip af det hele</h3>
          <p className="text-white/50 text-sm">Få de bedste events og oplevelser sendt direkte til dig. Helt gratis.</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email.trim()) return;
            setState("loading");
            const result = await subscribe(email, "exit-intent", location);
            if (result.ok) {
              setState("success");
              localStorage.setItem("bsocial_email_subscribed", "true");
              setShow(false);
            }
          }}
          className="space-y-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@email.dk"
            required
            autoFocus
            className="w-full px-4 py-3.5 rounded-xl bg-white/8 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50 min-h-[44px]"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="w-full py-3.5 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-sm font-bold hover:bg-[#3dbdb5] transition-colors min-h-[44px] disabled:opacity-50"
          >
            {state === "loading" ? "Tilmelder..." : "Ja, send mig events"}
          </button>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="w-full py-2 text-white/30 text-xs hover:text-white/50 transition-colors"
          >
            Nej tak, jeg finder selv
          </button>
        </form>
      </div>
    </div>
  );
}
