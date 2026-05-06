import { Calculator, FileSearch, Scale, ChevronRight, FileText, ArrowLeftRight, Building2, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoMark from "@/assets/logo-inventaria-mark.png";
import advocacyLogo from "@/assets/advocacy-ai-logo.png";

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
          <div className="w-14 h-14 rounded-xl bg-secondary/50 border border-primary/30 flex items-center justify-center p-1.5 shadow-lg shadow-primary/10">
            <img
              src={logoMark}
              alt="Inventaria.AI"
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]"
            />
          </div>
          <div className="leading-tight">
            <div className="font-serif font-bold text-xl">
              <span className="text-foreground">Inventaria</span>
              <span className="text-primary">.AI</span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
              Sucessões · AI-Native
            </span>
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
          className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
        >
          <div className="w-9 h-9 rounded-md bg-white p-1 flex items-center justify-center shrink-0">
            <img src={advocacyLogo} alt="Advocacy.AI" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight">
            <span className="block text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/60">Um produto</span>
            <span className="font-serif font-bold text-sm">
              <span className="text-foreground">Advocacy</span>
              <span className="text-primary">.AI</span>
            </span>
          </div>
        </a>
      </div>
    </aside>
  );
}
