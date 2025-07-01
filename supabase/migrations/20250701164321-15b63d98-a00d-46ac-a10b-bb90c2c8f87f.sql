-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Service role can manage operators" ON public.operators;
DROP POLICY IF EXISTS "Service role can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Service role can manage lead_notes" ON public.lead_notes;

-- Create proper RLS policies for operators table
-- Operators can view and update their own profile
CREATE POLICY "Operators can view their own profile" 
ON public.operators 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Operators can update their own profile" 
ON public.operators 
FOR UPDATE 
USING (auth.uid()::text = id::text);

-- Admins can view all operators
CREATE POLICY "Admins can view all operators" 
ON public.operators 
FOR SELECT 
USING (role = 'admin');

-- Admins can create new operators
CREATE POLICY "Admins can create operators" 
ON public.operators 
FOR INSERT 
WITH CHECK (role = 'admin');

-- Create proper RLS policies for leads table
-- Operators can only see leads assigned to them
CREATE POLICY "Operators can view assigned leads" 
ON public.leads 
FOR SELECT 
USING (assigned_operator_id = auth.uid());

-- Operators can update their assigned leads
CREATE POLICY "Operators can update assigned leads" 
ON public.leads 
FOR UPDATE 
USING (assigned_operator_id = auth.uid());

-- Service role can create leads (for B2C frontend)
CREATE POLICY "Service can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Admins can view all leads
CREATE POLICY "Admins can view all leads" 
ON public.leads 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.operators 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create proper RLS policies for lead_notes table
-- Operators can view and create notes for their assigned leads
CREATE POLICY "Operators can view notes for their leads" 
ON public.lead_notes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.leads 
  WHERE id = lead_id AND assigned_operator_id = auth.uid()
));

CREATE POLICY "Operators can create notes for their leads" 
ON public.lead_notes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.leads 
  WHERE id = lead_id AND assigned_operator_id = auth.uid()
) AND created_by = auth.uid());

-- Admins can view all notes
CREATE POLICY "Admins can view all notes" 
ON public.lead_notes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.operators 
  WHERE id = auth.uid() AND role = 'admin'
));