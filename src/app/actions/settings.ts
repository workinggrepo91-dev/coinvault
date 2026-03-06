"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// --- Profile Update Logic ---
const ProfileSchema = z.object({
  firstName: z.string().min(2, "First name too short"),
  lastName: z.string().min(2, "Last name too short"),
  username: z.string().min(3, "Username too short"),
  phone: z.string().min(10, "Invalid phone number"),
});

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const data = Object.fromEntries(formData.entries());
  const validated = ProfileSchema.safeParse(data);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: validated.data.firstName,
        lastName: validated.data.lastName,
        username: validated.data.username,
        phoneNumber: validated.data.phone,
      },
    });
    revalidatePath("/dashboard");
    return { success: "Profile updated successfully." };
  } catch (err) {
    return { error: "Failed to update profile." };
  }
}

// --- Password Change Logic ---
const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(6, "New password must be 6+ chars"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

export async function updatePassword(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const data = Object.fromEntries(formData.entries());
  const validated = PasswordSchema.safeParse(data);

  if (!validated.success) return { error: validated.error.issues[0].message };

  // 1. Get current user password hash
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return { error: "User not found" };

  // 2. Verify current password
  const isValid = await bcrypt.compare(validated.data.currentPassword, user.password);
  if (!isValid) return { error: "Incorrect current password." };

  // 3. Hash new password
  const hashedPassword = await bcrypt.hash(validated.data.newPassword, 10);

  // 4. Update DB
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return { success: "Security credentials updated." };
}