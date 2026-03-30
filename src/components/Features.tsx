import { Wallet, ShieldCheck, TrendingUp, Globe, Lock, Zap } from "lucide-react";

const features = [
  {
    name: 'Unified Dashboard',
    description: 'Connect all your digital wallets and exchanges into one clear, aggregated view.',
    icon: Wallet,
  },
  {
    name: 'Real-time Analytics',
    description: 'Track performance with digital live market data and historical trend lines.',
    icon: TrendingUp,
  },
  {
    name: 'Bank-Grade Security',
    description: 'Your data is encrypted with AES-256 and stored in a secure Coin Vault.',
    icon: ShieldCheck,
  },
  {
    name: 'Global Coverage',
    description: 'Support for digital assets across major chains including Bitcoin, Ethereum, and Solana.',
    icon: Globe,
  },
  {
    name: 'Privacy First',
    description: 'We do not sell your data. Your portfolio is for your eyes only.',
    icon: Lock,
  },
  {
    name: 'Instant Updates',
    description: 'Balances updates very fast immediately transactions are being carried out',
    icon: Zap,
  },
];

export default function Features() {
  return (
    <div className="bg-slate-950 py-24 sm:py-32 border-t border-slate-900 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 inline-block px-4 py-1.5 rounded-full mb-4 border border-emerald-500/20">Platform Capabilities</h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            The smartest way to track your crypto
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            Stop checking 5 different apps. Coin Vault brings the entire market into one institutional-grade interface.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div 
                key={feature.name} 
                className="group relative flex flex-col items-start bg-slate-900/40 border border-slate-800 rounded-3xl p-8 hover:bg-slate-800/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] overflow-hidden backdrop-blur-sm cursor-default"
              >
                {/* Internal Hover Glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="rounded-2xl bg-slate-950 p-4 ring-1 ring-slate-800 group-hover:ring-emerald-500/50 transition-all duration-500 mb-6 shadow-inner relative z-10">
                  <feature.icon className="h-7 w-7 text-emerald-500 transform group-hover:scale-110 transition-transform duration-500" aria-hidden="true" />
                </div>
                <dt className="font-bold text-white text-xl mb-3 relative z-10">{feature.name}</dt>
                <dd className="leading-relaxed text-slate-400 text-sm flex-1 relative z-10">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}