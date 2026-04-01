import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  CalendarPlus,
  Target,
  BarChart3,
  CreditCard,
  Building2,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Bell,
  Settings,
  ArrowLeft,
    Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { path: "/firma", labelKey: "firma.nav_overview", icon: LayoutDashboard },
  { path: "/firma/events", labelKey: "firma.nav_events", icon: CalendarPlus },
    { path: "/firma/rekruttering", labelKey: "firma.nav_recruitment", icon: Users },
  { path: "/firma/targeting", labelKey: "firma.nav_tag_targeting", icon: Target },
  { path: "/firma/analytics", labelKey: "firma.nav_analytics", icon: BarChart3 },
  { path: "/firma/fakturering", labelKey: "firma.nav_billing", icon: CreditCard },
  { path: "/firma/indstillinger", labelKey: "firma.nav_settings", icon: Settings },
];

export default function FirmaLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const NOTIFICATIONS = [
    { id: 1, text: t('firma.notif_new_signup'), time: t('firma.notif_time_2min'), unread: true },
    { id: 2, text: t('firma.notif_event_views'), time: t('firma.notif_time_1hour'), unread: true },
    { id: 3, text: t('firma.notif_new_followers'), time: t('firma.notif_time_3hours'), unread: false },
    { id: 4, text: t('firma.notif_invoice_paid'), time: t('firma.notif_time_1day'), unread: false },
  ];
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen flex" style={{ background: "#060a0f" }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{
          background: "#060a0f",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
          position: "fixed",
        }}
      >
        {/* Subtle teal ambient glow at the top of the sidebar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: "radial-gradient(ellipse 120% 30% at 50% 0%, rgba(78,205,196,0.04) 0%, transparent 60%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Logo & Firma badge */}
        <div
          className="p-5"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Teal dot glow logo mark */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                {/* Outer glow ring */}
                <div
                  style={{
                    position: "absolute",
                    inset: "-4px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(78,205,196,0.16) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
                {/* The dot */}
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 38% 38%, #7ef4ed 0%, #4ECDC4 55%, #2aa39c 100%)",
                    boxShadow: "0 0 16px rgba(78,205,196,0.4), 0 0 5px rgba(78,205,196,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Instrument Serif', Georgia, serif",
                      fontSize: "16px",
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
                    fontSize: "20px",
                    color: "#f0fffe",
                    letterSpacing: "-0.3px",
                    lineHeight: 1.1,
                    display: "block",
                  }}
                >
                  B-Social
                </span>
                {/* Firma badge */}
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "#4ECDC4",
                    fontWeight: 600,
                    marginTop: "3px",
                    lineHeight: 1,
                    background: "rgba(78,205,196,0.1)",
                    border: "1px solid rgba(78,205,196,0.2)",
                    borderRadius: "4px",
                    padding: "2px 5px",
                  }}
                >
                  Firma
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 px-3 py-4 overflow-y-auto"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === "/firma"
                ? location === "/firma"
                : location.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "text-[#4ECDC4] font-medium"
                      : "text-white/45 hover:text-white/75 hover:bg-white/[0.03]"
                  }`}
                  style={
                    isActive
                      ? {
                          background: "rgba(78,205,196,0.08)",
                          border: "1px solid rgba(78,205,196,0.1)",
                        }
                      : undefined
                  }
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={
                      isActive
                        ? {
                            background: "rgba(78,205,196,0.12)",
                            boxShadow: "0 0 20px rgba(78,205,196,0.3)",
                          }
                        : { opacity: 0.7 }
                    }
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div
          className="p-3 space-y-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}
        >
          <Link
            href="/test"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ opacity: 0.7 }}>
              <ArrowLeft size={17} strokeWidth={1.8} />
            </div>
            {t('firma.back_to_app')}
          </Link>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ opacity: 0.7 }}>
              <LogOut size={17} strokeWidth={1.8} />
            </div>
            {t('firma.log_out')}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top header */}
        <header
          className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between"
          style={{
            background: "rgba(6,10,15,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Building2 size={14} />
            <span>AktivNord Padel</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: "rgba(78,205,196,0.12)",
                color: "#4ECDC4",
                border: "1px solid rgba(78,205,196,0.2)",
              }}
            >
              Pro
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                    style={{ background: "#4ECDC4", boxShadow: "0 0 6px rgba(78,205,196,0.6)" }}
                  />
                )}
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl overflow-hidden z-50"
                  style={{
                    background: "rgba(10,16,22,0.96)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  }}
                >
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="font-semibold text-sm text-white/80">{t('firma.notifications')}</span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    {NOTIFICATIONS.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 transition-colors"
                        style={{ opacity: n.unread ? 1 : 0.55 }}
                      >
                        <div className="flex items-start gap-2">
                          {n.unread && (
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                              style={{ background: "#4ECDC4" }}
                            />
                          )}
                          {!n.unread && <div className="w-1.5 h-1.5 mt-1.5 shrink-0" />}
                          <div>
                            <p className="text-xs leading-snug text-white/70">{n.text}</p>
                            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <button className="text-xs hover:underline" style={{ color: "#4ECDC4" }}>
                      {t('firma.mark_all_read')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: "rgba(78,205,196,0.15)",
                color: "#4ECDC4",
                border: "1px solid rgba(78,205,196,0.2)",
              }}
            >
              AP
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
