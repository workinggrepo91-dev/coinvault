"use client";
import { useActionState, useState } from "react";
import { registerUser } from "@/app/actions/register";
import { Eye, EyeOff, Info, ArrowLeft } from "lucide-react";
import Link from "next/link"; // Import Link for navigation

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null);
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 font-sans relative">
      
      {/* NEW: Back to Home Link */}
      <Link href="/" className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-500 transition-colors font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Home
      </Link>

      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl z-10">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight">Create Vault Account</h1>
        
        {/* Dynamic Error Catching (Email or Username) */}
        {state?.error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2 animate-in fade-in zoom-in duration-300">
            <Info size={16} /> {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <InputField name="firstName" label="First Name" placeholder="e.g. John" instruction="Legal first name" />
            <InputField name="lastName" label="Last Name" placeholder="e.g. Doe" instruction="Legal surname" />
          </div>

          <InputField name="username" label="Username" placeholder="crypto_king" instruction="At least 3 characters" />
          <InputField name="email" label="Email" type="email" placeholder="name@company.com" instruction="Use a valid email" />
          <InputField name="phone" label="Phone" type="tel" placeholder="+1234567890" instruction="Include country code" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <input name="password" type={showPass ? "text" : "password"} required className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-emerald-500" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 bottom-2.5 text-slate-600 hover:text-slate-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirm Password</label>
              <input name="confirmPassword" type={showPass ? "text" : "password"} required className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>

          <button disabled={isPending} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-lg mt-4 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-70 disabled:cursor-not-allowed">
            {isPending ? "Verifying Details..." : "Open My Vault"}
          </button>
        </form>

        {/* NEW: Toggle to Login */}
        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline underline-offset-4">
              Sign in securely
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component
function InputField({ name, label, type = "text", placeholder, instruction }: any) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        <span className="text-[9px] text-slate-600 italic">{instruction}</span>
      </div>
      <input name={name} type={type} placeholder={placeholder} required className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-800 text-sm" />
    </div>
  );
}