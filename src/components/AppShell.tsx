import Navigation from "./Navigation";
import { auth } from "@/auth";
import { revertImpersonation } from "@/app/actions/admin";
import { UserCheck } from "lucide-react";

export default async function AppShell({ children, role }: any) {
  const session = await auth();
  
  // Check if our secret email token exists in the current session
  const isImpersonating = !!session?.user?.impersonatorEmail;

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Navigation role={role} isLoggedIn={true} />
      
      <main className="flex-1 ml-0 md:ml-64 w-full flex flex-col h-screen overflow-hidden">
        
        {/* THE ADMIN DISGUISE BANNER */}
        {isImpersonating && (
          <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-3 flex justify-between items-center backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3 text-red-400">
              <UserCheck size={18} className="animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest">
                Admin Viewing Mode: {session.user.name}
              </p>
            </div>
            <form action={revertImpersonation}>
              <input type="hidden" name="adminEmail" value={session.user.impersonatorEmail} />
              <button className="bg-red-500 hover:bg-red-400 text-slate-950 font-bold px-4 py-1.5 rounded-md text-xs transition-colors shadow-lg shadow-red-500/20">
                End Session & Return
              </button>
            </form>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}