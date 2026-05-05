import { useState } from "react";
import {
  Building2, ChevronDown, ChevronUp, MessageCircle, X,
  CheckCircle2, AlertCircle, XCircle, Shield, Clock, TrendingDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calcularItcmdProgressivo, formatCurrency } from "@/lib/partilha-calculator";

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const REGIME_LIST = [
  { value: "comunhao_parcial", label: "Comunhão Parcial de Bens" },
  { value: "comunhao_universal", label: "Comunhão Universal de Bens" },
  { value: "separacao_total", label: "Separação Total de Bens" },
  { value: "participacao_final", label: "Participação Final nos Aquestos" },
];

interface HoldingForm {
  patrimonio: number;
  imoveis: number;
  qtdImoveis: number;
  participacoes: number;
  aplicacoes: number;
  outrosBens: number;
  rendaAnual: number;
  numHerdeiros: number;
  regimeCasamento: string;
  uf: string;
  possuiDividas: boolean;
  valorDividas: number;
  horizonte: 5 | 10 | 20;
}

interface CenarioPF {
  itcmd: number;
  custasInventario: number;
  honorarios: number;
  irpfAnual: number;
  custoUnico: number;
  totalHorizonte: number;
}

interface CenarioHolding {
  constituicao: number;
  itcmd: number;
  itbiIsento: boolean;
  irpjAnual: number;
  custoUnico: number;
  totalHorizonte: number;
}

interface HoldingResultado {
  semHolding: CenarioPF;
  comHolding: CenarioHolding;
  economia: number;
  paybackAnos: number;
  protecaoPatrimonial: boolean;
  veredicto: "recomendada" | "neutra" | "nao_recomendada";
  textoVeredicto: string;
}

function calcularIrpfAnual(renda: number): number {
  if (renda <= 0) return 0;
  const brackets = [
    { ate: 22847.76, rate: 0 },
    { ate: 33919.8, rate: 0.075 },
    { ate: 45012.6, rate: 0.15 },
    { ate: 55976.16, rate: 0.225 },
    { ate: Infinity, rate: 0.275 },
  ];
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (renda <= prev) break;
    const cap = b.ate === Infinity ? renda : b.ate;
    tax += (Math.min(renda, cap) - prev) * b.rate;
    prev = cap;
  }
  return tax;
}

function calcularHolding(f: HoldingForm): HoldingResultado {
  const n = Math.max(1, f.numHerdeiros);
  const p = Math.max(0, f.patrimonio);
  const renda = Math.max(0, f.rendaAnual);
  const h = f.horizonte;

  // Cenário A — Pessoa Física (sem holding)
  const itcmdSem = calcularItcmdProgressivo(p / n) * n;
  const custasInventario = p * 0.03;
  const honorarios = p * 0.1;
  const irpfAnual = calcularIrpfAnual(renda);
  const custoUnicoSem = itcmdSem + custasInventario + honorarios;
  const totalSem = custoUnicoSem + irpfAnual * h;

  // Cenário B — Com Holding Familiar
  const constituicao = 5000;
  const itbiIsento = f.imoveis > 0;
  // Doação de cotas com reserva de usufruto: base = nua-propriedade (50% do valor)
  const itcmdCom = calcularItcmdProgressivo((p / n) * 0.5) * n;
  const irpjAnual = renda * 0.0673; // Lucro Presumido 32% × (IRPJ 15% + CSLL 9% + PIS/COFINS)
  const custoUnicoCom = constituicao + itcmdCom;
  const totalCom = custoUnicoCom + irpjAnual * h;

  const economia = totalSem - totalCom;
  const ganhoAnual = irpfAnual - irpjAnual;
  const paybackAnos = ganhoAnual > 0 ? custoUnicoCom / ganhoAnual : -1;

  const protecao = f.possuiDividas;

  let veredicto: HoldingResultado["veredicto"];
  if (economia > 50000 || protecao || n > 2) {
    veredicto = "recomendada";
  } else if (p < 500000 && !f.possuiDividas && n <= 1) {
    veredicto = "nao_recomendada";
  } else {
    veredicto = "neutra";
  }

  const textoVeredicto = (() => {
    if (veredicto === "recomendada") {
      const motivos: string[] = [];
      if (economia > 50000) motivos.push(`economia estimada de R$ ${formatCurrency(economia)}`);
      if (protecao) motivos.push("necessidade de proteção patrimonial contra credores");
      if (n > 2) motivos.push(`planejamento sucessório com ${n} herdeiros`);
      return (
        `A constituição de Holding Familiar é recomendada para o seu perfil patrimonial, considerando: ` +
        `${motivos.join("; ")}. A estrutura societária permite a transferência de cotas com reserva de usufruto ` +
        `(CC/2002, arts. 1.391 e ss.), reduzindo o ITCMD incidente à base da nua-propriedade e eliminando ` +
        `custos de inventário nas transmissões futuras. A eficiência tributária do Lucro Presumido (6,73%) ` +
        `frente ao IRPF (até 27,5%) representa um ganho estrutural recorrente.`
      );
    }
    if (veredicto === "neutra") {
      return (
        `A constituição de Holding Familiar é neutra para este cenário. A economia estimada de ` +
        `R$ ${formatCurrency(Math.abs(economia))} ${economia > 0 ? "favorece a holding" : "não compensa o custo de constituição no horizonte analisado"}. ` +
        `Recomenda-se avaliar fatores adicionais como governança familiar, proteção de bens contra litígios ` +
        `futuros (STJ: Tema 796) e perspectiva de crescimento patrimonial, que podem tornar a estrutura ` +
        `holding mais vantajosa a longo prazo. Uma consulta especializada é essencial para decisão fundamentada.`
      );
    }
    return (
      `Para o perfil apresentado, a constituição de Holding Familiar não se justifica economicamente no ` +
      `horizonte analisado. Com patrimônio de R$ ${formatCurrency(p)}, ${n === 1 ? "1 herdeiro" : `${n} herdeiros`} ` +
      `e ausência de passivos relevantes, o custo de constituição e manutenção da estrutura societária não é ` +
      `compensado pelo ganho tributário projetado. Alternativas como doações escalonadas com reserva de usufruto ` +
      `e testamento com cláusulas de inalienabilidade podem ser mais eficientes neste cenário.`
    );
  })();

  return {
    semHolding: { itcmd: itcmdSem, custasInventario, honorarios, irpfAnual, custoUnico: custoUnicoSem, totalHorizonte: totalSem },
    comHolding: { constituicao, itcmd: itcmdCom, itbiIsento, irpjAnual, custoUnico: custoUnicoCom, totalHorizonte: totalCom },
    economia,
    paybackAnos,
    protecaoPatrimonial: protecao,
    veredicto,
    textoVeredicto,
  };
}

const initialForm: HoldingForm = {
  patrimonio: 0,
  imoveis: 0,
  qtdImoveis: 0,
  participacoes: 0,
  aplicacoes: 0,
  outrosBens: 0,
  rendaAnual: 0,
  numHerdeiros: 2,
  regimeCasamento: "comunhao_parcial",
  uf: "SP",
  possuiDividas: false,
  valorDividas: 0,
  horizonte: 20,
};

type Aba = "diagnostico" | "simulacao" | "recomendacao";

export default function PlanejamentoHolding() {
  const [aba, setAba] = useState<Aba>("diagnostico");
  const [form, setForm] = useState<HoldingForm>(initialForm);
  const [resultado, setResultado] = useState<HoldingResultado | null>(null);
  const [modalWpp, setModalWpp] = useState(false);
  const [showFund, setShowFund] = useState(false);

  const set = (partial: Partial<HoldingForm>) => setForm((f) => ({ ...f, ...partial }));

  const simular = () => {
    if (form.patrimonio <= 0) return;
    const r = calcularHolding(form);
    setResultado(r);
    setAba("simulacao");
  };

  const wppMsg = resultado
    ? encodeURIComponent(
        `Olá! Gostaria de uma consulta sobre Planejamento Patrimonial via Holding Familiar.\n\n` +
        `📊 Resumo da simulação (Inventaria.IA):\n` +
        `• Patrimônio: R$ ${formatCurrency(form.patrimonio)}\n` +
        `• Herdeiros: ${form.numHerdeiros}\n` +
        `• UF: ${form.uf}\n` +
        `• Horizonte: ${form.horizonte} anos\n\n` +
        `💰 Custo estimado SEM holding (${form.horizonte} anos): R$ ${formatCurrency(resultado.semHolding.totalHorizonte)}\n` +
        `🏢 Custo estimado COM holding (${form.horizonte} anos): R$ ${formatCurrency(resultado.comHolding.totalHorizonte)}\n` +
        `✅ Economia projetada: R$ ${formatCurrency(resultado.economia)}\n\n` +
        `Poderia agendar uma consultoria para análise detalhada?\n` +
        `_Mensagem gerada pelo Inventaria.IA_`
      )
    : "";

  const tabClass = (t: Aba) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
      aba === t
        ? "bg-primary text-primary-foreground shadow"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`;

  const veredictoConfig = resultado
    ? {
        recomendada: {
          icon: <CheckCircle2 className="w-6 h-6 text-success" />,
          label: "Holding Recomendada",
          cls: "border-success bg-success/5",
          badge: "text-success bg-success/10 border-success/30",
        },
        neutra: {
          icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
          label: "Holding Neutra",
          cls: "border-yellow-500 bg-yellow-500/5",
          badge: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
        },
        nao_recomendada: {
          icon: <XCircle className="w-6 h-6 text-destructive" />,
          label: "Holding não Recomendada",
          cls: "border-destructive bg-destructive/5",
          badge: "text-destructive bg-destructive/10 border-destructive/30",
        },
      }[resultado.veredicto]
    : null;

  // Chart data: cumulative cost at each milestone up to horizonte
  const milestones = ([5, 10, 20] as const).filter((y) => y <= form.horizonte || y === form.horizonte);
  const chartData = resultado
    ? milestones.map((y) => ({
        year: y,
        sem: resultado.semHolding.custoUnico + resultado.semHolding.irpfAnual * y,
        com: resultado.comHolding.custoUnico + resultado.comHolding.irpjAnual * y,
      }))
    : [];
  const chartMax = chartData.length > 0 ? Math.max(...chartData.flatMap((d) => [d.sem, d.com]), 1) : 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="itcmd-header">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 mb-3">
          PLANEJAMENTO PATRIMONIAL
        </span>
        <h1 className="font-serif text-3xl font-bold text-header-foreground flex items-center gap-3">
          <Building2 className="w-7 h-7 text-primary" />
          Planejamento Holding Patrimonial
        </h1>
        <p className="text-sm text-header-foreground/70 mt-2">
          Compare a tributação como pessoa física versus holding familiar e identifique a
          estratégia mais eficiente para seu patrimônio e seus herdeiros.
        </p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl border border-border w-fit">
        <button className={tabClass("diagnostico")} onClick={() => setAba("diagnostico")}>
          Diagnóstico
        </button>
        <button
          className={tabClass("simulacao")}
          onClick={() => resultado && setAba("simulacao")}
          disabled={!resultado}
        >
          Simulação
        </button>
        <button
          className={tabClass("recomendacao")}
          onClick={() => resultado && setAba("recomendacao")}
          disabled={!resultado}
        >
          Recomendação
        </button>
      </div>

      {/* ─── ABA DIAGNÓSTICO ─── */}
      {aba === "diagnostico" && (
        <div className="section-card space-y-6">
          <h2 className="font-bold uppercase text-sm tracking-wide flex items-center gap-2">
            📋 Dados Patrimoniais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Patrimônio Total (R$)
              </Label>
              <Input
                type="number"
                min={0}
                value={form.patrimonio || ""}
                onChange={(e) => set({ patrimonio: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 2000000"
              />
            </div>

            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
                Composição Patrimonial
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Imóveis (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.imoveis || ""}
                    onChange={(e) => set({ imoveis: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Quantidade de imóveis</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.qtdImoveis || ""}
                    onChange={(e) => set({ qtdImoveis: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Participações societárias (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.participacoes || ""}
                    onChange={(e) => set({ participacoes: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Aplicações financeiras (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.aplicacoes || ""}
                    onChange={(e) => set({ aplicacoes: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Outros bens (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.outrosBens || ""}
                    onChange={(e) => set({ outrosBens: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Renda anual estimada dos bens (R$)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.rendaAnual || ""}
                    onChange={(e) => set({ rendaAnual: parseFloat(e.target.value) || 0 })}
                    placeholder="Aluguéis, dividendos, juros..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Número de herdeiros
              </Label>
              <Input
                type="number"
                min={1}
                value={form.numHerdeiros}
                onChange={(e) => set({ numHerdeiros: Math.max(1, parseInt(e.target.value) || 1) })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Regime de casamento
              </Label>
              <Select value={form.regimeCasamento} onValueChange={(v) => set({ regimeCasamento: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIME_LIST.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Estado (UF)</Label>
              <Select value={form.uf} onValueChange={(v) => set({ uf: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UF_LIST.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Horizonte de planejamento
              </Label>
              <Select
                value={String(form.horizonte)}
                onValueChange={(v) => set({ horizonte: parseInt(v) as 5 | 10 | 20 })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 anos</SelectItem>
                  <SelectItem value="10">10 anos</SelectItem>
                  <SelectItem value="20">20 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-3">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Possui dívidas / credores?
              </Label>
              <div className="flex gap-3">
                <button
                  onClick={() => set({ possuiDividas: true })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    form.possuiDividas
                      ? "bg-destructive/10 border-destructive text-destructive"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Sim
                </button>
                <button
                  onClick={() => set({ possuiDividas: false, valorDividas: 0 })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    !form.possuiDividas
                      ? "bg-success/10 border-success text-success"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Não
                </button>
              </div>
              {form.possuiDividas && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Valor aproximado das dívidas (R$)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.valorDividas || ""}
                    onChange={(e) => set({ valorDividas: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={simular}
            disabled={form.patrimonio <= 0}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Building2 className="w-5 h-5" />
            Simular Holding Patrimonial
          </button>
        </div>
      )}

      {/* ─── ABA SIMULAÇÃO ─── */}
      {aba === "simulacao" && resultado && (
        <div className="space-y-5 animate-fade-in">
          {/* Badges ITBI / Proteção */}
          <div className="flex flex-wrap gap-2">
            {resultado.comHolding.itbiIsento && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ITBI isento — CF/88 Art. 156, §2°, I
              </span>
            )}
            {resultado.protecaoPatrimonial && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/30">
                <Shield className="w-3.5 h-3.5" />
                Bens protegidos contra credores
              </span>
            )}
          </div>

          {/* Comparativo lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sem Holding */}
            <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-5 space-y-4">
              <h3 className="font-serif font-bold text-lg">Sem Holding (PF)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ITCMD (LC 227/2026)</span>
                  <span className="font-medium text-destructive">R$ {formatCurrency(resultado.semHolding.itcmd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custas de inventário (3%)</span>
                  <span className="font-medium text-destructive">R$ {formatCurrency(resultado.semHolding.custasInventario)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Honorários OAB (10%)</span>
                  <span className="font-medium text-destructive">R$ {formatCurrency(resultado.semHolding.honorarios)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IRPF anual (prog.)</span>
                  <span className="font-medium text-destructive">R$ {formatCurrency(resultado.semHolding.irpfAnual)}/ano</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total em {form.horizonte} anos</span>
                  <span className="text-destructive">R$ {formatCurrency(resultado.semHolding.totalHorizonte)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Inventário: 12 a 36 meses + sucessivas aberturas</span>
              </div>
            </div>

            {/* Com Holding */}
            <div className="rounded-xl border-2 border-success/40 bg-success/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg">Com Holding Familiar</h3>
                {resultado.economia > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 border border-success/30 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mais Vantajoso
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Constituição (estimativa)</span>
                  <span className="font-medium">R$ {formatCurrency(resultado.comHolding.constituicao)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ITBI na transferência</span>
                  <span className="font-medium text-success">
                    {resultado.comHolding.itbiIsento ? "ISENTO (CF/88)" : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ITCMD cotas (nua-prop.)</span>
                  <span className="font-medium">R$ {formatCurrency(resultado.comHolding.itcmd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IRPJ Lucro Presumido (6,73%)</span>
                  <span className="font-medium text-success">R$ {formatCurrency(resultado.comHolding.irpjAnual)}/ano</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total em {form.horizonte} anos</span>
                  <span className="text-success">R$ {formatCurrency(resultado.comHolding.totalHorizonte)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Sem inventário nas futuras transmissões (cotas)</span>
              </div>
            </div>
          </div>

          {/* Cards de destaque */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="section-card text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Economia Total</p>
              <p className={`text-xl font-bold ${resultado.economia > 0 ? "text-success" : "text-destructive"}`}>
                R$ {formatCurrency(Math.abs(resultado.economia))}
              </p>
              <p className="text-xs text-muted-foreground">
                {resultado.economia > 0 ? "a favor da holding" : "a favor da PF"}
              </p>
            </div>
            <div className="section-card text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Payback</p>
              <p className="text-xl font-bold">
                {resultado.paybackAnos < 0
                  ? "N/A"
                  : resultado.paybackAnos < 1
                  ? "< 1 ano"
                  : `${resultado.paybackAnos.toFixed(1)} anos`}
              </p>
              <p className="text-xs text-muted-foreground">retorno do investimento</p>
            </div>
            <div className="section-card text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Proteção Patr.</p>
              <p className={`text-xl font-bold ${resultado.protecaoPatrimonial ? "text-success" : "text-muted-foreground"}`}>
                {resultado.protecaoPatrimonial ? "✓ Sim" : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {resultado.protecaoPatrimonial ? "bens protegidos" : "sem credores"}
              </p>
            </div>
            <div className="section-card text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Complexidade</p>
              <p className="text-xl font-bold">Média</p>
              <p className="text-xs text-muted-foreground">adm. societária</p>
            </div>
          </div>

          {/* Gráfico de barras CSS */}
          {chartData.length > 0 && (
            <div className="section-card space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                <TrendingDown className="w-4 h-4" /> Custo Acumulado por Ano
              </h3>
              <div className="flex items-center gap-4 text-xs mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-destructive/60 inline-block" />
                  Sem Holding
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-success/60 inline-block" />
                  Com Holding
                </span>
              </div>
              <div className="space-y-4">
                {chartData.map((d) => (
                  <div key={d.year} className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">Ano {d.year}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs w-20 text-right text-muted-foreground shrink-0">Sem Holding</span>
                      <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                        <div
                          className="h-5 bg-destructive/60 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, (d.sem / chartMax) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs w-28 text-destructive font-medium shrink-0">
                        R$ {formatCurrency(d.sem)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs w-20 text-right text-muted-foreground shrink-0">Com Holding</span>
                      <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                        <div
                          className="h-5 bg-success/60 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, (d.com / chartMax) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs w-28 text-success font-medium shrink-0">
                        R$ {formatCurrency(d.com)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setAba("recomendacao")}
            className="w-full py-3 rounded-xl border-2 border-primary text-primary font-bold text-sm uppercase tracking-wider hover:bg-primary/10 transition-colors"
          >
            Ver Recomendação Jurídica →
          </button>
        </div>
      )}

      {/* ─── ABA RECOMENDAÇÃO ─── */}
      {aba === "recomendacao" && resultado && veredictoConfig && (
        <div className="space-y-5 animate-fade-in">
          {/* Veredicto */}
          <div className={`rounded-xl border-2 p-6 space-y-3 ${veredictoConfig.cls}`}>
            <div className="flex items-center gap-3">
              {veredictoConfig.icon}
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${veredictoConfig.badge}`}>
                {veredictoConfig.label}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{resultado.textoVeredicto}</p>
          </div>

          {/* Fundamentação Legal */}
          <div className="section-card space-y-3">
            <button
              onClick={() => setShowFund((v) => !v)}
              className="w-full flex items-center justify-between font-bold text-sm uppercase tracking-wide"
            >
              <span>📚 Fundamentação Legal</span>
              {showFund
                ? <ChevronUp className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />}
            </button>
            {showFund && (
              <div className="space-y-2 text-sm text-muted-foreground border-t border-border pt-3">
                <p>
                  <span className="font-semibold text-foreground">CC/2002, Art. 981:</span>{" "}
                  Celebram contrato de sociedade as pessoas que reciprocamente se obrigam a contribuir,
                  com bens ou serviços, para o exercício de atividade econômica e a partilha, entre si,
                  dos resultados. (Sociedade Simples)
                </p>
                <p>
                  <span className="font-semibold text-foreground">Lei 6.404/1976:</span>{" "}
                  Dispõe sobre as Sociedades por Ações — regramento para holdings constituídas como S/A,
                  com emissão de ações ordinárias e preferenciais para planejamento sucessório.
                </p>
                <p>
                  <span className="font-semibold text-foreground">CF/88, Art. 156, §2°, I:</span>{" "}
                  O imposto previsto no inciso II (ITBI) não incide sobre a transmissão de bens ou
                  direitos incorporados ao patrimônio de pessoa jurídica em realização de capital.
                </p>
                <p>
                  <span className="font-semibold text-foreground">STJ: Tema 796:</span>{" "}
                  Reconhecida a possibilidade de impenhorabilidade dos bens integrados ao patrimônio
                  de holding familiar constituída com finalidade de administração patrimonial, desde que
                  ausente fraude à execução ou desvio de finalidade.
                </p>
              </div>
            )}
          </div>

          {/* CTA WhatsApp */}
          <div className="section-card space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wide">Próximos Passos</h3>
            <p className="text-sm text-muted-foreground">
              A simulação apresenta estimativas para fins de planejamento. Para constituição da holding,
              é necessária análise jurídico-tributária especializada considerando a legislação estadual
              específica e a avaliação individualizada dos bens.
            </p>
            <button
              onClick={() => setModalWpp(true)}
              className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar Advogado Especialista
            </button>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            ⚠️ <strong>Disclaimer:</strong> Este simulador apresenta estimativas para fins de planejamento.
            Os valores reais dependem da legislação estadual específica, avaliação dos bens e assessoria
            jurídico-tributária especializada. Não constitui opinião jurídica. Consulte um advogado antes
            de tomar qualquer decisão.
          </div>
        </div>
      )}

      {/* ─── MODAL WHATSAPP ─── */}
      {modalWpp && resultado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                Consultar via WhatsApp
              </h2>
              <button onClick={() => setModalWpp(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Uma mensagem com o resumo da sua simulação será encaminhada para o advogado especialista
              via <strong>Advocase.IA</strong>. Revise antes de enviar.
            </p>
            <div className="rounded-lg bg-muted/50 border border-border p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed">
              {decodeURIComponent(wppMsg)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalWpp(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Cancelar
              </button>
              <a
                href={`https://wa.me/?text=${wppMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold text-center hover:bg-green-700 transition-colors"
                onClick={() => setModalWpp(false)}
              >
                Abrir WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
