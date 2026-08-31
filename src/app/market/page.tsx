import AppShell from "@/components/AppShell";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Activity } from "lucide-react";
import MarketClient from "@/components/MarketClient";
import { fetchLiveMarketPrices } from "@/lib/prices";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const session = await auth();
  const coins = await fetchLiveMarketPrices();
  const isLoggedIn = !!session?.user;

  let dbUser = null;
  if (isLoggedIn && session?.user?.id) {
    dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  }

  return (
    <AppShell role={session?.user?.role || "USER"} isLoggedIn={isLoggedIn}>
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-end border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-500">
              <Activity size={20} />
              <h1 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Global Market
              </h1>
            </div>
            <p className="text-3xl font-bold tracking-tight text-white">
              Live Crypto Prices
            </p>
          </div>
        </header>

        {/* Pass live coins to client */}
        <MarketClient coins={coins} user={dbUser} />
      </div>
    </AppShell>
  );
}