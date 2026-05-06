"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { resetForgottenPassword } from "@/app/actions/register";

export default function LoginPage() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");
    
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate passwords match before sending to server
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      setIsLoading(false);
      return;
    }

    const res = await resetForgottenPassword(formData);
    
    if (res?.error) {
      setError(res.error);
    } else {
      setSuccessMsg("Password successfully reset! You can now log in.");
      // Automatically flip back to login screen after 2.5 seconds
      setTimeout(() => {
        setIsResetting(false);
        setSuccessMsg("");
        // Reset visibility states
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }, 2500);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity mb-8 relative z-10">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-slate-950 text-xl transform rotate-3 shadow-lg shadow-emerald-500/20">V</div>
        <div className="text-2xl font-bold tracking-tight text-white uppercase">Coin Vault</div>
      </Link>

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 overflow-hidden">
        
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg text-center font-medium animate-in fade-in">
            {successMsg}
          </div>
        )}

        {!isResetting ? (
          /* --- LOGIN FORM --- */
          <div className="animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Secure Access</h2>
              <p className="text-sm text-slate-400">Enter your credentials to access your vault.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="email" name="email" required autoComplete="username" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700" placeholder="investor@example.com" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block">Password</label>
                  <button type="button" onClick={() => { setIsResetting(true); setError(""); setShowPassword(false); }} className="text-xs text-emerald-500 hover:text-emerald-400 font-bold transition-colors">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required 
                    autoComplete="current-password"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-12 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700" 
                    placeholder="Enter your password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 mt-2">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Access Vault <ArrowRight size={18} /></>}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account? <Link href="/register" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">Apply here</Link>
            </p>
          </div>
        ) : (
          /* --- RESET PASSWORD FORM --- */
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-sm text-slate-400">Enter your registered email to set a new password.</p>
            </div>

            <form onSubmit={handleReset} className="space-y-5" autoComplete="off">
              {/* HONEYPOT: Hidden fields to trick Chrome's aggressive autofill */}
              <input type="email" name="fake-email" style={{ position: "absolute", opacity: 0, top: "-1000px", left: "-1000px" }} tabIndex={-1} aria-hidden="true" autoComplete="username" />
              <input type="password" name="fake-password" style={{ position: "absolute", opacity: 0, top: "-1000px", left: "-1000px" }} tabIndex={-1} aria-hidden="true" autoComplete="current-password" />

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="email" name="email" required className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700" placeholder="investor@example.com" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    name="newPassword" 
                    required 
                    minLength={6} 
                    autoComplete="new-password"
                    data-lpignore="true" 
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-12 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700" 
                    placeholder="Enter new password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    required 
                    minLength={6} 
                    autoComplete="new-password"
                    data-lpignore="true"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-12 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700" 
                    placeholder="Confirm new password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-70 mt-2 border border-slate-700">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Confirm New Password"}
              </button>
            </form>

            <button onClick={() => { setIsResetting(false); setError(""); setSuccessMsg(""); }} className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white transition-colors font-medium">
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}