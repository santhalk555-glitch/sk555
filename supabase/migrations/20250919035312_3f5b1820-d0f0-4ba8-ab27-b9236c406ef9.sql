-- Add simple_id to topics table
ALTER TABLE public.topics ADD COLUMN simple_id TEXT;

-- Populate simple_id for topics with kebab-case versions of names
UPDATE public.topics SET simple_id = 
  CASE 
    -- RRB JE Mechanical topics
    WHEN name = 'Engineering Mechanics' THEN 'engineering-mechanics'
    WHEN name = 'Material Science' THEN 'material-science'
    WHEN name = 'Thermal Engineering' THEN 'thermal-engineering'
    WHEN name = 'Machining and Machine Tools' THEN 'machining-machine-tools'
    WHEN name = 'Strength of Materials' THEN 'strength-of-materials'
    WHEN name = 'Welding Technology' THEN 'welding-technology'
    WHEN name = 'Grinding and Finishing' THEN 'grinding-finishing'
    WHEN name = 'Metrology and Inspection' THEN 'metrology-inspection'
    WHEN name = 'Fluid Mechanics' THEN 'fluid-mechanics'
    WHEN name = 'Industrial Management' THEN 'industrial-management'
    
    -- RRB JE Civil topics
    WHEN name = 'Building Construction' THEN 'building-construction'
    WHEN name = 'Surveying' THEN 'surveying'
    WHEN name = 'Concrete Technology' THEN 'concrete-technology'
    WHEN name = 'Masonry Construction' THEN 'masonry-construction'
    WHEN name = 'Foundation Engineering' THEN 'foundation-engineering'
    WHEN name = 'Technical Drawing' THEN 'technical-drawing'
    WHEN name = 'Hydraulics' THEN 'hydraulics'
    WHEN name = 'Transportation Engineering' THEN 'transportation-engineering'
    WHEN name = 'Environmental Engineering' THEN 'environmental-engineering'
    WHEN name = 'Geotechnical Engineering' THEN 'geotechnical-engineering'
    WHEN name = 'Structural Engineering' THEN 'structural-engineering'
    WHEN name = 'Estimating and Costing' THEN 'estimating-costing'
    
    -- RRB JE Electrical topics
    WHEN name = 'Basic Concepts' THEN 'basic-concepts'
    WHEN name = 'Circuit Theory' THEN 'circuit-theory'
    WHEN name = 'AC Fundamentals' THEN 'ac-fundamentals'
    WHEN name = 'Measurement and Instrumentation' THEN 'measurement-instrumentation'
    WHEN name = 'Electrical Machines' THEN 'electrical-machines'
    WHEN name = 'Power Generation' THEN 'power-generation'
    WHEN name = 'Transmission and Distribution' THEN 'transmission-distribution'
    WHEN name = 'Switchgear and Protection' THEN 'switchgear-protection'
    WHEN name = 'Electrical Installation' THEN 'electrical-installation'
    WHEN name = 'Estimation and Costing' THEN 'estimation-costing'
    WHEN name = 'Utilization of Electrical Energy' THEN 'utilization-electrical-energy'
    
    -- General subjects - convert to kebab-case
    ELSE LOWER(REPLACE(REPLACE(REPLACE(name, ' & ', '-'), ' ', '-'), '--', '-'))
  END;

-- Add topic_simple_id to quiz_questions
ALTER TABLE public.quiz_questions ADD COLUMN topic_simple_id TEXT;

-- Add topic_simple_id to game_lobbies  
ALTER TABLE public.game_lobbies ADD COLUMN topic_simple_id TEXT;

-- Populate topic_simple_id in quiz_questions based on existing topic_id
UPDATE public.quiz_questions 
SET topic_simple_id = topics.simple_id
FROM public.topics 
WHERE quiz_questions.topic_id = topics.id;

-- Populate topic_simple_id in game_lobbies based on existing topic_id
UPDATE public.game_lobbies 
SET topic_simple_id = topics.simple_id
FROM public.topics 
WHERE game_lobbies.topic_id = topics.id;

-- Make simple_id NOT NULL and unique for topics
ALTER TABLE public.topics ALTER COLUMN simple_id SET NOT NULL;
ALTER TABLE public.topics ADD CONSTRAINT topics_simple_id_unique UNIQUE (simple_id);

-- Create index for better performance
CREATE INDEX idx_topics_simple_id ON public.topics(simple_id);
CREATE INDEX idx_quiz_questions_topic_simple_id ON public.quiz_questions(topic_simple_id);
CREATE INDEX idx_game_lobbies_topic_simple_id ON public.game_lobbies(topic_simple_id);