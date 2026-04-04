-- Migration: 20260403_015_fix_events_source_constraint.sql
-- Fix: DROP the overly-restrictive CHECK constraint on events.source
-- Problem: import functions use source values like 'ticketmaster', 'eventbrite',
--          'openagenda', 'rapidapi', 'curated' — none of which were in the original
--          CHECK constraint ('manual', 'api', 'import'), causing every import insert
--          to silently fail with a constraint violation.

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_source_check;
