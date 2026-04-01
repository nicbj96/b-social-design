-- C3 Fix: Enable RLS on 8 unprotected tables

-- event_participants
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ep_select_own" ON public.event_participants
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ep_insert_own" ON public.event_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "ep_delete_own" ON public.event_participants
  FOR DELETE USING (auth.uid() = user_id);

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- email_subscribers
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_sub_service_only" ON public.email_subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_own" ON public.notes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "up_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "up_update_own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "friendships_select_own" ON public.friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "friendships_insert_own" ON public.friendships
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = requester_id);

-- event_suggestions
ALTER TABLE public.event_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "es_select_own" ON public.event_suggestions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "es_insert_own" ON public.event_suggestions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
