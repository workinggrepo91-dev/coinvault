import { Loader2, ShieldCheck } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Subtle Background Grid/Pulse to look technical */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full p-8">
        {/* Animated Logo */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl transform rotate-3 relative z-10 shadow-2xl shadow-emerald-500/20">
            V
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex items-center gap-3 mb-2">
          <Loader2 size={18} className="text-emerald-500 animate-spin" />
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">Decrypting Vault</h2>
        </div>
        
        <p className="text-slate-500 text-xs font-mono mb-8 animate-pulse">
          Establishing secure connection to global markets...
        </p>

        {/* Fake Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div className="h-full bg-emerald-500 rounded-full w-[60%] animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        </div>

        {/* Security Badges */}
        <div className="flex items-center gap-2 mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          <ShieldCheck size={14} className="text-emerald-500/50" />
          <span>End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
}