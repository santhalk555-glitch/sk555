-- Drop the problematic recursive policies on quiz_players
DROP POLICY IF EXISTS "Quiz players are viewable by session participants" ON public.quiz_players;
DROP POLICY IF EXISTS "Users can update their own quiz player record" ON public.quiz_players;
DROP POLICY IF EXISTS "Users can insert their own quiz player record" ON public.quiz_players;

-- Create non-recursive policies using session_id and lobby_id join
CREATE POLICY "Users can view quiz players in their session"
  ON public.quiz_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_sessions
      INNER JOIN public.lobby_participants ON lobby_participants.lobby_id = quiz_sessions.lobby_id
      WHERE quiz_sessions.id = quiz_players.session_id
      AND lobby_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own quiz player record"
  ON public.quiz_players FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quiz player record"
  ON public.quiz_players FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());