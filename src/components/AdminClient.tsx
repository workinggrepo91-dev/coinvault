"use client";
import { useState } from "react";
import { updateBalance, updateAssetDetails, updateUserCustomizations, addTransaction } from "@/app/actions/admin";
import { Users, Save, PlusCircle, Wallet } from "lucide-react";

export default function AdminClient({ users }: { users: any[] }) {
  const [activeUserId, setActiveUserId] = useState(users[0]?.id);
  const activeUser = users.find((u) => u.id === activeUserId);

  if (!users || users.length === 0) return <div className="p-10 text-white">No users found.</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      
      {/* LEFT: Clickable User List */}
      <div className="w-full md:w-1/3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[80vh] flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
          <Users className="text-emerald-500" size={18} />
          <h3 className="font-bold text-white uppercase tracking-wider text-sm">Registered Users</h3>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {users.map((user) => (
            <button 
              key={user.id} 
              onClick={() => setActiveUserId(user.id)}
              className={`w-full text-left p-4 rounded-xl transition-all ${activeUserId === user.id ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-950 border border-slate-800 hover:border-slate-600'}`}
            >
              <p className="font-bold text-white text-sm">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">{user.email}</p>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Active User Editor */}
      {activeUser && (
        <div key={activeUser.id} className="w-full md:w-2/3 space-y-6 h-[80vh] overflow-y-auto pr-2 pb-20">
          
          <div className="bg-slate-900 p-6 border border-slate-800 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">Editing: {activeUser.firstName}</h2>
            <p className="text-xs font-mono text-emerald-500 mb-6">Acc: {activeUser.accountNumber || "Pending"}</p>

            {/* 1. Customizations Form */}
            <form action={updateUserCustomizations} className="mb-8 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customizations & Alerts</h4>
                <button className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors"><Save size={12}/> Save</button>
              </div>
              <input type="hidden" name="userId" value={activeUser.id} />

              <div>
                <label className="text-[9px] text-slate-600 block uppercase mb-1">Account Number</label>
                <input name="accountNumber" type="text" defaultValue={activeUser.accountNumber || ""} placeholder="e.g. 1029384756" className="w-full bg-transparent text-white text-sm outline-none border-b border-slate-800 focus:border-emerald-500 py-1" />
              </div>
              <div>
                <label className="text-[9px] text-slate-600 block uppercase mb-1">Vault Status Message (Dashboard Note)</label>
                <textarea name="vaultStatusMessage" defaultValue={activeUser.vaultStatusMessage || ""} className="w-full bg-slate-900/50 text-white text-xs outline-none border border-slate-800 focus:border-emerald-500 rounded-lg p-3 h-16 resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-slate-600 block uppercase mb-1">Send Modal Pop-up (Dormant Alert)</label>
                  <textarea name="sendMessage" defaultValue={activeUser.sendMessage || ""} className="w-full bg-slate-900/50 text-white text-xs outline-none border border-slate-800 focus:border-emerald-500 rounded-lg p-3 h-20 resize-none" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-600 block uppercase mb-1">Receive/Deposit Pop-up Note</label>
                  <textarea name="receiveMessage" defaultValue={activeUser.receiveMessage || ""} className="w-full bg-slate-900/50 text-white text-xs outline-none border border-slate-800 focus:border-emerald-500 rounded-lg p-3 h-20 resize-none" />
                </div>
              </div>
            </form>

            {/* 2. Transaction Generator */}
            <form action={addTransaction} className="mb-8 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-4">
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Manual Transaction Entry</h4>
                <button className="flex items-center gap-1 text-[10px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded transition-colors"><PlusCircle size={12}/> Post Tx</button>
              </div>
              <input type="hidden" name="userId" value={activeUser.id} />
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] text-slate-600 block uppercase mb-1">Type</label>
                  <select name="type" className="w-full bg-slate-900/50 text-white text-xs outline-none border border-slate-800 rounded-lg p-2">
                    <option value="RECEIVE">Receive / Deposit</option>
                    <option value="SEND">Send / Withdrawal</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-600 block uppercase mb-1">Amount</label>
                  <input name="amount" type="number" step="any" placeholder="e.g. 1.5" className="w-full bg-slate-900/50 text-white text-xs outline-none border border-slate-800 rounded-lg p-2" required />
                </div>
                <div>
                  <label className="text-[9px] text-slate-600 block uppercase mb-1">Asset Symbol</label>
                  <input name="asset" type="text" placeholder="e.g. BTC or USD" className="w-full bg-slate-900/50 text-white text-xs outline-none border border-slate-800 rounded-lg p-2" required />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[9px] text-slate-600 block uppercase mb-1">Date</label>
                  <input name="date" type="date" className="w-full bg-slate-900/50 text-white text-xs outline-none border border-slate-800 rounded-lg p-2" required />
                </div>
                <div>
                  <label className="text-[9px] text-slate-600 block uppercase mb-1">Time</label>
                  <input name="time" type="time" className="w-full bg-slate-900/50 text-white text-xs outline-none border border-slate-800 rounded-lg p-2" required />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] text-slate-600 block uppercase mb-1">Narration / Memo</label>
                  <input name="narration" type="text" placeholder="e.g. Payment for Contract" className="w-full bg-slate-900/50 text-white text-xs outline-none border border-slate-800 rounded-lg p-2" required />
                </div>
              </div>
            </form>

            {/* 3. Base Balance */}
            <form action={updateBalance} className="mb-8 flex gap-4 items-end bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-inner">
              <input type="hidden" name="userId" value={activeUser.id} />
              <div className="flex-1">
                <label className="text-[9px] text-slate-600 block uppercase mb-1">Base Fiat Balance (USD)</label>
                <input name="balance" type="number" step="any" defaultValue={activeUser.totalBalance || 0} className="w-full bg-transparent text-white text-lg font-mono outline-none border-b border-slate-800 focus:border-emerald-500 py-1" />
              </div>
              <button className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"><Save size={14}/> Set Fiat</button>
            </form>

            {/* 4. Asset Allocations & Wallet Addresses */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
              <div className="p-4 border-b border-slate-900 flex items-center gap-2">
                <Wallet className="text-emerald-500" size={16} />
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Crypto Assets & Addresses</h4>
              </div>
              {activeUser.assets.map((asset: any) => (
                <form action={updateAssetDetails} key={asset.id} className="flex flex-col md:flex-row gap-4 p-4 border-b border-slate-900 last:border-0 items-end hover:bg-slate-900/50 transition-colors">
                  <input type="hidden" name="assetId" value={asset.id} />
                  <div className="w-20">
                    <p className="text-white font-bold text-sm">{asset.symbol}</p>
                    <p className="text-[10px] text-slate-500">{asset.name}</p>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] text-slate-600 block uppercase mb-1">Coin Amount</label>
                    <input name="amount" type="number" step="any" defaultValue={asset.amount} className="w-full bg-slate-900 text-white text-sm outline-none border border-slate-800 focus:border-emerald-500 rounded px-2 py-1" />
                  </div>
                  <div className="flex-2 w-full md:w-auto">
                    <label className="text-[9px] text-slate-600 block uppercase mb-1">Wallet Address (For Receive Modal)</label>
                    <input name="walletAddress" type="text" defaultValue={asset.walletAddress || ""} placeholder="Leave blank to say 'Generating...'" className="w-full bg-slate-900 text-white font-mono text-xs outline-none border border-slate-800 focus:border-emerald-500 rounded px-2 py-1.5" />
                  </div>
                  <button className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded font-bold transition-colors">Save</button>
                </form>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}