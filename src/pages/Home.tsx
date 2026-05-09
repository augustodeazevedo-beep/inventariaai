import { Link } from "react-router-dom";
import { FileSearch, Scale, Calculator, ArrowLeftRight, FileText, Building2, ArrowRight } from "lucide-react";
import { HeroGreetingBanner } from "@/components/home/HeroGreetingBanner";
import { Card } from "@/components/ui/card";

const modules = [
  { icon: FileSearch, title: "Triagem de Inventário", desc: "Vocação hereditária e definição de via.", href: "/triagem" },
  { icon: Scale, title: "Calculadora de Partilha", desc: "Meação, quinhões e sub-rogações.", href: "/partilha" },
  { icon: Calculator, title: "Calculadora de ITCMD", desc: "Apuração do imposto causa mortis.", href: "/itcmd" },
  { icon: ArrowLeftRight, title: "Comparador Doação × Inventário", desc: "Cenários estratégicos comparados.", href: "/comparador" },
  { icon: FileText, title: "Gerador de Petição (IA)", desc: "Minutas em padrão DPE.RS.", href: "/peticao" },
  { icon: Building2, title: "Planejamento Holding", desc: "Estruturação patrimonial familiar.", href: "/holding" },
];

export default function Home() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <HeroGreetingBanner />

      <section>
        <h2 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">Acesso rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ icon: Icon, title, desc, href }) => (
            <Link key={href} to={href} className="group">
              <Card className="p-5 h-full bg-card/80 border-border hover:border-primary/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}