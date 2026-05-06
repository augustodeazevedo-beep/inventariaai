import { Menu, Scale, Calculator, FileSearch, FileText, ArrowLeftRight, Building2, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const mobileMenuItems = [
  { label: "Início", icon: Home, href: "/" },
  { label: "Triagem de Inventário", icon: FileSearch, href: "/triagem" },
  { label: "Calculadora de Partilha", icon: Scale, href: "/partilha" },
  { label: "Calculadora de ITCMD", icon: Calculator, href: "/itcmd" },
  { label: "Comparador: Doação × Inventário", icon: ArrowLeftRight, href: "/comparador" },
  { label: "Gerador de Petição (IA)", icon: FileText, href: "/peticao" },
  { label: "Planejamento Holding", icon: Building2, href: "/holding" },
];

const pageTitles: Record<string, string> = {
  "/": "Início",
  "/partilha": "Calculadora de Partilha",
  "/itcmd": "Calculadora de ITCMD",
  "/triagem": "Triagem de Inventário",
  "/peticao": "Gerador de Petição",
  "/comparador": "Comparador: Doação × Inventário",
  "/holding": "Planejamento Holding",
};

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || "Inventaria.AI";

  return (
    <header className="bg-header text-header-foreground border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="lg:hidden">
            <img src="/images/logo-inventaria-icon.png" alt="Inventaria.AI" width={32} height={32} className="w-8 h-8 rounded" />
          </Link>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.18em]">Inventaria.AI</p>
            <h1 className="font-serif text-lg font-semibold">{title}</h1>
          </div>
        </div>
      </div>
      {menuOpen && (
        <nav className="lg:hidden border-t border-sidebar-border px-4 py-3 space-y-2 bg-sidebar">
          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isActive ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground"
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
