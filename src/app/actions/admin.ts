"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Update the main USD balance
export async function updateBalance(formData: FormData) {
  const userId = formData.get("userId") as string;
  const newBalance = parseFloat(formData.get("newBalance") as string);

  await prisma.user.update({
    where: { id: userId },
    data: { totalBalance: newBalance }
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

// Update specific coin amounts (e.g., 2.5 BTC)
export async function updateAssetDetails(formData: FormData) {
  const assetId = formData.get("assetId") as string;
  const newAmount = parseFloat(formData.get("newAmount") as string);
  const newAddress = formData.get("walletAddress") as string;

  await prisma.asset.update({
    where: { id: assetId },
    data: { 
      amount: newAmount,
      walletAddress: newAddress
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}