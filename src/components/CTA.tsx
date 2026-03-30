import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-slate-950 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-emerald-900/5" />
      <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Start building your portfolio today</h2>
        <p className="text-slate-400 text-lg mb-10">
          Join the world's largest digital crypto exchange. Register now and get full control of your financial future.
        </p>
        <Link 
          href="/register" 
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-12 py-4 rounded-full text-lg shadow-xl shadow-emerald-500/20 transition-all inline-block hover:scale-105"
        >
          Sign Up Now
        </Link>
      </div>
    </section>
  );
}