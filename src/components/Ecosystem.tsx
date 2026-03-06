import { MonitorPlay, ShieldCheck, Users, Wallet } from "lucide-react";

export default function Ecosystem() {
  return (
    <section className="py-24 bg-slate-950 px-6 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Explore the Ecosystem</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            icon={<Wallet className="text-yellow-500" />} 
            title="Secure Wallet" 
            desc="Store your assets in our institutional-grade vault with 24/7 monitoring." 
          />
          <Card 
            icon={<MonitorPlay className="text-purple-500" />} 
            title="Learn & Earn" 
            desc="Watch tutorials and earn simulated crypto rewards to start your journey." 
          />
          <Card 
            icon={<ShieldCheck className="text-emerald-500" />} 
            title="Insurance Fund" 
            desc="Your assets are backed by our Secure Asset Fund for Users (SAFU)." 
          />
          <Card 
            icon={<Users className="text-blue-500" />} 
            title="24/7 Support" 
            desc="Get round-the-clock support from our dedicated customer service team." 
          />
        </div>
      </div>
    </section>
  );
}

function Card({ icon, title, desc }: any) {
  return (
    <div className="bg-slate-900 p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 border border-slate-800 hover:border-emerald-500/30 group">
      <div className="mb-6 bg-slate-950 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}