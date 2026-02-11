-- ============================================================
-- RepSupply — Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com > SQL Editor)
-- ============================================================

-- ==================== PROFILES ====================
-- Auto-created when a user signs up via trigger
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==================== CATEGORIES ====================
create table public.categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  image text,
  created_at timestamptz default now() not null
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select using (true);


-- ==================== PRODUCTS ====================
create table public.products (
  id serial primary key,
  name text not null,
  price text not null,
  image text not null,
  link text,
  description text,
  badge text,
  is_featured boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.products enable row level security;

create policy "Products are viewable by everyone"
  on public.products for select using (true);


-- ==================== PRODUCT_CATEGORIES (join table) ====================
create table public.product_categories (
  product_id integer references public.products on delete cascade,
  category_id integer references public.categories on delete cascade,
  primary key (product_id, category_id)
);

alter table public.product_categories enable row level security;

create policy "Product categories are viewable by everyone"
  on public.product_categories for select using (true);


-- ==================== QC GROUPS ====================
create table public.qc_groups (
  id serial primary key,
  product_id integer references public.products on delete cascade not null,
  folder_name text not null default 'Group 1',
  sort_order integer default 0,
  created_at timestamptz default now() not null
);

alter table public.qc_groups enable row level security;

create policy "QC groups are viewable by everyone"
  on public.qc_groups for select using (true);


-- ==================== QC IMAGES ====================
create table public.qc_images (
  id serial primary key,
  qc_group_id integer references public.qc_groups on delete cascade not null,
  image_url text not null,
  sort_order integer default 0,
  created_at timestamptz default now() not null
);

alter table public.qc_images enable row level security;

create policy "QC images are viewable by everyone"
  on public.qc_images for select using (true);


-- ==================== FAVORITES ====================
create table public.favorites (
  id serial primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id integer references public.products on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, product_id)
);

alter table public.favorites enable row level security;

create policy "Users can view own favorites"
  on public.favorites for select using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete using (auth.uid() = user_id);


-- ==================== VIEW HISTORY ====================
create table public.view_history (
  id serial primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id integer references public.products on delete cascade not null,
  viewed_at timestamptz default now() not null
);

-- Index for fast lookups
create index idx_view_history_user on public.view_history(user_id, viewed_at desc);

alter table public.view_history enable row level security;

create policy "Users can view own history"
  on public.view_history for select using (auth.uid() = user_id);

create policy "Users can insert own history"
  on public.view_history for insert with check (auth.uid() = user_id);

create policy "Users can delete own history"
  on public.view_history for delete using (auth.uid() = user_id);


-- ============================================================
-- SEED DATA
-- ============================================================

-- Categories
insert into public.categories (name, slug, image) values
  ('Shoes', 'shoes', '/test-product-images/img1.avif'),
  ('Hoodies', 'hoodies', '/test-product-images/img2.avif'),
  ('T-Shirts', 't-shirts', '/test-product-images/img3.avif'),
  ('Pants', 'pants', '/test-product-images/img4.avif'),
  ('Jackets', 'jackets', '/test-product-images/img5.avif'),
  ('Accessories', 'accessories', '/test-product-images/img1.avif');

-- Products
insert into public.products (id, name, price, image, link, description, badge, is_featured) values
  (1, 'Nike Dunk Low Panda', '¥299', '/test-product-images/img1.avif', 'https://weidian.com/item.html?itemID=123', 'Premium quality Nike Dunk Low in the iconic Panda colorway. Features a clean black and white leather upper with excellent stitching and proper shape. One of the most popular rep finds in the community.', 'Hot', true),
  (2, 'FOG Essentials Hoodie', '¥189', '/test-product-images/img2.avif', 'https://item.taobao.com/item.htm?id=456', 'Fear of God Essentials oversized hoodie with front logo. Heavyweight cotton blend with a soft fleece interior. True to retail sizing.', 'New', true),
  (3, 'Chrome Hearts Tee', '¥159', '/test-product-images/img3.avif', 'https://detail.1688.com/offer/789.html', 'Chrome Hearts signature horseshoe graphic tee. Premium cotton with accurate print quality and correct tag details.', 'Top', true),
  (4, 'Jaded London Cargos', '¥259', '/test-product-images/img4.avif', 'https://weidian.com/item.html?itemID=101112', 'Jaded London parachute cargo pants with premium hardware. Multiple colorways available. Streetwear essential.', 'Trend', true),
  (5, 'Represent Hoodie', '¥219', '/test-product-images/img5.avif', 'https://weidian.com/item.html?itemID=131415', 'Represent Owners Club hoodie with embroidered branding. Heavy 450gsm cotton with ribbed trims. Very close to retail quality.', NULL, true),
  (6, 'Gallery Dept Jeans', '¥329', '/test-product-images/img1.avif', 'https://weidian.com/item.html?itemID=161718', 'Gallery Dept paint-splattered distressed jeans. Unique hand-finished details on each pair. Premium denim quality.', 'Sale', true),
  (7, 'Jordan 4 Retro', '¥399', '/test-product-images/img2.avif', 'https://weidian.com/item.html?itemID=192021', 'Air Jordan 4 Retro with proper netting, shape, and materials. Top-tier batch with correct tongue height and heel tab.', 'Hot', true),
  (8, 'Trapstar Jacket', '¥289', '/test-product-images/img3.avif', 'https://weidian.com/item.html?itemID=222324', 'Trapstar Irongate puffer jacket with detachable hood. Accurate branding and quality hardware. Warm and well-constructed.', 'New', true),
  (9, 'Stussy Tee', '¥129', '/test-product-images/img4.avif', 'https://item.taobao.com/item.htm?id=252627', 'Classic Stussy 8-ball graphic tee. Soft cotton blend with accurate sizing and print quality.', 'Best', true),
  (10, 'Carhartt Double Knee', '¥269', '/test-product-images/img5.avif', 'https://item.taobao.com/item.htm?id=282930', 'Carhartt WIP double knee work pants. Heavy-duty canvas with reinforced knees. Comes in multiple washes.', 'Sale', true),
  (11, 'Bape Shark Hoodie', '¥450', '/test-product-images/img1.avif', 'https://item.taobao.com/item.htm?id=313233', 'A Bathing Ape shark full-zip hoodie with WGM embroidery. Correct teeth print alignment and tag details.', 'New', true),
  (12, 'Yeezy Slides', '¥110', '/test-product-images/img3.avif', 'https://weidian.com/item.html?itemID=343536', 'Adidas Yeezy Slides with proper foam compound and shape. Ultra-comfortable with accurate sole texture.', 'Best', true);

-- Reset the sequence so future inserts get correct IDs
select setval('products_id_seq', (select max(id) from public.products));

-- Product ↔ Category relationships
insert into public.product_categories (product_id, category_id) values
  (1, 1), -- Nike Dunk → Shoes
  (2, 2), -- FOG Hoodie → Hoodies
  (3, 3), -- Chrome Hearts → T-Shirts
  (4, 4), -- Jaded London → Pants
  (5, 2), -- Represent → Hoodies
  (6, 4), -- Gallery Dept → Pants
  (7, 1), -- Jordan 4 → Shoes
  (8, 5), -- Trapstar → Jackets
  (9, 3), -- Stussy → T-Shirts
  (10, 4), -- Carhartt → Pants
  (11, 2), -- Bape → Hoodies
  (12, 1); -- Yeezy → Shoes

-- QC Groups & Images
-- Product 1: Nike Dunk (2 groups)
insert into public.qc_groups (product_id, folder_name, sort_order) values (1, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 2),
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 3);

insert into public.qc_groups (product_id, folder_name, sort_order) values (1, 'Group 2', 1);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 2);

-- Product 2: FOG Hoodie (1 group)
insert into public.qc_groups (product_id, folder_name, sort_order) values (2, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 2);

-- Product 3: Chrome Hearts (1 group)
insert into public.qc_groups (product_id, folder_name, sort_order) values (3, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 1);

-- Product 4: Jaded London (1 group)
insert into public.qc_groups (product_id, folder_name, sort_order) values (4, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 1);

-- Product 5: Represent (2 groups)
insert into public.qc_groups (product_id, folder_name, sort_order) values (5, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 2);

insert into public.qc_groups (product_id, folder_name, sort_order) values (5, 'Group 2', 1);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 1);

-- Product 6: Gallery Dept (1 group)
insert into public.qc_groups (product_id, folder_name, sort_order) values (6, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 1);

-- Product 7: Jordan 4 (1 group)
insert into public.qc_groups (product_id, folder_name, sort_order) values (7, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 2),
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 3);

-- Product 8: Trapstar (1 group)
insert into public.qc_groups (product_id, folder_name, sort_order) values (8, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 1);

-- Product 9: Stussy (1 group)
insert into public.qc_groups (product_id, folder_name, sort_order) values (9, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 1);

-- Product 10: Carhartt (1 group)
insert into public.qc_groups (product_id, folder_name, sort_order) values (10, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 1);

-- Product 11: Bape (1 group)
insert into public.qc_groups (product_id, folder_name, sort_order) values (11, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 2);

-- Product 12: Yeezy Slides (12 groups)
insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 1', 0);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 2);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 2', 1);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 2);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 3', 2);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 1);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 4', 3);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 2);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 5', 4);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 1);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 6', 5);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 2);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 7', 6);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 1);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 8', 7);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 1),
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 2);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 9', 8);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 1);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 10', 9);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img4.avif', 1);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 11', 10);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img3.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img2.avif', 1);

insert into public.qc_groups (product_id, folder_name, sort_order) values (12, 'Group 12', 11);
insert into public.qc_images (qc_group_id, image_url, sort_order) values
  (currval('qc_groups_id_seq'), '/test-product-images/img5.avif', 0),
  (currval('qc_groups_id_seq'), '/test-product-images/img1.avif', 1);
