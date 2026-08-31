"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Lock, X, RefreshCw, Radio } from "lucide-react";

export default function MarketClient({
  coins: initialCoins,
  user,
}: {
  coins: any[];
  user?: any;
}) {
  const [coins, setCoins] = useState<any[]>(initialCoins || []);
  const [showDormantModal, setShowDormantModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  const refreshPrices = async () => {
    try {
      setIsUpdating(true);
      const res = await fetch("/api/market");
      if (res.ok) {
        const data = await res.json();
        if (data.coins && data.coins.length > 0) {
          setCoins(data.coins);
          const now = new Date();
          setLastUpdated(
            now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          );
        }
      }
    } catch (err) {
      console.warn("Live price poll error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    // Initial sync
    refreshPrices();

    // Live continuous polling every 6 seconds
    const interval = setInterval(refreshPrices, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Live Status Bar */}
      <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <Radio size={12} /> Live Ticker Feed
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            • Auto-syncing every 6s (Updated: {lastUpdated})
          </span>
        </div>

        <button
          onClick={refreshPrices}
          disabled={isUpdating}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-all"
        >
          <RefreshCw
            size={11}
            className={isUpdating ? "animate-spin text-emerald-400" : ""}
          />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4 text-right">Price (USD)</th>
                <th className="px-6 py-4 text-right hidden sm:table-cell">
                  24h Change
                </th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {coins.map((coin: any) => {
                const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
                return (
                  <tr
                    key={coin.id || coin.symbol}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {coin.image ? (
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white uppercase">
                            {coin.symbol?.[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm">
                            {coin.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">
                            {coin.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-white text-sm">
                      $
                      {Number(coin.current_price || 0).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits:
                            coin.current_price < 1 ? 4 : 2,
                        }
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-mono text-sm hidden sm:table-cell ${
                        isPositive ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {isPositive ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingUp size={14} className="rotate-180" />
                        )}
                        {Math.abs(
                          coin.price_change_percentage_24h || 0
                        ).toFixed(2)}
                        %
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setShowDormantModal(true)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-500 px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showDormantModal && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDormantModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDormantModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 animate-pulse">
                <Lock size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Action Required
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {user?.sendMessage || (
                  <>
                    This account is currently marked as{" "}
                    <span className="text-red-400 font-bold">Dormant</span> due
                    to inactivity. Trading is restricted.
                  </>
                )}
              </p>
              <button
                onClick={() => setShowDormantModal(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}