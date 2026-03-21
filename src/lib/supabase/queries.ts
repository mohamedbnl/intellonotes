import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/database";

/**
 * Fetch a user's role from public.users.
 * Centralizes the cast needed due to manual Database type.
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole | null> {
  const { data } = (await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single()) as { data: { role: UserRole } | null; error: unknown };

  return data?.role ?? null;
}
