import { createClient } from "@/lib/supabase/client";
import { smartFetch, cacheInvalidatePrefix, TTL } from "@/lib/cache";

export interface ProductFromDB {
  id: number;
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

/** Shared select query for product + categories */
const PRODUCT_SELECT = `
  *,
  product_categories (
    categories ( name, slug )
  )
`;

/**
 * Fetch all products with their categories.
 * Results are cached for 5 minutes.
 */
export async function getProducts(
  category?: string,
  search?: string
): Promise<ProductFromDB[]> {
  // Only cache unfiltered-all queries (other filters are applied client-side)
  // SmartFetch handles L1/L2 caching and deduplication
  const all = await smartFetch<ProductFromDB[]>("products:all", async () => {
    const supabase = createClient();
    const { data: products, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("id", { ascending: true });

    if (error || !products) {
      console.error("Error fetching products:", error);
      return [];
    }

    return products.map(transformProduct);
  }, TTL.MEDIUM);

  let result = all;

  // Filter by category
  if (category && category.toLowerCase() !== "all") {
    result = result.filter((p) =>
      p.categories.some((c) => c.toLowerCase() === category.toLowerCase())
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
 * Fetch featured products. Cached for 5 minutes.
 */
export async function getFeaturedProducts(
  limit: number = 12
): Promise<ProductFromDB[]> {
  return smartFetch<ProductFromDB[]>(`products:featured:${limit}`, async () => {
    const supabase = createClient();
    const { data: products, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_featured", true)
      .order("id", { ascending: true })
      .limit(limit);

    if (error || !products) {
      console.error("Error fetching featured products:", error);
      return [];
    }

    return products.map(transformProduct);
  }, TTL.MEDIUM);
}

/**
 * Fetch a single product by ID, including QC groups and images. Cached for 5 minutes.
 */
export async function getProductById(
  id: number
): Promise<ProductFromDB | null> {
  return smartFetch<ProductFromDB | null>(`product:${id}`, async () => {
    const supabase = createClient();

    // Fetch product + QC data in parallel
    const [productRes, qcRes] = await Promise.all([
      supabase.from("products").select(PRODUCT_SELECT).eq("id", id).single(),
      supabase
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
        .order("sort_order", { ascending: true }),
    ]);

    if (productRes.error || !productRes.data) {
      console.error("Error fetching product:", productRes.error);
      return null;
    }

    if (qcRes.error) {
      console.error("Error fetching QC groups:", qcRes.error);
    }

    const qcImages = (qcRes.data || []).map((group: any) => ({
      folder: group.folder_name,
      sort_order: group.sort_order,
      images: (group.qc_images || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => img.image_url),
    })).sort((a: any, b: any) => a.sort_order - b.sort_order);

    return {
      ...transformProduct(productRes.data),
      qcImages,
    };
  }, TTL.MEDIUM);
}

/**
 * Get all products for recommendations (lightweight — reuses cached getProducts)
 */
export async function getAllProductsLight(): Promise<ProductFromDB[]> {
  return getProducts();
}

/**
 * Fetch all products for admin management with categories and QC group counts. Cached for 5 minutes.
 */
export async function getAdminProducts(): Promise<any[]> {
  return smartFetch<any[]>("admin:products_list", async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_categories (
          categories (
            id,
            name
          )
        ),
        qc_groups(count)
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching admin products:", error);
      return [];
    }

    return data || [];
  }, TTL.MEDIUM);
}

/**
 * Invalidate all product caches (call after admin edits).
 */
export function invalidateProductCache(): void {
  cacheInvalidatePrefix("product");
  cacheInvalidatePrefix("admin:products_list");
  cacheInvalidatePrefix("admin"); // Clear admin stats too
}
