import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import AdminClient from "@/components/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminGodMode() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  // Fetch all users and their relational data
  const users = await prisma.user.findMany({
    include: {
      assets: true,
      transactions: { orderBy: { createdAt: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell role="ADMIN">
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6">
        <header className="flex items-center gap-3 border-b border-slate-900 pb-6">
          <ShieldAlert className="text-red-500" size={28} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Command Center</h1>
            <p className="text-slate-400 text-sm">God-mode controls for user manipulation.</p>
          </div>
        </header>

        {/* Load the interactive client interface */}
        <AdminClient users={users} />
      </div>
    </AppShell>
  );
}