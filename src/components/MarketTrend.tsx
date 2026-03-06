import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function MarketTrend({ prices }: { prices: any }) {
  if (!prices) return null;

  return (
    <section className="py-20 bg-slate-950 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-white">Market Trend</h2>
          <Link href="/register" className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 text-sm font-bold">
            View All Markets <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-4 p-4 border-b border-slate-800 bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div className="pl-4">Name</div>
            <div className="text-right">Last Price</div>
            <div className="text-right">24h Change</div>
            <div className="text-right pr-4">Action</div>
          </div>

          {Object.entries(prices).map(([id, data]: any) => {
            const isPositive = data.usd_24h_change >= 0;
            return (
              <div key={id} className="grid grid-cols-4 p-6 border-b border-slate-800 hover:bg-slate-800/50 transition-colors items-center group">
                <div className="flex items-center gap-4 pl-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold capitalize text-white group-hover:bg-emerald-500 transition-colors">
                    {id[0]}
                  </div>
                  <span className="font-bold text-white capitalize text-lg">{id}</span>
                  <span className="text-xs text-slate-500 uppercase">{id.substring(0, 3)}</span>
                </div>
                
                <div className="text-right font-mono text-white text-lg">
                  ${data.usd.toLocaleString()}
                </div>
                
                <div className={`text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{data.usd_24h_change.toFixed(2)}%
                </div>
                
                <div className="text-right pr-4">
                  <Link href="/login" className="text-emerald-500 hover:text-emerald-300 text-sm font-bold underline decoration-2 decoration-emerald-500/30 hover:decoration-emerald-500 transition-all">
                    Trade
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}