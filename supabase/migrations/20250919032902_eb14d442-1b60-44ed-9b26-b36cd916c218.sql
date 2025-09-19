-- Update quiz questions to link with proper RRB JE topics

-- Update mechanical engineering questions
UPDATE quiz_questions 
SET source_type = 'exam', 
    exam_id = (SELECT id FROM competitive_exams_list WHERE name = 'RRB JE'),
    topic_id = (
      SELECT t.id FROM topics t 
      JOIN subjects_hierarchy s ON t.subject_id = s.id 
      WHERE s.name = 'Mechanical & Allied Engineering' 
      AND s.source_type = 'exam'
      AND t.name = CASE 
        WHEN quiz_questions.question LIKE '%mechanics%' OR quiz_questions.question LIKE '%force%' OR quiz_questions.question LIKE '%equilibrium%' THEN 'Engineering Mechanics'
        WHEN quiz_questions.question LIKE '%material%' OR quiz_questions.question LIKE '%steel%' OR quiz_questions.question LIKE '%properties%' THEN 'Material Science'  
        WHEN quiz_questions.question LIKE '%heat%' OR quiz_questions.question LIKE '%thermal%' OR quiz_questions.question LIKE '%engine%' THEN 'Thermal Engineering'
        ELSE 'Engineering Mechanics'  -- Default for mechanical
      END
      LIMIT 1
    )
WHERE subject = 'mechanical_engineering';

-- Update civil engineering questions  
UPDATE quiz_questions 
SET source_type = 'exam',
    exam_id = (SELECT id FROM competitive_exams_list WHERE name = 'RRB JE'),
    topic_id = (
      SELECT t.id FROM topics t 
      JOIN subjects_hierarchy s ON t.subject_id = s.id 
      WHERE s.name = 'Civil & Allied Engineering' 
      AND s.source_type = 'exam'
      AND t.name = CASE 
        WHEN quiz_questions.question LIKE '%construction%' OR quiz_questions.question LIKE '%building%' OR quiz_questions.question LIKE '%concrete%' THEN 'Building Construction'
        WHEN quiz_questions.question LIKE '%survey%' OR quiz_questions.question LIKE '%measurement%' OR quiz_questions.question LIKE '%theodolite%' THEN 'Surveying'
        ELSE 'Building Construction'  -- Default for civil
      END
      LIMIT 1
    )
WHERE subject = 'civil_engineering';

-- Update electrical engineering questions
UPDATE quiz_questions 
SET source_type = 'exam',
    exam_id = (SELECT id FROM competitive_exams_list WHERE name = 'RRB JE'), 
    topic_id = (
      SELECT t.id FROM topics t 
      JOIN subjects_hierarchy s ON t.subject_id = s.id 
      WHERE s.name = 'Electrical & Allied Engineering' 
      AND s.source_type = 'exam'
      AND t.name = CASE 
        WHEN quiz_questions.question LIKE '%current%' OR quiz_questions.question LIKE '%voltage%' OR quiz_questions.question LIKE '%resistance%' THEN 'Basic Concepts'
        WHEN quiz_questions.question LIKE '%motor%' OR quiz_questions.question LIKE '%transformer%' OR quiz_questions.question LIKE '%generator%' THEN 'Electrical Machines'
        ELSE 'Basic Concepts'  -- Default for electrical
      END
      LIMIT 1
    )
WHERE subject = 'electrical_engineering';