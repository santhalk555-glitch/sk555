-- Clear existing subjects and create master subjects list
DELETE FROM public.subjects_hierarchy;

-- Insert master subjects list with unique simple_ids
INSERT INTO public.subjects_hierarchy (name, simple_id, source_type) VALUES
-- Core Academic Subjects
('Quantitative Aptitude', 'quantitative-aptitude', 'general'),
('Reasoning Ability', 'reasoning-ability', 'general'),
('Physics', 'physics', 'general'),
('Chemistry', 'chemistry', 'general'),
('Biology', 'biology', 'general'),

-- Mechanical Engineering Subjects
('Material Science', 'material-science', 'mechanical'),
('Strength of Materials', 'strength-of-materials', 'mechanical'),
('Machining', 'machining', 'mechanical'),
('Welding', 'welding', 'mechanical'),
('Grinding & Finishing Process', 'grinding-finishing-process', 'mechanical'),
('Metrology', 'metrology', 'mechanical'),
('Fluid Mechanics & Hydraulic Machinery', 'fluid-mechanics-hydraulic-machinery', 'mechanical'),
('Industrial Management', 'industrial-management', 'mechanical'),
('Thermal Engineering', 'thermal-engineering', 'mechanical'),
('Engineering Mechanics', 'engineering-mechanics', 'mechanical'),
('Theory of Machines', 'theory-of-machines', 'mechanical'),
('Machine Design', 'machine-design', 'mechanical'),
('Heat Transfer', 'heat-transfer', 'mechanical'),
('Refrigeration and Air Conditioning', 'refrigeration-air-conditioning', 'mechanical'),
('Production Engineering', 'production-engineering', 'mechanical'),
('Power Plant Engineering', 'power-plant-engineering', 'mechanical'),

-- Civil Engineering Subjects
('Building Construction', 'building-construction', 'civil'),
('Building Materials', 'building-materials', 'civil'),
('Construction of Substructure', 'construction-substructure', 'civil'),
('Construction of Superstructure', 'construction-superstructure', 'civil'),
('Building Finishes', 'building-finishes', 'civil'),
('Building Maintenance', 'building-maintenance', 'civil'),
('Building Drawing', 'building-drawing', 'civil'),
('Concrete Technology', 'concrete-technology', 'civil'),
('Surveying', 'surveying', 'civil'),
('Computer Aided Design', 'computer-aided-design', 'civil'),
('Geo Technical Engineering', 'geo-technical-engineering', 'civil'),
('Hydraulics & Irrigation Engineering', 'hydraulics-irrigation-engineering', 'civil'),
('Mechanics & Theory of Structures', 'mechanics-theory-structures', 'civil'),
('Design of Concrete Structures', 'design-concrete-structures', 'civil'),
('Design of Steel Structures', 'design-steel-structures', 'civil'),
('Transportation & Highway Engineering', 'transportation-highway-engineering', 'civil'),
('Environmental Engineering', 'environmental-engineering', 'civil'),
('Advanced Construction Techniques & Equipment', 'advanced-construction-techniques-equipment', 'civil'),
('Estimating, Costing, Contracts & Accounts', 'estimating-costing-contracts-accounts', 'civil'),
('Structural Analysis', 'structural-analysis', 'civil'),

-- Electrical Engineering Subjects
('Basic Concepts', 'basic-concepts', 'electrical'),
('Circuit Laws & Magnetic Circuits', 'circuit-laws-magnetic-circuits', 'electrical'),
('AC Fundamentals', 'ac-fundamentals', 'electrical'),
('Measurement & Measuring Instruments', 'measurement-measuring-instruments', 'electrical'),
('Electrical Machines', 'electrical-machines', 'electrical'),
('Power Systems', 'power-systems', 'electrical'),
('Power Electronics', 'power-electronics', 'electrical'),
('Generation, Transmission and Distribution', 'generation-transmission-distribution', 'electrical'),
('Switchgear and Protection', 'switchgear-protection', 'electrical'),
('Utilization of Electrical Energy', 'utilization-electrical-energy', 'electrical'),
('Control Systems', 'control-systems', 'electrical'),

-- Electronics & Communication Engineering Subjects
('Analog Electronics', 'analog-electronics', 'electronics'),
('Digital Electronics', 'digital-electronics', 'electronics'),
('Signals and Systems', 'signals-systems', 'electronics'),
('Electromagnetic Theory', 'electromagnetic-theory', 'electronics'),
('Communication Systems', 'communication-systems', 'electronics'),
('Microprocessors and Microcontrollers', 'microprocessors-microcontrollers', 'electronics'),
('VLSI Design', 'vlsi-design', 'electronics'),
('Embedded Systems', 'embedded-systems', 'electronics'),
('Optical Communication', 'optical-communication', 'electronics'),
('Wireless Communication', 'wireless-communication', 'electronics'),

-- Computer Science & Engineering Subjects
('Data Structures', 'data-structures', 'computer-science'),
('Algorithms', 'algorithms', 'computer-science'),
('Computer Networks', 'computer-networks', 'computer-science'),
('Operating Systems', 'operating-systems', 'computer-science'),
('Database Management Systems', 'database-management-systems', 'computer-science'),
('Software Engineering', 'software-engineering', 'computer-science'),
('Compiler Design', 'compiler-design', 'computer-science'),
('Theory of Computation', 'theory-of-computation', 'computer-science'),
('Artificial Intelligence', 'artificial-intelligence', 'computer-science'),
('Machine Learning', 'machine-learning', 'computer-science'),
('Data Science', 'data-science', 'computer-science'),
('Cybersecurity', 'cybersecurity', 'computer-science'),
('Cloud Computing', 'cloud-computing', 'computer-science');

-- Create index for better performance on subject lookups
CREATE INDEX IF NOT EXISTS idx_subjects_hierarchy_simple_id ON public.subjects_hierarchy(simple_id);
CREATE INDEX IF NOT EXISTS idx_subjects_hierarchy_source_type ON public.subjects_hierarchy(source_type);

-- Update any existing quiz questions to ensure they reference valid subject_simple_ids
-- This will help maintain consistency across the system
UPDATE public.quiz_questions 
SET subject_simple_id = CASE 
  WHEN subject_simple_id IS NULL THEN 'quantitative-aptitude'
  ELSE subject_simple_id
END
WHERE subject_simple_id IS NULL OR subject_simple_id NOT IN (
  SELECT simple_id FROM public.subjects_hierarchy
);