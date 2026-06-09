"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateBalance,
  updateAssetDetails,
  updateUserCustomizations,
  addTransaction,
  impersonateUser,
  updateVerificationStatus,
} from "@/app/actions/admin";
import {
  Users,
  Save,
  PlusCircle,
  Wallet,
  LogIn,
  ShieldCheck,
  Search,
  Eye,
  EyeOff,
  Crown,
  Activity,
  TrendingUp,
  Clock,
  ChevronRight,
  Lock,
  Mail,
  Phone,
  User,
  Hash,
  FileText,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  KeyRound,
} from "lucide-react";

// ── Stat Card ────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-5 backdrop-blur-xl"
    >
      <div
        className={`absolute -right-4 -top-4 h-20 w-20 rounded-full blur-3xl opacity-20 ${accent}`}
      />
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent} bg-opacity-10`}
          style={{ background: `${accent.includes("emerald") ? "rgba(16,185,129,0.1)" : accent.includes("blue") ? "rgba(59,130,246,0.1)" : accent.includes("amber") ? "rgba(245,158,11,0.1)" : "rgba(168,85,247,0.1)"}` }}
        >
          <Icon size={18} className={accent.includes("emerald") ? "text-emerald-400" : accent.includes("blue") ? "text-blue-400" : accent.includes("amber") ? "text-amber-400" : "text-purple-400"} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {label}
          </p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Section Wrapper ──────────────────────────────────────
function Section({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-emerald-400",
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon: any;
  iconColor?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-800/50 bg-gradient-to-b from-slate-900/60 to-slate-950/80 backdrop-blur-xl overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-slate-800/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80">
            <Icon size={15} className={iconColor} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{title}</h4>
            {subtitle && (
              <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ── Password Display Component ───────────────────────────
function PasswordReveal({ password }: { password: string | null }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 rounded-lg bg-slate-800/60 border border-slate-700/50 px-3 py-2">
        <KeyRound size={13} className="text-amber-400 shrink-0" />
        <span className="text-xs font-mono text-white tracking-wider">
          {revealed
            ? password || "Not stored"
            : password
              ? "•".repeat(Math.min(password.length, 16))
              : "Not stored"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-200"
        title={revealed ? "Hide password" : "Show password"}
      >
        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

// ── Form Button ──────────────────────────────────────────
function FormButton({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success";
}) {
  const styles = {
    default:
      "bg-slate-800 hover:bg-slate-700 text-white border-slate-700/50",
    primary:
      "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border-emerald-500/20 hover:border-emerald-500",
    success:
      "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20",
  };

  return (
    <button
      className={`flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-lg transition-all duration-200 border ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

// ── Input Field ──────────────────────────────────────────
function InputField({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  icon: Icon,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: any;
  placeholder?: string;
  icon?: any;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        )}
        <input
          name={name}
          type={type}
          step={type === "number" ? "any" : undefined}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full bg-slate-800/40 text-white text-sm outline-none border border-slate-700/50 focus:border-emerald-500/60 rounded-lg py-2.5 transition-colors duration-200 ${Icon ? "pl-9 pr-3" : "px-3"}`}
        />
      </div>
    </div>
  );
}

// ── Textarea Field ───────────────────────────────────────
function TextareaField({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: any;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">
        {label}
      </label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-slate-800/40 text-white text-sm outline-none border border-slate-700/50 focus:border-emerald-500/60 rounded-lg p-3 resize-none transition-colors duration-200"
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// ██  MAIN COMPONENT
// ═════════════════════════════════════════════════════════

export default function AdminClient({ users }: { users: any[] }) {
  const [activeUserId, setActiveUserId] = useState(users[0]?.id);
  const [searchQuery, setSearchQuery] = useState("");

  const activeUser = users.find((u) => u.id === activeUserId);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.accountNumber?.includes(q)
    );
  }, [users, searchQuery]);

  // Stats
  const totalBalance = users.reduce((s, u) => s + (u.totalBalance || 0), 0);
  const verifiedCount = users.filter(
    (u) => u.verificationStatus === "APPROVED"
  ).length;
  const pendingCount = users.filter(
    (u) => u.verificationStatus === "PENDING"
  ).length;

  if (!users || users.length === 0)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Users size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">No users found</p>
          <p className="text-slate-600 text-sm mt-1">
            Users will appear here once registered
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* ── Stats Bar ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={users.length}
          accent="emerald"
        />
        <StatCard
          icon={DollarSign}
          label="Total Assets"
          value={`$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          accent="blue"
        />
        <StatCard
          icon={ShieldCheck}
          label="Verified"
          value={verifiedCount}
          accent="purple"
        />
        <StatCard
          icon={Clock}
          label="Pending KYC"
          value={pendingCount}
          accent="amber"
        />
      </div>

      {/* ── Main Layout ───────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ──────────────── LEFT: User List Panel ──────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[340px] shrink-0"
        >
          <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-b from-slate-900/60 to-slate-950/80 backdrop-blur-xl overflow-hidden h-[75vh] flex flex-col sticky top-6">
            {/* Header */}
            <div className="p-4 border-b border-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Crown size={14} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Users</h3>
                    <p className="text-[10px] text-slate-500">
                      {filteredUsers.length} of {users.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Search by name, email, account..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/50 text-white text-xs outline-none border border-slate-700/50 focus:border-emerald-500/50 rounded-xl pl-9 pr-3 py-2.5 transition-colors"
                />
              </div>
            </div>

            {/* User List */}
            <div className="overflow-y-auto flex-1 p-2 space-y-1.5 scrollbar-thin">
              <AnimatePresence>
                {filteredUsers.map((user, i) => {
                  const isActive = activeUserId === user.id;
                  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
                  const statusColor =
                    user.verificationStatus === "APPROVED"
                      ? "bg-emerald-500"
                      : user.verificationStatus === "PENDING"
                        ? "bg-amber-500"
                        : user.verificationStatus === "REJECTED"
                          ? "bg-red-500"
                          : "bg-slate-600";

                  return (
                    <motion.button
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setActiveUserId(user.id)}
                      className={`group w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/25 shadow-lg shadow-emerald-500/5"
                          : "bg-transparent border border-transparent hover:bg-slate-800/40 hover:border-slate-700/40"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-400 group-hover:text-white"
                        }`}
                      >
                        {initials}
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 ${statusColor}`}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-sm truncate ${isActive ? "text-white" : "text-slate-300 group-hover:text-white"}`}
                        >
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        size={14}
                        className={`shrink-0 transition-all duration-200 ${isActive ? "text-emerald-400" : "text-slate-700 group-hover:text-slate-400"}`}
                      />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ──────────────── RIGHT: User Editor ──────────────── */}
        {activeUser && (
          <motion.div
            key={activeUser.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 space-y-5 h-[75vh] overflow-y-auto pr-1 pb-20 scrollbar-thin"
          >
            {/* ── User Profile Header ─────────────────────── */}
            <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-emerald-950/20 backdrop-blur-xl overflow-hidden">
              {/* Decorative top bar */}
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Large Avatar */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 text-lg font-bold text-emerald-400">
                      {`${activeUser.firstName?.[0] || ""}${activeUser.lastName?.[0] || ""}`.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {activeUser.firstName} {activeUser.lastName}
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {activeUser.accountNumber || "No Account #"}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            activeUser.verificationStatus === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : activeUser.verificationStatus === "PENDING"
                                ? "bg-amber-500/10 text-amber-400"
                                : activeUser.verificationStatus === "REJECTED"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {activeUser.verificationStatus || "UNVERIFIED"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <form action={impersonateUser}>
                    <input
                      type="hidden"
                      name="email"
                      value={activeUser.email}
                    />
                    <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500 hover:to-emerald-600 text-emerald-400 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs border border-emerald-500/20 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20">
                      <LogIn size={14} /> Login as User
                    </button>
                  </form>
                </div>

                {/* Quick info row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-500" />
                    <span className="text-[11px] text-slate-400 truncate">
                      {activeUser.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-500" />
                    <span className="text-[11px] text-slate-400">
                      {activeUser.phoneNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-slate-500" />
                    <span className="text-[11px] text-slate-400">
                      {activeUser.username || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={12} className="text-slate-500" />
                    <span className="text-[11px] text-slate-400 font-mono">
                      $
                      {(activeUser.totalBalance || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Password Section */}
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock size={12} className="text-amber-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                      User Password
                    </span>
                  </div>
                  <PasswordReveal password={activeUser.plainPassword} />
                </div>
              </div>
            </div>

            {/* ── 1. Customizations & Alerts ──────────────── */}
            <Section
              title="Customizations & Alerts"
              subtitle="Account settings, popup messages, and dormancy controls"
              icon={Sparkles}
              iconColor="text-purple-400"
              actions={
                <FormButton variant="default">
                  <Save size={12} /> Save Changes
                </FormButton>
              }
            >
              <form
                action={updateUserCustomizations}
                className="space-y-5"
              >
                <input type="hidden" name="userId" value={activeUser.id} />

                <InputField
                  label="Account Number"
                  name="accountNumber"
                  defaultValue={activeUser.accountNumber}
                  placeholder="e.g. 1029384756"
                  icon={Hash}
                />

                <TextareaField
                  label="Vault Status Message (Dashboard Note)"
                  name="vaultStatusMessage"
                  defaultValue={activeUser.vaultStatusMessage}
                  placeholder="Will be shown on user's dashboard..."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextareaField
                    label="Send Modal Pop-up (Dormant Alert)"
                    name="sendMessage"
                    defaultValue={activeUser.sendMessage}
                    placeholder="Message shown when user tries to send..."
                  />
                  <TextareaField
                    label="Receive/Deposit Pop-up Note"
                    name="receiveMessage"
                    defaultValue={activeUser.receiveMessage}
                    placeholder="Message shown when user tries to receive..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Dormant Reason (e.g. IRS Tax Fee)"
                    name="dormantReason"
                    defaultValue={activeUser.dormantReason}
                    placeholder="Activation Requirement"
                    icon={AlertTriangle}
                  />
                  <InputField
                    label="Required Deposit Amount ($)"
                    name="dormantAmount"
                    type="number"
                    defaultValue={activeUser.dormantAmount}
                    placeholder="1000"
                    icon={DollarSign}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <FormButton variant="success">
                    <Save size={13} /> Save Customizations
                  </FormButton>
                </div>
              </form>
            </Section>

            {/* ── 2. Transaction Generator ────────────────── */}
            <Section
              title="Manual Transaction Entry"
              subtitle="Create synthetic transactions for this user"
              icon={Activity}
              iconColor="text-blue-400"
            >
              <form action={addTransaction} className="space-y-4">
                <input type="hidden" name="userId" value={activeUser.id} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">
                      Type
                    </label>
                    <select
                      name="type"
                      className="w-full bg-slate-800/40 text-white text-sm outline-none border border-slate-700/50 focus:border-blue-500/60 rounded-lg p-2.5 transition-colors"
                    >
                      <option value="RECEIVE">↓ Receive / Deposit</option>
                      <option value="SEND">↑ Send / Withdrawal</option>
                    </select>
                  </div>
                  <InputField
                    label="Amount"
                    name="amount"
                    type="number"
                    placeholder="e.g. 1.5"
                  />
                  <InputField
                    label="Asset Symbol"
                    name="asset"
                    placeholder="e.g. BTC or USD"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InputField label="Date" name="date" type="date" />
                  <InputField label="Time" name="time" type="time" />
                  <div className="col-span-2">
                    <InputField
                      label="Narration / Memo"
                      name="narration"
                      placeholder="e.g. Payment for Contract"
                      icon={FileText}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <FormButton variant="primary">
                    <PlusCircle size={13} /> Post Transaction
                  </FormButton>
                </div>
              </form>
            </Section>

            {/* ── 3. Base Balance ──────────────────────────── */}
            <Section
              title="Fiat Balance Control"
              subtitle="Set the user's total USD balance"
              icon={DollarSign}
              iconColor="text-green-400"
            >
              <form
                action={updateBalance}
                className="flex flex-col md:flex-row gap-4 items-end"
              >
                <input type="hidden" name="userId" value={activeUser.id} />
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1.5">
                    Base Fiat Balance (USD)
                  </label>
                  <input
                    name="balance"
                    type="number"
                    step="any"
                    defaultValue={activeUser.totalBalance || 0}
                    className="w-full bg-slate-800/40 text-white text-2xl font-mono outline-none border border-slate-700/50 focus:border-emerald-500/60 rounded-lg px-4 py-3 transition-colors"
                  />
                </div>
                <FormButton variant="success">
                  <Save size={14} /> Set Balance
                </FormButton>
              </form>
            </Section>

            {/* ── 4. Crypto Assets & Addresses ────────────── */}
            <Section
              title="Crypto Assets & Wallet Addresses"
              subtitle="Manage coin allocations and receiving addresses"
              icon={Wallet}
              iconColor="text-orange-400"
            >
              <div className="space-y-3">
                {activeUser.assets.map((asset: any) => (
                  <form
                    action={updateAssetDetails}
                    key={asset.id}
                    className="flex flex-col md:flex-row gap-4 items-end p-4 rounded-xl bg-slate-800/20 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200"
                  >
                    <input type="hidden" name="assetId" value={asset.id} />

                    <div className="w-20 shrink-0">
                      <p className="text-white font-bold text-sm">
                        {asset.symbol}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {asset.name}
                      </p>
                    </div>

                    <div className="flex-1 w-full md:w-auto">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1">
                        Coin Amount
                      </label>
                      <input
                        name="amount"
                        type="number"
                        step="any"
                        defaultValue={asset.amount}
                        className="w-full bg-slate-800/50 text-white text-sm outline-none border border-slate-700/50 focus:border-emerald-500/60 rounded-lg px-3 py-2 transition-colors"
                      />
                    </div>

                    <div className="flex-[2] w-full md:w-auto">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-1">
                        Wallet Address (For Receive Modal)
                      </label>
                      <input
                        name="walletAddress"
                        type="text"
                        defaultValue={asset.walletAddress || ""}
                        placeholder="Leave blank to say 'Generating...'"
                        className="w-full bg-slate-800/50 text-white font-mono text-xs outline-none border border-slate-700/50 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 transition-colors"
                      />
                    </div>

                    <button className="text-[11px] bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 px-4 py-2 rounded-lg font-bold transition-all duration-200 border border-emerald-500/20 shrink-0">
                      Save
                    </button>
                  </form>
                ))}
              </div>
            </Section>

            {/* ── 5. KYC Review ────────────────────────────── */}
            <Section
              title="Identity Verification (KYC)"
              subtitle="Review uploaded documents and manage verification status"
              icon={ShieldCheck}
              iconColor="text-cyan-400"
              actions={
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg ${
                    activeUser.verificationStatus === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : activeUser.verificationStatus === "PENDING"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : activeUser.verificationStatus === "REJECTED"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700/50"
                  }`}
                >
                  {activeUser.verificationStatus || "UNVERIFIED"}
                </span>
              }
            >
              <div className="space-y-5">
                {/* Document Type */}
                <div className="flex items-center justify-between rounded-xl bg-slate-800/30 border border-slate-700/30 p-4">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    Document Type Provided
                  </span>
                  <span className="text-xs font-bold text-white bg-slate-700/50 px-4 py-1.5 rounded-lg">
                    {activeUser.idType || "Not Provided"}
                  </span>
                </div>

                {/* Document Images */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Front ID",
                      src: activeUser.idFront,
                      alt: "ID Front",
                    },
                    {
                      label: "Back ID",
                      src: activeUser.idBack,
                      alt: "ID Back",
                    },
                    {
                      label: "Utility Bill",
                      src: activeUser.utilityBill,
                      alt: "Utility Bill",
                    },
                  ].map((doc) => (
                    <div
                      key={doc.label}
                      className="rounded-xl bg-slate-800/30 border border-slate-700/30 h-44 flex flex-col justify-center items-center text-center overflow-hidden relative group hover:border-slate-600/50 transition-all duration-200"
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-bold px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/50 absolute top-2.5 left-2.5 z-10 backdrop-blur-sm">
                        {doc.label}
                      </span>
                      {doc.src ? (
                        <a href={doc.src} target="_blank" rel="noreferrer">
                          <img
                            src={doc.src}
                            alt={doc.alt}
                            className="h-full w-full object-contain hover:scale-105 transition-transform duration-300"
                          />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">
                          No Document
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Status Updater */}
                <form
                  action={updateVerificationStatus}
                  className="flex flex-col md:flex-row gap-4 items-end rounded-xl bg-slate-800/20 border border-slate-700/30 p-5"
                >
                  <input type="hidden" name="userId" value={activeUser.id} />
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mb-2">
                      Update Verification Status
                    </label>
                    <select
                      name="verificationStatus"
                      defaultValue={
                        activeUser.verificationStatus || "UNVERIFIED"
                      }
                      className="w-full bg-slate-800/50 text-white text-sm outline-none border border-slate-700/50 focus:border-emerald-500/60 rounded-lg p-3 transition-colors"
                    >
                      <option value="UNVERIFIED">
                        Unverified (Require Upload)
                      </option>
                      <option value="PENDING">Pending Review</option>
                      <option value="APPROVED">Approved (Verified)</option>
                      <option value="REJECTED">
                        Rejected (Invalid Docs)
                      </option>
                    </select>
                  </div>
                  <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 shrink-0">
                    Apply Status
                  </button>
                </form>
              </div>
            </Section>
          </motion.div>
        )}
      </div>
    </div>
  );
}