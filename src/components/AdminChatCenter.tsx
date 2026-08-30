"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Send,
  Loader2,
  User,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCheck,
  Check,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { ChatThreadDto, ChatMessageDto } from "@/app/actions/chat";

const CANNED_RESPONSES = [
  "Hello! How can CoinVault administrative support assist you today?",
  "Your withdrawal limit increase request has been approved and applied.",
  "Please ensure you have submitted valid KYC identification documents in Settings.",
  "Your deposit has been verified and credited to your vault balance.",
  "We are currently reviewing your account details and will update you shortly.",
  "Thank you for contacting CoinVault VIP Concierge. Is there anything else you need?",
];

interface AdminChatCenterProps {
  initialUserId?: string;
  onSelectUserForInspection?: (userId: string) => void;
}

export default function AdminChatCenter({
  initialUserId,
  onSelectUserForInspection,
}: AdminChatCenterProps) {
  const [threads, setThreads] = useState<ChatThreadDto[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(
    initialUserId || null
  );
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "unread">("all");
  const [inputText, setInputText] = useState("");
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Fetch threads list
  const fetchThreads = async (showLoading = false) => {
    if (showLoading) setIsLoadingThreads(true);
    try {
      const res = await fetch("/api/chat?threads=true");
      if (res.ok) {
        const data = await res.json();
        if (data.threads) {
          setThreads(data.threads);
          if (!activeUserId && data.threads.length > 0) {
            setActiveUserId(data.threads[0].userId);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    } finally {
      if (showLoading) setIsLoadingThreads(false);
    }
  };

  // Fetch messages for currently selected user
  const fetchMessagesForUser = async (userId: string, showLoading = false) => {
    if (showLoading) setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
          // Mark thread unread as 0 locally
          setThreads((prev) =>
            prev.map((t) =>
              t.userId === userId ? { ...t, unreadCount: 0 } : t
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages for user:", err);
    } finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchThreads(true);
  }, []);

  // Sync if initialUserId changed from parent
  useEffect(() => {
    if (initialUserId) {
      setActiveUserId(initialUserId);
    }
  }, [initialUserId]);

  // Handle active user change
  useEffect(() => {
    if (activeUserId) {
      fetchMessagesForUser(activeUserId, true);
    } else {
      setMessages([]);
    }
  }, [activeUserId]);

  // Polling intervals
  useEffect(() => {
    const threadInterval = setInterval(() => {
      fetchThreads(false);
    }, 5000);

    const messageInterval = setInterval(() => {
      if (activeUserId) {
        fetchMessagesForUser(activeUserId, false);
      }
    }, 3000);

    return () => {
      clearInterval(threadInterval);
      clearInterval(messageInterval);
    };
  }, [activeUserId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [messages.length]);

  // Active user thread
  const activeThread = useMemo(() => {
    return threads.find((t) => t.userId === activeUserId);
  }, [threads, activeUserId]);

  // Filtered threads list
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      if (filterMode === "unread" && t.unreadCount === 0) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const name = `${t.user.firstName || ""} ${t.user.lastName || ""}`.toLowerCase();
      const email = (t.user.email || "").toLowerCase();
      const account = (t.user.accountNumber || "").toLowerCase();

      return name.includes(q) || email.includes(q) || account.includes(q);
    });
  }, [threads, filterMode, searchQuery]);

  const totalUnreadCount = useMemo(() => {
    return threads.reduce((acc, t) => acc + t.unreadCount, 0);
  }, [threads]);

  // Send message as Admin
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || !activeUserId || isSending) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessageDto = {
      id: tempId,
      userId: activeUserId,
      senderId: "admin",
      senderRole: "ADMIN",
      senderName: "CoinVault Support",
      content,
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText("");
    setIsSending(true);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          targetUserId: activeUserId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? data.message : m))
          );
          fetchThreads(false);
        }
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error sending admin response:", err);
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

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-xl overflow-hidden shadow-2xl h-[78vh] flex flex-col md:flex-row">
      {/* ── LEFT PANEL: Threads List ── */}
      <div className="w-full md:w-[360px] lg:w-[400px] border-r border-slate-800/60 flex flex-col shrink-0 bg-slate-950/50">
        {/* Thread Header & Search */}
        <div className="p-4 border-b border-slate-800/60 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Support Inbox</h3>
                <p className="text-[10px] text-slate-500">
                  {threads.length} conversations • {totalUnreadCount} unread
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchThreads(true)}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              title="Refresh conversation threads"
            >
              <RefreshCw size={14} className={isLoadingThreads ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search user, email, account #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 text-white text-xs outline-none border border-slate-800 focus:border-emerald-500/50 rounded-xl pl-9 pr-3 py-2.5 transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
            <button
              onClick={() => setFilterMode("all")}
              className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all ${
                filterMode === "all"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({threads.length})
            </button>
            <button
              onClick={() => setFilterMode("unread")}
              className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                filterMode === "unread"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Unread
              {totalUnreadCount > 0 && (
                <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                  {totalUnreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Threads Scroll List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {isLoadingThreads && threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
              <Loader2 size={20} className="animate-spin text-emerald-500" />
              <p className="text-xs">Loading conversations...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center px-4">
              <MessageSquare size={28} className="text-slate-700 mb-2" />
              <p className="text-xs font-semibold text-slate-400">
                No conversations found
              </p>
              <p className="text-[10px] text-slate-600 mt-1">
                {filterMode === "unread"
                  ? "No unread messages from users"
                  : "Conversations will appear when users send messages"}
              </p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isActive = activeUserId === thread.userId;
              const hasUnread = thread.unreadCount > 0;
              const initials = `${thread.user.firstName?.[0] || ""}${thread.user.lastName?.[0] || ""}`.toUpperCase() || "U";

              return (
                <button
                  key={thread.userId}
                  onClick={() => setActiveUserId(thread.userId)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start gap-3 border ${
                    isActive
                      ? "bg-slate-800/90 border-emerald-500/40 shadow-lg shadow-black/40"
                      : hasUnread
                        ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                        : "bg-transparent border-transparent hover:bg-slate-900/60 hover:border-slate-800"
                  }`}
                >
                  {/* User Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : hasUnread
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {initials}
                    </div>
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border-2 border-slate-950">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Thread Summary */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p
                        className={`text-xs font-bold truncate ${
                          isActive
                            ? "text-white"
                            : hasUnread
                              ? "text-emerald-400 font-black"
                              : "text-slate-300"
                        }`}
                      >
                        {thread.user.firstName} {thread.user.lastName}
                      </p>
                      <span className="text-[9px] text-slate-500 shrink-0 ml-1">
                        {formatRelativeTime(thread.lastMessage.createdAt)}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-mono truncate mb-1">
                      {thread.user.email}
                    </p>

                    <p
                      className={`text-xs truncate ${
                        hasUnread
                          ? "text-white font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      {thread.lastMessage.senderRole === "ADMIN" && (
                        <span className="text-emerald-400 font-semibold mr-1">
                          You:
                        </span>
                      )}
                      {thread.lastMessage.content}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Conversation Thread ── */}
      <div className="flex-1 flex flex-col bg-slate-900/30 overflow-hidden">
        {activeThread ? (
          <>
            {/* Active Thread User Header Bar */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  {`${activeThread.user.firstName?.[0] || ""}${activeThread.user.lastName?.[0] || ""}`.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm md:text-base">
                      {activeThread.user.firstName} {activeThread.user.lastName}
                    </h4>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        activeThread.user.verificationStatus === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : activeThread.user.verificationStatus === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {activeThread.user.verificationStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {activeThread.user.email} • Acct #{activeThread.user.accountNumber || "N/A"}
                  </p>
                </div>
              </div>

              {/* Quick Info & Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                    Balance
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ${(activeThread.user.totalBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {onSelectUserForInspection && (
                  <button
                    onClick={() => onSelectUserForInspection(activeThread.userId)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 px-3 py-2 rounded-xl transition-all"
                  >
                    <span>Manage User</span>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Canned Responses Suggestion Bar */}
            <div className="bg-slate-950/40 border-b border-slate-800/50 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                Quick Reply:
              </span>
              {CANNED_RESPONSES.map((resp, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(resp)}
                  className="shrink-0 text-[11px] text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 px-2.5 py-1 rounded-lg transition-all truncate max-w-[240px]"
                  title={resp}
                >
                  {resp}
                </button>
              ))}
            </div>

            {/* Message Thread History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
              {isLoadingMessages && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                  <Loader2 size={24} className="animate-spin text-emerald-500" />
                  <p className="text-xs">Loading conversation history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-4">
                  <MessageSquare size={32} className="text-slate-700 mb-2" />
                  <h4 className="text-sm font-bold text-slate-400">
                    No messages yet
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">
                    Start a conversation with {activeThread.user.firstName} using the input below or pick a quick canned reply.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isAdmin = msg.senderRole === "ADMIN";
                  const isFirstInGroup =
                    index === 0 ||
                    messages[index - 1].senderRole !== msg.senderRole;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      {/* Sender tag */}
                      {isFirstInGroup && (
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isAdmin ? "text-emerald-400" : "text-blue-400"
                            }`}
                          >
                            {isAdmin
                              ? "Admin Support"
                              : `${activeThread.user.firstName} (User)`}
                          </span>
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                          isAdmin
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 font-medium rounded-br-xs"
                            : "bg-slate-800/90 border border-slate-700/70 text-white rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>

                      {/* Timestamp & Status */}
                      <div
                        className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-500 ${
                          isAdmin ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isAdmin && (
                          <span>
                            {msg.isRead ? (
                              <CheckCheck size={12} className="text-emerald-400" />
                            ) : (
                              <Check size={12} className="text-slate-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 shrink-0">
              <div className="relative flex items-end gap-2 bg-slate-900 border border-slate-800 focus-within:border-emerald-500/50 rounded-2xl p-1.5 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${activeThread.user.firstName || "user"} as Admin Support...`}
                  rows={2}
                  className="flex-1 bg-transparent text-white text-xs sm:text-sm px-3 py-2 outline-none resize-none max-h-32 placeholder:text-slate-600 scrollbar-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSending}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                    inputText.trim() && !isSending
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {isSending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center px-2 pt-1 text-[10px] text-slate-500">
                <span>Press Enter to reply • Shift+Enter for new line</span>
                <span className="font-mono text-emerald-400">Authenticated Administrator</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-4">
            <div className="h-16 w-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-300">
              No Conversation Selected
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Select a customer conversation from the inbox on the left to review messages and send replies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
