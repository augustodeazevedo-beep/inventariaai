import { Calculator, FileSearch, Scale, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    label: "Triagem de Inventário",
    icon: FileSearch,
    href: "/triagem",
    children: [{ label: "Triagem de Inventário", href: "/triagem" }],
  },
  {
    label: "Calculadora de Partilha",
    icon: Scale,
    href: "/",
    children: [{ label: "Calculado de Partilha", href: "/" }],
  },
  {
    label: "Calculadora de ITCMD",
    icon: Calculator,
    href: "/itcmd",
    children: [{ label: "Calculadora de ITCMD", href: "/itcmd" }],
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
            <div key={item.label}>
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
              </Link>
              {item.children && (
                <div className="ml-7 mt-1 space-y-0.5">
                  {item.children.map((child) => {
                    const childActive = location.pathname === child.href;
                    return (
                      <Link
                        key={child.label}
                        to={child.href}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                          childActive
                            ? "text-sidebar-primary font-medium"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                        }`}
                      >
                        {childActive && <ChevronRight className="w-3 h-3 text-sidebar-primary" />}
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/50 text-center">
          Inventário: Via, Rito e Competência v1.0
        </p>
      </div>
    </aside>
  );
}
