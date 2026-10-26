-- 1. Add 'role' column to guests table
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'guest';

-- 2. Update specific user to 'subadmin'
UPDATE public.guests SET role = 'subadmin' WHERE email = '544vs544@gmail.com';

-- 3. Create a helper function to avoid infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.is_admin_or_subadmin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guests
    WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
  );
$$;

-- 4. Update the select policy to allow admins and subadmins to see all guests
DROP POLICY IF EXISTS "Users can view their own profile" ON public.guests;

CREATE POLICY "Users can view their own profile or admins can view all"
  ON public.guests FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin_or_subadmin()
  );
