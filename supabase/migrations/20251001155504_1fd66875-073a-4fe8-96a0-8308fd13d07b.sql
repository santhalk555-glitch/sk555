-- Create quiz_sessions table
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.game_lobbies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  question_ids UUID[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_players table
CREATE TABLE IF NOT EXISTS public.quiz_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  answers JSONB DEFAULT '[]',
  quiz_finished BOOLEAN NOT NULL DEFAULT false,
  finished_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_sessions
CREATE POLICY "Quiz sessions are viewable by participants"
  ON public.quiz_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_players
      WHERE quiz_players.session_id = quiz_sessions.id
      AND quiz_players.user_id = auth.uid()
    )
  );

CREATE POLICY "Quiz sessions can be updated by participants"
  ON public.quiz_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_players
      WHERE quiz_players.session_id = quiz_sessions.id
      AND quiz_players.user_id = auth.uid()
    )
  );

-- RLS Policies for quiz_players
CREATE POLICY "Quiz players are viewable by session participants"
  ON public.quiz_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_players AS other_players
      WHERE other_players.session_id = quiz_players.session_id
      AND other_players.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own quiz player record"
  ON public.quiz_players FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own quiz player record"
  ON public.quiz_players FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX idx_quiz_sessions_lobby_id ON public.quiz_sessions(lobby_id);
CREATE INDEX idx_quiz_sessions_status ON public.quiz_sessions(status);
CREATE INDEX idx_quiz_players_session_id ON public.quiz_players(session_id);
CREATE INDEX idx_quiz_players_user_id ON public.quiz_players(user_id);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_players;

-- Create function to auto-complete session when all players finish
CREATE OR REPLACE FUNCTION public.check_session_completion()
RETURNS TRIGGER AS $$
DECLARE
  all_finished BOOLEAN;
  session_id_val UUID;
BEGIN
  -- Get the session_id from the updated record
  session_id_val := NEW.session_id;
  
  -- Check if all players in this session have finished
  SELECT bool_and(quiz_finished) INTO all_finished
  FROM public.quiz_players
  WHERE session_id = session_id_val;
  
  -- If all players finished, mark session as completed
  IF all_finished THEN
    UPDATE public.quiz_sessions
    SET status = 'completed',
        completed_at = now()
    WHERE id = session_id_val
    AND status != 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-complete session
CREATE TRIGGER trigger_check_session_completion
  AFTER UPDATE OF quiz_finished ON public.quiz_players
  FOR EACH ROW
  WHEN (NEW.quiz_finished = true)
  EXECUTE FUNCTION public.check_session_completion();