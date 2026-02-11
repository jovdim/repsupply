-- ============================================================
-- Promote User to Admin
-- Run this in your Supabase SQL Editor (supabase.com > SQL Editor)
-- ============================================================

-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with your actual email address
-- This updates the user's app_metadata to include the 'admin' role
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
where email = 'lorem77098@gmail.com';

-- Verify the change
-- select email, raw_app_meta_data from auth.users where email = 'YOUR_EMAIL@EXAMPLE.COM';
