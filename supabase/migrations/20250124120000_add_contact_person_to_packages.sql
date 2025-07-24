
-- Add contact_person field to operator_packages table
ALTER TABLE public.operator_packages 
ADD COLUMN contact_person VARCHAR(255);

-- Update the trigger to handle the new field
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
