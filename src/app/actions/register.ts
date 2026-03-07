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
    // In Zod, the array of errors is found in the 'issues' property
    const firstError = validated.error.issues[0].message;
    return { error: firstError };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: validated.data.email } });
  if (existingUser) return { error: "This email is already registered." };

  const hashedPassword = await bcrypt.hash(validated.data.password, 10);

  try {
 await prisma.user.create({
      data: {
        firstName: validated.data.firstName,
        lastName: validated.data.lastName,
        username: validated.data.username,
        email: validated.data.email,
        phoneNumber: validated.data.phone,
        password: hashedPassword,
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