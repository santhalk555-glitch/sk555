-- Fix RLS policies for quiz_participants to allow insertions
DROP POLICY IF EXISTS "Users can insert their own quiz player record" ON quiz_participants;
DROP POLICY IF EXISTS "Users can join lobbies" ON quiz_participants;

CREATE POLICY "Users can insert quiz participant records"
ON quiz_participants
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix quiz_sessions RLS to avoid infinite recursion
-- The issue is that the policy checks quiz_players which references quiz_sessions
DROP POLICY IF EXISTS "Quiz sessions are viewable by participants" ON quiz_sessions;
DROP POLICY IF EXISTS "Quiz sessions can be updated by participants" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can create quiz sessions for their lobbies" ON quiz_sessions;

-- Allow participants in the lobby to view/create/update quiz sessions
CREATE POLICY "Lobby participants can view quiz sessions"
ON quiz_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lobby_participants
    WHERE lobby_participants.lobby_id = quiz_sessions.lobby_id
    AND lobby_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Lobby participants can create quiz sessions"
ON quiz_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lobby_participants
    WHERE lobby_participants.lobby_id = quiz_sessions.lobby_id
    AND lobby_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Lobby participants can update quiz sessions"
ON quiz_sessions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lobby_participants
    WHERE lobby_participants.lobby_id = quiz_sessions.lobby_id
    AND lobby_participants.user_id = auth.uid()
  )
);