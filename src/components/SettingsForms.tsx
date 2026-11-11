"use client";
import { useActionState, useState } from "react";
import {
  updateProfile,
  updatePassword,
  requestPasswordChangeCode,
  uploadProfilePicture,
  submitKYC,
  uploadKYCDocument,
  submitKYCVerifiedUrls,
} from "@/app/actions/settings";
import {
  Save,
  Lock,
  User,
  ShieldAlert,
  Smartphone,
  Mail,
  Globe,
  Upload,
  Clock,
  ShieldCheck,
  XCircle,
  Loader2,
  CheckCircle2,
  FileText,
  Trash2,
} from "lucide-react";
import TwoFactorSettings from "@/components/TwoFactorSettings";
import { COUNTRIES } from "@/lib/countries";

export default function SettingsForms({ user }: { user: any }) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateProfile, null);
  const [passState, passAction, isPassPending] = useActionState(updatePassword, null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<{ error?: string; success?: string } | null>(null);

  const [isUploadingKYC, setIsUploadingKYC] = useState(false);
  const [kycProgressText, setKycProgressText] = useState("");
  const [kycStatus, setKycStatus] = useState<{ error?: string; success?: string } | null>(null);

  const [idType, setIdType] = useState("");
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [utilityBillFile, setUtilityBillFile] = useState<File | null>(null);

  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [utilityBillPreview, setUtilityBillPreview] = useState<string | null>(null);

  const handleFileSelect = (
    file: File | null,
    setFile: (f: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    if (!file) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setKycStatus({
        error: `File "${file.name}" exceeds the 15MB limit. Please choose a smaller file.`,
      });
      return;
    }
    setKycStatus(null);
    setFile(file);
    if (file.type.startsWith("image/")) {
      const objUrl = URL.createObjectURL(file);
      setPreview(objUrl);
    } else {
      setPreview(null);
    }
  };

  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycStatus(null);

    if (!idType) {
      setKycStatus({ error: "Please select an ID type." });
      return;
    }
    if (!idFrontFile) {
      setKycStatus({ error: "Please select the front of your ID." });
      return;
    }
    if (!idBackFile) {
      setKycStatus({ error: "Please select the back of your ID." });
      return;
    }
    if (!utilityBillFile) {
      setKycStatus({
        error: "Please select a utility bill or proof of address.",
      });
      return;
    }

    setIsUploadingKYC(true);

    try {
      // 1. Upload Front ID
      setKycProgressText("Uploading ID Front (Step 1/3)...");
      const frontForm = new FormData();
      frontForm.append("file", idFrontFile);
      const frontRes = await uploadKYCDocument(frontForm);
      if (frontRes.error || !frontRes.url) {
        throw new Error(
          frontRes.error || "Failed to upload ID Front. Please try again."
        );
      }

      // 2. Upload Back ID
      setKycProgressText("Uploading ID Back (Step 2/3)...");
      const backForm = new FormData();
      backForm.append("file", idBackFile);
      const backRes = await uploadKYCDocument(backForm);
      if (backRes.error || !backRes.url) {
        throw new Error(
          backRes.error || "Failed to upload ID Back. Please try again."
        );
      }

      // 3. Upload Utility Bill
      setKycProgressText("Uploading Proof of Address (Step 3/3)...");
      const utilForm = new FormData();
      utilForm.append("file", utilityBillFile);
      const utilRes = await uploadKYCDocument(utilForm);
      if (utilRes.error || !utilRes.url) {
        throw new Error(
          utilRes.error || "Failed to upload Proof of Address. Please try again."
        );
      }

      // 4. Finalize verification request
      setKycProgressText("Finalizing verification request...");
      const finalRes = await submitKYCVerifiedUrls({
        idType,
        idFrontUrl: frontRes.url,
        idBackUrl: backRes.url,
        utilityBillUrl: utilRes.url,
      });

      if (finalRes.error) {
        throw new Error(finalRes.error);
      }

      setKycStatus({
        success:
          "Verification documents submitted successfully! Your account is now pending review.",
      });
      // Clear files
      setIdFrontFile(null);
      setIdBackFile(null);
      setUtilityBillFile(null);
      setIdFrontPreview(null);
      setIdBackPreview(null);
      setUtilityBillPreview(null);
    } catch (err: any) {
      console.error("KYC upload error:", err);
      setKycStatus({
        error: err.message || "Failed to upload documents. Please try again.",
      });
    } finally {
      setIsUploadingKYC(false);
      setKycProgressText("");
    }
  };

  // Email Code for Password Change
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSentMsg, setCodeSentMsg] = useState("");
  const [codeErrorMsg, setCodeErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const handleSendPasswordCode = async () => {
    setIsSendingCode(true);
    setCodeErrorMsg("");
    setCodeSentMsg("");
    const res = await requestPasswordChangeCode();
    setIsSendingCode(false);

    if (res.error) {
      setCodeErrorMsg(res.error);
    } else if (res.success) {
      setCodeSentMsg(res.success);
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="grid gap-8">
      
     {/* --- Section 0: Profile Picture --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Profile Display</h3>
        
        {avatarStatus?.success && <SuccessMsg msg={avatarStatus.success} />}
        {avatarStatus?.error && <ErrorMsg msg={avatarStatus.error} />}

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
              setIsUploadingAvatar(true);
              setAvatarStatus(null);
              const res = await uploadProfilePicture(new FormData(e.currentTarget));
              setIsUploadingAvatar(false);
              if (res?.error) {
                setAvatarStatus({ error: res.error });
              } else if (res?.success) {
                setAvatarStatus({ success: res.success });
              }
            }} 
            className="flex-1 space-y-3"
          >
            <input type="file" name="profilePicture" accept="image/*" required className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 transition-all cursor-pointer" />
            <button type="submit" disabled={isUploadingAvatar} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isUploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
              {isUploadingAvatar ? "Uploading to Cloud..." : "Upload Avatar"}
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

        {kycStatus?.success && <SuccessMsg msg={kycStatus.success} />}
        {kycStatus?.error && <ErrorMsg msg={kycStatus.error} />}

        {(!user?.verificationStatus || user.verificationStatus === "UNVERIFIED" || user.verificationStatus === "REJECTED") && !kycStatus?.success ? (
          <form 
             onSubmit={handleKYCSubmit}
             className="space-y-5 bg-slate-950 p-5 rounded-xl border border-slate-800"
          >
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Legal ID Type</label>
              <select 
                value={idType} 
                onChange={(e) => setIdType(e.target.value)}
                disabled={isUploadingKYC}
                required 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
              >
                <option value="">Select ID Type...</option>
                <option value="Driver's License">Driver's License</option>
                <option value="Passport">Passport</option>
                <option value="National ID">National ID</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front of ID */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Front of ID Document</label>
                  {idFrontFile && (
                    <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <CheckCircle2 size={11} /> Selected
                    </span>
                  )}
                </div>
                {idFrontFile ? (
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-emerald-500/30">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {idFrontPreview ? (
                        <img src={idFrontPreview} alt="Front preview" className="w-10 h-10 object-cover rounded-md border border-slate-700 shrink-0" />
                      ) : (
                        <FileText size={22} className="text-emerald-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-xs text-white font-medium truncate">{idFrontFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{(idFrontFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isUploadingKYC}
                      onClick={() => handleFileSelect(null, setIdFrontFile, setIdFrontPreview)}
                      className="text-slate-400 hover:text-red-400 p-1.5 transition-colors disabled:opacity-50"
                      title="Remove file"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-xl cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-all">
                    <Upload size={18} className="text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-200">Select Front Photo</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">JPG, PNG, WEBP, PDF (max 15MB)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      disabled={isUploadingKYC}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileSelect(file, setIdFrontFile, setIdFrontPreview);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Back of ID */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Back of ID Document</label>
                  {idBackFile && (
                    <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <CheckCircle2 size={11} /> Selected
                    </span>
                  )}
                </div>
                {idBackFile ? (
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-emerald-500/30">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {idBackPreview ? (
                        <img src={idBackPreview} alt="Back preview" className="w-10 h-10 object-cover rounded-md border border-slate-700 shrink-0" />
                      ) : (
                        <FileText size={22} className="text-emerald-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-xs text-white font-medium truncate">{idBackFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{(idBackFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isUploadingKYC}
                      onClick={() => handleFileSelect(null, setIdBackFile, setIdBackPreview)}
                      className="text-slate-400 hover:text-red-400 p-1.5 transition-colors disabled:opacity-50"
                      title="Remove file"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-xl cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-all">
                    <Upload size={18} className="text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-200">Select Back Photo</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">JPG, PNG, WEBP, PDF (max 15MB)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      disabled={isUploadingKYC}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileSelect(file, setIdBackFile, setIdBackPreview);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Utility Bill / Proof of Address */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Proof of Address (Utility Bill / Statement)</label>
                {utilityBillFile ? (
                  <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <CheckCircle2 size={11} /> Selected
                  </span>
                ) : (
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Max 3 months old</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mb-3 italic">e.g., Water bill, Electricity bill, Bank statement</p>
              {utilityBillFile ? (
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-emerald-500/30">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {utilityBillPreview ? (
                      <img src={utilityBillPreview} alt="Utility preview" className="w-10 h-10 object-cover rounded-md border border-slate-700 shrink-0" />
                    ) : (
                      <FileText size={22} className="text-emerald-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="text-xs text-white font-medium truncate">{utilityBillFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{(utilityBillFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isUploadingKYC}
                    onClick={() => handleFileSelect(null, setUtilityBillFile, setUtilityBillPreview)}
                    className="text-slate-400 hover:text-red-400 p-1.5 transition-colors disabled:opacity-50"
                    title="Remove file"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-xl cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-all">
                  <Upload size={18} className="text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-200">Select Utility Bill / Proof of Address</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">JPG, PNG, WEBP, PDF (max 15MB)</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    disabled={isUploadingKYC}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileSelect(file, setUtilityBillFile, setUtilityBillPreview);
                    }}
                  />
                </label>
              )}
            </div>

            {/* Submit Button & Progress Indicator */}
            {isUploadingKYC && kycProgressText && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-emerald-300 animate-pulse">{kycProgressText}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isUploadingKYC || !idType || !idFrontFile || !idBackFile || !utilityBillFile} 
              className="w-full flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-emerald-500/10"
            >
              {isUploadingKYC ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{kycProgressText || "Uploading to Cloud Storage..."}</span>
                </>
              ) : (
                <span>Submit Documents for Review</span>
              )}
            </button>
          </form>
        ) : (
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
            {user.verificationStatus === "PENDING" || kycStatus?.success ? (
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

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe size={13} className="text-emerald-500" />
              Country of Residence
            </label>
            <select
              name="country"
              defaultValue={user.country || "United States"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <option value="" disabled>Select your country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name} className="bg-slate-900 text-white">
                  {c.flag ? `${c.flag} ` : ""}{c.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="pt-4 border-t border-slate-800/50 mt-6">
            <button disabled={isProfilePending} className="mt-4 flex items-center justify-center md:justify-start gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 w-full md:w-auto">
              {isProfilePending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isProfilePending ? "Saving Changes..." : "Save Profile Updates"}
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

          {/* Email Authentication Code Verification */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Email Authentication Code
                  </label>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Optional / Standby
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Optional while SMTP credentials are being set up. You can change password directly or test email codes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSendPasswordCode}
                disabled={isSendingCode || cooldown > 0}
                className="self-start sm:self-auto px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isSendingCode ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                {isSendingCode
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Send Code to Email"}
              </button>
            </div>

            {codeSentMsg && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 flex items-center gap-2">
                ✓ {codeSentMsg}
              </p>
            )}
            {codeErrorMsg && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 flex items-center gap-2">
                ✕ {codeErrorMsg}
              </p>
            )}

            <div>
              <input
                name="authCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit email code (Optional)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono tracking-widest text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700 placeholder:tracking-normal placeholder:font-sans"
              />
            </div>
          </div>

          <div className="pt-2">
            <button disabled={isPassPending} className="flex items-center justify-center md:justify-start gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto">
              {isPassPending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} 
              {isPassPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>

        {/* --- Two-Factor Authentication (TOTP) --- */}
        <TwoFactorSettings user={user} />
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