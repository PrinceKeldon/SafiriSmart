
-- Create UUID extension if not already exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create operators table
CREATE TABLE IF NOT EXISTS public.operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    specializations TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    assigned_operator_id UUID REFERENCES public.operators(id),
    traveler_name VARCHAR(255) NOT NULL,
    traveler_email VARCHAR(255) NOT NULL,
    traveler_phone VARCHAR(50),
    traveler_country VARCHAR(100),
    preferences JSONB NOT NULL,
    itinerary JSONB,
    quoted_price DECIMAL(10,2),
    quoted_currency VARCHAR(3),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create lead_notes table
CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by UUID REFERENCES public.operators(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_operator ON public.leads(assigned_operator_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON public.lead_notes(lead_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_operators_updated_at ON public.operators;
CREATE TRIGGER update_operators_updated_at 
    BEFORE UPDATE ON public.operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

-- Create service role policies (for backend access)
-- These policies allow the service role to perform all operations
CREATE POLICY "Service role can manage operators" ON public.operators
    FOR ALL USING (true);

CREATE POLICY "Service role can manage leads" ON public.leads
    FOR ALL USING (true);

CREATE POLICY "Service role can manage lead_notes" ON public.lead_notes
    FOR ALL USING (true);

-- Insert a sample operator for testing (password is 'password123' hashed with bcrypt)
INSERT INTO public.operators (name, email, password_hash, company, specializations) 
VALUES (
    'Demo Operator',
    'demo@safariexperts.com',
    '$2b$12$LQv3c1yqBWVHxkd0LQ1Gau.6o8.KAqYg4mCj9.Wk.wJ2Nm9mG.eYu',
    'Safari Experts Ltd',
    ARRAY['Wildlife Safari', 'Cultural Tours', 'Adventure Travel']
) ON CONFLICT (email) DO NOTHING;
