import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { User, Calendar, BarChart3, Clock, StickyNote, Settings } from "lucide-react";

const SUB_NAV_ITEMS = [
  { href: "/min-side", labelKey: "nav.min_side", fallback: "Min Side", icon: User },
  { href: "/kalender", labelKey: "nav.kalender", fallback: "Kalender", icon: Calendar },
  { href: "/overblik", labelKey: "nav.overblik", fallback: "Overblik", icon: BarChart3 },
  { href: "/historik", labelKey: "nav.historik", fallback: "Historik", icon: Clock },
  { href: "/noter", labelKey: "nav.noter", fallback: "Noter", icon: StickyNote },
  { href: "/indstillinger", labelKey: "settings.title", fallback: "Indstillinger", icon: Settings },
];

const msnCSS = `
.msn-wrap {
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 16px 0;
  overflow: hidden;
  max-width: 100%;
}
.msn-scroll {
  display: flex;
  gap: 8px;
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 0;
  min-width: 100%;
}
.msn-scroll::-webkit-scrollbar { display: none; }
.msn-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 100px;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s;
  flex-shrink: 0;
  font-family: var(--sans);
}
.msn-item--inactive {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
}
.msn-item--inactive:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.7);
}
.msn-item--active {
  background: rgba(78,205,196,0.12);
  border: 1px solid rgba(78,205,196,0.2);
  color: #4ECDC4;
  box-shadow: 0 0 12px rgba(78,205,196,0.15);
}
`;

export function MinSideSubNav() {
  const { t } = useTranslation();
  const [location] = useLocation();

  return (
    <>
      <style>{msnCSS}</style>
      <nav className="msn-wrap">
        <div className="msn-scroll">
          {SUB_NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`msn-item ${isActive ? "msn-item--active" : "msn-item--inactive"}`}
              >
                <Icon size={14} />
                {t(item.labelKey, item.fallback)}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
