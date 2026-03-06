import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsForms from "@/components/SettingsForms"; // We'll create this next

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return <div>User not found</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
        <p className="text-slate-400 mb-8 border-b border-slate-900 pb-4">
          Manage your personal details and security preferences.
        </p>
        
        {/* Pass user data to the client form */}
        <SettingsForms user={user} />
      </div>
    </main>
  );
}