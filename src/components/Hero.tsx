"use client";
import Link from "next/link";
import { ArrowRight, Shield, Zap, BarChart3, Lock, Wallet, ArrowUpRight, ArrowDownRight, Activity, Search, Bell } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-slate-950 pt-24 pb-32">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Institutional Grade Security
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            Secure. Trade. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Grow.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
            The ultimate digital asset vault designed for high-net-worth individuals and institutions. Experience lightning-fast execution, military-grade encryption, and real-time market insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40">
              Open Your Vault <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 px-8 py-4 rounded-xl font-bold transition-all">
              Sign In Securely
            </Link>
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-8 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2"><Shield size={16} className="text-emerald-500"/> AES-256 Encryption</div>
            <div className="flex items-center gap-2"><Zap size={16} className="text-emerald-500"/> Instant Execution</div>
            <div className="flex items-center gap-2 hidden sm:flex"><Lock size={16} className="text-emerald-500"/> 100% Cold Storage</div>
          </div>
        </div>

        {/* THE ENHANCED INTERACTIVE DASHBOARD PREVIEW */}
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-950/50 p-2 shadow-2xl backdrop-blur-xl transform hover:scale-[1.01] transition-transform duration-500">
          <div className="rounded-xl border border-slate-800/50 bg-slate-900 overflow-hidden flex h-[500px]">
            
            {/* Mock Sidebar */}
            <div className="w-16 md:w-48 border-r border-slate-800/50 bg-slate-950/50 flex flex-col p-4">
              <div className="h-8 w-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-10 shrink-0">
                <Wallet size={16} className="text-emerald-500" />
              </div>
              <div className="space-y-6 flex-1">
                <div className="w-full h-8 bg-slate-800/50 rounded-md flex items-center px-2 gap-3"><BarChart3 size={14} className="text-emerald-500"/><div className="h-2 w-16 bg-slate-700 rounded hidden md:block"></div></div>
                <div className="w-full h-8 hover:bg-slate-800/30 rounded-md flex items-center px-2 gap-3"><Activity size={14} className="text-slate-500"/><div className="h-2 w-20 bg-slate-800 rounded hidden md:block"></div></div>
                <div className="w-full h-8 hover:bg-slate-800/30 rounded-md flex items-center px-2 gap-3"><ArrowRight size={14} className="text-slate-500"/><div className="h-2 w-14 bg-slate-800 rounded hidden md:block"></div></div>
              </div>
            </div>

            {/* Mock Main Content */}
            <div className="flex-1 p-6 flex flex-col">
              {/* Mock Header */}
              <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-4">
                <div className="h-4 w-32 bg-slate-800 rounded"></div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 bg-slate-800/50 rounded-full flex items-center justify-center"><Search size={14} className="text-slate-500" /></div>
                  <div className="h-8 w-8 bg-slate-800/50 rounded-full flex items-center justify-center"><Bell size={14} className="text-slate-500" /></div>
                </div>
              </div>

              {/* Mock Balance Area */}
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Total Portfolio Value</p>
                <div className="flex items-end gap-4">
                  <h2 className="text-4xl md:text-5xl font-mono text-white tracking-tighter">$1,245,892<span className="text-slate-500">.50</span></h2>
                  <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold mb-1 border border-emerald-500/20">
                    <ArrowUpRight size={14} /> +4.2%
                  </div>
                </div>
              </div>

              {/* Mock Asset List */}
              <div className="flex-1 bg-slate-950/50 rounded-xl border border-slate-800/50 p-4 space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Your Assets</p>
                
                {/* Bitcoin Row */}
                <div className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg transition-colors border border-transparent hover:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xs">₿</div>
                    <div>
                      <p className="text-sm font-bold text-white">Bitcoin</p>
                      <p className="text-[10px] text-slate-500 font-mono">2.45 BTC</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-white">$156,840.00</p>
                    <p className="text-[10px] text-emerald-500 flex items-center justify-end gap-1"><ArrowUpRight size={10}/> +2.1%</p>
                  </div>
                </div>

                {/* Ethereum Row */}
                <div className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg transition-colors border border-transparent hover:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">Ξ</div>
                    <div>
                      <p className="text-sm font-bold text-white">Ethereum</p>
                      <p className="text-[10px] text-slate-500 font-mono">18.5 ETH</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-white">$42,550.00</p>
                    <p className="text-[10px] text-emerald-500 flex items-center justify-end gap-1"><ArrowUpRight size={10}/> +5.4%</p>
                  </div>
                </div>

                {/* Solana Row */}
                <div className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg transition-colors border border-transparent hover:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-xs">S</div>
                    <div>
                      <p className="text-sm font-bold text-white">Solana</p>
                      <p className="text-[10px] text-slate-500 font-mono">450 SOL</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-white">$64,800.00</p>
                    <p className="text-[10px] text-red-500 flex items-center justify-end gap-1"><ArrowDownRight size={10}/> -1.2%</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}