-- Add soft delete fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of expired deletions
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_expires 
ON public.profiles(deletion_expires_at) 
WHERE is_deleted = true AND deletion_expires_at IS NOT NULL;

-- Create audit log table for deletion tracking
CREATE TABLE IF NOT EXISTS public.account_deletion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.account_deletion_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (when admin system is implemented)
CREATE POLICY "Audit logs are internal only"
ON public.account_deletion_audit
FOR SELECT
TO authenticated
USING (false);