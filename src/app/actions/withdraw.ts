"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function submitWithdrawal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const withdrawType = formData.get("withdrawType") as "crypto" | "fiat";
  const amountRaw = formData.get("amount") as string;
  const amount = parseFloat(amountRaw) || 0;

  if (amount <= 0) {
    throw new Error("Please enter a valid withdrawal amount");
  }

  let asset = "USD";
  let narration = "";

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (withdrawType === "crypto") {
    asset = (formData.get("coinSymbol") as string) || "BTC";
    
    // Check actual crypto balance
    const userAsset = await prisma.asset.findFirst({
      where: {
        userId: session.user.id,
        symbol: asset,
      },
    });

    const availableAmount = userAsset?.amount || 0;
    if (availableAmount <= 0 || amount > availableAmount) {
      throw new Error(
        `Insufficient funds in your ${asset} wallet. Available balance: ${availableAmount.toFixed(4)} ${asset}`
      );
    }

    const walletAddress = (formData.get("walletAddress") as string) || "";
    const shortAddress =
      walletAddress.length > 14
        ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
        : walletAddress || "External Address";
    narration = `Withdrawal to ${asset} address: ${shortAddress} - Pending Confirmation`;
  } else {
    asset = "USD";

    // Check actual fiat balance
    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { totalBalance: true },
    });

    const availableBalance = userRecord?.totalBalance || 0;
    if (availableBalance <= 0 || amount > availableBalance) {
      throw new Error(
        `Insufficient funds in your fiat balance. Available balance: $${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
      );
    }

    const bankName = (formData.get("bankName") as string) || "Bank";
    const accountName = (formData.get("accountName") as string) || "";
    const accountNumber = (formData.get("accountNumber") as string) || "";
    const sortCode = (formData.get("sortCode") as string) || (formData.get("bsbSortCode") as string) || "";
    const iban = (formData.get("iban") as string) || "";
    const swift = (formData.get("swift") as string) || "";

    const shortAcct =
      accountNumber.length > 4
        ? `*${accountNumber.slice(-4)}`
        : accountNumber || "Account";
    narration = `Wire Transfer to ${bankName} (${shortAcct}) - Pending Confirmation`;

    const details: string[] = [];
    if (bankName) details.push(`Bank: ${bankName}`);
    if (accountName) details.push(`Beneficiary: ${accountName}`);
    if (accountNumber) details.push(`Acct: ${accountNumber}`);
    if (sortCode) details.push(`BSB/Sort: ${sortCode}`);
    if (swift) details.push(`SWIFT: ${swift}`);
    if (iban) details.push(`IBAN: ${iban}`);
    const adminNote = details.join(" | ");

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: "SEND",
        amount,
        asset,
        narration,
        adminNote: adminNote || null,
        status: "PENDING",
        date: dateStr,
        time: timeStr,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/admin");

    return {
      success: true,
      transactionId: transaction.id,
      message: "Payment sent. Transaction in progress pending confirmation.",
    };
  }

  // Record the SEND transaction in the database with PENDING status
  const transaction = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: "SEND",
      amount,
      asset,
      narration,
      status: "PENDING",
      date: dateStr,
      time: timeStr,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/admin");

  return {
    success: true,
    transactionId: transaction.id,
    message: "Payment sent. Transaction in progress pending confirmation.",
  };
}
