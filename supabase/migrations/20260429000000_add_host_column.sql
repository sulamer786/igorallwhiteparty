-- Add host column to track which landing page a guest RSVP'd through
-- Existing guests default to 'igor'
ALTER TABLE public.guests ADD COLUMN host TEXT NOT NULL DEFAULT 'igor';

-- Recreate the public guest list view to include the host column
CREATE OR REPLACE VIEW public.public_guest_list AS
  SELECT id, full_name, plus_one_names, photo_url, created_at, host
  FROM public.guests;

-- Re-grant access on the replaced view
GRANT SELECT ON public.public_guest_list TO anon;
GRANT SELECT ON public.public_guest_list TO authenticated;
