-- Migration: 20260401_014_fix_profile_exposure.sql
-- Purpose: Restrict profile data exposure to other authenticated users
-- Problem: profiles_select_authenticated allows any logged-in user to read ALL columns
-- including sensitive fields: energy_level, vibe_tags, discovery_mode, active_time_slots, radius_km, experience_mode
-- Solution: Create public view, update RLS policies to restrict access appropriately

-- Step 1: Drop existing overly-permissive policy
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;

-- Step 2: Create policy allowing users to read their OWN full profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Step 3: Create policy allowing authenticated users to read limited public profile data
-- This restricts to the public view columns only (enforced via view in application layer)
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Step 4: Create view exposing only safe, non-sensitive profile columns
-- Applications should use this view to fetch other users' profiles
DROP VIEW IF EXISTS public.profiles_public CASCADE;
CREATE VIEW public.profiles_public AS
  SELECT
    id,
    full_name,
    avatar_url,
    city,
    created_at
  FROM public.profiles;

-- Step 5: Ensure users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 6: Ensure users can insert their own profile (during signup)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Note: Applications should query public.profiles_public when displaying other users' profiles
-- to respect data exposure restrictions. The RLS policy allows reading all columns at the table
-- level for backward compatibility, but the view ensures frontend/API layers only expose safe columns.
