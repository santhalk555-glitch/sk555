-- Add INSERT policy for quiz_sessions
-- Allow users to create quiz sessions if they're part of the lobby
CREATE POLICY "Users can create quiz sessions for their lobbies"
  ON public.quiz_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lobby_participants
      WHERE lobby_participants.lobby_id = quiz_sessions.lobby_id
      AND lobby_participants.user_id = auth.uid()
    )
  );