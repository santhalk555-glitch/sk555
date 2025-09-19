-- Add simple_id to subjects_hierarchy table
ALTER TABLE public.subjects_hierarchy ADD COLUMN simple_id TEXT;

-- Populate simple_id for subjects with kebab-case versions of names, handling duplicates
WITH numbered_subjects AS (
  SELECT 
    id,
    name,
    source_type,
    ROW_NUMBER() OVER (PARTITION BY name, source_type ORDER BY id) as rn
  FROM public.subjects_hierarchy
)
UPDATE public.subjects_hierarchy 
SET simple_id = 
  CASE 
    -- Handle duplicates by adding suffix with source type
    WHEN numbered_subjects.rn > 1 THEN 
      LOWER(REPLACE(REPLACE(REPLACE(numbered_subjects.name, ' & ', '-'), ' ', '-'), '--', '-')) || '-' || numbered_subjects.source_type || '-' || numbered_subjects.rn::text
    
    -- Common subjects - convert to kebab-case with source type context
    WHEN numbered_subjects.name = 'Mathematics' AND numbered_subjects.source_type = 'course' THEN 'mathematics-course'
    WHEN numbered_subjects.name = 'Mathematics' AND numbered_subjects.source_type = 'exam' THEN 'mathematics-exam'
    WHEN numbered_subjects.name = 'Physics' AND numbered_subjects.source_type = 'course' THEN 'physics-course'
    WHEN numbered_subjects.name = 'Physics' AND numbered_subjects.source_type = 'exam' THEN 'physics-exam'
    WHEN numbered_subjects.name = 'Chemistry' AND numbered_subjects.source_type = 'course' THEN 'chemistry-course'
    WHEN numbered_subjects.name = 'Chemistry' AND numbered_subjects.source_type = 'exam' THEN 'chemistry-exam'
    WHEN numbered_subjects.name = 'English' AND numbered_subjects.source_type = 'course' THEN 'english-course'
    WHEN numbered_subjects.name = 'English' AND numbered_subjects.source_type = 'exam' THEN 'english-exam'
    
    -- Engineering subjects
    WHEN numbered_subjects.name = 'Data Structures' THEN 'data-structures'
    WHEN numbered_subjects.name = 'Algorithms' THEN 'algorithms'
    WHEN numbered_subjects.name = 'Computer Networks' THEN 'computer-networks'
    WHEN numbered_subjects.name = 'Operating Systems' THEN 'operating-systems'
    WHEN numbered_subjects.name = 'Database Management' THEN 'database-management'
    WHEN numbered_subjects.name = 'Software Engineering' THEN 'software-engineering'
    WHEN numbered_subjects.name = 'Computer Graphics' THEN 'computer-graphics'
    WHEN numbered_subjects.name = 'Artificial Intelligence' THEN 'artificial-intelligence'
    WHEN numbered_subjects.name = 'Machine Learning' THEN 'machine-learning'
    
    -- Mechanical Engineering subjects
    WHEN numbered_subjects.name = 'Thermodynamics' THEN 'thermodynamics'
    WHEN numbered_subjects.name = 'Fluid Mechanics' THEN 'fluid-mechanics'
    WHEN numbered_subjects.name = 'Heat Transfer' THEN 'heat-transfer'
    WHEN numbered_subjects.name = 'Manufacturing' THEN 'manufacturing'
    WHEN numbered_subjects.name = 'Materials Science' THEN 'materials-science'
    
    -- General subjects - convert to kebab-case with source type
    ELSE LOWER(REPLACE(REPLACE(REPLACE(numbered_subjects.name, ' & ', '-'), ' ', '-'), '--', '-')) || '-' || numbered_subjects.source_type
  END
FROM numbered_subjects
WHERE public.subjects_hierarchy.id = numbered_subjects.id;

-- Add subject_simple_id to quiz_questions
ALTER TABLE public.quiz_questions ADD COLUMN subject_simple_id TEXT;

-- Add subject_simple_id to game_lobbies  
ALTER TABLE public.game_lobbies ADD COLUMN subject_simple_id TEXT;

-- Populate subject_simple_id in quiz_questions based on existing subject_id
UPDATE public.quiz_questions 
SET subject_simple_id = subjects_hierarchy.simple_id
FROM public.subjects_hierarchy 
WHERE quiz_questions.subject_id = subjects_hierarchy.id;

-- Populate subject_simple_id in game_lobbies based on existing subject_id
UPDATE public.game_lobbies 
SET subject_simple_id = subjects_hierarchy.simple_id
FROM public.subjects_hierarchy 
WHERE game_lobbies.subject_id = subjects_hierarchy.id;

-- Make simple_id NOT NULL and unique for subjects_hierarchy
ALTER TABLE public.subjects_hierarchy ALTER COLUMN simple_id SET NOT NULL;
ALTER TABLE public.subjects_hierarchy ADD CONSTRAINT subjects_hierarchy_simple_id_unique UNIQUE (simple_id);

-- Create indexes for better performance
CREATE INDEX idx_subjects_hierarchy_simple_id ON public.subjects_hierarchy(simple_id);
CREATE INDEX idx_quiz_questions_subject_simple_id ON public.quiz_questions(subject_simple_id);
CREATE INDEX idx_game_lobbies_subject_simple_id ON public.game_lobbies(subject_simple_id);