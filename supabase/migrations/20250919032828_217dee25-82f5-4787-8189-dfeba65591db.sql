-- Update quiz questions to link with proper RRB JE topics
-- Get RRB JE exam ID  
WITH rrb_je_exam AS (
  SELECT id as exam_id FROM competitive_exams_list WHERE name = 'RRB JE'
)

-- Update mechanical engineering questions
UPDATE quiz_questions 
SET source_type = 'exam', 
    exam_id = (SELECT exam_id FROM rrb_je_exam),
    topic_id = (
      SELECT t.id FROM topics t 
      JOIN subjects_hierarchy s ON t.subject_id = s.id 
      WHERE s.name = 'Mechanical & Allied Engineering' 
      AND s.source_type = 'exam'
      AND t.name = CASE 
        WHEN question LIKE '%mechanics%' OR question LIKE '%force%' OR question LIKE '%equilibrium%' THEN 'Engineering Mechanics'
        WHEN question LIKE '%material%' OR question LIKE '%steel%' OR question LIKE '%properties%' THEN 'Material Science'  
        WHEN question LIKE '%heat%' OR question LIKE '%thermal%' OR question LIKE '%engine%' THEN 'Thermal Engineering'
        ELSE 'Engineering Mechanics'  -- Default for mechanical
      END
      LIMIT 1
    )
WHERE subject = 'mechanical_engineering';

-- Update civil engineering questions  
UPDATE quiz_questions 
SET source_type = 'exam',
    exam_id = (SELECT exam_id FROM rrb_je_exam),
    topic_id = (
      SELECT t.id FROM topics t 
      JOIN subjects_hierarchy s ON t.subject_id = s.id 
      WHERE s.name = 'Civil & Allied Engineering' 
      AND s.source_type = 'exam'
      AND t.name = CASE 
        WHEN question LIKE '%construction%' OR question LIKE '%building%' OR question LIKE '%concrete%' THEN 'Building Construction'
        WHEN question LIKE '%survey%' OR question LIKE '%measurement%' OR question LIKE '%theodolite%' THEN 'Surveying'
        ELSE 'Building Construction'  -- Default for civil
      END
      LIMIT 1
    )
WHERE subject = 'civil_engineering';

-- Update electrical engineering questions
UPDATE quiz_questions 
SET source_type = 'exam',
    exam_id = (SELECT exam_id FROM rrb_je_exam), 
    topic_id = (
      SELECT t.id FROM topics t 
      JOIN subjects_hierarchy s ON t.subject_id = s.id 
      WHERE s.name = 'Electrical & Allied Engineering' 
      AND s.source_type = 'exam'
      AND t.name = CASE 
        WHEN question LIKE '%current%' OR question LIKE '%voltage%' OR question LIKE '%resistance%' THEN 'Basic Concepts'
        WHEN question LIKE '%motor%' OR question LIKE '%transformer%' OR question LIKE '%generator%' THEN 'Electrical Machines'
        ELSE 'Basic Concepts'  -- Default for electrical
      END
      LIMIT 1
    )
WHERE subject = 'electrical_engineering';