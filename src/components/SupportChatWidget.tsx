"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Headphones,
  ShieldCheck,
  Check,
  CheckCheck,
  Sparkles,
  ArrowDown,
  Bell,
  Clock,
  ChevronRight,
  Radio,
} from "lucide-react";

type Message = {
  id: string;
  userId: string;
  senderId: string;
  senderRole: "USER" | "ADMIN";
  senderName: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
  pending?: boolean;
};

const QUICK_PROMPTS = [
  "How do I increase my withdrawal limit?",
  "Check my KYC verification status",
  "Deposit or transaction assistance",
  "General account security inquiry",
];

// Gentle Web Audio API synthesizer for incoming message chime (no external audio files needed)
function playNotificationChime() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Friendly two-tone chime (F5 -> A5)
    osc.frequency.setValueAtTime(698.46, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio autoplay policy catch
  }
}

export default function SupportChatWidget({ userRole }: { userRole?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [incomingToast, setIncomingToast] = useState<{
    id: string;
    content: string;
    sender: string;
    count: number;
  } | null>(null);

  const prevUnreadCountRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Poll for messages when chat is open -> Mark as read in DB
  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch("/api/chat?markRead=true");
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
          setUnreadCount(0);
          prevUnreadCountRef.current = 0;
          setIncomingToast(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Poll for unread count when widget is closed -> DOES NOT mark as read
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/chat?unreadOnly=true");
      if (res.ok) {
        const data = await res.json();
        const newCount = data.unreadCount || 0;

        if (newCount > 0) {
          // If new message arrived while closed
          if (newCount > prevUnreadCountRef.current && !isOpen) {
            playNotificationChime();
          }

          // Fetch preview without marking as read
          const previewRes = await fetch("/api/chat?markRead=false");
          if (previewRes.ok) {
            const previewData = await previewRes.json();
            const latestAdminMsg = (previewData.messages || [])
              .filter((m: Message) => m.senderRole === "ADMIN")
              .slice(-1)[0];

            if (latestAdminMsg && !isOpen) {
              // Set persistent notification toast (stays until opened)
              setIncomingToast({
                id: latestAdminMsg.id,
                content: latestAdminMsg.content,
                sender: "CoinVault Support",
                count: newCount,
              });
            }
          }
        } else {
          setIncomingToast(null);
        }

        setUnreadCount(newCount);
        prevUnreadCountRef.current = newCount;
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  // Initial and interval fetch
  useEffect(() => {
    if (isOpen) {
      setIncomingToast(null);
      fetchMessages(messages.length === 0);
      const interval = setInterval(() => {
        fetchMessages(false);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      fetchUnreadCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive or modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [isOpen, messages.length]);

  // Handle scroll detection
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShowScrollBottom(!isNearBottom);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isSending) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      userId: "",
      senderId: "",
      senderRole: "USER",
      senderName: "You",
      content: textToSend,
      isRead: false,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);
    setInputMessage("");
    setIsSending(true);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textToSend }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? result.message : m))
          );
        }
      } else {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenChat = () => {
    setIncomingToast(null);
    setIsOpen(true);
  };

  return (
    // Responsive positioning: bottom-20 on mobile (above 64px mobile bottom nav) and bottom-6 on desktop
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
      {/* ── PERSISTENT INCOMING MESSAGE NOTIFICATION TOAST ── */}
      {/* Stays permanently visible until the user explicitly opens the chat */}
      <AnimatePresence>
        {!isOpen && incomingToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="mb-3 w-[88vw] sm:w-[360px] bg-slate-900/98 border-2 border-emerald-500/60 rounded-2xl p-3.5 shadow-2xl shadow-emerald-500/25 backdrop-blur-2xl ring-1 ring-emerald-400/20"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Bell size={16} className="animate-bounce" />
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{incomingToast.sender}</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-bold animate-pulse">
                      {incomingToast.count > 1
                        ? `${incomingToast.count} UNREAD`
                        : "UNREAD"}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Compliance team responded to your inquiry
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={handleOpenChat}
              className="mt-2.5 bg-slate-950/90 rounded-xl p-3 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group"
            >
              <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                "{incomingToast.content}"
              </p>
              <span className="text-[10px] text-emerald-400 group-hover:underline font-semibold mt-1 inline-block">
                Click to read full message →
              </span>
            </div>

            <div className="mt-3 flex justify-end items-center gap-2">
              <button
                type="button"
                onClick={handleOpenChat}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>Open & Read Message</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenChat}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-4 py-3.5 rounded-full font-bold shadow-2xl shadow-emerald-500/30 transition-all border border-emerald-400/40"
          >
            <div className="relative">
              <Headphones size={20} className="text-slate-950" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
              </span>
            </div>
            <span className="text-xs tracking-wider uppercase font-black pr-1 hidden sm:inline">
              Live Support
            </span>

            {/* Unread Message Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-1 flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg shadow-red-500/50 animate-bounce">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col w-[92vw] sm:w-[410px] h-[540px] max-h-[72vh] sm:max-h-[82vh] bg-slate-950/95 border border-slate-800/90 rounded-3xl shadow-2xl shadow-black/90 backdrop-blur-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 border-b border-slate-800/80 px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck size={20} />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-sm">
                      CoinVault Concierge
                    </h3>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Support Team Active • Encrypted
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
                  title="Close support chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Support Guarantee Banner */}
            <div className="bg-emerald-500/5 border-b border-emerald-500/10 px-4 py-2 flex items-center gap-2 shrink-0">
              <Sparkles size={12} className="text-emerald-400 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-tight">
                Direct line with CoinVault administrative compliance officers.
              </p>
            </div>

            {/* Messages Container */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                  <Loader2
                    size={24}
                    className="animate-spin text-emerald-500"
                  />
                  <p className="text-xs">Connecting to secure chat...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-inner">
                    <MessageCircle size={22} />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">
                      How can we help today?
                    </h4>
                    <p className="text-slate-400 text-xs mt-1">
                      Send a message and an administrative agent will assist you
                      shortly.
                    </p>
                  </div>

                  {/* Quick Starter Chips */}
                  <div className="w-full space-y-1.5 pt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-left">
                      Suggested Topics
                    </p>
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full text-left text-xs text-slate-300 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-emerald-500/30 rounded-xl px-3 py-2 transition-all duration-150"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isUser = msg.senderRole === "USER";
                    const isFirstInGroup =
                      index === 0 ||
                      messages[index - 1].senderRole !== msg.senderRole;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                      >
                        {/* Sender Label for Admin messages */}
                        {!isUser && isFirstInGroup && (
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                              CoinVault Support
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              Compliance Officer
                            </span>
                          </div>
                        )}

                        {/* Bubble */}
                        <div
                          className={`max-w-[84%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                            isUser
                              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 font-medium rounded-br-xs"
                              : "bg-slate-900 border border-slate-800 text-white rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>

                        {/* Timestamp & Delivery Status */}
                        <div
                          className={`flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-500 ${isUser ? "flex-row-reverse" : ""}`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isUser && (
                            <span className="flex items-center gap-0.5">
                              {msg.pending ? (
                                <>
                                  <Clock
                                    size={10}
                                    className="animate-pulse text-amber-400"
                                  />
                                  <span className="text-[9px] text-amber-400 font-mono">
                                    Sending...
                                  </span>
                                </>
                              ) : msg.isRead ? (
                                <>
                                  <CheckCheck
                                    size={12}
                                    className="text-emerald-400"
                                  />
                                  <span className="text-[9px] text-emerald-400 font-mono">
                                    Read
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CheckCheck
                                    size={12}
                                    className="text-slate-400"
                                  />
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    Delivered
                                  </span>
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Scroll to bottom floating button */}
            {showScrollBottom && (
              <button
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-20 right-6 bg-slate-800/90 text-emerald-400 border border-slate-700/80 p-2 rounded-full shadow-lg hover:bg-slate-700 transition-all"
              >
                <ArrowDown size={14} />
              </button>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 shrink-0">
              <div className="relative flex items-end gap-2 bg-slate-950 border border-slate-800 focus-within:border-emerald-500/50 rounded-2xl p-1.5 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 bg-transparent text-white text-xs sm:text-sm px-3 py-2 outline-none resize-none max-h-24 placeholder:text-slate-600 scrollbar-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isSending}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    inputMessage.trim() && !isSending
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {isSending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center px-2 pt-1 text-[9px] text-slate-500">
                <span>Press Enter to send</span>
                <span className="font-mono">End-to-End Logged</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
