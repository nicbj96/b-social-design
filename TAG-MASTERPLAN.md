# B-Social Tag & Category Architecture — The Real Masterplan

**Date:** 2026-04-05
**Author:** Claude (from full codebase audit)

---

## THE ACTUAL PROBLEM

This isn't a UI bug. B-Social has **7 competing data systems** that never got unified:

| # | System | Where | Status |
|---|--------|-------|--------|
| 1 | `event.interest_tags[]` | Old string array on events table | Legacy, still queried by Feed |
| 2 | `event.category` | Single string field ("musik", "motor") | Legacy, used for badges |
| 3 | `place.tags[]` | Old string array on places table | Legacy, shown in StedDetail |
| 4 | `place.main_categories[]` | Old array ("Aktiv & sport") | Legacy, used in Kort for pin colors |
| 5 | `categories.ts` | 10 hardcoded categories + `categoryContent.ts` | Locked in code, only SPORT & KULTUR have data |
| 6 | `tagTree.ts` | 1928-line static tree (793 tags, 3 levels) | Bundled fallback, used by FeedTagEditor |
| 7 | **`tags_normalized` + `event_tags_normalized` + `place_tags`** | Live Supabase, 793 tags, 54K event links, 396K place links | **BRAND NEW — connected to ZERO frontend pages** |

**The masterplan is about making system #7 the single source of truth, and killing systems #1-6.**

---

## THE VISION

Every user interaction on B-Social flows through the tag system:

```
USER OPENS APP
  → sees personalized feed filtered by THEIR tags
  → every card shows tag pills (clickable)
  → clicking a tag → category page showing events + places
  → drill down: Motor → Motorsport → Circuit Racing
  → map pins colored by tags, filterable by tag hierarchy
  → "fordi du kan lide Motor" → related events + places
  → search "MC" → alias resolves → shows Motorcykler content
```

The tag system becomes the **navigation spine** of the entire app. Not a feature — THE feature.

---

## PHASE 0: THE DATA LAYER (Foundation)

**Goal:** One clean API layer that all pages consume. Kill the spaghetti.

### 0.1 Create `src/lib/tagData.ts` — The Single Source

Replace all the scattered fetching with one module:

```typescript
// All tag queries go through here. Nothing else touches Supabase for tag data.

// Cached tag tree (from tags_normalized)
getTagTree(): TagNode[]

// Events for a tag (queries event_tags_normalized + events)
getEventsByTag(slug: string, options?: { limit, offset, descendants: boolean }): Event[]

// Places for a tag (queries place_tags + places)
getPlacesByTag(slug: string, options?: { limit, offset, descendants: boolean, bbox? }): Place[]

// Tags for a specific event (queries event_tag_slugs view)
getTagsForEvent(eventId: string): Tag[]

// Tags for a specific place (queries place_tag_slugs view)
getTagsForPlace(placeId: string): Tag[]

// Search tags (queries tags_normalized + tag_aliases)
searchTags(query: string): Tag[]

// Popular tags (queries tag_usage_counts view)
getPopularTags(limit: number): TagUsage[]

// Resolve any string to a tag (uses aliases)
resolveTag(input: string): Tag | null
```

**Why this matters:** Right now Feed.tsx, Udforsk.tsx, Kort.tsx, and CategoryDetail.tsx each have their own fuzzy string matching, their own category mappings, their own fetch logic. Changing anything means touching 6+ files. With this layer, pages just call `getEventsByTag("motor-køretøjer")` and get back real data.

### 0.2 Create React Query hooks

```typescript
// src/hooks/useTags.ts
useTagTree()           // cached tag hierarchy
useEventsByTag(slug)   // events for a category
usePlacesByTag(slug)   // places for a category
useTagsForEvent(id)    // tags on one event
useTagsForPlace(id)    // tags on one place
usePopularTags()       // trending
useTagSearch(query)    // search with aliases
```

Every hook uses React Query with proper caching, loading states, error states. No more `isLoading && <Loader2 />` stuck forever.

### 0.3 Kill the old systems

| File | Action |
|------|--------|
| `src/data/categories.ts` (355 lines) | **DELETE** — replaced by `tags_normalized` L1 query |
| `src/data/categoryContent.ts` (1135 lines) | **DELETE** — replaced by `getPlacesByTag()` / `getEventsByTag()` |
| `src/data/places.ts` (1138 lines) | **DELETE** — never imported anyway, dead code |
| `src/data/feedData.ts` (2364 lines) | **DELETE** — hardcoded demo data, replaced by live feed |
| `src/data/kortPins.ts` (219 lines) | **DELETE** — map pins come from live Supabase places |
| `src/lib/data.ts` `getEventsByTags()` | **REPLACE** — use `getEventsByTag()` from tagData |
| All `CAT_ALIASES`, `SUPABASE_CAT_MAP`, fuzzy matching | **DELETE** — tag resolution happens server-side via `place_tags`/`event_tags_normalized` |

**~5,500 lines of hardcoded data deleted. Replaced by 5 Supabase views that already exist.**

---

## PHASE 1: THE FEED (The Home Screen)

**Goal:** Feed loads fast, shows tag-driven personalized content, never gets stuck.

### Current state:
- `getEvents()` tries to paginate ALL 60K+ future events client-side
- Filters by `event.interest_tags` (old array) with loose string matching
- Gets stuck on "Loader events..." if Supabase is slow

### New architecture:

**Feed = sections, each section = one tag query.**

```
[Your Tags: 🚗 Motor  🎵 Musik  🌲 Natur]  [Edit tags]

🚗 Motor & Køretøjer          Se alle →
  [Event Card] [Event Card] [Event Card] →

🎵 Musik & Lyd                Se alle →
  [Event Card] [Event Card] [Event Card] →

🌲 Natur & Outdoor            Se alle →
  [Place Card] [Place Card] [Place Card] →

🔥 Trending
  [Popular Tag] [Popular Tag] [Popular Tag]

📍 Nær dig (steder)
  [Place Card] [Place Card] [Place Card] →
```

Each section is an independent React Query:
```typescript
// 🚗 Motor section
const { data: motorEvents } = useEventsByTag("motor-køretøjer", { limit: 6, descendants: true })

// 🎵 Musik section
const { data: musikEvents } = useEventsByTag("musik-lyd", { limit: 6, descendants: true })
```

**Why this is better:**
- Each section loads independently (one fails, others still show)
- No more loading ALL 60K events
- Each query hits `event_tags_normalized` (indexed, fast)
- Skeleton loaders per section, never "stuck"
- `descendants: true` means "Motor" includes circuit-racing, drifting, karting etc.

### Feed Tag Bar
The selected tags bar at the top uses `TagContext.selectedTags`. Clicking a tag scrolls to its section. The edit button opens `FeedTagEditor` (already built, just needs wiring).

---

## PHASE 2: THE DISCOVERY PAGE (Udforsk)

**Goal:** The explore page IS the tag system. Browse by hierarchy, see real counts, discover content.

### Current state:
- "Trending kategorier" = 10 arbitrary hardcoded buttons
- "Steder i dit område" = L1 chips + random Nordic islands
- "Populært lige nu" and "Redaktørens valg" = empty
- "Oplevelser nær dig" = hardcoded from feedData.ts (2364 lines of static data)

### New architecture:

```
🔍 [Search tags, events, places...]

OVERKATEGORIER (from tag_usage_counts, sorted by popularity)
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🌲 Natur │ │ 🏃 Motion│ │ 🎵 Musik │ │ 🍽️ Mad   │
│ 70K items│ │ 45K items│ │ 7K items │ │ 6.8K     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🚗 Motor │ │ 🎨 Kultur│ │ ✈️ Rejser│ │ 👋 Social│
│ 7.3K     │ │ 33K      │ │ 34K      │ │ 9.3K     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
... (all 22 L1 tags, real counts from tag_usage_counts view)

CLICK "🚗 Motor" →

MOTOR & KØRETØJER                    ← back
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 🚗 Biler    │ │ 🏍️ MC      │ │ 🏎️ Motorsport│
│ 706 events  │ │ 269 events  │ │ 816 events   │
└─────────────┘ └─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ ⛵ Vand     │ │ 🔧 Tuning   │ │ 🏁 Racing   │
│ 129 events  │ │ 225 events  │ │ 155 events   │
└─────────────┘ └─────────────┘ └─────────────┘

EVENTS (from event_tags_normalized WHERE tag IN motor descendants)
  [Real event cards with tag pills]

STEDER (from place_tags WHERE tag IN motor descendants)
  [Real place cards with tag pills]
```

**Key changes:**
- Categories come from `tag_usage_counts` view (live counts, real data)
- Clicking L1 → shows L2 children with counts
- Clicking L2 → shows L3 children + content
- Events + places are live queries against the normalized junction tables
- The "Trending kategorier" hardcoded section is replaced
- The "Oplevelser nær dig" hardcoded section is replaced by geolocation-filtered places

### Discovery Search
The search bar queries `searchTags()` which hits `tags_normalized` + `tag_aliases`:
- Type "MC" → "Motorcykler (269)", "MC-klub (14)", "MC-tur (2)"
- Type "bil" → "Bil-show (134)", "Klassiske biler (266)", "Elbiler", "Biler (706)"
- Each result links to the category page

---

## PHASE 3: THE MAP (Kort)

**Goal:** Map pins are colored by tags, filterable by the tag hierarchy, showing real places from place_tags.

### Current state:
- DrillDownFilter renders but `onFilterChange` is never wired to pin filtering
- Pin colors use `place.main_categories` with fuzzy `SUPABASE_CAT_MAP`
- 219 hardcoded pins in `kortPins.ts`

### New architecture:

```
┌─ SIDEBAR ──────────────────┐  ┌─ MAP ──────────────────────────┐
│ 🔍 Search                  │  │                                │
│                            │  │    🌲    🌲                     │
│ ✨ Alle                    │  │       🌲                        │
│ 🏃 Motion & Fitness        │  │  🏃         🍽️   🌲            │
│ 🎵 Musik & Lyd            │  │     🌲  🎵                      │
│ 🚗 Motor & Køretøjer  ←   │  │          🏃                     │
│   ├ 🚗 Biler              │  │     🚗  🏃    🌲               │
│   ├ 🏍️ Motorcykler        │  │                                │
│   ├ 🏎️ Motorsport    ←    │  │  (pins filtered + colored)     │
│   │  ├ Circuit Racing      │  │                                │
│   │  ├ Karting             │  │                                │
│   │  └ Rally               │  │                                │
│   └ ⛵ Vandfartøjer       │  │                                │
│                            │  │                                │
│ 🎨 Kultur & Kunst         │  │                                │
│ ...                        │  │                                │
└────────────────────────────┘  └────────────────────────────────┘
```

**Key changes:**
- Sidebar = DrillDownFilter that actually WORKS — expanding L1→L2→L3 inline
- Selecting a tag filters map pins: `getPlacesByTag(slug, { bbox: mapBounds, descendants: true })`
- Pin emoji/color comes from the place's L1 tag (via `place_tags` → `tags_normalized`)
- No more `SUPABASE_CAT_MAP` fuzzy matching — direct tag lookup
- Viewport-aware: only fetch places in current map bounds
- Click pin → detail sheet shows place tags as pills

### Map Performance
- Cluster pins at zoom < 12
- Fetch places per viewport change (debounced 300ms)
- Max 500 pins visible at once
- Use `place_tags` index for fast spatial + tag queries

---

## PHASE 4: CATEGORY PAGES (The Deep Dive)

**Goal:** `/kategori/:slug` is the definitive page for any tag at any level.

### Current state:
- `CategoryDetail.tsx` (1406 lines) loads BOTH hardcoded content AND Supabase
- Only SPORT and KULTUR have hardcoded data in `categoryContent.ts`
- Other 8 categories fail silently (empty tabs)
- Uses old fuzzy tag matching

### New architecture:

**URL structure:**
```
/kategori/motor-køretøjer              → L1 page (all motor content)
/kategori/motor-køretøjer/motorsport   → L2 page (motorsport subcategory)
/kategori/motor-køretøjer/motorsport/circuit-racing → L3 page (specific)
```

**Page layout:**
```
🚗 Motor & Køretøjer
━━━━━━━━━━━━━━━━━━━━
7,268 events · 14 steder · 19 underkategorier

[Biler] [Motorcykler] [Motorsport] [Vandfartøjer] [Tuning] [Klassiske biler]

TAB: Events (7,268)  |  Steder (14)  |  Kort
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────┐ ┌─────────────────────┐
│ 🏎️ FDM Jyllandsring │ │ 🏁 Cars & Coffee    │
│ Circuit Racing       │ │ Bil-show            │
│ 📅 lør 12. apr      │ │ 📅 søn 20. apr      │
│ 📍 Silkeborg · 45km │ │ 📍 Aalborg · 3km    │
│ [racing] [motor]     │ │ [biltræf] [motor]   │
└─────────────────────┘ └─────────────────────┘
```

**Data source:** 100% from `event_tags_normalized` + `place_tags`. Zero hardcoded content.

**Features:**
- Subcategory chips = L2 children (from `tags_normalized WHERE parent_id = thisTag`)
- Event/place counts = from `tag_usage_counts` view
- Cards show `TagPill` components with normalized tag data
- "Kort" tab = embedded map filtered to this tag
- "Se alle" link for each subcategory
- Breadcrumb: Alle → Motor & Køretøjer → Motorsport → Circuit Racing

---

## PHASE 5: TAG PILLS & CARDS (The Visual Layer)

**Goal:** Every card everywhere shows what it's about.

### New components:

**`<TagPill>`** — single tag display
```
[🏎️ Circuit Racing]  ← L3, small, subtle
[🚗 Motor & Køretøjer]  ← L1, bold, colored
```

**`<TagRow>`** — horizontal scrollable row on cards
```
[🚗 Motor] [🏎️ Racing] [🏁 Circuit] +2 more
```

**`<TagBreadcrumb>`** — hierarchy path
```
Alle > Motor & Køretøjer > Motorsport > Circuit Racing
```

**Where they appear:**

| Location | What's shown |
|----------|-------------|
| Event card (Feed, Udforsk, Kategori) | L1 badge + top 2-3 L2/L3 as pills |
| Place card (Udforsk, Kort, Kategori) | L1 badge + top 2-3 L2/L3 as pills |
| Event Detail page | Full tag section, all tags grouped by level |
| Place Detail page | Full tag section (from `place_tag_slugs`) replacing old raw tags |
| Category page header | Breadcrumb + subcategory chips |
| Map pin detail sheet | Tag pills below place name |
| Feed section headers | L1 emoji + name + count |

**Every tag pill is clickable → navigates to `/kategori/:slug`**

---

## PHASE 6: PERSONALIZATION & INTELLIGENCE

**Goal:** The app learns what you like and surfaces relevant content.

### Tag-driven feed ranking:
```typescript
score = (tagMatchCount × 10) + (recencyDays × -0.5) + (distanceKm × -0.1)
```

Events/places with more matching tags rank higher. Recent and nearby rank higher.

### "Because you like..." sections:
```
Fordi du kan lide 🚗 Motor & Køretøjer:
  [Cars & Coffee Aalborg] [MC Morgentur] [Gokart-aften]

Andre med samme interesser kan lide:
  [Jazz i Aalborg] [Mountainbike Rold Skov]
```

Uses co-occurrence: users who have "motor" tags often also have "natur-outdoor" tags.

### Smart onboarding:
New user → full-screen L1 grid → pick 3+ → expand to L2 for each → save to profile.interests → feed immediately populated.

### Interest profile on Min Side:
```
Dine interesser (12 tags)
🚗 Motor (4): Biler, Racing, Klassiske biler, MC
🎵 Musik (3): Koncerter, Jazz, Rock
🌲 Natur (5): Vandring, Camping, Fiskeri, Kano, Cykling
[Rediger]
```

---

## IMPLEMENTATION ORDER

```
Phase 0: Data layer (tagData.ts + hooks)     3 days
  ↓
Phase 1: Feed                                 3 days
  ↓
Phase 2: Udforsk                              4 days
  ↓
Phase 3: Kort                                 3 days
  ↓
Phase 4: Category pages                       3 days
  ↓
Phase 5: Tag pills & cards                    2 days  (can start with Phase 1)
  ↓
Phase 6: Personalization                      4 days
```

**Critical path: Phase 0 → 1 → 2 → 3 (13 days)**
Phase 5 runs parallel from day 1. Phase 4 and 6 are additive.

**Total: ~22 days to complete transformation.**

---

## WHAT GETS DELETED

| File | Lines | Reason |
|------|-------|--------|
| `src/data/categories.ts` | 355 | Replaced by `tags_normalized` L1 query |
| `src/data/categoryContent.ts` | 1,135 | Replaced by live `getEventsByTag()` / `getPlacesByTag()` |
| `src/data/places.ts` | 1,138 | Dead code (never imported) |
| `src/data/feedData.ts` | 2,364 | Replaced by live feed sections |
| `src/data/kortPins.ts` | 219 | Replaced by live map pins from `place_tags` |
| All `CAT_ALIASES` in Udforsk | ~50 | Replaced by tag resolution |
| All `SUPABASE_CAT_MAP` in Kort | ~80 | Replaced by `place_tags` lookup |
| Fuzzy matching everywhere | ~200 | Replaced by exact slug matching |
| **TOTAL DELETED** | **~5,541** | **Replaced by ~400 lines in tagData.ts + hooks** |

---

## WHAT GETS CREATED

| File | Purpose |
|------|---------|
| `src/lib/tagData.ts` | Single data layer for all tag queries |
| `src/hooks/useTagData.ts` | React Query hooks for tag data |
| `src/components/TagPill.tsx` | Reusable tag display (L1/L2/L3 styles) |
| `src/components/TagRow.tsx` | Scrollable tag row for cards |
| `src/components/TagBreadcrumb.tsx` | Hierarchy breadcrumb |
| `src/components/CategoryGrid.tsx` | L1 category grid with live counts |
| `src/components/TagSearch.tsx` | Global search with alias resolution |

---

## SUCCESS CRITERIA

When this is done:

1. **Zero hardcoded categories anywhere** — all from `tags_normalized`
2. **Every card shows tags** — event and place cards have clickable TagPills
3. **Feed loads in <2 seconds** — section-based queries, never loads all 60K events
4. **Map filters actually work** — selecting "Motor" shows only motor places
5. **Category pages show real data** — all 22 L1 categories work, not just 2
6. **"MC" search finds motorcykler** — alias resolution works end-to-end
7. **Drill-down works everywhere** — Motor → Motorsport → Circuit Racing
8. **5,541 lines of dead/hardcoded data deleted**
9. **450K tag assignments (54K events + 396K places) are surfaced to users**
10. **One data system, one truth, one architecture**

---

## THE BOTTOM LINE

The backend is done. 793 tags, 54K event links, 396K place links, 176 aliases, views, functions — all live in production. But the frontend doesn't know any of it exists. It's still running on 5,541 lines of hardcoded data and 7 competing category systems with fuzzy string matching.

This plan replaces all of that with one clean pipeline: **Supabase → tagData.ts → React Query hooks → components → user's screen.**

That's the masterplan.
