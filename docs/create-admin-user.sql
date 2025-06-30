
-- Instructions to create the first admin user
-- Run this SQL command in your Supabase SQL Editor to create the first admin user

-- First, create a user in Supabase Auth (you'll need to do this through the Supabase dashboard)
-- Then update the operators table to set their role to 'admin'

-- Example: Update an existing operator to be admin
-- Replace 'admin@example.com' with the actual admin email
UPDATE public.operators 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Or if you need to insert a new admin operator record
-- (make sure the user exists in Supabase Auth first)
-- INSERT INTO public.operators (name, email, company, role, password_hash, is_active)
-- VALUES ('Admin User', 'admin@example.com', 'Your Company', 'admin', 'managed_by_supabase_auth', true);
