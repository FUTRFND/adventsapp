
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ==================== PROFILES ====================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{"push": true, "email": true}'::jsonb,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== EVENTS ====================
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'wedding',
  date_start DATE,
  date_end DATE,
  location TEXT,
  guest_count INTEGER DEFAULT 0,
  budget NUMERIC DEFAULT 0,
  progress INTEGER DEFAULT 0,
  vibe_tags TEXT[] DEFAULT '{}',
  priorities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON public.events FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== EVENT TASKS ====================
CREATE TABLE public.event_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  due_date DATE,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks" ON public.event_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON public.event_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.event_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.event_tasks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_event_tasks_updated_at BEFORE UPDATE ON public.event_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== VENDORS ====================
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  category TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  price_range TEXT,
  capacity TEXT,
  amenities TEXT[] DEFAULT '{}',
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors are viewable by everyone" ON public.vendors FOR SELECT TO authenticated USING (true);

-- ==================== SAVED VENDORS ====================
CREATE TABLE public.saved_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, vendor_id)
);

ALTER TABLE public.saved_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their saved vendors" ON public.saved_vendors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save vendors" ON public.saved_vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave vendors" ON public.saved_vendors FOR DELETE USING (auth.uid() = user_id);

-- ==================== GUESTS ====================
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  rsvp_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their event guests" ON public.guests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add guests" ON public.guests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update guests" ON public.guests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete guests" ON public.guests FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== SEED VENDORS ====================
INSERT INTO public.vendors (name, location, category, rating, review_count, price_range, capacity, amenities, image_url, description) VALUES
('The Grand Ballroom', 'Downtown Historic District', 'Venues', 4.8, 236, '$$$', '250-500', ARRAY['On-site Catering', 'Valet Parking', 'AV Equipment'], 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=250&fit=crop', 'A stunning historic ballroom perfect for large celebrations.'),
('Lakeside Gardens', 'Waterfront Park', 'Venues', 4.6, 182, '$$', '100-300', ARRAY['Outdoor Space', 'Garden Setting', 'Tent Rental'], 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=250&fit=crop', 'Beautiful outdoor venue with lakefront views.'),
('The Modern Loft', 'Arts District', 'Venues', 4.9, 94, '$$$$', '50-150', ARRAY['Industrial Chic', 'Rooftop Access', 'In-house DJ'], 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=250&fit=crop', 'A chic modern loft space in the heart of the arts district.'),
('Savory Bites Catering', 'Citywide Service', 'Catering', 4.7, 312, '$$', NULL, ARRAY['Custom Menus', 'Dietary Options', 'Tastings'], 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=250&fit=crop', 'Award-winning catering with customizable menus.'),
('Lens & Light Photography', 'Mobile Service', 'Photography', 4.9, 458, '$$$', NULL, ARRAY['Drone Shots', 'Photo Booth', 'Same-day Edits'], 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=250&fit=crop', 'Capturing your special moments with cinematic flair.'),
('Petal & Bloom Florals', 'Garden District', 'Florists', 4.5, 127, '$$', NULL, ARRAY['Custom Arrangements', 'Setup Included', 'Sustainable'], 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=250&fit=crop', 'Sustainable floral design for memorable events.'),
('Beat Drop Entertainment', 'Metro Area', 'Entertainment', 4.8, 203, '$$$', NULL, ARRAY['Live Band', 'DJ Services', 'MC Available'], 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop', 'Premium entertainment packages for any event.');
