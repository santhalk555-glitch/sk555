-- Update quiz questions with proper topic and exam references
DO $$
DECLARE 
    rrb_je_id UUID;
    mech_topic_id UUID;
    thermal_topic_id UUID;
    civil_topic_id UUID;
    elec_topic_id UUID;
    machines_topic_id UUID;
BEGIN
    -- Get RRB JE exam ID
    SELECT id INTO rrb_je_id FROM competitive_exams_list WHERE name = 'RRB JE';
    
    -- Get topic IDs
    SELECT t.id INTO mech_topic_id 
    FROM topics t 
    JOIN subjects_hierarchy s ON t.subject_id = s.id 
    WHERE t.name = 'Engineering Mechanics' AND s.name = 'Mechanical & Allied Engineering';
    
    SELECT t.id INTO thermal_topic_id 
    FROM topics t 
    JOIN subjects_hierarchy s ON t.subject_id = s.id 
    WHERE t.name = 'Thermal Engineering' AND s.name = 'Mechanical & Allied Engineering';
    
    SELECT t.id INTO civil_topic_id 
    FROM topics t 
    JOIN subjects_hierarchy s ON t.subject_id = s.id 
    WHERE t.name = 'Building Construction' AND s.name = 'Civil & Allied Engineering';
    
    SELECT t.id INTO elec_topic_id 
    FROM topics t 
    JOIN subjects_hierarchy s ON t.subject_id = s.id 
    WHERE t.name = 'Basic Concepts' AND s.name = 'Electrical & Allied Engineering';
    
    SELECT t.id INTO machines_topic_id 
    FROM topics t 
    JOIN subjects_hierarchy s ON t.subject_id = s.id 
    WHERE t.name = 'Electrical Machines' AND s.name = 'Electrical & Allied Engineering';
    
    -- Update mechanical engineering questions
    UPDATE quiz_questions 
    SET exam_id = rrb_je_id, source_type = 'exam', topic_id = mech_topic_id
    WHERE subject = 'mechanical_engineering' AND (
        question ILIKE '%mechanics%' OR 
        question ILIKE '%force%' OR 
        question ILIKE '%equilibrium%' OR
        question ILIKE '%stress%' OR
        question ILIKE '%strain%'
    );
    
    UPDATE quiz_questions 
    SET exam_id = rrb_je_id, source_type = 'exam', topic_id = thermal_topic_id
    WHERE subject = 'mechanical_engineering' AND (
        question ILIKE '%heat%' OR 
        question ILIKE '%thermal%' OR 
        question ILIKE '%engine%' OR
        question ILIKE '%temperature%'
    );
    
    -- Update civil engineering questions
    UPDATE quiz_questions 
    SET exam_id = rrb_je_id, source_type = 'exam', topic_id = civil_topic_id
    WHERE subject = 'civil_engineering';
    
    -- Update electrical engineering questions
    UPDATE quiz_questions 
    SET exam_id = rrb_je_id, source_type = 'exam', topic_id = elec_topic_id
    WHERE subject = 'electrical_engineering' AND (
        question ILIKE '%current%' OR 
        question ILIKE '%voltage%' OR 
        question ILIKE '%resistance%' OR
        question ILIKE '%power%'
    );
    
    UPDATE quiz_questions 
    SET exam_id = rrb_je_id, source_type = 'exam', topic_id = machines_topic_id
    WHERE subject = 'electrical_engineering' AND (
        question ILIKE '%motor%' OR 
        question ILIKE '%transformer%' OR 
        question ILIKE '%generator%' OR
        question ILIKE '%machine%'
    );
    
END $$;