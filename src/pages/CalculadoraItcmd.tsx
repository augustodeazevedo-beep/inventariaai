import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ItcmdState, Beneficiario, BemItcmd, FatoGerador, TipoBem, ResidenciaType } from "@/types/inventario";
import { formatCurrency } from "@/lib/partilha-calculator";
import { Calculator, Trash2, Scale, AlertTriangle } from "lucide-react";

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const tipoOptions: { value: TipoBem; label: string }[] = [
  { value: "imovel", label: "Imóvel" },
  { value: "veiculo", label: "Veículo" },
  { value: "conta_bancaria", label: "Conta Bancária" },
  { value: "investimento", label: "Investimento" },
  { value: "acoes", label: "Ações" },
  { value: "outros", label: "Outros" },
];

// LC 227/2026 — each bracket taxes only the portion within it
function calcularProgressivo(base: number): number {
  if (base <= 0) return 0;
  const brackets = [
    { ate: 10_000, aliquota: 0.02 },
    { ate: 20_000, aliquota: 0.04 },
    { ate: 40_000, aliquota: 0.06 },
    { ate: Infinity, aliquota: 0.08 },
  ];
  let total = 0;
  let anterior = 0;
  for (const b of brackets) {
    if (base <= anterior) break;
    const tranche = Math.min(base, b.ate === Infinity ? base : b.ate) - anterior;
    total += tranche * b.aliquota;
    anterior = b.ate === Infinity ? base : b.ate;
  }
  return total;
}

// Marginal ITCMD considering donations already made in the last 12 months
function calcularComAcumulado(valor: number, acumulado: number): { itcmd: number; aliquotaEfetiva: number } {
  const itcmd = calcularProgressivo(acumulado + valor) - calcularProgressivo(acumulado);
  return { itcmd, aliquotaEfetiva: valor > 0 ? (itcmd / valor) * 100 : 0 };
}

const initialState: ItcmdState = {
  fatoGerador: "doacao",
  nomeDoador: "",
  residenciaDoador: "brasil",
  ufDoador: "SP",
  doacoesAcumuladas12m: 0,
  beneficiarios: [
    { id: crypto.randomUUID(), nome: "Beneficiário 1", percentual: 100, residencia: "brasil", uf: "SP" },
  ],
  bens: [
    { id: crypto.randomUUID(), descricao: "", fracao: 100, natureza: "imovel", localizacao: "brasil", uf: "SP", valor: 0 },
  ],
};

interface ResultadoBenef {
  nome: string;
  percentual: number;
  valor: number;
  itcmd: number;
  aliquotaEfetiva: number;
  ufCompetente: string;
}

interface ResultadoItcmd {
  totalMonte: number;
  acumulado: number;
  beneficiarios: ResultadoBenef[];
  totalItcmd: number;
  temRS: boolean;
}

export default function CalculadoraItcmd() {
  const [state, setState] = useState<ItcmdState>(initialState);
  const [resultado, setResultado] = useState<ResultadoItcmd | null>(null);

  const update = (partial: Partial<ItcmdState>) => setState((s) => ({ ...s, ...partial }));

  const addBeneficiario = () => {
    update({
      beneficiarios: [
        ...state.beneficiarios,
        { id: crypto.randomUUID(), nome: "", percentual: 0, residencia: "brasil", uf: "SP" },
      ],
    });
  };

  const removeBeneficiario = (id: string) => {
    update({ beneficiarios: state.beneficiarios.filter((b) => b.id !== id) });
  };

  const updateBeneficiario = (id: string, partial: Partial<Beneficiario>) => {
    update({ beneficiarios: state.beneficiarios.map((b) => (b.id === id ? { ...b, ...partial } : b)) });
  };

  const addBem = () => {
    update({
      bens: [
        ...state.bens,
        { id: crypto.randomUUID(), descricao: "", fracao: 100, natureza: "imovel", localizacao: "brasil", uf: "SP", valor: 0 },
      ],
    });
  };

  const removeBem = (id: string) => {
    update({ bens: state.bens.filter((b) => b.id !== id) });
  };

  const updateBem = (id: string, partial: Partial<BemItcmd>) => {
    update({ bens: state.bens.map((b) => (b.id === id ? { ...b, ...partial } : b)) });
  };

  const totalPercentual = state.beneficiarios.reduce((s, b) => s + b.percentual, 0);

  // Reactive RS detection — triggers alert before calculation
  const temRsNoForm =
    state.ufDoador === "RS" ||
    state.beneficiarios.some((b) => b.uf === "RS") ||
    state.bens.some((b) => b.uf === "RS");

  const calcular = () => {
    const totalMonte = state.bens.reduce((s, b) => s + b.valor * (b.fracao / 100), 0);
    const acumulado = state.doacoesAcumuladas12m ?? 0;

    const ufImovPrincipal = state.bens.find((b) => b.natureza === "imovel")?.uf;

    const beneficiariosResultado: ResultadoBenef[] = state.beneficiarios.map((ben) => {
      const valor = totalMonte * (ben.percentual / 100);
      const ufCompetente = ufImovPrincipal ?? state.ufDoador;
      const { itcmd, aliquotaEfetiva } = calcularComAcumulado(valor, acumulado);
      return { nome: ben.nome, percentual: ben.percentual, valor, itcmd, aliquotaEfetiva, ufCompetente };
    });

    setResultado({
      totalMonte,
      acumulado,
      beneficiarios: beneficiariosResultado,
      totalItcmd: beneficiariosResultado.reduce((s, b) => s + b.itcmd, 0),
      temRS: beneficiariosResultado.some((b) => b.ufCompetente === "RS"),
    });
  };

  const alertRS = (
    <div className="flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
      <AlertTriangle className="w-5 h-5 shrink-0 text-warning mt-0.5" />
      <p>
        <strong>Rio Grande do Sul:</strong> Lei estadual 8.821/1989 ainda não adaptada à LC 227/2026.
        Exibindo alíquotas federais mínimas. Acompanhe a legislação estadual.
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="itcmd-header">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-info/20 text-info-foreground border border-info/30 mb-3">
          RULE ENGINE ESPECIALIZADO V4.2
        </span>
        <h1 className="font-serif text-3xl font-bold text-header-foreground">
          Simulador Jurídico <span className="text-info">ITCMD 2026</span>
        </h1>
        <p className="text-sm text-header-foreground/70 mt-2">
          Análise tributária sobre o <strong>Monte Partilhável</strong> pelo <strong>valor de mercado</strong>.
          Cálculo individual por beneficiário conforme a <strong>LC 227/2026</strong> e EC 132/23.
        </p>
      </div>

      {/* RS alert — reactive to form input */}
      {temRsNoForm && alertRS}

      {/* Fato Gerador */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-info" />
          <h2 className="font-bold uppercase">Fato Gerador</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 max-w-md mb-4">
          <button
            onClick={() => update({ fatoGerador: "doacao" })}
            className={`py-3 rounded-lg border-2 font-semibold text-sm uppercase tracking-wide transition-all ${
              state.fatoGerador === "doacao" ? "border-info bg-info/10 text-info" : "border-border"
            }`}
          >
            Doação
          </button>
          <button
            onClick={() => update({ fatoGerador: "causa_mortis" })}
            className={`py-3 rounded-lg border-2 font-semibold text-sm uppercase tracking-wide transition-all ${
              state.fatoGerador === "causa_mortis" ? "border-info bg-info/10 text-info" : "border-border"
            }`}
          >
            Causa Mortis
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 md:col-span-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              {state.fatoGerador === "doacao" ? "Doador" : "De Cujus (Inventariado)"}
            </Label>
            <Select value={state.residenciaDoador} onValueChange={(v) => update({ residenciaDoador: v as ResidenciaType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="brasil">Residente no Brasil</SelectItem>
                <SelectItem value="exterior">Residente no Exterior</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">UF</Label>
            <Select value={state.ufDoador} onValueChange={(v) => update({ ufDoador: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {UF_LIST.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Accumulated donations — only relevant for doação */}
        {state.fatoGerador === "doacao" && (
          <div className="mt-4 space-y-1.5 max-w-sm">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Doações anteriores (últimos 12 meses) — mesmo doador (R$)
            </Label>
            <Input
              type="number"
              min={0}
              value={state.doacoesAcumuladas12m || ""}
              onChange={(e) => update({ doacoesAcumuladas12m: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Base acumulada para a faixa progressiva — LC 227/2026 agrega doações dos últimos 12 meses.
            </p>
          </div>
        )}
      </div>

      {/* Beneficiários */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold uppercase flex items-center gap-2">
            👥 {state.fatoGerador === "doacao" ? "Donatários" : "Herdeiros / Legatários"}
          </h2>
          <button onClick={addBeneficiario} className="text-sm text-info font-semibold hover:underline">
            + ADICIONAR
          </button>
        </div>
        <div className="space-y-3">
          {state.beneficiarios.map((ben) => (
            <div key={ben.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-1.5">
                  <Input
                    value={ben.nome}
                    onChange={(e) => updateBeneficiario(ben.id, { nome: e.target.value })}
                    placeholder="Nome do beneficiário"
                  />
                </div>
                <div className="w-20 space-y-1.5">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={ben.percentual}
                      onChange={(e) => updateBeneficiario(ben.id, { percentual: parseFloat(e.target.value) || 0 })}
                      className="text-center"
                    />
                    <span className="ml-1 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                {state.beneficiarios.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeBeneficiario(ben.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={ben.residencia} onValueChange={(v) => updateBeneficiario(ben.id, { residencia: v as ResidenciaType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brasil">Resid. Brasil</SelectItem>
                    <SelectItem value="exterior">Resid. Exterior</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ben.uf} onValueChange={(v) => updateBeneficiario(ben.id, { uf: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UF_LIST.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>Total beneficiários: {state.beneficiarios.length}</span>
          <span className={totalPercentual === 100 ? "text-success font-semibold" : "text-destructive font-semibold"}>
            Percentual Total: {totalPercentual}%
          </span>
        </div>
      </div>

      {/* Monte Partilhável */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold uppercase flex items-center gap-2">
            🏛️ Monte Partilhável (Acervo)
          </h2>
          <button onClick={addBem} className="text-sm text-info font-semibold hover:underline">
            + Adicionar Bem
          </button>
        </div>
        <div className="space-y-4">
          {state.bens.map((bem) => (
            <div key={bem.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="space-y-1.5 md:col-span-1">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Descrição do Bem</Label>
                  <Input
                    placeholder="Ex: Ações, Imóvel, Veículo..."
                    value={bem.descricao}
                    onChange={(e) => updateBem(bem.id, { descricao: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fração (%)</Label>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={bem.fracao}
                      onChange={(e) => updateBem(bem.id, { fracao: parseFloat(e.target.value) || 0 })}
                      className="text-center"
                    />
                    <span className="ml-1 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Natureza</Label>
                  <Select value={bem.natureza} onValueChange={(v) => updateBem(bem.id, { natureza: v as TipoBem })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tipoOptions.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Localização</Label>
                  <Select value={bem.localizacao} onValueChange={(v) => updateBem(bem.id, { localizacao: v as ResidenciaType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brasil">Brasil</SelectItem>
                      <SelectItem value="exterior">Exterior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">UF</Label>
                  <Select value={bem.uf} onValueChange={(v) => updateBem(bem.id, { uf: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UF_LIST.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-end gap-3 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Valor de Mercado — 100% (R$)
                  </Label>
                  <Input
                    type="number"
                    value={bem.valor || ""}
                    onChange={(e) => updateBem(bem.id, { valor: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                {state.bens.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeBem(bem.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calcular */}
      <button
        onClick={calcular}
        className="w-full py-4 rounded-xl bg-info text-info-foreground font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-info/90 transition-colors"
      >
        <Calculator className="w-5 h-5" />
        Calcular Partilha e Competência Tributária
      </button>

      {/* Resultado */}
      {resultado && (
        <div className="section-card animate-fade-in space-y-4">
          <h2 className="font-serif text-xl font-bold">Resultado do Cálculo ITCMD</h2>

          {resultado.temRS && alertRS}

          <div className="grid grid-cols-2 gap-3">
            <div className="result-card result-card-dark p-3">
              <p className="text-xs uppercase opacity-70">Monte Partilhável (Mercado)</p>
              <p className="text-xl font-bold mt-1">R$ {formatCurrency(resultado.totalMonte)}</p>
            </div>
            <div className="result-card result-card-danger p-3">
              <p className="text-xs uppercase font-semibold text-destructive">Total ITCMD</p>
              <p className="text-xl font-bold text-destructive mt-1">R$ {formatCurrency(resultado.totalItcmd)}</p>
            </div>
          </div>

          {resultado.acumulado > 0 && (
            <div className="rounded-lg border border-info/30 bg-info/5 px-4 py-3 text-sm">
              <span className="font-semibold">Base acumulada (12 meses):</span>{" "}
              R$ {formatCurrency(resultado.acumulado)} — faixas progressivas aplicadas a partir desse valor.
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-bold text-sm uppercase">Detalhamento por Beneficiário</h3>
            {resultado.beneficiarios.map((b, i) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{b.nome}</p>
                    <p className="text-xs text-muted-foreground">{b.percentual}% — UF Competente: {b.ufCompetente}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Valor (mercado): R$ {formatCurrency(b.valor)}</p>
                    <p className="text-sm font-bold text-destructive">ITCMD: R$ {formatCurrency(b.itcmd)}</p>
                    <p className="text-xs text-muted-foreground">
                      Alíquota efetiva: {b.aliquotaEfetiva.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Fundamentação — LC 227/2026</p>
            <p>Alíquotas progressivas: até R$10.000 → 2% | R$10.001–R$20.000 → 4% | R$20.001–R$40.000 → 6% | acima de R$40.000 → 8% (teto federal).</p>
            <p>Cada faixa incide apenas sobre o valor dentro dela. Base de cálculo: valor de mercado (não valor venal). Doações do mesmo doador nos últimos 12 meses são agregadas para fins de progressividade (art. 7º, LC 227/2026).</p>
            <p className="italic">Simulação técnica. Não substitui assessoria jurídica especializada.</p>
          </div>
        </div>
      )}
    </div>
  );
}
