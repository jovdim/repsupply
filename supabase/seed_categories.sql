-- Insert categories if they don't exist
-- Using ON CONFLICT (id) DO NOTHING isn't ideal since we don't know IDs, 
-- but we can use WHERE NOT EXISTS checks or just INSERT IGNORE equivalent if name is unique.
-- Assuming 'name' might not be unique constraint in schema, but we want to avoid duplicates.
-- We'll use a simple INSERT block.

INSERT INTO public.categories (name, slug, image) VALUES
-- Tops
('Tees', 'tees', null),
('Hoodies', 'hoodies', null),
('Jackets', 'jackets', null),
('Tank Tops', 'tank-tops', null),
('Varsity Jackets', 'varsity-jackets', null),
('Sweaters', 'sweaters', null),

-- Bottoms
('Shorts', 'shorts', null),
('Sweatpants', 'sweatpants', null),
('Pants', 'pants', null),
('Cargos', 'cargos', null),
('Jorts', 'jorts', null),

-- Electronics & Bags
('Electronics', 'electronics', null),
('Backpacks', 'backpacks', null),

-- Basics
('Underwear', 'underwear', null),
('Socks', 'socks', null),

-- Jewelry
('Watches', 'watches', null),
('Bracelets', 'bracelets', null),
('Earrings', 'earrings', null),
('Rings', 'rings', null),
('Necklaces', 'necklaces', null),

-- Accessories
('Glasses', 'glasses', null),
('Belts', 'belts', null),
('Wallets', 'wallets', null),
('Ties', 'ties', null),
('Hats', 'hats', null),
('Beanies', 'beanies', null),

-- Misc
('Stickers', 'stickers', null),
('Room Decor', 'room-decor', null),
('Phone Case', 'phone-case', null),
('Misc', 'misc', null)
ON CONFLICT (name) DO NOTHING;
