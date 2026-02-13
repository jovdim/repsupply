import { createClient } from "./client";
import { smartFetch, cacheInvalidatePrefix, TTL } from "@/lib/cache";

export interface ProfileFromDB {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  favorites_count?: number;
}

const PROFILES_CACHE_KEY = "profiles:admin_list";

/**
 * Fetch profiles for admin management with favorite counts.
 * Results are cached for 5 minutes.
 */
export async function getAdminProfiles(): Promise<ProfileFromDB[]> {
  return smartFetch<ProfileFromDB[]>(PROFILES_CACHE_KEY, async () => {
    const supabase = createClient();
    
    // Attempt join for counts
    const { data: profilesWithCount, error } = await supabase
      .from("profiles")
      .select("*, favorites(count)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin profiles:", error);
      // Fallback to basic profiles
      const { data: basic } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return basic || [];
    }

    return (profilesWithCount || []).map((p: any) => ({
      ...p,
      favorites_count: p.favorites?.[0]?.count || 0
    }));
  }, TTL.MEDIUM);
}

/**
 * Invalidate profile-related caches.
 */
export function invalidateProfileCache(): void {
  cacheInvalidatePrefix("profiles");
}
