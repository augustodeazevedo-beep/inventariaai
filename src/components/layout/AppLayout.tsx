import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
        <footer className="text-center py-4 text-xs text-muted-foreground border-t">
          <p>Inventário: Via, Rito e Competência v1.0</p>
          <p>Familiariza — Todos os Direitos reservados</p>
        </footer>
      </div>
    </div>
  );
}
