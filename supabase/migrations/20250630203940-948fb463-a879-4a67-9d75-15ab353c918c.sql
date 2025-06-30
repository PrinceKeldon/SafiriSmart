
-- Update an existing operator to have admin role
-- Replace 'your-email@example.com' with the actual email of the operator you want to make admin
UPDATE operators 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
