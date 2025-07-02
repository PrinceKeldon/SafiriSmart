-- Add new fields to operators table for services and destinations
ALTER TABLE public.operators 
ADD COLUMN services_offered JSONB DEFAULT '[]'::jsonb,
ADD COLUMN destinations_covered JSONB DEFAULT '[]'::jsonb;