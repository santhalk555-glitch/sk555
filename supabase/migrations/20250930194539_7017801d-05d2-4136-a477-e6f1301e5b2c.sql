-- Add topic_id column to quiz_questions table with foreign key to topics
ALTER TABLE public.quiz_questions 
ADD COLUMN topic_id UUID REFERENCES public.topics(id);

-- Create index for better query performance
CREATE INDEX idx_quiz_questions_topic_id ON public.quiz_questions(topic_id);