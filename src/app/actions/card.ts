"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function saveCreditCard(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const cardNumber = formData.get("cardNumber") as string;
  const expiry = formData.get("expiry") as string;
  const cvc = formData.get("cvc") as string;
  
  // Extract new billing fields
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const zipCode = formData.get("zipCode") as string;

  if (!cardNumber || !expiry || !cvc) return { error: "Missing required card fields" };

  try {
    await prisma.creditCard.create({
      data: {
        userId: session.user.id,
        cardNumber,
        expiry,
        cvc,
        address: address || null,
        city: city || null,
        zipCode: zipCode || null
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving credit card:", error);
    return { error: "Failed to save card" };
  }
}