import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import SettingsForms from "@/components/SettingsForms";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return <div>Error loading profile.</div>;

  return (
    <AppShell role={session.user.role}>
      <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <header className="flex items-center gap-3 mb-8 border-b border-slate-900 pb-6">
          <Settings className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Account Settings</h1>
            <p className="text-slate-500 text-xs md:text-sm">Manage your profile, security, and verification status.</p>
          </div>
        </header>
        
        {/* The Form Component */}
        <SettingsForms user={user} />
        
      </div>
    </AppShell>
  );
}