
-- Add archived status to leads table
ALTER TABLE public.leads ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Add index for better performance when filtering archived leads
CREATE INDEX idx_leads_archived ON public.leads(archived);

-- Update RLS policies to handle archived leads
-- Operators can still view their archived leads
-- No changes needed to existing policies as they already filter by assigned_operator_id

-- Add trigger to automatically archive leads when status changes to completed states
CREATE OR REPLACE FUNCTION public.auto_archive_completed_leads()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Auto-archive leads when status is set to 'confirmed' or 'completed'
  IF NEW.status IN ('confirmed', 'completed') AND OLD.status NOT IN ('confirmed', 'completed') THEN
    NEW.archived = true;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_archive_leads
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_archive_completed_leads();
