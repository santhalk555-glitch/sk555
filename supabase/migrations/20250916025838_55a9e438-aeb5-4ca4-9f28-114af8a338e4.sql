-- Create friend_requests table
CREATE TABLE public.friend_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(sender_id, receiver_id)
);

-- Create friends table for accepted friend relationships
CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Create lobby_invites table for real-time invites
CREATE TABLE public.lobby_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.game_lobbies(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_invites ENABLE ROW LEVEL SECURITY;

-- RLS policies for friend_requests
CREATE POLICY "Users can view their own friend requests" 
ON public.friend_requests 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests" 
ON public.friend_requests 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can respond to their friend requests" 
ON public.friend_requests 
FOR UPDATE 
USING (auth.uid() = receiver_id);

-- RLS policies for friends
CREATE POLICY "Users can view their friends" 
ON public.friends 
FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create friendships" 
ON public.friends 
FOR INSERT 
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS policies for lobby_invites
CREATE POLICY "Users can view their lobby invites" 
ON public.lobby_invites 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send lobby invites" 
ON public.lobby_invites 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can respond to lobby invites" 
ON public.lobby_invites 
FOR UPDATE 
USING (auth.uid() = receiver_id);

-- Function to create friendship when request is accepted
CREATE OR REPLACE FUNCTION public.create_friendship_on_accept()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Insert friendship (ensure user1_id < user2_id for consistency)
    INSERT INTO public.friends (user1_id, user2_id)
    VALUES (
      LEAST(NEW.sender_id, NEW.receiver_id),
      GREATEST(NEW.sender_id, NEW.receiver_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
    
    -- Set responded_at timestamp
    NEW.responded_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for creating friendship
CREATE TRIGGER create_friendship_trigger
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_friendship_on_accept();

-- Enable realtime for friend requests and lobby invites
ALTER TABLE public.friend_requests REPLICA IDENTITY FULL;
ALTER TABLE public.lobby_invites REPLICA IDENTITY FULL;