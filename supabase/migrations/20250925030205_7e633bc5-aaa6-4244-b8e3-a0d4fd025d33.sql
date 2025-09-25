-- Create new branches table (replaces subjects_hierarchy)
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  simple_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  course_id UUID,
  course_simple_id TEXT,
  exam_id UUID,
  exam_simple_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraints
  CONSTRAINT branches_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT branches_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.competitive_exams_list(id)
);

-- Create new subjects table (replaces topics)
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  simple_id TEXT NOT NULL,
  branch_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraint
  CONSTRAINT subjects_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);

-- Enable RLS on both tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for branches (same as subjects_hierarchy)
CREATE POLICY "Branches are viewable by everyone" 
ON public.branches 
FOR SELECT 
USING (true);

-- Create RLS policies for subjects (same as topics)
CREATE POLICY "Subjects are viewable by everyone" 
ON public.subjects 
FOR SELECT 
USING (true);

-- Migrate data from subjects_hierarchy to branches
INSERT INTO public.branches (
  id, name, simple_id, source_type, course_id, course_simple_id, 
  exam_id, exam_simple_id, created_at
)
SELECT 
  id, name, simple_id, source_type, course_id, course_simple_id,
  exam_id, exam_simple_id, created_at
FROM public.subjects_hierarchy;

-- Migrate data from topics to subjects (updating foreign key reference)
INSERT INTO public.subjects (
  id, name, simple_id, branch_id, created_at
)
SELECT 
  id, name, simple_id, subject_id, created_at
FROM public.topics;

-- Create indexes for performance
CREATE INDEX idx_branches_source_type ON public.branches(source_type);
CREATE INDEX idx_branches_course_simple_id ON public.branches(course_simple_id);
CREATE INDEX idx_branches_exam_simple_id ON public.branches(exam_simple_id);
CREATE INDEX idx_subjects_branch_id ON public.subjects(branch_id);

-- Update game_lobbies table to reference the new structure
-- Add new columns for the new table references
ALTER TABLE public.game_lobbies 
ADD COLUMN branch_id UUID,
ADD COLUMN branch_simple_id TEXT;

-- Update existing lobby records to use new branch references (copy from subject references)
UPDATE public.game_lobbies 
SET branch_id = subject_id, 
    branch_simple_id = subject_simple_id
WHERE subject_id IS NOT NULL;

-- Add foreign key constraint for branch reference
ALTER TABLE public.game_lobbies 
ADD CONSTRAINT game_lobbies_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);

-- Note: We'll keep the old columns for now to ensure compatibility during transition