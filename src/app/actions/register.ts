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

export async function resetForgottenPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!email || !newPassword) {
    return { error: "Email and new password are required." };
  }

  try {
    // Dynamically require bcryptjs to avoid import conflicts
    const bcrypt = require("bcryptjs");

    // 1. FIX: Grab the named export 'prisma' instead of '.default'
    const { prisma } = await import("@/lib/prisma");
    
    // 2. Verify the user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (!existingUser) {
      return { error: "No account found matching this email address." };
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the database
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, plainPassword: newPassword }
    });

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "An error occurred while resetting the password." };
  }
}