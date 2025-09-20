-- Add quiz points and victory count to profiles table
ALTER TABLE public.profiles 
ADD COLUMN quiz_points INTEGER NOT NULL DEFAULT 100,
ADD COLUMN victory_count INTEGER NOT NULL DEFAULT 0;

-- Create recent activities table for real-time updates
CREATE TABLE public.recent_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on recent_activities
ALTER TABLE public.recent_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for recent_activities
CREATE POLICY "Users can view their own activities" 
ON public.recent_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
ON public.recent_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_recent_activities_user_id ON public.recent_activities(user_id);
CREATE INDEX idx_recent_activities_created_at ON public.recent_activities(created_at DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Add trigger for notifications when friend requests are received
CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  sender_username TEXT;
BEGIN
  -- Get sender's username
  SELECT username INTO sender_username 
  FROM public.profiles 
  WHERE user_id = NEW.sender_id;

  -- Create notification for receiver
  INSERT INTO public.notifications (user_id, title, message, type, metadata)
  VALUES (
    NEW.receiver_id,
    'New Friend Request',
    coalesce(sender_username, 'Someone') || ' sent you a friend request!',
    'friend_request',
    jsonb_build_object('request_id', NEW.id, 'sender_id', NEW.sender_id)
  );

  RETURN NEW;
END;
$$;

-- Create trigger for friend request notifications
CREATE TRIGGER friend_request_notification
AFTER INSERT ON public.friend_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_friend_request();

-- Add trigger for lobby invite notifications  
CREATE OR REPLACE FUNCTION public.notify_lobby_invite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  sender_username TEXT;
BEGIN
  -- Get sender's username
  SELECT username INTO sender_username 
  FROM public.profiles 
  WHERE user_id = NEW.sender_id;

  -- Create notification for receiver
  INSERT INTO public.notifications (user_id, title, message, type, metadata)
  VALUES (
    NEW.receiver_id,
    'Lobby Invitation',
    coalesce(sender_username, 'Someone') || ' invited you to join a quiz lobby!',
    'lobby_invite',
    jsonb_build_object('invite_id', NEW.id, 'lobby_id', NEW.lobby_id, 'sender_id', NEW.sender_id)
  );

  RETURN NEW;
END;
$$;

-- Create trigger for lobby invite notifications
CREATE TRIGGER lobby_invite_notification
AFTER INSERT ON public.lobby_invites
FOR EACH ROW
EXECUTE FUNCTION public.notify_lobby_invite();