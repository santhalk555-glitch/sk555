-- Add main_category and sub_category to competitive_exams_list table
ALTER TABLE public.competitive_exams_list 
ADD COLUMN IF NOT EXISTS main_category TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS sub_category TEXT NOT NULL DEFAULT '';

-- Update profiles table to handle competitive exam selections with categories
-- First, rename the existing column if not already done
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'competitive_exams' AND data_type = 'ARRAY') THEN
        ALTER TABLE public.profiles RENAME COLUMN competitive_exams TO competitive_exams_old;
        ALTER TABLE public.profiles ADD COLUMN competitive_exams JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Update existing competitive exams with hierarchical structure
-- RRB / Railway exams
UPDATE public.competitive_exams_list 
SET main_category = 'RRB / Railway', sub_category = 'RRB JE'
WHERE simple_id = 'rrb_je' OR name ILIKE '%RRB JE%';

UPDATE public.competitive_exams_list 
SET main_category = 'RRB / Railway', sub_category = 'RRB NTPC'
WHERE simple_id = 'rrb_ntpc' OR name ILIKE '%RRB NTPC%';

UPDATE public.competitive_exams_list 
SET main_category = 'RRB / Railway', sub_category = 'RRB Group D'
WHERE simple_id = 'rrb_group_d' OR name ILIKE '%RRB Group D%';

UPDATE public.competitive_exams_list 
SET main_category = 'RRB / Railway', sub_category = 'RRB ALP'
WHERE simple_id = 'rrb_alp' OR name ILIKE '%RRB ALP%';

UPDATE public.competitive_exams_list 
SET main_category = 'RRB / Railway', sub_category = 'GDCE'
WHERE simple_id = 'railway_gdce' OR name ILIKE '%GDCE%';

-- SSC exams
UPDATE public.competitive_exams_list 
SET main_category = 'SSC', sub_category = 'SSC JE'
WHERE simple_id = 'ssc_je' OR name ILIKE '%SSC JE%';

UPDATE public.competitive_exams_list 
SET main_category = 'SSC', sub_category = 'SSC CGL'
WHERE simple_id = 'ssc_cgl' OR name ILIKE '%SSC CGL%';

UPDATE public.competitive_exams_list 
SET main_category = 'SSC', sub_category = 'SSC CHSL'
WHERE simple_id = 'ssc_chsl' OR name ILIKE '%SSC CHSL%';

-- GATE exams
UPDATE public.competitive_exams_list 
SET main_category = 'GATE', sub_category = 'Mechanical Engineering'
WHERE simple_id = 'gate_me' OR name ILIKE '%GATE%' AND name ILIKE '%Mechanical%';

-- UPSC exams
UPDATE public.competitive_exams_list 
SET main_category = 'UPSC', sub_category = 'Civil Services'
WHERE simple_id = 'upsc_civil_services' OR name ILIKE '%UPSC Civil Services%';

-- Banking exams
UPDATE public.competitive_exams_list 
SET main_category = 'Banking', sub_category = 'Probationary Officer'
WHERE simple_id = 'bank_po' OR name ILIKE '%Bank PO%';

UPDATE public.competitive_exams_list 
SET main_category = 'Banking', sub_category = 'Clerk'
WHERE simple_id = 'bank_clerk' OR name ILIKE '%Bank Clerk%';

-- Defense & Space exams
UPDATE public.competitive_exams_list 
SET main_category = 'Defense & Space', sub_category = 'ISRO'
WHERE simple_id = 'isro_scientist' OR name ILIKE '%ISRO%';

UPDATE public.competitive_exams_list 
SET main_category = 'Defense & Space', sub_category = 'DRDO'
WHERE simple_id = 'drdo_scientist' OR name ILIKE '%DRDO%';

UPDATE public.competitive_exams_list 
SET main_category = 'Defense & Space', sub_category = 'BARC'
WHERE simple_id = 'barc_oces' OR name ILIKE '%BARC%';

-- Other category
UPDATE public.competitive_exams_list 
SET main_category = 'Other', sub_category = 'Other'
WHERE simple_id = 'other_exam' OR name = 'Other' OR (main_category = '' AND sub_category = '');

-- Insert missing exams that don't exist yet
INSERT INTO public.competitive_exams_list (simple_id, name, main_category, sub_category) 
SELECT * FROM (VALUES
    ('rrb_ntpc_new', 'RRB NTPC', 'RRB / Railway', 'RRB NTPC'),
    ('rrb_group_d_new', 'RRB Group D', 'RRB / Railway', 'RRB Group D'),
    ('ssc_gd', 'SSC GD', 'SSC', 'SSC GD'),
    ('ssc_mts', 'SSC MTS', 'SSC', 'SSC MTS'),
    ('gate_ee_new', 'GATE - Electrical Engineering', 'GATE', 'Electrical Engineering'),
    ('gate_ce_new', 'GATE - Civil Engineering', 'GATE', 'Civil Engineering'),
    ('gate_cs_new', 'GATE - Computer Science', 'GATE', 'Computer Science'),
    ('gate_ec_new', 'GATE - Electronics & Communication', 'GATE', 'Electronics & Communication'),
    ('upsc_engineering_services', 'UPSC Engineering Services', 'UPSC', 'Engineering Services'),
    ('state_psc_je', 'State PSC JE', 'State PSC', 'Junior Engineer'),
    ('bank_so', 'Bank SO', 'Banking', 'Specialist Officer'),
    ('lic_aao', 'LIC AAO', 'Insurance & Finance', 'LIC'),
    ('rbi_grade_b', 'RBI Grade B', 'Insurance & Finance', 'RBI')
) AS new_exams(simple_id, name, main_category, sub_category)
WHERE NOT EXISTS (
    SELECT 1 FROM public.competitive_exams_list 
    WHERE competitive_exams_list.simple_id = new_exams.simple_id
);