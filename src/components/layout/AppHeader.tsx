import { Menu, Scale, Calculator, FileSearch, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const mobileMenuItems = [
  { label: "Triagem de Inventário", icon: FileSearch, href: "/triagem" },
  { label: "Calculadora de Partilha", icon: Scale, href: "/" },
  { label: "Calculadora de ITCMD", icon: Calculator, href: "/itcmd" },
  { label: "Gerador de Petição (IA)", icon: FileText, href: "/peticao" },
];

const pageTitles: Record<string, string> = {
  "/": "Calculadora de Partilha",
  "/itcmd": "Calculadora de ITCMD",
  "/triagem": "Triagem de Inventário",
  "/peticao": "Gerador de Petição",
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
          <div>
            <p className="text-[10px] text-muted-foreground">InventariA</p>
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
