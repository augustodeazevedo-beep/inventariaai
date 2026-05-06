import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-page-pattern">
      <div className="flex min-h-screen w-full bg-page-overlay">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t border-border py-5 px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-semibold">Inventaria</span>
                  <span className="text-accent font-semibold">.AI</span>
                  <span className="mx-2 text-muted-foreground/40">·</span>
                  Sistema de Gestão de Inventário com IA
                </p>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] mt-0.5">Da triagem à sentença em uma única plataforma</p>
              </div>
              <a
                href="https://advocacyia.lovable.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Uma criação</span>
                <span className="font-serif font-bold text-sm">
                  <span className="text-foreground">Advocacy</span>
                  <span className="text-primary">.IA</span>
                </span>
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
