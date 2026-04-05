import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { bindReferral } from "@/hooks/useReferral";
import { supabase } from "@/lib/supabase";
import { pageBase } from "@/lib/pageCSSBase";

/* ─────────────────────────────────────────────
   B-Social Auth — Premium Redesign
   Scoped CSS prefix: au-
   ───────────────────────────────────────────── */

const authCSS = `
${pageBase("au")}

.au-root {
  min-height: 100vh; display: flex; flex-direction: column;
}

/* ── Left panel (desktop) ── */
.au-left {
  display: none; position: relative; flex-shrink: 0; overflow: hidden;
}
.au-left img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
.au-left-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(6,10,15,0.55) 0%, rgba(6,10,15,0.25) 35%, rgba(6,10,15,0.6) 70%, rgba(6,10,15,0.88) 100%);
}
.au-left-teal {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 80% 50% at 50% 100%, rgba(78,205,196,0.08) 0%, transparent 70%);
}
.au-left-top { position: relative; z-index: 10; padding: 40px; }
.au-left-brand {
  font-family: var(--serif); font-style: italic; font-size: 22px;
  font-weight: 400; color: rgba(255,255,255,0.92); letter-spacing: -0.3px;
  display: flex; align-items: center; gap: 10px;
}
.au-left-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--teal); margin-top: 2px;
}
.au-left-bottom { position: relative; z-index: 10; padding: 0 40px 48px; margin-top: auto; }
.au-left-eyebrow {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
}
.au-left-eyebrow-line { height: 1px; width: 32px; background: var(--teal); opacity: 0.7; }
.au-left-eyebrow-text {
  text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px;
  font-weight: 500; color: rgba(78,205,196,0.85);
}
.au-left-heading {
  font-family: var(--serif); font-style: italic;
  font-size: clamp(30px, 3.2vw, 44px); font-weight: 400;
  line-height: 1.18; letter-spacing: -0.5px; color: var(--pg-white);
}
.au-left-heading span { color: var(--teal); }
.au-left-subtitle {
  margin-top: 16px; font-size: 14px; line-height: 1.6; max-width: 320px;
  color: rgba(255,255,255,0.45);
}

/* ── Right panel ── */
.au-right {
  flex: 1; display: flex; flex-direction: column; overflow-y: auto;
  position: relative;
}

/* ── Mobile ambient bg ── */
.au-mobile-bg { position: absolute; inset: 0; pointer-events: none; }
.au-mobile-bg-teal {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 45% at 50% -5%, rgba(78,205,196,0.09) 0%, transparent 65%);
}
.au-mobile-bg-blue {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 50% 40% at 90% 100%, rgba(147,197,253,0.05) 0%, transparent 60%);
}
.au-mobile-bg-grid {
  position: absolute; inset: 0; opacity: 0.018;
  background-image: linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ── Desktop right bg ── */
.au-desktop-bg {
  position: absolute; inset: 0; pointer-events: none; display: none;
}
.au-desktop-bg-inner {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(78,205,196,0.04) 0%, transparent 60%);
}

/* ── Back button ── */
.au-back-row { position: relative; z-index: 10; padding: 40px 24px 0; }
.au-back-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; color: var(--pg-white-dim);
}
.au-back-btn:hover { background: rgba(255,255,255,0.1); }

/* ── Form content ── */
.au-form-wrap {
  position: relative; z-index: 10; flex: 1; display: flex; flex-direction: column;
  justify-content: center; padding: 0 24px 64px;
  max-width: 400px; margin: 0 auto; width: 100%;
}

/* ── Logo area ── */
.au-logo-area { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; }
.au-logo-mark {
  width: 64px; height: 64px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(78,205,196,0.15), rgba(147,197,253,0.1));
  border: 1px solid rgba(78,205,196,0.2);
  box-shadow: 0 8px 32px rgba(78,205,196,0.1);
}
.au-logo-eyebrow {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.au-logo-eyebrow-line { width: 24px; height: 1px; background: var(--teal); opacity: 0.5; }
.au-logo-eyebrow-text {
  font-size: 11px; font-weight: 500; color: var(--teal);
  text-transform: uppercase; letter-spacing: 2.5px;
}
.au-form-title {
  font-family: var(--serif); font-weight: 400; font-size: 28px;
  letter-spacing: -0.5px; color: var(--pg-white);
}
.au-form-subtitle {
  color: var(--pg-white-muted); font-size: 14px; margin-top: 8px;
  text-align: center; line-height: 1.5;
}

/* ── Form fields ── */
.au-form { display: flex; flex-direction: column; gap: 16px; }
.au-field { display: flex; flex-direction: column; gap: 6px; }
.au-field-label {
  font-size: 11px; font-weight: 500; color: var(--pg-white-dim);
  text-transform: uppercase; letter-spacing: 1.5px; padding-left: 4px;
}
.au-field-input {
  width: 100%; padding: 14px 18px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; color: var(--pg-white); font-size: 15px;
  font-family: var(--sans); outline: none; transition: all 0.25s;
}
.au-field-input:focus { border-color: rgba(78,205,196,0.4); background: rgba(255,255,255,0.06); }
.au-field-input::placeholder { color: rgba(255,255,255,0.25); }
.au-pw-wrap { position: relative; }
.au-pw-toggle {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: var(--pg-white-muted); cursor: pointer; transition: color 0.25s;
  background: none; border: none; min-width: 44px; min-height: 44px;
  display: flex; align-items: center; justify-content: center;
}
.au-pw-toggle:hover { color: var(--pg-white-dim); }
.au-field-hint { font-size: 12px; color: var(--pg-white-muted); padding-left: 4px; }
.au-forgot-link {
  color: var(--teal); font-size: 12px; font-weight: 500;
  padding: 6px 4px; background: none; border: none; cursor: pointer;
  display: inline-block; margin-top: 4px; text-align: left;
}
.au-forgot-link:hover { text-decoration: underline; }
.au-forgot-link:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Alert ── */
.au-alert {
  padding: 14px; border-radius: 14px; font-size: 13px; text-align: center;
}
.au-alert-error {
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
  color: #fca5a5;
}
.au-alert-success {
  background: rgba(78,205,196,0.1); border: 1px solid rgba(78,205,196,0.2);
  color: var(--teal);
}

/* ── Submit button ── */
.au-submit {
  width: 100%; padding: 16px; border-radius: 16px;
  background: var(--teal); color: var(--bg);
  font-size: 15px; font-weight: 600; border: none; cursor: pointer;
  transition: all 0.3s; font-family: var(--sans);
  box-shadow: 0 6px 24px var(--teal-glow);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.au-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 32px var(--teal-glow); }
.au-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* ── Toggle mode ── */
.au-toggle-text {
  text-align: center; font-size: 14px; color: var(--pg-white-muted); margin-top: 24px;
}
.au-toggle-link {
  color: var(--teal); font-weight: 600; cursor: pointer;
}
.au-toggle-link:hover { text-decoration: underline; }

/* ── Divider ── */
.au-divider {
  display: flex; align-items: center; gap: 12px; margin: 24px 0;
}
.au-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
.au-divider-text { font-size: 12px; color: var(--pg-white-muted); }

/* ── OAuth button ── */
.au-oauth-btn {
  width: 100%; padding: 14px; border-radius: 16px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: var(--pg-white-dim); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.3s; font-family: var(--sans);
  display: flex; align-items: center; justify-content: center; gap: 12px;
}
.au-oauth-btn:hover { background: rgba(255,255,255,0.08); color: var(--pg-white); }

/* ── Guest button ── */
.au-guest-btn {
  width: 100%; padding: 14px; border-radius: 16px;
  background: transparent; border: none;
  color: var(--pg-white-muted); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.3s; font-family: var(--sans);
  margin-top: 8px;
}
.au-guest-btn:hover { color: var(--pg-white-dim); background: rgba(255,255,255,0.03); }

/* ── Terms ── */
.au-terms {
  text-align: center; font-size: 11px; color: var(--pg-white-muted);
  line-height: 1.6; margin-top: 24px;
}
.au-terms-link { color: rgba(255,255,255,0.35); text-decoration: underline; cursor: pointer; }

/* ── Desktop layout ── */
@media (min-width: 1024px) {
  .au-root { flex-direction: row; }
  .au-left { display: flex; flex-direction: column; width: 50%; }
  .au-mobile-bg { display: none; }
  .au-desktop-bg { display: block; }
  .au-back-row { padding: 40px 40px 0; }
  .au-form-wrap { padding: 0 56px 64px; max-width: 480px; }
}
`;

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
        const { data: { user } } = await (await import("@/lib/supabase")).supabase.auth.getUser();
        if (user) {
          await bindReferral(user.id);
        }
        setLocation("/onboarding");
      }
    }
  };

  return (
    <>
      <style>{authCSS}</style>
      <div className="au-root" data-testid="auth-page">

        {/* ── LEFT PANEL (desktop) ── */}
        <div className="au-left">
          <img src="/concert.jpg" alt="" aria-hidden="true" loading="lazy" />
          <div className="au-left-overlay" aria-hidden="true" />
          <div className="au-left-teal" aria-hidden="true" />

          <div className="au-left-top">
            <div className="au-left-brand">
              B-Social
              <span className="au-left-dot" />
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div className="au-left-bottom">
            <div className="au-left-eyebrow">
              <div className="au-left-eyebrow-line" />
              <span className="au-left-eyebrow-text">Live music &amp; events</span>
            </div>
            <h2 className="au-left-heading">
              Find din næste<br />
              <span>store</span> oplevelse
            </h2>
            <p className="au-left-subtitle">
              Oplev koncerter, festivals og events — delt af rigtige mennesker, ikke algoritmer.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="au-right">
          <div className="au-mobile-bg">
            <div className="au-mobile-bg-teal" />
            <div className="au-mobile-bg-blue" />
            <div className="au-mobile-bg-grid" />
          </div>
          <div className="au-desktop-bg">
            <div className="au-desktop-bg-inner" />
          </div>

          <div className="au-back-row">
            <button className="au-back-btn" onClick={() => window.history.back()} data-testid="button-back">
              <ArrowLeft size={18} />
            </button>
          </div>

          <div className="au-form-wrap">
            {/* Logo + heading */}
            <div className="au-logo-area">
              <div className="au-logo-mark">
                <svg viewBox="0 0 40 40" fill="none" style={{ width: 36, height: 36 }} aria-label="B-Social logo">
                  <circle cx="20" cy="20" r="16" stroke="#4ECDC4" strokeWidth="1.2" opacity="0.5" />
                  <path d="M20 7 L23 17 L20 15 L17 17 Z" fill="#4ECDC4" />
                  <path d="M20 33 L17 23 L20 25 L23 23 Z" fill="rgba(255,255,255,0.35)" />
                  <circle cx="20" cy="20" r="2.5" fill="#4ECDC4" />
                </svg>
              </div>
              <div className="au-logo-eyebrow">
                <div className="au-logo-eyebrow-line" />
                <span className="au-logo-eyebrow-text">B-Social</span>
                <div className="au-logo-eyebrow-line" />
              </div>
              <h1 className="au-form-title">
                {mode === "login" ? t('auth.login') : t('auth.signup')}
              </h1>
              <p className="au-form-subtitle">
                {mode === "login" ? t('auth.welcome_back') : t('auth.join_bsocial')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="au-form">
              {error && <div className="au-alert au-alert-error" data-testid="error-message">{error}</div>}
              {successMsg && <div className="au-alert au-alert-success" data-testid="success-message">{successMsg}</div>}

              {mode === "signup" && (
                <div className="au-field">
                  <label className="au-field-label">{t('auth.name')}</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.your_name')} required
                    onInvalid={(e) => { const t = e.target as HTMLInputElement; if (t.validity.valueMissing) t.setCustomValidity('Indtast venligst dit navn'); else t.setCustomValidity(''); }}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                    className="au-field-input" data-testid="input-name"
                  />
                </div>
              )}

              <div className="au-field">
                <label className="au-field-label">{t('auth.email')}</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@email.dk" required
                  onInvalid={(e) => { const t = e.target as HTMLInputElement; if (t.validity.valueMissing) t.setCustomValidity('Udfyld venligst din e-mail'); else if (t.validity.typeMismatch) t.setCustomValidity('Indtast en gyldig e-mailadresse'); else t.setCustomValidity(''); }}
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  className="au-field-input" data-testid="input-email"
                />
              </div>

              <div className="au-field">
                <label className="au-field-label">{t('auth.password')}</label>
                <div className="au-pw-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6}
                    onInvalid={(e) => { const t = e.target as HTMLInputElement; if (t.validity.valueMissing) t.setCustomValidity('Indtast venligst en adgangskode'); else if (t.validity.tooShort) t.setCustomValidity('Adgangskoden skal være mindst 6 tegn'); else t.setCustomValidity(''); }}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                    className="au-field-input" style={{ paddingRight: 48 }}
                    data-testid="input-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="au-pw-toggle" data-testid="button-toggle-password">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {mode === "signup" && <p className="au-field-hint">{t('auth.min_password')}</p>}
                {mode === "login" && (
                  <button
                    type="button" disabled={resetLoading || !email.trim()}
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
                    className="au-forgot-link"
                  >
                    {resetLoading ? t('auth.sending_reset') : t('auth.forgot')}
                  </button>
                )}
              </div>

              <button type="submit" disabled={loading} className="au-submit" data-testid="button-submit-auth">
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading
                  ? (mode === "login" ? t('auth.logging_in') : t('auth.creating'))
                  : (mode === "login" ? t('auth.login') : t('auth.signup'))}
              </button>
            </form>

            {/* Toggle mode */}
            <p className="au-toggle-text">
              {mode === "login" ? t('auth.no_account') + " " : t('auth.has_account') + " "}
              <span
                className="au-toggle-link"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccessMsg(null); }}
                data-testid="link-toggle-mode"
              >
                {mode === "login" ? t('auth.signup') : t('auth.login')}
              </span>
            </p>

            {/* Divider */}
            <div className="au-divider">
              <div className="au-divider-line" />
              <span className="au-divider-text">{t('auth.or')}</span>
              <div className="au-divider-line" />
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
              className="au-oauth-btn"
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
            <button onClick={() => setLocation("/feed")} className="au-guest-btn" data-testid="button-continue-without-login">
              {t('auth.guest')}
            </button>

            <p className="au-terms">
              {t('auth.terms_agree')}{" "}
              <span className="au-terms-link">{t('auth.terms')}</span> og{" "}
              <span className="au-terms-link">{t('auth.privacy')}</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
