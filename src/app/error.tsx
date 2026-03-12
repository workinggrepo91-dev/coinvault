"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { ShieldAlert, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Vault caught an error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center selection:bg-emerald-500/30">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full"></div>

        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 relative z-10">
          <ShieldAlert size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Secure Connection Lost</h2>
        
        <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
          The connection to the secure database node has timed out. This usually happens due to network latency or database sleep states. 
        </p>

        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-colors border border-slate-700 relative z-10"
        >
          <RefreshCcw size={16} />
          Re-establish Connection
        </button>
      </div>
    </div>
  );
}