/**
 * LAZY LOADING IMPLEMENTATION EXAMPLES
 * Copy-paste ready code snippets for migrating to lazy loading
 * 
 * These examples show the safest patterns for deferring
 * tagTree and categoryContent imports.
 */

import { useState, useEffect, useMemo } from 'react';
import { lazyLoadTagTree, lazyLoadTagFunctions, lazyLoadCategoryFunctions } from '@/lib/lazyDataLoader';
import type { TagNode } from '@/lib/tagTree';
import type { CategoryPlace, CategoryActivity } from '@/data/categoryContent';

/* ═══════════════════════════════════════════════════════════════
   EXAMPLE 1: Lazy Load TagTree for Search
   
   Perfect for: Kort.tsx (map search)
   Pattern: Load in useEffect only when user searches
   Risk: LOW (search is user-initiated, not on mount)
   ═══════════════════════════════════════════════════════════════ */

export function ExampleKortSearch() {
  const [search, setSearch] = useState('');
  const [tagResults, setTagResults] = useState<TagNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load tag functions only when search query changes
  useEffect(() => {
    if (!search.trim()) {
      setTagResults([]);
      return;
    }

    setIsLoading(true);
    lazyLoadTagFunctions()
      .then(({ searchTags }) => {
        const results = searchTags(search);
        setTagResults(results);
      })
      .finally(() => setIsLoading(false));
  }, [search]);

  return (
    <div>
      <input 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tags..."
      />
      {isLoading && <p>Loading...</p>}
      {tagResults.map(tag => (
        <div key={tag.tag}>{tag.label}</div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXAMPLE 2: Lazy Load CategoryContent
   
   Perfect for: CategoryDetail.tsx
   Pattern: Load on mount, cache in state
   Risk: MEDIUM (affects component render, needs error handling)
   ═══════════════════════════════════════════════════════════════ */

export function ExampleCategoryDetail() {
  const categoryKey = 'sport'; // would come from route params
  const [places, setPlaces] = useState<CategoryPlace[]>([]);
  const [activities, setActivities] = useState<CategoryActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    lazyLoadCategoryFunctions()
      .then(({ getCategoryPlaces, getCategoryActivities }) => {
        setPlaces(getCategoryPlaces(categoryKey));
        setActivities(getCategoryActivities(categoryKey));
      })
      .catch(err => {
        console.error('Failed to load category content:', err);
        setError('Failed to load content');
      })
      .finally(() => setIsLoading(false));
  }, [categoryKey]);

  if (isLoading) return <div>Loading category...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Places ({places.length})</h2>
      {places.map(place => <div key={place.id}>{place.name}</div>)}
      
      <h2>Activities ({activities.length})</h2>
      {activities.map(activity => <div key={activity.id}>{activity.title}</div>)}
    </div>
  );
}

export default ExampleKortSearch;
