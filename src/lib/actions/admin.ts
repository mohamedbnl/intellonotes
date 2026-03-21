"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/queries";

export async function confirmPurchase(
  purchaseId: string,
  locale: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const role = await getUserRole(supabase, user.id);
  if (role !== "admin") return { error: "Forbidden" };

  const { error } = await supabase
    .from("purchases")
    .update({ status: "confirmed" } as never)
    .eq("id", purchaseId);

  if (error) return { error: error.message };

  revalidatePath(`/${locale}/admin/payments`);
  return {};
}

export async function rejectPurchase(
  purchaseId: string,
  locale: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const role = await getUserRole(supabase, user.id);
  if (role !== "admin") return { error: "Forbidden" };

  const { error } = await supabase
    .from("purchases")
    .update({ status: "rejected" } as never)
    .eq("id", purchaseId);

  if (error) return { error: error.message };

  revalidatePath(`/${locale}/admin/payments`);
  return {};
}
