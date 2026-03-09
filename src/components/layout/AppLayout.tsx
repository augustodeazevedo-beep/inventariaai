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
                <p className="text-xs text-muted-foreground">Inventaria.AI — Via, Rito e Competência v2.0</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Desenvolvido por</span>
                <a
                  href="https://advocacyia.lovable.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gradient-text font-serif font-bold text-sm hover:opacity-80 transition-opacity"
                >
                  Advocacy.IA
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
