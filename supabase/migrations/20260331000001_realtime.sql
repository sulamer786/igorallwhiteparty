-- Enable replica identity for hype_posts so realtime transmits everything
ALTER TABLE public.hype_posts REPLICA IDENTITY FULL;

-- Explicitly add hype_posts to the supabase_realtime publication
DO $$
BEGIN
  -- If publication exists, alter it. Otherwise create it.
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- Add table to publication if not already a member
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'hype_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hype_posts;
  END IF;
END
$$;
