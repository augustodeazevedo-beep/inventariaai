import { Link } from "react-router-dom";
import {
  FileSearch,
  Scale,
  Calculator,
  FileText,
  ArrowLeftRight,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const modulos = [
  {
    chip: "AI-NATIVE",
    icon: FileSearch,
    title: "Triagem de Inventário",
    desc: "Vocação hereditária, definição de via (judicial/extrajudicial), rito (arrolamento/inventário) e detecção de litigiosidade com checklist investigativo.",
    href: "/triagem",
  },
  {
    chip: "AUTO-CALC",
    icon: Scale,
    title: "Calculadora de Partilha",
    desc: "Meação, quinhões, sub-rogações e colação. Suporta concorrência do cônjuge, representação, renúncia e cessões hereditárias.",
    href: "/partilha",
  },
  {
    chip: "FISCAL",
    icon: Calculator,
    title: "Calculadora de ITCMD",
    desc: "Apuração do imposto causa mortis conforme legislação estadual, com faixas progressivas, isenções e reduções aplicáveis.",
    href: "/itcmd",
  },
  {
    chip: "DRAFTING",
    icon: FileText,
    title: "Gerador de Petição (IA)",
    desc: "Minutas no padrão DPE/RS — formatação técnica, hierarquia numerada, anti-alucinação e pedidos principais, subsidiários e sucessivos.",
    href: "/peticao",
  },
];

const extras = [
  { icon: ArrowLeftRight, chip: "ESTRATÉGIA", title: "Comparador Doação × Inventário", href: "/comparador" },
  { icon: Building2, chip: "PLANEJAMENTO", title: "Planejamento Holding Familiar", href: "/holding" },
];

const features = [
  { icon: Brain, title: "IA Jurídica Treinada", desc: "Modelos calibrados para sucessões e direito de família." },
  { icon: ShieldCheck, title: "Anti-Alucinação", desc: "Geração ancorada em dados estruturados da triagem." },
  { icon: Zap, title: "Da Triagem à Sentença", desc: "Fluxo único, integrado e auditável em uma plataforma." },
];

export default function Landing() {
  return (
    <div className="space-y-24 pb-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card/30 backdrop-blur-sm px-6 py-16 lg:py-24 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <span className="tag-chip">Legal AI Lab · Inventário · AI-Native</span>

          <img
            src="/images/logo-inventaria-icon.png"
            alt="Inventaria.AI"
            width={160}
            height={160}
            className="mx-auto w-32 h-32 lg:w-40 lg:h-40 rounded-2xl object-cover shadow-2xl glow-border"
          />

          <h1 className="font-serif font-bold leading-[1.05] tracking-tight text-4xl sm:text-5xl lg:text-7xl">
            <span className="block gradient-text">Inventário Inteligente</span>
            <span className="block text-foreground/90 text-3xl sm:text-4xl lg:text-5xl mt-2">
              do diagnóstico à sentença
            </span>
          </h1>

          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Plataforma jurídica com IA que une estratégia de direito material e processual,
            cálculos automáticos e geração de peças — em conformidade com os padrões da Defensoria Pública,
            CNJ e OAB.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              <Link to="/auth">
                Entrar / Criar conta <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 hover:text-accent">
              <Link to="/triagem">Acessar Plataforma</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* OPERADOR / SOBRE */}
      <section className="max-w-4xl mx-auto text-center space-y-4">
        <span className="tag-chip">Operador</span>
        <h2 className="font-serif text-2xl lg:text-3xl font-bold">
          Construído por quem opera o Direito com IA
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          O Inventaria.AI é a vertente especializada em sucessões da{" "}
          <a
            href="https://advocacyia.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
          >
            Advocacy.IA
          </a>{" "}
          — desenhado para Defensores Públicos e advogados que buscam precisão técnica
          e velocidade na atuação em direito sucessório.
        </p>
      </section>

      {/* MÓDULOS DE OPERAÇÃO */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <span className="tag-chip">Módulos de Operação</span>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold">Sistemas integrados</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Cobrindo todo o ciclo do inventário, do diagnóstico inicial à minuta final.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modulos.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                to={m.href}
                className="group relative overflow-hidden section-card hover:border-primary/40 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="tag-chip">{m.chip}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold">{m.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-semibold pt-1 uppercase tracking-wider">
                    Acessar módulo
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card/40 hover:border-accent/40 hover:bg-card/70 transition-all group"
              >
                <Icon className="w-5 h-5 text-accent" />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.18em] text-accent">{e.chip}</span>
                  <p className="text-sm font-medium">{e.title}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="tag-chip">Diferenciais</span>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold">Por que Inventaria.AI</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </section>

      {/* CTA + BRANDING */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-sm p-10 text-center space-y-5">
        <span className="tag-chip mx-auto">Comece agora</span>
        <h2 className="font-serif text-2xl lg:text-3xl font-bold">
          Pronto para a próxima geração de inventários?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Comece pela triagem estratégica e deixe a IA conduzir o restante do fluxo.
        </p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
          <Link to="/triagem">
            Começar agora <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <div className="pt-6 border-t border-border/40 flex flex-col items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Uma criação</span>
          <a
            href="https://advocacyia.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <span className="text-foreground">Advocacy</span>
            <span className="text-primary">.IA</span>
          </a>
        </div>
      </section>
    </div>
  );
}