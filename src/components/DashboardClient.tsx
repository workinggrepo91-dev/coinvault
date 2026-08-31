"use client";
import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ArrowDown,
  Send,
  CreditCard,
  X,
  ShieldAlert,
  Lock,
  Copy,
  Building,
  Loader2,
  CheckCircle2,
  Clock,
  Wallet,
  Check,
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Radio,
} from "lucide-react";
import PortfolioChart from "@/components/PortfolioChart";
import { saveCreditCard } from "@/app/actions/card";
import { requestLimitIncrease } from "@/app/actions/limit";
import { submitWithdrawal } from "@/app/actions/withdraw";

export default function DashboardClient({
  assets,
  totalBalance,
  user,
  marketData,
  transactions,
}: any) {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [depositTab, setDepositTab] = useState<"crypto" | "fiat">("crypto");
  const [showDormantModal, setShowDormantModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const [isSubmittingLimit, setIsSubmittingLimit] = useState(false);
  const [livePrices, setLivePrices] = useState<any[]>(marketData || []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/market");
        if (res.ok) {
          const data = await res.json();
          if (data.coins && data.coins.length > 0) {
            setLivePrices(data.coins);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 6000);
    return () => clearInterval(interval);
  }, []);

  // --- WITHDRAW STATE ---
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawTab, setWithdrawTab] = useState<"crypto" | "fiat">("crypto");
  const [selectedWithdrawCoin, setSelectedWithdrawCoin] = useState<any>(
    assets && assets.length > 0 ? assets[0] : null
  );
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawWalletAddress, setWithdrawWalletAddress] = useState("");
  const [withdrawBankName, setWithdrawBankName] = useState("");
  const [withdrawAccountName, setWithdrawAccountName] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [withdrawIban, setWithdrawIban] = useState("");
  const [withdrawSwift, setWithdrawSwift] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawConfirmation, setWithdrawConfirmation] = useState<{
    type: "crypto" | "fiat";
    asset: string;
    amount: number;
    destination: string;
    message: string;
    txId: string;
    date: string;
    time: string;
  } | null>(null);

  // Helper to get live price for any coin with live streaming updates
  const getLivePrice = (symbol: string) => {
    const coin = livePrices?.find(
      (c: any) => c.symbol.toLowerCase() === symbol.toLowerCase()
    );
    return coin
      ? coin.current_price
      : symbol === "BTC"
        ? 66420
        : symbol === "ETH"
          ? 3450
          : symbol === "SOL"
            ? 154
            : symbol === "USDT"
              ? 1
              : 1;
  };

  // 1. Force totalBalance to be a strict number (fallback to 0 if corrupted)
  const safeTotalBalance = Number(totalBalance) || 0;

  // 2. Calculate the LIVE Fiat Value, forcing asset amounts to be strict numbers
  const liveCryptoValue = assets.reduce((acc: number, asset: any) => {
    const safeAmount = Number(asset.amount) || 0;
    return acc + safeAmount * getLivePrice(asset.symbol);
  }, 0);

  // 3. Vault Balance = The Base Fiat Balance + The Live Crypto Value
  const vaultBalance = safeTotalBalance + liveCryptoValue;

  const sortedAssets = [...assets].sort((a: any, b: any) => {
    if (a.symbol === "BTC") return -1;
    if (b.symbol === "BTC") return 1;
    return b.amount - a.amount;
  });

  const activeWithdrawCoin = selectedWithdrawCoin || sortedAssets[0];
  const parsedWithdrawAmount = parseFloat(withdrawAmount) || 0;

  // Insufficient funds condition checks
  const isCryptoInsufficient =
    withdrawTab === "crypto" &&
    ((activeWithdrawCoin?.amount || 0) <= 0 ||
      parsedWithdrawAmount > (activeWithdrawCoin?.amount || 0));

  const isFiatInsufficient =
    withdrawTab === "fiat" &&
    (safeTotalBalance <= 0 || parsedWithdrawAmount > safeTotalBalance);

  const handleCardSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingCard(true);
    await saveCreditCard(new FormData(e.currentTarget));
    setIsSubmittingCard(false);
    setShowBuyModal(false);
    setShowDormantModal(true);
  };

  const handleLimitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingLimit(true);
    await requestLimitIncrease(new FormData(e.currentTarget));
    setIsSubmittingLimit(false);
    setShowLimitModal(false);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWithdrawError(null);

    // Client-side guard for insufficient funds
    if (withdrawTab === "crypto") {
      const available = activeWithdrawCoin?.amount || 0;
      if (available <= 0) {
        setWithdrawError(
          `Insufficient funds in your ${activeWithdrawCoin?.symbol || "Crypto"} wallet. You have 0.0000 available.`
        );
        return;
      }
      if (parsedWithdrawAmount > available) {
        setWithdrawError(
          `Insufficient funds: Withdrawal amount (${parsedWithdrawAmount}) exceeds your available balance (${available.toFixed(4)} ${activeWithdrawCoin?.symbol}).`
        );
        return;
      }
    } else {
      if (safeTotalBalance <= 0) {
        setWithdrawError(
          `Insufficient funds in your fiat balance. You have $0.00 USD available.`
        );
        return;
      }
      if (parsedWithdrawAmount > safeTotalBalance) {
        setWithdrawError(
          `Insufficient funds: Withdrawal amount ($${parsedWithdrawAmount.toLocaleString()}) exceeds your available fiat balance ($${safeTotalBalance.toLocaleString()} USD).`
        );
        return;
      }
    }

    setIsSubmittingWithdraw(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("withdrawType", withdrawTab);
      if (withdrawTab === "crypto") {
        formData.append("coinSymbol", activeWithdrawCoin?.symbol || "BTC");
        formData.append("walletAddress", withdrawWalletAddress);
        formData.append("amount", withdrawAmount);
      } else {
        formData.append("bankName", withdrawBankName);
        formData.append("accountName", withdrawAccountName);
        formData.append("accountNumber", withdrawAccountNumber);
        formData.append("iban", withdrawIban);
        formData.append("swift", withdrawSwift);
        formData.append("amount", withdrawAmount);
      }

      const res = await submitWithdrawal(formData);
      const now = new Date();
      setWithdrawConfirmation({
        type: withdrawTab,
        asset:
          withdrawTab === "crypto"
            ? activeWithdrawCoin?.symbol || "BTC"
            : "USD",
        amount: parsedWithdrawAmount,
        destination:
          withdrawTab === "crypto"
            ? withdrawWalletAddress
            : `${withdrawBankName} (${withdrawAccountNumber ? `Acct: *${withdrawAccountNumber.slice(-4)}` : "Wire"})`,
        message: "payment sent transaction in progress pending confirmation .",
        txId:
          res.transactionId ||
          `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        date: now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch (err: any) {
      setWithdrawError(err.message || "Failed to submit withdrawal");
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const resetWithdrawForm = () => {
    setWithdrawConfirmation(null);
    setWithdrawError(null);
    setWithdrawAmount("");
    setWithdrawWalletAddress("");
    setWithdrawBankName("");
    setWithdrawAccountName("");
    setWithdrawAccountNumber("");
    setWithdrawIban("");
    setWithdrawSwift("");
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                Total Vault Balance
              </p>
              <h2
                className={`text-4xl md:text-5xl font-mono tracking-tighter text-white flex items-baseline gap-2 ${!showBalance && "blur-lg"}`}
              >
                $
                {vaultBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="text-xl md:text-2xl text-slate-500 font-bold tracking-widest">
                  USD
                </span>
              </h2>

              {/* SPLIT BALANCES */}
              <div
                className={`mt-3 space-y-1 bg-slate-950/50 p-3 rounded-xl inline-block border border-slate-800 ${!showBalance && "blur-lg"}`}
              >
                <p className="text-emerald-500 text-xs font-mono font-bold flex justify-between gap-6">
                  <span className="text-slate-500 uppercase tracking-widest text-[9px]">
                    Crypto Value:
                  </span>
                  $
                  {liveCryptoValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  USD
                </p>
                <p className="text-blue-400 text-xs font-mono font-bold flex justify-between gap-6">
                  <span className="text-slate-500 uppercase tracking-widest text-[9px]">
                    Available Fiat:
                  </span>
                  $
                  {safeTotalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  USD
                </p>
              </div>

              {/* Interest Rate Disclaimer */}
              <p
                className={`mt-4 text-[10px] text-slate-500 italic tracking-wide ${!showBalance && "blur-lg"}`}
              >
                * A monthly interest rate of 0.5% will be applied to the
                outstanding balance.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton
                  icon={<ArrowDown size={16} />}
                  label="Receive"
                  onClick={() => {
                    setSelectedAsset(sortedAssets[0]);
                    setDepositTab("crypto");
                  }}
                />
                <ActionButton
                  icon={<Send size={16} />}
                  label="Send"
                  onClick={() => {
                    resetWithdrawForm();
                    setShowWithdrawModal(true);
                  }}
                />
                <ActionButton
                  icon={<CreditCard size={16} />}
                  label="Buy / Sell"
                  primary
                  onClick={() => setShowBuyModal(true)}
                />
              </div>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-lg transition-colors"
            >
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className={`mt-4 h-48 ${!showBalance && "blur-md"}`}>
            <PortfolioChart />
          </div>
        </div>

        {/* Security Status */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="text-emerald-500" size={20} />
              <h3 className="font-bold text-white">Vault Status</h3>
            </div>
            <div className="space-y-4">
              <StatusRow label="Account Level" value="Standard" />
              <StatusRow
                label="Withdrawal Limit"
                value={`$${(user?.dailyLimit || 0).toLocaleString()} / Day`}
                red={!user?.dailyLimit}
              />
              <StatusRow
                label="Verification"
                value={
                  user?.verificationStatus === "APPROVED"
                    ? "Verified"
                    : "Pending Deposit"
                }
                red={user?.verificationStatus !== "APPROVED"}
              />
            </div>

            {user?.verificationStatus === "APPROVED" && (
              <div className="mt-4">
                <button
                  onClick={() => setShowLimitModal(true)}
                  disabled={user?.limitRequestStatus === "PENDING"}
                  className="w-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                  {user?.limitRequestStatus === "PENDING"
                    ? "Limit Request Pending..."
                    : "Increase Limit"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 leading-relaxed">
            {user?.vaultStatusMessage || (
              <>
                <span className="font-bold">Note:</span> Your account is
                currently in <span className="font-bold">Safe Mode</span>.
                Incoming transactions are active, but outgoing transfers are
                paused.
              </>
            )}
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">
            Market / Assets
          </h3>
          <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Radio size={11} /> Live Ticker
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Coin</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-right">Live Value (USD)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedAssets.map((asset: any) => {
                const livePrice = getLivePrice(asset.symbol);
                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-950 text-xs ${asset.symbol === "BTC" ? "bg-orange-500" : asset.symbol === "ETH" ? "bg-blue-500" : asset.symbol === "USDT" ? "bg-green-500" : "bg-slate-700 text-white"}`}
                        >
                          {asset.symbol[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">
                            {asset.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold">
                            {asset.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-white text-sm">
                      {asset.amount.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400 text-sm">
                      $
                      {(asset.amount * livePrice).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => {
                          setSelectedAsset(asset);
                          setDepositTab("crypto");
                        }}
                        className="text-xs font-bold text-emerald-500 hover:text-emerald-400 underline decoration-dotted"
                      >
                        Deposit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWithdrawCoin(asset);
                          setWithdrawTab("crypto");
                          resetWithdrawForm();
                          setShowWithdrawModal(true);
                        }}
                        className="text-xs font-bold text-slate-400 hover:text-white underline decoration-dotted"
                      >
                        Send
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Transaction History Table --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">
            Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount / Asset</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Narration / Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(!transactions || transactions.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500 text-sm"
                  >
                    No recent transactions found.
                  </td>
                </tr>
              )}
              {transactions?.slice(0, 5).map((tx: any) => {
                const status = tx.status || "COMPLETED";
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider ${
                          tx.type === "RECEIVE" || tx.type === "DEPOSIT"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={10} /> Success
                        </span>
                      ) : status === "FAILED" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle size={10} /> Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock size={10} className="animate-pulse" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-white font-mono text-sm">
                        {tx.amount.toLocaleString()} {tx.asset}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">{tx.date}</div>
                      <div className="text-[10px] text-slate-500">{tx.time}</div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs">
                      <div>{tx.narration}</div>
                      {tx.adminNote && (
                        <div
                          className={`mt-1 text-xs font-semibold flex items-center gap-1 ${status === "FAILED" ? "text-red-400" : "text-slate-400"}`}
                        >
                          <AlertCircle size={11} className="shrink-0" />
                          <span>Note: {tx.adminNote}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {transactions?.length > 0 && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center">
            <a
              href="/transactions"
              className="text-[10px] uppercase tracking-widest font-bold text-emerald-500 hover:text-emerald-400 hover:underline"
            >
              View Complete History →
            </a>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: WITHDRAW / SEND (CRYPTO & FIAT) ───────────── */}
      {/* ════════════════════════════════════════════════════════ */}
      {showWithdrawModal && (
        <Modal
          maxWidth="max-w-lg"
          onClose={() => {
            setShowWithdrawModal(false);
            resetWithdrawForm();
          }}
        >
          {withdrawConfirmation ? (
            /* ── CONFIRMATION / RECEIPT STATE ── */
            <div className="space-y-5 text-center">
              <div className="relative mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Clock size={32} className="animate-pulse text-amber-400" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Withdrawal Submitted
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your outgoing transfer request has been queued.
                </p>
              </div>

              {/* Exact Requested Message Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 size={14} />
                  <span>Transfer Status</span>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  payment sent transaction in progress pending confirmation .
                </p>
              </div>

              {/* Transaction Summary Card */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">
                    Transfer Type
                  </span>
                  <span className="font-bold text-white">
                    {withdrawConfirmation.type === "crypto"
                      ? "Crypto Transfer"
                      : "Fiat Wire Transfer"}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">
                    Amount
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {withdrawConfirmation.amount} {withdrawConfirmation.asset}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">
                    Destination
                  </span>
                  <span className="font-mono text-slate-300 truncate max-w-[200px]">
                    {withdrawConfirmation.destination}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">
                    Reference ID
                  </span>
                  <span className="font-mono text-slate-400">
                    {withdrawConfirmation.txId}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">
                    Status
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Pending Confirmation
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    resetWithdrawForm();
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  Done
                </button>
                <a
                  href="/transactions"
                  className="flex-1 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700"
                >
                  View Statement
                </a>
              </div>
            </div>
          ) : (
            /* ── WITHDRAW FORM ── */
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <Send size={22} />
                </div>
                <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Send cryptocurrency or wire funds to external accounts
                </p>

                {/* TYPE Switcher (CRYPTO & FIAT) */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawTab("crypto");
                      setWithdrawError(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      withdrawTab === "crypto"
                        ? "bg-slate-800 text-white shadow-md border border-slate-700/60"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Wallet
                      size={14}
                      className={
                        withdrawTab === "crypto" ? "text-emerald-400" : ""
                      }
                    />
                    <span>Crypto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawTab("fiat");
                      setWithdrawError(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      withdrawTab === "fiat"
                        ? "bg-slate-800 text-white shadow-md border border-slate-700/60"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Building
                      size={14}
                      className={withdrawTab === "fiat" ? "text-blue-400" : ""}
                    />
                    <span>Fiat Transfer</span>
                  </button>
                </div>
              </div>

              {/* INSUFFICIENT FUNDS ERROR BANNER */}
              {withdrawError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Insufficient Funds / Error</p>
                    <p className="mt-0.5 text-slate-300 leading-relaxed">
                      {withdrawError}
                    </p>
                  </div>
                </div>
              )}

              {/* Zero Balance Warning if selected balance is 0 */}
              {withdrawTab === "crypto" && (activeWithdrawCoin?.amount || 0) <= 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>
                    Insufficient funds: Your available balance for{" "}
                    <strong>{activeWithdrawCoin?.symbol}</strong> is 0.0000.
                  </span>
                </div>
              )}

              {withdrawTab === "fiat" && safeTotalBalance <= 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>
                    Insufficient funds: Your available fiat balance is $0.00 USD.
                  </span>
                </div>
              )}

              {/* Custom Status Message Note if set by Admin */}
              {user?.sendMessage && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-left">
                  <span className="font-bold">Notice:</span> {user.sendMessage}
                </div>
              )}

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {withdrawTab === "crypto" ? (
                  /* ── CRYPTO WITHDRAW FORM ── */
                  <>
                    {/* Coin Selection Option (BTC etc.) */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                        Select Coin
                      </label>
                      <div className="relative">
                        <select
                          value={activeWithdrawCoin?.symbol || "BTC"}
                          onChange={(e) => {
                            const coin = sortedAssets.find(
                              (a: any) => a.symbol === e.target.value
                            );
                            if (coin) setSelectedWithdrawCoin(coin);
                            setWithdrawError(null);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none appearance-none pr-10"
                        >
                          {sortedAssets.map((asset: any) => (
                            <option key={asset.id} value={asset.symbol}>
                              {asset.name} ({asset.symbol}) — Available:{" "}
                              {asset.amount.toFixed(4)} {asset.symbol}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Available Balance on Crypto Display */}
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                          Available Crypto Balance
                        </p>
                        <p className="text-sm font-mono font-bold text-white mt-0.5">
                          {activeWithdrawCoin?.amount?.toFixed(4) || "0.0000"}{" "}
                          {activeWithdrawCoin?.symbol}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                          Live Value
                        </p>
                        <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                          ≈ $
                          {(
                            (activeWithdrawCoin?.amount || 0) *
                            getLivePrice(activeWithdrawCoin?.symbol || "BTC")
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          USD
                        </p>
                      </div>
                    </div>

                    {/* Wallet Address for selected coin */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                        Wallet Address for {activeWithdrawCoin?.symbol}
                      </label>
                      <input
                        type="text"
                        value={withdrawWalletAddress}
                        onChange={(e) =>
                          setWithdrawWalletAddress(e.target.value)
                        }
                        placeholder={`Enter recipient's ${activeWithdrawCoin?.name || "crypto"} address`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:border-emerald-500 outline-none font-mono placeholder:text-slate-700"
                        required
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Amount ({activeWithdrawCoin?.symbol})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setWithdrawAmount(
                              String(activeWithdrawCoin?.amount || 0)
                            );
                            setWithdrawError(null);
                          }}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded"
                        >
                          MAX: {activeWithdrawCoin?.amount?.toFixed(4)}
                        </button>
                      </div>
                      <input
                        type="number"
                        step="any"
                        value={withdrawAmount}
                        onChange={(e) => {
                          setWithdrawAmount(e.target.value);
                          setWithdrawError(null);
                        }}
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none font-mono placeholder:text-slate-700"
                        required
                      />
                      {parsedWithdrawAmount >
                        (activeWithdrawCoin?.amount || 0) && (
                        <p className="text-red-400 text-xs font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          <span>
                            Insufficient funds. Balance:{" "}
                            {activeWithdrawCoin?.amount?.toFixed(4)}{" "}
                            {activeWithdrawCoin?.symbol}
                          </span>
                        </p>
                      )}
                      {withdrawAmount &&
                        parsedWithdrawAmount <=
                          (activeWithdrawCoin?.amount || 0) && (
                          <p className="text-[10px] text-slate-500 font-mono mt-1 text-right">
                            ≈ $
                            {(
                              parsedWithdrawAmount *
                              getLivePrice(activeWithdrawCoin?.symbol || "BTC")
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            USD
                          </p>
                        )}
                    </div>

                    {/* Send Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={
                          isSubmittingWithdraw ||
                          (activeWithdrawCoin?.amount || 0) <= 0 ||
                          parsedWithdrawAmount >
                            (activeWithdrawCoin?.amount || 0)
                        }
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingWithdraw ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Send {activeWithdrawCoin?.symbol}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── FIAT TRANSFER FORM ── */
                  <>
                    {/* Showing the available balance on fiat */}
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                          Available Fiat Balance
                        </p>
                        <p className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                          $
                          {safeTotalBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          USD
                        </p>
                      </div>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                        Wire Transfer
                      </span>
                    </div>

                    {/* Bank name */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={withdrawBankName}
                        onChange={(e) => setWithdrawBankName(e.target.value)}
                        placeholder="e.g. JPMorgan Chase, Barclays, Citibank"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700"
                        required
                      />
                    </div>

                    {/* Account name */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={withdrawAccountName}
                        onChange={(e) => setWithdrawAccountName(e.target.value)}
                        placeholder="Beneficiary Account Name"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700"
                        required
                      />
                    </div>

                    {/* Account number */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={withdrawAccountNumber}
                        onChange={(e) =>
                          setWithdrawAccountNumber(e.target.value)
                        }
                        placeholder="e.g. 1029384756"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none font-mono placeholder:text-slate-700"
                        required
                      />
                    </div>

                    {/* IBAN & Swift/BIC code */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                          IBAN
                        </label>
                        <input
                          type="text"
                          value={withdrawIban}
                          onChange={(e) => setWithdrawIban(e.target.value)}
                          placeholder="GB29 NWBK 6016..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none font-mono placeholder:text-slate-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                          Swift / BIC Code
                        </label>
                        <input
                          type="text"
                          value={withdrawSwift}
                          onChange={(e) => setWithdrawSwift(e.target.value)}
                          placeholder="CHASUS33"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none font-mono placeholder:text-slate-700"
                          required
                        />
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Amount (USD)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setWithdrawAmount(String(safeTotalBalance));
                            setWithdrawError(null);
                          }}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded"
                        >
                          MAX: ${safeTotalBalance.toLocaleString()}
                        </button>
                      </div>
                      <input
                        type="number"
                        step="any"
                        value={withdrawAmount}
                        onChange={(e) => {
                          setWithdrawAmount(e.target.value);
                          setWithdrawError(null);
                        }}
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none font-mono placeholder:text-slate-700"
                        required
                      />
                      {parsedWithdrawAmount > safeTotalBalance && (
                        <p className="text-red-400 text-xs font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          <span>
                            Insufficient funds. Available: $
                            {safeTotalBalance.toLocaleString()} USD
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Send Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={
                          isSubmittingWithdraw ||
                          safeTotalBalance <= 0 ||
                          parsedWithdrawAmount > safeTotalBalance
                        }
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingWithdraw ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Send Fiat Wire Transfer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}
        </Modal>
      )}

      {/* ── MODAL 2: Deposit / Receive ── */}
      {selectedAsset && (
        <Modal onClose={() => setSelectedAsset(null)}>
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Deposit Funds</h3>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setDepositTab("crypto")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${depositTab === "crypto" ? "bg-slate-800 text-white" : "text-slate-500"}`}
              >
                Crypto Transfer
              </button>
              <button
                onClick={() => setDepositTab("fiat")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${depositTab === "fiat" ? "bg-slate-800 text-white" : "text-slate-500"}`}
              >
                Wire / Bank Transfer
              </button>
            </div>
          </div>

          {user?.receiveMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg mb-4 text-left">
              {user.receiveMessage}
            </div>
          )}

          {depositTab === "crypto" ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 relative group">
              <p className="text-[9px] uppercase font-bold text-slate-500 mb-2">
                Network: {selectedAsset.name} (Native)
              </p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-emerald-400 font-mono text-xs break-all">
                  {selectedAsset.walletAddress || "Generating address..."}
                </code>
                <button
                  className="text-slate-500 hover:text-white transition-colors"
                  title="Copy"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">
                    Bank Name
                  </p>
                  <p className="text-sm text-white font-mono flex items-center gap-2 mt-1">
                    <Building size={14} className="text-emerald-500" /> COIN
                    VAULT
                  </p>
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">
                    Account Number
                  </p>
                  <p className="text-sm text-white font-mono mt-1">
                    {user?.accountNumber || "Pending Allocation"}
                  </p>
                </div>
                <button className="text-slate-500 hover:text-white">
                  <Copy size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">
                    Routing Number
                  </p>
                  <p className="text-sm text-white font-mono mt-1">122000248</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">
                    SWIFT Code
                  </p>
                  <p className="text-sm text-white font-mono mt-1">
                    GSB-US-33X
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ── MODAL 3: Dormant Account Alert ── */}
      {showDormantModal && (
        <Modal onClose={() => setShowDormantModal(false)}>
          <div className="text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 animate-pulse">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Action Required
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {user?.sendMessage || (
                <>
                  This account is currently marked as{" "}
                  <span className="text-red-400 font-bold">Dormant</span> due to
                  inactivity. Outgoing transactions are restricted.
                </>
              )}
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-red-500/20 mb-6 text-left">
              <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                {user?.dormantReason || "Activation Requirement"}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Required Deposit:</span>
                <span className="text-emerald-500 font-mono font-bold">
                  $
                  {user?.dormantAmount
                    ? user.dormantAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "1,000.00"}{" "}
                  USD
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowDormantModal(false);
                setSelectedAsset(sortedAssets[0]);
                setDepositTab("fiat");
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
            >
              Deposit Funds Now
            </button>
          </div>
        </Modal>
      )}

      {/* ── MODAL 4: Buy/Sell Credit Card ── */}
      {showBuyModal && (
        <Modal onClose={() => setShowBuyModal(false)}>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500">
              <CreditCard size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">
              Buy Crypto via Card
            </h3>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">
              Secure Payment Gateway
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleCardSubmit}>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500">
                Card Number
              </label>
              <input
                name="cardNumber"
                type="text"
                placeholder="0000 0000 0000 0000"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">
                  Expiry
                </label>
                <input
                  name="expiry"
                  type="text"
                  placeholder="MM/YY"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">
                  CVC
                </label>
                <input
                  name="cvc"
                  type="text"
                  placeholder="123"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 mt-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3">
                Billing Address
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">
                    Street Address
                  </label>
                  <input
                    name="address"
                    type="text"
                    placeholder="123 Main St"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">
                      City
                    </label>
                    <input
                      name="city"
                      type="text"
                      placeholder="New York"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">
                      Zip Code
                    </label>
                    <input
                      name="zipCode"
                      type="text"
                      placeholder="10001"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingCard}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-70"
              >
                {isSubmittingCard ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 5: Increase Limit ── */}
      {showLimitModal && (
        <Modal onClose={() => setShowLimitModal(false)}>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">
              Increase Withdrawal Limit
            </h3>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">
              Select New Limits
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLimitSubmit}>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Daily Limit
              </label>
              <select
                name="dailyLimit"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                required
              >
                <option value="">Select Daily Limit</option>
                <option value="10000">$10,000</option>
                <option value="50000">$50,000</option>
                <option value="100000">$100,000</option>
                <option value="500000">$500,000</option>
                <option value="1000000">$1,000,000</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Monthly Limit
              </label>
              <select
                name="monthlyLimit"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                required
              >
                <option value="">Select Monthly Limit</option>
                <option value="500000">$500,000</option>
                <option value="1000000">$1,000,000</option>
                <option value="2000000">$2,000,000</option>
                <option value="5000000">$5,000,000</option>
                <option value="10000000">$10,000,000</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingLimit}
                className="w-full flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70"
              >
                {isSubmittingLimit ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function ActionButton({ icon, label, primary, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${primary ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-slate-800 text-white hover:bg-slate-700"}`}
    >
      {icon} {label}
    </button>
  );
}

function StatusRow({ label, value, red }: any) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span
        className={`font-mono font-bold ${red ? "text-red-400" : "text-emerald-400"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Modal({ children, onClose, maxWidth = "max-w-sm" }: any) {
  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-slate-900 border border-slate-700 rounded-3xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 scrollbar-thin scrollbar-thumb-slate-800`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}