-- Migration: 20260401_012_fix_rls_messages.sql
-- Fix: Private messages readable by anon users
-- Description: Drop existing policies that allow anonymous access to private messages
-- and conversations. Enforce that only authenticated users who are conversation
-- participants can read messages and conversations.

-- Messages table: Drop old policies and recreate with auth requirement
DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = sender_id
  );

-- Conversations table: Drop old policies and recreate with auth requirement
DROP POLICY IF EXISTS "conversations_select_participant" ON public.conversations;
CREATE POLICY "conversations_select_participant" ON public.conversations
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;
CREATE POLICY "conversations_insert" ON public.conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Conversation participants table: Drop old policies and recreate with auth requirement
DROP POLICY IF EXISTS "conversation_participants_select" ON public.conversation_participants;
CREATE POLICY "conversation_participants_select" ON public.conversation_participants
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
  );
