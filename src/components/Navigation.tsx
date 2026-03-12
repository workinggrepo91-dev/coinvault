"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// Add LogIn to the imports
import { LayoutDashboard, ShieldAlert, Settings, LogOut, Activity, LogIn, List } from "lucide-react"
import { signOut } from "next-auth/react";

export default function Navigation({ role, isLoggedIn }: { role: string; isLoggedIn: boolean }) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Vault", href: "/dashboard", icon: LayoutDashboard, reqAuth: true, reqAdmin: false },
    { name: "Market", href: "/market", icon: Activity, reqAuth: false, reqAdmin: false },
    { name: "History", href: "/transactions", icon: List, reqAuth: true, reqAdmin: false }, // <-- NEW LINK
    { name: "Admin", href: "/admin", icon: ShieldAlert, reqAuth: true, reqAdmin: true },
    { name: "Settings", href: "/settings", icon: Settings, reqAuth: true, reqAdmin: false },
  ];

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 md:hidden">
        <div className="flex h-full justify-around items-center px-2">
          {navLinks.map((link) => {
            if (link.reqAdmin && role !== "ADMIN") return null;
            if (link.reqAuth && !isLoggedIn) return null; 

            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link key={link.name} href={link.href} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-emerald-500" : "text-slate-500 hover:text-slate-300"}`}>
                <Icon size={20} className={isActive ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : ""} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{link.name}</span>
              </Link>
            );
          })}
          
          {/* NEW: Mobile Logout Button */}
          {isLoggedIn && (
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-red-400">
              <LogOut size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-slate-950 border-r border-slate-900 px-4 py-8">
          <Link href="/" className="flex items-center gap-3 mb-12 px-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-black">
              V
            </div>
            <span className="text-xl font-bold tracking-widest text-white uppercase">Vault</span>
          </Link>

        <div className="flex flex-col gap-2 flex-1">
          {navLinks.map((link) => {
            if (link.reqAdmin && role !== "ADMIN") return null;
            // NEW: Hide private links if user is not logged in
            if (link.reqAuth && !isLoggedIn) return null;

            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}>
                <Icon size={18} />
                <span className="text-sm font-bold tracking-wide">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Dynamic Bottom Button: Show Sign Out if logged in, else Log In */}
        {isLoggedIn ? (
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-3 px-4 py-3 mt-auto text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all w-full text-left">
            <LogOut size={18} />
            <span className="text-sm font-bold tracking-wide">Sign Out</span>
          </button>
        ) : (
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 mt-auto text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all w-full text-left">
            <LogIn size={18} />
            <span className="text-sm font-bold tracking-wide">Log In</span>
          </Link>
        )}
      </aside>
    </>
  );
}