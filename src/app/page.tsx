import Hero from "@/components/Hero";
import MarketTrend from "@/components/MarketTrend";
import Features from "@/components/Features"; // 1. Added Features import
import Ecosystem from "@/components/Ecosystem";
import CTA from "@/components/CTA";
import Link from "next/link";
import { auth } from "@/auth";

// Fetch the top 4 coins for the homepage banner
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
  const session = await auth(); // <-- Check if logged in

  return (
    <main className="bg-slate-950 min-h-screen text-white selection:bg-emerald-500/30">
      
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          {/* Logo links home */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 transform rotate-3">V</div>
            <div className="text-xl font-bold tracking-tight text-white uppercase">Coin Vault</div>
          </Link>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <Link href="/market" className="hover:text-emerald-500 transition-colors">Markets</Link>
            <Link href="/login" className="hover:text-emerald-500 transition-colors">Trade</Link>
          </div>

          <div className="space-x-4 flex items-center">
            {/* Show Dashboard if logged in, else show Auth buttons */}
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

      {/* Page Sections */}
      <Hero />
      <MarketTrend coins={trendingCoins} />
      <Features /> {/* 2. Inserted Features component here */}
      <Ecosystem />
      <CTA />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10 py-12 text-center">
         <p className="text-slate-500 text-sm font-medium">© 2026 Coin Vault. Secure Crypto Portfolio Management.</p>
      </footer>
    </main>
  );
}