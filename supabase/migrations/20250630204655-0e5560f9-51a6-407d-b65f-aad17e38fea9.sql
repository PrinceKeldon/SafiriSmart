
-- Fix the function search_path security issue by replacing the function
-- We need to use CREATE OR REPLACE instead of DROP to avoid dependency issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;
