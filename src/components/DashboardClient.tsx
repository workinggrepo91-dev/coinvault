"use client";
import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ArrowDown,
  ArrowUpRight,
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
  Globe,
  FileText,
  Hash,
  User,
  DollarSign,
  Headphones,
  MessageCircle,
  ShieldCheck,
  Percent,
  ArrowRight,
} from "lucide-react";
import PortfolioChart from "@/components/PortfolioChart";
import { saveCreditCard } from "@/app/actions/card";
import { requestLimitIncrease } from "@/app/actions/limit";
import { submitWithdrawal } from "@/app/actions/withdraw";
import { createBuyOrder } from "@/app/actions/buy";
import { DEFAULT_COINS } from "@/lib/prices";

function CorporateFieldRow({
  label,
  value,
  onCopy,
  isCopied,
  isMono = false,
  isHighlight = false,
  badge,
}: {
  label: string;
  value?: string | null;
  onCopy: () => void;
  isCopied: boolean;
  isMono?: boolean;
  isHighlight?: boolean;
  badge?: string;
}) {
  const displayValue = value || "Pending Allocation";
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 px-4 py-2.5 hover:bg-slate-900/70 transition-colors">
      <div className="sm:w-2/5 shrink-0">
        <span className="text-[11px] font-medium text-slate-400 block tracking-normal">
          {label}
        </span>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0 truncate">
          {badge && (
            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              {badge}
            </span>
          )}
          <span
            className={`text-xs truncate select-all ${
              isHighlight
                ? "text-emerald-400 font-bold font-mono text-xs sm:text-sm"
                : isMono
                  ? "text-slate-100 font-mono font-medium"
                  : "text-slate-200 font-medium"
            }`}
            title={displayValue}
          >
            {displayValue}
          </span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium shrink-0 transition-all border ${
            isCopied
              ? "bg-emerald-500 text-slate-950 border-emerald-400 font-semibold"
              : "bg-slate-900 text-slate-400 hover:text-white border-slate-700/60 hover:border-slate-600 hover:bg-slate-800"
          }`}
          title={`Copy ${label}`}
        >
          {isCopied ? (
            <>
              <Check size={11} className="stroke-[3]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function DashboardClient({
  assets,
  totalBalance,
  user,
  marketData,
  transactions,
  agencySetting,
}: any) {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [depositTab, setDepositTab] = useState<"crypto" | "fiat">("crypto");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDormantModal, setShowDormantModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyStep, setBuyStep] = useState<"form" | "review" | "processing">("form");
  const [buyPaymentMethod, setBuyPaymentMethod] = useState<"card" | "bank">("card");
  const [buyCoinSymbol, setBuyCoinSymbol] = useState("BTC");
  const [buyAmount, setBuyAmount] = useState("");
  const [buyAmountMode, setBuyAmountMode] = useState<"usd" | "coin">("usd");
  const [isSubmittingBuy, setIsSubmittingBuy] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [processedBuyOrder, setProcessedBuyOrder] = useState<any>(null);

  // Card fields state
  const [buyCardNumber, setBuyCardNumber] = useState("");
  const [buyCardExpiry, setBuyCardExpiry] = useState("");
  const [buyCardCvc, setBuyCardCvc] = useState("");
  const [buyCardAddress, setBuyCardAddress] = useState("");
  const [buyCardCity, setBuyCardCity] = useState("");
  const [buyCardZipCode, setBuyCardZipCode] = useState("");

  // Bank fields state
  const [buySenderBankName, setBuySenderBankName] = useState("");
  const [buySenderReference, setBuySenderReference] = useState("");

  const resetBuyForm = () => {
    setBuyStep("form");
    setBuyPaymentMethod("card");
    setBuyCoinSymbol("BTC");
    setBuyAmount("");
    setBuyAmountMode("usd");
    setBuyError(null);
    setBuyCardNumber("");
    setBuyCardExpiry("");
    setBuyCardCvc("");
    setBuyCardAddress("");
    setBuyCardCity("");
    setBuyCardZipCode("");
    setBuySenderBankName("");
    setBuySenderReference("");
    setProcessedBuyOrder(null);
  };
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const [isSubmittingLimit, setIsSubmittingLimit] = useState(false);
  const [livePrices, setLivePrices] = useState<any[]>(marketData || []);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField((cur) => (cur === fieldName ? null : cur));
    }, 2000);
  };

  const agencyBankName = user?.wireBankName || agencySetting?.bankName || "JPMorgan Chase Bank, N.A.";
  const agencyAccountName = user?.wireAccountName || agencySetting?.accountName || "CoinVault Agency Settlement LLC";
  const agencyAccountNumber = user?.wireAccountNumber || agencySetting?.accountNumber || user?.accountNumber || "9842109482";
  const agencySortCode = user?.wireSortCode || agencySetting?.bsbSortCode || "062-839";
  const agencySwiftCode = user?.wireSwiftCode || agencySetting?.swiftCode || "CHASUS33XXX";
  const agencyIban = user?.wireIban || agencySetting?.iban || "GB29NWBK60161331926819";
  const agencyBankAddress = user?.wireBankAddress || agencySetting?.bankAddress || "270 Park Avenue, New York, NY 10017, United States";
  const agencyPurpose = user?.wirePaymentPurpose || agencySetting?.paymentPurpose || "Private Wealth Deposit / Portfolio Funding";
  const agencyPaymentAdvice = user?.wirePaymentAdvice || agencySetting?.paymentAdvice || "Please transfer your fiat deposit to the available agent details to confirm your deposit on your CoinVault account. Once completed, submit your transaction receipt or reference number to CoinVault 24/7 Live Support for instant verification and ledger crediting.";

  const copyAllWireDetails = () => {
    const fullDetails = `COINVAULT AGENCY SETTLEMENT DETAILS (WIRE / BANK TRANSFER)
--------------------------------------------------
Bank Name: ${agencyBankName}
Account Name: ${agencyAccountName}
Account Number: ${agencyAccountNumber}
BSB / Sort Code: ${agencySortCode}
Swift Code / BIC: ${agencySwiftCode}
IBAN: ${agencyIban}
Bank Address: ${agencyBankAddress}
Purpose of Payment: ${agencyPurpose}
Note to Recipient: *( Please leave the space blank or empty when sending )*
--------------------------------------------------
Support & Payment Advice:
${agencyPaymentAdvice}`;

    navigator.clipboard.writeText(fullDetails);
    setCopiedField("allDetails");
    setTimeout(() => {
      setCopiedField((cur) => (cur === "allDetails" ? null : cur));
    }, 2000);
  };

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
  const [withdrawSortCode, setWithdrawSortCode] = useState("");
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

  // --- Buy Crypto Calculations & Handlers ---
  const BUY_FEE_RATE = 0.13; // 13% charge

  const availableBuyCoins =
    livePrices && livePrices.length > 0 ? livePrices : DEFAULT_COINS;

  const currentSelectedBuyCoin =
    availableBuyCoins.find(
      (c: any) =>
        c.symbol?.toLowerCase() === buyCoinSymbol.toLowerCase() ||
        c.id?.toLowerCase() === buyCoinSymbol.toLowerCase()
    ) ||
    availableBuyCoins[0] || {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      current_price: 66420,
    };

  const coinUnitPrice = currentSelectedBuyCoin?.current_price || 66420;
  const numBuyAmount = parseFloat(buyAmount) || 0;

  let buyGrossUsd = 0;
  let buyFeeUsd = 0;
  let buyNetUsd = 0;
  let buyCryptoAmount = 0;

  if (buyAmountMode === "usd") {
    buyGrossUsd = numBuyAmount;
    buyFeeUsd = buyGrossUsd * BUY_FEE_RATE;
    buyNetUsd = Math.max(0, buyGrossUsd - buyFeeUsd);
    buyCryptoAmount = coinUnitPrice > 0 ? buyNetUsd / coinUnitPrice : 0;
  } else {
    const totalCoin = numBuyAmount;
    buyGrossUsd = totalCoin * coinUnitPrice;
    buyFeeUsd = buyGrossUsd * BUY_FEE_RATE;
    buyNetUsd = Math.max(0, buyGrossUsd - buyFeeUsd);
    buyCryptoAmount = totalCoin * (1 - BUY_FEE_RATE);
  }

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setBuyError(null);

    if (numBuyAmount <= 0) {
      setBuyError("Please enter a valid purchase amount greater than 0.");
      return;
    }

    if (buyPaymentMethod === "card") {
      if (!buyCardNumber.trim() || !buyCardExpiry.trim() || !buyCardCvc.trim()) {
        setBuyError("Please fill in your card number, expiry date, and CVC.");
        return;
      }
      if (!buyCardAddress.trim() || !buyCardCity.trim() || !buyCardZipCode.trim()) {
        setBuyError("Please complete your billing address (Street, City, and Zip Code).");
        return;
      }
    }

    setBuyStep("review");
  };

  const handleConfirmBuyOrder = async () => {
    setIsSubmittingBuy(true);
    setBuyError(null);

    try {
      const res = await createBuyOrder({
        paymentMethod: buyPaymentMethod,
        coinSymbol: (currentSelectedBuyCoin.symbol || buyCoinSymbol).toUpperCase(),
        coinName: currentSelectedBuyCoin.name,
        grossAmountUsd: buyGrossUsd,
        feePercentage: 13,
        feeAmountUsd: buyFeeUsd,
        netAmountUsd: buyNetUsd,
        cryptoAmount: buyCryptoAmount,
        cardNumber: buyPaymentMethod === "card" ? buyCardNumber : undefined,
        expiry: buyPaymentMethod === "card" ? buyCardExpiry : undefined,
        cvc: buyPaymentMethod === "card" ? buyCardCvc : undefined,
        address: buyPaymentMethod === "card" ? buyCardAddress : undefined,
        city: buyPaymentMethod === "card" ? buyCardCity : undefined,
        zipCode: buyPaymentMethod === "card" ? buyCardZipCode : undefined,
        senderBankName: buyPaymentMethod === "bank" ? buySenderBankName : undefined,
        senderReference: buyPaymentMethod === "bank" ? buySenderReference : undefined,
      });

      if (res?.error) {
        setBuyError(res.error);
        setBuyStep("form");
      } else {
        setProcessedBuyOrder({
          txId: res.transactionId,
          asset: res.asset,
          cryptoAmount: res.amount,
          grossUsd: res.grossUsd,
          feeUsd: res.feeUsd,
          netUsd: res.netUsd,
          date: res.date,
          time: res.time,
          method: buyPaymentMethod === "card" ? "Credit / Debit Card" : "Bank Transfer",
        });
        setBuyStep("processing");
      }
    } catch (err: any) {
      setBuyError(err?.message || "Failed to process buy order.");
      setBuyStep("form");
    } finally {
      setIsSubmittingBuy(false);
    }
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
        formData.append("sortCode", withdrawSortCode);
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
    setWithdrawSortCode("");
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
                  icon={<ArrowUpRight size={16} />}
                  label="Withdraw"
                  onClick={() => {
                    resetWithdrawForm();
                    setShowWithdrawModal(true);
                  }}
                />
                <ActionButton
                  icon={<CreditCard size={16} />}
                  label="Buy"
                  primary
                  onClick={() => {
                    resetBuyForm();
                    setShowBuyModal(true);
                  }}
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
                        Withdraw
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
                  <ArrowUpRight size={22} />
                </div>
                <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Withdraw cryptocurrency or wire funds to external accounts
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

                    {/* Withdraw Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={
                          isSubmittingWithdraw ||
                          (activeWithdrawCoin?.amount || 0) <= 0 ||
                          parsedWithdrawAmount >
                            (activeWithdrawCoin?.amount || 0)
                        }
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSubmittingWithdraw ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <ArrowUpRight size={16} />
                            <span>Withdraw {activeWithdrawCoin?.symbol}</span>
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

                    {/* Bank name - COMPULSORY */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-medium text-slate-300 tracking-normal flex items-center gap-1">
                          <span>Bank Name</span>
                          <span className="text-emerald-400 font-bold">*</span>
                        </label>
                        <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          Compulsory
                        </span>
                      </div>
                      <input
                        type="text"
                        value={withdrawBankName}
                        onChange={(e) => setWithdrawBankName(e.target.value)}
                        placeholder="e.g. JPMorgan Chase, Barclays, Citibank"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-600 transition-colors"
                        required
                      />
                    </div>

                    {/* Account name - COMPULSORY */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-medium text-slate-300 tracking-normal flex items-center gap-1">
                          <span>Account Name</span>
                          <span className="text-emerald-400 font-bold">*</span>
                        </label>
                        <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          Compulsory
                        </span>
                      </div>
                      <input
                        type="text"
                        value={withdrawAccountName}
                        onChange={(e) => setWithdrawAccountName(e.target.value)}
                        placeholder="Beneficiary Account Name"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-600 transition-colors"
                        required
                      />
                    </div>

                    {/* Account number - COMPULSORY */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-medium text-slate-300 tracking-normal flex items-center gap-1">
                          <span>Account Number</span>
                          <span className="text-emerald-400 font-bold">*</span>
                        </label>
                        <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          Compulsory
                        </span>
                      </div>
                      <input
                        type="text"
                        value={withdrawAccountNumber}
                        onChange={(e) =>
                          setWithdrawAccountNumber(e.target.value)
                        }
                        placeholder="e.g. 1029384756"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:border-emerald-500 outline-none font-mono placeholder:text-slate-600 transition-colors"
                        required
                      />
                    </div>

                    {/* BSB / Sort Code & Swift / BIC code - OPTIONAL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-medium text-slate-400 tracking-normal">
                            BSB / Sort Code
                          </label>
                          <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                            Optional
                          </span>
                        </div>
                        <input
                          type="text"
                          value={withdrawSortCode}
                          onChange={(e) => setWithdrawSortCode(e.target.value)}
                          placeholder="e.g. 062-839"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none font-mono placeholder:text-slate-600 transition-colors"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-medium text-slate-400 tracking-normal">
                            Swift / BIC Code
                          </label>
                          <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                            Optional
                          </span>
                        </div>
                        <input
                          type="text"
                          value={withdrawSwift}
                          onChange={(e) => setWithdrawSwift(e.target.value)}
                          placeholder="e.g. CHASUS33"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none font-mono placeholder:text-slate-600 transition-colors"
                        />
                      </div>
                    </div>

                    {/* IBAN - OPTIONAL */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-medium text-slate-400 tracking-normal">
                          IBAN
                        </label>
                        <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          Optional
                        </span>
                      </div>
                      <input
                        type="text"
                        value={withdrawIban}
                        onChange={(e) => setWithdrawIban(e.target.value)}
                        placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none font-mono placeholder:text-slate-600 transition-colors"
                      />
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

                    {/* Withdraw Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={
                          isSubmittingWithdraw ||
                          safeTotalBalance <= 0 ||
                          parsedWithdrawAmount > safeTotalBalance
                        }
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSubmittingWithdraw ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <ArrowUpRight size={16} />
                            <span>Withdraw Fiat Wire Transfer</span>
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
        <Modal
          onClose={() => setSelectedAsset(null)}
          maxWidth={depositTab === "fiat" ? "max-w-xl" : "max-w-md"}
        >
          <div className="text-center mb-5">
            <h3 className="text-lg font-bold text-white mb-3">Deposit Funds</h3>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setDepositTab("crypto")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  depositTab === "crypto"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Crypto Transfer
              </button>
              <button
                onClick={() => setDepositTab("fiat")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  depositTab === "fiat"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
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
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 relative group">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">
                Network: {selectedAsset.name} (Native)
              </p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-emerald-400 font-mono text-xs break-all">
                  {selectedAsset.walletAddress || "Generating address..."}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedAsset.walletAddress || "", "cryptoAddress")}
                  className="text-slate-500 hover:text-white transition-colors"
                  title="Copy"
                >
                  {copiedField === "cryptoAddress" ? (
                    <Check size={16} className="text-emerald-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 mb-2 text-left max-h-[68vh] overflow-y-auto pr-1">
              {/* Header card with user notice */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-4 rounded-xl relative">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                    <ShieldCheck size={11} />
                    Receive Fiat Option
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Agent Settlement Node
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building size={15} className="text-emerald-400" />
                  CoinVault Agency Information
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Please transfer your fiat deposit to the available agent details to confirm your deposit on your CoinVault account
                </p>
              </div>

              {/* Standard Corporate Specification Ledger Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden divide-y divide-slate-800/80">
                <CorporateFieldRow
                  label="Bank name"
                  value={agencyBankName}
                  onCopy={() => copyToClipboard(agencyBankName, "bankName")}
                  isCopied={copiedField === "bankName"}
                />

                <CorporateFieldRow
                  label="Account name"
                  value={agencyAccountName}
                  onCopy={() => copyToClipboard(agencyAccountName, "accountName")}
                  isCopied={copiedField === "accountName"}
                />

                <CorporateFieldRow
                  label="Account number"
                  value={agencyAccountNumber}
                  isHighlight
                  isMono
                  badge="Primary"
                  onCopy={() => copyToClipboard(agencyAccountNumber, "accountNumber")}
                  isCopied={copiedField === "accountNumber"}
                />

                <CorporateFieldRow
                  label="BSB / Sort Code"
                  value={agencySortCode}
                  isMono
                  onCopy={() => copyToClipboard(agencySortCode, "sortCode")}
                  isCopied={copiedField === "sortCode"}
                />

                <CorporateFieldRow
                  label="Swift Code / BIC"
                  value={agencySwiftCode}
                  isMono
                  onCopy={() => copyToClipboard(agencySwiftCode, "swiftCode")}
                  isCopied={copiedField === "swiftCode"}
                />

                <CorporateFieldRow
                  label="IBAN"
                  value={agencyIban}
                  isMono
                  onCopy={() => copyToClipboard(agencyIban, "iban")}
                  isCopied={copiedField === "iban"}
                />

                <CorporateFieldRow
                  label="Bank address"
                  value={agencyBankAddress}
                  onCopy={() => copyToClipboard(agencyBankAddress, "bankAddress")}
                  isCopied={copiedField === "bankAddress"}
                />

                <CorporateFieldRow
                  label="Purpose of payment"
                  value={agencyPurpose}
                  onCopy={() => copyToClipboard(agencyPurpose, "purpose")}
                  isCopied={copiedField === "purpose"}
                />
              </div>

              {/* Note to Recipient */}
              <div className="bg-amber-500/[0.07] border border-amber-500/20 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-400" />
                    Note to Recipient :
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    Automatic Rule
                  </span>
                </div>
                <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-amber-500/20">
                  <p className="text-xs font-mono font-bold text-amber-200 select-all">
                    *( Please leave the space blank or empty when sending )*
                  </p>
                </div>
                <p className="text-[10px] text-slate-400">
                  Do not add any text or memo in the transfer note. Leaving this field blank enables automatic ledger matching.
                </p>
              </div>

              {/* CoinVault instruction for further payment advice */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Headphones size={13} className="text-emerald-400" />
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
                      CoinVault Remittance Instructions & Advice
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Support Verified
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-left">
                  {agencyPaymentAdvice}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={copyAllWireDetails}
                    className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      copiedField === "allDetails"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 font-semibold"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60"
                    }`}
                  >
                    {copiedField === "allDetails" ? (
                      <>
                        <Check size={12} className="stroke-[3]" />
                        <span>All Details Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy All Wire Details</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAsset(null);
                      window.dispatchEvent(new CustomEvent("open-support-chat"));
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-colors"
                  >
                    <MessageCircle size={12} />
                    <span>Open 24/7 Live Support</span>
                  </button>
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

      {/* ── MODAL 4: Buy Crypto ── */}
      {showBuyModal && (
        <Modal
          onClose={() => {
            setShowBuyModal(false);
            resetBuyForm();
          }}
          maxWidth={buyStep === "processing" ? "max-w-md" : "max-w-xl"}
        >
          {buyStep === "form" && (
            <div className="space-y-5">
              {/* Header */}
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <CreditCard size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Buy Cryptocurrency
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Purchase assets with instant settlement via Card or Bank Transfer
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setBuyPaymentMethod("card");
                    setBuyError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    buyPaymentMethod === "card"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <CreditCard size={15} />
                  <span>Credit / Debit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBuyPaymentMethod("bank");
                    setBuyError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    buyPaymentMethod === "bank"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Building size={15} />
                  <span>Bank Transfer</span>
                </button>
              </div>

              {buyError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{buyError}</span>
                </div>
              )}

              <form onSubmit={handleProceedToReview} className="space-y-4">
                {/* 1. Select Asset */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    Select Coin to Buy
                  </label>
                  <div className="relative">
                    <select
                      value={buyCoinSymbol}
                      onChange={(e) => setBuyCoinSymbol(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-medium focus:border-emerald-500 outline-none transition-colors appearance-none cursor-pointer pr-10"
                    >
                      {availableBuyCoins.map((coin: any) => (
                        <option key={coin.symbol} value={coin.symbol} className="bg-slate-900 text-white">
                          {coin.name} ({coin.symbol.toUpperCase()}) — ${(coin.current_price || 0).toLocaleString()} USD
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Live Market Price:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      1 {currentSelectedBuyCoin.symbol.toUpperCase()} ≈ ${(coinUnitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>
                  </p>
                </div>

                {/* 2. Amount Input with Mode Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Purchase Amount
                    </label>
                    <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setBuyAmountMode("usd")}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          buyAmountMode === "usd"
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        USD ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuyAmountMode("coin")}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          buyAmountMode === "coin"
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {currentSelectedBuyCoin.symbol.toUpperCase()}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                      {buyAmountMode === "usd" ? "$" : currentSelectedBuyCoin.symbol.toUpperCase()}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      placeholder={buyAmountMode === "usd" ? "1000" : "0.05"}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white text-base font-mono font-bold focus:border-emerald-500 outline-none transition-colors placeholder:text-slate-700"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex gap-2 mt-2">
                    {[100, 250, 500, 1000, 2500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setBuyAmount(val.toString());
                          setBuyAmountMode("usd");
                        }}
                        className="flex-1 py-1 text-[10px] font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. 13% Fee Calculation & Deduction Box (Real-time automatic calculation) */}
                {numBuyAmount > 0 && (
                  <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Transfer Amount:</span>
                      <span className="font-mono font-bold text-white">
                        ${buyGrossUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800/80">
                      <span className="text-amber-400 flex items-center gap-1">
                        <Percent size={12} />
                        <span>Transfer Charge (13% Deducted):</span>
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        -${buyFeeUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-0.5">
                      <span className="text-slate-300 font-semibold">Net Credited Value:</span>
                      <span className="font-mono font-bold text-white text-sm">
                        ${buyNetUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                      <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>Crypto Allocated to Vault:</span>
                      </span>
                      <span className="font-mono font-extrabold text-emerald-400 text-sm">
                        {buyCryptoAmount.toFixed(6)} {currentSelectedBuyCoin.symbol.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 text-center pt-1">
                      ⚡ 13% wallet settlement charge is automatically deducted from the payment input.
                    </p>
                  </div>
                )}

                {/* 4. Payment Details: Card or Bank */}
                {buyPaymentMethod === "card" ? (
                  <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        Credit / Debit Card Details
                      </p>
                      <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                        <Lock size={11} /> 256-bit Encrypted
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={buyCardNumber}
                        onChange={(e) => setBuyCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono focus:border-emerald-500 outline-none placeholder:text-slate-700 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={buyCardExpiry}
                          onChange={(e) => setBuyCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono focus:border-emerald-500 outline-none placeholder:text-slate-700 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          value={buyCardCvc}
                          onChange={(e) => setBuyCardCvc(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono focus:border-emerald-500 outline-none placeholder:text-slate-700 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">
                        Billing Address
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={buyCardAddress}
                            onChange={(e) => setBuyCardAddress(e.target.value)}
                            placeholder="123 Main St"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700 transition-colors"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              value={buyCardCity}
                              onChange={(e) => setBuyCardCity(e.target.value)}
                              placeholder="New York"
                              required
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                              Zip / Postal Code
                            </label>
                            <input
                              type="text"
                              value={buyCardZipCode}
                              onChange={(e) => setBuyCardZipCode(e.target.value)}
                              placeholder="10001"
                              required
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        Bank Transfer Settlement Details
                      </p>
                      <button
                        type="button"
                        onClick={copyAllWireDetails}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Copy size={11} />
                        <span>Copy All Details</span>
                      </button>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-500 font-medium">Bank Name:</span>
                        <span className="font-bold text-white">{agencyBankName}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-500 font-medium">Account Name:</span>
                        <span className="font-bold text-white">{agencyAccountName}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-500 font-medium">Account Number:</span>
                        <span className="font-mono font-bold text-emerald-400">{agencyAccountNumber}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-500 font-medium">Swift / BIC:</span>
                        <span className="font-mono font-bold text-white">{agencySwiftCode}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-500 font-medium">IBAN:</span>
                        <span className="font-mono font-bold text-white">{agencyIban}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">BSB / Sort Code:</span>
                        <span className="font-mono font-bold text-white">{agencySortCode}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Sender Bank / Institution (Optional)
                        </label>
                        <input
                          type="text"
                          value={buySenderBankName}
                          onChange={(e) => setBuySenderBankName(e.target.value)}
                          placeholder="e.g. Wells Fargo, Barclays, Chase"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Payment Reference / Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={buySenderReference}
                          onChange={(e) => setBuySenderReference(e.target.value)}
                          placeholder="e.g. Deposit Ref #984210"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-700 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Proceed Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={numBuyAmount <= 0}
                    className="w-full flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {buyStep === "review" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header */}
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-400">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Confirm Purchase & Fee Notice
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Please review your order details and mandatory transfer fee deduction
                </p>
              </div>

              {/* Notification Banner */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2 text-amber-300">
                <div className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  <AlertCircle size={15} />
                  <span>13% Transfer Fee Applied</span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  A standard 13% processing charge of{" "}
                  <strong className="text-amber-400 font-mono">
                    ${buyFeeUsd.toFixed(2)} USD
                  </strong>{" "}
                  has been automatically deducted from your deposit of{" "}
                  <strong className="text-white font-mono">
                    ${buyGrossUsd.toFixed(2)} USD
                  </strong>
                  . Your CoinVault account will be credited with{" "}
                  <strong className="text-emerald-400 font-mono">
                    {buyCryptoAmount.toFixed(6)} {currentSelectedBuyCoin.symbol.toUpperCase()}
                  </strong>{" "}
                  (${buyNetUsd.toFixed(2)} USD net value) upon settlement confirmation.
                </p>
              </div>

              {/* Itemized Order Breakdown */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Purchasing:</span>
                  <span className="font-bold text-white">
                    {currentSelectedBuyCoin.name} ({currentSelectedBuyCoin.symbol.toUpperCase()})
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-bold text-white">
                    {buyPaymentMethod === "card"
                      ? `Credit Card (•••• ${buyCardNumber.replace(/\s+/g, "").slice(-4) || "XXXX"})`
                      : `Bank Wire Transfer (${agencyBankName})`}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Gross Transfer Amount:</span>
                  <span className="font-mono font-bold text-white">
                    ${buyGrossUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-amber-400 font-medium">13% Fee Deducted:</span>
                  <span className="font-mono font-bold text-amber-400">
                    -${buyFeeUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-300 font-semibold">Net Settlement Value:</span>
                  <span className="font-mono font-bold text-white">
                    ${buyNetUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                  <span className="text-emerald-300 font-bold">Total Crypto to Receive:</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    {buyCryptoAmount.toFixed(6)} {currentSelectedBuyCoin.symbol.toUpperCase()}
                  </span>
                </div>
              </div>

              {buyError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{buyError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBuyStep("form")}
                  disabled={isSubmittingBuy}
                  className="flex-1 py-3.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  ← Modify Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBuyOrder}
                  disabled={isSubmittingBuy}
                  className="flex-[2] flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmittingBuy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Confirm & Buy {currentSelectedBuyCoin.symbol.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {buyStep === "processing" && (
            <div className="text-center space-y-5 py-3 animate-in fade-in duration-200">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                  <Clock size={32} className="animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
                  <Clock size={11} className="animate-spin" /> Processing Order
                </span>
                <h3 className="text-xl font-bold text-white">
                  Buy Request Submitted
                </h3>
                <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Your purchase of{" "}
                  <strong className="text-emerald-400 font-mono">
                    {processedBuyOrder?.cryptoAmount?.toFixed(6)} {processedBuyOrder?.asset}
                  </strong>{" "}
                  is currently <strong className="text-amber-400">PROCESSING</strong>. Once payment confirmation is verified by the settlement desk, your wallet ledger will be credited.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">
                    Reference ID
                  </span>
                  <span className="font-mono font-bold text-slate-300">
                    {processedBuyOrder?.txId}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">
                    Purchased Asset
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {processedBuyOrder?.cryptoAmount?.toFixed(6)} {processedBuyOrder?.asset}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">
                    Deposit Amount
                  </span>
                  <span className="font-mono font-bold text-white">
                    ${processedBuyOrder?.grossUsd?.toFixed(2)} USD
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="text-amber-400 uppercase font-bold text-[10px]">
                    13% Fee Deducted
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    -${processedBuyOrder?.feeUsd?.toFixed(2)} USD
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">
                    Method
                  </span>
                  <span className="font-bold text-white">
                    {processedBuyOrder?.method}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-400 text-[11px]">
                    <Clock size={11} className="animate-spin" /> Processing (Awaiting Admin Review)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="/transactions"
                  className="flex-1 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700 text-xs"
                >
                  View in Statement / History
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setShowBuyModal(false);
                    resetBuyForm();
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
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