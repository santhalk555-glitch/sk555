-- Add simple_id column back to topics table
ALTER TABLE public.topics ADD COLUMN simple_id TEXT;

-- Update existing topics with their simple_id values
UPDATE public.topics SET simple_id = 'area' WHERE name = 'Area';
UPDATE public.topics SET simple_id = 'averages' WHERE name = 'Averages';
UPDATE public.topics SET simple_id = 'boat_stream' WHERE name = 'Boat and Stream';
UPDATE public.topics SET simple_id = 'compound_interest' WHERE name = 'Compound Interest';
UPDATE public.topics SET simple_id = 'fractional_decimal' WHERE name = 'Fractional Decimal';
UPDATE public.topics SET simple_id = 'hcf_lcm' WHERE name = 'HCF & LCM';
UPDATE public.topics SET simple_id = 'logarithm' WHERE name = 'Logarithm';
UPDATE public.topics SET simple_id = 'mixture_alligation' WHERE name = 'Mixture Alligation';
UPDATE public.topics SET simple_id = 'number_system' WHERE name = 'Number System';
UPDATE public.topics SET simple_id = 'partnership' WHERE name = 'Partnership';
UPDATE public.topics SET simple_id = 'percentages' WHERE name = 'Percentages';
UPDATE public.topics SET simple_id = 'pipe_cistern' WHERE name = 'Pipe & Cistern';
UPDATE public.topics SET simple_id = 'problem_ages' WHERE name = 'Problem on Ages';
UPDATE public.topics SET simple_id = 'problem_numbers' WHERE name = 'Problem on Numbers';
UPDATE public.topics SET simple_id = 'problem_trains' WHERE name = 'Problem on Trains';
UPDATE public.topics SET simple_id = 'profit_loss' WHERE name = 'Profit & Loss';
UPDATE public.topics SET simple_id = 'ratio_proportion' WHERE name = 'Ratio & Proportion';
UPDATE public.topics SET simple_id = 'simple_interest' WHERE name = 'Simple Interest';
UPDATE public.topics SET simple_id = 'simplify' WHERE name = 'Simplify';
UPDATE public.topics SET simple_id = 'square_cube_root' WHERE name = 'Square Root & Cube Root';
UPDATE public.topics SET simple_id = 'surds_indices' WHERE name = 'Surds and Indices';
UPDATE public.topics SET simple_id = 'time_distance' WHERE name = 'Time & Distance';
UPDATE public.topics SET simple_id = 'time_work' WHERE name = 'Time & Work';
UPDATE public.topics SET simple_id = 'volume_surface_area' WHERE name = 'Volume & Surface Area';

-- Make simple_id NOT NULL after populating
ALTER TABLE public.topics ALTER COLUMN simple_id SET NOT NULL;