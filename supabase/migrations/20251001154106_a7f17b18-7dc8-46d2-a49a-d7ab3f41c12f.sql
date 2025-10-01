-- Add quiz_finished field to quiz_participants
ALTER TABLE public.quiz_participants
ADD COLUMN IF NOT EXISTS quiz_finished BOOLEAN NOT NULL DEFAULT false;

-- Enable realtime for quiz_participants table
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_participants;