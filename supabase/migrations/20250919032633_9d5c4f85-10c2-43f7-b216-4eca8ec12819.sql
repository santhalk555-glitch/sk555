-- Create subjects hierarchy for RRB JE branches (without conflict resolution)
DO $$
DECLARE 
    rrb_je_id UUID;
    mech_subject_id UUID;
    civil_subject_id UUID;
    elec_subject_id UUID;
BEGIN
    -- Get RRB JE exam ID
    SELECT id INTO rrb_je_id FROM competitive_exams_list WHERE name = 'RRB JE';
    
    -- Insert subjects if they don't exist
    INSERT INTO subjects_hierarchy (name, source_type, exam_id) 
    SELECT 'Mechanical & Allied Engineering', 'exam', rrb_je_id
    WHERE NOT EXISTS (SELECT 1 FROM subjects_hierarchy WHERE name = 'Mechanical & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id);
    
    INSERT INTO subjects_hierarchy (name, source_type, exam_id) 
    SELECT 'Civil & Allied Engineering', 'exam', rrb_je_id
    WHERE NOT EXISTS (SELECT 1 FROM subjects_hierarchy WHERE name = 'Civil & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id);
    
    INSERT INTO subjects_hierarchy (name, source_type, exam_id) 
    SELECT 'Electrical & Allied Engineering', 'exam', rrb_je_id
    WHERE NOT EXISTS (SELECT 1 FROM subjects_hierarchy WHERE name = 'Electrical & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id);
    
    -- Get subject IDs
    SELECT id INTO mech_subject_id FROM subjects_hierarchy WHERE name = 'Mechanical & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id;
    SELECT id INTO civil_subject_id FROM subjects_hierarchy WHERE name = 'Civil & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id;  
    SELECT id INTO elec_subject_id FROM subjects_hierarchy WHERE name = 'Electrical & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id;
    
    -- Insert Mechanical topics
    INSERT INTO topics (name, subject_id) VALUES ('Engineering Mechanics', mech_subject_id) ON CONFLICT (name, subject_id) DO NOTHING;
    INSERT INTO topics (name, subject_id) VALUES ('Material Science', mech_subject_id) ON CONFLICT (name, subject_id) DO NOTHING;
    INSERT INTO topics (name, subject_id) VALUES ('Thermal Engineering', mech_subject_id) ON CONFLICT (name, subject_id) DO NOTHING;
    INSERT INTO topics (name, subject_id) VALUES ('Machining', mech_subject_id) ON CONFLICT (name, subject_id) DO NOTHING;
    INSERT INTO topics (name, subject_id) VALUES ('Metrology', mech_subject_id) ON CONFLICT (name, subject_id) DO NOTHING;
    
    -- Insert Civil topics  
    INSERT INTO topics (name, subject_id) VALUES ('Building Construction', civil_subject_id) ON CONFLICT (name, subject_id) DO NOTHING;
    INSERT INTO topics (name, subject_id) VALUES ('Surveying', civil_subject_id) ON CONFLICT (name, subject_id) DO NOTHING;
    INSERT INTO topics (name, subject_id) VALUES ('Concrete Technology', civil_subject_id) ON CONFLICT (name, subject_id) DO NOTHING;
    
    -- Insert Electrical topics
    INSERT INTO topics (name, subject_id) VALUES ('Basic Concepts', elec_subject_id) ON CONFLICT (name, subject_id) DO NOTHING;
    INSERT INTO topics (name, subject_id) VALUES ('Electrical Machines', elec_subject_id) ON CONFLICT (name, subject_id) DO NOTHING;
    
END $$;