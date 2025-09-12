-- Create enum for quiz subjects
CREATE TYPE public.quiz_subject AS ENUM (
  'aptitude_quantitative',
  'aptitude_reasoning', 
  'aptitude_verbal',
  'general_science',
  'mechanical_engineering',
  'civil_engineering',
  'electrical_engineering',
  'electronics_communication',
  'computer_science_it',
  'metallurgy',
  'chemical_engineering',
  'other_engineering'
);

-- Create enum for difficulty levels
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create enum for quiz status
CREATE TYPE public.quiz_status AS ENUM ('waiting', 'active', 'completed');

-- Create quiz_categories table
CREATE TABLE public.quiz_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject quiz_subject NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_lobbies table
CREATE TABLE public.quiz_lobbies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host_id UUID NOT NULL,
  subject quiz_subject NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  time_limit INTEGER NOT NULL DEFAULT 15, -- in minutes
  max_players INTEGER NOT NULL DEFAULT 10,
  current_players INTEGER NOT NULL DEFAULT 1,
  status quiz_status NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject quiz_subject NOT NULL,
  difficulty difficulty_level NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_participants table
CREATE TABLE public.quiz_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.quiz_lobbies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  answers JSONB DEFAULT '[]',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lobby_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.quiz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_categories (public read)
CREATE POLICY "Categories are viewable by everyone" 
ON public.quiz_categories 
FOR SELECT 
USING (true);

-- Create policies for quiz_lobbies
CREATE POLICY "Lobbies are viewable by everyone" 
ON public.quiz_lobbies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create lobbies" 
ON public.quiz_lobbies 
FOR INSERT 
WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update their lobbies" 
ON public.quiz_lobbies 
FOR UPDATE 
USING (host_id = auth.uid());

-- Create policies for quiz_questions (public read for now)
CREATE POLICY "Questions are viewable by everyone" 
ON public.quiz_questions 
FOR SELECT 
USING (true);

-- Create policies for quiz_participants
CREATE POLICY "Participants can view lobby participants" 
ON public.quiz_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join lobbies" 
ON public.quiz_participants 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" 
ON public.quiz_participants 
FOR UPDATE 
USING (user_id = auth.uid());

-- Insert sample quiz categories
INSERT INTO public.quiz_categories (name, subject, description) VALUES
('Quantitative Aptitude', 'aptitude_quantitative', 'Mathematics, Data Interpretation, Number Systems'),
('Logical Reasoning', 'aptitude_reasoning', 'Puzzles, Patterns, Logical Analysis'),
('Verbal Ability', 'aptitude_verbal', 'English Grammar, Reading Comprehension, Vocabulary'),
('General Science', 'general_science', 'Physics, Chemistry, Biology Fundamentals'),
('Mechanical Engineering', 'mechanical_engineering', 'Thermodynamics, Fluid Mechanics, Machine Design'),
('Civil Engineering', 'civil_engineering', 'Structural Analysis, Concrete Technology, Surveying'),
('Electrical Engineering', 'electrical_engineering', 'Power Systems, Control Systems, Electrical Machines'),
('Electronics & Communication', 'electronics_communication', 'Digital Electronics, Communication Systems, VLSI'),
('Computer Science & IT', 'computer_science_it', 'Data Structures, Algorithms, Programming, Networks'),
('Metallurgy', 'metallurgy', 'Material Science, Metal Processing, Alloys'),
('Chemical Engineering', 'chemical_engineering', 'Process Engineering, Reaction Engineering, Mass Transfer'),
('Other Engineering', 'other_engineering', 'Biotechnology, Aerospace, Environmental Engineering');

-- Insert sample questions for demonstration
INSERT INTO public.quiz_questions (subject, difficulty, question, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
('computer_science_it', 'easy', 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Management Language', 'a', 'HTML stands for Hyper Text Markup Language, the standard markup language for web pages.'),
('computer_science_it', 'medium', 'Which data structure follows LIFO principle?', 'Queue', 'Stack', 'Array', 'Linked List', 'b', 'Stack follows Last In First Out (LIFO) principle where the last element added is the first to be removed.'),
('aptitude_quantitative', 'easy', 'What is 25% of 80?', '15', '20', '25', '30', 'b', '25% of 80 = (25/100) × 80 = 20'),
('general_science', 'easy', 'What is the chemical symbol for water?', 'H2O', 'CO2', 'NaCl', 'O2', 'a', 'Water is composed of two hydrogen atoms and one oxygen atom, hence H2O.');