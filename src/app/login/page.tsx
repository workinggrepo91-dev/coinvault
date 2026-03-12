"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link"; // Import Link

export default function LoginPage() {
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); 
    setError("");

    const formData = new FormData(e.currentTarget);
    const emailStr = formData.get("email")?.toString().trim().toLowerCase();
    const passwordStr = formData.get("password")?.toString();

    const result = await signIn("credentials", {
      email: emailStr,
      password: passwordStr,
      redirect: false,
    });

    if (result?.error) {
      setError("The email or password you entered is incorrect.");
      setIsLoading(false); 
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative">
      
      {/* NEW: Back to Home Link */}
      <Link href="/" className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-500 transition-colors font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Home
      </Link>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl z-10">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Lock size={24} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center tracking-tight">Access Coin Vault</h1>
        
        {/* Error Catching */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-3 animate-in fade-in zoom-in duration-300">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" /> 
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
            <input name="email" type="email" required className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-slate-800" placeholder="name@company.com" />
          </div>
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
            <input name="password" type={showPass ? "text" : "password"} required className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 bottom-3 text-slate-600 hover:text-slate-400 transition-colors">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Unlock Vault"}
          </button>
        </form>

        {/* NEW: Toggle to Register */}
        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-500">
            Don't have an account yet?{" "}
            <Link href="/register" className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}