-- Step 1: Delete exact duplicates (same name + country + coordinates)
-- Keep the row with the highest quality_score, breaking ties by oldest created_at
DELETE FROM places WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY name, country, ROUND(latitude::numeric,5), ROUND(longitude::numeric,5)
      ORDER BY quality_score DESC NULLS LAST, created_at ASC
    ) as rn
    FROM places
  ) ranked
  WHERE rn > 1
);

-- Step 2: Add unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS places_name_country_lat_lng_unique
  ON places (name, country, ROUND(latitude::numeric,5), ROUND(longitude::numeric,5));
