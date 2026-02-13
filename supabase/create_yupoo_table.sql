CREATE TABLE IF NOT EXISTS public.yupoo_stores (
  id serial PRIMARY KEY,
  name text NOT NULL,
  image text,
  link text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.yupoo_stores ENABLE ROW LEVEL SECURITY;

-- Create policies (modify to match your existing pattern, usually public read, admin write)
-- Assuming you have standard policies or will add them. Here is a basic one:

CREATE POLICY "Enable read access for all users" ON public.yupoo_stores
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.yupoo_stores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.yupoo_stores
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.yupoo_stores
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert existing data
INSERT INTO public.yupoo_stores (name, image, link) VALUES
('TopShoeFactory', '/test-product-images/img1.avif', 'https://topshoefactory.x.yupoo.com/'),
('FashionReps Seller', '/test-product-images/img2.avif', 'https://fashionreps.x.yupoo.com/'),
('DesignerHub', '/test-product-images/img3.avif', 'https://designerhub.x.yupoo.com/'),
('StreetStyle', '/test-product-images/img4.avif', 'https://streetstyle.x.yupoo.com/'),
('LuxuryReps', '/test-product-images/img5.avif', 'https://luxuryreps.x.yupoo.com/'),
('SneakerKing', '/test-product-images/img1.avif', 'https://sneakerking.x.yupoo.com/'),
('HypeBeast', '/test-product-images/img2.avif', 'https://hypebeast.x.yupoo.com/'),
('RepLife', '/test-product-images/img3.avif', 'https://replife.x.yupoo.com/');
