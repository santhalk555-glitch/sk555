-- Create banned_users table to store user bans
CREATE TABLE public.banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  banned_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, banned_user_id)
);

-- Enable RLS
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own ban list
CREATE POLICY "Users can view their own bans"
ON public.banned_users
FOR SELECT
USING (auth.uid() = user_id);

-- Users can ban other users
CREATE POLICY "Users can ban others"
ON public.banned_users
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unban users they banned
CREATE POLICY "Users can unban others"
ON public.banned_users
FOR DELETE
USING (auth.uid() = user_id);

-- Create user_reports table for reporting users
CREATE TABLE public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.user_reports
FOR SELECT
USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can report others"
ON public.user_reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Create indexes for better performance
CREATE INDEX idx_banned_users_user_id ON public.banned_users(user_id);
CREATE INDEX idx_banned_users_banned_user_id ON public.banned_users(banned_user_id);
CREATE INDEX idx_user_reports_reporter_id ON public.user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported_user_id ON public.user_reports(reported_user_id);
CREATE INDEX idx_user_reports_status ON public.user_reports(status);