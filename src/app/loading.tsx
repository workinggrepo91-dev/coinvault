import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-5 animate-in fade-in duration-150">
      {/* Glowing animated spinner logo */}
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-sm">
            V
          </div>
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
          <Loader2 size={15} className="animate-spin text-emerald-400" />
          <span>Synchronizing Vault...</span>
        </p>
        <p className="text-xs text-slate-500">
          Fetching live ledger & cryptographic assets
        </p>
      </div>

      {/* Shimmer skeleton bar */}
      <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />
      </div>
    </div>
  );
}
