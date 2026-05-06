import { Wallet, ShieldCheck, TrendingUp, Globe, Lock, Zap } from "lucide-react";

const features = [
  {
    name: 'Unified Dashboard',
    description: 'Connect all your simulated wallets and exchanges into one clear, aggregated view.',
    icon: Wallet,
  },
  {
    name: 'Real-time Analytics',
    description: 'Track performance with simulated live market data and historical trend lines.',
    icon: TrendingUp,
  },
  {
    name: 'Bank-Grade Security',
    description: 'Your data is encrypted with AES-256 and stored in a secure Vercel Postgres Vault.',
    icon: ShieldCheck,
  },
  {
    name: 'Global Coverage',
    description: 'Support for simulated assets across major chains including Bitcoin, Ethereum, and Solana.',
    icon: Globe,
  },
  {
    name: 'Privacy First',
    description: 'We do not sell your data. Your portfolio is for your eyes (and the Admin) only.',
    icon: Lock,
  },
  {
    name: 'Instant Updates',
    description: 'Balances update instantly via Next.js Server Actions and React 19 optimisations.',
    icon: Zap,
  },
];

export default function Features() {
  return (
    <div className="bg-slate-950 py-24 sm:py-32 border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-emerald-500">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The smartest way to track your crypto
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            Stop checking 5 different apps. Coin Vault brings the entire market into one institutional-grade interface.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-start">
                <div className="rounded-lg bg-slate-900/50 p-3 ring-1 ring-white/10">
                  <feature.icon className="h-6 w-6 text-emerald-500" aria-hidden="true" />
                </div>
                <dt className="mt-4 font-semibold text-white text-lg">{feature.name}</dt>
                <dd className="mt-2 leading-7 text-slate-400 text-sm">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}