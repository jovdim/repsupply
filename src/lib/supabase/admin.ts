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
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("yupoo_stores").select("*", { count: "exact", head: true }),
      supabase.from("qc_groups").select("*", { count: "exact", head: true }),
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
 * Invalidate all admin-related caches.
 */
export function invalidateAdminCache(): void {
  cacheInvalidatePrefix("admin");
  invalidateProductCache();
}
