CREATE TABLE public.budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text DEFAULT 'General',
  estimated_cost numeric DEFAULT 0,
  actual_cost numeric DEFAULT 0,
  is_paid boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their budget items" ON public.budget_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create budget items" ON public.budget_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update budget items" ON public.budget_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete budget items" ON public.budget_items FOR DELETE USING (auth.uid() = user_id);