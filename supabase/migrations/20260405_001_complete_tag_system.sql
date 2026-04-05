-- ═══════════════════════════════════════════════════════════════════
-- B-Social Complete Tag System Migration
-- Date: 2026-04-05
-- ═══════════════════════════════════════════════════════════════════
-- This migration:
--   1. Creates tag_aliases table (bilshow↔bil-show, racing↔circuit-racing, etc.)
--   2. Creates place_tags junction table (like event_tags_normalized but for places)
--   3. Auto-tags ALL 61K+ events via category→L1 + title keywords→L2/L3
--   4. Migrates existing interest_tags array → event_tags_normalized junction table
--   5. Auto-tags ALL 194K+ places via smart_tags + main_categories
--   6. Sets up RLS policies for new tables
--
-- RUN THIS IN SUPABASE SQL EDITOR (runs as superuser, bypasses RLS)
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════
-- STEP 1: Create tag_aliases table
-- Maps common/variant tag strings to canonical tags_normalized slugs
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tag_aliases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias       text NOT NULL,                          -- the variant/common form
  canonical   text NOT NULL,                          -- the tags_normalized.slug it maps to
  created_at  timestamptz DEFAULT now(),
  UNIQUE(alias)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_tag_aliases_alias ON tag_aliases (lower(alias));
CREATE INDEX IF NOT EXISTS idx_tag_aliases_canonical ON tag_aliases (canonical);

-- RLS: read for everyone, write for authenticated
ALTER TABLE tag_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tag_aliases_read" ON tag_aliases FOR SELECT USING (true);
CREATE POLICY "tag_aliases_insert" ON tag_aliases FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════
-- STEP 2: Populate tag_aliases with known mappings
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO tag_aliases (alias, canonical) VALUES
  -- Motor & Køretøjer aliases
  ('bilshow',         'bil-show'),
  ('bil show',        'bil-show'),
  ('autoshow',        'bil-show'),
  ('auto show',       'bil-show'),
  ('racing',          'circuit-racing'),
  ('race',            'circuit-racing'),
  ('løb-bil',         'circuit-racing'),
  ('drift',           'drifting'),
  ('driftning',       'drifting'),
  ('go-kart',         'karting-aktiv'),
  ('gokart',          'karting-aktiv'),
  ('karting',         'karting-aktiv'),
  ('motorcykel',      'motorcykler'),
  ('mc',              'motorcykler'),
  ('motorcycle',      'motorcykler'),
  ('mc-træf',         'mc-klub'),
  ('mc-traef',        'mc-klub'),
  ('veteran-bil',     'klassiske-biler'),
  ('veteran bil',     'klassiske-biler'),
  ('veteranbil',      'klassiske-biler'),
  ('oldtimer',        'klassiske-biler'),
  ('klassisk bil',    'klassiske-biler'),
  ('rally',           'rally-aktiv'),
  ('supercar',        'tuning'),
  ('roadtrip',        'roadtrip-bil'),
  ('road trip',       'roadtrip-bil'),
  ('el-bil',          'elbiler'),
  ('elbil',           'elbiler'),
  ('tesla',           'elbiler'),
  ('endurance',       'circuit-racing'),
  ('24h',             'circuit-racing'),
  ('motorsport',      'motorsport-aktiv'),
  ('motor sport',     'motorsport-aktiv'),
  ('custom',          'custom-mc'),
  ('båd',             'båd'),
  ('boat',            'båd'),
  ('jetski',          'jetski'),
  ('jet ski',         'jetski'),
  ('speedbåd',        'speedbåd'),
  ('sejlads',         'sejlads-sport'),
  ('sailing',         'sejlads-sport'),
  ('scooter',         'scooter'),

  -- Musik aliases
  ('koncert',         'koncerter'),
  ('concert',         'koncerter'),
  ('live musik',      'koncerter'),
  ('live-musik',      'koncerter'),
  ('rock',            'rock-metal'),
  ('metal',           'rock-metal'),
  ('pop',             'pop-mainstream'),
  ('hiphop',          'hiphop-rap'),
  ('hip-hop',         'hiphop-rap'),
  ('rap',             'hiphop-rap'),
  ('jazz',            'jazz-blues'),
  ('blues',           'jazz-blues'),
  ('elektronisk',     'elektronisk-musik'),
  ('electronic',      'elektronisk-musik'),
  ('techno',          'elektronisk-musik'),
  ('dj',              'elektronisk-musik'),
  ('klassisk',        'klassisk-musik'),
  ('classical',       'klassisk-musik'),
  ('orkester',        'klassisk-musik'),
  ('kor',             'kor-sang'),
  ('sang',            'kor-sang'),

  -- Sport aliases
  ('fodbold',         'fodbold'),
  ('football',        'fodbold'),
  ('soccer',          'fodbold'),
  ('hockey',          'ishockey'),
  ('is hockey',       'ishockey'),
  ('basketball',      'basketball'),
  ('håndbold',        'håndbold'),
  ('handball',        'håndbold'),
  ('tennis',          'tennis'),
  ('badminton',       'badminton'),
  ('svømning',        'svømning'),
  ('swimming',        'svømning'),

  -- Kultur aliases
  ('teater',          'teater-drama'),
  ('theater',         'teater-drama'),
  ('theatre',         'teater-drama'),
  ('comedy',          'comedy-improv'),
  ('standup',         'comedy-improv'),
  ('stand-up',        'comedy-improv'),
  ('improv',          'comedy-improv'),
  ('kunst',           'kunst'),
  ('art',             'kunst'),
  ('museum',          'museer'),
  ('galleri',         'gallerier'),
  ('gallery',         'gallerier'),
  ('udstilling',      'udstillinger'),
  ('exhibition',      'udstillinger'),
  ('messe',           'udstillinger'),
  ('dans',            'dans-performance'),
  ('dance',           'dans-performance'),
  ('ballet',          'dans-performance'),
  ('film',            'film-visning'),
  ('biograf',         'film-visning'),
  ('cinema',          'film-visning'),

  -- Motion/Fitness aliases
  ('løb',             'løb'),
  ('running',         'løb'),
  ('marathon',        'marathon'),
  ('cykling',         'cykling'),
  ('cycling',         'cykling'),
  ('bike',            'cykling'),
  ('mountainbike',    'mountainbike'),
  ('mtb',             'mountainbike'),
  ('yoga',            'yoga'),
  ('fitness',         'fitness-center'),
  ('gym',             'fitness-center'),
  ('crossfit',        'crossfit'),
  ('svømning',        'svømning'),
  ('triathlon',       'triathlon'),
  ('vandring',        'vandring'),
  ('hiking',          'vandring'),
  ('hike',            'vandring'),
  ('walking',         'vandring'),

  -- Natur/Outdoor aliases
  ('camping',         'camping'),
  ('teltning',        'camping'),
  ('fiskeri',         'fiskeri'),
  ('fishing',         'fiskeri'),
  ('lystfiskeri',     'fiskeri'),
  ('kano',            'kano-kajak'),
  ('kajak',           'kano-kajak'),
  ('kayak',           'kano-kajak'),
  ('surf',            'surfing'),
  ('surfing',         'surfing'),
  ('klatring',        'klatring'),
  ('climbing',        'klatring'),
  ('bouldering',      'klatring'),
  ('ridning',         'ridning'),
  ('horse riding',    'ridning'),
  ('hest',            'ridning'),
  ('ryttersti',       'ridning'),

  -- Børn/Familie aliases
  ('børn',            'børn-aktiviteter'),
  ('children',        'børn-aktiviteter'),
  ('kids',            'børn-aktiviteter'),
  ('familie',         'familie-oplevelser'),
  ('family',          'familie-oplevelser'),
  ('forlystelsespark','forlystelsespark'),
  ('temapark',        'forlystelsespark'),
  ('zoo',             'dyrehaver'),
  ('dyr',             'dyrehaver'),
  ('akvarium',        'dyrehaver'),

  -- Mad & Drikke aliases
  ('mad',             'madlavning'),
  ('food',            'madlavning'),
  ('restaurant',      'restauranter'),
  ('café',            'caféer'),
  ('cafe',            'caféer'),
  ('kaffe',           'caféer'),
  ('coffee',          'caféer'),
  ('vin',             'vin-smagning'),
  ('wine',            'vin-smagning'),
  ('øl',              'øl-bryggeri'),
  ('beer',            'øl-bryggeri'),
  ('cocktail',        'cocktails'),
  ('bar',             'barer'),

  -- Rejser aliases
  ('rejse',           'rejser'),
  ('travel',          'rejser'),
  ('backpacking',     'backpacking'),
  ('vandretur',       'vandring'),
  ('trekking',        'vandring'),
  ('italien',         'europa-rejser'),
  ('england',         'europa-rejser'),
  ('frankrig',        'europa-rejser'),
  ('spanien',         'europa-rejser'),

  -- Gaming/Tech aliases
  ('gaming',          'gaming'),
  ('esport',          'esport'),
  ('e-sport',         'esport'),
  ('coding',          'kodning'),
  ('programmering',   'kodning'),
  ('ai',              'ai-ml'),
  ('machine learning','ai-ml'),

  -- Festival aliases
  ('festival',        'musikfestival'),
  ('musikfestival',   'musikfestival'),
  ('madfestival',     'madfestival'),
  ('food festival',   'madfestival'),

  -- Sundhed/Wellness aliases
  ('meditation',      'meditation'),
  ('mindfulness',     'meditation'),
  ('spa',             'spa-wellness'),
  ('wellness',        'spa-wellness'),

  -- Frivilligt/Community
  ('frivillig',       'frivilligt-arbejde'),
  ('volunteer',       'frivilligt-arbejde'),
  ('velgørenhed',     'velgørenhed')

ON CONFLICT (alias) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- STEP 3: Create place_tags junction table
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS place_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id    uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  tag_id      uuid NOT NULL REFERENCES tags_normalized(id) ON DELETE CASCADE,
  source      text DEFAULT 'auto',  -- 'auto', 'manual', 'import'
  confidence  real DEFAULT 1.0,     -- 0.0-1.0, how confident is this mapping
  created_at  timestamptz DEFAULT now(),
  UNIQUE(place_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_place_tags_place ON place_tags (place_id);
CREATE INDEX IF NOT EXISTS idx_place_tags_tag ON place_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_place_tags_source ON place_tags (source);

-- RLS: read for everyone, write for authenticated
ALTER TABLE place_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "place_tags_read" ON place_tags FOR SELECT USING (true);
CREATE POLICY "place_tags_insert" ON place_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Also add source/confidence columns to event_tags_normalized if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_tags_normalized' AND column_name = 'source') THEN
    ALTER TABLE event_tags_normalized ADD COLUMN source text DEFAULT 'auto';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_tags_normalized' AND column_name = 'confidence') THEN
    ALTER TABLE event_tags_normalized ADD COLUMN confidence real DEFAULT 1.0;
  END IF;
END $$;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════
-- STEP 4: AUTO-TAG EVENTS — Category → L1 mapping
-- Maps event.category to the correct L1 overkategori
-- ═══════════════════════════════════════════════════════════════════

-- Category→L1 mapping table (temporary)
CREATE TEMP TABLE cat_to_l1 (cat text, l1_slug text);
INSERT INTO cat_to_l1 VALUES
  ('musik',       'musik-lyd'),
  ('kultur',      'kultur-kunst'),
  ('sport',       'motion-fitness'),
  ('motor',       'motor-køretøjer'),
  ('familie',     'børn-familie'),
  ('festival',    'musik-lyd'),
  ('arrangement', 'social-hobby'),
  ('mad',         'mad-drikke');

-- Insert L1 tags for all events based on category
INSERT INTO event_tags_normalized (event_id, tag_id, source, confidence)
SELECT DISTINCT
  e.id,
  tn.id,
  'auto-category',
  0.9
FROM events e
JOIN cat_to_l1 c ON lower(e.category) = c.cat
JOIN tags_normalized tn ON tn.slug = c.l1_slug AND tn.level = 1
ON CONFLICT (event_id, tag_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- STEP 5: AUTO-TAG EVENTS — Title keyword → L2/L3 mapping
-- Scans event titles for keywords and maps to specific tags
-- ═══════════════════════════════════════════════════════════════════

-- Keyword→tag mapping table (temporary)
CREATE TEMP TABLE keyword_to_tag (keyword text, tag_slug text, confidence real);
INSERT INTO keyword_to_tag VALUES
  -- Motor-specifik
  ('bilshow',      'bil-show',        0.95),
  ('bil show',     'bil-show',        0.95),
  ('autoshow',     'bil-show',        0.95),
  ('racing',       'circuit-racing',  0.9),
  ('race',         'circuit-racing',  0.8),
  ('formel',       'circuit-racing',  0.9),
  ('f1',           'circuit-racing',  0.9),
  ('le mans',      'circuit-racing',  0.95),
  ('24 timer',     'circuit-racing',  0.85),
  ('drift',        'drifting',        0.85),
  ('go-kart',      'karting-aktiv',   0.95),
  ('gokart',       'karting-aktiv',   0.95),
  ('karting',      'karting-aktiv',   0.95),
  ('rally',        'rally-aktiv',     0.9),
  ('motorcykel',   'motorcykler',     0.95),
  ('mc-træf',      'mc-klub',         0.95),
  ('mc træf',      'mc-klub',         0.95),
  ('mc-tur',       'mc-tur',          0.95),
  ('veteran bil',  'klassiske-biler', 0.9),
  ('veteranbil',   'klassiske-biler', 0.9),
  ('klassisk bil', 'klassiske-biler', 0.9),
  ('oldtimer',     'klassiske-biler', 0.9),
  ('tuning',       'tuning',          0.9),
  ('supercar',     'tuning',          0.85),
  ('elbil',        'elbiler',         0.9),
  ('tesla',        'elbiler',         0.85),
  ('autocamper',   'autocamper',      0.95),
  ('roadtrip',     'roadtrip-bil',    0.85),
  ('enduro',       'enduro',          0.95),
  ('scooter',      'scooter',         0.85),
  ('båd',          'båd',             0.85),
  ('speedbåd',     'speedbåd',        0.9),
  ('jetski',       'jetski',          0.9),
  ('sejlads',      'sejlads-sport',   0.85),

  -- Musik-specifik
  ('koncert',      'koncerter',       0.95),
  ('concert',      'koncerter',       0.9),
  ('live musik',   'koncerter',       0.9),
  ('rock',         'rock-metal',      0.8),
  ('metal',        'rock-metal',      0.85),
  ('punk',         'rock-metal',      0.8),
  ('pop',          'pop-mainstream',  0.75),
  ('hiphop',       'hiphop-rap',      0.9),
  ('hip-hop',      'hiphop-rap',      0.9),
  ('rap',          'hiphop-rap',      0.8),
  ('jazz',         'jazz-blues',      0.9),
  ('blues',        'jazz-blues',      0.85),
  ('elektronisk',  'elektronisk-musik', 0.85),
  ('techno',       'elektronisk-musik', 0.9),
  ('house',        'elektronisk-musik', 0.8),
  ('dj',           'elektronisk-musik', 0.75),
  ('klassisk musik','klassisk-musik', 0.95),
  ('orkester',     'klassisk-musik',  0.9),
  ('symfoni',      'klassisk-musik',  0.95),
  ('opera',        'opera',           0.95),
  ('kor',          'kor-sang',        0.85),
  ('festival',     'musikfestival',   0.7),

  -- Sport/Motion
  ('fodbold',      'fodbold',         0.95),
  ('football',     'fodbold',         0.85),
  ('hockey',       'ishockey',        0.9),
  ('ishockey',     'ishockey',        0.95),
  ('basketball',   'basketball',      0.95),
  ('håndbold',     'håndbold',        0.95),
  ('tennis',       'tennis',          0.95),
  ('løb',          'løb',             0.85),
  ('marathon',     'marathon',        0.95),
  ('halvmarathon', 'marathon',        0.9),
  ('cykling',      'cykling',         0.9),
  ('cykelløb',     'cykling',         0.95),
  ('mountainbike', 'mountainbike',    0.95),
  ('mtb',          'mountainbike',    0.9),
  ('triathlon',    'triathlon',       0.95),
  ('svømning',     'svømning',        0.9),
  ('yoga',         'yoga',            0.9),
  ('crossfit',     'crossfit',        0.9),
  ('fitness',      'fitness-center',  0.7),

  -- Kultur
  ('teater',       'teater-drama',    0.95),
  ('theater',      'teater-drama',    0.9),
  ('comedy',       'comedy-improv',   0.9),
  ('standup',      'comedy-improv',   0.95),
  ('stand-up',     'comedy-improv',   0.95),
  ('improv',       'comedy-improv',   0.9),
  ('museum',       'museer',          0.9),
  ('udstilling',   'udstillinger',    0.9),
  ('galleri',      'gallerier',       0.9),
  ('dans',         'dans-performance', 0.85),
  ('ballet',       'dans-performance', 0.95),
  ('film',         'film-visning',    0.75),
  ('biograf',      'film-visning',    0.9),

  -- Natur/Outdoor
  ('vandring',     'vandring',        0.95),
  ('hiking',       'vandring',        0.95),
  ('camping',      'camping',         0.9),
  ('fiskeri',      'fiskeri',         0.9),
  ('lystfiskeri',  'fiskeri',         0.95),
  ('kano',         'kano-kajak',      0.9),
  ('kajak',        'kano-kajak',      0.9),
  ('surfing',      'surfing',         0.9),
  ('klatring',     'klatring',        0.9),
  ('climbing',     'klatring',        0.85),
  ('ridning',      'ridning',         0.9),
  ('hest',         'ridning',         0.85),

  -- Børn/Familie
  ('børn',         'børn-aktiviteter', 0.85),
  ('familie',      'familie-oplevelser', 0.8),
  ('zoo',          'dyrehaver',       0.9),
  ('dyrepark',     'dyrehaver',       0.9),
  ('tivoli',       'forlystelsespark', 0.95),
  ('legoland',     'forlystelsespark', 0.95),

  -- Mad/Drikke
  ('madfestival',  'madfestival',     0.95),
  ('street food',  'street-food',     0.95),
  ('vin',          'vin-smagning',    0.8),
  ('øl',           'øl-bryggeri',     0.75),
  ('cocktail',     'cocktails',       0.85),
  ('gastronomi',   'madlavning',      0.9),

  -- Sundhed/Wellness
  ('meditation',   'meditation',      0.9),
  ('mindfulness',  'meditation',      0.85),
  ('spa',          'spa-wellness',    0.9),
  ('wellness',     'spa-wellness',    0.85),

  -- Gaming/Tech
  ('gaming',       'gaming',          0.9),
  ('esport',       'esport',          0.9),
  ('e-sport',      'esport',          0.9),
  ('lan',          'gaming',          0.85),
  ('hackathon',    'kodning',         0.9)
;

-- Run keyword matching against event titles
INSERT INTO event_tags_normalized (event_id, tag_id, source, confidence)
SELECT DISTINCT
  e.id,
  tn.id,
  'auto-keyword',
  kt.confidence
FROM events e
JOIN keyword_to_tag kt ON lower(e.title) LIKE '%' || kt.keyword || '%'
JOIN tags_normalized tn ON tn.slug = kt.tag_slug
ON CONFLICT (event_id, tag_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- STEP 6: Migrate existing interest_tags array → junction table
-- Maps the raw interest_tags strings to tags_normalized via aliases
-- ═══════════════════════════════════════════════════════════════════

-- Direct slug match: interest_tag matches tags_normalized.slug exactly
INSERT INTO event_tags_normalized (event_id, tag_id, source, confidence)
SELECT DISTINCT
  e.id,
  tn.id,
  'migrate-direct',
  1.0
FROM events e,
  unnest(e.interest_tags) AS tag_str
JOIN tags_normalized tn ON lower(tn.slug) = lower(tag_str)
WHERE e.interest_tags IS NOT NULL
  AND array_length(e.interest_tags, 1) > 0
ON CONFLICT (event_id, tag_id) DO NOTHING;

-- Alias match: interest_tag matches a tag_alias → resolve to canonical
INSERT INTO event_tags_normalized (event_id, tag_id, source, confidence)
SELECT DISTINCT
  e.id,
  tn.id,
  'migrate-alias',
  0.85
FROM events e,
  unnest(e.interest_tags) AS tag_str
JOIN tag_aliases ta ON lower(ta.alias) = lower(tag_str)
JOIN tags_normalized tn ON lower(tn.slug) = lower(ta.canonical)
WHERE e.interest_tags IS NOT NULL
  AND array_length(e.interest_tags, 1) > 0
ON CONFLICT (event_id, tag_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- STEP 7: AUTO-TAG PLACES — main_categories → L1 mapping
-- ═══════════════════════════════════════════════════════════════════

CREATE TEMP TABLE place_cat_to_l1 (cat text, l1_slug text);
INSERT INTO place_cat_to_l1 VALUES
  ('natur',          'natur-outdoor'),
  ('aktiv_sport',    'motion-fitness'),
  ('kultur',         'kultur-kunst'),
  ('underholdning',  'social-hobby'),
  ('overnatning',    'rejser-eventyr'),
  ('familie',        'børn-familie'),
  ('natteliv',       'mad-drikke');

-- Map main_categories array to L1 tags
INSERT INTO place_tags (place_id, tag_id, source, confidence)
SELECT DISTINCT
  p.id,
  tn.id,
  'auto-main-cat',
  0.9
FROM places p,
  unnest(p.main_categories) AS cat_str
JOIN place_cat_to_l1 pc ON lower(pc.cat) = lower(cat_str)
JOIN tags_normalized tn ON tn.slug = pc.l1_slug AND tn.level = 1
WHERE p.main_categories IS NOT NULL
  AND array_length(p.main_categories, 1) > 0
ON CONFLICT (place_id, tag_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- STEP 8: AUTO-TAG PLACES — smart_tags → L2/L3 mapping
-- ═══════════════════════════════════════════════════════════════════

CREATE TEMP TABLE smart_tag_to_slug (smart text, tag_slug text, conf real);
INSERT INTO smart_tag_to_slug VALUES
  ('NATUR',              'natur-outdoor',      0.95),
  ('CAMPING',            'camping',            0.95),
  ('KULTUR',             'kultur-kunst',       0.9),
  ('KONCERT',            'koncerter',          0.9),
  ('SPORT',              'motion-fitness',     0.85),
  ('AKTIV_SPORT',        'motion-fitness',     0.9),
  ('RUTE',               'vandring',           0.8),
  ('HIKING',             'vandring',           0.95),
  ('RIDNING',            'ridning',            0.95),
  ('FAMILIE',            'børn-familie',       0.85),
  ('FORLYSTELSESPARK',   'forlystelsespark',   0.95),
  ('UNDERHOLDNING',      'social-hobby',       0.8),
  ('ZOO',                'dyrehaver',          0.95),
  ('STRAND',             'strand-kyst',        0.9),
  ('SO',                 'søer',               0.9),
  ('SHELTER',            'camping',            0.85),
  ('FRILUFTSLIV',        'natur-outdoor',      0.9),
  ('NATTELIV',           'natklubber',         0.85),
  ('BAR',                'barer',              0.9),
  ('KLUB',               'natklubber',         0.85),
  ('MUSEUM',             'museer',             0.95),
  ('GALLERI',            'gallerier',          0.95),
  ('TEATER',             'teater-drama',       0.95),
  ('RESTAURANT',         'restauranter',       0.9),
  ('CAFÉ',               'caféer',             0.9),
  ('SVØMNING',           'svømning',           0.9),
  ('GOLF',               'golf',               0.95),
  ('TENNIS',             'tennis',             0.95),
  ('KLATRING',           'klatring',           0.95),
  ('SURFING',            'surfing',            0.95),
  ('FISKERI',            'fiskeri',            0.95),
  ('KAJAK',              'kano-kajak',         0.95),
  ('SKI',                'ski-snowboard',      0.95),
  ('SKATEBOARD',         'skateboard',         0.95);

-- Map smart_tags array to tags
INSERT INTO place_tags (place_id, tag_id, source, confidence)
SELECT DISTINCT
  p.id,
  tn.id,
  'auto-smart-tag',
  st.conf
FROM places p,
  unnest(p.smart_tags) AS smart_str
JOIN smart_tag_to_slug st ON upper(st.smart) = upper(smart_str)
JOIN tags_normalized tn ON tn.slug = st.tag_slug
WHERE p.smart_tags IS NOT NULL
  AND array_length(p.smart_tags, 1) > 0
ON CONFLICT (place_id, tag_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- STEP 9: AUTO-TAG PLACES — existing tags array → place_tags
-- Direct mapping from places.tags to tags_normalized
-- ═══════════════════════════════════════════════════════════════════

-- Direct slug match
INSERT INTO place_tags (place_id, tag_id, source, confidence)
SELECT DISTINCT
  p.id,
  tn.id,
  'migrate-tags',
  0.85
FROM places p,
  unnest(p.tags) AS tag_str
JOIN tags_normalized tn ON lower(tn.slug) = lower(tag_str)
WHERE p.tags IS NOT NULL
  AND array_length(p.tags, 1) > 0
ON CONFLICT (place_id, tag_id) DO NOTHING;

-- Alias match for places.tags
INSERT INTO place_tags (place_id, tag_id, source, confidence)
SELECT DISTINCT
  p.id,
  tn.id,
  'migrate-tags-alias',
  0.75
FROM places p,
  unnest(p.tags) AS tag_str
JOIN tag_aliases ta ON lower(ta.alias) = lower(tag_str)
JOIN tags_normalized tn ON lower(tn.slug) = lower(ta.canonical)
WHERE p.tags IS NOT NULL
  AND array_length(p.tags, 1) > 0
ON CONFLICT (place_id, tag_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- STEP 10: AUTO-TAG PLACES — Name/description keyword matching
-- Finds motor/bil/MC places from names
-- ═══════════════════════════════════════════════════════════════════

CREATE TEMP TABLE place_keyword_to_tag (keyword text, tag_slug text, conf real);
INSERT INTO place_keyword_to_tag VALUES
  -- Motor-steder
  ('racerbane',    'circuit-racing',  0.95),
  ('gokartbane',   'karting-aktiv',   0.95),
  ('go-kart',      'karting-aktiv',   0.95),
  ('kartbane',     'karting-aktiv',   0.95),
  ('bilmuseum',    'klassiske-biler', 0.9),
  ('automuseum',   'klassiske-biler', 0.9),
  ('mc-klub',      'mc-klub',         0.95),
  ('motorcykel',   'motorcykler',     0.9),
  ('bilværksted',  'biler',           0.8),
  ('tankstation',  'biler',           0.7),
  ('ladestation',  'elbiler',         0.9),
  ('marina',       'båd',             0.9),
  ('havn',         'båd',             0.75),
  ('lystbådehavn', 'båd',             0.95),
  ('bådklub',      'båd',             0.95),
  ('sejlklub',     'sejlads-sport',   0.95),

  -- Sport-steder
  ('stadion',      'motion-fitness',  0.85),
  ('svømmehal',    'svømning',        0.95),
  ('tennisbane',   'tennis',          0.95),
  ('golfbane',     'golf',            0.95),
  ('golfklub',     'golf',            0.95),
  ('rideskole',    'ridning',         0.95),
  ('ridecenter',   'ridning',         0.95),
  ('rideklub',     'ridning',         0.95),
  ('skatepark',    'skateboard',      0.95),
  ('klatrehal',    'klatring',        0.95),
  ('boulderhal',   'klatring',        0.95),
  ('fitnesscenter','fitness-center',  0.95),
  ('løbeklub',     'løb',             0.9),
  ('cykelklub',    'cykling',         0.9),

  -- Kultur-steder
  ('museum',       'museer',          0.9),
  ('teater',       'teater-drama',    0.9),
  ('biograf',      'film-visning',    0.9),
  ('spillested',   'koncerter',       0.9),
  ('koncertsal',   'koncerter',       0.95),
  ('galleri',      'gallerier',       0.9),

  -- Natur
  ('strand',       'strand-kyst',     0.85),
  ('skov',         'skove',           0.8),
  ('park',         'parker',          0.7),
  ('naturcenter',  'natur-outdoor',   0.9),
  ('shelter',      'camping',         0.85),
  ('campingplads', 'camping',         0.95),

  -- Mad/Drikke
  ('restaurant',   'restauranter',    0.85),
  ('café',         'caféer',          0.85),
  ('bryggeri',     'øl-bryggeri',     0.95),
  ('vingård',      'vin-smagning',    0.95);

-- Map place names to tags via keywords
INSERT INTO place_tags (place_id, tag_id, source, confidence)
SELECT DISTINCT
  p.id,
  tn.id,
  'auto-name-keyword',
  pk.conf
FROM places p
JOIN place_keyword_to_tag pk ON lower(p.name) LIKE '%' || pk.keyword || '%'
JOIN tags_normalized tn ON tn.slug = pk.tag_slug
ON CONFLICT (place_id, tag_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- STEP 11: Ensure parent tags are applied (cascade up)
-- If an event has an L3 tag, it should also have its L2 and L1 parent
-- ═══════════════════════════════════════════════════════════════════

-- Add L2 parent for all L3 event tags
INSERT INTO event_tags_normalized (event_id, tag_id, source, confidence)
SELECT DISTINCT
  etn.event_id,
  parent.id,
  'auto-cascade-l2',
  0.8
FROM event_tags_normalized etn
JOIN tags_normalized child ON child.id = etn.tag_id AND child.level = 3
JOIN tags_normalized parent ON parent.id = child.parent_id AND parent.level = 2
ON CONFLICT (event_id, tag_id) DO NOTHING;

-- Add L1 parent for all L2 event tags
INSERT INTO event_tags_normalized (event_id, tag_id, source, confidence)
SELECT DISTINCT
  etn.event_id,
  parent.id,
  'auto-cascade-l1',
  0.7
FROM event_tags_normalized etn
JOIN tags_normalized child ON child.id = etn.tag_id AND child.level = 2
JOIN tags_normalized parent ON parent.id = child.parent_id AND parent.level = 1
ON CONFLICT (event_id, tag_id) DO NOTHING;

-- Same cascading for places
INSERT INTO place_tags (place_id, tag_id, source, confidence)
SELECT DISTINCT
  pt.place_id,
  parent.id,
  'auto-cascade-l2',
  0.8
FROM place_tags pt
JOIN tags_normalized child ON child.id = pt.tag_id AND child.level = 3
JOIN tags_normalized parent ON parent.id = child.parent_id AND parent.level = 2
ON CONFLICT (place_id, tag_id) DO NOTHING;

INSERT INTO place_tags (place_id, tag_id, source, confidence)
SELECT DISTINCT
  pt.place_id,
  parent.id,
  'auto-cascade-l1',
  0.7
FROM place_tags pt
JOIN tags_normalized child ON child.id = pt.tag_id AND child.level = 2
JOIN tags_normalized parent ON parent.id = child.parent_id AND parent.level = 1
ON CONFLICT (place_id, tag_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- STEP 12: Create useful views for the frontend
-- ═══════════════════════════════════════════════════════════════════

-- View: event with all its tag slugs (for filtering)
CREATE OR REPLACE VIEW event_tag_slugs AS
SELECT
  etn.event_id,
  tn.slug,
  tn.name,
  tn.level,
  tn.emoji,
  etn.confidence
FROM event_tags_normalized etn
JOIN tags_normalized tn ON tn.id = etn.tag_id;

-- View: place with all its tag slugs (for filtering)
CREATE OR REPLACE VIEW place_tag_slugs AS
SELECT
  pt.place_id,
  tn.slug,
  tn.name,
  tn.level,
  tn.emoji,
  pt.confidence
FROM place_tags pt
JOIN tags_normalized tn ON tn.id = pt.tag_id;

-- View: tag usage counts (events + places combined)
CREATE OR REPLACE VIEW tag_usage_counts AS
SELECT
  tn.id,
  tn.slug,
  tn.name,
  tn.emoji,
  tn.level,
  COALESCE(ec.event_count, 0) AS event_count,
  COALESCE(pc.place_count, 0) AS place_count,
  COALESCE(ec.event_count, 0) + COALESCE(pc.place_count, 0) AS total_count
FROM tags_normalized tn
LEFT JOIN (
  SELECT tag_id, COUNT(*) AS event_count
  FROM event_tags_normalized
  GROUP BY tag_id
) ec ON ec.tag_id = tn.id
LEFT JOIN (
  SELECT tag_id, COUNT(*) AS place_count
  FROM place_tags
  GROUP BY tag_id
) pc ON pc.tag_id = tn.id
ORDER BY total_count DESC;


-- ═══════════════════════════════════════════════════════════════════
-- STEP 13: Helper function for tag resolution (alias-aware)
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION resolve_tag(input_tag text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result_id uuid;
  canonical_slug text;
BEGIN
  -- Try direct match first
  SELECT id INTO result_id
  FROM tags_normalized
  WHERE lower(slug) = lower(input_tag)
  LIMIT 1;

  IF result_id IS NOT NULL THEN
    RETURN result_id;
  END IF;

  -- Try alias resolution
  SELECT ta.canonical INTO canonical_slug
  FROM tag_aliases ta
  WHERE lower(ta.alias) = lower(input_tag)
  LIMIT 1;

  IF canonical_slug IS NOT NULL THEN
    SELECT id INTO result_id
    FROM tags_normalized
    WHERE lower(slug) = lower(canonical_slug)
    LIMIT 1;
  END IF;

  RETURN result_id;
END;
$$;


-- ═══════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (run after migration to check results)
-- ═══════════════════════════════════════════════════════════════════

-- These are SELECT queries you can run to verify:

-- Total event tags created
-- SELECT COUNT(*) AS total_event_tags FROM event_tags_normalized;

-- Total place tags created
-- SELECT COUNT(*) AS total_place_tags FROM place_tags;

-- Events tagged by source
-- SELECT source, COUNT(*) FROM event_tags_normalized GROUP BY source ORDER BY count DESC;

-- Places tagged by source
-- SELECT source, COUNT(*) FROM place_tags GROUP BY source ORDER BY count DESC;

-- Motor-tagged events
-- SELECT COUNT(DISTINCT etn.event_id) FROM event_tags_normalized etn
-- JOIN tags_normalized tn ON tn.id = etn.tag_id
-- WHERE tn.slug LIKE 'motor%' OR tn.slug IN ('biler','motorcykler','motorsport-aktiv','vandfartøjer',
--   'bil-show','circuit-racing','drifting','karting-aktiv','rally-aktiv','tuning','elbiler',
--   'klassiske-biler','mc-klub','mc-tur','enduro','custom-mc','scooter','båd','jetski','speedbåd','sejlads-sport');

-- Motor-tagged places
-- SELECT COUNT(DISTINCT pt.place_id) FROM place_tags pt
-- JOIN tags_normalized tn ON tn.id = pt.tag_id
-- WHERE tn.slug LIKE 'motor%' OR tn.slug IN ('biler','motorcykler','motorsport-aktiv','vandfartøjer',
--   'bil-show','circuit-racing','drifting','karting-aktiv','rally-aktiv','tuning','elbiler',
--   'klassiske-biler','mc-klub','mc-tur','enduro','custom-mc','scooter','båd','jetski','speedbåd','sejlads-sport');

-- Top 20 most-used tags
-- SELECT slug, name, event_count, place_count, total_count
-- FROM tag_usage_counts
-- ORDER BY total_count DESC
-- LIMIT 20;

-- Tag aliases count
-- SELECT COUNT(*) AS total_aliases FROM tag_aliases;
