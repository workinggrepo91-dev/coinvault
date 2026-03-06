import Navigation from "./Navigation";

export default function AppShell({ children, role }: { children: React.ReactNode; role: string }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
      <Navigation role={role} />
      
      {/* This is the main content area.
        - pb-24: Adds padding on mobile so content isn't hidden behind the bottom nav.
        - md:pb-0: Removes the bottom padding on desktop.
        - md:ml-64: Pushes the content to the right on desktop to make room for the 64-width sidebar.
      */}
      <main className="pb-24 md:pb-0 md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}