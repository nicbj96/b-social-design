# B-Social Expansion Strategy — Deep Research & Implementation Plan

> **Date:** April 4, 2026
> **Scope:** New categories, data sources, APIs, scraping, webhooks, and architecture
> **Target:** WORLDWIDE — Global from day one. Denmark is home base, the world is the market.
> **See also:** [GLOBAL-BIKER-CAR-EVENTS-RESEARCH.md](./GLOBAL-BIKER-CAR-EVENTS-RESEARCH.md) for deep dive on biker & car events worldwide

---

## PART 1: NEW CATEGORIES TO ADD

Your current 10 categories are solid but missing massive opportunity areas. Here's everything we should add, organized into **5 new main categories** + **expanded subcategories** for existing ones.

---

### NEW CATEGORY 11: Vandsport & strand (Water Sports & Beach)

| Subcategory | Key | Emoji | Data Source |
|---|---|---|---|
| Strande & Blue Flag | `blueflag` | 🏖️ | Vandudsigten API + VisitDenmark (240 Blue Flag beaches) |
| Surfing | `surfing` | 🏄 | Spitcast API + Cold Hawaii spot data |
| Windsurfing | `windsurfing` | 🪁 | Windguru + Windy.app (Thy, Hvide Sande) |
| Kitesurfing | `kitesurfing` | 🪂 | Kiting.live + iKitesurf |
| Dykning | `dykning` | 🤿 | DiveSite API (17,000+ dive sites) |
| SUP (Stand Up Paddle) | `sup` | 🛶 | OSM Overpass + manual curation |
| Sejlads | `sejlads` | ⛵ | Stormglass tide API |
| Vinterbadning spots | `vinterbad_spots` | 🥶 | 184+ official clubs, manual database |

**Why:** Denmark has 7,300km of coastline. Water sports are THE untapped goldmine.

---

### NEW CATEGORY 12: Ekstrem & adventure (Extreme Sports)

| Subcategory | Key | Emoji | Data Source |
|---|---|---|---|
| Skydiving | `skydiving` | 🪂 | GetYourGuide API + manual |
| Paragliding | `paragliding` | 🪂 | FAI database + OSM |
| Bungee jumping | `bungee` | 🎪 | Tour operator scraping |
| Zip-line | `zipline` | 🏗️ | Adventure park websites |
| Skateboarding | `skateboard` | 🛹 | OSM [sport=skateboard] + TheBoards |
| Parkour | `parkour` | 🏃‍♂️ | OSM + Calisthenics Parks |
| OCR / Mudder løb | `ocr` | 💪 | Tough Viking, Strong Viking APIs |
| Trail running | `trailrunning` | 🏃 | Strava Metro + AllTrails |

---

### NEW CATEGORY 13: Motor & hjul (Motor & Wheels)

| Subcategory | Key | Emoji | Data Source |
|---|---|---|---|
| Biker events | `biker` | 🏍️ | Eventbrite + Lets-ride.com (DK-specific) |
| MC træf | `mctræf` | 🏍️ | LPMCC Rally Listing + Super Rally 2026 |
| Biltræf | `biltræf` | 🚗 | Eventbrite car-shows + 10times.com |
| Klassiske biler | `klassisk_bil` | 🏎️ | Classic Car RSS feeds |
| Track days | `trackday` | 🏁 | Trackdays.co.uk RSS + Danish tracks |
| Drag racing | `dragrace` | 🏁 | Event scraping |
| Go-kart | `gokart` | 🏎️ | Google Places API / OSM |
| Drone events | `drone` | 🛸 | International Drone Show (Odense) |

**Why:** Massive passionate communities with NO current discovery platform in Denmark.

---

### NEW CATEGORY 14: Spil & oplevelser (Gaming & Experiences)

| Subcategory | Key | Emoji | Data Source |
|---|---|---|---|
| E-sport events | `esport` | 🎮 | Esport Danmark (esd.dk) + Gamebox Festival |
| VR oplevelser | `vr` | 🥽 | Limitless VR, Google Places |
| Escape rooms | `escaperoom` | 🔐 | Midgaard Event, Google Places |
| Laser tag | `lasertag` | 🔫 | Google Places / OSM |
| Arkade & retro gaming | `arkade` | 🕹️ | Highscore venues |
| LAN parties | `lan` | 💻 | Meetup + Facebook Events |
| Brætspils-cafeer | `braetspilscafe` | 🎲 | OSM + manual curation |
| Udendørs biograf | `udendoers_bio` | 🎬 | Himmelbio, Cinemateket Open Air |

---

### NEW CATEGORY 15: Natur-oplevelser (Nature Discovery)

| Subcategory | Key | Emoji | Data Source |
|---|---|---|---|
| Svampejagt | `svampe` | 🍄 | Danmarks Svampeatlas + Vild Mad |
| Stjernekiggeri | `stjerner` | ⭐ | Dark Sky Parks (Møn, Anholt, Frøstrup) |
| Foraging | `foraging` | 🌿 | Vild Mad (vildmad.dk) |
| Outdoor gym | `outdoor_gym` | 🏋️ | Calisthenics Parks API + OSM |
| Hundeparker | `hundepark` | 🐕 | OSM + municipal data |
| Fuglekiggeri spots | `fuglespot` | 🦅 | eBird API + iNaturalist |
| Insekt & biodiversitet | `biodiversitet` | 🦋 | iNaturalist API |
| Naturlegepladser | `naturlegeplads` | 🌳 | OpenData.dk municipal data |

---

### EXPANDED SUBCATEGORIES FOR EXISTING CATEGORIES

**Aktiv & sport** — Add:
- Outdoor fitness / calisthenics (`outdoor_fitness`)
- Padel (`padel`)
- Crossfit events (`crossfit`)
- Boksning (`boksning`)

**Events & fællesskab** — Add:
- Food truck festivals (`foodtruck_festival`)
- Øl- & vinfestivaler (`drikkefestival`)
- Farmers markets (`bondemarket`)
- Julemarked (`julemarked`)

**Wellness & balance** — Add:
- Thermal baths / CopenHot (`termalbad`)
- Is-bad spots (`isbad`)
- Forest bathing / shinrin-yoku (`skovbadning`)

---

## PART 2: DATA SOURCES — THE COMPLETE API & SCRAPING MAP

### TIER 1: FREE APIs (Use immediately)

| API | URL | Free Tier | Data | Use For |
|---|---|---|---|---|
| **DMI Open Data** | opendatadocs.dmi.govcloud.dk | Unlimited | Weather, waves, storms | All outdoor activities |
| **Yr.no** | api.met.no | Unlimited | Nordic weather forecasts | Weather overlays |
| **Open-Meteo** | open-meteo.com | Unlimited, no key | Weather + marine | Surf/wind conditions |
| **Vandudsigten** | api.vandudsigten.dk | Free | Danish beach water quality | Beach safety ratings |
| **OSM Overpass** | overpass-api.de | Free | POIs worldwide | Skate parks, gyms, parks, trails |
| **OpenData.dk** | opendata.dk | Free | Municipal Danish data | Parks, facilities, events |
| **GuideDanmark** | api.guidedanmark.org | Free (OAuth2) | 30,000 tourism products | Events, places, activities |
| **iNaturalist** | api.inaturalist.org | Free | Nature observations | Birdwatching, foraging spots |
| **eBird** | ebird.org/ws2.0 | Free (API key) | Bird sighting data | Birdwatching hotspots |
| **Strava** | developers.strava.com | 200 req/15min | Routes, segments | Running, cycling, hiking trails |
| **Calisthenics Parks** | calisthenics-parks.com | Free | Outdoor gym locations | Outdoor fitness spots |

### TIER 2: FREEMIUM APIs (Free tier sufficient to start)

| API | URL | Free Tier | Cost After | Use For |
|---|---|---|---|---|
| **Stormglass** | stormglass.io | 10 req/day | From $19/mo | Surf, tide, marine data |
| **Eventbrite** | eventbrite.com/platform | 500 req/day | Custom pricing | Event aggregation |
| **PredictHQ** | predicthq.com | Free tier | Custom pricing | 20M+ events, demand data |
| **Foursquare Places** | docs.foursquare.com | 10K calls/mo | $18.75/1K calls | Venue discovery |
| **HERE Maps** | here.com | 250K tx/mo | Pay-as-you-go | Geocoding, routing |
| **Windguru** | windguru.cz | Free app | Upload API paid | Wind conditions for water sports |
| **DiveSite** | thediveapi.com | Free tier | Paid tiers | 17,000+ dive sites globally |
| **theCrag** | thecrag.com/api | Free tier | Paid | Climbing routes & gyms |

### TIER 3: SCRAPING TARGETS (No API available)

| Source | URL | Method | Data | Priority |
|---|---|---|---|---|
| **VisitDenmark events** | visitdenmark.com | Puppeteer/Cheerio | Seasonal events, festivals | 🔴 HIGH |
| **Billetlugen** | billetlugen.dk | Playwright | Danish event tickets | 🔴 HIGH |
| **Kultunaut** | kultunaut.dk | Cheerio | Cultural events | 🔴 HIGH |
| **Ticketmaster.dk** | ticketmaster.dk | Playwright | Concerts, shows | 🟡 MEDIUM |
| **Komoot routes** | komoot.com | Apify actor exists | 22,485 DK hikes | 🔴 HIGH |
| **Cold Hawaii spots** | coldhawaii.com | Cheerio | Surf spots, Thy | 🔴 HIGH |
| **Lets-ride.com** | lets-ride.com | Cheerio | DK biker events | 🟡 MEDIUM |
| **LPMCC rallies** | lpmcc.net | Cheerio | EU motorcycle rallies | 🟡 MEDIUM |
| **Tough Viking** | toughviking.com | Cheerio | OCR events | 🟡 MEDIUM |
| **Municipal calendars** | various .dk sites | Playwright | Local events | 🟢 LOW |
| **WannaSurf** | wannasurf.com | Cheerio | Surf spot GPS data | 🟡 MEDIUM |
| **AllTrails Denmark** | alltrails.com/denmark | Apify | Trail data + reviews | 🟡 MEDIUM |

### TIER 4: RSS FEEDS (Passive data collection)

| Feed | Type | Frequency | Data |
|---|---|---|---|
| Motor1.com RSS | motorsport.com/rss | Daily | Car events, motorsport news |
| Grassroots Motorsports | grassrootsmotorsports.com/help/rss | Weekly | Car meet events |
| Trackdays.co.uk | trackdays.co.uk/rss-feeds | Weekly | Track day schedules |
| Classic Car feeds | via rss.feedspot.com | Daily | Classic car events |
| Motorcycle feeds | via rss.feedspot.com | Daily | Biker rallies, shows |

---

## PART 3: HOW TO ADD IT — TECHNICAL ARCHITECTURE

### Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    B-SOCIAL FRONTEND                      │
│              (React + Leaflet + React Query)              │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│                   SUPABASE                                │
│         (PostgreSQL + Auth + Realtime)                    │
│                                                          │
│  events │ places │ external_sources │ weather_cache       │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│            CLOUDFLARE WORKERS (Data Pipeline)             │
│                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐    │
│  │ API Fetcher  │ │ Scraper     │ │ RSS Processor   │    │
│  │ (Cron)       │ │ (Browser    │ │ (Cron)          │    │
│  │              │ │  Rendering) │ │                 │    │
│  └──────┬──────┘ └──────┬──────┘ └────────┬────────┘    │
│         │               │                  │             │
│  ┌──────▼───────────────▼──────────────────▼────────┐    │
│  │         NORMALIZER + DEDUPLICATOR                │    │
│  │   (Cleans, tags, geocodes, quality-scores)       │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐    │
│  │         SUPABASE INSERT (via service role)        │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

### METHOD 1: API Fetchers (Cloudflare Workers + Cron Triggers)

**Best for:** Weather, beaches, trails, places, climbing, diving

```typescript
// Example: Cloudflare Worker with Cron Trigger
// wrangler.toml:
// [triggers]
// crons = ["0 */6 * * *"]  ← every 6 hours

export default {
  async scheduled(event, env, ctx) {
    // 1. Fetch from DMI weather API
    const weather = await fetch('https://dmigw.govcloud.dk/v2/metObs/collections/observation/items?...');

    // 2. Fetch from Vandudsigten (beach water quality)
    const beaches = await fetch('https://api.vandudsigten.dk/api/beaches');

    // 3. Fetch from Stormglass (marine/surf data)
    const marine = await fetch('https://api.stormglass.io/v2/weather/point', {
      headers: { 'Authorization': env.STORMGLASS_KEY }
    });

    // 4. Normalize and insert into Supabase
    const normalized = normalizeData(weather, beaches, marine);
    await supabase.from('weather_cache').upsert(normalized);
  }
};
```

**Implementation steps:**
1. Create a new `workers/` directory in your project
2. One Worker per data domain (weather, events, places, routes)
3. Use Cron Triggers for scheduled fetching (every 1-6 hours)
4. Store raw data in a `raw_imports` table, normalized data in existing tables

---

### METHOD 2: Web Scraping (Cloudflare Browser Rendering)

**Best for:** Danish event sites (Billetlugen, Kultunaut, VisitDenmark), biker/car events

```typescript
// Cloudflare Worker with Browser Rendering
export default {
  async scheduled(event, env, ctx) {
    // Use Cloudflare Browser Rendering for JS-heavy sites
    const response = await fetch('https://api.cloudflare.com/client/v4/accounts/{id}/browser-rendering/crawl', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://www.billetlugen.dk/en/events/',
        outputFormats: ['json'],
        waitFor: { selector: '.event-card' }
      })
    });

    const data = await response.json();
    // Parse and normalize events
    const events = parseEventCards(data);

    // Insert with source = 'scrape' for tracking
    await supabase.from('events').upsert(events.map(e => ({
      ...e,
      source: 'import',
      external_source: 'billetlugen'
    })));
  }
};
```

**For simpler sites (Cheerio approach):**
```typescript
import * as cheerio from 'cheerio';

async function scrapeLetRide() {
  const html = await fetch('https://lets-ride.com/event/denmark.htm').then(r => r.text());
  const $ = cheerio.load(html);

  const events = [];
  $('.event-listing').each((i, el) => {
    events.push({
      title: $(el).find('.title').text(),
      date: $(el).find('.date').text(),
      location: $(el).find('.location').text(),
      category: 'motor',
      interest_tags: ['biker', 'motorcycle'],
      source: 'import',
      external_source: 'lets-ride'
    });
  });

  return events;
}
```

---

### METHOD 3: RSS Feed Processing

**Best for:** Motorsport events, car shows, motorcycle rallies, news

```typescript
// RSS Feed Processor Worker
import { parseString } from 'xml2js';

const RSS_FEEDS = [
  { url: 'https://www.motorsport.com/rss/all/', category: 'motor', tags: ['motorsport'] },
  { url: 'https://grassrootsmotorsports.com/rss/events/', category: 'motor', tags: ['car-meet'] },
  { url: 'https://www.trackdays.co.uk/rss/', category: 'motor', tags: ['trackday'] },
];

export default {
  async scheduled(event, env, ctx) {
    for (const feed of RSS_FEEDS) {
      const xml = await fetch(feed.url).then(r => r.text());
      const items = await parseRSS(xml);

      const events = items.map(item => ({
        title: item.title,
        description: item.description,
        date: new Date(item.pubDate).toISOString(),
        category: feed.category,
        interest_tags: feed.tags,
        source: 'import',
        external_source: `rss:${new URL(feed.url).hostname}`,
        external_url: item.link,
      }));

      await supabase.from('events').upsert(events, {
        onConflict: 'external_url'
      });
    }
  }
};
```

---

### METHOD 4: OSM Overpass Queries (Places Discovery)

**Best for:** Skate parks, outdoor gyms, climbing walls, dive sites, beaches

```typescript
// Overpass API queries for specific venue types
const OVERPASS_QUERIES = {
  skate_parks: `
    [out:json][timeout:25];
    area["ISO3166-1"="DK"]->.dk;
    (
      node["sport"="skateboard"](area.dk);
      way["sport"="skateboard"](area.dk);
      node["leisure"="pitch"]["sport"="skateboard"](area.dk);
    );
    out center;
  `,
  outdoor_gyms: `
    [out:json][timeout:25];
    area["ISO3166-1"="DK"]->.dk;
    (
      node["leisure"="fitness_station"](area.dk);
      node["sport"="fitness"]["outdoor"="yes"](area.dk);
      way["leisure"="fitness_station"](area.dk);
    );
    out center;
  `,
  climbing: `
    [out:json][timeout:25];
    area["ISO3166-1"="DK"]->.dk;
    (
      node["sport"="climbing"](area.dk);
      way["sport"="climbing"](area.dk);
      node["leisure"="sports_centre"]["sport"="climbing"](area.dk);
    );
    out center;
  `,
  beaches: `
    [out:json][timeout:25];
    area["ISO3166-1"="DK"]->.dk;
    (
      node["natural"="beach"](area.dk);
      way["natural"="beach"](area.dk);
    );
    out center;
  `,
  dive_sites: `
    [out:json][timeout:25];
    area["ISO3166-1"="DK"]->.dk;
    (
      node["sport"="scuba_diving"](area.dk);
      node["sport"="diving"](area.dk);
    );
    out center;
  `,
};

async function fetchOSMPlaces(queryKey: string) {
  const query = OVERPASS_QUERIES[queryKey];
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`
  });
  const data = await response.json();

  return data.elements.map(el => ({
    name: el.tags?.name || `${queryKey} spot`,
    latitude: el.lat || el.center?.lat,
    longitude: el.lon || el.center?.lon,
    city: el.tags?.['addr:city'] || '',
    region: '',
    country: 'DK',
    main_categories: [mapToCategory(queryKey)],
    tags: [queryKey],
    source: 'osm',
    quality_score: 0.5,
  }));
}
```

---

### METHOD 5: Webhook Receivers (Real-time event ingestion)

**Best for:** Eventbrite events, IFTTT automations, partner integrations

```typescript
// Cloudflare Worker as webhook receiver
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const source = url.pathname.split('/')[2]; // /webhook/eventbrite

    const payload = await request.json();

    switch (source) {
      case 'eventbrite':
        return handleEventbriteWebhook(payload, env);
      case 'ifttt':
        return handleIFTTTWebhook(payload, env);
      case 'partner':
        return handlePartnerWebhook(payload, env);
    }
  }
};

async function handleEventbriteWebhook(payload, env) {
  // Eventbrite sends webhook on event.created, event.updated
  const event = {
    title: payload.name.text,
    description: payload.description.text,
    date: payload.start.utc,
    location: payload.venue?.address?.localized_address_display,
    latitude: payload.venue?.latitude,
    longitude: payload.venue?.longitude,
    category: classifyEvent(payload.category_id),
    source: 'api',
    external_source: 'eventbrite',
    external_id: payload.id,
  };

  await supabase.from('events').upsert(event, {
    onConflict: 'external_id,external_source'
  });

  return new Response('OK', { status: 200 });
}
```

---

### METHOD 6: GuideDanmark API Integration (30,000 tourism products!)

**Best for:** The single biggest data source for Danish activities and events

```typescript
// GuideDanmark API — OAuth2 authenticated
async function fetchGuideDanmark(env) {
  // Step 1: Get OAuth2 token
  const tokenResponse = await fetch('https://api.guidedanmark.org/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.GUIDE_DK_CLIENT_ID,
      client_secret: env.GUIDE_DK_CLIENT_SECRET,
    })
  });
  const { access_token } = await tokenResponse.json();

  // Step 2: Fetch events
  const events = await fetch('https://api.guidedanmark.org/v1/events?region=nordjylland&limit=100', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });

  // Step 3: Fetch places/activities
  const activities = await fetch('https://api.guidedanmark.org/v1/activities?limit=100', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });

  // Step 4: Normalize and insert
  // GuideDanmark auto-removes expired events — perfect for B-Social!
}
```

---

## PART 4: DATABASE CHANGES NEEDED

### New table: `external_sources`

```sql
CREATE TABLE external_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,          -- 'eventbrite', 'guidedanmark', 'osm', etc.
  type text NOT NULL,                  -- 'api', 'scrape', 'rss', 'webhook'
  base_url text,
  last_synced_at timestamptz,
  sync_interval_minutes int DEFAULT 360,
  is_active boolean DEFAULT true,
  config jsonb DEFAULT '{}',          -- API keys, query params, etc.
  stats jsonb DEFAULT '{}',           -- items_imported, errors, etc.
  created_at timestamptz DEFAULT now()
);
```

### New table: `weather_conditions`

```sql
CREATE TABLE weather_conditions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  temperature numeric,
  wind_speed numeric,
  wind_direction numeric,
  wave_height numeric,
  water_temp numeric,
  uv_index numeric,
  conditions text,                    -- 'sunny', 'rainy', 'overcast'
  source text NOT NULL,               -- 'dmi', 'yr', 'stormglass'
  forecast_time timestamptz NOT NULL,
  fetched_at timestamptz DEFAULT now(),
  UNIQUE(latitude, longitude, source, forecast_time)
);

CREATE INDEX idx_weather_location ON weather_conditions(latitude, longitude);
CREATE INDEX idx_weather_time ON weather_conditions(forecast_time);
```

### Add columns to `events` table

```sql
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_source text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_url text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS auto_imported boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS weather_dependent boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS min_wind_speed numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_wind_speed numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS ideal_conditions text[];

-- Prevent duplicate imports
CREATE UNIQUE INDEX idx_events_external
  ON events(external_source, external_id)
  WHERE external_source IS NOT NULL;
```

### Add columns to `places` table

```sql
ALTER TABLE places ADD COLUMN IF NOT EXISTS external_source text;
ALTER TABLE places ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE places ADD COLUMN IF NOT EXISTS surf_conditions jsonb;
ALTER TABLE places ADD COLUMN IF NOT EXISTS wind_conditions jsonb;
ALTER TABLE places ADD COLUMN IF NOT EXISTS water_quality text;
ALTER TABLE places ADD COLUMN IF NOT EXISTS blue_flag boolean DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS difficulty text;  -- 'beginner', 'intermediate', 'advanced'
ALTER TABLE places ADD COLUMN IF NOT EXISTS best_season text[];
ALTER TABLE places ADD COLUMN IF NOT EXISTS facilities text[];
```

---

## PART 5: IMPLEMENTATION PRIORITY ROADMAP

### Phase 1 — Quick Wins (Week 1-2)

1. **Add 5 new categories** to `categories.ts` (code change only, no backend needed)
2. **OSM Overpass import** — One-time bulk import of Danish beaches, skate parks, outdoor gyms, climbing walls (~5,000 places)
3. **GuideDanmark API** — Register + pull 30,000 tourism products (BIGGEST single win)
4. **DMI + Yr.no weather** — Add weather overlays to map view

### Phase 2 — Data Pipeline (Week 3-4)

5. **Cloudflare Worker: Event Aggregator** — Cron-based Eventbrite + PredictHQ fetching
6. **Cloudflare Worker: Scraper** — Billetlugen, Kultunaut, VisitDenmark scraping
7. **RSS Feed Processor** — Motor events, car shows, biker rallies
8. **Database migrations** — `external_sources`, `weather_conditions`, new columns

### Phase 3 — Water Sports (Week 5-6)

9. **Stormglass marine integration** — Surf/wind/tide data for coastal spots
10. **Vandudsigten API** — Beach water quality and blue flag status
11. **Cold Hawaii spot database** — Manual curation + weather overlay
12. **Windsurf/kitesurf spots** — Combine Windguru + OSM + manual data

### Phase 4 — Real-time & Webhooks (Week 7-8)

13. **Webhook endpoint** — Cloudflare Worker to receive Eventbrite, partner webhooks
14. **IFTTT integration** — Automated event import from social media
15. **Weather-aware notifications** — "Perfect surf conditions at Cold Hawaii right now!"
16. **Smart recommendation engine** — Use weather + user interests + location

### Phase 5 — Creative & Community (Week 9-12)

17. **User-generated spots** — Let users submit surf spots, skate parks, fishing spots
18. **Community verification** — Upvote/confirm spot quality
19. **Equipment rental partnerships** — Link spots to nearby rental shops
20. **Tourism board integration** — VisitDenmark, VisitNordjylland premium listings

---

## PART 6: OUT-OF-THE-BOX IDEAS

### 1. Weather-Triggered Notifications
When DMI data shows perfect conditions (wind 15-25 knots at Hvide Sande), auto-notify all users interested in windsurfing within 100km. No other Danish platform does this.

### 2. "Spot of the Day" Algorithm
Combine weather + crowd data + time of day + season to recommend the #1 place to be right now. Different for each user based on their interests.

### 3. Activity Heat Maps
Use Strava Metro data (free for qualified organizations) to show real-time heatmaps of where people are running, cycling, hiking. Overlay on your Leaflet map.

### 4. Cross-Category Discovery
"You like hiking? Here's a beach that's a 30-min hike from a great surf spot, near a food truck festival this Saturday." Connect categories that other platforms keep siloed.

### 5. Dark Sky Calendar
Auto-generate stargazing events on new moon nights at Møn, Anholt, and Frøstrup dark sky parks. Zero manual effort, 100% automated.

### 6. Tide-Aware Beach Guide
Show "best time to visit" for each beach based on real-time tide data from Stormglass. Show sand exposure, swimming safety, surf conditions hour by hour.

### 7. Seasonal Auto-Categories
In winter: prioritize vinterbadning, ice skating, sauna, indoor climbing. In summer: beaches, surfing, outdoor cinema, festivals. Your `getCurrentSeason()` function already exists — extend it.

### 8. Community Challenges
"Visit 10 different beaches this summer" / "Try 5 extreme sports this year" / "Run all 50 trail routes in Nordjylland." Gamification drives engagement.

### 9. Partner Revenue: Equipment Rental Integration
When someone views a surf spot → show "Rent a board from [shop] 2km away." When someone views a climbing gym → show "Get your first 3 sessions for 199 DKK." Commission-based revenue.

### 10. Municipal Data Goldmine
Danish municipalities publish incredible amounts of open data. Sports facilities, playgrounds, parks, event calendars, swimming pools, ice rinks — all free via OpenData.dk.

---

## PART 7: MONETIZATION THROUGH DATA

| Revenue Stream | Model | Expected Revenue |
|---|---|---|
| Tourism board featured events | VisitDenmark pays per promoted listing | 5,000-25,000 DKK/mo |
| Equipment rental commissions | 10-15% on bookings via your platform | Variable |
| Premium business listings | Gyms, schools, rental shops pay for visibility | 299-999 DKK/mo per business |
| Data licensing to municipalities | Anonymized activity trend reports | 10,000-50,000 DKK/year per municipality |
| Event organizer tools | Premium event creation + analytics | 99-499 DKK/mo |
| API access for third parties | Other apps use your aggregated data | Pay-per-call |

---

## SUMMARY: TOP 10 ACTIONS TO TAKE NOW

1. **Register for GuideDanmark API** — 30,000 tourism products, free, OAuth2
2. **Run OSM Overpass queries** — Instant 5,000+ new places (beaches, parks, gyms)
3. **Add 5 new categories** to `categories.ts` — Pure frontend, zero backend risk
4. **Set up DMI weather integration** — Free, Danish-specific, high-quality
5. **Build first Cloudflare Worker** — Event aggregator with cron trigger
6. **Integrate Stormglass** — 10 free requests/day covers surf/wind/tide basics
7. **Create webhook endpoint** — Ready for Eventbrite + partner integrations
8. **Build RSS feed processor** — Motor events, car shows, biker rallies
9. **Add `external_sources` table** — Track all data pipelines cleanly
10. **Launch "weather-smart" notifications** — The killer feature no one else has
