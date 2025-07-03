
-- Add status field to leads table and create lead_visibility table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS todo_checklist JSONB DEFAULT '[]'::jsonb;

-- Update status field to have proper enum values if it doesn't exist with these values
DO $$ 
BEGIN
    -- Check if we need to update the status field to support new values
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'status' 
        AND data_type = 'character varying'
    ) THEN
        ALTER TABLE public.leads ALTER COLUMN status TYPE VARCHAR(20);
    END IF;
END $$;

-- Create lead_visibility table for the matching board
CREATE TABLE IF NOT EXISTS public.lead_visibility (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(lead_id, operator_id)
);

-- Enable RLS on lead_visibility table
ALTER TABLE public.lead_visibility ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lead_visibility
CREATE POLICY "Operators can view their own visible leads" 
ON public.lead_visibility 
FOR SELECT 
USING (operator_id = auth.uid());

CREATE POLICY "System can create lead visibility entries" 
ON public.lead_visibility 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can delete lead visibility entries" 
ON public.lead_visibility 
FOR DELETE 
USING (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_lead_visibility_operator_id ON public.lead_visibility(operator_id);
CREATE INDEX IF NOT EXISTS idx_lead_visibility_lead_id ON public.lead_visibility(lead_id);
