-- Guest Profile Table ( linked to auth.users )
CREATE TABLE public.guests (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  plus_one_names TEXT,
  photo_url TEXT,
  tracking_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on guests
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile completely
CREATE POLICY "Users can view their own profile"
  ON public.guests FOR SELECT
  USING ( auth.uid() = id );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.guests FOR UPDATE
  USING ( auth.uid() = id );

-- To satisfy the "Public Guest List Privacy" requirement securely without column-level RLS, 
-- we use a secure View that only exposes safe columns to anonymous users.
CREATE VIEW public.public_guest_list AS
  SELECT id, full_name, plus_one_names, photo_url, created_at
  FROM public.guests;

-- Note: Views created by default use the privileges of the view owner (definer).
-- We need to ensure anonymous users can select from this view.
GRANT SELECT ON public.public_guest_list TO anon;
GRANT SELECT ON public.public_guest_list TO authenticated;

-- Hype Posts Table
CREATE TABLE public.hype_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on hype posts
ALTER TABLE public.hype_posts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view hype posts
CREATE POLICY "Authenticated users can view hype posts"
  ON public.hype_posts FOR SELECT
  TO authenticated
  USING ( true );

-- Authenticated users can insert their own posts
CREATE POLICY "Users can insert their own posts"
  ON public.hype_posts FOR INSERT
  TO authenticated
  WITH CHECK ( auth.uid() = guest_id );

-- Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('hype_media', 'hype_media', true);

-- Storage Policies: avatars
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK ( bucket_id = 'avatars' );

-- Storage Policies: hype_media
CREATE POLICY "Hype media is accessible to authenticated users."
  ON storage.objects FOR SELECT
  TO authenticated
  USING ( bucket_id = 'hype_media' );

CREATE POLICY "Authenticated users can upload hype media."
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'hype_media' );
