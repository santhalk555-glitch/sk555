-- Fix security warnings by setting search_path for functions
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
$$ LANGUAGE plpgsql SET search_path = public;

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
$$ LANGUAGE plpgsql SET search_path = public;