-- Migration: Add slug column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION public.generate_slug(name text, id integer)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
BEGIN
  -- Lowercase, replace non-alphanumeric with hyphen
  base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Trim hyphens from start and end
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure uniqueness by appending id if needed (initially just use base)
  final_slug := base_slug;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Populate slugs for existing products
UPDATE public.products
SET slug = generate_slug(name, id)
WHERE slug IS NULL;

-- Handle potential duplicate slugs by appending numeric ID
UPDATE public.products p1
SET slug = slug || '-' || id
WHERE EXISTS (
    SELECT 1 FROM public.products p2 
    WHERE p1.slug = p2.slug AND p1.id != p2.id
);
