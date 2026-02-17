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
 * Results are cached for 2 hours with SWR (stores rarely change).
 * Uses batched fetching to bypass Supabase's limit.
 */
export async function getYupooStores(): Promise<YupooStore[]> {
  return smartFetch<YupooStore[]>(STORE_CACHE_KEY, async () => {
    const supabase = createClient();
    const PAGE_SIZE = 1000;
    let allData: any[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("yupoo_stores")
        .select("id, name, link, image")
        .order("name")
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error("Error fetching Yupoo stores:", error);
        return allData;
      }

      if (!data || data.length === 0) break;
      allData = allData.concat(data);

      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    return allData;
  }, TTL.LONG);
}

/**
 * Invalidate Yupoo stores cache.
 */
export function invalidateYupooCache(): void {
  cacheInvalidatePrefix(STORE_CACHE_KEY);
}
