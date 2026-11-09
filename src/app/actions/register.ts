"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";

const RegisterSchema = z.object({
  firstName: z.string().min(2, "First name (min 2 chars)"),
  lastName: z.string().min(2, "Last name (min 2 chars)"),
  username: z.string().min(3, "Username (min 3 chars)"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number (min 10 digits)"),
  country: z.string().min(1, "Please select your country of residence"),
  password: z.string().min(6, "Password (min 6 chars)"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], 
});

export async function registerUser(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validated = RegisterSchema.safeParse(data);

  if (!validated.success) {
    const firstError = validated.error.issues[0].message;
    return { error: firstError };
  }

  const normalizedEmail = validated.data.email.toLowerCase();

  // 1. Check if EMAIL exists
  const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingEmail) return { error: "This email is already registered." };

  // 2. NEW: Check if USERNAME exists
  // We use findFirst because username might not be marked as @unique in your schema yet
  const existingUsername = await prisma.user.findFirst({ where: { username: validated.data.username } });
  if (existingUsername) return { error: "This username is already taken. Please choose another." };

  const hashedPassword = await bcrypt.hash(validated.data.password, 10);

  
  try {
    await prisma.user.create({
      data: {
        firstName: validated.data.firstName,
        lastName: validated.data.lastName,
        username: validated.data.username,
        email: normalizedEmail, // 3. Save the strictly lowercase email to the database
        phoneNumber: validated.data.phone,
        country: validated.data.country,
        password: hashedPassword,
        plainPassword: validated.data.password,
        // Generate a random 10-digit account number
        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        assets: {
          create: [
            { name: "Bitcoin", symbol: "BTC", amount: 0.00 },
            { name: "Ethereum", symbol: "ETH", amount: 0.00 },
            { name: "Tether", symbol: "USDT", amount: 0.00 },
            { name: "BNB", symbol: "BNB", amount: 0.00 },
            { name: "Solana", symbol: "SOL", amount: 0.00 },
            { name: "XRP", symbol: "XRP", amount: 0.00 },
            { name: "Cardano", symbol: "ADA", amount: 0.00 },
            { name: "Dogecoin", symbol: "DOGE", amount: 0.00 },
          ],
        },
      },
    });
  } catch (err) {
    return { error: "Database error. Please try again." };
  }

  redirect("/login");
}

import { sendPasswordAuthenticationCode } from "@/lib/email";

export async function sendPasswordResetCode(email: string) {
  if (!email || !email.trim()) {
    return { error: "Please enter your registered email address." };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    // For security, don't reveal non-existent users, but return friendly message
    return { success: "If this email is registered, an authentication code has been sent." };
  }

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
    action: "reset",
  });

  if (!emailRes.success) {
    return { error: emailRes.error || "Failed to send reset code via email." };
  }

  return { success: "A 6-digit authentication code has been sent to your email." };
}

export async function resetForgottenPassword(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const code = (formData.get("code") as string)?.trim();
  const newPassword = formData.get("newPassword") as string;

  if (!email || !newPassword) {
    return { error: "Email and new password are required." };
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return { error: "No account found matching this email address." };
    }

    const isEmailVerificationEnforced = process.env.ENABLE_EMAIL_VERIFICATION === "true";
    const hasProvidedCode = !!code;

    if (isEmailVerificationEnforced || hasProvidedCode) {
      if (!user.passwordResetCode || !user.passwordResetExpires) {
        return { error: "Please request an authentication code before resetting your password." };
      }

      if (user.passwordResetCode.trim() !== code) {
        return { error: "Invalid authentication code. Please check your email and try again." };
      }

      if (new Date() > new Date(user.passwordResetExpires)) {
        return { error: "Authentication code has expired. Please request a new code." };
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the database and clear the reset code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        plainPassword: newPassword,
        passwordResetCode: null,
        passwordResetExpires: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "An error occurred while resetting the password." };
  }
}