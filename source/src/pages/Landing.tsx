import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/* ─────────────────────────────────────────────
   B-Social Premium Landing Page
   Fullscreen parallax sections → routes into the app
   ───────────────────────────────────────────── */

export default function Landing() {
  const [, navigate] = useLocation();
  const [navScrolled, setNavScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live stats from Supabase
  const { data: liveStats } = useQuery({
    queryKey: ["landingStats"],
    queryFn: async () => {
      const [placesRes, eventsRes] = await Promise.all([
        supabase.from("places").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
      ]);
      // Fetch distinct countries by paginating in chunks to avoid the default 1000-row cap
      const allCountries = new Set<string>();
      let from = 0;
      const PAGE = 5000;
      while (true) {
        const { data } = await supabase
          .from("places")
          .select("country")
          .not("country", "is", null)
          .range(from, from + PAGE - 1);
        if (!data || data.length === 0) break;
        data.forEach((r: any) => allCountries.add(r.country));
        if (data.length < PAGE) break;
        from += PAGE;
      }
      const countries = allCountries.size;
      return {
        places: placesRes.count || 95000,
        events: eventsRes.count || 6400,
        countries: countries || 117,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
  const fmt = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",")}K`;
    return n.toLocaleString("da-DK");
  };

  /* ── parallax on scroll ── */
  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 80);
      const hero = document.getElementById("lp-hero-bg");
      const concert = document.getElementById("lp-concert-bg");
      const fjord = document.getElementById("lp-fjord-bg");
      const aurora = document.getElementById("lp-aurora-bg");
      const y = window.scrollY;
      if (hero) hero.style.transform = `translateY(${y * 0.3}px)`;
      if (concert) {
        const r = document.getElementById("lp-discover")?.getBoundingClientRect();
        if (r) concert.style.transform = `translateY(${-r.top * 0.25}px)`;
      }
      if (fjord) {
        const r = document.getElementById("lp-nature")?.getBoundingClientRect();
        if (r) fjord.style.transform = `translateY(${-r.top * 0.25}px)`;
      }
      if (aurora) {
        const r = document.getElementById("lp-cta")?.getBoundingClientRect();
        if (r) aurora.style.transform = `translateY(${-r.top * 0.25}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── fade-up observer ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("lp-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    containerRef.current?.querySelectorAll(".lp-fade-up").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ── active chip state ── */
  const [activeChip, setActiveChip] = useState("Alle");
  const chips = ["Alle", "Koncert", "Festival", "Jazz", "Klassisk", "Electronic"];

  /* ── email signup ── */
  const [email, setEmail] = useState("");
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) navigate("/auth");
  };

  /* ── sample events ── */
  const events = [
    { img: "/concert.jpg", date: "tirs 31. mar", name: "Melanie Martinez — The Trilogy Tour", venue: "Royal Arena" },
    { img: "/dining.jpg", date: "tirs 31. mar", name: "Nothing But Thieves", venue: "Vega, København" },
    { img: "/fjord.jpg", date: "tirs 31. mar", name: "Pink Floyd Sinfonico Vol. II", venue: "DR Koncerthuset" },
    { img: "/aurora.jpg", date: "søn 5. apr", name: "Copenhagen Jazz Festival 2026", venue: "Tivoli Gardens" },
    { img: "/sport.jpg", date: "fre 3. apr", name: "Marcus Kibæk — Stor Tour", venue: "Aarhus Musikhus" },
  ];

  const categories = [
    { img: "/concert.jpg", tag: "Musik", title: "Koncerter\n& Festivaler", count: "3.800+ events", route: "/udforsk" },
    { img: "/sport.jpg", tag: "Sport", title: "Sport\n& Fitness", count: "37.000+ steder", route: "/kort" },
    { img: "/dining.jpg", tag: "Mad", title: "Mad\n& Drikke", count: "11.900+ steder", route: "/kort" },
    { img: "/fjord.jpg", tag: "Natur", title: "Natur\n& Eventyr", count: "90.500+ steder", route: "/kort" },
  ];

  return (
    <div ref={containerRef} className="lp-root">
      <style>{landingCSS}</style>

      {/* ── NAV ── */}
      <nav className={`lp-nav${navScrolled ? " scrolled" : ""}`}>
        <a className="lp-nav-logo" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <div className="lp-nav-logo-dot" />
          B-Social
        </a>
        <div className="lp-nav-links">
          <a href="#lp-discover" onClick={(e) => { e.preventDefault(); document.getElementById("lp-discover")?.scrollIntoView({ behavior: "smooth" }); }}>Events</a>
          <a href="#lp-nature" onClick={(e) => { e.preventDefault(); document.getElementById("lp-nature")?.scrollIntoView({ behavior: "smooth" }); }}>Oplevelser</a>
          <a href="#lp-categories" onClick={(e) => { e.preventDefault(); document.getElementById("lp-categories")?.scrollIntoView({ behavior: "smooth" }); }}>Kategorier</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>Log ind</a>
        </div>
        <button className="lp-nav-cta" onClick={() => navigate("/auth")}>Kom i gang gratis</button>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-section" id="lp-hero" style={{ alignItems: "flex-end" }}>
        <div className="lp-parallax-bg" id="lp-hero-bg" style={{ backgroundImage: "url('/hero.jpg')" }} />
        <div className="lp-bg-overlay" style={{ background: "linear-gradient(to bottom,rgba(6,10,15,0.1) 0%,rgba(6,10,15,0.0) 30%,rgba(6,10,15,0.7) 70%,rgba(6,10,15,1) 100%)" }} />
        <div className="lp-stats-bar lp-fade-up lp-delay-4">
          <div className="lp-stat-item"><div className="lp-stat-num">{fmt(liveStats?.places ?? 95000)}+</div><div className="lp-stat-label">Steder</div></div>
          <div className="lp-stat-item"><div className="lp-stat-num">{fmt(liveStats?.events ?? 6400)}</div><div className="lp-stat-label">Events</div></div>
          <div className="lp-stat-item"><div className="lp-stat-num">{liveStats?.countries ?? 117}</div><div className="lp-stat-label">Lande</div></div>
        </div>
        <div className="lp-hero-content">
          <div className="lp-hero-eyebrow lp-fade-up">
            <div className="lp-eyebrow-line" />
            Live i dag
          </div>
          <h1 className="lp-hero-h1 lp-fade-up lp-delay-1">
            Find din<br />næste <em>store</em><br />oplevelse
          </h1>
          <div className="lp-hero-bottom">
            <p className="lp-hero-sub lp-fade-up lp-delay-2">
              Events, steder og aktiviteter overalt i verden — alt samlet ét sted. Fra Nyhavn til nordlyset.
            </p>
            <div className="lp-hero-actions lp-fade-up lp-delay-3">
              <button className="lp-btn-primary" onClick={() => navigate("/udforsk")}>Udforsk nu</button>
              <button className="lp-btn-ghost" onClick={() => navigate("/feed")}>Se events →</button>
            </div>
          </div>
        </div>
        <div className="lp-scroll-hint">
          <span>Scroll</span>
          <div className="lp-scroll-line" />
        </div>
      </section>

      {/* ── DISCOVER / EVENTS ── */}
      <section className="lp-section" id="lp-discover">
        <div className="lp-parallax-bg" id="lp-concert-bg" style={{ backgroundImage: "url('/concert.jpg')" }} />
        <div className="lp-bg-overlay-dark" />
        <div className="lp-section-content">
          <div className="lp-section-eyebrow lp-fade-up">
            <div className="lp-eyebrow-line" />
            Musik & Kultur
          </div>
          <h2 className="lp-section-h2 lp-fade-up lp-delay-1">Kom tæt på<br /><em>musikken</em></h2>
          <p className="lp-section-p lp-fade-up lp-delay-2">Fra intime jazzklubber til massive festivaler. B-Social samler alle events i Danmark og resten af Norden.</p>
          <div className="lp-filter-chips lp-fade-up lp-delay-3">
            {chips.map((c) => (
              <div key={c} className={`lp-chip${activeChip === c ? " active" : ""}`} onClick={() => setActiveChip(c)}>{c}</div>
            ))}
          </div>
          <div className="lp-events-row lp-fade-up lp-delay-4">
            {events.map((ev, i) => (
              <div key={i} className="lp-event-card" onClick={() => navigate("/feed")}>
                <img className="lp-event-card-img" src={ev.img} alt={ev.name} />
                <div className="lp-event-card-overlay" />
                <div className="lp-event-card-body">
                  <div className="lp-event-card-date">{ev.date}</div>
                  <div className="lp-event-card-name">{ev.name}</div>
                  <div className="lp-event-card-venue">📍 {ev.venue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NATURE ── */}
      <section className="lp-section" id="lp-nature">
        <div className="lp-parallax-bg" id="lp-fjord-bg" style={{ backgroundImage: "url('/fjord.jpg')" }} />
        <div className="lp-bg-overlay" />
        <div className="lp-nature-content">
          <div className="lp-section-eyebrow lp-fade-up" style={{ justifyContent: "center" }}>
            <div className="lp-eyebrow-line" />
            Natur & Eventyr
            <div className="lp-eyebrow-line" />
          </div>
          <h2 className="lp-section-h2 lp-fade-up lp-delay-1" style={{ maxWidth: "100%", textAlign: "center", margin: "0 auto 20px" }}>Danmark og<br /><em>Norden venter</em></h2>
          <p className="lp-section-p lp-fade-up lp-delay-2" style={{ margin: "0 auto 40px", textAlign: "center" }}>Vandreture, havkajak, nordlys-turer og meget mere. Find det uforglemmelige i din baghave.</p>
          <div className="lp-glass-card lp-fade-up lp-delay-3">
            <div className="lp-glass-card-icon">📍</div>
            <div className="lp-glass-card-text">
              <p>Steder nær dig</p>
              <strong>3.200+ natur-oplevelser i DK</strong>
            </div>
          </div>
          <div className="lp-hero-actions lp-fade-up lp-delay-4" style={{ justifyContent: "center" }}>
            <button className="lp-btn-primary" onClick={() => navigate("/kort")}>Udforsk natur</button>
            <button className="lp-btn-ghost" onClick={() => navigate("/kort")}>Se kort →</button>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <div id="lp-categories">
        <div className="lp-cat-grid">
          {categories.map((cat, i) => (
            <div key={i} className="lp-cat-item" onClick={() => navigate(cat.route)}>
              <div className="lp-cat-bg" style={{ backgroundImage: `url('${cat.img}')` }} />
              <div className="lp-cat-overlay" />
              <div className="lp-cat-arrow">↗</div>
              <div className="lp-cat-body">
                <div className="lp-cat-tag">{cat.tag}</div>
                <div className="lp-cat-title">{cat.title.split("\n").map((l, j) => <span key={j}>{l}<br /></span>)}</div>
                <div className="lp-cat-count">{cat.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="lp-section" id="lp-cta">
        <div className="lp-parallax-bg" id="lp-aurora-bg" style={{ backgroundImage: "url('/aurora.jpg')" }} />
        <div className="lp-bg-overlay" />
        <div className="lp-cta-content">
          <div className="lp-section-eyebrow lp-fade-up" style={{ justifyContent: "center" }}>
            <div className="lp-eyebrow-line" />
            Bliv en del af det
            <div className="lp-eyebrow-line" />
          </div>
          <h2 className="lp-section-h2 lp-fade-up lp-delay-1" style={{ maxWidth: "100%", textAlign: "center", margin: "0 auto 16px" }}>Oplevelser<br />begynder <em>her</em></h2>
          <p className="lp-section-p lp-fade-up lp-delay-2" style={{ margin: "0 auto 40px", textAlign: "center" }}>Tilmeld dig og få personlige event-anbefalinger baseret på dine interesser. Gratis for altid.</p>
          <form className="lp-email-form lp-fade-up lp-delay-3" onSubmit={handleSignup}>
            <input type="email" placeholder="Din e-mail adresse" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit">Kom i gang →</button>
          </form>
          <p className="lp-cta-note lp-fade-up lp-delay-3">Ingen spam. Afmeld når som helst.</p>
          <div className="lp-trust-row lp-fade-up lp-delay-4">
            <div className="lp-trust-item"><div className="lp-trust-dot" />188K+ steder</div>
            <div className="lp-trust-item"><div className="lp-trust-dot" />9.400+ events</div>
            <div className="lp-trust-item"><div className="lp-trust-dot" />144 lande</div>
            <div className="lp-trust-item"><div className="lp-trust-dot" />Gratis at bruge</div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">
              <div className="lp-nav-logo-dot" />
              B-Social
            </div>
            <p>Oplev verden sammen. Danmarks bedste platform til at finde events og oplevelser.</p>
          </div>
          <div className="lp-footer-cols">
            <div className="lp-footer-col">
              <h4>Platform</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/feed"); }}>Feed</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/udforsk"); }}>Udforsk</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/kort"); }}>Kort</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/beskeder"); }}>Beskeder</a>
            </div>
            <div className="lp-footer-col">
              <h4>For virksomheder</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/firma/auth"); }}>Firma-konto</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/firma/auth"); }}>Opret events</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/firma/auth"); }}>Annoncering</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/firma/auth"); }}>API</a>
            </div>
            <div className="lp-footer-col">
              <h4>Hjælp</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/vilkaar"); }}>Om B-Social</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/vilkaar"); }}>Kontakt</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/vilkaar"); }}>Vilkår</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/privatlivspolitik"); }}>Privatlivspolitik</a>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© 2026 B-Social. Alle rettigheder forbeholdes.</p>
          <div className="lp-footer-langs">
            <div className="lp-lang-pill active">🇩🇰 Dansk</div>
            <div className="lp-lang-pill">🇬🇧 English</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Scoped CSS — all classes prefixed with lp-
   to avoid polluting the rest of the app
   ────────────────────────────────────────────── */
const landingCSS = `
.lp-root {
  --teal: #4ecdc4;
  --teal-dim: rgba(78,205,196,0.15);
  --lp-white: rgba(255,255,255,0.95);
  --lp-white-dim: rgba(255,255,255,0.55);
  --lp-white-muted: rgba(255,255,255,0.25);
  --serif: 'Instrument Serif', Georgia, serif;
  --sans: 'DM Sans', -apple-system, sans-serif;
  background: #060a0f;
  color: var(--lp-white);
  font-family: var(--sans);
  overflow-x: hidden;
}

/* ── NAV ── */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 28px 52px; transition: all 0.5s ease;
}
.lp-nav.scrolled {
  padding: 16px 52px;
  background: rgba(6,10,15,0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.lp-nav-logo {
  font-family: var(--serif); font-size: 24px; color: var(--lp-white);
  letter-spacing: 0.5px; text-decoration: none;
  display: flex; align-items: center; gap: 10px;
}
.lp-nav-logo-dot {
  width: 8px; height: 8px; background: var(--teal);
  border-radius: 50%; box-shadow: 0 0 12px var(--teal);
}
.lp-nav-links { display: flex; align-items: center; gap: 36px; }
.lp-nav-links a {
  color: var(--lp-white-dim); font-size: 14px; font-weight: 400;
  text-decoration: none; letter-spacing: 0.3px; transition: color 0.2s;
}
.lp-nav-links a:hover { color: var(--lp-white); }
.lp-nav-cta {
  padding: 10px 24px; background: var(--teal); color: #060a0f;
  border: none; border-radius: 100px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.25s; font-family: var(--sans); letter-spacing: 0.3px;
}
.lp-nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(78,205,196,0.35);
}

/* ── SECTIONS ── */
.lp-section {
  position: relative; min-height: 100vh;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.lp-parallax-bg {
  position: absolute; inset: -10%;
  background-size: cover; background-position: center;
  transform-origin: center; will-change: transform;
}
.lp-bg-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg,rgba(6,10,15,0.2) 0%,rgba(6,10,15,0.55) 50%,rgba(6,10,15,0.85) 100%);
  z-index: 1;
}
.lp-bg-overlay-dark {
  position: absolute; inset: 0; background: rgba(6,10,15,0.65); z-index: 1;
}

/* ── HERO ── */
.lp-hero-content { position: relative; z-index: 2; width: 100%; padding: 0 52px 80px; }
.lp-hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 500; color: var(--teal);
  text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 24px;
}
.lp-eyebrow-line { width: 32px; height: 1px; background: var(--teal); }
.lp-hero-h1 {
  font-family: var(--serif);
  font-size: clamp(52px, 7vw, 110px);
  font-weight: 400; line-height: 0.95; letter-spacing: -2px;
  margin-bottom: 32px; max-width: 800px;
}
.lp-hero-h1 em { font-style: italic; color: var(--teal); }
.lp-hero-bottom {
  display: flex; align-items: flex-end; justify-content: space-between;
  flex-wrap: wrap; gap: 32px;
}
.lp-hero-sub {
  font-size: 16px; font-weight: 300; color: var(--lp-white-dim);
  max-width: 360px; line-height: 1.6; letter-spacing: 0.2px;
}
.lp-hero-actions { display: flex; gap: 16px; align-items: center; }

/* ── BUTTONS ── */
.lp-btn-primary {
  padding: 16px 36px; background: var(--teal); color: #060a0f;
  border: none; border-radius: 100px; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.3s; font-family: var(--sans);
  position: relative; overflow: hidden;
}
.lp-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(78,205,196,0.4);
}
.lp-btn-ghost {
  padding: 16px 36px; background: transparent; color: var(--lp-white);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 100px;
  font-size: 15px; font-weight: 400; cursor: pointer;
  transition: all 0.3s; font-family: var(--sans);
}
.lp-btn-ghost:hover { border-color: var(--teal); color: var(--teal); }

/* ── SCROLL HINT ── */
.lp-scroll-hint {
  position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
  z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0.4;
}
.lp-scroll-hint span { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }
.lp-scroll-line {
  width: 1px; height: 48px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.6), transparent);
  animation: lp-scroll-bounce 2s ease-in-out infinite;
}
@keyframes lp-scroll-bounce {
  0%,100% { transform: scaleY(1) translateY(0); }
  50% { transform: scaleY(0.8) translateY(8px); }
}

/* ── STATS BAR ── */
.lp-stats-bar {
  position: absolute; top: 50%; right: 52px; transform: translateY(-50%);
  z-index: 2; display: flex; flex-direction: column; gap: 32px;
}
.lp-stat-item { text-align: right; }
.lp-stat-num { font-family: var(--serif); font-size: 36px; font-weight: 400; color: var(--lp-white); line-height: 1; }
.lp-stat-label { font-size: 11px; font-weight: 400; color: var(--lp-white-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }

/* ── SECTION CONTENT ── */
.lp-section-content { position: relative; z-index: 2; width: 100%; padding: 100px 52px; }
.lp-section-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 500; color: var(--teal);
  text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 20px;
}
.lp-section-h2 {
  font-family: var(--serif);
  font-size: clamp(40px, 5vw, 80px);
  font-weight: 400; line-height: 1; letter-spacing: -1.5px;
  margin-bottom: 20px; max-width: 700px;
}
.lp-section-h2 em { font-style: italic; color: var(--teal); }
.lp-section-p {
  font-size: 17px; font-weight: 300; color: var(--lp-white-dim);
  max-width: 480px; line-height: 1.7; margin-bottom: 48px;
}

/* ── FILTER CHIPS ── */
.lp-filter-chips { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 52px; }
.lp-chip {
  padding: 10px 22px; background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 100px;
  font-size: 13px; color: var(--lp-white-dim); cursor: pointer;
  transition: all 0.25s; backdrop-filter: blur(8px);
}
.lp-chip:hover, .lp-chip.active {
  background: var(--teal); color: #060a0f;
  border-color: var(--teal); font-weight: 600;
}

/* ── EVENT CARDS ── */
.lp-events-row { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; }
.lp-events-row::-webkit-scrollbar { display: none; }
.lp-event-card {
  flex: 0 0 280px; border-radius: 16px; overflow: hidden;
  position: relative; cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.23,1,0.32,1);
}
.lp-event-card:hover { transform: translateY(-8px) scale(1.02); }
.lp-event-card-img {
  width: 100%; height: 340px; object-fit: cover;
  transition: transform 0.6s ease;
}
.lp-event-card:hover .lp-event-card-img { transform: scale(1.08); }
.lp-event-card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(6,10,15,0.9) 0%, transparent 50%);
}
.lp-event-card-body { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; }
.lp-event-card-date {
  font-size: 11px; color: var(--teal); text-transform: uppercase;
  letter-spacing: 1.5px; margin-bottom: 6px; font-weight: 500;
}
.lp-event-card-name { font-family: var(--serif); font-size: 20px; line-height: 1.2; margin-bottom: 6px; }
.lp-event-card-venue { font-size: 12px; color: var(--lp-white-muted); display: flex; align-items: center; gap: 4px; }

/* ── NATURE CONTENT ── */
.lp-nature-content {
  position: relative; z-index: 2; text-align: center; padding: 52px; max-width: 700px;
}
.lp-glass-card {
  display: inline-flex; align-items: center; gap: 16px;
  padding: 20px 32px; background: rgba(255,255,255,0.06);
  backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; margin-bottom: 40px;
}
.lp-glass-card-icon {
  width: 44px; height: 44px; background: var(--teal-dim);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  color: var(--teal); font-size: 20px;
}
.lp-glass-card-text p { font-size: 13px; color: var(--lp-white-muted); margin-bottom: 2px; }
.lp-glass-card-text strong { font-size: 15px; font-weight: 500; }

/* ── CATEGORIES GRID ── */
#lp-categories { min-height: auto; display: block; }
.lp-cat-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 50vh 50vh; }
.lp-cat-item { position: relative; overflow: hidden; cursor: pointer; }
.lp-cat-item:hover .lp-cat-bg { transform: scale(1.06); }
.lp-cat-bg {
  position: absolute; inset: 0; background-size: cover; background-position: center;
  transition: transform 0.6s cubic-bezier(0.23,1,0.32,1);
}
.lp-cat-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(6,10,15,0.6) 0%, rgba(6,10,15,0.2) 100%);
  transition: background 0.4s;
}
.lp-cat-item:hover .lp-cat-overlay {
  background: linear-gradient(135deg, rgba(6,10,15,0.4) 0%, rgba(6,10,15,0.1) 100%);
}
.lp-cat-body { position: absolute; bottom: 0; left: 0; right: 0; padding: 32px 36px; }
.lp-cat-tag {
  display: inline-block; padding: 4px 12px; background: var(--teal);
  color: #060a0f; border-radius: 100px; font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;
}
.lp-cat-title { font-family: var(--serif); font-size: 32px; font-weight: 400; line-height: 1; letter-spacing: -0.5px; }
.lp-cat-count { font-size: 13px; color: var(--lp-white-muted); margin-top: 6px; }
.lp-cat-arrow {
  position: absolute; top: 28px; right: 28px; width: 40px; height: 40px;
  background: rgba(255,255,255,0.1); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(8px); transition: all 0.3s; color: var(--lp-white-dim);
}
.lp-cat-item:hover .lp-cat-arrow { background: var(--teal); color: #060a0f; transform: rotate(45deg); }

/* ── CTA SECTION ── */
.lp-cta-content {
  position: relative; z-index: 2; text-align: center; padding: 52px; max-width: 680px;
}
.lp-email-form {
  display: flex; gap: 0; max-width: 460px; margin: 0 auto;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 100px;
  padding: 6px 6px 6px 24px;
}
.lp-email-form input {
  flex: 1; background: none; border: none; color: var(--lp-white);
  font-size: 14px; outline: none; font-family: var(--sans);
}
.lp-email-form input::placeholder { color: rgba(255,255,255,0.35); }
.lp-email-form button {
  padding: 12px 28px; background: var(--teal); color: #060a0f;
  border: none; border-radius: 100px; font-size: 13px; font-weight: 600;
  cursor: pointer; white-space: nowrap; font-family: var(--sans); transition: all 0.25s;
}
.lp-email-form button:hover { background: #6feee6; transform: scale(1.02); }
.lp-cta-note { font-size: 12px; color: var(--lp-white-muted); margin-top: 16px; }
.lp-trust-row {
  display: flex; align-items: center; justify-content: center;
  gap: 28px; margin-top: 44px; flex-wrap: wrap;
}
.lp-trust-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--lp-white-dim); }
.lp-trust-dot { width: 5px; height: 5px; background: var(--teal); border-radius: 50%; }

/* ── FOOTER ── */
.lp-footer {
  background: #060a0f; border-top: 1px solid rgba(255,255,255,0.06); padding: 52px;
}
.lp-footer-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 52px; flex-wrap: wrap; gap: 40px;
}
.lp-footer-brand p { font-size: 14px; color: var(--lp-white-muted); max-width: 260px; line-height: 1.6; }
.lp-footer-logo {
  font-family: var(--serif); font-size: 28px; display: flex;
  align-items: center; gap: 10px; margin-bottom: 12px;
}
.lp-footer-cols { display: flex; gap: 64px; flex-wrap: wrap; }
.lp-footer-col h4 {
  font-size: 12px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 1.5px; color: var(--lp-white-muted); margin-bottom: 16px;
}
.lp-footer-col a {
  display: block; font-size: 14px; color: rgba(255,255,255,0.5);
  text-decoration: none; margin-bottom: 10px; transition: color 0.2s;
}
.lp-footer-col a:hover { color: var(--teal); }
.lp-footer-bottom {
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid rgba(255,255,255,0.05); padding-top: 28px;
  flex-wrap: wrap; gap: 16px;
}
.lp-footer-bottom p { font-size: 13px; color: rgba(255,255,255,0.25); }
.lp-footer-langs { display: flex; gap: 4px; }
.lp-lang-pill {
  padding: 5px 12px; border-radius: 100px; font-size: 12px;
  background: rgba(255,255,255,0.06); color: var(--lp-white-dim);
  cursor: pointer; border: 1px solid transparent; transition: all 0.2s;
}
.lp-lang-pill.active { border-color: rgba(78,205,196,0.3); color: var(--teal); }

/* ── FADE-UP ANIMATIONS ── */
.lp-fade-up {
  opacity: 0; transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.23,1,0.32,1), transform 0.8s cubic-bezier(0.23,1,0.32,1);
}
.lp-fade-up.lp-visible { opacity: 1; transform: translateY(0); }
.lp-delay-1 { transition-delay: 0.1s; }
.lp-delay-2 { transition-delay: 0.2s; }
.lp-delay-3 { transition-delay: 0.35s; }
.lp-delay-4 { transition-delay: 0.5s; }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .lp-nav { padding: 20px 24px; }
  .lp-nav.scrolled { padding: 14px 24px; }
  .lp-nav-links { display: none; }
  .lp-hero-content { padding: 0 24px 80px; }
  .lp-stats-bar { display: none; }
  .lp-section-content { padding: 80px 24px; }
  .lp-cat-grid { grid-template-columns: 1fr; grid-template-rows: repeat(4, 45vh); }
  .lp-footer-top { flex-direction: column; }
  .lp-footer-cols { gap: 40px; }
  .lp-nature-content { padding: 32px 24px; }
  .lp-cta-content { padding: 32px 24px; }
  .lp-footer { padding: 32px 24px; }
}
`;
