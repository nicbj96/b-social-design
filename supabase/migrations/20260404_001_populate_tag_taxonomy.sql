-- ═══════════════════════════════════════════════
-- B-Social: Populate tag_categories + tags_normalized
-- Generated from tagTree.ts (2026-04-04)
-- ═══════════════════════════════════════════════

BEGIN;

-- Clear existing data
DELETE FROM public.event_tags_normalized;
DELETE FROM public.user_tags_normalized;
DELETE FROM public.tags_normalized;
DELETE FROM public.tag_categories;

-- ══════════════════════════════════════
-- LEVEL 1: tag_categories (OVERKATEGORIER)
-- ══════════════════════════════════════
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('motion-fitness', 'Motion & Fitness', '🏃', 1);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('sport-tilskuer', 'Sport (tilskuer)', '🏟️', 2);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('musik-lyd', 'Musik & Lyd', '🎵', 3);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('kultur-kunst', 'Kultur & Kunst', '🎨', 4);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('natur-outdoor', 'Natur & Outdoor', '🌲', 5);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('mad-drikke', 'Mad & Drikke', '🍽️', 6);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('social-hobby', 'Social & Hobby', '👋', 7);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('gaming-tech', 'Gaming & Tech', '🎮', 8);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('rejser-eventyr', 'Rejser & Eventyr', '✈️', 9);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('sundhed-wellness', 'Sundhed & Wellness', '🧘', 10);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('mode-skønhed', 'Mode & Skønhed', '👗', 11);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('dyr-natur', 'Dyr & Natur', '🐾', 12);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('motor-køretøjer', 'Motor & Køretøjer', '🚗', 13);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('videnskab-læring', 'Videnskab & Læring', '🔬', 14);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('børn-familie', 'Børn & Familie', '👨‍👩‍👧‍👦', 15);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('frivilligt-community', 'Frivilligt & Community', '🤝', 16);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('business-networking', 'Business & Networking', '💼', 17);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('film-medier', 'Film & Medier', '🎬', 18);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('romantik-dating', 'Romantik & Dating', '💕', 19);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('læring-udvikling', 'Læring & Udvikling', '📚', 20);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('spiritualitet-livssyn', 'Spiritualitet & Livssyn', '🙏', 21);
INSERT INTO public.tag_categories (slug, name, emoji, sort_order) VALUES ('have-håndværk', 'Have & Håndværk', '🌱', 22);

-- ══════════════════════════════════════
-- LEVEL 1-3: tags_normalized (full hierarchy)
-- ══════════════════════════════════════

-- ── 🏃 Motion & Fitness ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('motion-fitness', 'Motion & Fitness', '🏃', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('løb', 'Løb', '🏃', (SELECT id FROM public.tags_normalized WHERE slug = 'motion-fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('maraton', 'Maraton', '🏅', (SELECT id FROM public.tags_normalized WHERE slug = 'løb'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('trailløb', 'Trailløb', '🌲', (SELECT id FROM public.tags_normalized WHERE slug = 'løb'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('halvmaraton', 'Halvmaraton', '🥈', (SELECT id FROM public.tags_normalized WHERE slug = 'løb'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('5k', '5K', '🎯', (SELECT id FROM public.tags_normalized WHERE slug = 'løb'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('intervalløb', 'Intervalløb', '⚡', (SELECT id FROM public.tags_normalized WHERE slug = 'løb'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('parkrun', 'Parkrun', '🌳', (SELECT id FROM public.tags_normalized WHERE slug = 'løb'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('crossfit-løb', 'CrossFit', '🔥', (SELECT id FROM public.tags_normalized WHERE slug = 'løb'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ultraløb', 'Ultraløb', '🏔️', (SELECT id FROM public.tags_normalized WHERE slug = 'løb'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('10k', '10K', '🎖️', (SELECT id FROM public.tags_normalized WHERE slug = 'løb'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cykling', 'Cykling', '🚴', (SELECT id FROM public.tags_normalized WHERE slug = 'motion-fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('racercykling', 'Racercykling', '🏎️', (SELECT id FROM public.tags_normalized WHERE slug = 'cykling'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mtb', 'Mountainbike', '🚵', (SELECT id FROM public.tags_normalized WHERE slug = 'cykling'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('e-mtb', 'E-MTB', '⚡', (SELECT id FROM public.tags_normalized WHERE slug = 'cykling'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('gravel', 'Gravel', '🛤️', (SELECT id FROM public.tags_normalized WHERE slug = 'cykling'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('landevejscykling', 'Landevejscykling', '🛣️', (SELECT id FROM public.tags_normalized WHERE slug = 'cykling'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bmx', 'BMX', '🤸', (SELECT id FROM public.tags_normalized WHERE slug = 'cykling'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('singletrack', 'Singletrack', '🌲', (SELECT id FROM public.tags_normalized WHERE slug = 'cykling'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cykelløb', 'Cykelløb', '🏁', (SELECT id FROM public.tags_normalized WHERE slug = 'cykling'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ebike', 'E-cykel', '⚡', (SELECT id FROM public.tags_normalized WHERE slug = 'cykling'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bycykling', 'Bycykling', '🚲', (SELECT id FROM public.tags_normalized WHERE slug = 'cykling'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bold', 'Bold', '⚽', (SELECT id FROM public.tags_normalized WHERE slug = 'motion-fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fodbold', 'Fodbold', '⚽', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('basketball', 'Basketball', '🏀', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('volleyball', 'Volleyball', '🏐', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tennis', 'Tennis', '🎾', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('håndbold', 'Håndbold', '🤾', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('padel', 'Padel', '🏓', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('badminton', 'Badminton', '🏸', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('pickleball', 'Pickleball', '🏓', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('squash', 'Squash', '🎾', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bordtennis', 'Bordtennis', '🏓', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rugby', 'Rugby', '🏉', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('amerikansk-fodbold', 'Amerikansk fodbold', '🏈', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cricket', 'Cricket', '🏏', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hockey', 'Hockey', '🏒', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('disc-golf', 'Disc Golf', '🥏', (SELECT id FROM public.tags_normalized WHERE slug = 'bold'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('svømning', 'Svømning', '🏊', (SELECT id FROM public.tags_normalized WHERE slug = 'motion-fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('frisvømning', 'Frisvømning', '🏊', (SELECT id FROM public.tags_normalized WHERE slug = 'svømning'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('havsvømning', 'Havsvømning', '🌊', (SELECT id FROM public.tags_normalized WHERE slug = 'svømning'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('havnebad', 'Havnebad', '🚿', (SELECT id FROM public.tags_normalized WHERE slug = 'svømning'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vinterbadning', 'Vinterbadning', '🥶', (SELECT id FROM public.tags_normalized WHERE slug = 'svømning'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('svømmestævne', 'Svømmestævne', '🏅', (SELECT id FROM public.tags_normalized WHERE slug = 'svømning'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('svømmeskole', 'Svømmeskole', '🎓', (SELECT id FROM public.tags_normalized WHERE slug = 'svømning'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fitness', 'Fitness', '💪', (SELECT id FROM public.tags_normalized WHERE slug = 'motion-fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('styrketræning', 'Styrketræning', '🏋️', (SELECT id FROM public.tags_normalized WHERE slug = 'fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('crossfit', 'CrossFit', '🔥', (SELECT id FROM public.tags_normalized WHERE slug = 'fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('calisthenics', 'Calisthenics', '🤸', (SELECT id FROM public.tags_normalized WHERE slug = 'fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('udendørs-fitness', 'Udendørs fitness', '🌳', (SELECT id FROM public.tags_normalized WHERE slug = 'fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hiit', 'HIIT', '⚡', (SELECT id FROM public.tags_normalized WHERE slug = 'fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('pilates', 'Pilates', '🧘', (SELECT id FROM public.tags_normalized WHERE slug = 'fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('funktionstræning', 'Funktionstræning', '🏋️', (SELECT id FROM public.tags_normalized WHERE slug = 'fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bootcamp', 'Bootcamp', '🪖', (SELECT id FROM public.tags_normalized WHERE slug = 'fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('aerobic', 'Aerobic', '💃', (SELECT id FROM public.tags_normalized WHERE slug = 'fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('triathlon', 'Triathlon', '🏅', (SELECT id FROM public.tags_normalized WHERE slug = 'fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kampsport', 'Kampsport', '🥊', (SELECT id FROM public.tags_normalized WHERE slug = 'motion-fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('boksning', 'Boksning', '🥊', (SELECT id FROM public.tags_normalized WHERE slug = 'kampsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mma', 'MMA', '🤼', (SELECT id FROM public.tags_normalized WHERE slug = 'kampsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('jiu-jitsu', 'Jiu-Jitsu', '🥋', (SELECT id FROM public.tags_normalized WHERE slug = 'kampsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('karate', 'Karate', '🥋', (SELECT id FROM public.tags_normalized WHERE slug = 'kampsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('taekwondo', 'Taekwondo', '🦶', (SELECT id FROM public.tags_normalized WHERE slug = 'kampsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kickboxing', 'Kickboxing', '🦵', (SELECT id FROM public.tags_normalized WHERE slug = 'kampsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('wrestling', 'Wrestling', '🤼', (SELECT id FROM public.tags_normalized WHERE slug = 'kampsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('judo', 'Judo', '🥋', (SELECT id FROM public.tags_normalized WHERE slug = 'kampsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kung-fu', 'Kung Fu', '🥋', (SELECT id FROM public.tags_normalized WHERE slug = 'kampsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vandsport', 'Vandsport', '🌊', (SELECT id FROM public.tags_normalized WHERE slug = 'motion-fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('surfing', 'Surfing', '🏄', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sup', 'SUP', '🚣', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kajak', 'Kajak', '🚣', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kano', 'Kano', '🛶', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sejlads', 'Sejlads', '⛵', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('wakeboard', 'Wakeboard', '🏄', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dykning', 'Dykning', '🤿', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kitesurfing', 'Kitesurfing', '🪁', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('snorkling', 'Snorkling', '🤿', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('windsurfing', 'Windsurfing', '🌊', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('roning', 'Roning', '🚣', (SELECT id FROM public.tags_normalized WHERE slug = 'vandsport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ekstrem-sport', 'Ekstremsport', '🪂', (SELECT id FROM public.tags_normalized WHERE slug = 'motion-fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('parkour', 'Parkour', '🏙️', (SELECT id FROM public.tags_normalized WHERE slug = 'ekstrem-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('skateboarding', 'Skateboarding', '🛹', (SELECT id FROM public.tags_normalized WHERE slug = 'ekstrem-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fægtning', 'Fægtning', '🤺', (SELECT id FROM public.tags_normalized WHERE slug = 'ekstrem-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bueskydning', 'Bueskydning', '🏹', (SELECT id FROM public.tags_normalized WHERE slug = 'ekstrem-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('orientering', 'Orientering', '🗺️', (SELECT id FROM public.tags_normalized WHERE slug = 'ekstrem-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('faldskærm', 'Faldskærm', '🪂', (SELECT id FROM public.tags_normalized WHERE slug = 'ekstrem-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('klatring-sport', 'Klatring', '🧗', (SELECT id FROM public.tags_normalized WHERE slug = 'ekstrem-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bouldering', 'Bouldering', '🪨', (SELECT id FROM public.tags_normalized WHERE slug = 'ekstrem-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vinter-sport', 'Vintersport', '⛷️', (SELECT id FROM public.tags_normalized WHERE slug = 'motion-fitness'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('skiløb', 'Skiløb', '⛷️', (SELECT id FROM public.tags_normalized WHERE slug = 'vinter-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('snowboard', 'Snowboard', '🏂', (SELECT id FROM public.tags_normalized WHERE slug = 'vinter-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('langrend', 'Langrend', '🎿', (SELECT id FROM public.tags_normalized WHERE slug = 'vinter-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('piste', 'Piste', '⛷️', (SELECT id FROM public.tags_normalized WHERE slug = 'vinter-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('curling', 'Curling', '🥌', (SELECT id FROM public.tags_normalized WHERE slug = 'vinter-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('skøjteløb', 'Skøjteløb', '⛸️', (SELECT id FROM public.tags_normalized WHERE slug = 'vinter-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('inline-skating', 'Inline skating', '🛼', (SELECT id FROM public.tags_normalized WHERE slug = 'vinter-sport'), (SELECT id FROM public.tag_categories WHERE slug = 'motion-fitness'), 3);

-- ── 🏟️ Sport (tilskuer) ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sport-tilskuer', 'Sport (tilskuer)', '🏟️', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fodbold-tilskuer', 'Fodbold', '⚽', (SELECT id FROM public.tags_normalized WHERE slug = 'sport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('superliga', 'Superliga', '🏆', (SELECT id FROM public.tags_normalized WHERE slug = 'fodbold-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('champions-league', 'Champions League', '⭐', (SELECT id FROM public.tags_normalized WHERE slug = 'fodbold-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vm-fodbold', 'VM', '🌍', (SELECT id FROM public.tags_normalized WHERE slug = 'fodbold-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('em-fodbold', 'EM', '🇪🇺', (SELECT id FROM public.tags_normalized WHERE slug = 'fodbold-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lokal-fodbold', 'Lokalfodbold', '🏘️', (SELECT id FROM public.tags_normalized WHERE slug = 'fodbold-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('motorsport-tilskuer', 'Motorsport', '🏎️', (SELECT id FROM public.tags_normalized WHERE slug = 'sport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('formel1', 'Formel 1', '🏎️', (SELECT id FROM public.tags_normalized WHERE slug = 'motorsport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rally', 'Rally', '🚗', (SELECT id FROM public.tags_normalized WHERE slug = 'motorsport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dtm', 'DTM', '🚙', (SELECT id FROM public.tags_normalized WHERE slug = 'motorsport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('motocross', 'Motocross', '🏍️', (SELECT id FROM public.tags_normalized WHERE slug = 'motorsport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('karting', 'Karting', '🏎️', (SELECT id FROM public.tags_normalized WHERE slug = 'motorsport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cykelsport-tilskuer', 'Cykelsport', '🚴', (SELECT id FROM public.tags_normalized WHERE slug = 'sport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tour-de-france', 'Tour de France', '🇫🇷', (SELECT id FROM public.tags_normalized WHERE slug = 'cykelsport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('paris-roubaix', 'Paris-Roubaix', '🏆', (SELECT id FROM public.tags_normalized WHERE slug = 'cykelsport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cykling-dm', 'DM Cykling', '🇩🇰', (SELECT id FROM public.tags_normalized WHERE slug = 'cykelsport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('andre-sportsgrene', 'Andre sportsgrene', '🥇', (SELECT id FROM public.tags_normalized WHERE slug = 'sport-tilskuer'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('håndbold-tilskuer', 'Håndbold', '🤾', (SELECT id FROM public.tags_normalized WHERE slug = 'andre-sportsgrene'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('basketball-tilskuer', 'Basketball', '🏀', (SELECT id FROM public.tags_normalized WHERE slug = 'andre-sportsgrene'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tennis-tilskuer', 'Tennis', '🎾', (SELECT id FROM public.tags_normalized WHERE slug = 'andre-sportsgrene'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('boksning-tilskuer', 'Boksning', '🥊', (SELECT id FROM public.tags_normalized WHERE slug = 'andre-sportsgrene'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('esport-tilskuer', 'Esport', '🎮', (SELECT id FROM public.tags_normalized WHERE slug = 'andre-sportsgrene'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('atletik', 'Atletik', '🏃', (SELECT id FROM public.tags_normalized WHERE slug = 'andre-sportsgrene'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('svømning-stævne', 'Svømmestævne', '🏊', (SELECT id FROM public.tags_normalized WHERE slug = 'andre-sportsgrene'), (SELECT id FROM public.tag_categories WHERE slug = 'sport-tilskuer'), 3);

-- ── 🎵 Musik & Lyd ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('musik-lyd', 'Musik & Lyd', '🎵', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('koncert', 'Koncert', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-lyd'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rock', 'Rock', '🎸', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('pop', 'Pop', '🎶', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('jazz', 'Jazz', '🎷', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('klassisk-musik', 'Klassisk', '🎻', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('metal', 'Metal', '🤘', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('edm', 'EDM', '🎧', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hip-hop', 'Hip-hop', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('indie', 'Indie', '🎸', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rnb', 'R&B', '🎶', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('reggae', 'Reggae', '🌴', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('soul', 'Soul', '🎼', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('funk', 'Funk', '🕺', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('blues', 'Blues', '🎸', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('country', 'Country', '🤠', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('punk', 'Punk', '🎸', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('grunge', 'Grunge', '🎸', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('techno', 'Techno', '🔊', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('house', 'House', '🏠', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('trance', 'Trance', '🎵', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('drum-and-bass', 'Drum & Bass', '🥁', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dubstep', 'Dubstep', '🔊', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ambient', 'Ambient', '🌌', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lo-fi', 'Lo-Fi', '📻', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('k-pop', 'K-Pop', '🇰🇷', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('j-pop', 'J-Pop', '🇯🇵', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('afrobeats', 'Afrobeats', '🌍', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('latin', 'Latin', '🌶️', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cumbia', 'Cumbia', '💃', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('reggaeton', 'Reggaeton', '🔥', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('folk', 'Folk', '🪕', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('singer-songwriter', 'Singer-Songwriter', '🎵', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('a-capella', 'A Capella', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kor', 'Kor', '🎶', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('electronic', 'Electronic', '🎛️', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('psytrance', 'Psytrance', '🌀', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('goa-trance', 'Goa Trance', '🌀', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('techno', 'Techno', '🎚️', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('house', 'House', '🎛️', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('gospel', 'Gospel', '🙏', (SELECT id FROM public.tags_normalized WHERE slug = 'koncert'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('festival-musik', 'Musikfestival', '🎪', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-lyd'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sommerfestival', 'Sommerfestival', '☀️', (SELECT id FROM public.tags_normalized WHERE slug = 'festival-musik'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vinterfestival', 'Vinterfestival', '❄️', (SELECT id FROM public.tags_normalized WHERE slug = 'festival-musik'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('gadefestival', 'Gadefestival', '🏙️', (SELECT id FROM public.tags_normalized WHERE slug = 'festival-musik'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('klassisk-festival', 'Klassisk festival', '🎻', (SELECT id FROM public.tags_normalized WHERE slug = 'festival-musik'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('jazz-festival', 'Jazzfestival', '🎷', (SELECT id FROM public.tags_normalized WHERE slug = 'festival-musik'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('elektronisk-festival', 'Elektronisk festival', '🎛️', (SELECT id FROM public.tags_normalized WHERE slug = 'festival-musik'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('psytrance-festival', 'Psytrance festival', '🌀', (SELECT id FROM public.tags_normalized WHERE slug = 'festival-musik'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('goa-festival', 'Goa festival', '🌀', (SELECT id FROM public.tags_normalized WHERE slug = 'festival-musik'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('openair', 'Open air', '🌳', (SELECT id FROM public.tags_normalized WHERE slug = 'festival-musik'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ravenight', 'Rave', '🕺', (SELECT id FROM public.tags_normalized WHERE slug = 'festival-musik'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('musik-spille', 'Spille musik', '🎸', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-lyd'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('guitar', 'Guitar', '🎸', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-spille'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('klaver', 'Klaver', '🎹', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-spille'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('trommer', 'Trommer', '🥁', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-spille'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sang', 'Sang', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-spille'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bas', 'Bas', '🎸', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-spille'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('violin', 'Violin', '🎻', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-spille'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dj', 'DJ', '🎛️', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-spille'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('musikproduktion', 'Musikproduktion', '🎚️', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-spille'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('open-mic', 'Open Mic', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-spille'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('jam-session', 'Jam Session', '🎶', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-spille'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dans', 'Dans', '💃', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-lyd'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('salsa', 'Salsa', '💃', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bachata', 'Bachata', '💃', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hip-hop-dans', 'Hip-hop dans', '🕺', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('swing', 'Swing', '🕺', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tango', 'Tango', '💃', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ballet', 'Ballet', '🩰', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('zumba', 'Zumba', '🏋️', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kontaktimprovisation', 'Kontaktimprovisation', '🤝', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lindy-hop', 'Lindy Hop', '🕺', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kizomba', 'Kizomba', '💃', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('flamenco', 'Flamenco', '💃', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('samba', 'Samba', '🌴', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('moderne-dans', 'Moderne dans', '🎭', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('folkloredan', 'Folkloredan', '👘', (SELECT id FROM public.tags_normalized WHERE slug = 'dans'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('podcast-lyd', 'Podcast & Lyd', '🎙️', (SELECT id FROM public.tags_normalized WHERE slug = 'musik-lyd'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('podcast', 'Podcast', '🎙️', (SELECT id FROM public.tags_normalized WHERE slug = 'podcast-lyd'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lydbøger', 'Lydbøger', '🎧', (SELECT id FROM public.tags_normalized WHERE slug = 'podcast-lyd'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('radioshow', 'Radio', '📻', (SELECT id FROM public.tags_normalized WHERE slug = 'podcast-lyd'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('asmr', 'ASMR', '🔇', (SELECT id FROM public.tags_normalized WHERE slug = 'podcast-lyd'), (SELECT id FROM public.tag_categories WHERE slug = 'musik-lyd'), 3);

-- ── 🎨 Kultur & Kunst ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kultur-kunst', 'Kultur & Kunst', '🎨', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('teater', 'Teater', '🎭', (SELECT id FROM public.tags_normalized WHERE slug = 'kultur-kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('drama', 'Drama', '🎭', (SELECT id FROM public.tags_normalized WHERE slug = 'teater'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('komedie', 'Komedie', '😂', (SELECT id FROM public.tags_normalized WHERE slug = 'teater'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('børneteater', 'Børneteater', '🧸', (SELECT id FROM public.tags_normalized WHERE slug = 'teater'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('musical', 'Musical', '🎵', (SELECT id FROM public.tags_normalized WHERE slug = 'teater'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('stand-up', 'Stand-up', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'teater'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('improv', 'Improv', '🎭', (SELECT id FROM public.tags_normalized WHERE slug = 'teater'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('opera', 'Opera', '🎼', (SELECT id FROM public.tags_normalized WHERE slug = 'teater'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kabaret', 'Kabaret', '🌹', (SELECT id FROM public.tags_normalized WHERE slug = 'teater'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kunst', 'Kunst', '🖼️', (SELECT id FROM public.tags_normalized WHERE slug = 'kultur-kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('galleri', 'Galleri', '🖼️', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('museum', 'Museum', '🏛️', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('street-art', 'Street Art', '🎨', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('udstilling', 'Udstilling', '🖼️', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('keramik', 'Keramik', '🏺', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('maleri', 'Maleri', '🖌️', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('skulptur', 'Skulptur', '🗿', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fotografi-kunst', 'Fotografi', '📷', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tegning', 'Tegning', '✏️', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tekstilkunst', 'Tekstilkunst', '🧵', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('digitalt-kunst', 'Digital kunst', '💻', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kunsthåndværk', 'Kunsthåndværk', '✂️', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('graffiti', 'Graffiti', '🎨', (SELECT id FROM public.tags_normalized WHERE slug = 'kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('litteratur', 'Litteratur', '📖', (SELECT id FROM public.tags_normalized WHERE slug = 'kultur-kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bogklub', 'Bogklub', '📚', (SELECT id FROM public.tags_normalized WHERE slug = 'litteratur'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('skrivning', 'Skrivning', '✍️', (SELECT id FROM public.tags_normalized WHERE slug = 'litteratur'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('poesi', 'Poesi', '🌸', (SELECT id FROM public.tags_normalized WHERE slug = 'litteratur'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('forfatter', 'Forfatter', '📝', (SELECT id FROM public.tags_normalized WHERE slug = 'litteratur'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('litteraturfestival', 'Litteraturfestival', '📖', (SELECT id FROM public.tags_normalized WHERE slug = 'litteratur'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('spoken-word', 'Spoken Word', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'litteratur'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('krimier', 'Krimier', '🔍', (SELECT id FROM public.tags_normalized WHERE slug = 'litteratur'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fantasy', 'Fantasy', '🐉', (SELECT id FROM public.tags_normalized WHERE slug = 'litteratur'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kulturevents', 'Kulturevents', '🏛️', (SELECT id FROM public.tags_normalized WHERE slug = 'kultur-kunst'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kulturnat', 'Kulturnat', '🌙', (SELECT id FROM public.tags_normalized WHERE slug = 'kulturevents'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('åben-ateliere', 'Åbne Atelierer', '🎨', (SELECT id FROM public.tags_normalized WHERE slug = 'kulturevents'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kulturfestival', 'Kulturfestival', '🎪', (SELECT id FROM public.tags_normalized WHERE slug = 'kulturevents'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('arkitektur', 'Arkitektur', '🏗️', (SELECT id FROM public.tags_normalized WHERE slug = 'kulturevents'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('design', 'Design', '🖊️', (SELECT id FROM public.tags_normalized WHERE slug = 'kulturevents'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mode-show', 'Modeshow', '👗', (SELECT id FROM public.tags_normalized WHERE slug = 'kulturevents'), (SELECT id FROM public.tag_categories WHERE slug = 'kultur-kunst'), 3);

-- ── 🌲 Natur & Outdoor ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('natur-outdoor', 'Natur & Outdoor', '🌲', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vandring', 'Vandring', '🥾', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-outdoor'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dagture', 'Dagture', '🥾', (SELECT id FROM public.tags_normalized WHERE slug = 'vandring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('flerdag', 'Flerdagsture', '🎒', (SELECT id FROM public.tags_normalized WHERE slug = 'vandring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bjergvandring', 'Bjergvandring', '🏔️', (SELECT id FROM public.tags_normalized WHERE slug = 'vandring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('nationalpark', 'Nationalpark', '🌿', (SELECT id FROM public.tags_normalized WHERE slug = 'vandring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('pilgrimsrute', 'Pilgrimsrute', '🛤️', (SELECT id FROM public.tags_normalized WHERE slug = 'vandring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('klittur', 'Klittur', '🏖️', (SELECT id FROM public.tags_normalized WHERE slug = 'vandring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('skovtur', 'Skovtur', '🌲', (SELECT id FROM public.tags_normalized WHERE slug = 'vandring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('camping', 'Camping', '⛺', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-outdoor'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('shelter', 'Shelter', '🏕️', (SELECT id FROM public.tags_normalized WHERE slug = 'camping'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('telt', 'Telt', '⛺', (SELECT id FROM public.tags_normalized WHERE slug = 'camping'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('autocamping', 'Autocamping', '🚐', (SELECT id FROM public.tags_normalized WHERE slug = 'camping'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('glamping', 'Glamping', '✨', (SELECT id FROM public.tags_normalized WHERE slug = 'camping'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('primitiv-overnatning', 'Primitiv overnatning', '🌲', (SELECT id FROM public.tags_normalized WHERE slug = 'camping'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hammock-camping', 'Hammock Camping', '🌿', (SELECT id FROM public.tags_normalized WHERE slug = 'camping'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('klatring', 'Klatring', '🧗', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-outdoor'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('indendørs-klatring', 'Indendørs', '🏢', (SELECT id FROM public.tags_normalized WHERE slug = 'klatring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('udendørs-klatring', 'Udendørs', '⛰️', (SELECT id FROM public.tags_normalized WHERE slug = 'klatring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('boulder', 'Boulder', '🧗', (SELECT id FROM public.tags_normalized WHERE slug = 'klatring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('via-ferrata', 'Via Ferrata', '⛰️', (SELECT id FROM public.tags_normalized WHERE slug = 'klatring'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fiskeri', 'Fiskeri', '🎣', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-outdoor'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lystfiskeri', 'Lystfiskeri', '🎣', (SELECT id FROM public.tags_normalized WHERE slug = 'fiskeri'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('havfiskeri', 'Havfiskeri', '🌊', (SELECT id FROM public.tags_normalized WHERE slug = 'fiskeri'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fluefiskeri', 'Fluefiskeri', '🪰', (SELECT id FROM public.tags_normalized WHERE slug = 'fiskeri'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('isfiskeri', 'Isfiskeri', '🧊', (SELECT id FROM public.tags_normalized WHERE slug = 'fiskeri'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('jagt', 'Jagt', '🦌', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-outdoor'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('riffeljagt', 'Riffeljagt', '🎯', (SELECT id FROM public.tags_normalized WHERE slug = 'jagt'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('buejagt', 'Buejagt', '🏹', (SELECT id FROM public.tags_normalized WHERE slug = 'jagt'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('jagttur', 'Jagttur', '🌲', (SELECT id FROM public.tags_normalized WHERE slug = 'jagt'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('natur-oplevelser', 'Naturoplevelser', '🌿', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-outdoor'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('overlevelse', 'Overlevelse', '🏕️', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('geocaching', 'Geocaching', '📍', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('orienteringsløb', 'Orienteringsløb', '🗺️', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rafting', 'Rafting', '🚣', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('paintball', 'Paintball', '🔫', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('svampeture', 'Svampeture', '🍄', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('strandtur', 'Strandtur', '🏖️', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('solnedgang-tur', 'Solnedgangstur', '🌅', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('nordlys', 'Nordlys', '🌌', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fuglekiggeri', 'Fuglekiggeri', '🦅', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('botanik', 'Botanik', '🌸', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('stjerneobservation', 'Stjerneobservation', '⭐', (SELECT id FROM public.tags_normalized WHERE slug = 'natur-oplevelser'), (SELECT id FROM public.tag_categories WHERE slug = 'natur-outdoor'), 3);

-- ── 🍽️ Mad & Drikke ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mad-drikke', 'Mad & Drikke', '🍽️', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('restaurant', 'Restaurant', '🍽️', (SELECT id FROM public.tags_normalized WHERE slug = 'mad-drikke'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dansk-mad', 'Dansk', '🇩🇰', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('italiensk', 'Italiensk', '🇮🇹', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('asiatisk', 'Asiatisk', '🥢', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vegansk', 'Vegansk', '🥬', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('brunch', 'Brunch', '🥞', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sushi-restaurant', 'Sushi', '🍣', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ramen', 'Ramen', '🍜', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bbq', 'BBQ', '🍖', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fine-dining', 'Fine Dining', '🕯️', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vegetarisk', 'Vegetarisk', '🥦', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('glutenfri', 'Glutenfri', '🌾', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mexicansk', 'Mexicansk', '🌮', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('indisk', 'Indisk', '🍛', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mellemøstlig', 'Mellemøstlig', '🧆', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('japansk', 'Japansk', '🍱', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('koreansk', 'Koreansk', '🥘', (SELECT id FROM public.tags_normalized WHERE slug = 'restaurant'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bar', 'Bar', '🍸', (SELECT id FROM public.tags_normalized WHERE slug = 'mad-drikke'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cocktailbar', 'Cocktailbar', '🍹', (SELECT id FROM public.tags_normalized WHERE slug = 'bar'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ølbar', 'Ølbar', '🍺', (SELECT id FROM public.tags_normalized WHERE slug = 'bar'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vinbar', 'Vinbar', '🍷', (SELECT id FROM public.tags_normalized WHERE slug = 'bar'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('natklub', 'Natklub', '🪩', (SELECT id FROM public.tags_normalized WHERE slug = 'bar'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('whiskybar', 'Whiskybar', '🥃', (SELECT id FROM public.tags_normalized WHERE slug = 'bar'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rooftopbar', 'Rooftopbar', '🌆', (SELECT id FROM public.tags_normalized WHERE slug = 'bar'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sports-bar', 'Sportsbar', '📺', (SELECT id FROM public.tags_normalized WHERE slug = 'bar'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('café', 'Café', '☕', (SELECT id FROM public.tags_normalized WHERE slug = 'mad-drikke'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('specialkaffe', 'Specialkaffe', '☕', (SELECT id FROM public.tags_normalized WHERE slug = 'café'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('brunch-café', 'Brunch-café', '🥐', (SELECT id FROM public.tags_normalized WHERE slug = 'café'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('takeaway', 'Takeaway', '🥡', (SELECT id FROM public.tags_normalized WHERE slug = 'café'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('te-ceremoni', 'Te-ceremoni', '🍵', (SELECT id FROM public.tags_normalized WHERE slug = 'café'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kakaobar', 'Kakaobar', '🍫', (SELECT id FROM public.tags_normalized WHERE slug = 'café'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('barista', 'Barista', '☕', (SELECT id FROM public.tags_normalized WHERE slug = 'café'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kattecafé', 'Kattecafé', '🐱', (SELECT id FROM public.tags_normalized WHERE slug = 'café'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('marked', 'Marked', '🏪', (SELECT id FROM public.tags_normalized WHERE slug = 'mad-drikke'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('madfestival-marked', 'Madfestival', '🍽️', (SELECT id FROM public.tags_normalized WHERE slug = 'marked'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('streetfood', 'Streetfood', '🌮', (SELECT id FROM public.tags_normalized WHERE slug = 'marked'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bøndermarked', 'Bøndermarked', '🥕', (SELECT id FROM public.tags_normalized WHERE slug = 'marked'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('food-truck', 'Food Truck', '🚚', (SELECT id FROM public.tags_normalized WHERE slug = 'marked'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('madmarked', 'Madmarked', '🛒', (SELECT id FROM public.tags_normalized WHERE slug = 'marked'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vintagemarket', 'Vintagemarked', '🏺', (SELECT id FROM public.tags_normalized WHERE slug = 'marked'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('madlavning', 'Madlavning', '👩‍🍳', (SELECT id FROM public.tags_normalized WHERE slug = 'mad-drikke'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kursus-mad', 'Kursus', '📋', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('workshop-mad', 'Workshop', '🛠️', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('pop-up-dinner', 'Pop-up dinner', '🍽️', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('grillaften', 'Grillaften', '🥩', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sushi-kursus', 'Sushi-kursus', '🍣', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bagning', 'Bagning', '🥖', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fermentering', 'Fermentering', '🫙', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ølbrygning', 'Ølbrygning', '🍺', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cocktail-kursus', 'Cocktailkursus', '🍹', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dessert', 'Dessert', '🍰', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('madklub', 'Madklub', '👥', (SELECT id FROM public.tags_normalized WHERE slug = 'madlavning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('smagning', 'Smagning', '👅', (SELECT id FROM public.tags_normalized WHERE slug = 'mad-drikke'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vinsmagning', 'Vinsmagning', '🍷', (SELECT id FROM public.tags_normalized WHERE slug = 'smagning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('whisky-smagning', 'Whiskysmagning', '🥃', (SELECT id FROM public.tags_normalized WHERE slug = 'smagning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ølsmagning', 'Ølsmagning', '🍺', (SELECT id FROM public.tags_normalized WHERE slug = 'smagning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ostesmagning', 'Ostesmagning', '🧀', (SELECT id FROM public.tags_normalized WHERE slug = 'smagning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('chokoladsmagning', 'Chokoladsmagning', '🍫', (SELECT id FROM public.tags_normalized WHERE slug = 'smagning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('te-smagning', 'Tesmagning', '🍵', (SELECT id FROM public.tags_normalized WHERE slug = 'smagning'), (SELECT id FROM public.tag_categories WHERE slug = 'mad-drikke'), 3);

-- ── 👋 Social & Hobby ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('social-hobby', 'Social & Hobby', '👋', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fotografering', 'Fotografering', '📸', (SELECT id FROM public.tags_normalized WHERE slug = 'social-hobby'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('portræt', 'Portræt', '📸', (SELECT id FROM public.tags_normalized WHERE slug = 'fotografering'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('landskab', 'Landskab', '🏞️', (SELECT id FROM public.tags_normalized WHERE slug = 'fotografering'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('gadebilleder', 'Gadebilleder', '🏙️', (SELECT id FROM public.tags_normalized WHERE slug = 'fotografering'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('drone', 'Drone', '🛸', (SELECT id FROM public.tags_normalized WHERE slug = 'fotografering'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('film-foto', 'Filmfoto', '📷', (SELECT id FROM public.tags_normalized WHERE slug = 'fotografering'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vlogging', 'Vlogging', '📹', (SELECT id FROM public.tags_normalized WHERE slug = 'fotografering'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('naturfoto', 'Naturfoto', '🦋', (SELECT id FROM public.tags_normalized WHERE slug = 'fotografering'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('makrofoto', 'Makrofoto', '🔍', (SELECT id FROM public.tags_normalized WHERE slug = 'fotografering'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('streetfoto', 'Streetfoto', '🌆', (SELECT id FROM public.tags_normalized WHERE slug = 'fotografering'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kreative-hobbyer', 'Kreative hobbyer', '🎨', (SELECT id FROM public.tags_normalized WHERE slug = 'social-hobby'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('strik', 'Strik', '🧶', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('syning', 'Syning', '🧵', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hækling', 'Hækling', '🧶', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('perler', 'Perler', '📿', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('origami', 'Origami', '🦢', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('scrapbooking', 'Scrapbooking', '📒', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('modelbygning', 'Modelbygning', '✈️', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lego', 'LEGO', '🧱', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('have-hobby', 'Have & Dyrkning', '🌱', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lodning', 'Elektronik DIY', '🔧', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('macrame', 'Macramé', '🪢', (SELECT id FROM public.tags_normalized WHERE slug = 'kreative-hobbyer'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('quiz-spil', 'Quiz & Spil', '🧠', (SELECT id FROM public.tags_normalized WHERE slug = 'social-hobby'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('pubquiz', 'Pub Quiz', '🍺', (SELECT id FROM public.tags_normalized WHERE slug = 'quiz-spil'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('escape-room', 'Escape Room', '🔐', (SELECT id FROM public.tags_normalized WHERE slug = 'quiz-spil'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('spil-aften', 'Spilaften', '🎲', (SELECT id FROM public.tags_normalized WHERE slug = 'quiz-spil'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('trivia', 'Trivia', '❓', (SELECT id FROM public.tags_normalized WHERE slug = 'quiz-spil'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bingo', 'Bingo', '🎯', (SELECT id FROM public.tags_normalized WHERE slug = 'quiz-spil'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('collect-interesse', 'Samlere & Interesse', '🏛️', (SELECT id FROM public.tags_normalized WHERE slug = 'social-hobby'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('samler', 'Samler', '🗂️', (SELECT id FROM public.tags_normalized WHERE slug = 'collect-interesse'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('møntsamling', 'Møntsamling', '🪙', (SELECT id FROM public.tags_normalized WHERE slug = 'collect-interesse'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('frimærker', 'Frimærker', '📬', (SELECT id FROM public.tags_normalized WHERE slug = 'collect-interesse'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vinyl', 'Vinyl & Plader', '💽', (SELECT id FROM public.tags_normalized WHERE slug = 'collect-interesse'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('antikviteter', 'Antikviteter', '🏺', (SELECT id FROM public.tags_normalized WHERE slug = 'collect-interesse'), (SELECT id FROM public.tag_categories WHERE slug = 'social-hobby'), 3);

-- ── 🎮 Gaming & Tech ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('gaming-tech', 'Gaming & Tech', '🎮', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('video-gaming', 'Video Gaming', '🎮', (SELECT id FROM public.tags_normalized WHERE slug = 'gaming-tech'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('pc-gaming', 'PC Gaming', '🖥️', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('console', 'Konsol', '🎮', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vr-gaming', 'VR Gaming', '🥽', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('esport', 'E-sport', '🏆', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lan-party', 'LAN Party', '🖧', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('speedrunning', 'Speedrunning', '⏱️', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('retro-gaming', 'Retro Gaming', '👾', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('game-jam', 'Game Jam', '🕹️', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('minecraft', 'Minecraft', '⛏️', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fortnite', 'Fortnite', '🔫', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('league-of-legends', 'League of Legends', '⚔️', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('counter-strike', 'Counter-Strike', '🎯', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ar-gaming', 'AR Gaming', '📱', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mobil-gaming', 'Mobil Gaming', '📱', (SELECT id FROM public.tags_normalized WHERE slug = 'video-gaming'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('brætspil-rollespil', 'Brætspil & Rollespil', '🎲', (SELECT id FROM public.tags_normalized WHERE slug = 'gaming-tech'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('brætspil', 'Brætspil', '🎲', (SELECT id FROM public.tags_normalized WHERE slug = 'brætspil-rollespil'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dnd', 'D&D', '🐉', (SELECT id FROM public.tags_normalized WHERE slug = 'brætspil-rollespil'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rollespil', 'Rollespil', '🐉', (SELECT id FROM public.tags_normalized WHERE slug = 'brætspil-rollespil'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cosplay', 'Cosplay', '🦸', (SELECT id FROM public.tags_normalized WHERE slug = 'brætspil-rollespil'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kortspil', 'Kortspil', '🃏', (SELECT id FROM public.tags_normalized WHERE slug = 'brætspil-rollespil'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('warhammer', 'Warhammer', '⚔️', (SELECT id FROM public.tags_normalized WHERE slug = 'brætspil-rollespil'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('miniaturespil', 'Miniaturespil', '🏰', (SELECT id FROM public.tags_normalized WHERE slug = 'brætspil-rollespil'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tech-interesser', 'Tech & Innovation', '💻', (SELECT id FROM public.tags_normalized WHERE slug = 'gaming-tech'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('programmering', 'Programmering', '👨‍💻', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ai-tech', 'AI', '🤖', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('webdesign', 'Webdesign', '🌐', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hackathon', 'Hackathon', '💻', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('robotik', 'Robotik', '🤖', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cybersikkerhed', 'Cybersikkerhed', '🔐', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('3d-print', '3D Print', '🖨️', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('blockchain', 'Blockchain', '🔗', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('open-source', 'Open Source', '💾', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('app-udvikling', 'App-udvikling', '📱', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('iot', 'Internet of Things', '📡', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'gaming-tech'), 3);

-- ── ✈️ Rejser & Eventyr ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rejser-eventyr', 'Rejser & Eventyr', '✈️', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rejser', 'Rejser', '✈️', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser-eventyr'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tog', 'Tog', '🚆', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('samkørsel', 'Samkørsel', '🚗', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cykelruter', 'Cykelruter', '🚴', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('færge', 'Færge', '⛴️', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('roadtrip', 'Road Trip', '🛣️', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('flydeals', 'Fly-deals', '✈️', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('interrail', 'Interrail', '🚂', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('backpacking', 'Backpacking', '🎒', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('grupperejse', 'Grupperejse', '👥', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('logi', 'Logi', '🏕️', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser-eventyr'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('shelter-logi', 'Shelter', '⛺', (SELECT id FROM public.tags_normalized WHERE slug = 'logi'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vandrerhjem', 'Vandrerhjem', '🏠', (SELECT id FROM public.tags_normalized WHERE slug = 'logi'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hytter', 'Hytter', '🛖', (SELECT id FROM public.tags_normalized WHERE slug = 'logi'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('glamping-logi', 'Glamping', '✨', (SELECT id FROM public.tags_normalized WHERE slug = 'logi'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('couchsurfing', 'Couchsurfing', '🛋️', (SELECT id FROM public.tags_normalized WHERE slug = 'logi'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('airbnb', 'Airbnb', '🏡', (SELECT id FROM public.tags_normalized WHERE slug = 'logi'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rejsedestination', 'Destination', '🗺️', (SELECT id FROM public.tags_normalized WHERE slug = 'rejser-eventyr'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('storby', 'Storby', '🏙️', (SELECT id FROM public.tags_normalized WHERE slug = 'rejsedestination'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('strand-rejse', 'Strand', '🏖️', (SELECT id FROM public.tags_normalized WHERE slug = 'rejsedestination'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bjerg-rejse', 'Bjerg', '🏔️', (SELECT id FROM public.tags_normalized WHERE slug = 'rejsedestination'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('safari', 'Safari', '🦁', (SELECT id FROM public.tags_normalized WHERE slug = 'rejsedestination'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ørejse', 'Ø-rejse', '🏝️', (SELECT id FROM public.tags_normalized WHERE slug = 'rejsedestination'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('krydstogt', 'Krydstogt', '🚢', (SELECT id FROM public.tags_normalized WHERE slug = 'rejsedestination'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vulkaner', 'Vulkaner', '🌋', (SELECT id FROM public.tags_normalized WHERE slug = 'rejsedestination'), (SELECT id FROM public.tag_categories WHERE slug = 'rejser-eventyr'), 3);

-- ── 🧘 Sundhed & Wellness ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sundhed-wellness', 'Sundhed & Wellness', '🧘', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('yoga', 'Yoga', '🧘', (SELECT id FROM public.tags_normalized WHERE slug = 'sundhed-wellness'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hatha', 'Hatha', '🧘', (SELECT id FROM public.tags_normalized WHERE slug = 'yoga'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vinyasa', 'Vinyasa', '🌊', (SELECT id FROM public.tags_normalized WHERE slug = 'yoga'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('yin', 'Yin', '🌙', (SELECT id FROM public.tags_normalized WHERE slug = 'yoga'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hot-yoga', 'Hot Yoga', '🔥', (SELECT id FROM public.tags_normalized WHERE slug = 'yoga'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kundalini', 'Kundalini', '🌀', (SELECT id FROM public.tags_normalized WHERE slug = 'yoga'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ashtanga', 'Ashtanga', '🧘', (SELECT id FROM public.tags_normalized WHERE slug = 'yoga'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('yoga-nidra', 'Yoga Nidra', '😴', (SELECT id FROM public.tags_normalized WHERE slug = 'yoga'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('aerial-yoga', 'Aerial Yoga', '🎪', (SELECT id FROM public.tags_normalized WHERE slug = 'yoga'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('meditation', 'Meditation', '🧘', (SELECT id FROM public.tags_normalized WHERE slug = 'sundhed-wellness'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mindfulness', 'Mindfulness', '🌿', (SELECT id FROM public.tags_normalized WHERE slug = 'meditation'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('guidet-meditation', 'Guidet', '🎧', (SELECT id FROM public.tags_normalized WHERE slug = 'meditation'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('retreat', 'Retreat', '🏡', (SELECT id FROM public.tags_normalized WHERE slug = 'meditation'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('breathwork', 'Breathwork', '💨', (SELECT id FROM public.tags_normalized WHERE slug = 'meditation'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vipassana', 'Vipassana', '🙏', (SELECT id FROM public.tags_normalized WHERE slug = 'meditation'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('transcendental', 'Transcendental', '✨', (SELECT id FROM public.tags_normalized WHERE slug = 'meditation'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('terapi-healing', 'Terapi & Healing', '💆', (SELECT id FROM public.tags_normalized WHERE slug = 'sundhed-wellness'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('massage', 'Massage', '💆', (SELECT id FROM public.tags_normalized WHERE slug = 'terapi-healing'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('spa', 'Spa', '🛁', (SELECT id FROM public.tags_normalized WHERE slug = 'terapi-healing'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('akupunktur', 'Akupunktur', '🪡', (SELECT id FROM public.tags_normalized WHERE slug = 'terapi-healing'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('reiki', 'Reiki', '✋', (SELECT id FROM public.tags_normalized WHERE slug = 'terapi-healing'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('healing', 'Healing', '💫', (SELECT id FROM public.tags_normalized WHERE slug = 'terapi-healing'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kraniosakral', 'Kraniosakral', '🧠', (SELECT id FROM public.tags_normalized WHERE slug = 'terapi-healing'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('osteopati', 'Osteopati', '🦴', (SELECT id FROM public.tags_normalized WHERE slug = 'terapi-healing'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kold-terapi', 'Kold-terapi & Varme', '🥶', (SELECT id FROM public.tags_normalized WHERE slug = 'sundhed-wellness'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vinterbadning-ws', 'Vinterbadning', '🥶', (SELECT id FROM public.tags_normalized WHERE slug = 'kold-terapi'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sauna', 'Sauna', '🧖', (SELECT id FROM public.tags_normalized WHERE slug = 'kold-terapi'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('float-tank', 'Float Tank', '🌊', (SELECT id FROM public.tags_normalized WHERE slug = 'kold-terapi'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kold-bruser', 'Kold bruser', '🚿', (SELECT id FROM public.tags_normalized WHERE slug = 'kold-terapi'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dampbad', 'Dampbad', '💨', (SELECT id FROM public.tags_normalized WHERE slug = 'kold-terapi'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('infrared-sauna', 'Infrared Sauna', '☀️', (SELECT id FROM public.tags_normalized WHERE slug = 'kold-terapi'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('biohacking', 'Biohacking & Optimering', '🔬', (SELECT id FROM public.tags_normalized WHERE slug = 'sundhed-wellness'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fastetræning', 'Fastetræning', '⏳', (SELECT id FROM public.tags_normalized WHERE slug = 'biohacking'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('søvn-optimering', 'Søvnoptimering', '😴', (SELECT id FROM public.tags_normalized WHERE slug = 'biohacking'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ernæring', 'Ernæring', '🥗', (SELECT id FROM public.tags_normalized WHERE slug = 'biohacking'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kosttilskud', 'Kosttilskud', '💊', (SELECT id FROM public.tags_normalized WHERE slug = 'biohacking'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hormonoptimering', 'Hormonoptimering', '⚗️', (SELECT id FROM public.tags_normalized WHERE slug = 'biohacking'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mental-sundhed', 'Mental Sundhed', '🧠', (SELECT id FROM public.tags_normalized WHERE slug = 'sundhed-wellness'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('stresshåndtering', 'Stresshåndtering', '🌬️', (SELECT id FROM public.tags_normalized WHERE slug = 'mental-sundhed'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('psykoterapi', 'Psykoterapi', '🗣️', (SELECT id FROM public.tags_normalized WHERE slug = 'mental-sundhed'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('selvudvikling', 'Selvudvikling', '📈', (SELECT id FROM public.tags_normalized WHERE slug = 'mental-sundhed'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('coach', 'Coaching', '🎯', (SELECT id FROM public.tags_normalized WHERE slug = 'mental-sundhed'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mindset', 'Mindset', '💡', (SELECT id FROM public.tags_normalized WHERE slug = 'mental-sundhed'), (SELECT id FROM public.tag_categories WHERE slug = 'sundhed-wellness'), 3);

-- ── 👗 Mode & Skønhed ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mode-skønhed', 'Mode & Skønhed', '👗', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mode', 'Mode & Styling', '👗', (SELECT id FROM public.tags_normalized WHERE slug = 'mode-skønhed'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('streetwear', 'Streetwear', '👟', (SELECT id FROM public.tags_normalized WHERE slug = 'mode'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('high-fashion', 'High Fashion', '💎', (SELECT id FROM public.tags_normalized WHERE slug = 'mode'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vintage-mode', 'Vintage', '🕰️', (SELECT id FROM public.tags_normalized WHERE slug = 'mode'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('thrift', 'Thrifting', '♻️', (SELECT id FROM public.tags_normalized WHERE slug = 'mode'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('styling', 'Styling', '✂️', (SELECT id FROM public.tags_normalized WHERE slug = 'mode'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('accessories', 'Accessories', '👜', (SELECT id FROM public.tags_normalized WHERE slug = 'mode'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sneakers', 'Sneakers', '👟', (SELECT id FROM public.tags_normalized WHERE slug = 'mode'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bæredygtig-mode', 'Bæredygtig mode', '🌱', (SELECT id FROM public.tags_normalized WHERE slug = 'mode'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('skønhed', 'Skønhed', '💄', (SELECT id FROM public.tags_normalized WHERE slug = 'mode-skønhed'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('makeup', 'Makeup', '💄', (SELECT id FROM public.tags_normalized WHERE slug = 'skønhed'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hudpleje', 'Hudpleje', '🧴', (SELECT id FROM public.tags_normalized WHERE slug = 'skønhed'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('parfume', 'Parfume', '🌸', (SELECT id FROM public.tags_normalized WHERE slug = 'skønhed'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('frisør', 'Frisør', '✂️', (SELECT id FROM public.tags_normalized WHERE slug = 'skønhed'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('negle', 'Negle', '💅', (SELECT id FROM public.tags_normalized WHERE slug = 'skønhed'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hårpleje', 'Hårpleje', '💇', (SELECT id FROM public.tags_normalized WHERE slug = 'skønhed'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('naturlig-skønhed', 'Naturlig skønhed', '🌿', (SELECT id FROM public.tags_normalized WHERE slug = 'skønhed'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kropsmodificering', 'Kropsmodificering', '🎨', (SELECT id FROM public.tags_normalized WHERE slug = 'mode-skønhed'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tatovering', 'Tatovering', '🖊️', (SELECT id FROM public.tags_normalized WHERE slug = 'kropsmodificering'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('piercinger', 'Piercinger', '💍', (SELECT id FROM public.tags_normalized WHERE slug = 'kropsmodificering'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tatovering-event', 'Tatoveringskonvention', '🎨', (SELECT id FROM public.tags_normalized WHERE slug = 'kropsmodificering'), (SELECT id FROM public.tag_categories WHERE slug = 'mode-skønhed'), 3);

-- ── 🐾 Dyr & Natur ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dyr-natur', 'Dyr & Natur', '🐾', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kæledyr', 'Kæledyr', '🐕', (SELECT id FROM public.tags_normalized WHERE slug = 'dyr-natur'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hunde', 'Hunde', '🐕', (SELECT id FROM public.tags_normalized WHERE slug = 'kæledyr'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('katte', 'Katte', '🐱', (SELECT id FROM public.tags_normalized WHERE slug = 'kæledyr'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fugle-husdyr', 'Fugle', '🦜', (SELECT id FROM public.tags_normalized WHERE slug = 'kæledyr'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('akvarium', 'Akvarium', '🐠', (SELECT id FROM public.tags_normalized WHERE slug = 'kæledyr'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('eksotiske-dyr', 'Eksotiske dyr', '🦎', (SELECT id FROM public.tags_normalized WHERE slug = 'kæledyr'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hamster-gnaver', 'Gnavere', '🐹', (SELECT id FROM public.tags_normalized WHERE slug = 'kæledyr'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dyreaktiviteter', 'Aktiviteter med dyr', '🐾', (SELECT id FROM public.tags_normalized WHERE slug = 'dyr-natur'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hundetræning', 'Hundetræning', '🐕', (SELECT id FROM public.tags_normalized WHERE slug = 'dyreaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ridning', 'Ridning', '🐴', (SELECT id FROM public.tags_normalized WHERE slug = 'dyreaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kattecafé-bes', 'Kattecafé', '🐱', (SELECT id FROM public.tags_normalized WHERE slug = 'dyreaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dogpark', 'Hundeparken', '🌳', (SELECT id FROM public.tags_normalized WHERE slug = 'dyreaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('agility', 'Agility', '🏆', (SELECT id FROM public.tags_normalized WHERE slug = 'dyreaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dyrevelfærd-natur', 'Dyrevelfærd & Natur', '🌿', (SELECT id FROM public.tags_normalized WHERE slug = 'dyr-natur'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dyrevelfærd', 'Dyrevelfærd', '💚', (SELECT id FROM public.tags_normalized WHERE slug = 'dyrevelfærd-natur'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dyrepark', 'Dyrepark', '🦁', (SELECT id FROM public.tags_normalized WHERE slug = 'dyrevelfærd-natur'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('safari-oplevelse', 'Safari', '🦒', (SELECT id FROM public.tags_normalized WHERE slug = 'dyrevelfærd-natur'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fuglekiggeri-dyr', 'Fuglekiggeri', '🦅', (SELECT id FROM public.tags_normalized WHERE slug = 'dyrevelfærd-natur'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dyreinternat-vol', 'Dyreinternat', '🐕', (SELECT id FROM public.tags_normalized WHERE slug = 'dyrevelfærd-natur'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hval-watching', 'Hvalobservation', '🐋', (SELECT id FROM public.tags_normalized WHERE slug = 'dyrevelfærd-natur'), (SELECT id FROM public.tag_categories WHERE slug = 'dyr-natur'), 3);

-- ── 🚗 Motor & Køretøjer ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('motor-køretøjer', 'Motor & Køretøjer', '🚗', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('biler', 'Biler', '🚗', (SELECT id FROM public.tags_normalized WHERE slug = 'motor-køretøjer'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('klassiske-biler', 'Klassiske biler', '🏎️', (SELECT id FROM public.tags_normalized WHERE slug = 'biler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('elbiler', 'Elbiler', '⚡', (SELECT id FROM public.tags_normalized WHERE slug = 'biler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tuning', 'Tuning', '🔧', (SELECT id FROM public.tags_normalized WHERE slug = 'biler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bil-show', 'Bilshow', '🚗', (SELECT id FROM public.tags_normalized WHERE slug = 'biler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('roadtrip-bil', 'Road Trip', '🛣️', (SELECT id FROM public.tags_normalized WHERE slug = 'biler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('autocamper', 'Autocamper', '🚐', (SELECT id FROM public.tags_normalized WHERE slug = 'biler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bil-klub', 'Bilklub', '🏁', (SELECT id FROM public.tags_normalized WHERE slug = 'biler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('motorsport-aktiv', 'Motorsport', '🏎️', (SELECT id FROM public.tags_normalized WHERE slug = 'motor-køretøjer'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('karting-aktiv', 'Karting', '🏎️', (SELECT id FROM public.tags_normalized WHERE slug = 'motorsport-aktiv'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('rally-aktiv', 'Rally', '🚗', (SELECT id FROM public.tags_normalized WHERE slug = 'motorsport-aktiv'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('circuit-racing', 'Circuit Racing', '🏁', (SELECT id FROM public.tags_normalized WHERE slug = 'motorsport-aktiv'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('drifting', 'Drifting', '💨', (SELECT id FROM public.tags_normalized WHERE slug = 'motorsport-aktiv'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('motorcykler', 'Motorcykler', '🏍️', (SELECT id FROM public.tags_normalized WHERE slug = 'motor-køretøjer'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mc-tur', 'MC-tur', '🏍️', (SELECT id FROM public.tags_normalized WHERE slug = 'motorcykler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mc-klub', 'MC-klub', '🏍️', (SELECT id FROM public.tags_normalized WHERE slug = 'motorcykler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('enduro', 'Enduro', '🌲', (SELECT id FROM public.tags_normalized WHERE slug = 'motorcykler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('scooter', 'Scooter', '🛵', (SELECT id FROM public.tags_normalized WHERE slug = 'motorcykler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('custom-mc', 'Custom MC', '🔧', (SELECT id FROM public.tags_normalized WHERE slug = 'motorcykler'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vandfartøjer', 'Vandfartøjer', '⛵', (SELECT id FROM public.tags_normalized WHERE slug = 'motor-køretøjer'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('båd', 'Båd', '🚤', (SELECT id FROM public.tags_normalized WHERE slug = 'vandfartøjer'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sejlads-sport', 'Sejlads', '⛵', (SELECT id FROM public.tags_normalized WHERE slug = 'vandfartøjer'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('speedbåd', 'Speedbåd', '🚤', (SELECT id FROM public.tags_normalized WHERE slug = 'vandfartøjer'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('jetski', 'Jetski', '🌊', (SELECT id FROM public.tags_normalized WHERE slug = 'vandfartøjer'), (SELECT id FROM public.tag_categories WHERE slug = 'motor-køretøjer'), 3);

-- ── 🔬 Videnskab & Læring ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('videnskab-læring', 'Videnskab & Læring', '🔬', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('naturvidenskab', 'Naturvidenskab', '🔭', (SELECT id FROM public.tags_normalized WHERE slug = 'videnskab-læring'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('astronomi', 'Astronomi', '🔭', (SELECT id FROM public.tags_normalized WHERE slug = 'naturvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('biologi', 'Biologi', '🦠', (SELECT id FROM public.tags_normalized WHERE slug = 'naturvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kemi', 'Kemi', '⚗️', (SELECT id FROM public.tags_normalized WHERE slug = 'naturvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fysik', 'Fysik', '⚡', (SELECT id FROM public.tags_normalized WHERE slug = 'naturvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('matematik', 'Matematik', '📐', (SELECT id FROM public.tags_normalized WHERE slug = 'naturvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('geologi', 'Geologi', '🪨', (SELECT id FROM public.tags_normalized WHERE slug = 'naturvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('oceanografi', 'Oceanografi', '🌊', (SELECT id FROM public.tags_normalized WHERE slug = 'naturvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('meteorologi', 'Meteorologi', '🌤️', (SELECT id FROM public.tags_normalized WHERE slug = 'naturvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('humanvidenskab', 'Humanvidenskab', '🧠', (SELECT id FROM public.tags_normalized WHERE slug = 'videnskab-læring'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('filosofi', 'Filosofi', '🤔', (SELECT id FROM public.tags_normalized WHERE slug = 'humanvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('psykologi', 'Psykologi', '🧠', (SELECT id FROM public.tags_normalized WHERE slug = 'humanvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('historie', 'Historie', '📜', (SELECT id FROM public.tags_normalized WHERE slug = 'humanvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('arkæologi', 'Arkæologi', '⛏️', (SELECT id FROM public.tags_normalized WHERE slug = 'humanvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('antropologi', 'Antropologi', '🌍', (SELECT id FROM public.tags_normalized WHERE slug = 'humanvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sociologi', 'Sociologi', '👥', (SELECT id FROM public.tags_normalized WHERE slug = 'humanvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('økonomi', 'Økonomi', '📊', (SELECT id FROM public.tags_normalized WHERE slug = 'humanvidenskab'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sprogkurser', 'Sprog & Kommunikation', '🗣️', (SELECT id FROM public.tags_normalized WHERE slug = 'videnskab-læring'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('engelsk', 'Engelsk', '🇬🇧', (SELECT id FROM public.tags_normalized WHERE slug = 'sprogkurser'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('spansk', 'Spansk', '🇪🇸', (SELECT id FROM public.tags_normalized WHERE slug = 'sprogkurser'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tysk', 'Tysk', '🇩🇪', (SELECT id FROM public.tags_normalized WHERE slug = 'sprogkurser'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fransk', 'Fransk', '🇫🇷', (SELECT id FROM public.tags_normalized WHERE slug = 'sprogkurser'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('japansk-sprog', 'Japansk', '🇯🇵', (SELECT id FROM public.tags_normalized WHERE slug = 'sprogkurser'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('arabisk', 'Arabisk', '🌙', (SELECT id FROM public.tags_normalized WHERE slug = 'sprogkurser'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('retorik', 'Retorik', '🎙️', (SELECT id FROM public.tags_normalized WHERE slug = 'sprogkurser'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('debat', 'Debat', '💬', (SELECT id FROM public.tags_normalized WHERE slug = 'sprogkurser'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tegnsprog', 'Tegnsprog', '🤟', (SELECT id FROM public.tags_normalized WHERE slug = 'sprogkurser'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tech-lære', 'Tech & Digital', '💻', (SELECT id FROM public.tags_normalized WHERE slug = 'videnskab-læring'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('programmering-kursus', 'Programmering', '👨‍💻', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-lære'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ai-lære', 'AI & Machine Learning', '🤖', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-lære'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('robotik-lære', 'Robotik', '🦾', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-lære'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cybersecurity', 'Cybersikkerhed', '🔒', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-lære'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dataanalyse', 'Dataanalyse', '📊', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-lære'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ux-design', 'UX Design', '🖊️', (SELECT id FROM public.tags_normalized WHERE slug = 'tech-lære'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('foredrag-lær', 'Foredrag & Talks', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'videnskab-læring'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('inspiration-foredrag', 'Inspiration', '✨', (SELECT id FROM public.tags_normalized WHERE slug = 'foredrag-lær'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('videnskab-foredrag', 'Videnskab', '🔬', (SELECT id FROM public.tags_normalized WHERE slug = 'foredrag-lær'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('politik-foredrag', 'Politik', '🏛️', (SELECT id FROM public.tags_normalized WHERE slug = 'foredrag-lær'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ted-talks', 'TED Talks', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'foredrag-lær'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('paneldebat', 'Paneldebat', '💬', (SELECT id FROM public.tags_normalized WHERE slug = 'foredrag-lær'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('netværksforedrag', 'Netværksforedrag', '🤝', (SELECT id FROM public.tags_normalized WHERE slug = 'foredrag-lær'), (SELECT id FROM public.tag_categories WHERE slug = 'videnskab-læring'), 3);

-- ── 👨‍👩‍👧‍👦 Børn & Familie ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('børn-familie', 'Børn & Familie', '👨‍👩‍👧‍👦', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('familieaktiviteter', 'Familieaktiviteter', '👨‍👩‍👧', (SELECT id FROM public.tags_normalized WHERE slug = 'børn-familie'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('familieudflugter', 'Familieudflugter', '🚗', (SELECT id FROM public.tags_normalized WHERE slug = 'familieaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('familievandring-børn', 'Familievandring', '🥾', (SELECT id FROM public.tags_normalized WHERE slug = 'familieaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('familiecykling', 'Familiecykling', '🚲', (SELECT id FROM public.tags_normalized WHERE slug = 'familieaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('strandtur-familie', 'Strandtur', '🏖️', (SELECT id FROM public.tags_normalized WHERE slug = 'familieaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('picnic', 'Picnic', '🧺', (SELECT id FROM public.tags_normalized WHERE slug = 'familieaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('skattejagt', 'Skattejagt', '🗺️', (SELECT id FROM public.tags_normalized WHERE slug = 'familieaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('børneevents', 'Børneevents', '🧸', (SELECT id FROM public.tags_normalized WHERE slug = 'børn-familie'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('børneteater-event', 'Børneteater', '🎭', (SELECT id FROM public.tags_normalized WHERE slug = 'børneevents'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('baby-events', 'Baby-events', '👶', (SELECT id FROM public.tags_normalized WHERE slug = 'børneevents'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('børnemusik', 'Børnemusik', '🎵', (SELECT id FROM public.tags_normalized WHERE slug = 'børneevents'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('børnefestival', 'Børnefestival', '🎪', (SELECT id FROM public.tags_normalized WHERE slug = 'børneevents'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('legeplads', 'Legeplads', '🛝', (SELECT id FROM public.tags_normalized WHERE slug = 'børneevents'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('børnebiograf', 'Børnebiograf', '🎬', (SELECT id FROM public.tags_normalized WHERE slug = 'børneevents'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('julenisse', 'Juleevents', '🎅', (SELECT id FROM public.tags_normalized WHERE slug = 'børneevents'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('læringsaktiviteter', 'Læring & Aktiviteter', '🎓', (SELECT id FROM public.tags_normalized WHERE slug = 'børn-familie'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('svømmeskole-børn', 'Svømmeskole', '🏊', (SELECT id FROM public.tags_normalized WHERE slug = 'læringsaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dyreparker', 'Dyrepark', '🦁', (SELECT id FROM public.tags_normalized WHERE slug = 'læringsaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('videnskabscenter', 'Videnskabscenter', '🔬', (SELECT id FROM public.tags_normalized WHERE slug = 'læringsaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('museum-børn', 'Museum', '🏛️', (SELECT id FROM public.tags_normalized WHERE slug = 'læringsaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kreative-workshops-børn', 'Kreative workshops', '🎨', (SELECT id FROM public.tags_normalized WHERE slug = 'læringsaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sport-børn', 'Sport for børn', '⚽', (SELECT id FROM public.tags_normalized WHERE slug = 'læringsaktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('seniorer', 'Seniorer', '👴', (SELECT id FROM public.tags_normalized WHERE slug = 'børn-familie'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('senior-aktiviteter', 'Senioraktiviteter', '👴', (SELECT id FROM public.tags_normalized WHERE slug = 'seniorer'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('petanque', 'Pétanque', '🎯', (SELECT id FROM public.tags_normalized WHERE slug = 'seniorer'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('senior-yoga', 'Seniorvoga', '🧘', (SELECT id FROM public.tags_normalized WHERE slug = 'seniorer'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bridge', 'Bridge', '🃏', (SELECT id FROM public.tags_normalized WHERE slug = 'seniorer'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('senior-vandring', 'Seniorvandring', '🥾', (SELECT id FROM public.tags_normalized WHERE slug = 'seniorer'), (SELECT id FROM public.tag_categories WHERE slug = 'børn-familie'), 3);

-- ── 🤝 Frivilligt & Community ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('frivilligt-community', 'Frivilligt & Community', '🤝', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('frivilligt', 'Frivilligt arbejde', '🫲', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt-community'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('strandrensning', 'Strandrensning', '🏖️', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('genbrugsbutik', 'Genbrugsbutik', '♻️', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dyreinternat', 'Dyreinternat', '🐕', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('frivillig-mentoring', 'Mentoring', '🎓', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('cleanups', 'Cleanups', '🌿', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('socialt-arbejde', 'Socialt arbejde', '💙', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('velgørenhed', 'Velgørenhed', '💝', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('madbanken', 'Madbank', '🍞', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('røde-kors', 'Røde Kors', '🏥', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bæredygtighed', 'Bæredygtighed & Miljø', '🌱', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt-community'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('genbrugsprojekter', 'Genbrugsprojekter', '♻️', (SELECT id FROM public.tags_normalized WHERE slug = 'bæredygtighed'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('miljøaktivisme', 'Miljøaktivisme', '🌍', (SELECT id FROM public.tags_normalized WHERE slug = 'bæredygtighed'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('urban-dyrkning', 'Urban dyrkning', '🥬', (SELECT id FROM public.tags_normalized WHERE slug = 'bæredygtighed'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('reparationscafé', 'Reparationscafé', '🔧', (SELECT id FROM public.tags_normalized WHERE slug = 'bæredygtighed'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('zero-waste', 'Zero Waste', '🌿', (SELECT id FROM public.tags_normalized WHERE slug = 'bæredygtighed'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bæredygtig-livsstil', 'Bæredygtig livsstil', '💚', (SELECT id FROM public.tags_normalized WHERE slug = 'bæredygtighed'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lokalpolitik', 'Politik & Samfund', '🏛️', (SELECT id FROM public.tags_normalized WHERE slug = 'frivilligt-community'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lokalpolitik-act', 'Lokalpolitik', '🏘️', (SELECT id FROM public.tags_normalized WHERE slug = 'lokalpolitik'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('debataften', 'Debataften', '💬', (SELECT id FROM public.tags_normalized WHERE slug = 'lokalpolitik'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('borgerinddragelse', 'Borgerinddragelse', '🗳️', (SELECT id FROM public.tags_normalized WHERE slug = 'lokalpolitik'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('klimaaktivisme', 'Klimaaktivisme', '🌡️', (SELECT id FROM public.tags_normalized WHERE slug = 'lokalpolitik'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('feminisme', 'Feminisme', '♀️', (SELECT id FROM public.tags_normalized WHERE slug = 'lokalpolitik'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lgbtq', 'LGBTQ+', '🏳️‍🌈', (SELECT id FROM public.tags_normalized WHERE slug = 'lokalpolitik'), (SELECT id FROM public.tag_categories WHERE slug = 'frivilligt-community'), 3);

-- ── 💼 Business & Networking ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('business-networking', 'Business & Networking', '💼', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('netværk', 'Netværk', '🤝', (SELECT id FROM public.tags_normalized WHERE slug = 'business-networking'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('startup', 'Startup', '🚀', (SELECT id FROM public.tags_normalized WHERE slug = 'netværk'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('professionelt-net', 'Professionelt', '💼', (SELECT id FROM public.tags_normalized WHERE slug = 'netværk'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('business-lunch', 'Business Lunch', '🍽️', (SELECT id FROM public.tags_normalized WHERE slug = 'netværk'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('speed-networking', 'Speed Networking', '⚡', (SELECT id FROM public.tags_normalized WHERE slug = 'netværk'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('women-in-business', 'Women in Business', '👩‍💼', (SELECT id FROM public.tags_normalized WHERE slug = 'netværk'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('alumni', 'Alumni', '🎓', (SELECT id FROM public.tags_normalized WHERE slug = 'netværk'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('iværksætteri', 'Iværksætteri', '🚀', (SELECT id FROM public.tags_normalized WHERE slug = 'business-networking'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('pitching', 'Pitching', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'iværksætteri'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('investor-møde', 'Investor-møde', '💰', (SELECT id FROM public.tags_normalized WHERE slug = 'iværksætteri'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('demo-day', 'Demo Day', '📱', (SELECT id FROM public.tags_normalized WHERE slug = 'iværksætteri'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('startup-weekend', 'Startup Weekend', '🗓️', (SELECT id FROM public.tags_normalized WHERE slug = 'iværksætteri'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bootcamp-biz', 'Business Bootcamp', '🪖', (SELECT id FROM public.tags_normalized WHERE slug = 'iværksætteri'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('konference-event', 'Konference & Events', '🎙️', (SELECT id FROM public.tags_normalized WHERE slug = 'business-networking'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('konference', 'Konference', '🎙️', (SELECT id FROM public.tags_normalized WHERE slug = 'konference-event'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('workshop-biz', 'Workshop', '🛠️', (SELECT id FROM public.tags_normalized WHERE slug = 'konference-event'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hackathon-biz', 'Hackathon', '💻', (SELECT id FROM public.tags_normalized WHERE slug = 'konference-event'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('coworking', 'Coworking', '🏢', (SELECT id FROM public.tags_normalized WHERE slug = 'konference-event'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('summermeetup', 'Sommermøde', '☀️', (SELECT id FROM public.tags_normalized WHERE slug = 'konference-event'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('afterwork', 'After Work', '🍸', (SELECT id FROM public.tags_normalized WHERE slug = 'konference-event'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('personlig-udvikling-biz', 'Personlig Udvikling', '📈', (SELECT id FROM public.tags_normalized WHERE slug = 'business-networking'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mentorskab', 'Mentorskab', '🎓', (SELECT id FROM public.tags_normalized WHERE slug = 'personlig-udvikling-biz'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('leder-kursus', 'Lederkursus', '👤', (SELECT id FROM public.tags_normalized WHERE slug = 'personlig-udvikling-biz'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('offentlig-tale', 'Offentlig Tale', '🎤', (SELECT id FROM public.tags_normalized WHERE slug = 'personlig-udvikling-biz'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('forhandling', 'Forhandling', '🤝', (SELECT id FROM public.tags_normalized WHERE slug = 'personlig-udvikling-biz'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('salg-kursus', 'Salgskursus', '💰', (SELECT id FROM public.tags_normalized WHERE slug = 'personlig-udvikling-biz'), (SELECT id FROM public.tag_categories WHERE slug = 'business-networking'), 3);

-- ── 🎬 Film & Medier ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('film-medier', 'Film & Medier', '🎬', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('film-bio', 'Film & Biograf', '🎬', (SELECT id FROM public.tags_normalized WHERE slug = 'film-medier'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('biograf', 'Biograf', '🎬', (SELECT id FROM public.tags_normalized WHERE slug = 'film-bio'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('udendørs-kino', 'Udendørs kino', '🌙', (SELECT id FROM public.tags_normalized WHERE slug = 'film-bio'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('premiere', 'Premiere', '⭐', (SELECT id FROM public.tags_normalized WHERE slug = 'film-bio'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('filmklub', 'Filmklub', '📽️', (SELECT id FROM public.tags_normalized WHERE slug = 'film-bio'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dokumentar-film', 'Dokumentar', '📹', (SELECT id FROM public.tags_normalized WHERE slug = 'film-bio'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kortfilm', 'Kortfilm', '🎞️', (SELECT id FROM public.tags_normalized WHERE slug = 'film-bio'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('animation', 'Animation', '✏️', (SELECT id FROM public.tags_normalized WHERE slug = 'film-bio'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vr-film', 'VR Film', '🥽', (SELECT id FROM public.tags_normalized WHERE slug = 'film-bio'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('filmfestival-event', 'Filmfestival', '🎪', (SELECT id FROM public.tags_normalized WHERE slug = 'film-bio'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('genre-film', 'Genre', '🎭', (SELECT id FROM public.tags_normalized WHERE slug = 'film-medier'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('action-film', 'Action', '💥', (SELECT id FROM public.tags_normalized WHERE slug = 'genre-film'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('komedie-film', 'Komedie', '😂', (SELECT id FROM public.tags_normalized WHERE slug = 'genre-film'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('horror-film', 'Horror', '👻', (SELECT id FROM public.tags_normalized WHERE slug = 'genre-film'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sci-fi-film', 'Sci-Fi', '🚀', (SELECT id FROM public.tags_normalized WHERE slug = 'genre-film'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('romantik-film', 'Romantik', '💕', (SELECT id FROM public.tags_normalized WHERE slug = 'genre-film'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('thriller-film', 'Thriller', '😰', (SELECT id FROM public.tags_normalized WHERE slug = 'genre-film'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('drama-film', 'Drama', '🎭', (SELECT id FROM public.tags_normalized WHERE slug = 'genre-film'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('serier-streaming', 'Serier & Streaming', '📺', (SELECT id FROM public.tags_normalized WHERE slug = 'film-medier'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('serier', 'Serier', '📺', (SELECT id FROM public.tags_normalized WHERE slug = 'serier-streaming'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('netflix-klub', 'Netflix-klub', '🍿', (SELECT id FROM public.tags_normalized WHERE slug = 'serier-streaming'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('anime', 'Anime', '🎌', (SELECT id FROM public.tags_normalized WHERE slug = 'serier-streaming'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('youtube', 'YouTube', '▶️', (SELECT id FROM public.tags_normalized WHERE slug = 'serier-streaming'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('twitch', 'Twitch', '🎮', (SELECT id FROM public.tags_normalized WHERE slug = 'serier-streaming'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('medieproduktion', 'Medieproduktion', '🎥', (SELECT id FROM public.tags_normalized WHERE slug = 'film-medier'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('filmproduktion', 'Filmproduktion', '🎥', (SELECT id FROM public.tags_normalized WHERE slug = 'medieproduktion'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('podcast-produktion', 'Podcast', '🎙️', (SELECT id FROM public.tags_normalized WHERE slug = 'medieproduktion'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('content-creation', 'Content Creation', '📱', (SELECT id FROM public.tags_normalized WHERE slug = 'medieproduktion'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fotografering-media', 'Fotografering', '📸', (SELECT id FROM public.tags_normalized WHERE slug = 'medieproduktion'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('grafisk-design', 'Grafisk design', '🎨', (SELECT id FROM public.tags_normalized WHERE slug = 'medieproduktion'), (SELECT id FROM public.tag_categories WHERE slug = 'film-medier'), 3);

-- ── 💕 Romantik & Dating ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('romantik-dating', 'Romantik & Dating', '💕', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('single-events', 'Single-events', '💖', (SELECT id FROM public.tags_normalized WHERE slug = 'romantik-dating'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('speeddating', 'Speeddating', '💕', (SELECT id FROM public.tags_normalized WHERE slug = 'single-events'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('single-events-gen', 'Single-events', '💖', (SELECT id FROM public.tags_normalized WHERE slug = 'single-events'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('quiz-night-singler', 'Quiz Night Singler', '❓', (SELECT id FROM public.tags_normalized WHERE slug = 'single-events'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hiking-singles', 'Hiking for singler', '🥾', (SELECT id FROM public.tags_normalized WHERE slug = 'single-events'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('vinsmagning-singler', 'Vinsmagning for singler', '🍷', (SELECT id FROM public.tags_normalized WHERE slug = 'single-events'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('singles-fester', 'Singlesfest', '🎉', (SELECT id FROM public.tags_normalized WHERE slug = 'single-events'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('par-aktiviteter', 'Aktiviteter for par', '💑', (SELECT id FROM public.tags_normalized WHERE slug = 'romantik-dating'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('madlavning-par', 'Madlavning for to', '👫', (SELECT id FROM public.tags_normalized WHERE slug = 'par-aktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dansekursus-par', 'Dansekursus for par', '💃', (SELECT id FROM public.tags_normalized WHERE slug = 'par-aktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('par-yoga', 'Par-yoga', '🧘', (SELECT id FROM public.tags_normalized WHERE slug = 'par-aktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('par-massage', 'Par-massage', '💆', (SELECT id FROM public.tags_normalized WHERE slug = 'par-aktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('romantisk-weekend', 'Romantisk weekend', '🌹', (SELECT id FROM public.tags_normalized WHERE slug = 'par-aktiviteter'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('dating-interesser', 'Dating-interesser', '❤️', (SELECT id FROM public.tags_normalized WHERE slug = 'romantik-dating'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('aktivitets-dating', 'Aktivitetsdating', '🏃', (SELECT id FROM public.tags_normalized WHERE slug = 'dating-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kulturel-dating', 'Kulturdating', '🎭', (SELECT id FROM public.tags_normalized WHERE slug = 'dating-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('outdoor-dating', 'Outdoordating', '🌲', (SELECT id FROM public.tags_normalized WHERE slug = 'dating-interesser'), (SELECT id FROM public.tag_categories WHERE slug = 'romantik-dating'), 3);

-- ── 📚 Læring & Udvikling ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('læring-udvikling', 'Læring & Udvikling', '📚', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('workshop', 'Workshop', '🛠️', (SELECT id FROM public.tags_normalized WHERE slug = 'læring-udvikling'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kreativt-ws', 'Kreativt', '🎨', (SELECT id FROM public.tags_normalized WHERE slug = 'workshop'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('teknologi-ws', 'Teknologi', '💻', (SELECT id FROM public.tags_normalized WHERE slug = 'workshop'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('business-ws', 'Business', '💼', (SELECT id FROM public.tags_normalized WHERE slug = 'workshop'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('håndværk', 'Håndværk', '🔨', (SELECT id FROM public.tags_normalized WHERE slug = 'workshop'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('madlavning-ws', 'Madlavning', '👩‍🍳', (SELECT id FROM public.tags_normalized WHERE slug = 'workshop'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kunst-ws', 'Kunst', '🖌️', (SELECT id FROM public.tags_normalized WHERE slug = 'workshop'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('musik-ws', 'Musik', '🎵', (SELECT id FROM public.tags_normalized WHERE slug = 'workshop'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('sprog-ws', 'Sprog', '🗣️', (SELECT id FROM public.tags_normalized WHERE slug = 'workshop'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kursus', 'Kursus', '📋', (SELECT id FROM public.tags_normalized WHERE slug = 'læring-udvikling'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('online-kursus', 'Online', '💻', (SELECT id FROM public.tags_normalized WHERE slug = 'kursus'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('fysisk-kursus', 'Fysisk', '🏫', (SELECT id FROM public.tags_normalized WHERE slug = 'kursus'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('certificering', 'Certificering', '📜', (SELECT id FROM public.tags_normalized WHERE slug = 'kursus'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('mba', 'MBA', '🎓', (SELECT id FROM public.tags_normalized WHERE slug = 'kursus'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('masterclass', 'Masterclass', '👑', (SELECT id FROM public.tags_normalized WHERE slug = 'kursus'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bøger', 'Bøger & Skrivning', '📚', (SELECT id FROM public.tags_normalized WHERE slug = 'læring-udvikling'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bogklub-læring', 'Bogklub', '📖', (SELECT id FROM public.tags_normalized WHERE slug = 'bøger'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('skrivning-kursus', 'Skrivning', '✍️', (SELECT id FROM public.tags_normalized WHERE slug = 'bøger'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('lydbøger-læring', 'Lydbøger', '🎧', (SELECT id FROM public.tags_normalized WHERE slug = 'bøger'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bibliotek', 'Bibliotek', '🏛️', (SELECT id FROM public.tags_normalized WHERE slug = 'bøger'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('faglitteratur', 'Faglitteratur', '📕', (SELECT id FROM public.tags_normalized WHERE slug = 'bøger'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('selvhjælp', 'Selvhjælp', '💡', (SELECT id FROM public.tags_normalized WHERE slug = 'bøger'), (SELECT id FROM public.tag_categories WHERE slug = 'læring-udvikling'), 3);

-- ── 🙏 Spiritualitet & Livssyn ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('spiritualitet-livssyn', 'Spiritualitet & Livssyn', '🙏', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('spirituel-praksis', 'Spirituel praksis', '🕯️', (SELECT id FROM public.tags_normalized WHERE slug = 'spiritualitet-livssyn'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tarot', 'Tarot', '🃏', (SELECT id FROM public.tags_normalized WHERE slug = 'spirituel-praksis'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('astrologi', 'Astrologi', '⭐', (SELECT id FROM public.tags_normalized WHERE slug = 'spirituel-praksis'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('healing-spirit', 'Healing', '💫', (SELECT id FROM public.tags_normalized WHERE slug = 'spirituel-praksis'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('krystal-terapi', 'Krystalterapi', '💎', (SELECT id FROM public.tags_normalized WHERE slug = 'spirituel-praksis'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('chakra', 'Chakra', '🌀', (SELECT id FROM public.tags_normalized WHERE slug = 'spirituel-praksis'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('shamanism', 'Shamanisme', '🪶', (SELECT id FROM public.tags_normalized WHERE slug = 'spirituel-praksis'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('ayurveda', 'Ayurveda', '🌿', (SELECT id FROM public.tags_normalized WHERE slug = 'spirituel-praksis'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('religion-tro', 'Religion & Tro', '🕌', (SELECT id FROM public.tags_normalized WHERE slug = 'spiritualitet-livssyn'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kristendom', 'Kristendom', '✝️', (SELECT id FROM public.tags_normalized WHERE slug = 'religion-tro'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('buddhisme', 'Buddhisme', '☸️', (SELECT id FROM public.tags_normalized WHERE slug = 'religion-tro'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('islam', 'Islam', '☪️', (SELECT id FROM public.tags_normalized WHERE slug = 'religion-tro'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('jødedom', 'Jødedom', '✡️', (SELECT id FROM public.tags_normalized WHERE slug = 'religion-tro'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hinduisme', 'Hinduisme', '🕉️', (SELECT id FROM public.tags_normalized WHERE slug = 'religion-tro'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('nypaganism', 'Neopaganisme', '🌙', (SELECT id FROM public.tags_normalized WHERE slug = 'religion-tro'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('filosofi-livssyn', 'Filosofi & Livssyn', '🤔', (SELECT id FROM public.tags_normalized WHERE slug = 'spiritualitet-livssyn'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('stoicisme', 'Stoicisme', '🏛️', (SELECT id FROM public.tags_normalized WHERE slug = 'filosofi-livssyn'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('eksistentialisme', 'Eksistentialisme', '💭', (SELECT id FROM public.tags_normalized WHERE slug = 'filosofi-livssyn'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('etik', 'Etik', '⚖️', (SELECT id FROM public.tags_normalized WHERE slug = 'filosofi-livssyn'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('humanisme', 'Humanisme', '🤝', (SELECT id FROM public.tags_normalized WHERE slug = 'filosofi-livssyn'), (SELECT id FROM public.tag_categories WHERE slug = 'spiritualitet-livssyn'), 3);

-- ── 🌱 Have & Håndværk ──
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('have-håndværk', 'Have & Håndværk', '🌱', NULL, (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 1);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('havearbejde', 'Have', '🌻', (SELECT id FROM public.tags_normalized WHERE slug = 'have-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('kolonihave', 'Kolonihave', '🏡', (SELECT id FROM public.tags_normalized WHERE slug = 'havearbejde'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('urban-havearbejde', 'Urban dyrkning', '🌱', (SELECT id FROM public.tags_normalized WHERE slug = 'havearbejde'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('blomster', 'Blomster', '🌸', (SELECT id FROM public.tags_normalized WHERE slug = 'havearbejde'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('grøntsager', 'Grøntsager', '🥕', (SELECT id FROM public.tags_normalized WHERE slug = 'havearbejde'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('permakultur', 'Permakultur', '🌿', (SELECT id FROM public.tags_normalized WHERE slug = 'havearbejde'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('bier', 'Biavl', '🐝', (SELECT id FROM public.tags_normalized WHERE slug = 'havearbejde'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('diy-håndværk', 'DIY & Håndværk', '🔨', (SELECT id FROM public.tags_normalized WHERE slug = 'have-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('snedkeri', 'Snedkeri', '🪵', (SELECT id FROM public.tags_normalized WHERE slug = 'diy-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('smedning', 'Smedning', '⚒️', (SELECT id FROM public.tags_normalized WHERE slug = 'diy-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('maling-istandsæt', 'Maling & Istandsættelse', '🖌️', (SELECT id FROM public.tags_normalized WHERE slug = 'diy-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('el-arbejde', 'El-arbejde', '⚡', (SELECT id FROM public.tags_normalized WHERE slug = 'diy-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('murværk', 'Murværk', '🧱', (SELECT id FROM public.tags_normalized WHERE slug = 'diy-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('reparation', 'Reparation', '🔧', (SELECT id FROM public.tags_normalized WHERE slug = 'diy-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('3d-print-diy', '3D Print', '🖨️', (SELECT id FROM public.tags_normalized WHERE slug = 'diy-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('metal-arbejde', 'Metalarbejde', '⚙️', (SELECT id FROM public.tags_normalized WHERE slug = 'diy-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('tekstil-sy', 'Tekstil & Sy', '🧵', (SELECT id FROM public.tags_normalized WHERE slug = 'have-håndværk'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 2);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('syning-hobby', 'Syning', '🧵', (SELECT id FROM public.tags_normalized WHERE slug = 'tekstil-sy'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('strik-hobby', 'Strik', '🧶', (SELECT id FROM public.tags_normalized WHERE slug = 'tekstil-sy'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('hækling-hobby', 'Hækling', '🧶', (SELECT id FROM public.tags_normalized WHERE slug = 'tekstil-sy'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('broderi', 'Broderi', '🌸', (SELECT id FROM public.tags_normalized WHERE slug = 'tekstil-sy'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('quilting', 'Quilting', '🟦', (SELECT id FROM public.tags_normalized WHERE slug = 'tekstil-sy'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);
INSERT INTO public.tags_normalized (slug, name, emoji, parent_id, category_id, level)
VALUES ('weaving', 'Vævning', '🟩', (SELECT id FROM public.tags_normalized WHERE slug = 'tekstil-sy'), (SELECT id FROM public.tag_categories WHERE slug = 'have-håndværk'), 3);

-- ══════════════════════════════════════
-- STANDARDIZE main_categories on places
-- ══════════════════════════════════════

-- Fix inconsistent uppercase categories
UPDATE public.places SET main_categories = array_replace(main_categories, 'NATUR', 'natur') WHERE 'NATUR' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'SHELTER', 'overnatning') WHERE 'SHELTER' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'STRAND', 'natur') WHERE 'STRAND' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'BAD', 'natur') WHERE 'BAD' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'FISKERI', 'natur') WHERE 'FISKERI' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'LOB', 'aktiv_sport') WHERE 'LOB' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'BYNAER', 'natur') WHERE 'BYNAER' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'SPORT', 'aktiv_sport') WHERE 'SPORT' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'PARK', 'natur') WHERE 'PARK' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'CYKEL', 'aktiv_sport') WHERE 'CYKEL' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'KULTUR', 'kultur') WHERE 'KULTUR' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'MUSEUM', 'kultur') WHERE 'MUSEUM' = ANY(main_categories);

-- Fix long-form category names
UPDATE public.places SET main_categories = array_replace(main_categories, 'Natur & friluftsliv', 'natur') WHERE 'Natur & friluftsliv' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'Aktiv & sport', 'aktiv_sport') WHERE 'Aktiv & sport' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'Logi & base', 'overnatning') WHERE 'Logi & base' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'Ture & eventyr', 'natur') WHERE 'Ture & eventyr' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'Oplevelser & kultur', 'kultur') WHERE 'Oplevelser & kultur' = ANY(main_categories);
UPDATE public.places SET main_categories = array_replace(main_categories, 'Rejser & transport', 'underholdning') WHERE 'Rejser & transport' = ANY(main_categories);

-- Remove duplicates from main_categories arrays
UPDATE public.places SET main_categories = (SELECT ARRAY(SELECT DISTINCT unnest(main_categories))) WHERE array_length(main_categories, 1) > 1;

COMMIT;

-- ═══════════════════════════════════════
-- STATS: 22 categories, 92 L2 tags, 681 L3 tags
-- TOTAL: 795 tags in hierarchy
-- ═══════════════════════════════════════
