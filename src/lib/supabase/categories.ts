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
 * Results are cached for 2 hours with SWR (categories rarely change).
 */
export async function getCategories(): Promise<CategoryFromDB[]> {
  return smartFetch<CategoryFromDB[]>(CATEGORY_CACHE_KEY, async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image, is_featured")
      .order("name");

    if (error || !data) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data;
  }, TTL.LONG);
}

/**
 * Invalidate category-related caches.
 */
export function invalidateCategoryCache(): void {
  cacheInvalidatePrefix("categories");
  import("./products").then(m => m.invalidateProductCache()).catch(() => {});
}
