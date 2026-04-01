import { Link } from "wouter";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Home, Compass, MapPin, MessageCircle, User, Bell, Building2, UserPlus, CircleDollarSign, LogIn, LogOut, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const NAV_MAIN = [
  { key: "nav.feed", icon: Home, href: "/feed" },
  { key: "nav.udforsk", icon: Compass, href: "/udforsk" },
  { key: "nav.kort", icon: MapPin, href: "/kort" },
  { key: "nav.beskeder", icon: MessageCircle, href: "/beskeder" },
  { key: "nav.min_side", icon: User, href: "/min-side" },
];

export default function DesktopAppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { unreadCount } = useNotifications();
  const { isLoggedIn, profile, signOut, loading: authLoading, user } = useAuth();
  const loggedIn = !authLoading && isLoggedIn;
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Load unread messages count on mount
  useEffect(() => {
    if (!loggedIn || !user?.id) return;

    const loadUnreadMessages = async () => {
      try {
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .neq("sender_id", user.id)
          .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        setUnreadMessages(count || 0);
      } catch (error) {
        console.error("Failed to load unread messages:", error);
      }
    };

    loadUnreadMessages();
  }, [loggedIn, user?.id]);

  const navLink = (href: string, icon: any, label: string, opts?: { badge?: number; mt?: boolean }) => {
    const Icon = icon;
    const isActive = href === "/feed"
      ? (location === "/" || location === "/feed" || location === "/test")
      : location.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5 ${opts?.mt ? "mt-4" : ""} ${
          isActive
            ? "text-[#4ECDC4] font-medium"
            : "text-white/45 hover:text-white/75 hover:bg-white/[0.03]"
        }`}
        style={isActive ? { background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.1)" } : undefined}
      >
        <div
          className="relative w-8 h-8 rounded-lg flex items-center justify-center"
          style={
            isActive
              ? {
                  opacity: 1,
                  boxShadow: "0 0 20px rgba(78,205,196,0.3)",
                  background: "rgba(78,205,196,0.12)",
                }
              : { opacity: 0.7 }
          }
        >
          <Icon size={18} />
          {opts?.badge && opts.badge > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
              {opts.badge > 99 ? "99+" : opts.badge}
            </span>
          ) : null}
        </div>
        {label}
      </Link>
    );
  };

  return (
    <div className="dsk-app dark">
      {/* Desktop sidebar */}
      <aside
        className="dsk-sidebar"
        style={{
          background: "linear-gradient(180deg, #060a0f 0%, #060a0f 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle teal ambient glow at top of sidebar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "220px",
            background: "radial-gradient(ellipse 120% 30% at 50% 0%, rgba(78,205,196,0.04) 0%, transparent 60%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Logo area — premium version */}
        <Link
          href="/feed"
          className="block px-5 py-6 mb-1 cursor-pointer border-b border-white/[0.06]"
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* Subtle radial glow behind logo */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "160px",
              height: "80px",
              background: "radial-gradient(ellipse at center, rgba(78,205,196,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div className="flex items-center gap-3" style={{ position: "relative" }}>
            {/* Teal circle/dot glow logo mark */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {/* Outer glow ring */}
              <div
                style={{
                  position: "absolute",
                  inset: "-4px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(78,205,196,0.18) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              {/* The dot itself */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 38% 38%, #7ef4ed 0%, #4ECDC4 55%, #2aa39c 100%)",
                  boxShadow: "0 0 18px rgba(78,205,196,0.45), 0 0 6px rgba(78,205,196,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: "17px",
                    color: "#060a0f",
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: "-0.5px",
                  }}
                >
                  B
                </span>
              </div>
            </div>
            <div>
              <span
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: "22px",
                  color: "#f0fffe",
                  letterSpacing: "-0.3px",
                  lineHeight: 1.1,
                  display: "block",
                }}
              >
                B-Social
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#4ECDC4",
                  fontWeight: 600,
                  marginTop: "3px",
                  lineHeight: 1,
                }}
              >
                Norden
              </span>
            </div>
          </div>
        </Link>

        {/* Main navigation */}
        <nav className="flex-1 px-3" style={{ position: "relative", zIndex: 1 }}>
          {NAV_MAIN.map((item) => navLink(item.href, item.icon, t(item.key), item.key === "nav.beskeder" ? { badge: unreadMessages } : undefined))}
          {/* Invitér — right under Beskeder/Min Side */}
          {navLink("/inviter", UserPlus, "Invitér")}

          {/* Separator */}
          <div className="h-px bg-white/[0.06] my-3 mx-2" />

          {/* Notifikationer */}
          {navLink("/notifikationer", Bell, t("nav.notifications") || "Notifikationer", { badge: unreadCount })}

          {/* Henvisning (affiliate/earnings) */}
          {navLink("/henvisning", CircleDollarSign, t("nav.henvisning") || "Henvisning")}

          {/* Firma / Kunde */}
          {navLink("/firma", Building2, t("nav.firma") || "Firma")}
        </nav>

        {/* Bottom section: Auth + Language + Version */}
        <div className="px-3 space-y-2 pb-2" style={{ position: "relative", zIndex: 1 }}>
          {/* Login / Logout button */}
          {authLoading ? (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-white/10 rounded w-20" />
                <div className="h-2 bg-white/5 rounded w-14" />
              </div>
            </div>
          ) : loggedIn ? (
            <div className="space-y-1">
              {/* User info */}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04]" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-8 h-8 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center text-[#4ECDC4] text-xs font-bold">
                  {profile?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-medium truncate">{profile?.name || "Bruger"}</p>
                  <p className="text-xs text-white/40 truncate">{profile?.city || ""}</p>
                </div>
              </div>
              {/* Settings + Logout */}
              <div className="flex gap-1">
                <Link href="/indstillinger" className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 text-xs transition-all">
                  <Settings size={14} />
                  Indstillinger
                </Link>
                <button
                  onClick={async () => { await signOut(); setLocation("/"); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 text-xs transition-all"
                >
                  <LogOut size={14} />
                  Log ud
                </button>
              </div>
            </div>
          ) : (
            /* Premium gradient-border login CTA */
            <div
              style={{
                padding: "1px",
                borderRadius: "13px",
                background: "linear-gradient(135deg, rgba(78,205,196,0.5) 0%, rgba(147,197,253,0.3) 50%, rgba(78,205,196,0.15) 100%)",
                boxShadow: "0 4px 24px rgba(78,205,196,0.12)",
              }}
            >
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(78,205,196,0.12) 0%, rgba(147,197,253,0.06) 100%)",
                  color: "#4ECDC4",
                  borderRadius: "12px",
                }}
              >
                <LogIn size={16} />
                Log ind / Opret konto
              </Link>
            </div>
          )}

          {/* Language switcher */}
          <LanguageSwitcher variant="toggle" />
        </div>
        <div className="px-4 pb-3 text-white/15 text-xs" style={{ position: "relative", zIndex: 1 }}>
          v1.0 beta
        </div>
      </aside>

      {/* Main content */}
      <main className="dsk-main">
        {children}
      </main>

      {/* Mobile bottom nav — unchanged */}
      <div className="dsk-bottom-nav glass-nav">
        <div className="flex items-center justify-around h-20">
          {NAV_MAIN.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/feed"
              ? (location === "/" || location === "/feed" || location === "/test")
              : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 text-xs py-3 px-4 min-h-[44px] min-w-[44px] select-none ${
                  isActive ? "text-[#4ECDC4]" : "text-white/40"
                }`}
                style={{ touchAction: "manipulation" }}
              >
                <Icon size={22} />
                <span>{t(item.key)}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-[#4ECDC4]" />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
