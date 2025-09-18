-- Add new fields to game_lobbies table
ALTER TABLE public.game_lobbies 
ADD COLUMN source_type text CHECK (source_type IN ('course', 'exam')),
ADD COLUMN course_id uuid,
ADD COLUMN exam_id uuid,
ADD COLUMN subject_id uuid,
ADD COLUMN topic_id uuid;

-- Add new fields to quiz_questions table
ALTER TABLE public.quiz_questions
ADD COLUMN source_type text CHECK (source_type IN ('course', 'exam')),
ADD COLUMN course_id uuid,
ADD COLUMN exam_id uuid,
ADD COLUMN subject_id uuid,
ADD COLUMN topic_id uuid;

-- Create courses table
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  main_category text NOT NULL,
  sub_category text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create competitive_exams_list table
CREATE TABLE public.competitive_exams_list (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create subjects_hierarchy table
CREATE TABLE public.subjects_hierarchy (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('course', 'exam')),
  course_id uuid REFERENCES public.courses(id),
  exam_id uuid REFERENCES public.competitive_exams_list(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create topics table
CREATE TABLE public.topics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects_hierarchy(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitive_exams_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for courses
CREATE POLICY "Courses are viewable by everyone" 
ON public.courses 
FOR SELECT 
USING (true);

-- Create RLS policies for competitive_exams_list
CREATE POLICY "Competitive exams are viewable by everyone" 
ON public.competitive_exams_list 
FOR SELECT 
USING (true);

-- Create RLS policies for subjects_hierarchy
CREATE POLICY "Subjects are viewable by everyone" 
ON public.subjects_hierarchy 
FOR SELECT 
USING (true);

-- Create RLS policies for topics
CREATE POLICY "Topics are viewable by everyone" 
ON public.topics 
FOR SELECT 
USING (true);

-- Insert sample courses data
INSERT INTO public.courses (name, main_category, sub_category) VALUES
('Mechanical Engineering', 'Engineering and Technology', 'Core Branches'),
('Computer Science Engineering', 'Engineering and Technology', 'Core Branches'),
('Artificial Intelligence and Machine Learning', 'Engineering and Technology', 'Emerging / Modern Branches'),
('MBBS (Medicine)', 'Medical and Health Sciences', 'Medicine'),
('BBA', 'Commerce and Management', 'Business Administration'),
('Physics', 'Science', 'Pure Sciences'),
('BA LLB', 'Law and Legal Studies', 'Integrated Law');

-- Insert sample competitive exams data
INSERT INTO public.competitive_exams_list (name, category) VALUES
('JEE Main', 'Engineering'),
('JEE Advanced', 'Engineering'),
('NEET', 'Medical'),
('CAT', 'Management'),
('GATE', 'Engineering'),
('UPSC CSE', 'Civil Services'),
('SSC CGL', 'Government Jobs'),
('CLAT', 'Law');

-- Insert sample subjects for courses
INSERT INTO public.subjects_hierarchy (name, source_type, course_id) 
SELECT 'Mathematics', 'course', id FROM public.courses WHERE name = 'Mechanical Engineering';

INSERT INTO public.subjects_hierarchy (name, source_type, course_id) 
SELECT 'Physics', 'course', id FROM public.courses WHERE name = 'Mechanical Engineering';

INSERT INTO public.subjects_hierarchy (name, source_type, course_id) 
SELECT 'Data Structures', 'course', id FROM public.courses WHERE name = 'Computer Science Engineering';

INSERT INTO public.subjects_hierarchy (name, source_type, course_id) 
SELECT 'Algorithms', 'course', id FROM public.courses WHERE name = 'Computer Science Engineering';

-- Insert sample subjects for exams
INSERT INTO public.subjects_hierarchy (name, source_type, exam_id) 
SELECT 'Mathematics', 'exam', id FROM public.competitive_exams_list WHERE name = 'JEE Main';

INSERT INTO public.subjects_hierarchy (name, source_type, exam_id) 
SELECT 'Physics', 'exam', id FROM public.competitive_exams_list WHERE name = 'JEE Main';

INSERT INTO public.subjects_hierarchy (name, source_type, exam_id) 
SELECT 'Chemistry', 'exam', id FROM public.competitive_exams_list WHERE name = 'JEE Main';

-- Insert sample topics
INSERT INTO public.topics (name, subject_id) 
SELECT 'Calculus', id FROM public.subjects_hierarchy WHERE name = 'Mathematics' AND source_type = 'course' LIMIT 1;

INSERT INTO public.topics (name, subject_id) 
SELECT 'Linear Algebra', id FROM public.subjects_hierarchy WHERE name = 'Mathematics' AND source_type = 'course' LIMIT 1;

INSERT INTO public.topics (name, subject_id) 
SELECT 'Mechanics', id FROM public.subjects_hierarchy WHERE name = 'Physics' AND source_type = 'course' LIMIT 1;

INSERT INTO public.topics (name, subject_id) 
SELECT 'Arrays and Strings', id FROM public.subjects_hierarchy WHERE name = 'Data Structures' LIMIT 1;

INSERT INTO public.topics (name, subject_id) 
SELECT 'Coordinate Geometry', id FROM public.subjects_hierarchy WHERE name = 'Mathematics' AND source_type = 'exam' LIMIT 1;

INSERT INTO public.topics (name, subject_id) 
SELECT 'Organic Chemistry', id FROM public.subjects_hierarchy WHERE name = 'Chemistry' AND source_type = 'exam' LIMIT 1;