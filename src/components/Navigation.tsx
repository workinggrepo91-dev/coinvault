"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Settings,
  LogOut,
  Activity,
  LogIn,
  List,
  MessageCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function Navigation({
  role,
  isLoggedIn,
}: {
  role: string;
  isLoggedIn: boolean;
}) {
  const pathname = usePathname();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;
    const checkUnread = async () => {
      try {
        const res = await fetch("/api/chat?unreadOnly=true");
        if (res.ok) {
          const data = await res.json();
          setUnreadChatCount(data.unreadCount || 0);
        }
      } catch (e) {
        // ignore
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 8000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const navLinks = [
    {
      name: "Vault",
      href: "/dashboard",
      icon: LayoutDashboard,
      reqAuth: true,
      reqAdmin: false,
    },
    {
      name: "Market",
      href: "/market",
      icon: Activity,
      reqAuth: false,
      reqAdmin: false,
    },
    {
      name: "History",
      href: "/transactions",
      icon: List,
      reqAuth: true,
      reqAdmin: false,
    },
    {
      name: "Admin",
      href: "/admin",
      icon: ShieldAlert,
      reqAuth: true,
      reqAdmin: true,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      reqAuth: true,
      reqAdmin: false,
    },
  ];

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 md:hidden">
        <div className="flex h-full justify-around items-center px-2">
          {navLinks.map((link) => {
            if (link.reqAdmin && role !== "ADMIN") return null;
            if (link.reqAuth && !isLoggedIn) return null;

            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive
                    ? "text-emerald-500 font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <div className="relative">
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        : ""
                    }
                  />
                  {link.name === "Vault" && unreadChatCount > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider">
                  {link.name}
                </span>
              </Link>
            );
          })}

          {/* Mobile Logout Button */}
          {isLoggedIn && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Logout
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-slate-950 border-r border-slate-900 px-4 py-8 z-30">
        <Link
          href="/"
          className="flex items-center gap-3 mb-10 px-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-black">
            V
          </div>
          <span className="text-xl font-bold tracking-widest text-white uppercase">
            CoinVault
          </span>
        </Link>

        <div className="flex flex-col gap-2 flex-1">
          {navLinks.map((link) => {
            if (link.reqAdmin && role !== "ADMIN") return null;
            if (link.reqAuth && !isLoggedIn) return null;

            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-sm font-bold tracking-wide">
                    {link.name}
                  </span>
                </div>

                {link.name === "Vault" && unreadChatCount > 0 && (
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {unreadChatCount} msg
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Dynamic Bottom Button */}
        {isLoggedIn ? (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 mt-auto text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all w-full text-left"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold tracking-wide">Sign Out</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 mt-auto text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all w-full text-left"
          >
            <LogIn size={18} />
            <span className="text-sm font-bold tracking-wide">Log In</span>
          </Link>
        )}
      </aside>
    </>
  );
}