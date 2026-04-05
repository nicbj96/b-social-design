# B-Social — GLOBAL Biker & Car Events Deep Research

> **Date:** April 4, 2026
> **Scope:** WORLDWIDE — not just Denmark. Every country, every continent.
> **Goal:** Aggregate 20,000+ biker & car events annually from global sources

---

## PART 1: GLOBAL BIKER / MOTORCYCLE EVENT SOURCES

### A. Production-Ready APIs

| Platform | URL | Free? | Coverage | Events/Year |
|---|---|---|---|---|
| **MotorsportReg API** | api.motorsportreg.com | OAuth access | USA/Canada/Global racing & track days | 3,000+ |
| **Eventbrite API** | eventbrite.com/platform | 500 req/day free | Global motorcycle events | 5,000+ |
| **Meetup GraphQL API** | meetup.com/graphql | Free tier | 224+ motorcycle groups globally | 2,000+ |
| **AllEvents.in** | allevents.in | Scraping | 40,000+ cities, motorcycle category | 3,000+ |
| **PredictHQ** | predicthq.com | Free tier | 20M+ events globally, smart filtering | Varies |

### B. Motorcycle-Specific Platforms (Scraping Required)

| Platform | URL | Coverage | Method |
|---|---|---|---|
| **CycleFish** | cyclefish.com | 1,000+ US motorcycle events | Cheerio scraping |
| **Lets-Ride** | lets-ride.com | Global (Denmark, USA, EU sections) | Cheerio |
| **LPMCC Rally Listing** | lpmcc.net | European motorcycle rallies | Cheerio |
| **The Biker Guide** | thebikerguide.co.uk | UK/EU rallies, shows, rock nights | Cheerio |
| **Motorcycle Events UK** | motorcycleevents.co.uk | UK motorcycle events | Cheerio |
| **BikerCalendar** | bikercalendar.co.uk | UK/EU biker events | Cheerio |
| **Harley-Davidson Events** | harley-davidson.com (regional) | Global H-D events | Playwright |

### C. Motorcycle Racing Data (Global)

| Series | API/Source | Free? | Data |
|---|---|---|---|
| **MotoGP** | Sportradar MotoGP API | Commercial | Schedules, results, all classes |
| **MotoGP** | github.com/ParsaD23/MotoGP-API | Free | Open-source wrapper |
| **WSBK** | worldsbk.com/en/calendar | Scraping | World Superbike calendar |
| **FIM Events** | fim-moto.com | Scraping | All FIM-sanctioned events worldwide |
| **DMU (Denmark)** | dmusport.dk | Scraping | Danish motocross, speedway, road racing |
| **AMA (USA)** | americanmotorcyclist.com | Scraping | American motorcycle events |

### D. Biker App Data

| App | Users | API? | Alternative |
|---|---|---|---|
| **Rever** | 2M+ riders | No public API | Scrape public routes/events |
| **Calimoto** | 1M+ | No public API | Community partnership |
| **EatSleepRide** | 500K+ | No public API | Contact for partnership |

### E. Key Global Biker Events (Seed Data)

**MEGA EVENTS (100,000+ attendees):**
- Sturgis Motorcycle Rally (USA, South Dakota) — 500,000+ annually, August
- Daytona Bike Week (USA, Florida) — 500,000+, March
- Laconia Motorcycle Week (USA, New Hampshire) — 300,000+, June
- Rolling Thunder (USA, Washington DC) — 900,000+, May
- Isle of Man TT (UK) — 40,000+, June
- Bol d'Or (France) — endurance racing
- Elefantentreffen (Germany, Bavaria) — legendary winter rally, January

**MAJOR EUROPEAN EVENTS:**
- Super Rally 2026 (Denmark, Fredericia) — 10,000+, May
- European Bike Week (Austria, Faaker See) — 100,000+, September
- Moto GP races across 20+ countries
- Wheels & Waves (France, Biarritz) — custom motorcycle culture
- Distinguished Gentleman's Ride — 100+ countries simultaneously
- Glemseck 101 (Germany) — sprint races, custom bikes
- Bike Shed Show (UK, London) — custom motorcycle culture
- Intermot (Germany, Cologne) — major international trade fair

**ASIA & REST OF WORLD:**
- Thailand Motor Expo — 1.5M visitors
- Tokyo Motorcycle Show (Japan)
- India Bike Week (Goa)
- Royal Enfield Rider Mania (India)
- Overland Expo (USA/Global) — adventure motorcycle

---

## PART 2: GLOBAL CAR EVENT SOURCES

### A. Production-Ready APIs

| Platform | URL | Free? | Coverage | Data |
|---|---|---|---|---|
| **Eventbrite API** | eventbrite.com/platform | 500 req/day | Global car shows & meets | Search by "car show", "car meet" |
| **MotorsportReg API** | api.motorsportreg.com | OAuth | USA/Global track days, autocross | 3,000+ events |
| **PredictHQ** | predicthq.com | Free tier | Smart event detection | Conference, festival categories |
| **Meetup GraphQL** | meetup.com/graphql | Free | 109+ car clubs globally | Regular meetups |
| **AllEvents.in** | allevents.in | Scraping | Automotive category globally | Thousands |

### B. Car-Specific Platforms (Scraping/RSS)

| Platform | URL | Coverage | Method |
|---|---|---|---|
| **Cars and Coffee** | cars.coffee | Global C&C events directory | Scraping |
| **Hagerty Events** | hagerty.com/events | USA classic car events | Scraping |
| **Bring a Trailer** | bringatrailer.com | Global car auctions/events | Scraping |
| **RacingCalendar.net** | racingcalendar.net | 14,000+ grassroots events globally | Scraping |
| **10times.com** | 10times.com/automotive | Global auto expos & shows | Scraping |
| **TrackDays.co.uk** | trackdays.co.uk | UK/EU track days | RSS feeds |
| **Bilevents.dk** | bilevents.dk | Denmark car events | Scraping |
| **Classicdays.dk** | classicdays.dk | Denmark classic car meets | Scraping |
| **Motorsport.com** | motorsport.com | Global race schedules | RSS |
| **Drive-This** | drive-this.com | European car event planner | Scraping |

### C. Motorsport Racing APIs (GLOBAL)

| Series | Best API | Free? | Coverage |
|---|---|---|---|
| **Formula 1** | OpenF1 (openf1.org) | FREE (3 req/s) | Real-time telemetry, 2023+ |
| **Formula 1** | Jolpica-F1 (GitHub) | FREE | Historical from 1950 |
| **Formula 1** | FastF1 (Python) | FREE | Telemetry, timing, weather |
| **Formula 1** | API-Sports | 100 req/day free | Standings, schedules |
| **MotoGP** | Sportradar | Commercial | Full series coverage |
| **NASCAR** | Sportradar / SportsDataIO | Free trial | Cup, Xfinity, Trucks |
| **IndyCar** | Sportradar | Commercial | Full series |
| **WRC** | Sportradar + FIA API | Mixed | Rally schedules & results |
| **Formula E** | Sportradar | Commercial | Full series |
| **WEC/Le Mans** | FIA API + TheSportsDB | Free | Endurance racing |
| **Formula Drift** | formulad.com | Scraping only | USA drift events |
| **D1GP** | d1gp.jp | Scraping only | Japanese drift series |

### D. iCalendar Feeds (Direct Import — FREE)

| Feed | URL/Source | Series Covered |
|---|---|---|
| **Rushsync** | rushsync.com | F1, MotoGP, NASCAR, NHRA, WRC |
| **MotoGP Calendar Generator** | motogpcalendargen.com | MotoGP all classes |
| **Better F1 Calendar** | f1calendar.com | F1 with timezone support |
| **GitHub Racing Calendars** | github.com/racing-calendars | Multiple series |
| **I Watch Too Much Racing** | iwatchtoomuchracing.com | Multi-series aggregate |

### E. Multi-Series Commercial APIs

| Provider | URL | Series Count | Type |
|---|---|---|---|
| **Sportradar Racing** | developer.sportradar.com | F1, NASCAR, MotoGP, IndyCar, FE, WRC | Enterprise |
| **Data Sports Group** | datasportsgroup.com | 93 competitions, 174 drivers | Free trial |
| **Sportbex** | sportbex.com | F1, MotoGP, NASCAR, IndyCar, WEC | Commercial |
| **Motorsport Stats** | motorsportstats.com | 30+ championships from 1949 | Free website + API |

### F. Key Global Car Events (Seed Data)

**MEGA AUTO SHOWS:**
- Geneva Motor Show (Switzerland) — world's most prestigious
- Detroit Auto Show (USA) — North American International
- Tokyo Motor Show (Japan) — Asia's largest
- Paris Motor Show (France) — biennial
- Frankfurt/Munich IAA (Germany) — Europe's largest
- SEMA Show (USA, Las Vegas) — aftermarket auto, 160,000+ attendees
- Goodwood Festival of Speed (UK) — 200,000+ attendees
- Essen Motor Show (Germany) — tuning & motorsport

**MAJOR RACE EVENTS:**
- 24 Hours of Le Mans (France) — 250,000+ spectators
- Monaco Grand Prix (Monaco) — most iconic F1 race
- Indianapolis 500 (USA) — 300,000+ spectators
- Daytona 500 (USA) — NASCAR's biggest
- Nürburgring 24h (Germany)
- Bathurst 1000 (Australia)
- Rally Monte Carlo (Monaco)
- Spa 24 Hours (Belgium)

**CAR CULTURE EVENTS:**
- Cars and Coffee — 50+ countries, weekly/monthly
- Pebble Beach Concours d'Elegance (USA) — world's top classic car show
- Monterey Car Week (USA) — auctions + concours
- Classic Days Schloss Dyck (Germany)
- Retro Classics Stuttgart (Germany)
- Rétromobile Paris (France)
- Copenhagen Historic Grand Prix (Denmark)
- Rømø Motor Festival (Denmark) — beach racing, 30,000+ visitors
- Gavnø Classic Autojumble (Denmark) — 1,000+ classic cars
- Barrett-Jackson Auctions (USA) — classic car auctions

**DRIFT & GRASSROOTS:**
- Formula Drift (USA, 8 rounds)
- D1 Grand Prix (Japan)
- Drift Masters European Championship
- King of Europe Drift Series
- Gymkhana events (global)
- Autocross / Solo events (SCCA, USA)
- RallyX Nordic (Scandinavia)

---

## PART 3: HOW TO GET THIS DATA INTO B-SOCIAL

### Strategy 1: API-First Approach (Structured Data)

```
Priority order:
1. Eventbrite API        → Global events, motorcycle + car shows
2. MotorsportReg API     → Track days, racing events
3. Meetup GraphQL API    → Community car/bike groups
4. OpenF1 API            → F1 race calendar
5. PredictHQ API         → Smart event discovery
6. iCalendar feeds       → MotoGP, NASCAR, WRC calendars
```

### Strategy 2: Scraping Pipeline (Unstructured → Structured)

```
HIGH PRIORITY scraping targets:
1. CycleFish.com         → 1,000+ US motorcycle events
2. RacingCalendar.net    → 14,000+ grassroots events
3. Cars.coffee           → Global Cars & Coffee directory
4. Bilevents.dk          → Danish car events
5. XMOTO.dk              → Danish MC events
6. Motorsport.com        → Global race schedules
7. Lets-ride.com         → Multi-country biker events
8. 10times.com           → Global automotive expos
```

### Strategy 3: Community Partnership Model

```
Approach these organizations for DATA PARTNERSHIPS:
- FDM (Denmark, 278,000 members)          → Car events feed
- DASU (Denmark, 8,000 members)            → Motorsport calendar
- DMU (Denmark)                            → Motorcycle racing calendar
- MCTC (Denmark, 39,000 members)           → MC events calendar
- ADAC (Germany, 21M members)              → Europe's largest auto club
- AMA (USA)                                → American motorcycle events
- SCCA (USA)                               → Autocross/road racing
- FIA national clubs (each country)        → Local motorsport events

Pitch: "We'll promote your events to our growing user base for free.
        You give us an iCal feed or API access to your event calendar."
```

### Strategy 4: RSS Feed Aggregation

```typescript
const GLOBAL_RSS_FEEDS = [
  // Motorsport news & events
  { url: 'https://www.motorsport.com/rss/all/', tags: ['motorsport', 'racing'] },
  { url: 'https://www.autosport.com/rss/feed/all', tags: ['racing', 'f1'] },
  { url: 'https://www.motor1.com/rss/', tags: ['car-news', 'events'] },

  // Motorcycle
  { url: 'https://www.motorcyclenews.com/rss/', tags: ['motorcycle', 'biker'] },
  { url: 'https://www.visordown.com/rss', tags: ['motorcycle', 'biker'] },
  { url: 'https://www.cycleworld.com/rss/', tags: ['motorcycle'] },

  // Track days
  { url: 'https://www.trackdays.co.uk/rss/', tags: ['trackday'] },

  // Classic cars
  { url: 'https://www.classicandsportscar.com/rss', tags: ['classic-car'] },
  { url: 'https://www.hagerty.com/media/feed/', tags: ['classic-car', 'auction'] },

  // Drag racing
  { url: 'https://www.dragzine.com/feed/', tags: ['drag-racing'] },
];
```

### Strategy 5: Cloudflare Worker — Global Event Aggregator

```typescript
// One Worker to rule them all — runs every 6 hours
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    const results = await Promise.allSettled([
      // APIs
      fetchEventbriteEvents(env, 'motorcycle', 'worldwide'),
      fetchEventbriteEvents(env, 'car show', 'worldwide'),
      fetchMotorsportRegEvents(env),
      fetchMeetupMotorcycleGroups(env),
      fetchOpenF1Calendar(env),
      fetchICalFeeds(env),

      // Scraping
      scrapeCycleFish(env),
      scrapeRacingCalendar(env),
      scrapeCarsAndCoffee(env),
      scrapeBilevents(env),
      scrapeXMOTO(env),
      scrapeLetsRide(env),

      // RSS
      processRSSFeeds(env),
    ]);

    // Normalize all results into unified event format
    const allEvents = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Deduplicate by title + date + location similarity
    const unique = deduplicateEvents(allEvents);

    // Auto-classify into categories
    const classified = unique.map(e => ({
      ...e,
      category: classifyEvent(e.title, e.description),
      interest_tags: extractTags(e.title, e.description),
    }));

    // Upsert into Supabase
    await supabase.from('events').upsert(classified, {
      onConflict: 'external_source,external_id'
    });

    console.log(`Imported ${classified.length} events from ${results.length} sources`);
  }
};

// Event classification for biker/car events
function classifyEvent(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  if (/motorcycle|biker|rally|mc træf|harley|moto/.test(text)) return 'motor';
  if (/car show|car meet|biltræf|classic car|drag rac|track day|drift/.test(text)) return 'motor';
  if (/formula|f1|nascar|indycar|motogp|wrc|wec/.test(text)) return 'motor';
  if (/autocross|rallycross|go.?kart|speedway/.test(text)) return 'motor';

  return 'events'; // fallback
}
```

---

## PART 4: SPECIFIC DANISH SOURCES (Your Home Market)

Even though we're going global, Denmark is your home base. Here are the KEY Danish-specific sources:

### Biker Events Denmark

| Source | URL | Type | Events |
|---|---|---|---|
| **XMOTO Kalender** | xmoto.dk/kalender | Scraping | THE best Danish MC calendar |
| **MCTC Kalender** | mctc.dk/kalender | Scraping | 39,000-member club events |
| **MC Messen** | mcmessen.dk | Scraping | Annual motorcycle fair |
| **HDC Danmark** | hdc.dk | Scraping | Harley club events |
| **DMU Sport** | dmusport.dk | Scraping | Motocross, speedway, racing |
| **MC.dk** | mc.dk | Scraping | Denmark's largest MC community |
| **Super Rally** | superrally.dk | Manual | Mega event May 2026 |
| **Valhalla Racing** | valhallaracing.dk | Scraping | Motorcycle track days |

### Car Events Denmark

| Source | URL | Type | Events |
|---|---|---|---|
| **Bilevents.dk** | bilevents.dk | Scraping | Denmark's largest car calendar |
| **Motorsporten.dk** | motorsporten.dk | Scraping | Motorsport calendar |
| **FDM Jyllandsringen** | fdmjyllandsringen.dk | Scraping | Track events, Grand Prix DK |
| **DASU** | dasu.dk | Partnership | Sanctioned motorsport |
| **CHGP** | chgp.dk | Scraping | Copenhagen Historic Grand Prix |
| **Classicdays.dk** | classicdays.dk | Scraping | Classic car meets |
| **DVMC** | dvmc.dk/kalender | Scraping | Veteran car club events |
| **Padborg Park** | padborgpark.dk | Scraping | Southern Jutland track days |
| **Rømø Motor Festival** | romomotorfestival.dk | Manual | Beach racing 30,000+ visitors |
| **Auto Show Denmark** | auto-show.dk | Manual | Denmark's largest car show |
| **Toldboden Classic** | Facebook | Scraping | Weekly Copenhagen classic meetup |
| **Cars & Coffee CPH** | cars.coffee/denmark | Scraping | Regular Copenhagen meets |
| **Trackdayklubben** | trackdayklubben.dk | Scraping | Denmark's largest track day org |
| **HMS (Historic Motor Sport)** | hms.dk/events | Scraping | Historic racing events |
| **TCR Denmark** | tcr-denmark.com | Scraping | Touring car championship |
| **Boosted.dk** | boosted.dk/traefkalender | Scraping | Car meets calendar |
| **Bilmagasinet** | bilmagasinet.dk | Scraping | Summer car meets list |
| **Racelens.dk** | racelens.dk/kalender | Scraping | Motorsport event calendar |

---

## PART 5: IMPLEMENTATION ROADMAP

### Week 1-2: Quick Global Wins
1. **Eventbrite API** — Search worldwide for "motorcycle event", "car show", "track day", "biker rally"
2. **iCalendar imports** — F1, MotoGP, NASCAR, WRC calendars (instant 500+ race events)
3. **OpenF1 API** — Complete F1 calendar with race details
4. **Add Motor & Wheels category** to categories.ts

### Week 3-4: Scraping Pipeline
5. **CycleFish scraper** — 1,000+ US motorcycle events
6. **RacingCalendar.net scraper** — 14,000+ grassroots events globally
7. **Cars.coffee scraper** — Global Cars & Coffee directory
8. **Danish scrapers** — XMOTO, Bilevents, Motorsporten, CHGP

### Week 5-6: Partnership Outreach
9. **Contact MCTC** (39,000 members) for iCal feed
10. **Contact FDM/DASU** for motorsport calendar access
11. **Contact DMU** for motorcycle racing data
12. **Join MotorsportReg** for API access (3,000+ events)

### Week 7-8: Community & Scale
13. **Meetup GraphQL** — Pull all motorcycle + car groups globally
14. **RSS feed processor** — 15+ motorsport/car/motorcycle feeds
15. **User submission forms** — Let users add events worldwide
16. **Deduplication engine** — Handle same event from multiple sources

### Expected Coverage After 8 Weeks:
- **Motorcycle events:** ~13,500/year globally
- **Car events:** ~8,000/year globally
- **Racing calendar:** ~500 professional races (F1, MotoGP, NASCAR, WRC, etc.)
- **Total:** 20,000+ unique events annually

### Estimated Cost:
| Item | Cost/Year |
|---|---|
| Eventbrite API | $0 (free tier, 500 req/day) |
| OpenF1 API | $0 (free, 3 req/s) |
| iCalendar feeds | $0 (free) |
| Meetup API | $0 (free tier) |
| PredictHQ | $0 (free tier) |
| OSM Overpass | $0 (free) |
| All RSS feeds | $0 (free) |
| DMI / Yr.no / Open-Meteo | $0 (free) |
| GuideDanmark API | $0 (free) |
| Scraping (own Cloudflare Workers) | $0 (free tier: 100K req/day, 5 crons) |
| Cloudflare Workers Paid (if needed) | $60/year ($5/mo) |
| **TOTAL** | **$0 — $60/year** |

> Everything listed above is FREE. The only cost is $5/mo for Cloudflare Workers Paid
> if you exceed the free tier (100K requests/day). You do NOT need Apify or any
> paid scraping service — build your own scrapers on Cloudflare Workers for $0.

---

## PART 6: DATABASE SCHEMA FOR GLOBAL EVENTS

```sql
-- Add to events table for global support
ALTER TABLE events ADD COLUMN IF NOT EXISTS country_code text;      -- 'DK', 'US', 'DE', etc.
ALTER TABLE events ADD COLUMN IF NOT EXISTS region text;            -- 'Europe', 'North America', etc.
ALTER TABLE events ADD COLUMN IF NOT EXISTS timezone text;          -- 'Europe/Copenhagen', 'America/New_York'
ALTER TABLE events ADD COLUMN IF NOT EXISTS language text;          -- 'da', 'en', 'de'
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_series text;      -- 'f1', 'motogp', 'nascar', null
ALTER TABLE events ADD COLUMN IF NOT EXISTS attendance_estimate int;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_rule text;   -- iCal RRULE format
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_source text;   -- 'eventbrite', 'cyclefish', 'openf1'
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_url text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Unique constraint to prevent duplicates from multiple sources
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_external_unique
  ON events(external_source, external_id)
  WHERE external_source IS NOT NULL;

-- Index for country-based filtering
CREATE INDEX IF NOT EXISTS idx_events_country ON events(country_code);
CREATE INDEX IF NOT EXISTS idx_events_series ON events(event_series) WHERE event_series IS NOT NULL;
```

---

## SUMMARY

This is a **GLOBAL platform**, not just Denmark. The data pipeline should:

1. Pull from **worldwide APIs** (Eventbrite, MotorsportReg, Meetup, OpenF1, PredictHQ)
2. Scrape **international event sites** (CycleFish, RacingCalendar, Cars.coffee, Motorsport.com)
3. Import **iCalendar feeds** for all major racing series
4. Process **RSS feeds** from 15+ motorsport/motorcycle/car media
5. Accept **user submissions** from any country
6. Partner with **national clubs** in each target market
7. Start with Denmark + Europe, then expand to USA, Asia, rest of world

**The vision:** B-Social becomes the world's go-to platform for finding ANY motor event — from a local Cars & Coffee in your neighborhood to the Monaco Grand Prix.
