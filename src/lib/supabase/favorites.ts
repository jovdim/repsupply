import { createClient } from "@/lib/supabase/client";

function formatPrice(raw: string): string {
  const num = parseFloat(raw?.toString().replace(/[^0-9.]/g, "") || "0");
  if (num > 0 && !/[^0-9.,\s]/.test(raw)) return `$${num.toFixed(2)}`;
  if (num > 0 && raw.includes("$")) return `$${num.toFixed(2)}`;
  return raw;
}

/**
 * Add a product to the user's favorites.
 * Accepts userId to avoid redundant auth.getUser() calls.
 */
export async function addFavorite(userId: string, productId: number): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("favorites").insert({
    user_id: userId,
    product_id: productId,
  });

  return !error;
}

/**
 * Remove a product from the user's favorites.
 */
export async function removeFavorite(userId: string, productId: number): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  return !error;
}

/**
 * Check if a product is favorited by the current user.
 */
export async function isFavorited(userId: string, productId: number): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  return !error && !!data;
}

/**
 * Get all favorited products for the current user, with product details.
 */
export async function getFavorites(userId: string): Promise<any[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      id,
      created_at,
      products (
        id, name, price, image, slug
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((fav: any) => ({
    id: fav.products.id,
    name: fav.products.name,
    price: formatPrice(fav.products.price),
    image: fav.products.image,
    slug: fav.products.slug,
  }));
}
