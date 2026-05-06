import { Link } from "react-router-dom";
import { FileSearch, Scale, Calculator, FileText, ArrowLeftRight, Building2, Sparkles, ArrowRight, ShieldCheck, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const modulos = [
  {
    icon: FileSearch,
    title: "Triagem de Inventário",
    desc: "Análise estratégica de vocação hereditária, definição de via (judicial/extrajudicial), rito (arrolamento/inventário) e detecção automática de litigiosidade com checklist de diligências investigativas.",
    href: "/triagem",
    accent: "from-cyan-glow/20 to-transparent",
  },
  {
    icon: Scale,
    title: "Calculadora de Partilha",
    desc: "Cálculo automático de meação, quinhões hereditários, sub-rogações e colação. Suporta concorrência do cônjuge, representação, renúncia e cessões de direitos hereditários.",
    href: "/partilha",
    accent: "from-violet-glow/20 to-transparent",
  },
  {
    icon: Calculator,
    title: "Calculadora de ITCMD",
    desc: "Apuração precisa do imposto de transmissão causa mortis conforme legislação estadual, com simulação de faixas progressivas, isenções e reduções aplicáveis.",
    href: "/itcmd",
    accent: "from-cyan-glow/20 to-transparent",
  },
  {
    icon: FileText,
    title: "Gerador de Petição (IA)",
    desc: "Minutas de petição inicial geradas por IA seguindo padrões DPE.RS — formatação técnica, hierarquia numerada, anti-alucinação e pedidos estruturados (principais, subsidiários e sucessivos).",
    href: "/peticao",
    accent: "from-violet-glow/20 to-transparent",
  },
];

const extras = [
  { icon: ArrowLeftRight, title: "Comparador Doação × Inventário", href: "/comparador" },
  { icon: Building2, title: "Planejamento Holding", href: "/holding" },
];

const features = [
  { icon: Brain, title: "IA Jurídica Treinada", desc: "Modelos calibrados para sucessões e direito de família." },
  { icon: ShieldCheck, title: "Anti-Alucinação", desc: "Geração ancorada em dados estruturados da triagem." },
  { icon: Zap, title: "Da Triagem à Sentença", desc: "Fluxo único, integrado e auditável em uma plataforma." },
];

export default function Landing() {
  return (
    <div className="space-y-20 pb-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-sm px-6 py-16 lg:py-24 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-glow/5 via-transparent to-violet-glow/10 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs text-primary">
            <Sparkles className="w-3 h-3" />
            <span>Sistema de Gestão de Inventário com IA</span>
          </div>
          <h1 className="font-serif text-4xl lg:text-6xl font-bold leading-tight">
            <span className="gradient-text">Inventaria.AI</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Da triagem à sentença em uma única plataforma. Estratégia de direito material e processual,
            cálculos automáticos e peças geradas por IA — tudo em conformidade com os padrões da Defensoria Pública.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/triagem">Iniciar Triagem <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/peticao">Gerar Petição com IA</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="section-card flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          );
        })}
      </section>

      {/* MÓDULOS */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold">Os 4 Módulos Principais</h2>
          <p className="text-muted-foreground">Cobrindo todo o ciclo do inventário, do diagnóstico inicial à minuta final.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modulos.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                to={m.href}
                className={`group relative overflow-hidden section-card hover:border-primary/40 transition-all`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${m.accent} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                <div className="relative space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-secondary border border-border flex items-center justify-center group-hover:border-primary/40 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold">{m.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                  <div className="flex items-center gap-1 text-xs text-primary font-medium pt-2">
                    Acessar módulo <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* EXTRAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {extras.map((e) => {
            const Icon = e.icon;
            return (
              <Link
                key={e.href}
                to={e.href}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card/40 hover:border-primary/40 hover:bg-card/70 transition-all group"
              >
                <Icon className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium flex-1">{e.title}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA + BRANDING */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-sm p-10 text-center space-y-5">
        <h2 className="font-serif text-2xl lg:text-3xl font-bold">Pronto para começar?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A Inventaria.AI foi desenhada para Defensores Públicos e advogados que buscam precisão técnica e velocidade na atuação em sucessões.
        </p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/triagem">Começar agora <ArrowRight className="w-4 h-4" /></Link>
        </Button>
        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Uma criação</span>
          <a
            href="https://advocacyia.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-text font-serif font-bold text-base hover:opacity-80 transition-opacity"
          >
            Advocacy.IA
          </a>
        </div>
      </section>
    </div>
  );
}