-- ============================================================
-- Fix Admin RLS Policies & Storage Bucket Access
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ==================== 1. FIX is_admin() FUNCTION ====================
-- Make it resilient to both JWT claim locations
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    -- Check service_role (server-side calls)
    (auth.jwt() ->> 'role') = 'service_role'
    -- Check app_metadata.role (nested path)
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    -- Check user_metadata fallback
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==================== 2. FIX products POLICIES ====================
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (is_admin());


-- ==================== 3. FIX product_categories POLICIES ====================
DROP POLICY IF EXISTS "Admins can manage product categories" ON public.product_categories;

CREATE POLICY "Admins can insert product categories"
  ON public.product_categories FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product categories"
  ON public.product_categories FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete product categories"
  ON public.product_categories FOR DELETE
  USING (is_admin());


-- ==================== 4. FIX categories POLICIES ====================
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (is_admin());


-- ==================== 5. FIX qc_groups POLICIES ====================
DROP POLICY IF EXISTS "Admins can manage qc groups" ON public.qc_groups;

CREATE POLICY "Admins can insert qc groups"
  ON public.qc_groups FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update qc groups"
  ON public.qc_groups FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete qc groups"
  ON public.qc_groups FOR DELETE
  USING (is_admin());


-- ==================== 6. FIX qc_images POLICIES ====================
DROP POLICY IF EXISTS "Admins can manage qc images" ON public.qc_images;

CREATE POLICY "Admins can insert qc images"
  ON public.qc_images FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update qc images"
  ON public.qc_images FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete qc images"
  ON public.qc_images FOR DELETE
  USING (is_admin());


-- ==================== 7. FIX yupoo_stores POLICIES ====================
-- These were using auth.role() = 'authenticated' which is wrong (any logged-in user could write)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.yupoo_stores;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.yupoo_stores;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.yupoo_stores;

CREATE POLICY "Admins can insert yupoo stores"
  ON public.yupoo_stores FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update yupoo stores"
  ON public.yupoo_stores FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete yupoo stores"
  ON public.yupoo_stores FOR DELETE
  USING (is_admin());


-- ==================== 8. FIX profiles POLICIES ====================
-- Admins should also be able to insert profiles (for edge cases)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());


-- ==================== 9. STORAGE BUCKET POLICIES ====================
-- Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;

-- Anyone can view/download images (public bucket)
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Only admins can upload images
CREATE POLICY "Admin upload access"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (
      (auth.jwt() ->> 'role') = 'service_role'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Only admins can update/overwrite images
CREATE POLICY "Admin update access"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (
      (auth.jwt() ->> 'role') = 'service_role'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND (
      (auth.jwt() ->> 'role') = 'service_role'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Only admins can delete images
CREATE POLICY "Admin delete access"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (
      (auth.jwt() ->> 'role') = 'service_role'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );


-- ==================== 10. VERIFY ADMIN STATUS ====================
-- Run this to confirm your user has admin role set correctly:
-- SELECT email, raw_app_meta_data FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin';
