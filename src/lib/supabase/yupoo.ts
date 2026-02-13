import { createClient } from "@/lib/supabase/client";
import { smartFetch, cacheInvalidatePrefix, TTL } from "@/lib/cache";

export interface YupooStore {
  id: number;
  name: string;
  link: string;
  image: string;
}

const STORE_CACHE_KEY = "yupoo:stores";

/**
 * Fetch all Yupoo stores.
 * Results are cached for 5 minutes.
 */
export async function getYupooStores(): Promise<YupooStore[]> {
  return smartFetch<YupooStore[]>(STORE_CACHE_KEY, async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("yupoo_stores")
      .select("*")
      .order("name");

    if (error || !data) {
      console.error("Error fetching Yupoo stores:", error);
      return [];
    }

    return data;
  }, TTL.MEDIUM);
}

/**
 * Invalidate Yupoo stores cache.
 */
export function invalidateYupooCache(): void {
  cacheInvalidatePrefix(STORE_CACHE_KEY);
}
