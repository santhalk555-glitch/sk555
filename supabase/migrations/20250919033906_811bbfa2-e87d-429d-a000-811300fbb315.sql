-- Step 1: Add new simple identifier columns
ALTER TABLE courses ADD COLUMN simple_id TEXT;
ALTER TABLE competitive_exams_list ADD COLUMN simple_id TEXT;

-- Step 2: Update courses with simple identifiers
UPDATE courses SET simple_id = CASE 
  WHEN name = 'Computer Science Engineering' THEN 'cse'
  WHEN name = 'Mechanical Engineering' THEN 'mechanical'
  WHEN name = 'Artificial Intelligence and Machine Learning' THEN 'ai-ml'
  WHEN name = 'BBA' THEN 'bba'
  WHEN name = 'BA LLB' THEN 'ba-llb'
  WHEN name = 'MBBS (Medicine)' THEN 'mbbs'
  WHEN name = 'Physics' THEN 'physics'
  ELSE lower(replace(name, ' ', '-'))
END;

-- Step 3: Update competitive exams with simple identifiers  
UPDATE competitive_exams_list SET simple_id = CASE
  WHEN name = 'RRB JE' THEN 'rrb-je'  
  WHEN name = 'GATE' THEN 'gate'
  WHEN name = 'JEE Main' THEN 'jee-main'
  WHEN name = 'JEE Advanced' THEN 'jee-advanced'
  WHEN name = 'UPSC CSE' THEN 'upsc-cse'
  WHEN name = 'SSC CGL' THEN 'ssc-cgl'
  WHEN name = 'CLAT' THEN 'clat'
  WHEN name = 'CAT' THEN 'cat'
  WHEN name = 'NEET' THEN 'neet'
  ELSE lower(replace(name, ' ', '-'))
END;

-- Step 4: Add new simple foreign key columns to related tables
ALTER TABLE subjects_hierarchy ADD COLUMN course_simple_id TEXT;
ALTER TABLE subjects_hierarchy ADD COLUMN exam_simple_id TEXT;
ALTER TABLE quiz_questions ADD COLUMN course_simple_id TEXT;
ALTER TABLE quiz_questions ADD COLUMN exam_simple_id TEXT;
ALTER TABLE game_lobbies ADD COLUMN course_simple_id TEXT;
ALTER TABLE game_lobbies ADD COLUMN exam_simple_id TEXT;

-- Step 5: Populate the new foreign key columns
UPDATE subjects_hierarchy SET 
  course_simple_id = (SELECT simple_id FROM courses WHERE courses.id = subjects_hierarchy.course_id),
  exam_simple_id = (SELECT simple_id FROM competitive_exams_list WHERE competitive_exams_list.id = subjects_hierarchy.exam_id);

UPDATE quiz_questions SET 
  course_simple_id = (SELECT simple_id FROM courses WHERE courses.id = quiz_questions.course_id),
  exam_simple_id = (SELECT simple_id FROM competitive_exams_list WHERE competitive_exams_list.id = quiz_questions.exam_id);

UPDATE game_lobbies SET 
  course_simple_id = (SELECT simple_id FROM courses WHERE courses.id = game_lobbies.course_id),
  exam_simple_id = (SELECT simple_id FROM competitive_exams_list WHERE competitive_exams_list.id = game_lobbies.exam_id);

-- Step 6: Make simple_id columns NOT NULL and unique
ALTER TABLE courses ALTER COLUMN simple_id SET NOT NULL;
ALTER TABLE competitive_exams_list ALTER COLUMN simple_id SET NOT NULL;

CREATE UNIQUE INDEX courses_simple_id_idx ON courses(simple_id);
CREATE UNIQUE INDEX competitive_exams_simple_id_idx ON competitive_exams_list(simple_id);