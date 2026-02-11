import { createClient } from "@/lib/supabase/client";

export interface ProductFromDB {
  id: number;
  name: string;
  price: string;
  image: string;
  link: string | null;
  description: string | null;
  badge: string | null;
  is_featured: boolean;
  categories: string[];
  qcImages: { folder: string; images: string[] }[];
}

/**
 * Fetch all products with their categories.
 * Optionally filter by category slug and/or search query.
 */
export async function getProducts(
  category?: string,
  search?: string
): Promise<ProductFromDB[]> {
  const supabase = createClient();

  // Get products
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      product_categories (
        categories ( name, slug )
      )
    `)
    .order("id", { ascending: true });

  if (error || !products) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Transform and filter
  let result: ProductFromDB[] = products.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    link: p.link,
    description: p.description,
    badge: p.badge,
    is_featured: p.is_featured,
    categories: p.product_categories?.map(
      (pc: any) => pc.categories?.name
    ).filter(Boolean) || [],
    qcImages: [],
  }));

  // Filter by category
  if (category && category.toLowerCase() !== "all") {
    result = result.filter((p) =>
      p.categories.some(
        (c) => c.toLowerCase() === category.toLowerCase()
      )
    );
  }

  // Filter by search
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }

  return result;
}

/**
 * Fetch featured products for the homepage.
 */
export async function getFeaturedProducts(
  limit: number = 12
): Promise<ProductFromDB[]> {
  const supabase = createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      product_categories (
        categories ( name, slug )
      )
    `)
    .eq("is_featured", true)
    .order("id", { ascending: true })
    .limit(limit);

  if (error || !products) {
    console.error("Error fetching featured products:", error);
    return [];
  }

  return products.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    link: p.link,
    description: p.description,
    badge: p.badge,
    is_featured: p.is_featured,
    categories: p.product_categories?.map(
      (pc: any) => pc.categories?.name
    ).filter(Boolean) || [],
    qcImages: [],
  }));
}

/**
 * Fetch a single product by ID, including QC groups and images.
 */
export async function getProductById(
  id: number
): Promise<ProductFromDB | null> {
  const supabase = createClient();

  // Get product with categories
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      product_categories (
        categories ( name, slug )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    console.error("Error fetching product:", error);
    return null;
  }

  // Get QC groups with images
  const { data: qcGroups, error: qcError } = await supabase
    .from("qc_groups")
    .select(`
      id,
      folder_name,
      sort_order,
      qc_images (
        image_url,
        sort_order
      )
    `)
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  if (qcError) {
    console.error("Error fetching QC groups:", qcError);
  }

  const qcImages = (qcGroups || []).map((group: any) => ({
    folder: group.folder_name,
    images: (group.qc_images || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any) => img.image_url),
  }));

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    link: product.link,
    description: product.description,
    badge: product.badge,
    is_featured: product.is_featured,
    categories: product.product_categories?.map(
      (pc: any) => pc.categories?.name
    ).filter(Boolean) || [],
    qcImages,
  };
}

/**
 * Get all products for recommendations (lightweight — no QC images)
 */
export async function getAllProductsLight(): Promise<ProductFromDB[]> {
  return getProducts();
}
