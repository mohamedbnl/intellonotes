"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { withdrawals } from "@/lib/db/schema";
import { getProfessorEarnings } from "@/lib/db/queries";
import { MIN_WITHDRAWAL_AMOUNT } from "@/lib/constants";

export async function requestWithdrawal(
  amount: number,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "unauthenticated" };
  if (session.user.role !== "professor") return { error: "forbidden" };

  if (!amount || amount < MIN_WITHDRAWAL_AMOUNT) {
    return { error: "belowMinimum" };
  }

  const earnings = getProfessorEarnings(session.user.id);
  if (amount > earnings.availableBalance) {
    return { error: "insufficientBalance" };
  }

  try {
    db.insert(withdrawals)
      .values({
        professor_id: session.user.id,
        amount,
        status: "pending",
      })
      .run();
  } catch {
    return { error: "generic" };
  }

  revalidatePath(`/${locale}/professor/earnings`);
  return {};
}
