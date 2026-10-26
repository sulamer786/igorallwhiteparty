-- Add RSVP status column
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS rsvp_status TEXT DEFAULT 'attending';

-- Update the public view to only show attending guests
CREATE OR REPLACE VIEW public.public_guest_list AS
  SELECT id, full_name, plus_one_names, photo_url, created_at
  FROM public.guests
  WHERE rsvp_status = 'attending';
