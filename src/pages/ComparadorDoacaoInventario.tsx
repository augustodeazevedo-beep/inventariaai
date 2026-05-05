import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, calcularItcmdProgressivo, calcularItcmdMarginal } from "@/lib/partilha-calculator";
import { ArrowLeftRight, CheckCircle2, Clock, TrendingDown, Info } from "lucide-react";

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface FormData {
  patrimonio: number;
  numHerdeiros: number;
  uf: string;
  acumulado12m: number;
}

interface Cenario {
  itcmd: number;
  custasMin: number;
  custasMax: number;
  honorarios: number;
  escritura: number;
  total: number;
  prazo: string;
}

function calcularCenarios(f: FormData): { inventario: Cenario; doacao: Cenario } {
  const n = Math.max(1, f.numHerdeiros);
  const p = Math.max(0, f.patrimonio);
  const porHerdeiro = p / n;

  // Inventário: progressive per heir, no prior-donation base (causa mortis resets)
  const itcmdInv = calcularItcmdProgressivo(porHerdeiro) * n;
  const custasMin = p * 0.02;
  const custasMax = p * 0.04;
  const custasMedia = p * 0.03;
  const honorarios = p * 0.10;

  // Doação em vida: marginal rate factoring in 12-month accumulated base
  const acumPorHerd = Math.max(0, f.acumulado12m) / n;
  const itcmdDoac = calcularItcmdMarginal(porHerdeiro, acumPorHerd) * n;
  const escritura = p * 0.015;

  return {
    inventario: {
      itcmd: itcmdInv,
      custasMin,
      custasMax,
      honorarios,
      escritura: 0,
      total: itcmdInv + custasMedia + honorarios,
      prazo: "12 a 36 meses",
    },
    doacao: {
      itcmd: itcmdDoac,
      custasMin: 0,
      custasMax: 0,
      honorarios: 0,
      escritura,
      total: itcmdDoac + escritura,
      prazo: "Imediato (dias a semanas)",
    },
  };
}

const initialForm: FormData = { patrimonio: 0, numHerdeiros: 1, uf: "SP", acumulado12m: 0 };

export default function ComparadorDoacaoInventario() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [resultado, setResultado] = useState<{ inventario: Cenario; doacao: Cenario } | null>(null);

  const set = (partial: Partial<FormData>) => setForm((f) => ({ ...f, ...partial }));

  const comparar = () => {
    if (form.patrimonio <= 0) return;
    setResultado(calcularCenarios(form));
  };

  const vencedor: "inventario" | "doacao" | null = resultado
    ? resultado.doacao.total <= resultado.inventario.total ? "doacao" : "inventario"
    : null;

  const economia = resultado ? Math.abs(resultado.inventario.total - resultado.doacao.total) : 0;
  const pctEconomia = resultado && resultado.inventario.total > 0
    ? (economia / resultado.inventario.total) * 100
    : 0;

  const recomendacao = (() => {
    if (!resultado || !vencedor) return "";
    if (vencedor === "doacao") {
      return `A doação em vida é ${pctEconomia.toFixed(1)}% mais econômica neste cenário. ` +
        `Considere fracionar as transferências ao longo de 12 meses para otimizar as faixas progressivas da LC 227/2026 ` +
        `e reduzir ainda mais a carga tributária.`;
    }
    return `O inventário apresenta custo total estimado menor neste cenário. ` +
      `Avalie com seu advogado os custos processuais específicos da UF ${form.uf} e a viabilidade da doação parcelada ` +
      `para manter o patrimônio sob controle até o planejamento estar completo.`;
  })();

  const cardStyle = (lado: "inventario" | "doacao") =>
    vencedor === lado
      ? "border-2 border-success bg-success/5"
      : "border border-border bg-muted/20";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="itcmd-header">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-info/20 text-info-foreground border border-info/30 mb-3">
          PLANEJAMENTO SUCESSÓRIO
        </span>
        <h1 className="font-serif text-3xl font-bold text-header-foreground flex items-center gap-3">
          <ArrowLeftRight className="w-7 h-7 text-info" />
          Comparador: Doação <span className="text-info">×</span> Inventário
        </h1>
        <p className="text-sm text-header-foreground/70 mt-2">
          Compare o custo total estimado de cada estratégia e identifique a mais vantajosa
          para o seu patrimônio — alíquotas progressivas <strong>LC 227/2026</strong>.
        </p>
      </div>

      {/* Form */}
      <div className="section-card space-y-5">
        <h2 className="font-bold uppercase text-sm flex items-center gap-2">
          📋 Dados do Patrimônio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Valor total do patrimônio (R$)
            </Label>
            <Input
              type="number"
              min={0}
              value={form.patrimonio || ""}
              onChange={(e) => set({ patrimonio: parseFloat(e.target.value) || 0 })}
              placeholder="Ex: 500000"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Número de herdeiros / donatários
            </Label>
            <Input
              type="number"
              min={1}
              value={form.numHerdeiros}
              onChange={(e) => set({ numHerdeiros: Math.max(1, parseInt(e.target.value) || 1) })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">UF</Label>
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
              Doações anteriores — últimos 12 meses (R$)
            </Label>
            <Input
              type="number"
              min={0}
              value={form.acumulado12m || ""}
              onChange={(e) => set({ acumulado12m: parseFloat(e.target.value) || 0 })}
              placeholder="0 se nenhuma"
            />
            <p className="text-xs text-muted-foreground">
              Total já doado pelo mesmo doador nos últimos 12 meses (agrega para a faixa progressiva).
            </p>
          </div>
        </div>

        <button
          onClick={comparar}
          disabled={form.patrimonio <= 0}
          className="w-full py-4 rounded-xl bg-info text-info-foreground font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-info/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeftRight className="w-5 h-5" />
          Comparar Estratégias
        </button>
      </div>

      {/* Results */}
      {resultado && vencedor && (
        <div className="space-y-4 animate-fade-in">
          {/* Side-by-side cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inventário */}
            <div className={`rounded-xl p-5 space-y-4 ${cardStyle("inventario")}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg">Inventário</h3>
                {vencedor === "inventario" && (
                  <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 border border-success/30 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mais Vantajoso
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ITCMD (LC 227/2026)</span>
                  <span className="font-medium text-destructive">R$ {formatCurrency(resultado.inventario.itcmd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Custas judiciais (2–4%)
                  </span>
                  <span className="font-medium text-destructive">
                    R$ {formatCurrency(resultado.inventario.custasMin)}–{formatCurrency(resultado.inventario.custasMax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Honorários (ref. OAB 10%)</span>
                  <span className="font-medium text-destructive">R$ {formatCurrency(resultado.inventario.honorarios)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total estimado</span>
                  <span>R$ {formatCurrency(resultado.inventario.total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Prazo: {resultado.inventario.prazo}</span>
              </div>
            </div>

            {/* Doação em vida */}
            <div className={`rounded-xl p-5 space-y-4 ${cardStyle("doacao")}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg">Doação em Vida</h3>
                {vencedor === "doacao" && (
                  <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 border border-success/30 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mais Vantajoso
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ITCMD (LC 227/2026)</span>
                  <span className="font-medium text-destructive">R$ {formatCurrency(resultado.doacao.itcmd)}</span>
                </div>
                {form.acumulado12m > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Base acumulada (12 m)</span>
                    <span className="text-muted-foreground">R$ {formatCurrency(form.acumulado12m)} considerados</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escritura pública (1,5%)</span>
                  <span className="font-medium text-destructive">R$ {formatCurrency(resultado.doacao.escritura)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total estimado</span>
                  <span>R$ {formatCurrency(resultado.doacao.total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Prazo: {resultado.doacao.prazo}</span>
              </div>
            </div>
          </div>

          {/* Savings highlight */}
          <div className="section-card flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <TrendingDown className="w-8 h-8 text-success shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Economia estimada com {vencedor === "doacao" ? "doação em vida" : "inventário"}
                </p>
                <p className="text-2xl font-bold text-success">
                  R$ {formatCurrency(economia)}
                  <span className="text-base font-normal text-muted-foreground ml-2">
                    ({pctEconomia.toFixed(1)}% menos)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="section-card space-y-2">
            <h3 className="font-bold text-sm uppercase">Recomendação</h3>
            <p className="text-sm leading-relaxed">{recomendacao}</p>
          </div>

          {/* ITCMD breakdown note */}
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Metodologia do Cálculo
            </p>
            <p>
              <strong>ITCMD:</strong> alíquotas progressivas LC 227/2026 — até R$10.000: 2% | R$10.001–R$20.000: 4% |
              R$20.001–R$40.000: 6% | acima de R$40.000: 8% (teto federal). Calculado individualmente por herdeiro sobre
              o quinhão proporcional.
            </p>
            <p>
              <strong>Inventário:</strong> custas judiciais estimadas entre 2% e 4% do monte (midpoint 3% no total);
              honorários com referência à tabela OAB (10%) — valor pode variar conforme negociação e UF {form.uf}.
            </p>
            <p>
              <strong>Doação:</strong> emolumentos de escritura pública estimados em 1,5% do valor transmitido;
              podem variar por estado e cartório.
            </p>
            <p className="italic font-medium text-muted-foreground">
              ⚠️ Esta simulação é uma estimativa. Consulte um advogado para análise do seu caso.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
