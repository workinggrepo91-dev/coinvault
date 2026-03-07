import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import AppShell from "@/components/AppShell"; // 1. Import the shell

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userVault = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { assets: true }
  });

  if (!userVault) return <div>Error loading vault.</div>;

  return (
    // 2. Wrap everything in the shell and pass the role
    <AppShell role={session.user.role}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-8 md:mb-10 border-b border-slate-900 pb-6 md:pb-8">
          <div>
            <h1 className="text-emerald-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-1 md:mb-2">Secure Account</h1>
            <p className="text-2xl md:text-3xl font-bold tracking-tight">
              {userVault.firstName} {userVault.lastName}
            </p>
            <p className="text-slate-500 text-xs md:text-sm mt-1">{userVault.email}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Account Number</p>
            <p className="text-sm font-mono text-emerald-400 font-bold mb-2">{userVault.accountNumber || "Pending Allocation"}</p>
            
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Vault ID</p>
            <p className="text-xs font-mono text-slate-400">{userVault.id.slice(0, 12)}...</p>
          </div>
        </header>

        {/* Pass the entire userVault object so the client can read the messages */}
        <DashboardClient assets={userVault.assets} totalBalance={userVault.totalBalance} user={userVault} />
      </div>
    </AppShell>
  );
}