"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  X,
  ShieldCheck,
  Check,
  CheckCheck,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  HelpCircle,
  CreditCard,
  Lock,
} from "lucide-react";
import { uploadChatAttachment } from "@/app/actions/chat-upload";

type Message = {
  id: string;
  userId: string;
  senderId: string;
  senderRole: "USER" | "ADMIN";
  senderName: string | null;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  isRead: boolean;
  createdAt: string;
  pending?: boolean;
};

function formatFileSize(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

const QUICK_PROMPTS = [
  "How do I increase my withdrawal limit?",
  "Check my KYC verification status",
  "Deposit or transaction assistance",
  "General account security inquiry",
];

const FAQS = [
  {
    q: "How fast do support agents respond?",
    a: "Our institutional support desk is staffed 24/7. Average response time is under 5 minutes.",
  },
  {
    q: "Are my support messages encrypted?",
    a: "Yes. All conversations are secured with 256-bit encryption and accessible only by verified compliance officers.",
  },
  {
    q: "Where can I view my deposits and withdrawals?",
    a: "You can track all incoming and outgoing settlements in real time in your History tab.",
  },
];

export default function SupportPageClient({
  initialMessages = [],
  userName,
}: {
  initialMessages?: Message[];
  userName?: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch("/api/chat?markRead=true");
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("chat-unread-updated", { detail: 0 }));
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch and mark incoming as read
    fetchMessages(messages.length === 0);
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if ((!textToSend && !selectedFile) || isSending || isUploadingFile) return;

    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;
    let fileSize: number | undefined;

    setIsSending(true);

    if (selectedFile) {
      setIsUploadingFile(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await uploadChatAttachment(formData);
        if (uploadRes.error || !uploadRes.url) {
          alert(uploadRes.error || "Failed to upload file attachment.");
          setIsSending(false);
          setIsUploadingFile(false);
          return;
        }
        fileUrl = uploadRes.url;
        fileName = uploadRes.fileName;
        fileType = uploadRes.fileType;
        fileSize = uploadRes.fileSize;
      } catch (e: any) {
        alert("Upload error: " + (e.message || "Failed to upload file."));
        setIsSending(false);
        setIsUploadingFile(false);
        return;
      } finally {
        setIsUploadingFile(false);
      }
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      userId: "",
      senderId: "",
      senderRole: "USER",
      senderName: userName || "Customer",
      content: textToSend || (fileName ? `Attached: ${fileName}` : "Attachment"),
      fileUrl,
      fileName,
      fileType,
      fileSize,
      isRead: false,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    if (!customText) setInputMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textToSend,
          fileUrl,
          fileName,
          fileType,
          fileSize,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? data.message : m))
          );
        }
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-900 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-500">
            <Mail size={20} />
            <h1 className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Support & Inquiries
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            VIP Support Desk
          </p>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Direct, encrypted communication channel with CoinVault compliance officers and specialists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Desk Online
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 text-xs font-mono">
            <Lock size={12} className="text-emerald-500" />
            256-Bit Encrypted
          </div>
        </div>
      </header>

      {/* Main Grid: Chat Workspace (Left) & Info Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Module (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
          {/* Chat Top Banner */}
          <div className="bg-slate-950/80 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={22} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">
                    CoinVault Concierge
                  </h3>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Institutional Settlement & Technical Support
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              Avg Reply: &lt; 5 mins
            </span>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-950/40 border-b border-slate-800/50 px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-400" /> Quick Ask:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                className="whitespace-nowrap text-[11px] bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1 rounded-full border border-slate-700/60 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950/70"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                <Loader2 size={28} className="animate-spin text-emerald-500" />
                <p className="text-xs">Loading secure conversation history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Mail size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    How can CoinVault assist you today?
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    Leave a message regarding deposits, withdrawals, KYC verification, or vault security. A live compliance specialist will respond here immediately.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.senderRole === "ADMIN";
                const isPending = msg.pending;
                const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isAdmin ? "items-start" : "items-end"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-400">
                        {isAdmin ? "CoinVault Support Desk" : "You"}
                      </span>
                      <span className="text-[9px] text-slate-600 font-mono">
                        {formattedTime}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md ${
                        isAdmin
                          ? "bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-sm"
                          : "bg-emerald-600 text-white rounded-tr-sm"
                      } ${isPending ? "opacity-70" : ""}`}
                    >
                      {/* File Attachment Display */}
                      {msg.fileUrl && (
                        <div className="mb-2">
                          {msg.fileType?.startsWith("image/") || msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block overflow-hidden rounded-xl border border-white/10 hover:opacity-90 transition-opacity max-w-[280px]"
                            >
                              <img
                                src={msg.fileUrl}
                                alt={msg.fileName || "Image attachment"}
                                className="w-full max-h-56 object-cover rounded-xl"
                              />
                              <div className="flex items-center justify-between text-[10px] bg-slate-950/80 text-slate-300 px-3 py-1.5">
                                <span className="truncate max-w-[200px]">{msg.fileName || "View image"}</span>
                                <Download size={12} className="shrink-0 text-emerald-400" />
                              </div>
                            </a>
                          ) : (
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={msg.fileName || "file"}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-white/10 hover:border-emerald-500/40 transition-colors text-left max-w-[280px]"
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                                <FileText size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">
                                  {msg.fileName || "Attached file"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {formatFileSize(msg.fileSize)}
                                </p>
                              </div>
                              <Download size={14} className="text-slate-400 shrink-0" />
                            </a>
                          )}
                        </div>
                      )}

                      {msg.content && (!msg.fileUrl || !msg.content.startsWith("Attached: ")) && (
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-1 px-1">
                      {isPending ? (
                        <span className="flex items-center gap-1 text-slate-400 font-mono">
                          <Loader2 size={9} className="animate-spin" /> Sending...
                        </span>
                      ) : isAdmin ? (
                        <span className="text-emerald-400 font-mono flex items-center gap-1">
                          <ShieldCheck size={10} /> Verified Officer
                        </span>
                      ) : msg.isRead ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCheck size={11} /> Read by Support
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Check size={11} /> Delivered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Message Input Bar */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
            {/* Selected File Attachment Preview */}
            {selectedFile && (
              <div className="mb-3 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    {selectedFile.type.startsWith("image/") ? (
                      <ImageIcon size={15} />
                    ) : (
                      <FileText size={15} />
                    )}
                  </div>
                  <span className="text-white truncate font-medium text-xs max-w-[280px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono shrink-0">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }}
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-3"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach image or document"
                className="h-11 w-11 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <Paperclip size={18} />
              </button>

              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder={selectedFile ? "Add an optional note... (Press Enter to send)" : "Type your message to support desk... (Press Enter to send)"}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 resize-none outline-none transition-all"
              />

              <button
                type="submit"
                disabled={(!inputMessage.trim() && !selectedFile) || isSending || isUploadingFile}
                className="h-11 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:shadow-none shrink-0"
              >
                {isSending || isUploadingFile ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
            <div className="flex justify-between items-center px-1 pt-2 text-[10px] text-slate-500">
              <span>Press Enter to send • 📎 Attach images, PDFs, or documents up to 10MB</span>
              <span className="font-mono">Encrypted Support Session</span>
            </div>
          </div>
        </div>

        {/* Side Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Concierge Guarantee */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  CoinVault Concierge
                </h3>
                <p className="text-[11px] text-slate-400">
                  Priority Client Support Desk
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-2.5">
                <Clock size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">
                    24/7 Global Availability
                  </strong>
                  <span className="text-slate-400 text-[11px]">
                    Technical and compliance specialists on standby round the clock.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Lock size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">
                    Confidential & Encrypted
                  </strong>
                  <span className="text-slate-400 text-[11px]">
                    All queries are isolated to your customer account profile.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Helpful Shortcuts
            </h4>

            <div className="space-y-2 pt-1">
              <Link
                href="/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-xs text-white transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard size={15} className="text-emerald-400" />
                  <span>KYC & Account Limits</span>
                </div>
                <ArrowRight size={13} className="text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/transactions"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-xs text-white transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={15} className="text-emerald-400" />
                  <span>Transaction Statement</span>
                </div>
                <ArrowRight size={13} className="text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Card 3: Frequently Asked Questions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <HelpCircle size={16} className="text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Support FAQs
              </h4>
            </div>

            <div className="space-y-3 divide-y divide-slate-800/80 text-xs">
              {FAQS.map((faq, i) => (
                <div key={i} className={i > 0 ? "pt-3" : ""}>
                  <p className="font-bold text-white mb-1">{faq.q}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

