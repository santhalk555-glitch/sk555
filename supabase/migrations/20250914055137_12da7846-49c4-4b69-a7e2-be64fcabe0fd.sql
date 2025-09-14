-- Add 8-digit user ID to profiles table
ALTER TABLE public.profiles 
ADD COLUMN display_user_id TEXT UNIQUE;

-- Create function to generate 8-digit user ID
CREATE OR REPLACE FUNCTION generate_8_digit_user_id()
RETURNS TEXT AS $$
DECLARE
  random_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 8-digit number
    random_id := LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    -- Check if this ID already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE display_user_id = random_id) INTO id_exists;
    
    -- If it doesn't exist, return it
    IF NOT id_exists THEN
      RETURN random_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create new lobby tables for the simplified system
CREATE TABLE public.game_lobbies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_code TEXT UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_players INTEGER NOT NULL CHECK (max_players IN (2, 4)),
  current_players INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lobby participants table
CREATE TABLE public.lobby_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.game_lobbies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_user_id TEXT NOT NULL,
  slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 4),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lobby_id, user_id),
  UNIQUE(lobby_id, slot_number)
);

-- Enable RLS on new tables
ALTER TABLE public.game_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for game_lobbies
CREATE POLICY "Lobbies are viewable by everyone" 
ON public.game_lobbies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create lobbies" 
ON public.game_lobbies 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their lobbies" 
ON public.game_lobbies 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- RLS policies for lobby_participants
CREATE POLICY "Participants are viewable by everyone" 
ON public.lobby_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join lobbies" 
ON public.lobby_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add triggers for timestamps
CREATE TRIGGER update_game_lobbies_updated_at
  BEFORE UPDATE ON public.game_lobbies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate lobby code
CREATE OR REPLACE FUNCTION generate_lobby_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 6-character alphanumeric code
    code := upper(substring(md5(random()::text), 1, 6));
    
    -- Check if this code already exists
    SELECT EXISTS(SELECT 1 FROM public.game_lobbies WHERE lobby_code = code) INTO code_exists;
    
    -- If it doesn't exist, return it
    IF NOT code_exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;