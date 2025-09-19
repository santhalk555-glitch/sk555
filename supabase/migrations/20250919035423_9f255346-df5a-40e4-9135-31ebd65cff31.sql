-- Add simple_id to topics table
ALTER TABLE public.topics ADD COLUMN simple_id TEXT;

-- Populate simple_id for topics with kebab-case versions of names, handling duplicates
WITH numbered_topics AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rn
  FROM public.topics
)
UPDATE public.topics 
SET simple_id = 
  CASE 
    -- Handle duplicates by adding suffix
    WHEN numbered_topics.rn > 1 THEN 
      LOWER(REPLACE(REPLACE(REPLACE(numbered_topics.name, ' & ', '-'), ' ', '-'), '--', '-')) || '-' || numbered_topics.rn::text
    
    -- RRB JE Mechanical topics
    WHEN numbered_topics.name = 'Engineering Mechanics' THEN 'engineering-mechanics'
    WHEN numbered_topics.name = 'Material Science' THEN 'material-science'
    WHEN numbered_topics.name = 'Thermal Engineering' THEN 'thermal-engineering'
    WHEN numbered_topics.name = 'Machining and Machine Tools' THEN 'machining-machine-tools'
    WHEN numbered_topics.name = 'Strength of Materials' THEN 'strength-of-materials'
    WHEN numbered_topics.name = 'Welding Technology' THEN 'welding-technology'
    WHEN numbered_topics.name = 'Grinding and Finishing' THEN 'grinding-finishing'
    WHEN numbered_topics.name = 'Metrology and Inspection' THEN 'metrology-inspection'
    WHEN numbered_topics.name = 'Fluid Mechanics' THEN 'fluid-mechanics'
    WHEN numbered_topics.name = 'Industrial Management' THEN 'industrial-management'
    
    -- RRB JE Civil topics
    WHEN numbered_topics.name = 'Building Construction' THEN 'building-construction'
    WHEN numbered_topics.name = 'Surveying' THEN 'surveying'
    WHEN numbered_topics.name = 'Concrete Technology' THEN 'concrete-technology'
    WHEN numbered_topics.name = 'Masonry Construction' THEN 'masonry-construction'
    WHEN numbered_topics.name = 'Foundation Engineering' THEN 'foundation-engineering'
    WHEN numbered_topics.name = 'Technical Drawing' THEN 'technical-drawing'
    WHEN numbered_topics.name = 'Hydraulics' THEN 'hydraulics'
    WHEN numbered_topics.name = 'Transportation Engineering' THEN 'transportation-engineering'
    WHEN numbered_topics.name = 'Environmental Engineering' THEN 'environmental-engineering'
    WHEN numbered_topics.name = 'Geotechnical Engineering' THEN 'geotechnical-engineering'
    WHEN numbered_topics.name = 'Structural Engineering' THEN 'structural-engineering'
    WHEN numbered_topics.name = 'Estimating and Costing' THEN 'estimating-costing'
    
    -- RRB JE Electrical topics
    WHEN numbered_topics.name = 'Basic Concepts' THEN 'basic-concepts'
    WHEN numbered_topics.name = 'Circuit Theory' THEN 'circuit-theory'
    WHEN numbered_topics.name = 'AC Fundamentals' THEN 'ac-fundamentals'
    WHEN numbered_topics.name = 'Measurement and Instrumentation' THEN 'measurement-instrumentation'
    WHEN numbered_topics.name = 'Electrical Machines' THEN 'electrical-machines'
    WHEN numbered_topics.name = 'Power Generation' THEN 'power-generation'
    WHEN numbered_topics.name = 'Transmission and Distribution' THEN 'transmission-distribution'
    WHEN numbered_topics.name = 'Switchgear and Protection' THEN 'switchgear-protection'
    WHEN numbered_topics.name = 'Electrical Installation' THEN 'electrical-installation'
    WHEN numbered_topics.name = 'Estimation and Costing' THEN 'estimation-costing'
    WHEN numbered_topics.name = 'Utilization of Electrical Energy' THEN 'utilization-electrical-energy'
    
    -- General subjects - convert to kebab-case
    ELSE LOWER(REPLACE(REPLACE(REPLACE(numbered_topics.name, ' & ', '-'), ' ', '-'), '--', '-'))
  END
FROM numbered_topics
WHERE public.topics.id = numbered_topics.id;

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