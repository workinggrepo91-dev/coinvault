import { prisma } from "@/lib/prisma";
import { updateBalance, updateAssetDetails } from "@/app/actions/admin";
import { ShieldAlert, RefreshCw } from "lucide-react";
import AppShell from "@/components/AppShell"; // Import the shell
import { auth } from "@/auth";

export default async function AdminGodMode() {
  // Get the session to pass the role
  const session = await auth(); 
  
  const users = await prisma.user.findMany({ 
    include: { assets: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    // Wrap the admin page in the shell
    <AppShell role={session?.user?.role || "USER"}>
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <header className="flex items-center gap-3 mb-8 border-b border-slate-900 pb-6">
          <ShieldAlert className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">God Mode Console</h1>
            <p className="text-slate-500 text-xs md:text-sm">Manage user balances and assign deposit addresses.</p>
          </div>
        </header>
        
        {/* ... Keep all your existing Admin mapping logic here ... */}
        
      </div>
    </AppShell>
  );
}