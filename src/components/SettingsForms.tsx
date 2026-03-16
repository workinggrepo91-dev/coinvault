"use client";
import { useActionState } from "react";
import { updateProfile, updatePassword } from "@/app/actions/settings";
import { Save, Lock, User, ShieldAlert, Smartphone } from "lucide-react";
import { uploadProfilePicture, submitKYC } from "@/app/actions/settings"; // Import the new actions
import {Upload, Clock, ShieldCheck, XCircle, Loader2 } from "lucide-react"; // Added new icons

export default function SettingsForms({ user }: { user: any }) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateProfile, null);
  const [passState, passAction, isPassPending] = useActionState(updatePassword, null);

  return (
    <div className="grid gap-8">
      
     {/* --- Section 0: Profile Picture --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Profile Display</h3>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-slate-600">{user?.username?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const btn = e.currentTarget.querySelector('button');
              if(btn) btn.disabled = true;
              await uploadProfilePicture(new FormData(e.currentTarget));
              if(btn) btn.disabled = false;
            }} 
            className="flex-1 space-y-3"
          >
            <input type="file" name="profilePicture" accept="image/*" required className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 transition-all cursor-pointer" />
            <button type="submit" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              <Upload size={14} /> Upload Avatar
            </button>
          </form>
        </div>
      </div>

      {/* --- Section 0.5: Identity Verification (KYC) --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Identity Verification (KYC)</h3>
            <p className="text-xs text-slate-400 mt-1">Government regulations require us to verify your identity.</p>
          </div>
          
          <div className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${user?.verificationStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : user?.verificationStatus === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : user?.verificationStatus === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
            {user?.verificationStatus === 'APPROVED' && <ShieldCheck size={14} />}
            {user?.verificationStatus === 'PENDING' && <Clock size={14} />}
            {user?.verificationStatus === 'REJECTED' && <XCircle size={14} />}
            {user?.verificationStatus || 'UNVERIFIED'}
          </div>
        </div>

        {(!user?.verificationStatus || user.verificationStatus === "UNVERIFIED" || user.verificationStatus === "REJECTED") ? (
          <form 
             onSubmit={async (e) => {
               e.preventDefault();
               const btn = e.currentTarget.querySelector('button');
               if(btn) { btn.disabled = true; btn.innerHTML = "Uploading Documents..."; }
               await submitKYC(new FormData(e.currentTarget));
             }} 
             className="space-y-5 bg-slate-950 p-5 rounded-xl border border-slate-800"
          >
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Legal ID Type</label>
              <select name="idType" required className="w-full bg-slate-900 border border-slate-800 rounded-md p-3 text-xs text-white outline-none focus:border-emerald-500">
                <option value="">Select ID Type...</option>
                <option value="Driver's License">Driver's License</option>
                <option value="Passport">Passport</option>
                <option value="National ID">National ID</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800/50">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Upload Front of ID</label>
                <input type="file" name="idFront" accept="image/*" required className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-bold file:bg-slate-800 file:text-white cursor-pointer" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Upload Back of ID</label>
                <input type="file" name="idBack" accept="image/*" required className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-bold file:bg-slate-800 file:text-white cursor-pointer" />
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800/50">
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-[10px] uppercase font-bold text-slate-500">Add Utility Bill (Proof of Address)</label>
                 <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">Max 3 months old</span>
              </div>
              <p className="text-[10px] text-slate-600 mb-3 italic">e.g., Water bill, Electricity bill, Bank statement</p>
              <input type="file" name="utilityBill" accept="image/*" required className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-bold file:bg-slate-800 file:text-white cursor-pointer" />
            </div>

            <button type="submit" className="w-full flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 mt-2 shadow-lg shadow-emerald-500/10">
              Submit Documents for Review
            </button>
          </form>
        ) : (
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
            {user.verificationStatus === "PENDING" ? (
              <p className="text-sm text-slate-400">Your documents are currently under review by our compliance team. This usually takes 1-2 business days.</p>
            ) : (
              <p className="text-sm text-emerald-500 font-bold">Your identity has been successfully verified. Your account limits have been upgraded.</p>
            )}
          </div>
        )}
      </div>

      {/* --- Section 1: Profile Information --- */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
            <User size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Identity Management</h2>
        </div>

        {profileState?.success && <SuccessMsg msg={profileState.success} />}
        {profileState?.error && <ErrorMsg msg={profileState.error} />}

        <form action={profileAction} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="First Name" name="firstName" defaultValue={user.firstName} />
            <Input label="Last Name" name="lastName" defaultValue={user.lastName} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Username" name="username" defaultValue={user.username} />
            <Input label="Phone Number" name="phone" defaultValue={user.phoneNumber} />
          </div>
          
          <div className="pt-4 border-t border-slate-800/50 mt-6">
            <button disabled={isProfilePending} className="mt-4 flex items-center justify-center md:justify-start gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 w-full md:w-auto">
              <Save size={16} /> {isProfilePending ? "Saving Changes..." : "Save Profile Updates"}
            </button>
          </div>
        </form>
      </section>

      {/* --- Section 2: Security Center --- */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-800 p-2 rounded-lg text-white border border-slate-700">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Security Center</h2>
        </div>

        {passState?.success && <SuccessMsg msg={passState.success} />}
        {passState?.error && <ErrorMsg msg={passState.error} />}

        <form action={passAction} className="space-y-5 mb-8">
          <Input label="Current Password" name="currentPassword" type="password" placeholder="••••••••" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="New Password" name="newPassword" type="password" placeholder="Min 6 characters" />
            <Input label="Confirm New Password" name="confirmPassword" type="password" placeholder="Repeat new password" />
          </div>

          <div className="pt-2">
            <button disabled={isPassPending} className="flex items-center justify-center md:justify-start gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 w-full md:w-auto">
              <Lock size={16} /> {isPassPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>

        {/* --- NEW: 2FA Visual --- */}
        <div className="pt-8 border-t border-slate-800">
           <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Advanced Security</h3>
           <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <Smartphone className="text-slate-400" size={24} />
                <div>
                  <p className="font-bold text-white text-sm">Two-Factor Authentication (2FA)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Protect your vault with an authenticator app.</p>
                </div>
              </div>
              <button type="button" className="text-xs font-bold bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                Enable
              </button>
           </div>
        </div>
      </section>
    </div>
  );
}

// --- Helper Components ---
function Input({ label, name, type = "text", defaultValue, placeholder }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</label>
      <input 
        name={name} 
        type={type} 
        defaultValue={defaultValue} 
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-700 shadow-inner"
      />
    </div>
  );
}

function SuccessMsg({ msg }: { msg: string }) {
  return <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium flex items-center gap-2">✓ {msg}</div>;
}

function ErrorMsg({ msg }: { msg: string }) {
  return <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2">✕ {msg}</div>;
}