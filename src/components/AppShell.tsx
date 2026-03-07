import Navigation from "./Navigation";

// Add an optional isLoggedIn boolean that defaults to true
export default function AppShell({ children, role, isLoggedIn = true }: { children: React.ReactNode; role: string; isLoggedIn?: boolean }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
      {/* Pass isLoggedIn to the Navigation */}
      <Navigation role={role} isLoggedIn={isLoggedIn} />
      
      <main className="pb-24 md:pb-0 md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}