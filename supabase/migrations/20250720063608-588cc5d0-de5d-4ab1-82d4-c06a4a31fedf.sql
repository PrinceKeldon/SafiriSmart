
-- Create storage buckets for PDF and image uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('pdf-uploads', 'pdf-uploads', true),
  ('image-uploads', 'image-uploads', true);

-- Create storage policies for PDF uploads bucket
CREATE POLICY "Anyone can view PDF uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'pdf-uploads');

CREATE POLICY "Authenticated users can upload PDFs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pdf-uploads' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update PDF uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pdf-uploads' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete PDF uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pdf-uploads' AND
  auth.uid() IS NOT NULL
);

-- Create storage policies for image uploads bucket
CREATE POLICY "Anyone can view image uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'image-uploads');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'image-uploads' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update image uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'image-uploads' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete image uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'image-uploads' AND
  auth.uid() IS NOT NULL
);
