import Hero from "@/components/Hero";
import MarketTrend from "@/components/MarketTrend";
import Features from "@/components/Features"; 
import Ecosystem from "@/components/Ecosystem";
import CTA from "@/components/CTA";
import Link from "next/link";
import { auth } from "@/auth";

// Fetch the top 4 coins for the homepage banner & ticker
async function getTrendingCoins() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=4&page=1&sparkline=false",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function LandingPage() {
  const trendingCoins = await getTrendingCoins();
  const session = await auth(); 

  // Duplicate the coins array multiple times to create a seamless infinite scrolling effect
  const tickerItems = [...trendingCoins, ...trendingCoins, ...trendingCoins, ...trendingCoins];

  return (
    <main className="bg-slate-950 min-h-screen text-white selection:bg-emerald-500/30">
      
      {/* Dynamic Marquee Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          display: flex;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 transform rotate-3">V</div>
            <div className="text-xl font-bold tracking-tight text-white uppercase">Coin Vault</div>
          </Link>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <Link href="/market" className="hover:text-emerald-500 transition-colors">Markets</Link>
            <Link href="/login" className="hover:text-emerald-500 transition-colors">Trade</Link>
          </div>

          <div className="space-x-4 flex items-center">
            {session?.user ? (
               <Link href="/dashboard" className="bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                 Go to Vault
               </Link>
            ) : (
               <>
                 <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-emerald-500 transition-colors">Log In</Link>
                 <Link href="/register" className="bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">Register</Link>
               </>
            )}
          </div>
        </div>
      </nav>

      <Hero />

      {/* NEW: Live Market Ticker Tape */}
      {trendingCoins.length > 0 && (
        <div className="w-full bg-slate-900/50 border-y border-slate-800/80 overflow-hidden py-3 relative flex items-center backdrop-blur-sm">
          {/* Faded edges for smooth entrance/exit */}
          <div className="absolute left-0 w-16 md:w-32 h-full bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 w-16 md:w-32 h-full bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
          
          <div className="animate-marquee gap-10 cursor-pointer">
             {tickerItems.map((coin: any, i) => (
                <div key={`${coin.id}-${i}`} className="flex items-center gap-3 px-4">
                   <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                   <span className="text-white text-sm font-bold uppercase tracking-wider">{coin.symbol}</span>
                   <span className="text-slate-400 text-sm font-mono">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                   <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${coin.price_change_percentage_24h >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                     {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                   </span>
                </div>
             ))}
          </div>
        </div>
      )}

      <MarketTrend coins={trendingCoins} />
      <Features /> 
      <Ecosystem />
      <CTA />

      <footer className="bg-slate-950 border-t border-white/10 py-12 text-center relative z-10">
         <p className="text-slate-500 text-sm font-medium">© 2026 Coin Vault. Secure Crypto Portfolio Management.</p>
      </footer>
    </main>
  );
}