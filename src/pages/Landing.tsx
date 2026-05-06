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
  Mail,
  Globe,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import advocacyLogo from "@/assets/advocacy-ai-logo.png";

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
    desc: "Minutas em padrão técnico-formal — formatação ABNT/forense, hierarquia numerada, anti-alucinação e pedidos principais, subsidiários e sucessivos.",
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
          <span className="tag-chip">Legal AI Lab · Sucessões · Holding · AI-Native</span>

          <div className="mx-auto w-40 h-40 lg:w-48 lg:h-48 rounded-2xl bg-white p-3 shadow-2xl glow-border flex items-center justify-center">
            <img
              src="/images/logo-inventaria-icon.png"
              alt="Inventaria.AI — Plataforma de Sucessões com IA"
              width={192}
              height={192}
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="font-serif font-bold leading-[1.05] tracking-tight text-4xl sm:text-5xl lg:text-7xl">
            <span className="block gradient-text">Sucessão Inteligente</span>
            <span className="block text-foreground/90 text-3xl sm:text-4xl lg:text-5xl mt-2">
              do planejamento patrimonial à sentença de partilha
            </span>
          </h1>

          <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Plataforma jurídica com IA que integra <span className="text-foreground font-medium">planejamento patrimonial e sucessório</span> —
            holding familiar, doação em vida, inventário, partilha e ITCMD —
            com cálculos automáticos, estratégia processual e geração de peças em conformidade com as diretrizes do CNJ e da OAB.
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
          — desenhado para advogados que buscam precisão técnica
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
      </section>

      {/* FOOTER — by Advocacy.AI */}
      <footer className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm px-6 py-10 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Um produto</span>
            <a
              href="https://advocacyia.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
            >
              <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg">
                <img
                  src={advocacyLogo}
                  alt="Advocacy.AI"
                  width={56}
                  height={56}
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="leading-tight">
                <div className="font-serif font-bold text-xl">
                  <span className="text-foreground">Advocacy</span>
                  <span className="text-primary">.AI</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Legal Intelligence Lab
                </span>
              </div>
            </a>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Inventaria.AI é a vertente de sucessões e planejamento patrimonial da Advocacy.AI —
              construindo o futuro da prática jurídica com IA.
            </p>
          </div>

          {/* Contato */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Contato</span>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="mailto:contato@advocacy.ai"
                  className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  contato@advocacy.ai
                </a>
              </li>
              <li>
                <a
                  href="https://advocacyia.lovable.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
                >
                  <Globe className="w-4 h-4 text-primary" />
                  advocacyia.lovable.app
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                Porto Alegre · RS · Brasil
              </li>
            </ul>
          </div>

          {/* Plataforma */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Plataforma</span>
            <ul className="space-y-2 text-sm">
              <li><Link to="/triagem" className="text-foreground/80 hover:text-primary transition-colors">Triagem</Link></li>
              <li><Link to="/partilha" className="text-foreground/80 hover:text-primary transition-colors">Calculadora de Partilha</Link></li>
              <li><Link to="/itcmd" className="text-foreground/80 hover:text-primary transition-colors">Calculadora de ITCMD</Link></li>
              <li><Link to="/peticao" className="text-foreground/80 hover:text-primary transition-colors">Gerador de Petição (IA)</Link></li>
              <li><Link to="/holding" className="text-foreground/80 hover:text-primary transition-colors">Planejamento Holding</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span>© {new Date().getFullYear()} Advocacy.AI · Todos os direitos reservados.</span>
          <span className="uppercase tracking-[0.18em]">
            Inventaria.AI <span className="text-foreground/50">·</span> by Advocacy.AI
          </span>
        </div>
      </footer>
    </div>
  );
}