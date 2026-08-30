import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { List, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell role={session.user.role}>
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-end border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-500">
              <List size={20} />
              <h1 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Statement
              </h1>
            </div>
            <p className="text-3xl font-bold tracking-tight text-white">
              Transaction History
            </p>
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount / Asset</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Narration / Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(!transactions || transactions.length === 0) && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500 text-sm"
                    >
                      No transactions on record.
                    </td>
                  </tr>
                )}
                {transactions.map((tx: any) => {
                  const status = tx.status || "COMPLETED";
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider ${
                            tx.type === "RECEIVE" || tx.type === "DEPOSIT"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={11} /> Success
                          </span>
                        ) : status === "FAILED" ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle size={11} /> Payment Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock size={11} className="animate-pulse" /> Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-white font-mono text-sm">
                          {tx.amount.toLocaleString()} {tx.asset}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-300">{tx.date}</div>
                        <div className="text-[10px] text-slate-500">{tx.time}</div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300 max-w-md">
                        <div>{tx.narration}</div>
                        {tx.adminNote && (
                          <div className={`mt-1 text-xs font-semibold flex items-center gap-1.5 ${status === "FAILED" ? "text-red-400" : "text-slate-400"}`}>
                            <AlertCircle size={12} className="shrink-0" />
                            <span>Note: {tx.adminNote}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}