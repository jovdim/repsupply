import { createClient } from "@/lib/supabase/client";
import { smartFetch, cacheInvalidatePrefix, TTL } from "@/lib/cache";
import { invalidateProductCache } from "./products";

export interface AdminStats {
  products: number;
  users: number;
  categories: number;
  yupooStores: number;
  qcGroups: number;
}

/**
 * Fetch admin dashboard stats with caching.
 * Uses select("id") instead of select("*") for count queries — saves egress.
 */
export async function getAdminStats(): Promise<AdminStats> {
  return smartFetch<AdminStats>("admin:stats", async () => {
    const supabase = createClient();
    
    const [
      { count: productsCount },
      { count: usersCount },
      { count: categoriesCount },
      { count: yupooStoresCount },
      { count: qcGroupsCount },
    ] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("yupoo_stores").select("id", { count: "exact", head: true }),
      supabase.from("qc_groups").select("id", { count: "exact", head: true }),
    ]);

    return {
      products: productsCount || 0,
      users: usersCount || 0,
      categories: categoriesCount || 0,
      yupooStores: yupooStoresCount || 0,
      qcGroups: qcGroupsCount || 0,
    };
  }, TTL.MEDIUM);
}

/**
 * Fetch recent products for admin dashboard. Cached for 5 minutes.
 */
export async function getRecentProducts(limit: number = 5): Promise<any[]> {
  return smartFetch<any[]>(`admin:recent_products:${limit}`, async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, image, price, is_featured, created_at, qc_groups(count)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent products:", error);
      return [];
    }

    return data || [];
  }, TTL.SHORT);
}

/**
 * Invalidate all admin-related caches.
 */
export function invalidateAdminCache(): void {
  cacheInvalidatePrefix("admin");
  invalidateProductCache();
}
