import { createClient } from "@/lib/supabase/client";
import { smartFetch, cacheInvalidatePrefix, TTL } from "@/lib/cache";

export interface ProductFromDB {
  id: number;
  slug: string;
  name: string;
  price: string;
  image: string;
  link: string | null;
  description: string | null;
  badge: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  created_at: string;
  categories: string[];
  qcImages: { folder: string; images: string[]; sort_order: number }[];
}

/** Shared product transformer */
function transformProduct(p: any): ProductFromDB {
  return {
    id: p.id,
    slug: p.slug || p.id.toString(),
    name: p.name,
    price: p.price,
    image: p.image,
    link: p.link,
    description: p.description,
    badge: p.badge,
    is_featured: p.is_featured,
    is_best_seller: p.is_best_seller || false,
    created_at: p.created_at,
    categories:
      p.product_categories
        ?.map((pc: any) => pc.categories?.name)
        .filter(Boolean) || [],
    qcImages: [],
  };
}

/** Only select columns we actually use — saves egress */
const PRODUCT_COLUMNS = `
  id, slug, name, price, image, link, description, badge,
  is_featured, is_best_seller, created_at,
  product_categories (
    categories ( name, slug )
  )
`;

/**
 * Fetch all products with their categories.
 * Results are cached for 30 minutes with SWR.
 */
export async function getProducts(
  category?: string,
  search?: string
): Promise<ProductFromDB[]> {
  const all = await smartFetch<ProductFromDB[]>("products:all", async () => {
    const supabase = createClient();
    const { data: products, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("id", { ascending: true });

    if (error || !products) {
      console.error("Error fetching products:", error);
      return [];
    }

    return products.map(transformProduct);
  }, TTL.LONG);

  let result = all;

  if (category && category.toLowerCase() !== "all") {
    result = result.filter((p) =>
      p.categories.some((c) => c.toLowerCase() === category.toLowerCase())
    );
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }

  return result;
}

/**
 * Fetch featured products. Cached for 30 minutes with SWR.
 */
export async function getFeaturedProducts(
  limit: number = 12
): Promise<ProductFromDB[]> {
  return smartFetch<ProductFromDB[]>(`products:featured:${limit}`, async () => {
    const supabase = createClient();
    const { data: products, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_featured", true)
      .order("id", { ascending: true })
      .limit(limit);

    if (error || !products) {
      console.error("Error fetching featured products:", error);
      return [];
    }

    return products.map(transformProduct);
  }, TTL.LONG);
}

/**
 * Fetch best-selling products. Cached for 30 minutes with SWR.
 */
export async function getBestSellers(
  limit: number = 10
): Promise<ProductFromDB[]> {
  return smartFetch<ProductFromDB[]>(`products:best_sellers:${limit}`, async () => {
    const supabase = createClient();
    const { data: products, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_best_seller", true)
      .order("id", { ascending: true })
      .limit(limit);

    if (error || !products) {
      console.error("Error fetching best sellers:", error);
      return [];
    }

    return products.map(transformProduct);
  }, TTL.LONG);
}

/**
 * Fetch a single product by ID or Slug, including QC groups.
 * Fixed: only 2 Supabase calls instead of 3.
 */
export async function getProductById(
  idOrSlug: number | string
): Promise<ProductFromDB | null> {
  const isSlug = typeof idOrSlug === "string" && isNaN(Number(idOrSlug));
  const cacheKey = isSlug ? `product:slug:${idOrSlug}` : `product:${idOrSlug}`;

  return smartFetch<ProductFromDB | null>(cacheKey, async () => {
    const supabase = createClient();

    // Step 1: Fetch the product
    const queryFilter = isSlug ? { slug: idOrSlug } : { id: Number(idOrSlug) };
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .match(queryFilter)
      .single();

    if (productError || !productData) {
      console.error("Error fetching product:", productError);
      return null;
    }

    // Step 2: Fetch QC data using the resolved product ID (single query, no duplicates)
    const { data: qcData } = await supabase
      .from("qc_groups")
      .select(`
        id, folder_name, sort_order,
        qc_images ( image_url, sort_order )
      `)
      .eq("product_id", productData.id)
      .order("sort_order", { ascending: true });

    const qcImages = (qcData || []).map((group: any) => ({
      folder: group.folder_name,
      sort_order: group.sort_order,
      images: (group.qc_images || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => img.image_url),
    })).sort((a: any, b: any) => a.sort_order - b.sort_order);

    return {
      ...transformProduct(productData),
      qcImages,
    };
  }, TTL.MEDIUM);
}

/**
 * Fetch a single product by Slug, including QC groups and images.
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductFromDB | null> {
  return getProductById(slug);
}

/**
 * Get all products for recommendations (lightweight — reuses cached getProducts)
 */
export async function getAllProductsLight(): Promise<ProductFromDB[]> {
  return getProducts();
}

/**
 * Fetch all products for admin management. Cached for 5 minutes.
 */
export async function getAdminProducts(): Promise<any[]> {
  return smartFetch<any[]>("admin:products_list", async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        id, slug, name, price, image, is_featured, is_best_seller,
        link, description, created_at,
        product_categories (
          categories ( id, name )
        ),
        qc_groups(count)
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching admin products:", error);
      return [];
    }

    return data || [];
  }, TTL.SHORT);
}

/**
 * Invalidate all product caches (call after admin edits).
 */
export function invalidateProductCache(): void {
  cacheInvalidatePrefix("product");
  cacheInvalidatePrefix("admin:products_list");
  cacheInvalidatePrefix("admin");
}
