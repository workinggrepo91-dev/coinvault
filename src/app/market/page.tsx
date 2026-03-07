import AppShell from "@/components/AppShell";
import { auth } from "@/auth";
import { TrendingUp, Activity } from "lucide-react";

// Fetch live market data from CoinGecko
async function getMarketData() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false",
      { next: { revalidate: 60 } } // Refresh every 60 seconds
    );
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function MarketPage() {
  const session = await auth();
  const coins = await getMarketData();
  
  // Create a boolean variable to check if user is logged in
  const isLoggedIn = !!session?.user;

  return (
    // Pass the isLoggedIn variable to the AppShell
    <AppShell role={session?.user?.role || "USER"} isLoggedIn={isLoggedIn}>
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex justify-between items-end border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-500">
              <Activity size={20} />
              <h1 className="text-[10px] font-bold uppercase tracking-[0.2em]">Global Market</h1>
            </div>
            <p className="text-3xl font-bold tracking-tight text-white">Live Prices</p>
          </div>
        </header>

        {/* Market Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4 text-right">Price (USD)</th>
                  <th className="px-6 py-4 text-right hidden sm:table-cell">24h Change</th>
                  <th className="px-6 py-4 text-right hidden md:table-cell">Market Cap</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {coins.map((coin: any) => {
                  const isPositive = coin.price_change_percentage_24h >= 0;

                  return (
                    <tr key={coin.id} className="hover:bg-slate-800/50 transition-colors">
                      {/* Asset Name & Icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-bold text-white text-sm">{coin.name}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">{coin.symbol}</div>
                          </div>
                        </div>
                      </td>

                      {/* Live Price */}
                      <td className="px-6 py-4 text-right font-mono text-white text-sm">
                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </td>

                      {/* 24h Change (Hidden on extra small screens) */}
                      <td className={`px-6 py-4 text-right font-mono text-sm hidden sm:table-cell ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isPositive ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </div>
                      </td>

                      {/* Market Cap (Hidden on mobile devices) */}
                      <td className="px-6 py-4 text-right font-mono text-slate-400 text-sm hidden md:table-cell">
                        ${coin.market_cap.toLocaleString()}
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-center">
                        <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold transition-all">
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Empty State Fallback */}
            {coins.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Loading market data or rate limit exceeded. Please try again in a minute.
              </div>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}