"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import {
  generateTotpSetup,
  verifyTotpCode,
  generateBackupCodes,
  verifyAndConsumeBackupCode,
} from "@/lib/totp";

/**
 * Initiates TOTP setup for the logged-in user.
 * Generates a base32 secret, otpauth:// URI, QR code data URL,
 * and emergency backup codes.
 */
export async function initiateTotpSetup() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please sign in again." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, totpEnabled: true },
  });

  if (!user) {
    return { error: "User account not found." };
  }

  try {
    const { secret, uri, qrCodeDataUrl } = await generateTotpSetup(user.email);
    const backupCodes = generateBackupCodes(8);

    // Save secret & backup codes, but keep totpEnabled as false until verified!
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpSecret: secret,
        totpBackupCodes: backupCodes,
      },
    });

    return {
      success: true,
      secret,
      qrCodeDataUrl,
      backupCodes,
    };
  } catch (err: any) {
    console.error("Failed to initiate TOTP setup:", err);
    return { error: "Failed to generate 2FA credentials. Please try again." };
  }
}

/**
 * Verifies the 6-digit code entered during initial setup
 * and enables TOTP on the user's account.
 */
export async function confirmTotpActivation(code: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please sign in again." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, totpSecret: true, totpEnabled: true },
  });

  if (!user || !user.totpSecret) {
    return { error: "No pending 2FA setup found. Please start setup again." };
  }

  const isValid = verifyTotpCode(user.totpSecret, code);
  if (!isValid) {
    return { error: "Invalid authenticator code. Check your device time and try again." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: true },
  });

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Disables TOTP 2FA. Requires user's current password for confirmation.
 */
export async function disableTotp(password: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please sign in again." };
  }

  if (!password) {
    return { error: "Please enter your current account password to confirm." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true, totpEnabled: true },
  });

  if (!user) {
    return { error: "User account not found." };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { error: "Incorrect password. 2FA was not disabled." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      totpEnabled: false,
      totpSecret: null,
      totpBackupCodes: [],
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Generates fresh backup codes if the user is already enrolled.
 * Requires user's current password for confirmation.
 */
export async function regenerateBackupCodes(password: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please sign in again." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true, totpEnabled: true },
  });

  if (!user || !user.totpEnabled) {
    return { error: "Two-factor authentication is not active on this account." };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { error: "Incorrect password. Verification failed." };
  }

  const newCodes = generateBackupCodes(8);

  await prisma.user.update({
    where: { id: user.id },
    data: { totpBackupCodes: newCodes },
  });

  revalidatePath("/settings");
  return { success: true, backupCodes: newCodes };
}

/**
 * Pre-login credential verification and TOTP requirement check.
 * Returns { success: true, requiresTotp: boolean } or { error: string }.
 */
export async function checkLoginTotpRequirement(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
      totpEnabled: true,
      totpSecret: true,
    },
  });

  if (!user) {
    return { error: "Invalid email or password. Please try again." };
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return { error: "Invalid email or password. Please try again." };
  }

  return {
    success: true,
    requiresTotp: !!(user.totpEnabled && user.totpSecret),
  };
}
