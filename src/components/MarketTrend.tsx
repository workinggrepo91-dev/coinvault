import { TrendingUp } from "lucide-react";

export default function MarketTrend({ coins }: { coins: any[] }) {
  if (!coins || coins.length === 0) return null;

  return (
    <div className="bg-slate-950/50 border-y border-white/5 py-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest">Live Market Trends</h3>
          <a href="/market" className="text-emerald-500 text-sm font-bold hover:text-emerald-400 transition-colors">View All Markets →</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coins.slice(0, 4).map((coin) => {
            const isPositive = coin.price_change_percentage_24h >= 0;

            return (
              <div key={coin.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-bold text-white text-sm">{coin.symbol.toUpperCase()}</p>
                    <p className="text-slate-500 text-xs">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-white text-sm">
                    ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </p>
                  <p className={`text-xs font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}