-- Grant UPDATE access to admins and subadmins
DROP POLICY IF EXISTS "Admins and subadmins can update all guests" ON public.guests;

CREATE POLICY "Admins and subadmins can update all guests"
  ON public.guests FOR UPDATE
  USING ( public.is_admin_or_subadmin() )
  WITH CHECK ( public.is_admin_or_subadmin() );
