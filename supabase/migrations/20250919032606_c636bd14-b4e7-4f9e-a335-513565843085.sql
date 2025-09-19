-- First ensure RRB JE exam exists
INSERT INTO competitive_exams_list (name, category) 
VALUES ('RRB JE', 'Engineering')
ON CONFLICT (name) DO NOTHING;

-- Create subjects hierarchy for RRB JE branches
INSERT INTO subjects_hierarchy (name, source_type, exam_id) 
SELECT 
  'Mechanical & Allied Engineering',
  'exam',
  id
FROM competitive_exams_list 
WHERE name = 'RRB JE'
ON CONFLICT DO NOTHING;

INSERT INTO subjects_hierarchy (name, source_type, exam_id) 
SELECT 
  'Civil & Allied Engineering',
  'exam', 
  id
FROM competitive_exams_list 
WHERE name = 'RRB JE'
ON CONFLICT DO NOTHING;

INSERT INTO subjects_hierarchy (name, source_type, exam_id) 
SELECT 
  'Electrical & Allied Engineering',
  'exam',
  id  
FROM competitive_exams_list 
WHERE name = 'RRB JE'
ON CONFLICT DO NOTHING;

-- Create topics for Mechanical Engineering
INSERT INTO topics (name, subject_id)
SELECT topic, s.id
FROM subjects_hierarchy s,
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
WHERE s.name = 'Mechanical & Allied Engineering' AND s.source_type = 'exam'
ON CONFLICT DO NOTHING;

-- Create topics for Civil Engineering  
INSERT INTO topics (name, subject_id)
SELECT topic, s.id
FROM subjects_hierarchy s,
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
WHERE s.name = 'Civil & Allied Engineering' AND s.source_type = 'exam'  
ON CONFLICT DO NOTHING;

-- Create topics for Electrical Engineering
INSERT INTO topics (name, subject_id)
SELECT topic, s.id
FROM subjects_hierarchy s,
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
WHERE s.name = 'Electrical & Allied Engineering' AND s.source_type = 'exam'
ON CONFLICT DO NOTHING;