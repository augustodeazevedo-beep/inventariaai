import { Menu, Scale, Calculator, FileSearch, FileText, ArrowLeftRight, Building2, Home, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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
  const [email, setEmail] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const title = pageTitles[location.pathname] || "Inventaria.AI";

  return (
    <header className="bg-header text-header-foreground border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="lg:hidden bg-white rounded-md p-1 flex items-center justify-center">
            <img src="/images/logo-inventaria-icon.png" alt="Inventaria.AI" width={32} height={32} className="w-7 h-7 object-contain" />
          </Link>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.18em]">Inventaria.AI</p>
            <h1 className="font-serif text-lg font-semibold">{title}</h1>
          </div>
        </div>
        {email && (
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">{email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1.5" /> Sair
            </Button>
          </div>
        )}
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
