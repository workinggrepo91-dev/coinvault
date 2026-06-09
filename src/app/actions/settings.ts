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
    data: { password: hashedPassword, plainPassword: validated.data.newPassword },
  });

  return { success: "Security credentials updated." };
}


// --- KYC & Identity Verification Logic ---

export async function uploadProfilePicture(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const file = formData.get("profilePicture") as File;
  if (!file || file.size === 0) return { error: "No file selected" };

  // Convert the file to a Base64 string for database storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { profilePicture: base64Image }
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function submitKYC(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const idType = formData.get("idType") as string;
  const idFront = formData.get("idFront") as File;
  const idBack = formData.get("idBack") as File;
  const utilityBill = formData.get("utilityBill") as File;

  if (!idType || !idFront || idFront.size === 0 || !idBack || idBack.size === 0 || !utilityBill || utilityBill.size === 0) {
    return { error: "All documents are required." };
  }

  // Convert all 3 files to Base64 buffers
  const frontBuffer = Buffer.from(await idFront.arrayBuffer());
  const backBuffer = Buffer.from(await idBack.arrayBuffer());
  const utilityBuffer = Buffer.from(await utilityBill.arrayBuffer());

  const frontBase64 = `data:${idFront.type};base64,${frontBuffer.toString("base64")}`;
  const backBase64 = `data:${idBack.type};base64,${backBuffer.toString("base64")}`;
  const utilityBase64 = `data:${utilityBill.type};base64,${utilityBuffer.toString("base64")}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      idType: idType,
      idFront: frontBase64, 
      idBack: backBase64,
      utilityBill: utilityBase64,
      verificationStatus: "PENDING"
    }
  });

  revalidatePath("/settings");
  revalidatePath("/admin");
}