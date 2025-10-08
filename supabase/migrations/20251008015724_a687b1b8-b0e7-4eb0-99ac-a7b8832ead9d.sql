-- Create saved_questions table
CREATE TABLE IF NOT EXISTS public.saved_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL,
  saved_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE public.saved_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved questions"
  ON public.saved_questions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save questions"
  ON public.saved_questions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved questions"
  ON public.saved_questions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_saved_questions_user_id ON public.saved_questions(user_id);
CREATE INDEX idx_saved_questions_question_id ON public.saved_questions(question_id);