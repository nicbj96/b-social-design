import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { bindReferral } from "@/hooks/useReferral";
import { supabase } from "@/lib/supabase";

export default function Auth() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (mode === "login") {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(t('auth.error_wrong_credentials'));
        setLoading(false);
      } else {
        const returnTo = sessionStorage.getItem('returnTo');
        sessionStorage.removeItem('returnTo');
        setLocation(returnTo || '/feed');
      }
    } else {
      if (!name.trim()) {
        setError(t('auth.error_name_required'));
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError(t('auth.error_password'));
        setLoading(false);
        return;
      }

      const { error: authError, needsConfirmation } = await signUp(email, password, name);
      if (authError) {
        const msg = authError.message;
        if (msg.includes("already registered")) {
          setError(t('auth.error_already_registered'));
        } else {
          setError(msg);
        }
        setLoading(false);
      } else if (needsConfirmation) {
        setSuccessMsg(t('auth.verify_email'));
        setMode("login");
        setLoading(false);
      } else {
        // Auto-logged in -> bind referral then go to onboarding
        // Get user from auth state
        const { data: { user } } = await (await import("@/lib/supabase")).supabase.auth.getUser();
        if (user) {
          await bindReferral(user.id);
        }
        setLocation("/onboarding");
      }
    }
  };

  return (
    <div
      className="relative min-h-svh flex flex-col overflow-hidden"
      data-testid="auth-page"
      style={{ background: "#060a0f" }}
    >
      {/* Ambient background layers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Radial teal glow top-center */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(78,205,196,0.09) 0%, transparent 65%)" }} />
        {/* Blue ambient bottom-right */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 90% 100%, rgba(147,197,253,0.05) 0%, transparent 60%)" }} />
        {/* Subtle grid texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.018,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      {/* Back button */}
      <div className="relative pt-12 px-5">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft size={18} className="text-white/70" />
        </button>
      </div>

      <div className="relative flex-1 flex flex-col justify-center px-6 pb-16 max-w-sm mx-auto w-full">
        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-10 fade-up">
          {/* Logo mark */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 teal-glow"
            style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.15), rgba(147,197,253,0.1))", border: "1px solid rgba(78,205,196,0.2)" }}
          >
            <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" aria-label="B-Social logo">
              <circle cx="20" cy="20" r="16" stroke="#4ECDC4" strokeWidth="1.2" opacity="0.5" />
              <path d="M20 7 L23 17 L20 15 L17 17 Z" fill="#4ECDC4" />
              <path d="M20 33 L17 23 L20 25 L23 23 Z" fill="rgba(255,255,255,0.35)" />
              <circle cx="20" cy="20" r="2.5" fill="#4ECDC4" />
            </svg>
          </div>
          {/* Eyebrow */}
          <div className="eyebrow mb-3">
            <div className="eyebrow-line" />
            B-Social
            <div className="eyebrow-line" />
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: "28px", letterSpacing: "-0.5px" }} className="text-white">
            {mode === "login" ? t('auth.login') : t('auth.signup')}
          </h1>
          <p className="text-white/45 text-sm mt-2 text-center leading-relaxed">
            {mode === "login" ? t('auth.welcome_back') : t('auth.join_bsocial')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 fade-up delay-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/25 text-red-300 text-sm text-center" data-testid="error-message">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-[#4ECDC4]/15 border border-[#4ECDC4]/25 text-[#4ECDC4] text-sm text-center" data-testid="success-message">
              {successMsg}
            </div>
          )}

          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-medium pl-1 uppercase tracking-wider">{t('auth.name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.your_name')}
                required
                onInvalid={(e) => { const t = e.target as HTMLInputElement; if (t.validity.valueMissing) t.setCustomValidity('Indtast venligst dit navn'); else t.setCustomValidity(''); }}
                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                className="premium-input"
                data-testid="input-name"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium pl-1 uppercase tracking-wider">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.dk"
              required
              onInvalid={(e) => { const t = e.target as HTMLInputElement; if (t.validity.valueMissing) t.setCustomValidity('Udfyld venligst din e-mail'); else if (t.validity.typeMismatch) t.setCustomValidity('Indtast en gyldig e-mailadresse'); else t.setCustomValidity(''); }}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
              className="premium-input"
              data-testid="input-email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-medium pl-1 uppercase tracking-wider">{t('auth.password')}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                onInvalid={(e) => { const t = e.target as HTMLInputElement; if (t.validity.valueMissing) t.setCustomValidity('Indtast venligst en adgangskode'); else if (t.validity.tooShort) t.setCustomValidity('Adgangskoden skal være mindst 6 tegn'); else t.setCustomValidity(''); }}
                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                className="premium-input pr-12"
                style={{ paddingRight: "48px" }}
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/65 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {mode === "signup" && (
              <p className="text-white/25 text-xs pl-1">{t('auth.min_password')}</p>
            )}
            {mode === "login" && (
              <button
                type="button"
                disabled={resetLoading || !email.trim()}
                onClick={async () => {
                  if (!email.trim()) { setSuccessMsg(t('auth.error_enter_email_for_reset')); return; }
                  setResetLoading(true); setError(null); setSuccessMsg(null);
                  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + window.location.pathname + "?returnTo=/auth",
                  });
                  setResetLoading(false);
                  if (resetErr) setError(resetErr.message);
                  else setSuccessMsg(t('auth.reset_email_sent'));
                }}
                className="text-[#4ECDC4] text-xs font-medium pl-1 hover:underline mt-1.5 py-1.5 inline-block disabled:opacity-35 disabled:cursor-not-allowed transition-opacity"
              >
                {resetLoading ? t('auth.sending_reset') : t('auth.forgot')}
              </button>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-premium w-full mt-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ borderRadius: "16px" }}
            data-testid="button-submit-auth"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading
              ? (mode === "login" ? t('auth.logging_in') : t('auth.creating'))
              : (mode === "login" ? t('auth.login') : t('auth.signup'))}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-white/45 text-sm mt-6 fade-up delay-2">
          {mode === "login" ? t('auth.no_account') + " " : t('auth.has_account') + " "}
          <span
            className="text-[#4ECDC4] font-semibold cursor-pointer hover:underline"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccessMsg(null); }}
            data-testid="link-toggle-mode"
          >
            {mode === "login" ? t('auth.signup') : t('auth.login')}
          </span>
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6 fade-up delay-2">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-white/25 text-xs px-1">{t('auth.or')}</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Google OAuth */}
        <button
          onClick={async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: window.location.origin + window.location.pathname + "?returnTo=/feed" },
            });
            if (error) setError(error.message);
          }}
          className="w-full py-3.5 rounded-2xl glass-card text-white/80 font-medium text-sm hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 fade-up delay-3"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('auth.google')}
        </button>

        {/* Continue without login */}
        <button
          onClick={() => setLocation("/feed")}
          className="w-full py-3.5 rounded-2xl text-white/40 font-medium text-sm hover:text-white/70 hover:bg-white/5 transition-all mt-2 fade-up delay-3"
          data-testid="button-continue-without-login"
        >
          {t('auth.guest')}
        </button>

        <p className="text-center text-white/25 text-xs mt-6 leading-relaxed fade-up delay-4">
          {t('auth.terms_agree')}{" "}
          <span className="text-white/40 underline cursor-pointer">{t('auth.terms')}</span> og{" "}
          <span className="text-white/40 underline cursor-pointer">{t('auth.privacy')}</span>
        </p>
      </div>
    </div>
  );
}
