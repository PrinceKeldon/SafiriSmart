
-- First, check if the operator record exists and reactivate if found
UPDATE operators 
SET is_active = true, updated_at = now()
WHERE email = 'keldontechnologies24@gmail.com';

-- If no record was updated, insert a new operator record
INSERT INTO operators (
  name, 
  email, 
  company, 
  role, 
  password_hash, 
  is_active
)
SELECT 
  'Admin User',
  'keldontechnologies24@gmail.com',
  'Keldon Technologies',
  'admin',
  'managed_by_supabase_auth',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM operators WHERE email = 'keldontechnologies24@gmail.com'
);
