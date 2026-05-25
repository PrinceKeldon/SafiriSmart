
-- 1. operators: restrict update/delete to own row, lock insert to own id, remove public/anon SELECT exposure
DROP POLICY IF EXISTS "Authenticated users can update operators" ON public.operators;
DROP POLICY IF EXISTS "Authenticated users can delete operators" ON public.operators;
DROP POLICY IF EXISTS "Authenticated users can create operators" ON public.operators;
DROP POLICY IF EXISTS "Authenticated users can view all operators" ON public.operators;
DROP POLICY IF EXISTS "Public can view active operators count" ON public.operators;
DROP POLICY IF EXISTS "Public read active operators" ON public.operators;

CREATE POLICY "Operators can insert own row"
  ON public.operators FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- (Existing policies "Operators can update their own profile" USING auth.uid()=id and
--  "Admins can manage all operators" already cover update/delete with proper scoping.)

-- 2. operator_packages: scope writes to owning operator
DROP POLICY IF EXISTS "Operators can create their own packages" ON public.operator_packages;
DROP POLICY IF EXISTS "Operators can update their own packages" ON public.operator_packages;
DROP POLICY IF EXISTS "Operators can delete their own packages" ON public.operator_packages;
DROP POLICY IF EXISTS "Operators can view their own packages" ON public.operator_packages;
DROP POLICY IF EXISTS "Public can view packages" ON public.operator_packages;

CREATE POLICY "Operators insert own packages"
  ON public.operator_packages FOR INSERT TO authenticated
  WITH CHECK (operator_id = auth.uid());

CREATE POLICY "Operators update own packages"
  ON public.operator_packages FOR UPDATE TO authenticated
  USING (operator_id = auth.uid())
  WITH CHECK (operator_id = auth.uid());

CREATE POLICY "Operators delete own packages"
  ON public.operator_packages FOR DELETE TO authenticated
  USING (operator_id = auth.uid());

-- 3. lead_selected_packages: remove anon insert and broad public insert
DROP POLICY IF EXISTS "Public can create package selections" ON public.lead_selected_packages;
DROP POLICY IF EXISTS "System can create lead package selections" ON public.lead_selected_packages;

CREATE POLICY "Operators insert package selections for own packages"
  ON public.lead_selected_packages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.operator_packages op
    WHERE op.id = package_id AND op.operator_id = auth.uid()
  ));

-- 4. lead_visibility: remove the always-true public delete policy
DROP POLICY IF EXISTS "System can delete lead visibility entries" ON public.lead_visibility;
DROP POLICY IF EXISTS "System can create lead visibility entries" ON public.lead_visibility;

-- 5. notifications: restrict inserts to service role (and allow users to insert their own)
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert notifications for self"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (recipient_id = auth.uid());

-- 6. safari_guide_visits: remove public read
DROP POLICY IF EXISTS "Allow public to read visits for counting" ON public.safari_guide_visits;

-- 7. Storage: lock down operator-documents (make private + restrict reads)
UPDATE storage.buckets SET public = false WHERE id = 'operator-documents';

DROP POLICY IF EXISTS "Anyone can view operator documents" ON storage.objects;

CREATE POLICY "Owners and admins can view operator documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'operator-documents'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );
