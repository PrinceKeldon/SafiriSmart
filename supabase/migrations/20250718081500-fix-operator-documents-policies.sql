
-- Fix storage policies for operator documents
DROP POLICY IF EXISTS "Operators can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view operator documents" ON storage.objects;
DROP POLICY IF EXISTS "Operators can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Operators can delete their own documents" ON storage.objects;

-- Create proper storage policies for operator documents
CREATE POLICY "Authenticated users can upload operator documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'operator-documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view operator documents" ON storage.objects
FOR SELECT USING (bucket_id = 'operator-documents');

CREATE POLICY "Authenticated users can update operator documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'operator-documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete operator documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'operator-documents' AND
  auth.uid() IS NOT NULL
);
