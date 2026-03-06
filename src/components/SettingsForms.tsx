"use client";
import { useActionState } from "react";
import { updateProfile, updatePassword } from "@/app/actions/settings";
import { Save, Lock, User } from "lucide-react";

export default function SettingsForms({ user }: { user: any }) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateProfile, null);
  const [passState, passAction, isPassPending] = useActionState(updatePassword, null);

  return (
    <div className="grid gap-10">
      
      {/* --- Section 1: Profile Information --- */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
            <User size={20} />
          </div>
          <h2 className="text-xl font-bold">Identity Management</h2>
        </div>

        {profileState?.success && <SuccessMsg msg={profileState.success} />}
        {profileState?.error && <ErrorMsg msg={profileState.error} />}

        <form action={profileAction} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="First Name" name="firstName" defaultValue={user.firstName} />
            <Input label="Last Name" name="lastName" defaultValue={user.lastName} />
          </div>
          <Input label="Username" name="username" defaultValue={user.username} />
          <Input label="Phone Number" name="phone" defaultValue={user.phoneNumber} />
          
          <div className="pt-4">
            <button disabled={isProfilePending} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-50">
              <Save size={16} /> {isProfilePending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* --- Section 2: Security Center --- */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500/10 p-2 rounded-lg text-red-500">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-bold">Security Center</h2>
        </div>

        {passState?.success && <SuccessMsg msg={passState.success} />}
        {passState?.error && <ErrorMsg msg={passState.error} />}

        <form action={passAction} className="space-y-5">
          <Input label="Current Password" name="currentPassword" type="password" placeholder="••••••••" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="New Password" name="newPassword" type="password" placeholder="Min 6 chars" />
            <Input label="Confirm New Password" name="confirmPassword" type="password" placeholder="Repeat new password" />
          </div>

          <div className="pt-4">
            <button disabled={isPassPending} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-50">
              <Lock size={16} /> {isPassPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

// --- Helper Components for clean code ---
function Input({ label, name, type = "text", defaultValue, placeholder }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      <input 
        name={name} 
        type={type} 
        defaultValue={defaultValue} 
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-700"
      />
    </div>
  );
}

function SuccessMsg({ msg }: { msg: string }) {
  return <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">{msg}</div>;
}

function ErrorMsg({ msg }: { msg: string }) {
  return <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{msg}</div>;
}