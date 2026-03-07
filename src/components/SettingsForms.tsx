"use client";
import { useActionState } from "react";
import { updateProfile, updatePassword } from "@/app/actions/settings";
import { Save, Lock, User, ShieldAlert, Smartphone } from "lucide-react";

export default function SettingsForms({ user }: { user: any }) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateProfile, null);
  const [passState, passAction, isPassPending] = useActionState(updatePassword, null);

  return (
    <div className="grid gap-8">
      
      {/* --- NEW: KYC Verification Banner --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="bg-red-500/10 p-3 rounded-full text-red-500 mt-1 md:mt-0 shadow-lg shadow-red-500/10">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Identity Verification (KYC)</h3>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed max-w-lg">
              Your account is currently <span className="text-red-400 font-bold">Unverified (Level 1)</span>. 
              To lift your "Safe Mode" withdrawal limits, you must complete identity verification.
            </p>
          </div>
        </div>
        <button type="button" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap w-full md:w-auto shadow-lg">
          Verify Identity
        </button>
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