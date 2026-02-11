import { createClient } from "@/lib/supabase/client";

/**
 * Add a product to the user's favorites.
 */
export async function addFavorite(productId: number): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    product_id: productId,
  });

  return !error;
}

/**
 * Remove a product from the user's favorites.
 */
export async function removeFavorite(productId: number): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  return !error;
}

/**
 * Check if a product is favorited by the current user.
 */
export async function isFavorited(productId: number): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  return !error && !!data;
}

/**
 * Get all favorited products for the current user, with product details.
 */
export async function getFavorites(): Promise<any[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      id,
      created_at,
      products (
        id,
        name,
        price,
        image
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((fav: any) => ({
    id: fav.products.id,
    name: fav.products.name,
    price: fav.products.price,
    image: fav.products.image,
  }));
}
