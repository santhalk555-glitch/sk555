-- Insert Biology topics
INSERT INTO public.topics (subject_id, name, simple_id) 
SELECT subject_id, name, simple_id FROM (VALUES
-- Blood Circulatory System
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Blood Circulatory System', 'blood_circulatory_system'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Heart Structure and Function', 'heart_structure_function'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Blood Vessels - Arteries, Veins, Capillaries', 'blood_vessels'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Blood Components and Functions', 'blood_components'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Blood Groups and Transfusion', 'blood_groups'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Blood Pressure and Circulation', 'blood_pressure_circulation'),

-- Respiratory System
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Respiratory System', 'respiratory_system'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Human Respiratory Organs', 'human_respiratory_organs'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Mechanism of Breathing', 'mechanism_of_breathing'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Gas Exchange in Alveoli', 'gas_exchange_alveoli'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Respiratory Disorders', 'respiratory_disorders'),

-- Excretory System
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Excretory System', 'excretory_system'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Kidney Structure and Nephron', 'kidney_structure_nephron'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Urine Formation Process', 'urine_formation'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Excretory Disorders', 'excretory_disorders'),

-- Digestive System
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Digestive System', 'digestive_system'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Alimentary Canal Structure', 'alimentary_canal'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Digestion in Mouth and Stomach', 'digestion_mouth_stomach'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Small and Large Intestine Functions', 'intestine_functions'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Digestive Enzymes and Glands', 'digestive_enzymes_glands'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Absorption and Assimilation', 'absorption_assimilation'),

-- Reproductive System in Humans
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Reproductive System in Humans', 'reproductive_system_humans'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Male Reproductive System', 'male_reproductive_system'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Female Reproductive System', 'female_reproductive_system'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Fertilization and Development', 'fertilization_development'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Reproductive Health', 'reproductive_health'),

-- Coordination in Humans
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Coordination in Humans', 'coordination_humans'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Nervous System Structure', 'nervous_system_structure'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Central and Peripheral Nervous System', 'central_peripheral_nervous'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Reflex Actions and Reflex Arc', 'reflex_actions'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Endocrine System and Hormones', 'endocrine_system_hormones'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Sense Organs', 'sense_organs'),

-- Cell
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Cell', 'cell'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Cell Theory and Discovery', 'cell_theory_discovery'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Cell Structure and Organelles', 'cell_structure_organelles'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Prokaryotic and Eukaryotic Cells', 'prokaryotic_eukaryotic_cells'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Cell Division - Mitosis and Meiosis', 'cell_division'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Cell Membrane and Transport', 'cell_membrane_transport'),

-- Tissue
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Tissue', 'tissue'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Plant Tissues - Meristematic and Permanent', 'plant_tissues'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Animal Tissues - Epithelial, Connective, Muscular, Nervous', 'animal_tissues'),

-- Skeletal System
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Skeletal System', 'skeletal_system'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Bone Structure and Types', 'bone_structure_types'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Human Skeletal System', 'human_skeletal_system'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Joints and Movements', 'joints_movements'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Skeletal Disorders', 'skeletal_disorders'),

-- Health & Disease
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Health & Disease', 'health_disease'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Types of Diseases', 'types_of_diseases'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Infectious Diseases and Pathogens', 'infectious_diseases_pathogens'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Immunity and Vaccination', 'immunity_vaccination'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Common Human Diseases', 'common_human_diseases'),

-- Different Branches of Biology
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Different Branches of Biology', 'branches_of_biology'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Zoology, Botany, Microbiology', 'zoology_botany_microbiology'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Genetics, Ecology, Taxonomy', 'genetics_ecology_taxonomy'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Anatomy, Physiology, Biochemistry', 'anatomy_physiology_biochemistry'),

-- Biodiversity
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Biodiversity', 'biodiversity'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Classification of Living Organisms', 'classification_living_organisms'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Five Kingdom Classification', 'five_kingdom_classification'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Ecosystem and Food Chain', 'ecosystem_food_chain'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Conservation of Biodiversity', 'conservation_biodiversity'),

-- Evolution
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Evolution', 'evolution'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Darwin Theory of Evolution', 'darwin_theory_evolution'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Natural Selection and Adaptation', 'natural_selection_adaptation'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Evidence of Evolution', 'evidence_of_evolution'),

-- Biotechnology
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Biotechnology', 'biotechnology'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'DNA and Genetic Engineering', 'dna_genetic_engineering'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Cloning and GM Crops', 'cloning_gm_crops'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Applications of Biotechnology', 'applications_biotechnology'),

-- Reproductive System in Plants
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Reproductive System in Plants', 'reproductive_system_plants'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Flower Structure and Functions', 'flower_structure_functions'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Pollination and Fertilization in Plants', 'pollination_fertilization_plants'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Seed Formation and Dispersal', 'seed_formation_dispersal'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Asexual Reproduction in Plants', 'asexual_reproduction_plants'),

-- Nutrition
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Nutrition', 'nutrition'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Modes of Nutrition', 'modes_of_nutrition'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Photosynthesis in Plants', 'photosynthesis_plants'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Nutrition in Animals', 'nutrition_animals'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Vitamins and Minerals', 'vitamins_minerals'),
((SELECT id FROM subjects_hierarchy WHERE simple_id = 'biology'), 'Balanced Diet and Deficiency Diseases', 'balanced_diet_deficiency')
) AS new_topics(subject_id, name, simple_id)
WHERE NOT EXISTS (
  SELECT 1 FROM public.topics 
  WHERE topics.subject_id = new_topics.subject_id 
  AND topics.simple_id = new_topics.simple_id
);