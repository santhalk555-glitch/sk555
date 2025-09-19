-- Simple approach without conflict resolution
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
    IF NOT EXISTS (SELECT 1 FROM subjects_hierarchy WHERE name = 'Mechanical & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id) THEN
        INSERT INTO subjects_hierarchy (name, source_type, exam_id) VALUES ('Mechanical & Allied Engineering', 'exam', rrb_je_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM subjects_hierarchy WHERE name = 'Civil & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id) THEN
        INSERT INTO subjects_hierarchy (name, source_type, exam_id) VALUES ('Civil & Allied Engineering', 'exam', rrb_je_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM subjects_hierarchy WHERE name = 'Electrical & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id) THEN
        INSERT INTO subjects_hierarchy (name, source_type, exam_id) VALUES ('Electrical & Allied Engineering', 'exam', rrb_je_id);
    END IF;
    
    -- Get subject IDs
    SELECT id INTO mech_subject_id FROM subjects_hierarchy WHERE name = 'Mechanical & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id;
    SELECT id INTO civil_subject_id FROM subjects_hierarchy WHERE name = 'Civil & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id;  
    SELECT id INTO elec_subject_id FROM subjects_hierarchy WHERE name = 'Electrical & Allied Engineering' AND source_type = 'exam' AND exam_id = rrb_je_id;
    
    -- Insert Mechanical topics
    IF NOT EXISTS (SELECT 1 FROM topics WHERE name = 'Engineering Mechanics' AND subject_id = mech_subject_id) THEN
        INSERT INTO topics (name, subject_id) VALUES ('Engineering Mechanics', mech_subject_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM topics WHERE name = 'Material Science' AND subject_id = mech_subject_id) THEN
        INSERT INTO topics (name, subject_id) VALUES ('Material Science', mech_subject_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM topics WHERE name = 'Thermal Engineering' AND subject_id = mech_subject_id) THEN
        INSERT INTO topics (name, subject_id) VALUES ('Thermal Engineering', mech_subject_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM topics WHERE name = 'Machining' AND subject_id = mech_subject_id) THEN
        INSERT INTO topics (name, subject_id) VALUES ('Machining', mech_subject_id);
    END IF;
    
    -- Insert Civil topics  
    IF NOT EXISTS (SELECT 1 FROM topics WHERE name = 'Building Construction' AND subject_id = civil_subject_id) THEN
        INSERT INTO topics (name, subject_id) VALUES ('Building Construction', civil_subject_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM topics WHERE name = 'Surveying' AND subject_id = civil_subject_id) THEN
        INSERT INTO topics (name, subject_id) VALUES ('Surveying', civil_subject_id);
    END IF;
    
    -- Insert Electrical topics
    IF NOT EXISTS (SELECT 1 FROM topics WHERE name = 'Basic Concepts' AND subject_id = elec_subject_id) THEN
        INSERT INTO topics (name, subject_id) VALUES ('Basic Concepts', elec_subject_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM topics WHERE name = 'Electrical Machines' AND subject_id = elec_subject_id) THEN
        INSERT INTO topics (name, subject_id) VALUES ('Electrical Machines', elec_subject_id);
    END IF;
    
END $$;