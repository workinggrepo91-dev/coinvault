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
  Loader2,
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
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Clear loading state as soon as pathname changes to the target
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  // Fallback safety timeout (clears spinner after 6s in case navigation is cancelled)
  useEffect(() => {
    if (!navigatingTo) return;
    const timer = setTimeout(() => setNavigatingTo(null), 6000);
    return () => clearTimeout(timer);
  }, [navigatingTo]);

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
      {/* GLOBAL TOP GLOWING PROGRESS BAR ON ROUTE NAVIGATION */}
      {navigatingTo && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[99999] pointer-events-none bg-slate-950/60 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 animate-pulse shadow-[0_0_12px_rgba(16,185,129,1)] w-full transition-all duration-300" />
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 md:hidden">
        <div className="flex h-full justify-around items-center px-2">
          {navLinks.map((link) => {
            if (link.reqAdmin && role !== "ADMIN") return null;
            if (link.reqAuth && !isLoggedIn) return null;

            const isActive = pathname.startsWith(link.href);
            const isPending = navigatingTo === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                prefetch={true}
                onClick={() => {
                  if (pathname !== link.href) {
                    setNavigatingTo(link.href);
                  }
                }}
                className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 cursor-pointer transition-all ${
                  isPending
                    ? "text-emerald-300 font-bold scale-105"
                    : isActive
                      ? "text-emerald-500 font-bold"
                      : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <div className="relative">
                  {isPending ? (
                    <Loader2
                      size={20}
                      className="animate-spin text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]"
                    />
                  ) : (
                    <Icon
                      size={20}
                      className={
                        isActive
                          ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                          : ""
                      }
                    />
                  )}
                  {link.name === "Vault" && unreadChatCount > 0 && !isPending && (
                    <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider">
                  {isPending ? "Loading" : link.name}
                </span>
              </Link>
            );
          })}

          {/* Mobile Logout Button */}
          {isLoggedIn && (
            <button
              onClick={() => {
                setIsSigningOut(true);
                signOut({ callbackUrl: "/login" });
              }}
              disabled={isSigningOut}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSigningOut ? (
                <Loader2 size={20} className="animate-spin text-red-400" />
              ) : (
                <LogOut size={20} />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isSigningOut ? "Signing..." : "Logout"}
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
            const isPending = navigatingTo === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                prefetch={true}
                onClick={() => {
                  if (pathname !== link.href) {
                    setNavigatingTo(link.href);
                  }
                }}
                className={`relative flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  isPending
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse"
                    : isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isPending ? (
                    <Loader2 size={18} className="animate-spin text-emerald-400 shrink-0" />
                  ) : (
                    <Icon size={18} className="shrink-0" />
                  )}
                  <span className="text-sm font-bold tracking-wide">
                    {link.name}
                  </span>
                </div>

                {isPending ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Loading...
                  </span>
                ) : link.name === "Vault" && unreadChatCount > 0 ? (
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {unreadChatCount} msg
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Dynamic Bottom Button */}
        {isLoggedIn ? (
          <button
            onClick={() => {
              setIsSigningOut(true);
              signOut({ callbackUrl: "/login" });
            }}
            disabled={isSigningOut}
            className="flex items-center gap-3 px-4 py-3 mt-auto text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all w-full text-left cursor-pointer disabled:opacity-50"
          >
            {isSigningOut ? (
              <Loader2 size={18} className="animate-spin text-red-400" />
            ) : (
              <LogOut size={18} />
            )}
            <span className="text-sm font-bold tracking-wide">
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </span>
          </button>
        ) : (
          <Link
            href="/login"
            prefetch={true}
            className="flex items-center gap-3 px-4 py-3 mt-auto text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all w-full text-left cursor-pointer"
          >
            <LogIn size={18} />
            <span className="text-sm font-bold tracking-wide">Log In</span>
          </Link>
        )}
      </aside>
    </>
  );
}