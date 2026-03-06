import Hero from "@/components/Hero";
import MarketTrend from "@/components/MarketTrend";
import Ecosystem from "@/components/Ecosystem";
import CTA from "@/components/CTA";
import { getLivePrices } from "@/lib/coingecko";
import Link from "next/link";

export default async function LandingPage() {
  const prices = await getLivePrices();

  return (
    <main className="bg-slate-950 min-h-screen text-white selection:bg-emerald-500/30">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-bold text-slate-950 transform rotate-3">
              V
            </div>
            <div className="text-xl font-bold tracking-tight text-white">Coin Vault</div>
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-yellow-500 transition-colors">Buy Crypto</a>
            <a href="#" className="hover:text-yellow-500 transition-colors">Markets</a>
            <a href="#" className="hover:text-yellow-500 transition-colors">Trade</a>
            <a href="#" className="hover:text-yellow-500 transition-colors">Earn</a>
          </div>

          <div className="space-x-4 flex items-center">
            <Link href="/login" className="text-sm font-medium hover:text-yellow-500 transition-colors">
              Log In
            </Link>
            <Link href="/register" className="bg-yellow-500 text-slate-950 px-5 py-2 rounded-md text-sm font-bold hover:bg-yellow-400 transition-all">
              Register
            </Link>
          </div>
        </div>
      </nav>

      <Hero />
      <MarketTrend prices={prices} />
      <Ecosystem />
      <CTA />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-12 text-center">
         <p className="text-slate-500 text-sm">© 2026 Coin Vault Inc. Modeled after the best.</p>
      </footer>
    </main>
  );
}