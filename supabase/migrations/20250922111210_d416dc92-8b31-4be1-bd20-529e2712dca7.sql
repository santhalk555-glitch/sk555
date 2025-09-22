-- Add main_category and sub_category to competitive_exams_list table
ALTER TABLE public.competitive_exams_list 
ADD COLUMN main_category TEXT NOT NULL DEFAULT '',
ADD COLUMN sub_category TEXT NOT NULL DEFAULT '';

-- Update profiles table to handle competitive exam selections with categories
-- First, rename the existing column
ALTER TABLE public.profiles 
RENAME COLUMN competitive_exams TO competitive_exams_old;

-- Add new column for structured competitive exam data
ALTER TABLE public.profiles 
ADD COLUMN competitive_exams JSONB DEFAULT '[]'::jsonb;

-- Clear existing data and insert hierarchical competitive exam structure
DELETE FROM public.competitive_exams_list;

-- Insert RRB / Railway exams
INSERT INTO public.competitive_exams_list (simple_id, name, main_category, sub_category) VALUES
('rrb_je', 'RRB JE', 'RRB / Railway', 'RRB JE'),
('rrb_ntpc', 'RRB NTPC', 'RRB / Railway', 'RRB NTPC'),
('rrb_group_d', 'RRB Group D', 'RRB / Railway', 'RRB Group D'),
('rrb_alp', 'RRB ALP', 'RRB / Railway', 'RRB ALP'),
('railway_gdce', 'Railway GDCE', 'RRB / Railway', 'GDCE');

-- Insert SSC exams
INSERT INTO public.competitive_exams_list (simple_id, name, main_category, sub_category) VALUES
('ssc_je', 'SSC JE', 'SSC', 'SSC JE'),
('ssc_cgl', 'SSC CGL', 'SSC', 'SSC CGL'),
('ssc_chsl', 'SSC CHSL', 'SSC', 'SSC CHSL'),
('ssc_gd', 'SSC GD', 'SSC', 'SSC GD'),
('ssc_mts', 'SSC MTS', 'SSC', 'SSC MTS');

-- Insert GATE exams (branch-wise based on engineering courses)
INSERT INTO public.competitive_exams_list (simple_id, name, main_category, sub_category) VALUES
('gate_me', 'GATE - Mechanical Engineering', 'GATE', 'Mechanical Engineering'),
('gate_ee', 'GATE - Electrical Engineering', 'GATE', 'Electrical Engineering'),
('gate_ce', 'GATE - Civil Engineering', 'GATE', 'Civil Engineering'),
('gate_cs', 'GATE - Computer Science', 'GATE', 'Computer Science'),
('gate_ec', 'GATE - Electronics & Communication', 'GATE', 'Electronics & Communication'),
('gate_ch', 'GATE - Chemical Engineering', 'GATE', 'Chemical Engineering'),
('gate_ae', 'GATE - Aerospace Engineering', 'GATE', 'Aerospace Engineering'),
('gate_bt', 'GATE - Biotechnology', 'GATE', 'Biotechnology'),
('gate_in', 'GATE - Instrumentation Engineering', 'GATE', 'Instrumentation Engineering');

-- Insert UPSC exams
INSERT INTO public.competitive_exams_list (simple_id, name, main_category, sub_category) VALUES
('upsc_civil_services', 'UPSC Civil Services', 'UPSC', 'Civil Services'),
('upsc_engineering_services', 'UPSC Engineering Services', 'UPSC', 'Engineering Services'),
('upsc_geologist', 'UPSC Geologist', 'UPSC', 'Geologist'),
('upsc_nda', 'UPSC NDA', 'UPSC', 'NDA');

-- Insert State PSC exams
INSERT INTO public.competitive_exams_list (simple_id, name, main_category, sub_category) VALUES
('state_psc_je', 'State PSC JE', 'State PSC', 'Junior Engineer'),
('state_psc_apo', 'State PSC APO', 'State PSC', 'Assistant Professor'),
('state_psc_civil_services', 'State PSC Civil Services', 'State PSC', 'Civil Services');

-- Insert Banking exams
INSERT INTO public.competitive_exams_list (simple_id, name, main_category, sub_category) VALUES
('bank_po', 'Bank PO', 'Banking', 'Probationary Officer'),
('bank_clerk', 'Bank Clerk', 'Banking', 'Clerk'),
('bank_so', 'Bank SO', 'Banking', 'Specialist Officer'),
('ibps_rrb', 'IBPS RRB', 'Banking', 'Regional Rural Bank');

-- Insert Defense exams
INSERT INTO public.competitive_exams_list (simple_id, name, main_category, sub_category) VALUES
('isro_scientist', 'ISRO Scientist/Engineer', 'Defense & Space', 'ISRO'),
('drdo_scientist', 'DRDO Scientist/Engineer', 'Defense & Space', 'DRDO'),
('barc_oces', 'BARC OCES', 'Defense & Space', 'BARC'),
('naval_architect', 'Naval Architect', 'Defense & Space', 'Navy');

-- Insert Insurance & Finance exams
INSERT INTO public.competitive_exams_list (simple_id, name, main_category, sub_category) VALUES
('lic_aao', 'LIC AAO', 'Insurance & Finance', 'LIC'),
('niacl_ao', 'NIACL AO', 'Insurance & Finance', 'NIACL'),
('rbi_grade_b', 'RBI Grade B', 'Insurance & Finance', 'RBI');

-- Insert Other category
INSERT INTO public.competitive_exams_list (simple_id, name, main_category, sub_category) VALUES
('other_exam', 'Other', 'Other', 'Other');