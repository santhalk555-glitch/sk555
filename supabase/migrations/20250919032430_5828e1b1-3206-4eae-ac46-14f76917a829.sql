-- Add topic information to existing RRB JE questions
-- Update mechanical engineering questions with specific topics
UPDATE quiz_questions 
SET source_type = 'exam', 
    topic_id = (SELECT id FROM topics WHERE name = 'Engineering Mechanics' AND subject_id IN (SELECT id FROM subjects_hierarchy WHERE name = 'Mechanical & Allied Engineering'))
WHERE subject = 'mechanical_engineering' AND question LIKE '%mechanics%' OR question LIKE '%force%' OR question LIKE '%equilibrium%';

UPDATE quiz_questions 
SET source_type = 'exam',
    topic_id = (SELECT id FROM topics WHERE name = 'Material Science' AND subject_id IN (SELECT id FROM subjects_hierarchy WHERE name = 'Mechanical & Allied Engineering'))
WHERE subject = 'mechanical_engineering' AND question LIKE '%material%' OR question LIKE '%steel%' OR question LIKE '%properties%';

UPDATE quiz_questions 
SET source_type = 'exam',
    topic_id = (SELECT id FROM topics WHERE name = 'Thermal Engineering' AND subject_id IN (SELECT id FROM subjects_hierarchy WHERE name = 'Mechanical & Allied Engineering'))
WHERE subject = 'mechanical_engineering' AND question LIKE '%heat%' OR question LIKE '%thermal%' OR question LIKE '%engine%';

-- Update civil engineering questions
UPDATE quiz_questions 
SET source_type = 'exam',
    topic_id = (SELECT id FROM topics WHERE name = 'Building Construction' AND subject_id IN (SELECT id FROM subjects_hierarchy WHERE name = 'Civil & Allied Engineering'))
WHERE subject = 'civil_engineering' AND question LIKE '%construction%' OR question LIKE '%building%' OR question LIKE '%concrete%';

UPDATE quiz_questions 
SET source_type = 'exam',
    topic_id = (SELECT id FROM topics WHERE name = 'Surveying' AND subject_id IN (SELECT id FROM subjects_hierarchy WHERE name = 'Civil & Allied Engineering'))
WHERE subject = 'civil_engineering' AND question LIKE '%survey%' OR question LIKE '%measurement%' OR question LIKE '%theodolite%';

-- Update electrical engineering questions  
UPDATE quiz_questions 
SET source_type = 'exam',
    topic_id = (SELECT id FROM topics WHERE name = 'Basic Concepts' AND subject_id IN (SELECT id FROM subjects_hierarchy WHERE name = 'Electrical & Allied Engineering'))
WHERE subject = 'electrical_engineering' AND question LIKE '%current%' OR question LIKE '%voltage%' OR question LIKE '%resistance%';

UPDATE quiz_questions 
SET source_type = 'exam',
    topic_id = (SELECT id FROM topics WHERE name = 'Electrical Machines' AND subject_id IN (SELECT id FROM subjects_hierarchy WHERE name = 'Electrical & Allied Engineering'))
WHERE subject = 'electrical_engineering' AND question LIKE '%motor%' OR question LIKE '%transformer%' OR question LIKE '%generator%';

-- Set exam_id for all RRB JE questions
UPDATE quiz_questions 
SET exam_id = (SELECT id FROM competitive_exams_list WHERE name = 'RRB JE')
WHERE subject IN ('mechanical_engineering', 'civil_engineering', 'electrical_engineering') AND source_type = 'exam';