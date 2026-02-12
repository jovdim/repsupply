import { createClient } from "@/lib/supabase/client";
import { cacheGet, cacheSet, cacheInvalidate, TTL } from "@/lib/cache";

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
  const cached = cacheGet<YupooStore[]>(STORE_CACHE_KEY);
  if (cached) return cached;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("yupoo_stores")
    .select("*")
    .order("name");

  if (error || !data) {
    console.error("Error fetching Yupoo stores:", error);
    return [];
  }

  cacheSet(STORE_CACHE_KEY, data, TTL.MEDIUM);
  return data;
}

/**
 * Invalidate Yupoo stores cache.
 */
export function invalidateYupooCache(): void {
  cacheInvalidate(STORE_CACHE_KEY);
}
