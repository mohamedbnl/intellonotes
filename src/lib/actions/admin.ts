"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updatePurchaseStatus, updateCourseStatus, getAdminCourseDetail } from "@/lib/db/queries";

export async function confirmPurchase(
  purchaseId: string,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };

  try {
    updatePurchaseStatus(purchaseId, "confirmed");
  } catch {
    return { error: "updateFailed" };
  }

  revalidatePath(`/${locale}/admin/payments`);
  return {};
}

export async function rejectPurchase(
  purchaseId: string,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };

  try {
    updatePurchaseStatus(purchaseId, "rejected");
  } catch {
    return { error: "updateFailed" };
  }

  revalidatePath(`/${locale}/admin/payments`);
  return {};
}

export async function approveCourse(
  courseId: string,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };

  const course = getAdminCourseDetail(courseId);
  if (!course) return { error: "notFound" };
  if (course.status !== "pending") return { error: "invalidStatus" };

  try {
    updateCourseStatus(courseId, "approved");
  } catch {
    return { error: "updateFailed" };
  }

  revalidatePath(`/${locale}/admin/courses`);
  revalidatePath(`/${locale}`);
  return {};
}

export async function rejectCourse(
  courseId: string,
  reason: string,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };

  if (!reason.trim()) return { error: "reasonRequired" };

  const course = getAdminCourseDetail(courseId);
  if (!course) return { error: "notFound" };
  if (course.status !== "pending") return { error: "invalidStatus" };

  try {
    updateCourseStatus(courseId, "rejected", reason.trim());
  } catch {
    return { error: "updateFailed" };
  }

  revalidatePath(`/${locale}/admin/courses`);
  return {};
}

export async function suspendCourse(
  courseId: string,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };

  const course = getAdminCourseDetail(courseId);
  if (!course) return { error: "notFound" };
  if (course.status !== "approved") return { error: "invalidStatus" };

  try {
    updateCourseStatus(courseId, "suspended");
  } catch {
    return { error: "updateFailed" };
  }

  revalidatePath(`/${locale}/admin/courses`);
  revalidatePath(`/${locale}`);
  return {};
}
