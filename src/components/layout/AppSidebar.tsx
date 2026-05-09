import { Calculator, FileSearch, Scale, ChevronRight, FileText, ArrowLeftRight, Building2, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import advocacyLogo from "@/assets/advocacy-ai-logo.png";
import { useSidebarCollapse } from "./SidebarCollapseContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { collapsed } = useSidebarCollapse();

  return (
    <aside
      className={`hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      <Link to="/" className="block p-4 border-b border-sidebar-border hover:bg-sidebar-accent/30 transition-colors">
        <div className="flex flex-col items-center gap-2">
          <img
            src="/images/logo-inventaria-icon-128.png"
            srcSet="/images/logo-inventaria-icon-128.png 1x, /images/logo-inventaria-icon-256.png 2x, /images/logo-inventaria-icon-384.png 3x"
            sizes={collapsed ? "32px" : "80px"}
            width={collapsed ? 32 : 80}
            height={collapsed ? 32 : 80}
            alt="Inventaria.AI"
            loading="eager"
            decoding="async"
            className={`object-contain transition-all ${collapsed ? "w-8 h-8" : "w-20 h-20"}`}
          />
          {!collapsed && (
            <div className="flex flex-col items-center gap-1">
              <div className="font-serif font-bold text-lg lg:text-xl tracking-tight leading-none">
                <span className="text-white">Inventaria</span>
                <span className="text-primary">.AI</span>
              </div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-sidebar-foreground/60">
                By Advocacy.AI
              </span>
            </div>
          )}
        </div>
      </Link>
      <TooltipProvider delayDuration={0}>
        <nav className={`flex-1 space-y-1 ${collapsed ? "p-2" : "p-3"}`}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            const linkEl = (
              <Link
                key={item.label}
                to={item.href}
                aria-label={item.label}
                className={`flex items-center gap-3 rounded-lg text-sm transition-all ${
                  collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-sidebar-accent text-primary glow-border"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && isActive && <ChevronRight className="w-3 h-3 text-primary" />}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              linkEl
            );
          })}
        </nav>
      </TooltipProvider>
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <a
            href="https://advocacyia.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
          >
            <img src={advocacyLogo} alt="Advocacy.AI" className="w-9 h-9 object-contain shrink-0" />
            <div className="leading-tight">
              <span className="block text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/60">Um produto</span>
              <span className="font-serif font-bold text-sm">
                <span className="text-foreground">Advocacy</span>
                <span className="text-primary">.AI</span>
              </span>
            </div>
          </a>
        </div>
      )}
    </aside>
  );
}
