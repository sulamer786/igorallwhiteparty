-- Update the public guest list view to include plus_one_names
-- This allows the frontend to display "Noah & Krystal" format
DROP VIEW IF EXISTS public.public_guest_list CASCADE;

CREATE VIEW public.public_guest_list AS
  SELECT id, full_name, plus_one_names, photo_url, created_at
  FROM public.guests;

GRANT SELECT ON public.public_guest_list TO anon;
GRANT SELECT ON public.public_guest_list TO authenticated;
