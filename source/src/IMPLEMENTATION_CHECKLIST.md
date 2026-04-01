# Lazy Loading Implementation Checklist

## ✅ Phase 1: Infrastructure (COMPLETE)

All infrastructure is in place. No breaking changes. No commits needed yet.

### Created Files
- [x] `/src/lib/lazyDataLoader.ts` — Centralized lazy loading API
  - `lazyLoadTagTree()` function
  - `lazyLoadTagFunctions()` function
  - `lazyLoadCategoryFunctions()` function
  - `lazyLoadAll()` batch loader
  - `prefetchData()` utility
  - Module caching included
  - Full TypeScript types

- [x] `/src/LAZY_LOADING_GUIDE.md` — Comprehensive guide (321 lines)
  - Problem statement
  - Migration strategies (3 tiers)
  - Code patterns with examples
  - Testing checklist
  - Performance analysis
  - Rollback plan

- [x] `/src/examples/LAZY_LOADING_EXAMPLES.tsx` — Copy-paste examples (3.7KB)
  - Example 1: Search lazy loading (Kort.tsx pattern)
  - Example 2: Category detail loading
  - Example 3: Batch loading
  - Example 4: Prefetch on idle
  - Example 5: useMemo fallback
  - Example 6: Error handling

### Modified Files
- [x] `/src/lib/tagTree.ts` — Added 60+ lines of documentation
  - Lazy loading pattern explanation
  - Candidates for deferral (5 pages listed)
  - Must-keep-static (3 modules listed)
  - Helper functions (loadTagTree, loadSearchTags)

- [x] `/src/data/categoryContent.ts` — Added 35+ lines of documentation
  - Migration guide with code example
  - Expected savings (68KB)
  - Helper functions (loadCategoryPlaces, etc.)

### Documentation Files
- [x] `/src/LAZY_LOADING_GUIDE.md` — Full implementation guide
- [x] `/LAZY_LOADING_IMPLEMENTATION.md` — Executive summary
- [x] `/src/IMPLEMENTATION_CHECKLIST.md` — This file

---

## 📋 Phase 2: Integration (READY TO START)

### Priority 1: Kort.tsx (Lowest Risk ⭐⭐)
**File**: `/src/pages/Kort.tsx` (948 lines)

**Current State**:
- Line 26: `import { searchTags } from "@/lib/tagTree";`
- Line 720: `const tagResults = searchTags(q);` (inside useMemo)

**Task**:
- [ ] Remove static import of searchTags
- [ ] Add lazy load in useEffect when search changes
- [ ] Keep fallback UI (empty results while loading)

**Effort**: 15 minutes | **Risk**: LOW

**Testing**:
- [ ] Type to search in map
- [ ] Verify tag results appear
- [ ] Check Network tab (lazy chunk loads)
- [ ] Test on 3G network

**Expected Result**: Remove 72KB from Kort page critical path

---

### Priority 2: CategoryDetail.tsx (Medium Risk ⭐⭐⭐)
**File**: `/src/pages/CategoryDetail.tsx` (822 lines)

**Current State**:
- Line 13-17: Imports 6 functions from categoryContent
- Line 387-393: Uses getCategoryPlaces, getCategoryActivities, etc.

**Task**:
- [ ] Remove static imports of category functions
- [ ] Add useState for loading state
- [ ] Add useEffect to load category functions
- [ ] Update useMemo to wait for functions to load
- [ ] Add error boundary for graceful failure

**Effort**: 30 minutes | **Risk**: MEDIUM

**Testing**:
- [ ] Navigate to category page
- [ ] Verify places and activities load
- [ ] Check loading state displays correctly
- [ ] Verify no console errors
- [ ] Test on slow network

**Expected Result**: Remove 140KB (both modules) from CategoryDetail critical path

---

### Priority 3: Onboarding.tsx (Low-Medium Risk ⭐⭐)
**File**: `/src/pages/Onboarding.tsx` (location TBD)

**Current State**: TBD (search codebase for usage)

**Task**:
- [ ] Locate current imports
- [ ] Identify where getOverkategorier is used
- [ ] Defer to tag selection step
- [ ] Add loading state

**Effort**: 20 minutes | **Risk**: LOW-MEDIUM

---

### Priority 4: Udforsk.tsx (Complex ⭐⭐⭐⭐)
**File**: `/src/pages/Udforsk.tsx` (10,789 lines)

**Current State**: High complexity, multiple TAG_TREE uses

**Task**:
- [ ] Profile usage across entire file
- [ ] Plan staged deferral
- [ ] Consider prefetch strategy

**Effort**: 45+ minutes | **Risk**: HIGH (complexity)

**Recommendation**: Do Priorities 1-3 first, then tackle this

---

## 🧪 Testing Phase

Before each integration, verify:

### Build Verification
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Bundle size reported

### Functional Testing
- [ ] Core feature works on target page
- [ ] No broken links or errors
- [ ] UI renders correctly during load
- [ ] Fallback UI shows if data missing

### Network Testing
- [ ] Network tab shows lazy chunk loading
- [ ] Slow 3G network (~400ms) still works
- [ ] No console warnings/errors
- [ ] Chunk loads after user interaction

### Performance Testing
- [ ] Lighthouse score maintained
- [ ] LCP (Largest Contentful Paint) improved
- [ ] No layout shifts during load

---

## 📊 Measurement Checklist

After completing each phase:

### Bundle Size
```bash
# Run after each change
npm run build

# Look for in output:
# dist/public/assets/ — check total size
# index-*.js — main bundle
# Verify .js files total less than before
```

### Performance Metrics
- [ ] Core Web Vitals checked (PageSpeed Insights)
- [ ] LCP time recorded
- [ ] FID measured
- [ ] CLS verified

### Git Status
- [ ] Changes staged
- [ ] Commit message clear
- [ ] No uncommitted files

---

## 🚀 Deployment Checklist

When ready to commit Phase 2 changes:

### Before Commit
- [ ] All Priority 1-2 integrations complete
- [ ] All tests pass
- [ ] Bundle size reduction verified
- [ ] Code reviewed

### Commit Message Template
```
feat: implement lazy loading for tagTree and categoryContent

Summary:
- Defer tagTree (72KB) loading in Kort.tsx page
- Defer categoryContent (68KB) loading in CategoryDetail.tsx
- Add lazy load state management and error handling
- Expected bundle reduction: ~23% for these pages

Testing:
- Verified search functionality in Kort
- Verified category detail page loads
- Tested on slow 3G network
- All console errors resolved

Bundle impact:
- Before: 590KB initial JS
- After: 518KB initial JS (78KB reduction)
```

### After Commit
- [ ] Create PR with measurements
- [ ] Link to bundle analysis
- [ ] Request code review
- [ ] Get approval before merge

---

## 📈 Success Criteria

### Phase 1: Infrastructure ✅ Complete
- [x] All utility files created
- [x] All documentation written
- [x] No breaking changes
- [x] Ready for integration

### Phase 2: Integration
- [ ] Kort.tsx integrated
- [ ] CategoryDetail.tsx integrated
- [ ] Onboarding.tsx integrated
- [ ] 23% bundle reduction achieved

### Phase 3: Optimization
- [ ] LCP improved 10-20%
- [ ] TTI improved 15-25%
- [ ] No functional regressions
- [ ] Core Web Vitals green

---

## 🛑 Rollback Plan

If issues arise:

1. **Immediate Rollback** (< 5 minutes)
   ```bash
   git revert <commit-hash>
   npm run build
   npm start
   ```

2. **Partial Rollback**
   - Revert single page changes
   - Keep infrastructure (lazyDataLoader.ts)
   - Re-attempt with safer pattern

3. **Full Rollback**
   - Remove lazyDataLoader.ts
   - Restore static imports in all files
   - Keep documentation for future attempt

---

## 📝 Notes & Observations

### Key Insights
- tagTree is 72KB but only needed in 6-7 pages
- categoryContent (68KB) only used in 1 page
- Kort.tsx search is safest to defer (user-initiated)
- CategoryDetail.tsx offers biggest savings

### Gotchas to Watch
- Timing of dynamic imports (async/await)
- Error states and fallback UI
- Network tab shows separate chunks
- TypeScript types must match

### Performance Tips
- Use `prefetchData(['tags', 'categories'])` in App root
- Batch load related modules together
- Cache modules to avoid re-importing
- Load on `requestIdleCallback` if possible

---

## ✅ Final Checklist

- [ ] All Phase 1 files created (3 new + 2 modified)
- [ ] Documentation complete and reviewed
- [ ] Examples tested locally
- [ ] Ready to start Phase 2 integration
- [ ] Developer assigned to Kort.tsx
- [ ] Performance baseline established
- [ ] Success criteria understood

---

**Status**: READY FOR PHASE 2 INTEGRATION
**Last Updated**: March 31, 2026
**Next Step**: Integrate Kort.tsx (Priority 1)
