-- Add synchronized session fields to quiz_sessions table
ALTER TABLE public.quiz_sessions 
ADD COLUMN IF NOT EXISTS order_seed INTEGER,
ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Update status to ensure it supports all required states
COMMENT ON COLUMN public.quiz_sessions.status IS 'Session status: pending, active, completed';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_lobby_id ON public.quiz_sessions(lobby_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON public.quiz_sessions(status);