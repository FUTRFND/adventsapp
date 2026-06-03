
-- 1) Events: visibility + planner
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS planner_id UUID;

-- Allow anyone (incl anon) to read PUBLIC events for the Explore page
DROP POLICY IF EXISTS "Public events are viewable by all" ON public.events;
CREATE POLICY "Public events are viewable by all"
  ON public.events FOR SELECT
  USING (visibility = 'public');

GRANT SELECT ON public.events TO anon;

-- 2) Vendors: media gallery + video
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS gallery_media JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Make vendors browsable publicly (Explore + Vendor marketplace)
GRANT SELECT ON public.vendors TO anon;
DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON public.vendors;
CREATE POLICY "Vendors are viewable by everyone"
  ON public.vendors FOR SELECT
  USING (true);

-- 3) user_services: media
ALTER TABLE public.user_services
  ADD COLUMN IF NOT EXISTS gallery_media JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Let everyone see active business services (so they appear in marketplace)
DROP POLICY IF EXISTS "Active services are viewable by everyone" ON public.user_services;
CREATE POLICY "Active services are viewable by everyone"
  ON public.user_services FOR SELECT
  USING (is_active = true);
GRANT SELECT ON public.user_services TO anon;

-- 4) decor_inspiration table
CREATE TABLE IF NOT EXISTS public.decor_inspiration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  style_category TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.decor_inspiration TO anon, authenticated;
GRANT ALL ON public.decor_inspiration TO service_role;

ALTER TABLE public.decor_inspiration ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Decor inspiration is public" ON public.decor_inspiration;
CREATE POLICY "Decor inspiration is public"
  ON public.decor_inspiration FOR SELECT
  USING (true);

CREATE TRIGGER decor_inspiration_updated_at
  BEFORE UPDATE ON public.decor_inspiration
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Seed decor inspiration boards (curated stock imagery from Unsplash)
INSERT INTO public.decor_inspiration (title, style_category, description, cover_url, media, sort_order) VALUES
('Luxury Wedding Decor', 'Wedding', 'Cascading florals, candlelight, crystal and gold.',
 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
 '[
   {"type":"image","url":"https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1525772764200-be829a350797?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200"}
 ]'::jsonb, 1),
('Modern Minimalist', 'Modern', 'Clean lines, neutral palettes, sculptural forms.',
 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200',
 '[
   {"type":"image","url":"https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1508253578933-20b529302151?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200"}
 ]'::jsonb, 2),
('Rustic Farmhouse', 'Rustic', 'Wood, linen, wildflowers, warm string lights.',
 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200',
 '[
   {"type":"image","url":"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200"}
 ]'::jsonb, 3),
('Boho Chic', 'Boho', 'Pampas grass, macramé, terracotta and warm tones.',
 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200',
 '[
   {"type":"image","url":"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=1200"}
 ]'::jsonb, 4),
('Elegant Black Tie', 'Formal', 'Velvet, brass, deep tones and dramatic lighting.',
 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200',
 '[
   {"type":"image","url":"https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200"}
 ]'::jsonb, 5),
('Garden Party', 'Outdoor', 'Lush greenery, pastel florals, daylight elegance.',
 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200',
 '[
   {"type":"image","url":"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1495231916356-a86217efff12?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=1200"}
 ]'::jsonb, 6),
('Corporate Gala', 'Corporate', 'Stage lighting, sleek tablescapes, branded touches.',
 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
 '[
   {"type":"image","url":"https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200"}
 ]'::jsonb, 7),
('Birthday Celebration', 'Birthday', 'Balloon installs, color, cakes and confetti.',
 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200',
 '[
   {"type":"image","url":"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1502035458144-3assignment?w=1200"},
   {"type":"image","url":"https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200"}
 ]'::jsonb, 8)
ON CONFLICT DO NOTHING;

-- 6) Add some Event Planner vendors so the planner-selection step has content
INSERT INTO public.vendors (name, category, location, description, image_url, price_range, rating, review_count, amenities)
VALUES
  ('Aurora Event Co.', 'Event Planner', 'Los Angeles, CA', 'Full-service luxury event planning and design.',
   'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200', '$$$', 4.9, 128,
   ARRAY['Full Planning','Day-Of Coordination','Design']),
  ('Velvet & Vine Planners', 'Event Planner', 'New York, NY', 'Refined weddings and milestone celebrations.',
   'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1200', '$$$$', 5.0, 84,
   ARRAY['Weddings','Galas','Destination']),
  ('Bloom Collective', 'Event Planner', 'Austin, TX', 'Modern, story-led events with a creative team.',
   'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200', '$$', 4.7, 56,
   ARRAY['Boho','Outdoor','Corporate'])
ON CONFLICT DO NOTHING;
