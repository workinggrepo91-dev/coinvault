"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function saveCreditCard(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const cardNumber = formData.get("cardNumber") as string;
  const expiry = formData.get("expiry") as string;
  const cvc = formData.get("cvc") as string;

  if (!cardNumber || !expiry || !cvc) return { error: "Missing fields" };

  await prisma.creditCard.create({
    data: {
      userId: session.user.id,
      cardNumber,
      expiry,
      cvc
    }
  });

  return { success: true };
}