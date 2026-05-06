import { Calculator, FileSearch, Scale, ChevronRight, FileText, ArrowLeftRight, Building2, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Início", icon: Home, href: "/" },
  { label: "Triagem de Inventário", icon: FileSearch, href: "/triagem" },
  { label: "Calculadora de Partilha", icon: Scale, href: "/partilha" },
  { label: "Calculadora de ITCMD", icon: Calculator, href: "/itcmd" },
  { label: "Comparador: Doação × Inventário", icon: ArrowLeftRight, href: "/comparador" },
  { label: "Gerador de Petição (IA)", icon: FileText, href: "/peticao" },
  { label: "Planejamento Holding", icon: Building2, href: "/holding" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen">
      <Link to="/" className="block p-5 border-b border-sidebar-border hover:bg-sidebar-accent/30 transition-colors">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo-inventaria-icon.png"
            alt="Inventaria.AI"
            width={40}
            height={40}
            className="w-10 h-10 rounded-md object-cover"
          />
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-base leading-tight">
              <span className="text-foreground">Inventaria</span>
              <span className="text-accent">.AI</span>
            </h1>
            <p className="text-[9px] text-sidebar-foreground/60 mt-0.5 uppercase tracking-[0.15em]">Legal AI Lab</p>
          </div>
        </div>
      </Link>
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
          className="flex flex-col items-center justify-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <span className="text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/50">Uma criação</span>
          <span className="font-serif font-bold text-sm">
            <span className="text-foreground">Advocacy</span>
            <span className="text-primary">.IA</span>
          </span>
        </a>
      </div>
    </aside>
  );
}
