
-- Create the operator_packages table
CREATE TABLE public.operator_packages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    package_name VARCHAR(255) NOT NULL,
    description TEXT,
    min_duration INTEGER NOT NULL CHECK (min_duration > 0),
    max_duration INTEGER NOT NULL CHECK (max_duration >= min_duration),
    min_group_size INTEGER NOT NULL CHECK (min_group_size > 0),
    max_group_size INTEGER NOT NULL CHECK (max_group_size >= min_group_size),
    budget_tier VARCHAR(20) NOT NULL CHECK (budget_tier IN ('budget', 'mid-range', 'luxury')),
    estimated_cost_per_person_per_day DECIMAL(10, 2) NOT NULL CHECK (estimated_cost_per_person_per_day > 0),
    included_locations JSONB DEFAULT '[]'::jsonb,
    included_activities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_operator_packages_operator_id ON public.operator_packages(operator_id);
CREATE INDEX idx_operator_packages_budget_tier ON public.operator_packages(budget_tier);
CREATE INDEX idx_operator_packages_duration ON public.operator_packages(min_duration, max_duration);

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_operator_packages_updated_at
    BEFORE UPDATE ON public.operator_packages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.operator_packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Operators can view their own packages" 
    ON public.operator_packages 
    FOR SELECT 
    USING (operator_id IN (SELECT id FROM public.operators WHERE id = operator_id));

CREATE POLICY "Operators can create their own packages" 
    ON public.operator_packages 
    FOR INSERT 
    WITH CHECK (operator_id IN (SELECT id FROM public.operators WHERE id = operator_id));

CREATE POLICY "Operators can update their own packages" 
    ON public.operator_packages 
    FOR UPDATE 
    USING (operator_id IN (SELECT id FROM public.operators WHERE id = operator_id));

CREATE POLICY "Operators can delete their own packages" 
    ON public.operator_packages 
    FOR DELETE 
    USING (operator_id IN (SELECT id FROM public.operators WHERE id = operator_id));
