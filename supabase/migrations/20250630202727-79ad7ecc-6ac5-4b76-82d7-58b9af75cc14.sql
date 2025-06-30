
-- Add role column to operators table
ALTER TABLE public.operators 
ADD COLUMN role character varying(20) NOT NULL DEFAULT 'operator';

-- Add a check constraint to ensure only valid roles
ALTER TABLE public.operators 
ADD CONSTRAINT operators_role_check 
CHECK (role IN ('operator', 'admin'));

-- Create an index on the role column for better query performance
CREATE INDEX idx_operators_role ON public.operators(role);
