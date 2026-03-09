import { Menu, Scale, Calculator } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const title = location.pathname === "/itcmd" ? "Calculadora de ITCMD" : "Calculado de Partilha";

  return (
    <header className="bg-header text-header-foreground">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-header-foreground/60">Início &gt; InventariA</p>
            <h1 className="font-serif text-lg font-semibold">{title}</h1>
          </div>
        </div>
      </div>
      {menuOpen && (
        <nav className="lg:hidden border-t border-sidebar-border px-4 py-3 space-y-2 bg-sidebar">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              location.pathname === "/" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground"
            }`}
          >
            <Scale className="w-4 h-4" /> Calculadora de Partilha
          </Link>
          <Link
            to="/itcmd"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              location.pathname === "/itcmd" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground"
            }`}
          >
            <Calculator className="w-4 h-4" /> Calculadora de ITCMD
          </Link>
        </nav>
      )}
    </header>
  );
}
