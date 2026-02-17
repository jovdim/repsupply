import { createClient } from "@/lib/supabase/client";

/**
 * Record a product view for the current user.
 * Deletes any existing entry first so the product appears only once
 * with the latest timestamp.
 * Accepts userId to avoid redundant auth.getUser() calls.
 */
export async function recordView(userId: string, productId: number): Promise<void> {
  const supabase = createClient();

  // Robust "upsert": delete old entry if any, then insert new one.
  // This avoids relying on a specific unique constraint name in the DB.
  await supabase
    .from("view_history")
    .delete()
    .match({ user_id: userId, product_id: productId });

  await supabase
    .from("view_history")
    .insert({
      user_id: userId,
      product_id: productId,
      viewed_at: new Date().toISOString(),
    });
}

/**
 * Get the user's view history with product details.
 * Deduplicates by product_id (keeps only the most recent view).
 */
export async function getViewHistory(userId: string, limit: number = 20): Promise<any[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("view_history")
    .select(`
      id, viewed_at, product_id,
      products ( id, name, price, image )
    `)
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(limit * 5); // Fetch extra to account for potential duplicates (old data)

  if (error || !data) return [];

  // Deduplicate by product_id — keep only the most recent
  const seen = new Set<number>();
  const unique: any[] = [];

  for (const item of data) {
    const pid = (item as any).products?.id ?? item.product_id;
    if (seen.has(pid)) continue;
    seen.add(pid);
    unique.push(item);
    if (unique.length >= limit) break;
  }

  return unique.map((item: any) => {
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
