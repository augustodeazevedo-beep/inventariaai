import { Calculator, FileSearch, Scale, ChevronRight, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    label: "Triagem de Inventário",
    icon: FileSearch,
    href: "/triagem",
  },
  {
    label: "Calculadora de Partilha",
    icon: Scale,
    href: "/",
  },
  {
    label: "Calculadora de ITCMD",
    icon: Calculator,
    href: "/itcmd",
  },
  {
    label: "Gerador de Petição (IA)",
    icon: FileText,
    href: "/peticao",
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="text-lg font-serif font-bold text-sidebar-accent-foreground">InventariA</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/50 text-center">
          InventariA — Via, Rito e Competência v2.0
        </p>
      </div>
    </aside>
  );
}
