import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

// Fetch live global market prices
async function getMarketData() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false", { next: { revalidate: 30 } });
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userVault = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { assets: true },
  });

  if (!userVault) redirect("/login");

  const marketData = await getMarketData();
  
  // Fetch their transactions
  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell role={userVault.role}>
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-end border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Welcome back, {userVault.firstName}</h1>
            <p className="text-slate-400 text-sm">Here is your portfolio summary.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Account Number</p>
            <p className="text-sm font-mono text-emerald-400 font-bold mb-2">{userVault.accountNumber || "Pending Allocation"}</p>
          </div>
        </header>

        {/* Pass the new data down */}
        <DashboardClient assets={userVault.assets} totalBalance={userVault.totalBalance} user={userVault} marketData={marketData} transactions={transactions} />
      </div>
    </AppShell>
  );
}