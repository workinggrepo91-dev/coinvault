import { prisma } from "@/lib/prisma";
import { updateBalance, updateAssetDetails } from "@/app/actions/admin"; // Note the new import
import { ShieldAlert, Wallet, RefreshCw } from "lucide-react";

export default async function AdminGodMode() {
  const users = await prisma.user.findMany({ 
    include: { assets: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center gap-3 mb-8 border-b border-slate-900 pb-6">
          <ShieldAlert className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">God Mode Console</h1>
            <p className="text-slate-500 text-sm">Manage user balances and assign deposit addresses.</p>
          </div>
        </header>
        
        <div className="grid gap-8">
          {users.map((user) => (
            <div key={user.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              {/* User Header */}
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className="text-xl font-bold text-white">{user.firstName} {user.lastName}</h3>
                   <p className="text-xs text-emerald-500 font-mono">ID: {user.id}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] text-slate-500 uppercase font-bold">Total USD Balance</p>
                   <p className="text-2xl font-mono text-emerald-400">${user.totalBalance.toLocaleString()}</p>
                 </div>
              </div>

              {/* Global Balance Form */}
              <form action={updateBalance} className="mb-8 flex gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <input type="hidden" name="userId" value={user.id} />
                <input name="newBalance" type="number" step="0.01" placeholder="Set Global USD Balance" className="flex-1 bg-transparent text-white outline-none text-sm" />
                <button className="text-xs bg-emerald-600 px-4 py-2 rounded-lg font-bold">Update USD</button>
              </form>

              {/* Asset Editor Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Crypto Assets & Addresses</h4>
                {user.assets.map((asset) => (
                  <form key={asset.id} action={updateAssetDetails} className="grid grid-cols-12 gap-2 items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <input type="hidden" name="assetId" value={asset.id} />
                    
                    {/* Coin Label */}
                    <div className="col-span-1 flex items-center justify-center font-bold text-emerald-500 text-xs bg-emerald-500/10 h-8 w-8 rounded-full">
                      {asset.symbol}
                    </div>

                    {/* Amount Input */}
                    <div className="col-span-3">
                      <label className="text-[9px] text-slate-600 block uppercase">Balance</label>
                      <input name="newAmount" type="number" step="0.000001" defaultValue={asset.amount} className="w-full bg-transparent text-white font-mono text-sm outline-none border-b border-slate-800 focus:border-emerald-500" />
                    </div>

                    {/* Wallet Address Input */}
                    <div className="col-span-6">
                      <label className="text-[9px] text-slate-600 block uppercase">Deposit Address</label>
                      <input 
                        name="walletAddress" 
                        type="text" 
                        defaultValue={asset.walletAddress || ""} 
                        placeholder={`Enter ${asset.symbol} Address`} 
                        className="w-full bg-transparent text-slate-300 font-mono text-xs outline-none border-b border-slate-800 focus:border-emerald-500 placeholder:text-slate-700" 
                      />
                    </div>

                    {/* Save Button */}
                    <div className="col-span-2 text-right">
                      <button className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}