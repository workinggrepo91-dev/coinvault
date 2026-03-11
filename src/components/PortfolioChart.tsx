"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export default function PortfolioChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveBTCData() {
      try {
        // Switched to CoinGecko: 7 days of live Bitcoin market data
        const res = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7");
        const rawData = await res.json();
        
        if (rawData && rawData.prices) {
          // CoinGecko returns an array of [timestamp, price]
          const formattedData = rawData.prices.map((priceData: [number, number]) => {
            const date = new Date(priceData[0]); 
            return {
              name: date.toLocaleDateString("en-US", { weekday: "short", hour: "numeric" }),
              value: priceData[1], // It's already a clean number, no parseFloat needed
            };
          });
          
          setData(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch live chart data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLiveBTCData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[250px] w-full mt-6 flex flex-col items-center justify-center border border-slate-800/50 rounded-2xl bg-slate-900/20">
         <Loader2 className="animate-spin text-emerald-500 mb-3" size={28} />
         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Syncing Global Market...</p>
      </div>
    );
  }

  // Custom tooltip to format the currency beautifully on hover
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0].value) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">{payload[0].payload.name}</p>
          <p className="text-emerald-400 font-mono font-bold text-lg tracking-tighter">
            ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[250px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
            minTickGap={40}
            dy={10}
          />
          <YAxis 
            hide={true} 
            domain={['dataMin - 500', 'dataMax + 500']} 
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} 
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#10B981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}