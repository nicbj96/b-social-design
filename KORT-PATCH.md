# KORT.tsx Patch: Wire DrillDownFilter + Fix Pin Colors

## Architecture Overview

This patch addresses three core problems in the Kort.tsx map page:

1. **DrillDownFilter is never wired to map data**: Currently, selecting filters in DrillDownFilter updates `mapFilterSlugs` state, but this doesn't trigger fresh queries for matching places. The filter only applies client-side to `HARDCODED_PINS` after they're already loaded.

2. **Pin colors use fuzzy/unreliable matching**: The `placeToPin()` function uses `SUPABASE_CAT_MAP` with brittle fuzzy matching (includes/substring checks) against `main_categories` and `tags`. This fails for variations, typos, and unknown tags.

3. **Hardcoded pins are static**: `kortPins.ts` pins are manually curated and don't reflect live Supabase data.

### Solution Strategy

- **Wire the filter**: When DrillDownFilter's `onFilterChange` fires, trigger a new `fetchPlacesInViewport()` with the selected tag slugs passed as categories
- **Fix pin colors**: Replace fuzzy matching with explicit tag-to-category mapping via a helper function `getPlaceCategory()` that checks place's `tags` array against a whitelist
- **Remove hardcoded pins**: Stop loading/rendering from `kortPins.ts`; rely entirely on Supabase places

---

## Changes Required

### 1. Remove Hardcoded Pin Imports (DELETE LINES)

**Location**: Lines 21–24

**Current**:
```typescript
import { lazyLoadTagFunctions } from "@/lib/lazyDataLoader";
import { type PinCategory, type MapPin, HARDCODED_PINS } from "@/data/kortPins";
import { useTags } from "@/context/TagContext";
import { Link } from "wouter";
```

**Action**: Delete line 23 entirely. Rewrite lines 21–24 to:
```typescript
import { lazyLoadTagFunctions } from "@/lib/lazyDataLoader";
import { useTags } from "@/context/TagContext";
import { Link } from "wouter";
```

**Reason**: No longer need `HARDCODED_PINS` or `PinCategory` type from kortPins.ts.

---

### 2. Remove SUPABASE_CAT_MAP + Add getPlaceCategory() Helper

**Location**: Lines 126–212 (entire SUPABASE_CAT_MAP const)

**Action**:
- **DELETE** lines 126–212 (the entire `SUPABASE_CAT_MAP` object)
- **ADD** in its place (after line 125):

```typescript
/* ── Helper: Determine place category from tags ── */
function getPlaceCategory(place: Place): PinCategory {
  // Default fallback
  let category: PinCategory = "natur";

  // Define tag-to-category mapping (replace fuzzy matching)
  const TAG_CATEGORY_MAP: Record<string, PinCategory> = {
    // Natur (10 locked)
    "natur": "natur",
    "nature": "natur",
    "park": "natur",
    "skov": "natur",
    "forest": "natur",
    "outdoor": "outdoor",
    "friluftsliv": "natur",
    "bakke": "natur",
    "klit": "natur",
    "naturreservat": "natur",

    // Badning
    "strand": "badning",
    "badning": "badning",
    "vand": "badning",
    "badestrand": "badning",
    "sø": "badning",
    "lake": "badning",
    "beach": "badning",
    "hav": "badning",
    "sea": "badning",
    "swimming": "badning",
    "badesø": "badning",

    // Vandring
    "vandring": "vandring",
    "hike": "vandring",
    "hiking": "vandring",
    "trail": "vandring",
    "ture": "ture",
    "eventyr": "ture",
    "kajak": "ture",
    "kano": "ture",
    "klatring": "ture",
    "shelter": "shelter",

    // MTB
    "mtb": "mtb",
    "mountainbike": "mtb",
    "cykling": "mtb",
    "cycling": "mtb",
    "bike": "mtb",
    "cykli": "mtb",
    "cyklerute": "mtb",
    "bikeparken": "mtb",

    // Løb
    "loeb": "loeb",
    "running": "loeb",
    "løb": "loeb",
    "run": "loeb",
    "jogging": "loeb",
    "motionssti": "loeb",
    "løbesti": "loeb",

    // Hund
    "hundeskov": "hund",
    "hund": "hund",
    "dog": "hund",
    "hundeskoven": "hund",
    "hundepark": "hund",

    // Fiskeri
    "fiskeri": "fiskeri",
    "fishing": "fiskeri",
    "lystfiskeri": "fiskeri",

    // Sport
    "sport": "sport",
    "aktiv_sport": "aktiv_sport",
    "aktiv": "aktiv",
    "fodbold": "sport",
    "tennis": "sport",
    "basketball": "sport",
    "volleyball": "sport",
    "svømning": "sport",
    "svømmeri": "sport",
    "squash": "sport",
    "padel": "sport",
    "bowling": "sport",
    "golf": "sport",
    "klatrevæg": "sport",
    "skydning": "sport",
    "badminton": "sport",
    "atletik": "sport",

    // Fitness
    "fitness": "fitness",
    "gym": "fitness",
    "træning": "fitness",
    "crossfit": "fitness",
    "styrketræning": "fitness",
    "motionscenter": "fitness",

    // Musik
    "musik": "musik",
    "music": "musik",
    "koncert": "musik",
    "concert": "musik",
    "festival": "musik",
    "live": "musik",
    "scene": "musik",
    "spillested": "musik",
    "musikhus": "musik",
    "rockklub": "musik",
    "jazzklub": "musik",
    "natteliv": "musik",
    "klub": "musik",

    // Kultur
    "kultur": "kultur",
    "museum": "kultur",
    "udstilling": "kultur",
    "galleri": "kultur",
    "teater": "kultur",
    "biograf": "kultur",
    "cinema": "kultur",
    "kunst": "kreativt",
    "underholdning": "kultur",
    "forlystelse": "kultur",

    // Kreativt
    "kreativt": "kreativt",
    "workshop": "kreativt",
    "keramik": "kreativt",
    "maleri": "kreativt",

    // Mad
    "mad": "mad",
    "mad_hangout": "mad_hangout",
    "restaurant": "mad",
    "cafe": "mad",
    "bar": "mad_hangout",
    "pub": "mad",
    "spisested": "mad",
    "madmarked": "mad",
    "street_food": "mad",
    "takeaway": "mad",
    "fastfood": "mad",
    "brunch": "mad",
    "bakery": "mad",
    "bageri": "mad",
    "cocktailbar": "mad_hangout",
    "vinbar": "mad_hangout",
    "ølbar": "mad_hangout",

    // Logi
    "logi": "logi",
    "camping": "logi",
    "vandrerhjem": "logi",
    "hytter": "logi",
    "glamping": "logi",
    "hotel": "logi",
    "hostel": "logi",
    "bnb": "logi",
    "feriehus": "logi",
    "overnatning": "logi",
    "teltplads": "logi",

    // Wellness
    "wellness": "wellness",
    "yoga": "wellness",
    "meditation": "wellness",
    "sauna": "wellness",
    "spa": "wellness",
    "massage": "wellness",
    "mindfulness": "wellness",
    "pilates": "wellness",

    // Communities
    "communities": "communities",
    "bogklub": "communities",
    "braetspil": "communities",
    "socialt": "socialt",
    "mødested": "communities",
    "foreningsliv": "communities",

    // Events & rejser
    "events": "events",
    "rejser": "rejser",
    "transport": "rejser",
    "tog": "rejser",
    "bus": "rejser",
    "faerge": "rejser",
    "færge": "rejser",
    "lufthavn": "rejser",

    // Dyre/naturspot
    "dyrespot": "dyrespot",
    "dyrereservat": "dyrespot",
    "fugle": "dyrespot",

    // Family/theme park
    "zoo": "aktiv_sport",
    "akvarium": "aktiv_sport",
    "familie": "aktiv_sport",
    "temapark": "aktiv_sport",
  };

  // Check place tags (exact match in lowercase)
  if (place.tags && place.tags.length > 0) {
    for (const tag of place.tags) {
      const tagLower = tag.toLowerCase().trim();
      if (TAG_CATEGORY_MAP[tagLower]) {
        category = TAG_CATEGORY_MAP[tagLower];
        break;
      }
    }
  }

  // Fallback: check main_categories (if tags didn't yield)
  if (category === "natur" && place.main_categories && place.main_categories.length > 0) {
    for (const cat of place.main_categories) {
      const catLower = cat.toLowerCase().trim();
      if (TAG_CATEGORY_MAP[catLower]) {
        category = TAG_CATEGORY_MAP[catLower];
        break;
      }
    }
  }

  return category;
}
```

---

### 3. Update placeToPin() to Use getPlaceCategory()

**Location**: Lines 214–235 (function `placeToPin`)

**Current**:
```typescript
function placeToPin(place: Place): MapPin | null {
  // Guard: skip places with missing or invalid coordinates
  const lat = place.latitude;
  const lng = place.longitude;
  if (lat == null || lng == null || !isFinite(lat) || !isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null; // (0,0) is ocean — invalid placeholder

  let cat: PinCategory = "natur";
  const cats = [...(place.main_categories || []), ...(place.tags || [])];
  for (const c of cats) {
    const key = c.toLowerCase().replace(/[\s-]/g, "");
    for (const [mapKey, val] of Object.entries(SUPABASE_CAT_MAP)) {
      if (key.includes(mapKey) || mapKey.includes(key)) { cat = val; break; }
    }
    if (cat !== "natur") break;
  }
  return {
    id: `sb-${place.id}`, name: place.name, lat, lng,
    category: cat, description: place.description, rating: place.rating_avg || 0,
    ratingCount: place.rating_count || 0, tags: place.tags, city: place.city, fromSupabase: true,
  };
}
```

**Action**: Replace with:
```typescript
function placeToPin(place: Place): MapPin | null {
  // Guard: skip places with missing or invalid coordinates
  const lat = place.latitude;
  const lng = place.longitude;
  if (lat == null || lng == null || !isFinite(lat) || !isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null; // (0,0) is ocean — invalid placeholder

  const cat = getPlaceCategory(place);
  return {
    id: `sb-${place.id}`, name: place.name, lat, lng,
    category: cat, description: place.description, rating: place.rating_avg || 0,
    ratingCount: place.rating_count || 0, tags: place.tags, city: place.city, fromSupabase: true,
  };
}
```

**Reason**: Use the new explicit tag-matching function instead of fuzzy SUPABASE_CAT_MAP logic.

---

### 4. Remove HARDCODED_PINS from allPins Concatenation

**Location**: Search for `HARDCODED_PINS` usage in `allPins` calculation

Run grep to find: `grep -n "HARDCODED_PINS" /sessions/compassionate-serene-clarke/mnt/b-social-pages/source/src/pages/Kort.tsx`

It appears around line 1360–1365 in the `allPins` useMemo. Look for a line like:
```typescript
const allPins = useMemo(() => [
  ...(supabasePlaces.map(placeToPin).filter(Boolean)),
  ...(hardcodedPinsArray || []),
  // ... routes, events
], [...deps]);
```

**Action**: Remove the hardcoded pins line(s):
```typescript
const allPins = useMemo(() => [
  ...(supabasePlaces.map(placeToPin).filter(Boolean) as MapPin[]),
  // REMOVED: ...(hardcodedPinsArray || []),
  // Keep routes, events as-is
  ...(supabaseRoutes.map(routeToPin).filter(Boolean) as MapPin[]),
  ...(supabaseEvents.map(supabaseEventToPin).filter(Boolean) as MapPin[]),
], [supabasePlaces, supabaseRoutes, supabaseEvents]);
```

**Reason**: We now rely entirely on Supabase places for category-filtered data.

---

### 5. No changes needed to DrillDownFilter handler

**Current** (line 1523–1524):
```typescript
<DrillDownFilter
  onFilterChange={(slugs) => { setMapFilterSlugs(slugs); setSelectedPin(null); }}
```

This is already correct. When `mapFilterSlugs` changes, the `useEffect` at line 1327–1333 already triggers `fetchViewportPlaces(mapBounds, mapFilterSlugs)`, which now passes the slugs to the Supabase query (line 1300).

**Status**: ✓ No code change needed — the wiring already exists.

---

### 6. Fix Place Type Import if Missing

**Location**: Check imports at line 9

**Current**:
```typescript
import { fetchPlacesInViewport, fetchEvents, fetchRoutesForMap, type Place, type Event as SupabaseEvent, type MapBounds, type RouteWithPlace } from "@/lib/supabase";
```

**Action**: Verify `type Place` is imported. If not, add it.

**Status**: ✓ Already imported.

---

## Summary of Deletes

| Line Range | Content | Reason |
|-----------|---------|--------|
| 23 | `import { type PinCategory, type MapPin, HARDCODED_PINS } from "@/data/kortPins"` | Remove hardcoded pins import |
| 126–212 | Entire `SUPABASE_CAT_MAP` object | Replace with `getPlaceCategory()` helper |
| ~1360 | `...(hardcodedPinsArray \|\| [])` in `allPins` useMemo | Stop concatenating hardcoded pins |

## Summary of Additions

| Location | Code | Reason |
|----------|------|--------|
| After line 125 | `getPlaceCategory()` function | Replace fuzzy matching with explicit tag-to-category mapping |
| Line 214 | Update `placeToPin()` body | Call `getPlaceCategory(place)` instead of fuzzy loop |

---

## Testing Checklist

After applying this patch:

1. **Filter wiring**: Select a category in DrillDownFilter → verify map re-queries and pins update
2. **Pin colors**: Click on a Supabase place → verify emoji/color matches the category logic in `getPlaceCategory()`
3. **No hardcoded pins**: Search the map for any pins that don't come from Supabase (should find none, except routes & events)
4. **Search still works**: Text search in the search bar should filter the already-loaded pins as before

---

## Notes

- **PinCategory type**: Still defined in `kortPins.ts`, kept for backward compatibility with MapPin interface. The type itself doesn't need to be imported from kortPins anymore; it's an intrinsic string union.
- **CATEGORY_META**: Stays as-is; it's used for emoji/color rendering and is separate from the tag-to-category logic.
- **Bounds + Debouncing**: Already in place (lines 1320–1337). No changes needed.
