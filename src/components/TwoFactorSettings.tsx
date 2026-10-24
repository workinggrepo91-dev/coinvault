"use client";

import { useState } from "react";
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Check,
  Copy,
  Download,
  AlertTriangle,
  Loader2,
  X,
  QrCode,
  Lock,
  ArrowRight
} from "lucide-react";
import {
  initiateTotpSetup,
  confirmTotpActivation,
  disableTotp,
  regenerateBackupCodes,
} from "@/app/actions/totp";

interface TwoFactorSettingsProps {
  user: {
    id: string;
    email: string;
    totpEnabled: boolean;
    totpBackupCodes?: string[];
  };
}

export default function TwoFactorSettings({ user }: TwoFactorSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(!!user.totpEnabled);
  const [backupCodesCount, setBackupCodesCount] = useState(
    Array.isArray(user.totpBackupCodes) ? user.totpBackupCodes.length : 0
  );

  // Modal states
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [isCodesOpen, setIsCodesOpen] = useState(false);

  // Setup data state
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
  } | null>(null);

  // Form states
  const [verificationCode, setVerificationCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [viewCodesPassword, setViewCodesPassword] = useState("");
  const [revealedCodes, setRevealedCodes] = useState<string[]>([]);

  // Loading & error/success messaging
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // --- Handlers ---

  const handleStartSetup = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setVerificationCode("");
    try {
      const res = await initiateTotpSetup();
      if (res?.error) {
        setErrorMsg(res.error);
        return;
      }

      if (res?.success && res.secret && res.qrCodeDataUrl && res.backupCodes) {
        setSetupData({
          secret: res.secret,
          qrCodeDataUrl: res.qrCodeDataUrl,
          backupCodes: res.backupCodes,
        });
        setIsSetupOpen(true);
      } else {
        setErrorMsg("Failed to generate 2FA credentials. Please refresh and try again.");
      }
    } catch (err: any) {
      console.error("2FA setup error:", err);
      setErrorMsg(err?.message || "An unexpected error occurred while communicating with the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMsg("Please enter the 6-digit code from your authenticator app.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await confirmTotpActivation(verificationCode);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setIsEnabled(true);
        if (setupData?.backupCodes) {
          setBackupCodesCount(setupData.backupCodes.length);
        }
        setIsSetupOpen(false);
        setSetupData(null);
      }
    } catch (err: any) {
      console.error("2FA activation error:", err);
      setErrorMsg(err?.message || "Failed to confirm 2FA code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      setErrorMsg("Please enter your password to confirm.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await disableTotp(disablePassword);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setIsEnabled(false);
        setBackupCodesCount(0);
        setIsDisableOpen(false);
        setDisablePassword("");
      }
    } catch (err: any) {
      console.error("2FA disable error:", err);
      setErrorMsg(err?.message || "Failed to disable 2FA. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewCodesPassword) {
      setErrorMsg("Please enter your password to generate new backup codes.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await regenerateBackupCodes(viewCodesPassword);
      if (res?.error) {
        setErrorMsg(res.error);
      } else if (res?.backupCodes) {
        setRevealedCodes(res.backupCodes);
        setBackupCodesCount(res.backupCodes.length);
        setViewCodesPassword("");
      }
    } catch (err: any) {
      console.error("2FA regenerate backup codes error:", err);
      setErrorMsg(err?.message || "Failed to generate backup codes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBackupCodes = (codes: string[]) => {
    const content = `COINVAULT EMERGENCY RECOVERY CODES\nGenerated: ${new Date().toISOString()}\nAccount: ${user.email}\n\nKeep these backup codes safe. Each code can only be used once.\n\n` +
      codes.map((c, i) => `${i + 1}. ${c}`).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coinvault-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-8 border-t border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Advanced Security
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-Factor Authentication (TOTP) / Authenticator App
          </p>
        </div>

        {isEnabled ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE & SECURED
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            DISABLED
          </span>
        )}
      </div>

      {errorMsg && !isSetupOpen && !isDisableOpen && !isCodesOpen && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="p-1 hover:text-white transition-colors text-slate-400"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl border shrink-0 ${
                isEnabled
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-slate-900 text-slate-400 border-slate-800"
              }`}
            >
              {isEnabled ? <ShieldCheck size={26} /> : <Smartphone size={26} />}
            </div>
            <div>
              <p className="font-bold text-white text-base">
                {isEnabled
                  ? "Authenticator App Protection Enabled"
                  : "Two-Factor Authentication (TOTP)"}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                {isEnabled
                  ? `Your vault is fortified with 2-step verification. An authenticator app (Google Authenticator, Authy, Microsoft Authenticator, 1Password) is required when accessing your account.`
                  : "Require a 6-digit verification code from your authenticator app whenever signing into your vault. Protects your balance against credential leaks."}
              </p>

              {isEnabled && (
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <KeyRound size={13} className="text-emerald-500" />
                    <span>{backupCodesCount} emergency recovery code(s) remaining</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            {isEnabled ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setRevealedCodes([]);
                    setIsCodesOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2"
                >
                  <KeyRound size={14} />
                  Recovery Codes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setDisablePassword("");
                    setIsDisableOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                >
                  Disable 2FA
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartSetup}
                disabled={isLoading}
                className="px-5 py-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShieldCheck size={16} />
                )}
                {isLoading ? "Generating Key..." : "Enable Two-Factor (TOTP)"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* --- MODAL 1: SETUP TOTP WIZARD --- */}
      {/* ========================================================================= */}
      {isSetupOpen && setupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <QrCode size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Setup Authenticator App</h3>
                  <p className="text-xs text-slate-400">Standard RFC 6238 TOTP Two-Factor Security</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSetupOpen(false);
                  setSetupData(null);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle size={15} />
                {errorMsg}
              </div>
            )}

            <div className="space-y-6 mt-6 max-h-[75vh] overflow-y-auto pr-1">
              {/* Step 1: Scan QR */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  Scan QR code with your app
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Open Google Authenticator, Microsoft Authenticator, Authy, Apple Passwords, or 1Password and scan:
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="bg-white p-3 rounded-xl shadow-lg shrink-0">
                    <img
                      src={setupData.qrCodeDataUrl}
                      alt="TOTP QR Code"
                      className="w-44 h-44 object-contain"
                    />
                  </div>
                  <div className="space-y-3 flex-1 w-full">
                    <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      Can't scan? Enter secret key manually:
                    </p>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 break-all select-all flex items-center justify-between gap-2">
                      <span>{setupData.secret}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(setupData.secret, setCopiedKey)}
                        className="text-slate-400 hover:text-white p-1 transition-colors"
                        title="Copy Secret"
                      >
                        {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Account: <span className="text-slate-300">{user.email}</span>
                      <br />
                      Type: Time-based (30s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Emergency Backup Codes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Save Emergency Recovery Codes
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(setupData.backupCodes.join("\n"), setCopiedCodes)
                      }
                      className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      {copiedCodes ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedCodes ? "Copied" : "Copy All"}
                    </button>
                    <span className="text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => downloadBackupCodes(setupData.backupCodes)}
                      className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      <Download size={12} />
                      Download (.txt)
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  If you lose your phone, each of these 8 codes can be used once to access your vault.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {setupData.backupCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-xs text-slate-200 select-all"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Verify Code */}
              <form onSubmit={handleConfirmActivation} className="pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  Verify 6-digit code from app
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Enter the currently displayed 6-digit code to complete activation:
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:w-60">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-emerald-400 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    {isLoading ? "Verifying..." : "Verify & Activate 2FA"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL 2: DISABLE 2FA CONFIRMATION --- */}
      {/* ========================================================================= */}
      {isDisableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3 text-red-400">
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <ShieldAlert size={20} />
                </div>
                <h3 className="font-bold text-lg text-white">Disable 2FA</h3>
              </div>
              <button
                onClick={() => setIsDisableOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Disabling Two-Factor Authentication reduces your vault security. To proceed, please confirm your current account password:
            </p>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle size={15} />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleDisableTotp} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Account Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-red-500 transition-colors placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisableOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !disablePassword}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-400 text-slate-950 transition-all disabled:opacity-50"
                >
                  {isLoading && <Loader2 size={14} className="animate-spin" />}
                  {isLoading ? "Verifying..." : "Confirm Deactivation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL 3: RECOVERY CODES MANAGEMENT --- */}
      {/* ========================================================================= */}
      {isCodesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Emergency Recovery Codes</h3>
                  <p className="text-xs text-slate-400">Single-use backup access codes</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCodesOpen(false);
                  setRevealedCodes([]);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle size={15} />
                {errorMsg}
              </div>
            )}

            {revealedCodes.length === 0 ? (
              <form onSubmit={handleRegenerateCodes} className="mt-5 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  For your vault's security, enter your account password to generate a fresh set of 8 emergency recovery codes. Any previous recovery codes will be invalidated.
                </p>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Confirm Account Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="password"
                      required
                      placeholder="Enter account password"
                      value={viewCodesPassword}
                      onChange={(e) => setViewCodesPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !viewCodesPassword}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10"
                >
                  {isLoading && <Loader2 size={14} className="animate-spin" />}
                  {isLoading ? "Generating..." : "Generate Fresh Recovery Codes"}
                </button>
              </form>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Store these in a safe place. Each code works once:
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(revealedCodes.join("\n"), setCopiedCodes)
                      }
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedCodes ? <Check size={13} /> : <Copy size={13} />}
                      {copiedCodes ? "Copied" : "Copy All"}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadBackupCodes(revealedCodes)}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                    >
                      <Download size={13} />
                      Download
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {revealedCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-xs text-emerald-300 select-all"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCodesOpen(false);
                    setRevealedCodes([]);
                  }}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
