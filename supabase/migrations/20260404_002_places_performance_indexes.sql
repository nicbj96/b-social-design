-- =============================================================================
-- Migration: 20260404_002_places_performance_indexes.sql
-- Description: Add B-tree indexes on places(quality_score, rating_avg) and
--              places(country) to avoid full table scans on the 191K-row table.
--              These are used by fetchPlaces ORDER BY + WHERE country = ...
-- =============================================================================

-- Composite index for the primary sort order used by fetchPlaces and fetchPlacesInViewport
CREATE INDEX IF NOT EXISTS idx_places_quality_rating
  ON public.places (quality_score DESC NULLS LAST, rating_avg DESC NULLS LAST);

-- Index for country filter (used with or without category filter)
CREATE INDEX IF NOT EXISTS idx_places_country
  ON public.places (country)
  WHERE country IS NOT NULL;

-- Partial index: exclude null/zero coordinates (invalid places)
-- This speeds up viewport queries that filter on lat/lng ranges
CREATE INDEX IF NOT EXISTS idx_places_lat_lng
  ON public.places (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    AND latitude != 0 AND longitude != 0;
