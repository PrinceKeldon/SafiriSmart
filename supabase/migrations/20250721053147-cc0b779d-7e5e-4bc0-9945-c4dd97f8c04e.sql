
-- Create admin operator record for keldontechnologies24@gmail.com
-- This will allow the admin to login to the admin dashboard

INSERT INTO public.operators (
  id,
  name,
  email,
  password_hash,
  company,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '17531f84-3ec7-4396-897d-617d43504487'::uuid,
  'Admin User',
  'keldontechnologies24@gmail.com',
  '$2b$12$dummy_hash_will_be_replaced_by_supabase_auth',
  'TourMaster AI',
  'admin',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_active = true,
  updated_at = now();
