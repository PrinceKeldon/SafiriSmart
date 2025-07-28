
-- Create a public RLS policy to allow anonymous users to view active operators for counting
CREATE POLICY "Public can view active operators count" ON operators
FOR SELECT TO public
USING (is_active = true);
