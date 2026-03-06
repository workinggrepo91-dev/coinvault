"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-24 pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
        
        {/* Announcement Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-sm text-slate-400 backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>v2.0 is now live</span>
            <ChevronRight size={14} />
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl"
        >
          Crypto portfolio tracking, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            simplified.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400"
        >
          Seamlessly track your portfolio, view historical performance, and manage your assets across all exchanges in one secure vault.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-x-6"
        >
          <Link href="/register" className="group rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center gap-2">
            Start Tracking for Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-emerald-400 transition-colors">
            View Demo <span aria-hidden="true">→</span>
          </Link>
        </motion.div>

        {/* The "Fake" Dashboard Preview (Visual Eye Candy) */}
        <motion.div 
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 flow-root sm:mt-24"
        >
          <div className="relative -m-2 rounded-xl bg-slate-900/50 p-2 ring-1 ring-inset ring-slate-800 lg:-m-4 lg:rounded-2xl lg:p-4 backdrop-blur-md">
            <div className="bg-slate-950 rounded-lg border border-slate-800 shadow-2xl overflow-hidden aspect-[16/9] flex flex-col relative">
              {/* Mock Header */}
              <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
              </div>
              {/* Mock Content */}
              <div className="p-8 grid grid-cols-3 gap-8 h-full">
                 <div className="col-span-2 space-y-4">
                    <div className="h-32 bg-slate-900/50 rounded-lg border border-slate-800 w-full" />
                    <div className="h-8 w-1/3 bg-slate-900/50 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-12 bg-slate-900/30 rounded-lg border border-slate-800/50 w-full" />
                      <div className="h-12 bg-slate-900/30 rounded-lg border border-slate-800/50 w-full" />
                      <div className="h-12 bg-slate-900/30 rounded-lg border border-slate-800/50 w-full" />
                    </div>
                 </div>
                 <div className="col-span-1 space-y-4">
                    <div className="h-full bg-slate-900/50 rounded-lg border border-slate-800 w-full" />
                 </div>
              </div>
              
              {/* Overlay Text to sell the effect */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                 <p className="text-emerald-500 font-mono text-xl bg-black/80 px-4 py-2 rounded-lg border border-emerald-500/30">
                   Interactive Dashboard Preview
                 </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}