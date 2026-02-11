import { createClient } from "@/lib/supabase/client";

/**
 * Record a product view for the current user.
 * Uses upsert-like logic: deletes old entry and inserts new one to keep latest timestamp.
 */
export async function recordView(productId: number): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Delete any existing entry for this product (so it moves to top)
  await supabase
    .from("view_history")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  // Insert new view
  await supabase.from("view_history").insert({
    user_id: user.id,
    product_id: productId,
  });
}

/**
 * Get the user's view history with product details.
 */
export async function getViewHistory(limit: number = 20): Promise<any[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("view_history")
    .select(`
      id,
      viewed_at,
      products (
        id,
        name,
        price,
        image
      )
    `)
    .eq("user_id", user.id)
    .order("viewed_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((item: any) => {
    const now = new Date();
    const viewed = new Date(item.viewed_at);
    const diffMs = now.getTime() - viewed.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let time = "just now";
    if (diffDays > 0) time = `${diffDays}d ago`;
    else if (diffHours > 0) time = `${diffHours}h ago`;
    else if (diffMins > 0) time = `${diffMins}m ago`;

    return {
      id: item.products.id,
      name: item.products.name,
      price: item.products.price,
      image: item.products.image,
      time,
    };
  });
}
