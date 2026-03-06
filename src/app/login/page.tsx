"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // 1. Force strings and trim invisible spaces
    const emailStr = formData.get("email")?.toString().trim().toLowerCase();
    const passwordStr = formData.get("password")?.toString();

    const result = await signIn("credentials", {
      email: emailStr,
      password: passwordStr,
      redirect: false,
    });

    if (result?.error) {
      setError("The email or password you entered is incorrect.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
            <Lock size={24} />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white text-center">Sign in to Coin Vault</h1>
        
        {error && <p className="mt-4 text-red-400 text-xs text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
            <input name="email" type="email" required className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="name@example.com" />
          </div>
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
            <input name="password" type={showPass ? "text" : "password"} required className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 bottom-3 text-slate-600">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-lg transition-all">
            Unlock Vault
          </button>
        </form>
      </div>
    </div>
  );
}