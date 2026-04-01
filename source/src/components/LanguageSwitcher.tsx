import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const STORAGE_KEY = 'b-social-language';

type SupportedLanguage = 'da' | 'en';

const LANGUAGES: { code: SupportedLanguage; flag: string; label: string }[] = [
  { code: 'da', flag: '🇩🇰', label: 'Dansk' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

/**
 * LanguageSwitcher
 *
 * Renders a pill-style toggle for switching between Danish and English.
 * Persists the chosen language to localStorage and applies it via i18n.changeLanguage().
 *
 * Usage:
 *   import { LanguageSwitcher } from '@/components/LanguageSwitcher';
 *   <LanguageSwitcher />
 *
 * Also available as a compact dropdown:
 *   <LanguageSwitcher variant="dropdown" />
 */

interface LanguageSwitcherProps {
  /** 'toggle' — side-by-side pill (default, suits footers/settings)
   *  'dropdown' — compact select, suits tight spaces */
  variant?: 'toggle' | 'dropdown';
  className?: string;
}

export function LanguageSwitcher({ variant = 'toggle', className = '' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [current, setCurrent] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && ['da', 'en'].includes(saved)) return saved;
    return 'da';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sync i18n on mount in case localStorage differs from i18n instance
  useEffect(() => {
    if (i18n.language !== current) {
      i18n.changeLanguage(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeLanguage = (lang: SupportedLanguage) => {
    setCurrent(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    setDropdownOpen(false);
  };

  /* ── Pill / toggle variant ── */
  if (variant === 'toggle') {
    return (
      <div
        className={`inline-flex items-center rounded-2xl p-1.5 gap-1 ${className}`}
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1.5px solid rgba(78, 205, 196, 0.25)',
        }}
        role="group"
        aria-label="Language switcher"
      >
        {LANGUAGES.map((lang) => {
          const isActive = current === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              aria-pressed={isActive}
              aria-label={`Switch to ${lang.label}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 select-none"
              style={{
                background: isActive
                  ? 'rgba(78, 205, 196, 0.25)'
                  : 'transparent',
                color: isActive ? '#FFF' : 'rgba(255,255,255,0.70)',
                border: isActive
                  ? '1.5px solid rgba(78,205,196,0.50)'
                  : '1.5px solid transparent',
                boxShadow: isActive
                  ? '0 0 12px rgba(78,205,196,0.25)'
                  : 'none',
              }}
            >
              <span role="img" aria-hidden="true">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Dropdown variant ── */
  const activeLang = LANGUAGES.find((l) => l.code === current)!;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setDropdownOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
        aria-label="Select language"
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none"
        style={{
          background: 'rgba(78, 205, 196, 0.15)',
          border: '1.5px solid rgba(78, 205, 196, 0.35)',
          color: '#FFF',
        }}
      >
        <Globe size={16} />
        <span>{activeLang.label}</span>
        {/* Chevron */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className="transition-transform duration-200"
          style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        >
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {dropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
            aria-hidden="true"
          />
          {/* Menu */}
          <ul
            role="listbox"
            aria-label="Language options"
            className="absolute bottom-full mb-2 left-0 z-50 w-36 rounded-2xl overflow-hidden py-1"
            style={{
              background: 'rgba(18, 24, 48, 0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
            }}
          >
            {LANGUAGES.map((lang) => {
              const isActive = current === lang.code;
              return (
                <li key={lang.code} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => changeLanguage(lang.code)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-left transition-colors duration-150"
                    style={{
                      color: isActive ? '#FFF' : 'rgba(255,255,255,0.75)',
                      background: isActive ? 'rgba(78,205,196,0.20)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }
                    }}
                  >
                    <span role="img" aria-hidden="true">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {isActive && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        className="ml-auto"
                        aria-hidden="true"
                      >
                        <path d="M1.5 5l2.5 2.5 5-5" stroke="#4ECDC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher;
