-- First delete all topics that reference subjects_hierarchy
DELETE FROM topics;

-- Clear existing subjects that don't match our comprehensive list
DELETE FROM subjects_hierarchy;

-- Insert comprehensive subject list into subjects_hierarchy
INSERT INTO subjects_hierarchy (name, simple_id, exam_simple_id) VALUES
-- General subjects
('Quantitative Aptitude', 'quantitative-aptitude', NULL),
('Reasoning Ability', 'reasoning-ability', NULL),
('Physics', 'physics', NULL),
('Chemistry', 'chemistry', NULL),
('Biology', 'biology', NULL),

-- Mechanical Engineering subjects
('Material Science', 'material-science', 'rrb-je'),
('Strength of Materials', 'strength-of-materials', 'rrb-je'),
('Machining', 'machining', 'rrb-je'),
('Welding', 'welding', 'rrb-je'),
('Grinding & Finishing Process', 'grinding-finishing-process', 'rrb-je'),
('Metrology', 'metrology', 'rrb-je'),
('Fluid Mechanics & Hydraulic Machinery', 'fluid-mechanics-hydraulic-machinery', 'rrb-je'),
('Industrial Management', 'industrial-management', 'rrb-je'),
('Thermal Engineering', 'thermal-engineering', 'rrb-je'),
('Engineering Mechanics', 'engineering-mechanics', 'rrb-je'),
('Theory of Machines', 'theory-of-machines', 'rrb-je'),
('Machine Design', 'machine-design', 'rrb-je'),
('Heat Transfer', 'heat-transfer', 'rrb-je'),
('Refrigeration and Air Conditioning', 'refrigeration-air-conditioning', 'rrb-je'),
('Production Engineering', 'production-engineering', 'rrb-je'),
('Power Plant Engineering', 'power-plant-engineering', 'rrb-je'),

-- Civil Engineering subjects
('Building Construction', 'building-construction', 'rrb-je'),
('Building Materials', 'building-materials', 'rrb-je'),
('Construction of Substructure', 'construction-substructure', 'rrb-je'),
('Construction of Superstructure', 'construction-superstructure', 'rrb-je'),
('Building Finishes', 'building-finishes', 'rrb-je'),
('Building Maintenance', 'building-maintenance', 'rrb-je'),
('Building Drawing', 'building-drawing', 'rrb-je'),
('Concrete Technology', 'concrete-technology', 'rrb-je'),
('Surveying', 'surveying', 'rrb-je'),
('Computer Aided Design', 'computer-aided-design', 'rrb-je'),
('Geo Technical Engineering', 'geo-technical-engineering', 'rrb-je'),
('Hydraulics & Irrigation Engineering', 'hydraulics-irrigation-engineering', 'rrb-je'),
('Mechanics & Theory of Structures', 'mechanics-theory-structures', 'rrb-je'),
('Design of Concrete Structures', 'design-concrete-structures', 'rrb-je'),
('Design of Steel Structures', 'design-steel-structures', 'rrb-je'),
('Transportation & Highway Engineering', 'transportation-highway-engineering', 'rrb-je'),
('Environmental Engineering', 'environmental-engineering', 'rrb-je'),
('Advanced Construction Techniques & Equipment', 'advanced-construction-techniques', 'rrb-je'),
('Estimating, Costing, Contracts & Accounts', 'estimating-costing-contracts', 'rrb-je'),
('Structural Analysis', 'structural-analysis', 'rrb-je'),

-- Electrical Engineering subjects
('Basic Concepts', 'basic-concepts', 'rrb-je'),
('Circuit Laws & Magnetic Circuits', 'circuit-laws-magnetic-circuits', 'rrb-je'),
('AC Fundamentals', 'ac-fundamentals', 'rrb-je'),
('Measurement & Measuring Instruments', 'measurement-measuring-instruments', 'rrb-je'),
('Electrical Machines', 'electrical-machines', 'rrb-je'),
('Power Systems', 'power-systems', 'rrb-je'),
('Power Electronics', 'power-electronics', 'rrb-je'),
('Generation, Transmission and Distribution', 'generation-transmission-distribution', 'rrb-je'),
('Switchgear and Protection', 'switchgear-protection', 'rrb-je'),
('Utilization of Electrical Energy', 'utilization-electrical-energy', 'rrb-je'),
('Control Systems', 'control-systems', 'rrb-je'),

-- Electronics & Communication Engineering subjects
('Analog Electronics', 'analog-electronics', 'rrb-je'),
('Digital Electronics', 'digital-electronics', 'rrb-je'),
('Signals and Systems', 'signals-systems', 'rrb-je'),
('Electromagnetic Theory', 'electromagnetic-theory', 'rrb-je'),
('Communication Systems', 'communication-systems', 'rrb-je'),
('Microprocessors and Microcontrollers', 'microprocessors-microcontrollers', 'rrb-je'),
('VLSI Design', 'vlsi-design', 'rrb-je'),
('Embedded Systems', 'embedded-systems', 'rrb-je'),
('Optical Communication', 'optical-communication', 'rrb-je'),
('Wireless Communication', 'wireless-communication', 'rrb-je'),

-- Computer Science & Engineering subjects
('Data Structures', 'data-structures', 'rrb-je'),
('Algorithms', 'algorithms', 'rrb-je'),
('Computer Networks', 'computer-networks', 'rrb-je'),
('Operating Systems', 'operating-systems', 'rrb-je'),
('Database Management Systems', 'database-management-systems', 'rrb-je'),
('Software Engineering', 'software-engineering', 'rrb-je'),
('Compiler Design', 'compiler-design', 'rrb-je'),
('Theory of Computation', 'theory-computation', 'rrb-je'),
('Artificial Intelligence', 'artificial-intelligence', 'rrb-je'),
('Machine Learning', 'machine-learning', 'rrb-je'),
('Data Science', 'data-science', 'rrb-je'),
('Cybersecurity', 'cybersecurity', 'rrb-je'),
('Cloud Computing', 'cloud-computing', 'rrb-je');