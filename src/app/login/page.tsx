"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  Smartphone,
  KeyRound,
  Shield
} from "lucide-react";
import { resetForgottenPassword, sendPasswordResetCode } from "@/app/actions/register";
import { checkLoginTotpRequirement } from "@/app/actions/totp";

export default function LoginPage() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [isTotpChallenge, setIsTotpChallenge] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Password reset email verification state
  const [resetEmail, setResetEmail] = useState("");
  const [isSendingResetCode, setIsSendingResetCode] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  const handleSendResetCode = async () => {
    if (!resetEmail || !resetEmail.trim()) {
      setError("Please enter your registered email address first.");
      return;
    }

    setIsSendingResetCode(true);
    setError("");
    const res = await sendPasswordResetCode(resetEmail);
    setIsSendingResetCode(false);

    if (res.error) {
      setError(res.error);
    } else {
      setResetCodeSent(true);
      setSuccessMsg(res.success || "Authentication code sent to your email.");
      setResetCooldown(60);
      const timer = setInterval(() => {
        setResetCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Saved credentials when transitioning to TOTP step
  const [pendingCredentials, setPendingCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  // TOTP verification input
  const [totpCode, setTotpCode] = useState("");

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Step 1: Initial Email & Password Submission ---
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;

    try {
      // First check if credentials are valid and if 2FA is required
      const checkRes = await checkLoginTotpRequirement(formData);

      if (checkRes.error) {
        setError(checkRes.error);
        setIsLoading(false);
        return;
      }

      if (checkRes.requiresTotp) {
        // Switch to TOTP 2-Factor Authentication step
        setPendingCredentials({ email, password });
        setIsTotpChallenge(true);
        setTotpCode("");
        setIsLoading(false);
        return;
      }

      // No 2FA required: proceed with regular sign in
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

  // --- Step 2: TOTP Code or Backup Code Verification ---
  const handleTotpVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pendingCredentials) {
      setIsTotpChallenge(false);
      return;
    }

    if (!totpCode.trim()) {
      setError(
        useBackupCode
          ? "Please enter your emergency recovery code."
          : "Please enter the 6-digit code from your authenticator app."
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: pendingCredentials.email,
        password: pendingCredentials.password,
        totpCode: totpCode.trim(),
      });

      if (res?.error) {
        setError(
          useBackupCode
            ? "Invalid backup code. Please verify and try another."
            : "Invalid authenticator code. Check your device time and try again."
        );
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("A network error occurred during verification. Please try again.");
      setIsLoading(false);
    }
  };

  // --- Password Reset Handler ---
  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

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
      setTimeout(() => {
        setIsResetting(false);
        setSuccessMsg("");
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
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-slate-950 text-xl transform rotate-3 shadow-lg shadow-emerald-500/20">
          V
        </div>
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

        {/* ========================================================================= */}
        {/* --- STATE 1: TOTP TWO-FACTOR VERIFICATION --- */}
        {/* ========================================================================= */}
        {isTotpChallenge ? (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-lg shadow-emerald-500/10">
                {useBackupCode ? <KeyRound size={26} /> : <Smartphone size={26} />}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {useBackupCode ? "Recovery Code Access" : "Two-Factor Verification"}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {useBackupCode
                  ? "Enter an 8-character single-use emergency backup code to access your vault."
                  : `Enter the 6-digit security code generated by your authenticator app for `}
                {!useBackupCode && (
                  <span className="text-slate-300 font-medium block mt-1">{pendingCredentials?.email}</span>
                )}
              </p>
            </div>

            <form onSubmit={handleTotpVerify} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  {useBackupCode ? "Emergency Recovery Code" : "6-Digit Authenticator Code"}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    {useBackupCode ? <KeyRound size={18} /> : <Shield size={18} />}
                  </div>
                  <input
                    type="text"
                    name="totpCode"
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    inputMode={useBackupCode ? "text" : "numeric"}
                    maxLength={useBackupCode ? 10 : 6}
                    value={totpCode}
                    onChange={(e) => {
                      if (useBackupCode) {
                        setTotpCode(e.target.value.toUpperCase());
                      } else {
                        setTotpCode(e.target.value.replace(/\D/g, ""));
                      }
                    }}
                    placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
                    className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-center text-xl tracking-widest rounded-xl pl-10 pr-4 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !totpCode.trim()}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Verify & Enter Vault <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode);
                    setTotpCode("");
                    setError("");
                  }}
                  className="text-slate-400 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5"
                >
                  {useBackupCode ? (
                    <>
                      <Smartphone size={13} /> Use Authenticator App
                    </>
                  ) : (
                    <>
                      <KeyRound size={13} /> Lost access? Use backup code
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTotpChallenge(false);
                    setPendingCredentials(null);
                    setTotpCode("");
                    setError("");
                  }}
                  className="text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={13} /> Cancel
                </button>
              </div>
            </form>
          </div>
        ) : !isResetting ? (
          /* ========================================================================= */
          /* --- STATE 2: REGULAR LOGIN FORM --- */
          /* ========================================================================= */
          <div className="animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Secure Access</h2>
              <p className="text-sm text-slate-400">Enter your credentials to access your vault.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="username"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
                    placeholder="investor@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetting(true);
                      setError("");
                      setShowPassword(false);
                    }}
                    className="text-xs text-emerald-500 hover:text-emerald-400 font-bold transition-colors"
                  >
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Access Vault <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">
                Apply here
              </Link>
            </p>
          </div>
        ) : (
          /* ========================================================================= */
          /* --- STATE 3: RESET PASSWORD FORM --- */
          /* ========================================================================= */
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
              <input
                type="email"
                name="fake-email"
                style={{ position: "absolute", opacity: 0, top: "-1000px", left: "-1000px" }}
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="username"
              />
              <input
                type="password"
                name="fake-password"
                style={{ position: "absolute", opacity: 0, top: "-1000px", left: "-1000px" }}
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="current-password"
              />

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Registered Email
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      name="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700 text-sm"
                      placeholder="investor@example.com"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendResetCode}
                    disabled={isSendingResetCode || resetCooldown > 0 || !resetEmail}
                    className="px-4 py-3 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {isSendingResetCode ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Mail size={14} />
                    )}
                    {isSendingResetCode
                      ? "Sending..."
                      : resetCooldown > 0
                        ? `${resetCooldown}s`
                        : "Send Code"}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block">
                    6-Digit Authentication Code
                  </label>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Optional
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    name="code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit email code (Optional)"
                    className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono tracking-widest rounded-xl pl-12 pr-4 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700 placeholder:tracking-normal placeholder:font-sans text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Click &ldquo;Send Code&rdquo; to test email code, or leave blank to reset directly while SMTP is being configured.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  New Password
                </label>
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
                    placeholder="Enter new password (min 6 chars)"
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
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Confirm Password
                </label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 mt-2"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Confirm New Password"}
              </button>
            </form>

            <button
              onClick={() => {
                setIsResetting(false);
                setError("");
                setSuccessMsg("");
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}