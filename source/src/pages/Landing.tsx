import { useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/test");
  }, []);

  return (
    <div
      className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to bottom, rgba(6,10,15,0.55) 0%, rgba(6,10,15,0.45) 40%, rgba(6,10,15,0.75) 100%),
          url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&fit=crop')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
      data-testid="landing-page"
    >
      {/* Gradient overlay bottom */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#060a0f] to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-8 pt-20 pb-16 w-full">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-3xl glass-card-strong flex items-center justify-center shadow-2xl">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              className="w-12 h-12"
              aria-label="B-Social logo"
            >
              {/* Compass needle */}
              <circle cx="20" cy="20" r="17" stroke="#4ECDC4" strokeWidth="1.5" opacity="0.6" />
              <circle cx="20" cy="20" r="12" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              {/* N pointer */}
              <path d="M20 8 L22.5 18 L20 16 L17.5 18 Z" fill="#4ECDC4" />
              {/* S pointer */}
              <path d="M20 32 L17.5 22 L20 24 L22.5 22 Z" fill="rgba(255,255,255,0.4)" />
              {/* Center dot */}
              <circle cx="20" cy="20" r="2" fill="#4ECDC4" />
              {/* Cardinal marks */}
              <line x1="20" y1="3" x2="20" y2="6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="20" y1="34" x2="20" y2="37" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="20" x2="6" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="34" y1="20" x2="37" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <h1 className="text-4xl font-serif text-white tracking-tight" style={{ fontWeight: 400 }}>
              B-Social
            </h1>
            <p className="text-[#34D399] text-sm font-semibold mt-1 tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              Find oplevelser, deltag, og mød mennesker der deler dine interesser
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-10">
          <button
            onClick={() => setLocation("/onboarding")}
            className="w-full py-4 rounded-2xl bg-[#4ECDC4] text-[#0a0f1a] font-semibold text-base hover:bg-[#3dbdb5] active:scale-98 transition-all duration-200 shadow-lg"
            data-testid="button-kom-i-gang"
          >
            Kom i gang
          </button>

          <button
            onClick={() => setLocation("/auth")}
            className="w-full py-3 rounded-2xl glass-card text-white/80 font-medium text-sm hover:text-white hover:bg-white/10 transition-all duration-200"
            data-testid="button-log-ind"
          >
            Log ind her
          </button>
        </div>

        {/* Bottom decorative dots */}
        <div className="flex gap-2 mt-10 opacity-40">
          <span className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
          <span className="w-2 h-2 rounded-full bg-white/40" />
          <span className="w-2 h-2 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
        <a
          href="https://www.perplexity.ai/computer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/25 text-xs hover:text-white/40 transition-colors"
        >
          Created with Perplexity Computer
        </a>
      </div>
    </div>
  );
}
