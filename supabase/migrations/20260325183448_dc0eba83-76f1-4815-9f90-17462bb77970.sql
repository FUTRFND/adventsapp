ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'Classic';