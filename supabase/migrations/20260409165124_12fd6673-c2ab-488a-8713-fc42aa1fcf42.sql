
-- Add account type and business fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'planner',
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS business_description text,
ADD COLUMN IF NOT EXISTS business_category text;
