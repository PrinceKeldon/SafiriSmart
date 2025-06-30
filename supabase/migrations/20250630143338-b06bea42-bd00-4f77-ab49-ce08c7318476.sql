
-- Add new columns to the operators table for comprehensive profile management
ALTER TABLE public.operators 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Kenya',
ADD COLUMN IF NOT EXISTS contact_person_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_person_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS certificate_of_incorporation_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS business_permit_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS kato_membership_url VARCHAR(500);

-- Create a storage bucket for operator documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('operator-documents', 'operator-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for operator documents
CREATE POLICY "Operators can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'operator-documents' AND
  auth.role() = 'service_role'
);

CREATE POLICY "Anyone can view operator documents" ON storage.objects
FOR SELECT USING (bucket_id = 'operator-documents');

CREATE POLICY "Operators can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'operator-documents' AND
  auth.role() = 'service_role'
);

CREATE POLICY "Operators can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'operator-documents' AND
  auth.role() = 'service_role'
);
