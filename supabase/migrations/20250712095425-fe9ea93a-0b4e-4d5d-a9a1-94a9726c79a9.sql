
-- Fix the is_admin_user function to have an immutable search_path
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public, auth
AS $$
BEGIN
  -- For now, we'll allow all authenticated users to be admin for demo purposes
  -- In production, you would check against a proper admin role table
  RETURN auth.uid() IS NOT NULL;
END;
$$;
