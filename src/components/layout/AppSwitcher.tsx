import { LayoutGrid, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ECOSYSTEM_APPS, CURRENT_APP_ID } from "@/config/ecosystem";

export function AppSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Trocar de plataforma Advocacy.AI"
          className="gap-1.5 px-2"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Apps</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] p-2">
        <div className="px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Ecossistema
          </p>
          <p className="font-serif text-sm font-semibold">
            Advocacy<span className="text-primary">.AI</span>
          </p>
        </div>
        <div className="space-y-1 mt-1">
          {ECOSYSTEM_APPS.map((app) => {
            const Icon = app.icon;
            const isCurrent = app.id === CURRENT_APP_ID;
            return (
              <a
                key={app.id}
                href={app.url}
                target={isCurrent ? undefined : "_blank"}
                rel={isCurrent ? undefined : "noopener noreferrer"}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex items-start gap-3 rounded-md p-2 transition-colors ${
                  isCurrent
                    ? "bg-accent/40 cursor-default"
                    : "hover:bg-accent"
                }`}
                onClick={isCurrent ? (e) => e.preventDefault() : undefined}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className={`w-4 h-4 ${app.accent}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground">
                      {app.name}
                      <span className="text-primary">{app.suffix}</span>
                    </span>
                    {isCurrent ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {app.description}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}