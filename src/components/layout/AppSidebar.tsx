import { Calculator, FileSearch, Scale, ChevronRight, FileText, ArrowLeftRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Triagem de Inventário", icon: FileSearch, href: "/triagem" },
  { label: "Calculadora de Partilha", icon: Scale, href: "/" },
  { label: "Calculadora de ITCMD", icon: Calculator, href: "/itcmd" },
  { label: "Comparador: Doação × Inventário", icon: ArrowLeftRight, href: "/comparador" },
  { label: "Gerador de Petição (IA)", icon: FileText, href: "/peticao" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="font-serif font-bold text-lg gradient-text">Inventaria.AI</h1>
        <p className="text-[10px] text-sidebar-foreground/60 mt-0.5 font-medium">Sistema de Gestão de Inventário com IA</p>
        <p className="text-[9px] text-sidebar-foreground/40 mt-0.5">Da triagem à sentença em uma única plataforma</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-sidebar-accent text-primary glow-border"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <a
          href="https://advocacyia.lovable.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="gradient-text font-serif font-bold text-xs">Advocacy.IA</span>
        </a>
      </div>
    </aside>
  );
}
