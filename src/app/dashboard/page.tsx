import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userVault = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { assets: true }
  });

  if (!userVault) return <div>Error loading vault.</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-10 border-b border-slate-900 pb-8">
          <div>
            <h1 className="text-emerald-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Secure Account</h1>
            <p className="text-3xl font-bold tracking-tight">
              {userVault.firstName} {userVault.lastName}
            </p>
            <p className="text-slate-500 text-sm mt-1">{userVault.email} • {userVault.phoneNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Vault ID</p>
            <p className="text-xs font-mono text-slate-400">{userVault.id.slice(0, 12)}...</p>
          </div>
        </header>

        <DashboardClient assets={userVault.assets} totalBalance={userVault.totalBalance} />
      </div>
    </main>
  );
}