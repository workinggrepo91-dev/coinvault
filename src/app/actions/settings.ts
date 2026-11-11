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
  country: z.string().optional(),
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
        country: validated.data.country || null,
      },
    });
    revalidatePath("/dashboard");
    return { success: "Profile updated successfully." };
  } catch (err) {
    return { error: "Failed to update profile." };
  }
}

// --- Password Change Logic ---
import { sendPasswordAuthenticationCode } from "@/lib/email";

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const maskedUser = user.length > 2 ? user[0] + "***" + user[user.length - 1] : user[0] + "***";
  return `${maskedUser}@${domain}`;
}

export async function requestPasswordChangeCode() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized. Please log in again." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, username: true },
  });

  if (!user) return { error: "User account not found." };

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetCode: code,
      passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    },
  });

  const emailRes = await sendPasswordAuthenticationCode({
    to: user.email,
    name: user.username,
    code,
    action: "change",
  });

  if (!emailRes.success) {
    return { error: emailRes.error || "Failed to send verification code." };
  }

  return {
    success: `Verification code sent to ${maskEmail(user.email)}. Please check your inbox.`,
  };
}

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(6, "New password must be 6+ chars"),
  confirmPassword: z.string(),
  authCode: z.string().optional(),
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

  // 1. Get current user password hash & reset code
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return { error: "User not found" };

  // 2. Verify current password
  const isValid = await bcrypt.compare(validated.data.currentPassword, user.password);
  if (!isValid) return { error: "Incorrect current password." };

  // 3. Verify authentication code if feature is activated or code was supplied
  const isEmailVerificationEnforced = process.env.ENABLE_EMAIL_VERIFICATION === "true";
  const hasProvidedCode = !!validated.data.authCode?.trim();

  if (isEmailVerificationEnforced || hasProvidedCode) {
    if (!user.passwordResetCode || !user.passwordResetExpires) {
      return { error: "Please request an authentication code before updating your password." };
    }

    const cleanInputCode = (validated.data.authCode || "").trim();
    if (user.passwordResetCode.trim() !== cleanInputCode) {
      return { error: "Invalid authentication code. Please check your email." };
    }

    if (new Date() > new Date(user.passwordResetExpires)) {
      return { error: "Authentication code has expired. Please request a new code." };
    }
  }

  // 4. Hash new password
  const hashedPassword = await bcrypt.hash(validated.data.newPassword, 10);

  // 5. Update DB and invalidate code
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      password: hashedPassword,
      plainPassword: validated.data.newPassword,
      passwordResetCode: null,
      passwordResetExpires: null,
    },
  });

  return { success: "Security credentials updated successfully." };
}


// --- KYC & Identity Verification Logic ---

import { uploadToCloudinary } from "@/lib/cloudinary";

export async function uploadProfilePicture(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const file = formData.get("profilePicture") as File;
  if (!file || file.size === 0) return { error: "No file selected." };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadRes = await uploadToCloudinary(buffer, "coinvault/profiles", {
      mimeType: file.type,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { profilePicture: uploadRes.url },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: "Profile picture updated successfully!" };
  } catch (err: any) {
    console.error("Profile picture upload error:", err);
    return { error: err.message || "Failed to upload avatar." };
  }
}

export async function uploadKYCDocument(formData: FormData): Promise<{
  success?: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized. Please log in." };

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { error: "No document file provided." };
    }

    // Maximum file size: 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { error: "File exceeds 15MB limit. Please upload a smaller image or document." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isImage = file.type.startsWith("image/");

    const uploadRes = await uploadToCloudinary(buffer, "coinvault/kyc", {
      resource_type: isImage ? "image" : "auto",
      mimeType: file.type,
    });

    return {
      success: true,
      url: uploadRes.url,
    };
  } catch (err: any) {
    console.error("KYC document upload error:", err);
    return { error: err.message || "Failed to upload document to cloud storage." };
  }
}

export async function submitKYCVerifiedUrls(data: {
  idType: string;
  idFrontUrl: string;
  idBackUrl: string;
  utilityBillUrl: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  if (
    !data.idType ||
    !data.idFrontUrl ||
    !data.idBackUrl ||
    !data.utilityBillUrl
  ) {
    return { error: "All documents (ID Type, Front, Back, and Utility Bill) are required." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        idType: data.idType,
        idFront: data.idFrontUrl,
        idBack: data.idBackUrl,
        utilityBill: data.utilityBillUrl,
        verificationStatus: "PENDING",
      },
    });

    revalidatePath("/settings");
    revalidatePath("/admin");
    return { success: "Documents uploaded and submitted successfully! Your account is now pending review." };
  } catch (err: any) {
    console.error("KYC submission error:", err);
    return { error: err.message || "Failed to submit verification request. Please try again." };
  }
}

export async function submitKYC(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const idType = formData.get("idType") as string;
  const idFront = formData.get("idFront") as File;
  const idBack = formData.get("idBack") as File;
  const utilityBill = formData.get("utilityBill") as File;

  if (
    !idType ||
    !idFront ||
    idFront.size === 0 ||
    !idBack ||
    idBack.size === 0 ||
    !utilityBill ||
    utilityBill.size === 0
  ) {
    return { error: "All documents (ID Front, ID Back, and Utility Bill) are required." };
  }

  try {
    // Process files sequentially to prevent network socket congestion
    const frontBuffer = Buffer.from(await idFront.arrayBuffer());
    const frontUpload = await uploadToCloudinary(frontBuffer, "coinvault/kyc", {
      resource_type: idFront.type.startsWith("image/") ? "image" : "auto",
      mimeType: idFront.type,
    });

    const backBuffer = Buffer.from(await idBack.arrayBuffer());
    const backUpload = await uploadToCloudinary(backBuffer, "coinvault/kyc", {
      resource_type: idBack.type.startsWith("image/") ? "image" : "auto",
      mimeType: idBack.type,
    });

    const utilityBuffer = Buffer.from(await utilityBill.arrayBuffer());
    const utilityUpload = await uploadToCloudinary(utilityBuffer, "coinvault/kyc", {
      resource_type: utilityBill.type.startsWith("image/") ? "image" : "auto",
      mimeType: utilityBill.type,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        idType,
        idFront: frontUpload.url,
        idBack: backUpload.url,
        utilityBill: utilityUpload.url,
        verificationStatus: "PENDING",
      },
    });

    revalidatePath("/settings");
    revalidatePath("/admin");
    return { success: "Documents uploaded successfully! Under review." };
  } catch (err: any) {
    console.error("KYC upload error:", err);
    return { error: err.message || "Failed to upload KYC documents. Please try again." };
  }
}