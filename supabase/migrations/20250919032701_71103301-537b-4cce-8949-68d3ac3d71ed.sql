-- Create subjects hierarchy for RRB JE branches (RRB JE exam already exists)  
INSERT INTO subjects_hierarchy (name, source_type, exam_id) 
SELECT 
  'Mechanical & Allied Engineering',
  'exam',
  (SELECT id FROM competitive_exams_list WHERE name = 'RRB JE')
WHERE NOT EXISTS (
  SELECT 1 FROM subjects_hierarchy 
  WHERE name = 'Mechanical & Allied Engineering' 
  AND source_type = 'exam'
);

INSERT INTO subjects_hierarchy (name, source_type, exam_id) 
SELECT 
  'Civil & Allied Engineering',
  'exam', 
  (SELECT id FROM competitive_exams_list WHERE name = 'RRB JE')
WHERE NOT EXISTS (
  SELECT 1 FROM subjects_hierarchy 
  WHERE name = 'Civil & Allied Engineering' 
  AND source_type = 'exam'
);

INSERT INTO subjects_hierarchy (name, source_type, exam_id) 
SELECT 
  'Electrical & Allied Engineering',
  'exam',
  (SELECT id FROM competitive_exams_list WHERE name = 'RRB JE')
WHERE NOT EXISTS (
  SELECT 1 FROM subjects_hierarchy 
  WHERE name = 'Electrical & Allied Engineering' 
  AND source_type = 'exam'
);

-- Create topics for Mechanical Engineering
WITH mechanical_subject AS (
  SELECT id FROM subjects_hierarchy 
  WHERE name = 'Mechanical & Allied Engineering' AND source_type = 'exam'
)
INSERT INTO topics (name, subject_id)
SELECT topic, ms.id
FROM mechanical_subject ms,
UNNEST(ARRAY[
  'Engineering Mechanics',
  'Material Science', 
  'Strength of Materials',
  'Machining',
  'Welding',
  'Grinding & Finishing Process',
  'Metrology',
  'Fluid Mechanics & Hydraulic Machinery (FM & HM)',
  'Industrial Management',
  'Thermal Engineering'
]) AS topic
WHERE NOT EXISTS (
  SELECT 1 FROM topics t WHERE t.name = topic AND t.subject_id = ms.id
);

-- Create topics for Civil Engineering  
WITH civil_subject AS (
  SELECT id FROM subjects_hierarchy 
  WHERE name = 'Civil & Allied Engineering' AND source_type = 'exam'
)
INSERT INTO topics (name, subject_id)
SELECT topic, cs.id
FROM civil_subject cs,
UNNEST(ARRAY[
  'Engineering Mechanics',
  'Building Construction',
  'Building Materials',
  'Construction of Substructure', 
  'Construction of Superstructure',
  'Building Finishes',
  'Building Maintenance',
  'Building Drawing',
  'Concrete Technology',
  'Surveying',
  'Computer Aided Design (CAD)',
  'Geo Technical Engineering',
  'Hydraulics & Irrigation Engineering',
  'Mechanics & Theory of Structures',
  'Design of Concrete & Steel Structures',
  'Transportation & Highway Engineering',
  'Environmental Engineering',
  'Advanced Construction Techniques & Equipment',
  'Estimating, Costing, Contracts & Accounts' 
]) AS topic
WHERE NOT EXISTS (
  SELECT 1 FROM topics t WHERE t.name = topic AND t.subject_id = cs.id
);

-- Create topics for Electrical Engineering
WITH electrical_subject AS (
  SELECT id FROM subjects_hierarchy 
  WHERE name = 'Electrical & Allied Engineering' AND source_type = 'exam'
)
INSERT INTO topics (name, subject_id)
SELECT topic, es.id
FROM electrical_subject es,
UNNEST(ARRAY[
  'Basic Concepts',
  'Circuit Laws & Magnetic Circuits', 
  'AC Fundamentals, Polyphase System',
  'Measurement & Measuring Instruments',
  'Electrical Machines',
  'Generation, Transmission, Distribution & Switchgear',
  'Estimation & Costing',
  'Utilization of Electrical Energy'
]) AS topic
WHERE NOT EXISTS (
  SELECT 1 FROM topics t WHERE t.name = topic AND t.subject_id = es.id
);