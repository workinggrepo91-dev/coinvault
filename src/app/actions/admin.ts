"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Update the main USD balance
export async function updateBalance(formData: FormData) {
  const userId = formData.get("userId") as string;
  
  // Force the input into a strict Float, and if it fails (like an empty input), save it as 0
  const balanceRaw = formData.get("balance");
  const safeBalance = parseFloat(balanceRaw as string) || 0; 

  await prisma.user.update({
    where: { id: userId },
    data: { 
      totalBalance: safeBalance 
    }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

// Update specific coin amounts (e.g., 2.5 BTC)
export async function updateAssetDetails(formData: FormData) {
  const assetId = formData.get("assetId") as string;
  const amountRaw = formData.get("amount");
  const safeAmount = parseFloat(amountRaw as string) || 0; // Protects against NaN
  const walletAddress = formData.get("walletAddress") as string;

  await prisma.asset.update({
    where: { id: assetId },
    data: { 
      amount: safeAmount,
      walletAddress: walletAddress || null
    }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateUserCustomizations(formData: FormData) {
  const userId = formData.get("userId") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const vaultStatusMessage = formData.get("vaultStatusMessage") as string;
  const sendMessage = formData.get("sendMessage") as string;
  const receiveMessage = formData.get("receiveMessage") as string;

  await prisma.user.update({
    where: { id: userId },
    data: {
      accountNumber: accountNumber || null,
      vaultStatusMessage: vaultStatusMessage || null,
      sendMessage: sendMessage || null,
      receiveMessage: receiveMessage || null,
    }
  });

  // Revalidate so changes show up immediately
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function addTransaction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const asset = formData.get("asset") as string;
  const narration = formData.get("narration") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;

  await prisma.transaction.create({
    data: { userId, type, amount, asset, narration, date, time }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

