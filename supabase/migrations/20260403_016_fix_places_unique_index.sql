-- Fix: replace expression-based unique index with plain column unique index
-- so PostgREST on_conflict=name,country,latitude,longitude can match it.
-- The ROUND-based index prevented upserts from working (PostgREST can't
-- reference expression indexes in its on_conflict parameter).

DROP INDEX IF EXISTS places_name_country_lat_lng_unique;

CREATE UNIQUE INDEX places_name_country_lat_lng_unique
  ON public.places (name, country, latitude, longitude);
