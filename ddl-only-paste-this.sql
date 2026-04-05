-- ═══════════════════════════════════════════════════════════════
-- B-Social: PASTE THIS IN YOUR SUPABASE SQL EDITOR
-- This creates 2 new tables + adds 2 columns + creates views
-- Takes ~2 seconds to run. Does NOT modify existing data.
-- ═══════════════════════════════════════════════════════════════

-- 1. Tag Aliases table (maps variant spellings to canonical slugs)
CREATE TABLE IF NOT EXISTS tag_aliases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias       text NOT NULL,
  canonical   text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(alias)
);
CREATE INDEX IF NOT EXISTS idx_tag_aliases_alias ON tag_aliases (lower(alias));
CREATE INDEX IF NOT EXISTS idx_tag_aliases_canonical ON tag_aliases (canonical);
ALTER TABLE tag_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tag_aliases_read" ON tag_aliases FOR SELECT USING (true);
CREATE POLICY "tag_aliases_write" ON tag_aliases FOR ALL USING (true) WITH CHECK (true);

-- 2. Place Tags junction table (links places ↔ tags_normalized)
CREATE TABLE IF NOT EXISTS place_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id    uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  tag_id      uuid NOT NULL REFERENCES tags_normalized(id) ON DELETE CASCADE,
  source      text DEFAULT 'auto',
  confidence  real DEFAULT 1.0,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(place_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_place_tags_place ON place_tags (place_id);
CREATE INDEX IF NOT EXISTS idx_place_tags_tag ON place_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_place_tags_source ON place_tags (source);
ALTER TABLE place_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "place_tags_read" ON place_tags FOR SELECT USING (true);
CREATE POLICY "place_tags_write" ON place_tags FOR ALL USING (true) WITH CHECK (true);

-- 3. Add source/confidence to event_tags_normalized (safe - skips if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_tags_normalized' AND column_name = 'source') THEN
    ALTER TABLE event_tags_normalized ADD COLUMN source text DEFAULT 'auto';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_tags_normalized' AND column_name = 'confidence') THEN
    ALTER TABLE event_tags_normalized ADD COLUMN confidence real DEFAULT 1.0;
  END IF;
END $$;

-- 4. Views for frontend
CREATE OR REPLACE VIEW event_tag_slugs AS
SELECT etn.event_id, tn.slug, tn.name, tn.level, tn.emoji
FROM event_tags_normalized etn
JOIN tags_normalized tn ON tn.id = etn.tag_id;

CREATE OR REPLACE VIEW place_tag_slugs AS
SELECT pt.place_id, tn.slug, tn.name, tn.level, tn.emoji
FROM place_tags pt
JOIN tags_normalized tn ON tn.id = pt.tag_id;

CREATE OR REPLACE VIEW tag_usage_counts AS
SELECT
  tn.id, tn.slug, tn.name, tn.emoji, tn.level,
  COALESCE(ec.event_count, 0) AS event_count,
  COALESCE(pc.place_count, 0) AS place_count,
  COALESCE(ec.event_count, 0) + COALESCE(pc.place_count, 0) AS total_count
FROM tags_normalized tn
LEFT JOIN (SELECT tag_id, COUNT(*) AS event_count FROM event_tags_normalized GROUP BY tag_id) ec ON ec.tag_id = tn.id
LEFT JOIN (SELECT tag_id, COUNT(*) AS place_count FROM place_tags GROUP BY tag_id) pc ON pc.tag_id = tn.id
ORDER BY total_count DESC;

-- 5. Helper function: resolve any tag string (alias-aware)
CREATE OR REPLACE FUNCTION resolve_tag(input_tag text)
RETURNS uuid LANGUAGE plpgsql STABLE AS $$
DECLARE result_id uuid; canonical_slug text;
BEGIN
  SELECT id INTO result_id FROM tags_normalized WHERE lower(slug) = lower(input_tag) LIMIT 1;
  IF result_id IS NOT NULL THEN RETURN result_id; END IF;
  SELECT ta.canonical INTO canonical_slug FROM tag_aliases ta WHERE lower(ta.alias) = lower(input_tag) LIMIT 1;
  IF canonical_slug IS NOT NULL THEN
    SELECT id INTO result_id FROM tags_normalized WHERE lower(slug) = lower(canonical_slug) LIMIT 1;
  END IF;
  RETURN result_id;
END; $$;

-- ═══════════════════════════════════════════════════════════════
-- DONE! After running this, Claude will handle all data population
-- (tag_aliases, place_tags auto-tagging) via the REST API.
-- ═══════════════════════════════════════════════════════════════
