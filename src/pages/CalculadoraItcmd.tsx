import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ItcmdState, Beneficiario, BemItcmd, FatoGerador, TipoBem, ResidenciaType } from "@/types/inventario";
import { formatCurrency } from "@/lib/partilha-calculator";
import { Calculator, Plus, Trash2, Scale } from "lucide-react";

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

const initialState: ItcmdState = {
  fatoGerador: "doacao",
  nomeDoador: "",
  residenciaDoador: "brasil",
  ufDoador: "SP",
  beneficiarios: [
    { id: crypto.randomUUID(), nome: "Beneficiário 1", percentual: 100, residencia: "brasil", uf: "SP" },
  ],
  bens: [
    { id: crypto.randomUUID(), descricao: "", fracao: 100, natureza: "imovel", localizacao: "brasil", uf: "SP", valor: 0 },
  ],
};

interface ResultadoItcmd {
  totalMonte: number;
  beneficiarios: {
    nome: string;
    percentual: number;
    valor: number;
    itcmd: number;
    ufCompetente: string;
  }[];
  totalItcmd: number;
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

  const calcular = () => {
    const totalMonte = state.bens.reduce((s, b) => s + b.valor * (b.fracao / 100), 0);
    
    // Alíquota simplificada por UF (em produção, usar tabela completa com faixas progressivas)
    const getAliquota = (uf: string): number => {
      const aliquotas: Record<string, number> = {
        SP: 4, RJ: 4, MG: 5, BA: 4, PR: 4, RS: 4, SC: 4,
        PE: 2, CE: 2, GO: 4, DF: 4, ES: 4, MT: 4, MS: 4,
        PA: 4, AM: 2, MA: 2, PB: 4, PI: 4, RN: 4, SE: 4,
        AL: 4, AC: 4, AP: 4, RO: 4, RR: 4, TO: 4,
      };
      return aliquotas[uf] || 4;
    };

    // Determinar UF competente para cada beneficiário
    const beneficiariosResultado = state.beneficiarios.map((ben) => {
      const valor = totalMonte * (ben.percentual / 100);
      
      // Competência: para imóveis, UF do imóvel; para outros, UF do doador/inventariante
      // Simplificação: usar UF do doador por padrão
      const ufCompetente = state.bens.some(b => b.natureza === "imovel") 
        ? state.bens.find(b => b.natureza === "imovel")?.uf || state.ufDoador
        : state.ufDoador;
      
      const aliquota = getAliquota(ufCompetente);
      const itcmd = valor * (aliquota / 100);
      
      return {
        nome: ben.nome,
        percentual: ben.percentual,
        valor,
        itcmd,
        ufCompetente,
      };
    });

    setResultado({
      totalMonte,
      beneficiarios: beneficiariosResultado,
      totalItcmd: beneficiariosResultado.reduce((s, b) => s + b.itcmd, 0),
    });
  };

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
          Análise tributária sobre o <strong>Monte Partilhável</strong>. Cálculo individual por beneficiário
          conforme a LC 227/26 e EC 132/23.
        </p>
      </div>

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
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Valor Total 100% (R$)</Label>
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
          
          <div className="grid grid-cols-2 gap-3">
            <div className="result-card result-card-dark p-3">
              <p className="text-xs uppercase opacity-70">Monte Partilhável</p>
              <p className="text-xl font-bold mt-1">R$ {formatCurrency(resultado.totalMonte)}</p>
            </div>
            <div className="result-card result-card-danger p-3">
              <p className="text-xs uppercase font-semibold text-destructive">Total ITCMD</p>
              <p className="text-xl font-bold text-destructive mt-1">R$ {formatCurrency(resultado.totalItcmd)}</p>
            </div>
          </div>

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
                    <p className="text-sm">Valor: R$ {formatCurrency(b.valor)}</p>
                    <p className="text-sm font-bold text-destructive">ITCMD: R$ {formatCurrency(b.itcmd)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
