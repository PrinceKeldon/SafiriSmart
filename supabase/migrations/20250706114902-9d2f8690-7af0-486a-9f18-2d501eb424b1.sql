
-- Add a new table to track which packages were selected for a lead
CREATE TABLE public.lead_selected_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.operator_packages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, package_id)
);

-- Add RLS policies for lead_selected_packages
ALTER TABLE public.lead_selected_packages ENABLE ROW LEVEL SECURITY;

-- Operators can view selected packages for their leads
CREATE POLICY "Operators can view selected packages for their leads"
  ON public.lead_selected_packages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_selected_packages.lead_id 
      AND leads.assigned_operator_id = auth.uid()
    )
  );

-- System can create lead package selections
CREATE POLICY "System can create lead package selections"
  ON public.lead_selected_packages
  FOR INSERT
  WITH CHECK (true);

-- Add index for better performance
CREATE INDEX idx_lead_selected_packages_lead_id ON public.lead_selected_packages(lead_id);
CREATE INDEX idx_lead_selected_packages_package_id ON public.lead_selected_packages(package_id);

-- Update the leads table to add a selection_type field to track how the lead was created
ALTER TABLE public.leads ADD COLUMN selection_type VARCHAR(20) DEFAULT 'system_matched';
ALTER TABLE public.leads ADD CONSTRAINT check_selection_type CHECK (selection_type IN ('system_matched', 'user_selected'));
