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
 * Resilient helper to retrieve currently authenticated user by either session id or email.
 */
async function getAuthenticatedUser() {
  const session = await auth();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  if (!userId && !userEmail) {
    return null;
  }

  return await prisma.user.findFirst({
    where: {
      OR: [
        ...(userId ? [{ id: userId }] : []),
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
    },
  });
}

/**
 * Initiates TOTP setup for the logged-in user.
 * Generates a base32 secret, otpauth:// URI, QR code data URL,
 * and emergency backup codes.
 */
export async function initiateTotpSetup() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return { error: "Unauthorized. Please sign in again." };
    }

    // Run user lookup and TOTP setup key generation concurrently
    const [user, setupData] = await Promise.all([
      prisma.user.findFirst({
        where: {
          OR: [
            ...(userId ? [{ id: userId }] : []),
            ...(userEmail ? [{ email: userEmail }] : []),
          ],
        },
        select: { id: true, email: true },
      }),
      generateTotpSetup(userEmail || "user@coinvault.com"),
    ]);

    if (!user) {
      return { error: "User account not found." };
    }

    const backupCodes = generateBackupCodes(8);

    // Save secret & backup codes, but keep totpEnabled as false until verified!
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpSecret: setupData.secret,
        totpBackupCodes: backupCodes,
      },
      select: { id: true },
    });

    return {
      success: true,
      secret: setupData.secret,
      qrCodeDataUrl: setupData.qrCodeDataUrl,
      backupCodes,
    };
  } catch (err: any) {
    console.error("Failed to initiate TOTP setup:", err);
    return { error: err?.message || "Failed to generate 2FA credentials. Please try again." };
  }
}

/**
 * Verifies the 6-digit code entered during initial setup
 * and enables TOTP on the user's account.
 */
export async function confirmTotpActivation(code: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: "Unauthorized. Please sign in again." };
    }

    if (!user.totpSecret) {
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
  } catch (err: any) {
    console.error("Failed to confirm TOTP activation:", err);
    return { error: err?.message || "Failed to activate 2FA. Please try again." };
  }
}

/**
 * Disables TOTP 2FA. Requires user's current password for confirmation.
 */
export async function disableTotp(password: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: "Unauthorized. Please sign in again." };
    }

    if (!password) {
      return { error: "Please enter your current account password to confirm." };
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
  } catch (err: any) {
    console.error("Failed to disable TOTP:", err);
    return { error: err?.message || "Failed to disable 2FA. Please try again." };
  }
}

/**
 * Generates fresh backup codes if the user is already enrolled.
 * Requires user's current password for confirmation.
 */
export async function regenerateBackupCodes(password: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: "Unauthorized. Please sign in again." };
    }

    if (!user.totpEnabled) {
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
  } catch (err: any) {
    console.error("Failed to regenerate backup codes:", err);
    return { error: err?.message || "Failed to generate backup codes. Please try again." };
  }
}

/**
 * Pre-login credential verification and TOTP requirement check.
 * Returns { success: true, requiresTotp: boolean } or { error: string }.
 */
export async function checkLoginTotpRequirement(formData: FormData) {
  try {
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
  } catch (err: any) {
    console.error("checkLoginTotpRequirement error:", err);
    return { error: err?.message || "Login verification failed." };
  }
}
