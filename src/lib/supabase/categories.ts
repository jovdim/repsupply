import { createClient } from "./client";
import { smartFetch, cacheInvalidatePrefix, TTL } from "@/lib/cache";

export interface CategoryFromDB {
  id: number;
  name: string;
  slug: string;
  image: string;
  is_featured?: boolean;
}

const CATEGORY_CACHE_KEY = "categories:all";

/**
 * Fetch all categories.
 * Results are cached for 5 minutes.
 */
export async function getCategories(): Promise<CategoryFromDB[]> {
  return smartFetch<CategoryFromDB[]>(CATEGORY_CACHE_KEY, async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error || !data) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data;
  }, TTL.MEDIUM);
}

/**
 * Invalidate category-related caches.
 */
export function invalidateCategoryCache(): void {
  cacheInvalidatePrefix("categories");
  // Categories are linked to products (category names are embedded in product cards)
  import("./products").then(m => m.invalidateProductCache()).catch(() => {});
}
