import { lazy, Suspense, useEffect, useRef } from "react";
import { Switch, Route, Router, Redirect } from "wouter";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AIChatWidget from "@/components/AIChatWidget";
import { EmailCaptureFooter, EmailCaptureExitIntent } from "@/components/EmailCapture";
import { TagProvider } from "@/context/TagContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { JoinProvider } from "@/context/JoinContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { useReferralCapture } from "@/hooks/useReferral";
import { ErrorBoundary } from "@/components/ErrorBoundary";
// Layout — always loaded (wraps every main page)
import DesktopAppLayout from "@/components/DesktopAppLayout";
// ── Loading fallback ──
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#060a0f" }}>
      <div className="w-8 h-8 border-2 border-[#4ECDC4]/30 border-t-[#4ECDC4] rounded-full animate-spin" />
    </div>
  );
}
// ── Lazy page imports ──
const NotFound = lazy(() => import("@/pages/not-found"));
const Auth = lazy(() => import("@/pages/Auth"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Feed = lazy(() => import("@/pages/Feed"));
const Udforsk = lazy(() => import("@/pages/Udforsk"));
const KortPage = lazy(() => import("@/pages/Kort"));
const Beskeder = lazy(() => import("@/pages/Beskeder"));
const MinSide = lazy(() => import("@/pages/MinSide"));
const EventDetail = lazy(() => import("@/pages/EventDetail"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const Indstillinger = lazy(() => import("@/pages/Indstillinger"));
const Privatlivspolitik = lazy(() => import("@/pages/Privatlivspolitik"));
const Vilkaar = lazy(() => import("@/pages/Vilkaar"));
const Henvisning = lazy(() => import("@/pages/Henvisning"));
const InviterVenner = lazy(() => import("@/pages/InviterVenner"));
const Notifikationer = lazy(() => import("@/pages/Notifikationer"));
const WhitelabelLanding = lazy(() => import("@/pages/WhitelabelLanding"));
const Landing = lazy(() => import("@/pages/Landing"));
const Kalender = lazy(() => import("@/pages/Kalender"));
const StedDetail = lazy(() => import("@/pages/StedDetail"));
const CategoryDetail = lazy(() => import("@/pages/CategoryDetail"));
const Historik = lazy(() => import("@/pages/Historik"));
const Overblik = lazy(() => import("@/pages/Overblik"));
const Noter = lazy(() => import("@/pages/Noter"));
// Firma pages
const FirmaAuth = lazy(() => import("@/pages/FirmaAuth"));
const FirmaDashboard = lazy(() => import("@/pages/FirmaDashboard"));
const FirmaEvents = lazy(() => import("@/pages/FirmaEvents"));
const FirmaTargeting = lazy(() => import("@/pages/FirmaTargeting"));
const FirmaAnalytics = lazy(() => import("@/pages/FirmaAnalytics"));
const FirmaFakturering = lazy(() => import("@/pages/FirmaFakturering"));
const FirmaRekruttering = lazy(() => import("@/pages/FirmaRekruttering"));
const FirmaIndstillinger = lazy(() => import("@/pages/FirmaIndstillinger"));
function MainRouter() {
  return (
    <DesktopAppLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/test" component={Feed} />
          <Route path="/feed" component={Feed} />
          <Route path="/udforsk" component={Udforsk} />
          <Route path="/kort" component={KortPage} />
          <Route path="/beskeder" component={Beskeder} />
          <Route path="/min-side" component={MinSide} />
          <Route path="/event/:id" component={EventDetail} />
          <Route path="/profil/:id" component={PublicProfile} />
          <Route path="/indstillinger" component={Indstillinger} />
          <Route path="/notifikationer" component={Notifikationer} />
          <Route path="/kalender" component={Kalender} />
          <Route path="/sted/:id" component={StedDetail} />
          <Route path="/kategori/:category" component={CategoryDetail} />
          <Route path="/historik" component={Historik} />
          <Route path="/overblik" component={Overblik} />
          <Route path="/noter" component={Noter} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </DesktopAppLayout>
  );
}
/** Firma routes — requires firma or admin role, otherwise redirects to /firma/auth */
function FirmaRouter() {
  const { isFirma, isLoggedIn, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isLoggedIn || !isFirma()) {
    return <Redirect to="/firma/auth" />;
  }
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/firma/auth" component={FirmaAuth} />
        <Route path="/firma/events" component={FirmaEvents} />
        <Route path="/firma/targeting" component={FirmaTargeting} />
        <Route path="/firma/analytics" component={FirmaAnalytics} />
        <Route path="/firma/fakturering" component={FirmaFakturering} />
        <Route path="/firma/rekruttering" component={FirmaRekruttering} />
        <Route path="/firma/indstillinger" component={FirmaIndstillinger} />
        <Route path="/firma" component={FirmaDashboard} />
      </Switch>
    </Suspense>
  );
}
function RootRouter() {
  const [location] = useLocation();
  const isFirmaAuth = location === "/firma/auth";
  const isFirma = location.startsWith("/firma");
  const isHenvisning = location === "/henvisning";
  const isInviter = location === "/inviter";
  const isAuth = location === "/auth";
  const isOnboarding = location === "/onboarding";
  const isPrivatlivspolitik = location === "/privatlivspolitik";
  const isVilkaar = location === "/vilkaar";
  const isWhitelabel = location === "/whitelabel";
  const isHome = location === "/";
  if (isHome) return <Suspense fallback={<PageLoader />}><Landing /></Suspense>;
  if (isWhitelabel) return <Suspense fallback={<PageLoader />}><WhitelabelLanding /></Suspense>;
  if (isPrivatlivspolitik) return <Suspense fallback={<PageLoader />}><Privatlivspolitik /></Suspense>;
  if (isVilkaar) return <Suspense fallback={<PageLoader />}><Vilkaar /></Suspense>;
  if (isFirmaAuth) return <Suspense fallback={<PageLoader />}><FirmaAuth /></Suspense>;
  if (isFirma) return <FirmaRouter />;
  if (isHenvisning) return <DesktopAppLayout><Suspense fallback={<PageLoader />}><Henvisning /></Suspense></DesktopAppLayout>;
  if (isInviter) return <DesktopAppLayout><Suspense fallback={<PageLoader />}><InviterVenner /></Suspense></DesktopAppLayout>;
  if (isAuth) return <Suspense fallback={<PageLoader />}><Auth /></Suspense>;
  if (isOnboarding) return <Suspense fallback={<PageLoader />}><Onboarding /></Suspense>;
  return <MainRouter />;
}
/* ── Premium cursor (desktop pointer:fine only) ── */
function PremiumCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringPos = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Only activate on pointer:fine devices (desktop)
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("premium-cursor-active");

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
    };

    const animate = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ringPos.current.x + "px";
        ringRef.current.style.top = ringPos.current.y + "px";
      }
      rafId.current = requestAnimationFrame(animate);
    };

    const onEnter = () => {
      cursorRef.current?.classList.add("hovering");
      ringRef.current?.classList.add("hovering");
    };
    const onLeave = () => {
      cursorRef.current?.classList.remove("hovering");
      ringRef.current?.classList.remove("hovering");
    };

    document.addEventListener("mousemove", onMove);
    rafId.current = requestAnimationFrame(animate);

    const attachHover = () => {
      document.querySelectorAll("a, button, [role='button'], .chip, .event-card, .premium-chip, .premium-event-card").forEach(el => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };
    attachHover();
    // Re-attach when DOM changes
    const mo = new MutationObserver(attachHover);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
      document.body.classList.remove("premium-cursor-active");
      mo.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="b-cursor" aria-hidden="true" />
      <div ref={ringRef} className="b-cursor-ring" aria-hidden="true" />
    </>
  );
}

/* ── Scroll-reveal observer (fade-up elements) ── */
function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const attach = () => {
      document.querySelectorAll(".fade-up:not(.visible)").forEach(el => observer.observe(el));
    };
    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { observer.disconnect(); mo.disconnect(); };
  }, []);

  return null;
}

function App() {
  useReferralCapture();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TagProvider>
            <NotificationProvider>
              <JoinProvider>
                <Router>
                  <RootRouter />
                </Router>
                <Toaster />
                <AIChatWidget />
                <EmailCaptureFooter />
                <EmailCaptureExitIntent />
                <PremiumCursor />
                <ScrollReveal />
              </JoinProvider>
            </NotificationProvider>
          </TagProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
export default App;
