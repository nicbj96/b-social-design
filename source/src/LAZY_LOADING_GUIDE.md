# Lazy Loading Implementation Guide
## Bundle Size Optimization for B-Social

### Problem Statement
- **tagTree.ts**: 72KB (tag hierarchy + search)
- **categoryContent.ts**: 68KB (places + activities)
- **Current**: Both imported synchronously → ~140KB in initial JS bundle
- **Impact**: Adds ~180KB to critical path (loaded on every page)
- **Solution**: Defer loading to when needed via dynamic imports

---

## Files Modified

### 1. `/src/lib/tagTree.ts`
✅ **Added**:
- Lazy loading helper functions at end of file
- Comprehensive documentation of migration strategy
- Notes on which imports can be deferred vs. kept static

**Key insight**: Several pages import but only use tagTree conditionally:
- Kort.tsx: Only searches when user types
- CategoryDetail.tsx: Used for non-critical suggestions
- Udforsk.tsx: Renders tag UI, but not on initial page load

### 2. `/src/data/categoryContent.ts`
✅ **Added**:
- Async helper functions (`loadCategoryPlaces`, `loadCategoryActivities`, etc.)
- Detailed migration guide with code examples
- Expected bundle savings: 68KB reduction

**Key insight**: CategoryContent is only used in CategoryDetail.tsx. This page is accessed via navigation, not on first load.

### 3. `/src/lib/lazyDataLoader.ts` (NEW)
✅ **Created**:
- Centralized lazy loading API for both large data files
- Module caching to avoid repeated imports
- Prefetch utilities for warming up cache
- Batch loading for pages needing multiple modules

**Usage**:
```typescript
// Load single module
const tagTree = await lazyLoadTagTree();

// Load functions
const { searchTags } = await lazyLoadTagFunctions();

// Load all at once (for pages needing both)
const { TAG_TREE, getCategoryPlaces } = await lazyLoadAll();

// Prefetch during idle time
useEffect(() => {
  prefetchData(['tags', 'categories']);
}, []);
```

---

## Migration Strategy

### Tier 1: Easy Wins (Highest Impact)
These pages can defer loading without affecting UX:

#### a) **Kort.tsx** (Map page)
```typescript
// BEFORE:
import { searchTags } from "@/lib/tagTree";

const filteredPins = useMemo(() => {
  const q = search.toLowerCase();
  const tagResults = searchTags(q);  // Line 720
  // ...
}, [search, allPins]);

// AFTER:
import { lazyLoadTagFunctions } from '@/lib/lazyDataLoader';

const filteredPins = useMemo(async () => {
  if (!search.trim()) return allPins;
  
  const { searchTags } = await lazyLoadTagFunctions();
  const tagResults = searchTags(search.toLowerCase());
  // ...
}, [search, allPins]);
```
**Impact**: Removes 72KB from Kort page critical path
**Effort**: Low (only used in one useMemo)

#### b) **CategoryDetail.tsx** (Category browsing page)
```typescript
// BEFORE:
import { getCategoryPlaces, getCategoryActivities } from '@/data/categoryContent';

const places = useMemo(() => {
  if (activeSub) return getSubcategoryPlaces(category, activeSub);
  return getCategoryPlaces(category);
}, [category, activeSub]);

// AFTER:
import { lazyLoadCategoryFunctions } from '@/lib/lazyDataLoader';

const [placeFunctions, setPlaceFunctions] = useState(null);

useEffect(() => {
  lazyLoadCategoryFunctions().then(setPlaceFunctions);
}, []);

const places = useMemo(() => {
  if (!placeFunctions) return [];
  if (activeSub) return placeFunctions.getSubcategoryPlaces(category, activeSub);
  return placeFunctions.getCategoryPlaces(category);
}, [category, activeSub, placeFunctions]);
```
**Impact**: Removes 68KB from CategoryDetail critical path
**Effort**: Medium (need state management + effect)

#### c) **Onboarding.tsx** (User onboarding flow)
```typescript
// Similar pattern to Kort.tsx
// getOverkategorier() only called when user is in onboarding
// Can be deferred until user reaches tag selection step
```
**Impact**: Removes 72KB from Onboarding page
**Effort**: Low

### Tier 2: Keep Static (Always Needed)
These should remain synchronously imported because they're essential to core functionality:

- **FeedTagEditor.tsx**: Renders immediately visible tag selector
- **tagEngine.ts**: Core user tag storage + matching
- **newsEngine.ts**: News feed initialization

---

## Bundle Impact Analysis

### Current Baseline
```
Initial JS Bundle:
├── React + UI deps: ~150KB
├── tagTree.ts:      72KB   ⬅ Can defer to 7 pages
├── categoryContent: 68KB   ⬅ Only used in 1 page
├── Other code:      ~200KB
├── Other:           ~100KB
─────────────────────────────
Total:               ~590KB
```

### After Lazy Loading (All Tiers Implemented)
```
Initial JS Bundle:
├── React + UI deps:        ~150KB
├── Essential code:         ~200KB
├── Other:                  ~100KB
─────────────────────────────
Total:                       ~450KB   ⬅ 23% reduction

Deferred Chunks:
├── Kort page:              72KB (tagTree)
├── CategoryDetail page:    68KB (categoryContent) + 72KB (tagTree)
├── Onboarding:            72KB (tagTree)
├── Other pages:           72KB (tagTree)
```

**Expected Improvements**:
- Initial load: 23% faster
- CategoryDetail route: Lazy load 140KB (both modules)
- FeedTagEditor (critical): No change (stays static)
- Kort map: No change in visible performance (search is user-initiated)

---

## Implementation Checklist

### Phase 1: Infrastructure ✅
- [x] Add lazyDataLoader.ts utility module
- [x] Add helpers to tagTree.ts
- [x] Add helpers to categoryContent.ts
- [x] Document strategies in this file

### Phase 2: Implement Tier 1 (Recommended)
- [ ] Kort.tsx: Defer tagTree import (LOW RISK)
- [ ] CategoryDetail.tsx: Defer categoryContent + tagTree (MEDIUM RISK)
- [ ] Onboarding.tsx: Defer tagTree import (LOW RISK)

### Phase 3: Monitor & Refine
- [ ] Measure bundle size reduction via vite build output
- [ ] Test on slow 3G network to verify improvements
- [ ] Monitor Core Web Vitals (LCP, FID, CLS)
- [ ] Adjust prefetch timing if needed

---

## Code Examples

### Pattern 1: Simple useState + useEffect
```typescript
const [tags, setTags] = useState<TagNode[] | null>(null);

useEffect(() => {
  lazyLoadTagTree().then(setTags);
}, []);

// Usage with fallback
const suggestions = tags ? tagSearch(tags, query) : [];
```

### Pattern 2: React.lazy() + Suspense (Component-level)
```typescript
const ExpensiveTagComponent = lazy(() => 
  import('./TagComponent').then(m => ({
    default: m.TagComponent
  }))
);

export function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <ExpensiveTagComponent />
    </Suspense>
  );
}
```

### Pattern 3: Dynamic chunk loading in route
```typescript
// Router config
const routes = [
  {
    path: '/kort',
    component: () => import('./pages/Kort').then(m => ({
      default: m.Kort
    }))
  },
];
```

### Pattern 4: Prefetch on idle (Best Practice)
```typescript
useEffect(() => {
  // Load heavy data during browser idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchData(['tags', 'categories']);
    });
  } else {
    // Fallback to setTimeout
    setTimeout(() => {
      prefetchData(['tags', 'categories']);
    }, 2000);
  }
}, []);
```

---

## Testing Checklist

Before deploying lazy loading changes:

- [ ] Bundle size verification
  ```bash
  npm run build
  ls -lh dist/public/assets/
  ```

- [ ] Functional testing
  - [ ] Tag search still works (Kort.tsx)
  - [ ] Category detail page loads correctly
  - [ ] Feed tag editor displays tags
  - [ ] Onboarding flow works

- [ ] Network testing
  - [ ] Verify lazy chunks load on demand
  - [ ] Check DevTools Network tab for chunk timing
  - [ ] Simulate slow 3G and verify no blocking

- [ ] Performance monitoring
  - [ ] Lighthouse score
  - [ ] Core Web Vitals (Google PageSpeed Insights)
  - [ ] Time to Interactive (TTI)

---

## Rollback Plan

If lazy loading causes issues:

1. Remove imports from lazyDataLoader
2. Restore static imports in affected files
3. Keep the lazyDataLoader.ts file for future use

All changes are additive and non-breaking.

---

## Future Optimizations

### Route-based Code Splitting
```typescript
// Pages that load together can share lazy chunks
const CategoryRoute = lazy(() => 
  import('./CategoryDetail') // Includes lazyLoaded categoryContent
);
```

### Prefetch Strategies
- Load categoryContent when user hovers on category links
- Load tagTree when user types in search box
- Preload on high-speed connections (4G/5G)

### Virtual Scrolling
For large tag trees / place lists, implement virtual scrolling to reduce DOM nodes.

---

## References
- Vite dynamic imports: https://vitejs.dev/guide/features.html#dynamic-import
- React code splitting: https://react.dev/reference/react/lazy
- Bundle analysis: `npm run build -- --analyze`
