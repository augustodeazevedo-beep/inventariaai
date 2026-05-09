import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-greeting-bg.png";

function getGreeting(d: Date) {
  const h = d.getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDate(d: Date) {
  const raw = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
  // Title case each word ("Sábado, 09 De Maio De 2026")
  return raw
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function HeroGreetingBanner() {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const resolve = (session: any) => {
      const u = session?.user;
      if (!u) return setName("");
      const meta = (u.user_metadata ?? {}) as Record<string, string>;
      const candidate =
        meta.full_name ||
        meta.name ||
        meta.preferred_username ||
        (u.email ? String(u.email).split("@")[0] : "");
      setName(candidate);
    };
    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => resolve(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const now = new Date();
  const greeting = getGreeting(now);
  const dateLabel = formatDate(now);
  const displayName = (name || "Visitante").toUpperCase();

  return (
    <section
      className="relative overflow-hidden rounded-xl border border-border min-h-[96px] lg:min-h-[110px] bg-card"
      aria-label="Saudação"
    >
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover opacity-50 select-none pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      <div className="relative px-5 py-4 lg:px-6 lg:py-5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/60 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          AI-Native · Inventaria.AI
        </span>
        <h1 className="font-display text-base sm:text-lg lg:text-xl font-semibold leading-tight text-foreground">
          {greeting},{" "}
          <span className="text-accent uppercase">{displayName}</span>
        </h1>
        <p className="basis-full text-[11px] text-muted-foreground/80">{dateLabel}</p>
      </div>
    </section>
  );
}