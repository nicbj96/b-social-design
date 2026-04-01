import { lazy, Suspense } from "react";
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
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#0D1220" }}>
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
const Indstillinger = lazy(() => import("@/pages/Indstillinger"));
const Privatlivspolitik = lazy(() => import("@/pages/Privatlivspolitik"));
const Vilkaar = lazy(() => import("@/pages/Vilkaar"));
const Henvisning = lazy(() => import("@/pages/Henvisning"));
const InviterVenner = lazy(() => import("@/pages/InviterVenner"));
const Notifikationer = lazy(() => import("@/pages/Notifikationer"));
const WhitelabelLanding = lazy(() => import("@/pages/WhitelabelLanding"));
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
          <Route path="/" component={Feed} />
          <Route path="/test" component={Feed} />
          <Route path="/feed" component={Feed} />
          <Route path="/udforsk" component={Udforsk} />
          <Route path="/kort" component={KortPage} />
          <Route path="/beskeder" component={Beskeder} />
          <Route path="/min-side" component={MinSide} />
          <Route path="/event/:id" component={EventDetail} />
          <Route path="/indstillinger" component={Indstillinger} />
          <Route path="/notifikationer" component={Notifikationer} />
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
              </JoinProvider>
            </NotificationProvider>
          </TagProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
export default App;
