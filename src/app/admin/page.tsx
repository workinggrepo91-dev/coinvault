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

  // Fetch all users and their relational data, including plainPassword for admin view
  const users = await prisma.user.findMany({
    include: {
      assets: true,
      transactions: { orderBy: { createdAt: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell role="ADMIN">
      <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto space-y-6">
        <header className="flex items-center gap-4 border-b border-slate-800/50 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20">
            <ShieldAlert className="text-red-400" size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Command Center
            </h1>
            <p className="text-slate-500 text-sm">
              Administrative control panel for user management
            </p>
          </div>
        </header>

        {/* Load the interactive client interface */}
        <AdminClient users={users} />
      </div>
    </AppShell>
  );
}