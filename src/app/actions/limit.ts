"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function requestLimitIncrease(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const dailyLimit = parseFloat(formData.get("dailyLimit") as string);
  const monthlyLimit = parseFloat(formData.get("monthlyLimit") as string);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      requestedDaily: dailyLimit,
      requestedMonthly: monthlyLimit,
      limitRequestStatus: "PENDING",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}
