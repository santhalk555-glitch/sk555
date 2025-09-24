-- Insert or update master subjects list using valid source_type values
INSERT INTO public.subjects_hierarchy (name, simple_id, source_type) VALUES
-- Core Academic Subjects (General for both course and exam)
('Quantitative Aptitude', 'quantitative-aptitude', 'exam'),
('Reasoning Ability', 'reasoning-ability', 'exam'),
('Physics', 'physics', 'course'),
('Chemistry', 'chemistry', 'course'),
('Biology', 'biology', 'course'),

-- Mechanical Engineering Subjects
('Material Science', 'material-science', 'course'),
('Strength of Materials', 'strength-of-materials', 'course'),
('Machining', 'machining', 'course'),
('Welding', 'welding', 'course'),
('Grinding & Finishing Process', 'grinding-finishing-process', 'course'),
('Metrology', 'metrology', 'course'),
('Fluid Mechanics & Hydraulic Machinery', 'fluid-mechanics-hydraulic-machinery', 'course'),
('Industrial Management', 'industrial-management', 'course'),
('Thermal Engineering', 'thermal-engineering', 'course'),
('Engineering Mechanics', 'engineering-mechanics', 'course'),
('Theory of Machines', 'theory-of-machines', 'course'),
('Machine Design', 'machine-design', 'course'),
('Heat Transfer', 'heat-transfer', 'course'),
('Refrigeration and Air Conditioning', 'refrigeration-air-conditioning', 'course'),
('Production Engineering', 'production-engineering', 'course'),
('Power Plant Engineering', 'power-plant-engineering', 'course'),

-- Civil Engineering Subjects
('Building Construction', 'building-construction', 'course'),
('Building Materials', 'building-materials', 'course'),
('Construction of Substructure', 'construction-substructure', 'course'),
('Construction of Superstructure', 'construction-superstructure', 'course'),
('Building Finishes', 'building-finishes', 'course'),
('Building Maintenance', 'building-maintenance', 'course'),
('Building Drawing', 'building-drawing', 'course'),
('Concrete Technology', 'concrete-technology', 'course'),
('Surveying', 'surveying', 'course'),
('Computer Aided Design', 'computer-aided-design', 'course'),
('Geo Technical Engineering', 'geo-technical-engineering', 'course'),
('Hydraulics & Irrigation Engineering', 'hydraulics-irrigation-engineering', 'course'),
('Mechanics & Theory of Structures', 'mechanics-theory-structures', 'course'),
('Design of Concrete Structures', 'design-concrete-structures', 'course'),
('Design of Steel Structures', 'design-steel-structures', 'course'),
('Transportation & Highway Engineering', 'transportation-highway-engineering', 'course'),
('Environmental Engineering', 'environmental-engineering', 'course'),
('Advanced Construction Techniques & Equipment', 'advanced-construction-techniques-equipment', 'course'),
('Estimating, Costing, Contracts & Accounts', 'estimating-costing-contracts-accounts', 'course'),
('Structural Analysis', 'structural-analysis', 'course'),

-- Electrical Engineering Subjects
('Basic Concepts', 'basic-concepts', 'course'),
('Circuit Laws & Magnetic Circuits', 'circuit-laws-magnetic-circuits', 'course'),
('AC Fundamentals', 'ac-fundamentals', 'course'),
('Measurement & Measuring Instruments', 'measurement-measuring-instruments', 'course'),
('Electrical Machines', 'electrical-machines', 'course'),
('Power Systems', 'power-systems', 'course'),
('Power Electronics', 'power-electronics', 'course'),
('Generation, Transmission and Distribution', 'generation-transmission-distribution', 'course'),
('Switchgear and Protection', 'switchgear-protection', 'course'),
('Utilization of Electrical Energy', 'utilization-electrical-energy', 'course'),
('Control Systems', 'control-systems', 'course'),

-- Electronics & Communication Engineering Subjects
('Analog Electronics', 'analog-electronics', 'course'),
('Digital Electronics', 'digital-electronics', 'course'),
('Signals and Systems', 'signals-systems', 'course'),
('Electromagnetic Theory', 'electromagnetic-theory', 'course'),
('Communication Systems', 'communication-systems', 'course'),
('Microprocessors and Microcontrollers', 'microprocessors-microcontrollers', 'course'),
('VLSI Design', 'vlsi-design', 'course'),
('Embedded Systems', 'embedded-systems', 'course'),
('Optical Communication', 'optical-communication', 'course'),
('Wireless Communication', 'wireless-communication', 'course'),

-- Computer Science & Engineering Subjects
('Data Structures', 'data-structures', 'course'),
('Algorithms', 'algorithms', 'course'),
('Computer Networks', 'computer-networks', 'course'),
('Operating Systems', 'operating-systems', 'course'),
('Database Management Systems', 'database-management-systems', 'course'),
('Software Engineering', 'software-engineering', 'course'),
('Compiler Design', 'compiler-design', 'course'),
('Theory of Computation', 'theory-of-computation', 'course'),
('Artificial Intelligence', 'artificial-intelligence', 'course'),
('Machine Learning', 'machine-learning', 'course'),
('Data Science', 'data-science', 'course'),
('Cybersecurity', 'cybersecurity', 'course'),
('Cloud Computing', 'cloud-computing', 'course')

ON CONFLICT (simple_id) DO UPDATE SET
  name = EXCLUDED.name,
  source_type = EXCLUDED.source_type;

-- Create indexes for better performance on subject lookups
CREATE INDEX IF NOT EXISTS idx_subjects_hierarchy_simple_id ON public.subjects_hierarchy(simple_id);
CREATE INDEX IF NOT EXISTS idx_subjects_hierarchy_source_type ON public.subjects_hierarchy(source_type);

-- Ensure all quiz questions reference valid subject_simple_ids from the master list
UPDATE public.quiz_questions 
SET subject_simple_id = 'quantitative-aptitude'
WHERE subject_simple_id IS NULL OR subject_simple_id NOT IN (
  SELECT simple_id FROM public.subjects_hierarchy
);