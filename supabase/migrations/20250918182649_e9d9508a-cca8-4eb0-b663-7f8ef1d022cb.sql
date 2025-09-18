-- Add RRB JE to competitive exams list
INSERT INTO competitive_exams_list (name, category) VALUES 
('RRB JE', 'Engineering');

-- Insert sample quiz questions for RRB JE topics
-- Mechanical Engineering questions
INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, subject, difficulty) VALUES
('What is the SI unit of force?', 'Newton', 'Joule', 'Watt', 'Pascal', 'a', 'Newton is the SI unit of force, defined as kg⋅m/s²', 'mechanical_engineering', 'easy'),
('Which law states that stress is proportional to strain within elastic limit?', 'Hooke''s Law', 'Newton''s Law', 'Pascal''s Law', 'Boyle''s Law', 'a', 'Hooke''s law states that stress is directly proportional to strain within the elastic limit', 'mechanical_engineering', 'medium'),
('The modulus of elasticity for steel is approximately:', '200 GPa', '70 GPa', '100 GPa', '300 GPa', 'a', 'The modulus of elasticity (Young''s modulus) for steel is approximately 200 GPa', 'mechanical_engineering', 'medium'),
('In machining, what does RPM stand for?', 'Revolutions Per Minute', 'Rotations Per Mile', 'Rapid Processing Mode', 'Relative Position Measure', 'a', 'RPM stands for Revolutions Per Minute, indicating spindle speed', 'mechanical_engineering', 'easy'),
('Which welding process uses a consumable electrode?', 'SMAW', 'TIG', 'Plasma welding', 'Laser welding', 'a', 'SMAW (Shielded Metal Arc Welding) uses a consumable electrode coated with flux', 'mechanical_engineering', 'medium'),

-- Civil Engineering questions  
('What is the standard size of a modular brick?', '190×90×90 mm', '200×100×100 mm', '230×110×70 mm', '250×120×80 mm', 'c', 'The standard modular brick size in India is 230×110×70 mm', 'civil_engineering', 'medium'),
('The maximum permissible deflection for a simply supported beam is:', 'L/250', 'L/350', 'L/500', 'L/200', 'a', 'For simply supported beams, maximum deflection is limited to L/250 where L is span', 'civil_engineering', 'medium'),
('Cement + Fine aggregate + Coarse aggregate + Water = ?', 'Concrete', 'Mortar', 'Plaster', 'Grout', 'a', 'Concrete is made by mixing cement, fine aggregate, coarse aggregate, and water', 'civil_engineering', 'easy'),
('The process of determining relative positions of points is called:', 'Surveying', 'Leveling', 'Contouring', 'Triangulation', 'a', 'Surveying is the science of determining relative positions of points on earth''s surface', 'civil_engineering', 'easy'),
('What is the standard consistency of cement?', '25-35%', '15-25%', '35-45%', '5-15%', 'a', 'Standard consistency of cement paste is typically 25-35% by weight of cement', 'civil_engineering', 'medium'),

-- Electrical Engineering questions
('Ohm''s law states that V = ?', 'I × R', 'I / R', 'R / I', 'I + R', 'a', 'Ohm''s law states that Voltage equals Current times Resistance (V = I × R)', 'electrical_engineering', 'easy'),
('The unit of electrical power is:', 'Watt', 'Joule', 'Ampere', 'Volt', 'a', 'Watt is the SI unit of electrical power', 'electrical_engineering', 'easy'),
('In a series circuit, the current is:', 'Same everywhere', 'Different at each point', 'Zero at some points', 'Maximum at the source', 'a', 'In a series circuit, current remains the same throughout the circuit', 'electrical_engineering', 'easy'),
('A transformer works on the principle of:', 'Mutual induction', 'Self induction', 'Electromagnetic induction', 'Electrostatic induction', 'a', 'Transformers work on the principle of mutual electromagnetic induction', 'electrical_engineering', 'medium'),
('The frequency of AC supply in India is:', '50 Hz', '60 Hz', '25 Hz', '100 Hz', 'a', 'The standard AC supply frequency in India is 50 Hz', 'electrical_engineering', 'easy'),

-- Additional questions for better variety
('What is the coefficient of friction for steel on steel (dry)?', '0.6', '0.3', '0.1', '0.9', 'a', 'The coefficient of static friction for steel on steel (dry) is approximately 0.6', 'mechanical_engineering', 'medium'),
('The property of a material to resist deformation is called:', 'Stiffness', 'Strength', 'Hardness', 'Toughness', 'a', 'Stiffness is the resistance of a material to deformation under load', 'mechanical_engineering', 'medium'),
('The centroid of a triangle is located at:', '1/3 from base', '1/2 from base', '2/3 from base', '1/4 from base', 'a', 'The centroid of a triangle is located at 1/3 the height from the base', 'civil_engineering', 'medium'),
('The water cement ratio for normal concrete is:', '0.4 to 0.6', '0.1 to 0.3', '0.7 to 0.9', '1.0 to 1.2', 'a', 'The water-cement ratio for normal concrete typically ranges from 0.4 to 0.6', 'civil_engineering', 'medium'),
('Kirchhoff''s current law is based on conservation of:', 'Charge', 'Energy', 'Power', 'Voltage', 'a', 'Kirchhoff''s current law is based on the conservation of electric charge', 'electrical_engineering', 'medium');