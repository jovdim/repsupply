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

/** Shared select query for product + categories */
const PRODUCT_COLUMNS = `
  *,
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
 * Paginated product fetch with server-side filtering.
 * Used by the infinite scroll products page.
 * Each page is cached independently with a short TTL.
 */
export interface PaginatedResult {
  products: ProductFromDB[];
  totalCount: number;
  hasMore: boolean;
}

export async function getProductsPaginated(
  page: number = 0,
  pageSize: number = 20,
  filters?: {
    category?: string;
    search?: string;
    filter?: "all" | "featured" | "best_seller";
  }
): Promise<PaginatedResult> {
  const category = filters?.category && filters.category.toLowerCase() !== "all" ? filters.category : undefined;
  const search = filters?.search?.trim() || undefined;
  const filterType = filters?.filter || "all";

  // Build a cache key that includes all filter params
  const cacheKey = `products:page:${page}:${pageSize}:${filterType}:${category || "all"}:${search || ""}`;

  return smartFetch<PaginatedResult>(cacheKey, async () => {
    const supabase = createClient();
    const from = page * pageSize;
    const to = from + pageSize - 1;

    // Build the query
    let query = supabase
      .from("products")
      .select(PRODUCT_COLUMNS, { count: "exact" });

    // Apply server-side filters
    if (filterType === "featured") {
      query = query.eq("is_featured", true);
    } else if (filterType === "best_seller") {
      query = query.eq("is_best_seller", true);
    }

    // Server-side text search
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Server-side category filter via inner join
    if (category) {
      // Use a subquery to filter by category name through the join table
      const { data: catData } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", category)
        .single();

      if (catData) {
        const { data: productIds } = await supabase
          .from("product_categories")
          .select("product_id")
          .eq("category_id", catData.id);

        if (productIds && productIds.length > 0) {
          query = query.in("id", productIds.map((p: any) => p.product_id));
        } else {
          // No products in this category
          return { products: [], totalCount: 0, hasMore: false };
        }
      } else {
        return { products: [], totalCount: 0, hasMore: false };
      }
    }

    // Apply pagination and ordering
    const { data: products, error, count } = await query
      .order("id", { ascending: false })
      .range(from, to);

    if (error || !products) {
      console.error("Error fetching paginated products:", error);
      return { products: [], totalCount: 0, hasMore: false };
    }

    const totalCount = count || 0;
    return {
      products: products.map(transformProduct),
      totalCount,
      hasMore: from + products.length < totalCount,
    };
  }, TTL.SHORT);
}

/**
 * Fetch all products for admin management. Cached for 5 minutes.
 * Uses batched fetching to bypass Supabase's 1000-row default limit.
 */
export async function getAdminProducts(): Promise<any[]> {
  return smartFetch<any[]>("admin:products_list", async () => {
    const supabase = createClient();
    const PAGE_SIZE = 1000;
    let allData: any[] = [];
    let from = 0;

    while (true) {
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
        .order("id", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error("Error fetching admin products:", error);
        return allData;
      }

      if (!data || data.length === 0) break;
      allData = allData.concat(data);

      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    return allData;
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
