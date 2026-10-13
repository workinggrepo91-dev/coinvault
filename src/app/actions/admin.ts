"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth, signIn } from "@/auth";

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
  
  // 1. Grab the new fields
  const dormantReason = formData.get("dormantReason") as string;
  const dormantAmountRaw = formData.get("dormantAmount");
  const dormantAmount = dormantAmountRaw ? parseFloat(dormantAmountRaw as string) : null;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        accountNumber: accountNumber || null,
        vaultStatusMessage: vaultStatusMessage || null,
        sendMessage: sendMessage || null,
        receiveMessage: receiveMessage || null,
        dormantReason: dormantReason || null, // 2. Save reason
        dormantAmount: dormantAmount,         // 3. Save amount
      }
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("ERROR: That Account Number is already in use!");
    } else {
      console.error(error);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function addTransaction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string) || 0;
  const asset = formData.get("asset") as string;
  const narration = formData.get("narration") as string;
  const status = (formData.get("status") as string) || "COMPLETED";
  const adminNote = formData.get("adminNote") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;

  await prisma.transaction.create({
    data: {
      userId,
      type,
      amount,
      asset,
      narration,
      status,
      adminNote: adminNote || null,
      date,
      time,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function updateTransactionStatus(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const transactionId = formData.get("transactionId") as string;
  const status = formData.get("status") as string;
  const narration = formData.get("narration") as string;
  const adminNote = formData.get("adminNote") as string;

  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status,
      narration: narration || undefined,
      adminNote: adminNote || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function deleteTransaction(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const transactionId = formData.get("transactionId") as string;

  await prisma.transaction.delete({
    where: { id: transactionId },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function impersonateUser(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const targetEmail = formData.get("email") as string;
  
  // Jump into the user's account and save the Admin's email so they can return later
  await signIn("credentials", {
    email: targetEmail,
    isImpersonation: "true",
    secret: "vault-super-secret-bypass",
    adminEmail: session.user.email, 
    redirectTo: "/dashboard"
  });
}


export async function revertImpersonation(formData: FormData) {
  const adminEmail = formData.get("adminEmail") as string;
  
  // Jump back into the Admin account
  await signIn("credentials", {
    email: adminEmail,
    isImpersonation: "true",
    secret: "vault-super-secret-bypass",
    redirectTo: "/admin"
  });
}

export async function updateVerificationStatus(formData: FormData) {
  const userId = formData.get("userId") as string;
  const status = formData.get("verificationStatus") as any;

  await prisma.user.update({
    where: { id: userId },
    data: { verificationStatus: status }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function approveLimitRequest(formData: FormData) {
  const userId = formData.get("userId") as string;
  const requestedDaily = parseFloat(formData.get("requestedDaily") as string);
  const requestedMonthly = parseFloat(formData.get("requestedMonthly") as string);

  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyLimit: requestedDaily,
      monthlyLimit: requestedMonthly,
      limitRequestStatus: "APPROVED",
      requestedDaily: null,
      requestedMonthly: null,
    }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function rejectLimitRequest(formData: FormData) {
  const userId = formData.get("userId") as string;

  await prisma.user.update({
    where: { id: userId },
    data: {
      limitRequestStatus: "REJECTED",
      requestedDaily: null,
      requestedMonthly: null,
    }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateUserWireDetails(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const userId = formData.get("userId") as string;
  const wireBankName = (formData.get("wireBankName") as string)?.trim() || null;
  const wireAccountName = (formData.get("wireAccountName") as string)?.trim() || null;
  const wireAccountNumber = (formData.get("wireAccountNumber") as string)?.trim() || null;
  const wireSortCode = (formData.get("wireSortCode") as string)?.trim() || null;
  const wireSwiftCode = (formData.get("wireSwiftCode") as string)?.trim() || null;
  const wireIban = (formData.get("wireIban") as string)?.trim() || null;
  const wireBankAddress = (formData.get("wireBankAddress") as string)?.trim() || null;
  const wirePaymentPurpose = (formData.get("wirePaymentPurpose") as string)?.trim() || null;
  const wirePaymentAdvice = (formData.get("wirePaymentAdvice") as string)?.trim() || null;
  const applyToAll = formData.get("applyToAll") === "true";

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        wireBankName,
        wireAccountName,
        wireAccountNumber,
        wireSortCode,
        wireSwiftCode,
        wireIban,
        wireBankAddress,
        wirePaymentPurpose,
        wirePaymentAdvice,
      },
    });
  }

  if (applyToAll) {
    await prisma.user.updateMany({
      data: {
        wireBankName,
        wireAccountName,
        wireAccountNumber,
        wireSortCode,
        wireSwiftCode,
        wireIban,
        wireBankAddress,
        wirePaymentPurpose,
        wirePaymentAdvice,
      },
    });

    await prisma.agencySetting.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        bankName: wireBankName,
        accountName: wireAccountName,
        accountNumber: wireAccountNumber,
        bsbSortCode: wireSortCode,
        swiftCode: wireSwiftCode,
        iban: wireIban,
        bankAddress: wireBankAddress,
        paymentPurpose: wirePaymentPurpose,
        paymentAdvice: wirePaymentAdvice,
      },
      update: {
        bankName: wireBankName,
        accountName: wireAccountName,
        accountNumber: wireAccountNumber,
        bsbSortCode: wireSortCode,
        swiftCode: wireSwiftCode,
        iban: wireIban,
        bankAddress: wireBankAddress,
        paymentPurpose: wirePaymentPurpose,
        paymentAdvice: wirePaymentAdvice,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateGlobalAgencySettings(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const bankName = (formData.get("bankName") as string)?.trim() || null;
  const accountName = (formData.get("accountName") as string)?.trim() || null;
  const accountNumber = (formData.get("accountNumber") as string)?.trim() || null;
  const bsbSortCode = (formData.get("bsbSortCode") as string)?.trim() || null;
  const swiftCode = (formData.get("swiftCode") as string)?.trim() || null;
  const iban = (formData.get("iban") as string)?.trim() || null;
  const bankAddress = (formData.get("bankAddress") as string)?.trim() || null;
  const paymentPurpose = (formData.get("paymentPurpose") as string)?.trim() || null;
  const paymentAdvice = (formData.get("paymentAdvice") as string)?.trim() || null;
  const syncAllUsers = formData.get("syncAllUsers") === "true";

  await prisma.agencySetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      bankName,
      accountName,
      accountNumber,
      bsbSortCode,
      swiftCode,
      iban,
      bankAddress,
      paymentPurpose,
      paymentAdvice,
    },
    update: {
      bankName,
      accountName,
      accountNumber,
      bsbSortCode,
      swiftCode,
      iban,
      bankAddress,
      paymentPurpose,
      paymentAdvice,
    },
  });

  if (syncAllUsers) {
    await prisma.user.updateMany({
      data: {
        wireBankName: bankName,
        wireAccountName: accountName,
        wireAccountNumber: accountNumber,
        wireSortCode: bsbSortCode,
        wireSwiftCode: swiftCode,
        wireIban: iban,
        wireBankAddress: bankAddress,
        wirePaymentPurpose: paymentPurpose,
        wirePaymentAdvice: paymentAdvice,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

