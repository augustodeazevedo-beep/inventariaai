import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Bem, TipoBem, FormaAquisicao } from "@/types/inventario";
import { FolderOpen, Plus, Trash2 } from "lucide-react";

interface Props {
  bens: Bem[];
  dividas: number;
  onChange: (bens: Bem[], dividas: number) => void;
}

const tipoOptions: { value: TipoBem; label: string }[] = [
  { value: "imovel", label: "Imóvel" },
  { value: "veiculo", label: "Veículo" },
  { value: "conta_bancaria", label: "Conta Bancária" },
  { value: "investimento", label: "Investimento" },
  { value: "acoes", label: "Ações" },
  { value: "outros", label: "Outros" },
];

const formaOptions: { value: FormaAquisicao; label: string }[] = [
  { value: "compra_onerosa", label: "Compra Onerosa" },
  { value: "doacao", label: "Doação" },
  { value: "heranca", label: "Herança" },
  { value: "usucapiao", label: "Usucapião" },
  { value: "outros", label: "Outros" },
];

export function StepBens({ bens, dividas, onChange }: Props) {
  const addBem = () => {
    onChange(
      [
        ...bens,
        {
          id: crypto.randomUUID(),
          descricao: "",
          tipo: "imovel",
          valorEstimado: 0,
          formaAquisicao: "compra_onerosa",
          emNomeDe: "Falecido",
          adquiridoNaConstancia: false,
          dataAquisicao: "",
        },
      ],
      dividas
    );
  };

  const removeBem = (id: string) => {
    onChange(bens.filter((b) => b.id !== id), dividas);
  };

  const updateBem = (id: string, partial: Partial<Bem>) => {
    onChange(bens.map((b) => (b.id === id ? { ...b, ...partial } : b)), dividas);
  };

  return (
    <div className="section-card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold font-serif">Relação de Bens e Dívidas</h2>
        </div>
        <Button onClick={addBem} size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
          <Plus className="w-4 h-4 mr-1" /> Adicionar Bem
        </Button>
      </div>

      {bens.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Nenhum bem adicionado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bens.map((bem) => (
            <div key={bem.id} className="border rounded-lg p-4 bg-secondary/30 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Descrição (opcional)</Label>
                  <Input
                    placeholder="Ex: Apartamento em Santos"
                    value={bem.descricao}
                    onChange={(e) => updateBem(bem.id, { descricao: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo do Bem</Label>
                  <Select value={bem.tipo} onValueChange={(v) => updateBem(bem.id, { tipo: v as TipoBem })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tipoOptions.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Valor Estimado *</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={bem.valorEstimado || ""}
                    onChange={(e) => updateBem(bem.id, { valorEstimado: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Forma de Aquisição *</Label>
                  <Select value={bem.formaAquisicao} onValueChange={(v) => updateBem(bem.id, { formaAquisicao: v as FormaAquisicao })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {formaOptions.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Está em Nome de *</Label>
                  <Select value={bem.emNomeDe} onValueChange={(v) => updateBem(bem.id, { emNomeDe: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Falecido">Falecido</SelectItem>
                      <SelectItem value="Cônjuge">Cônjuge</SelectItem>
                      <SelectItem value="Ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Adquirido na Constância? *</Label>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => updateBem(bem.id, { adquiridoNaConstancia: true })}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-all ${
                        bem.adquiridoNaConstancia ? "bg-success text-success-foreground border-success" : "border-border"
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => updateBem(bem.id, { adquiridoNaConstancia: false })}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-all ${
                        !bem.adquiridoNaConstancia ? "bg-destructive text-destructive-foreground border-destructive" : "border-border"
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button variant="ghost" size="icon" onClick={() => removeBem(bem.id)} className="text-destructive hover:text-destructive" aria-label="Excluir bem">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="dividas" className="font-semibold">Total de Dívidas do Espólio (R$)</Label>
          <Input
            id="dividas"
            type="number"
            placeholder="0,00"
            value={dividas || ""}
            onChange={(e) => onChange(bens, parseFloat(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">As dívidas são subtraídas do Monte-Mor antes da partilha.</p>
        </div>
      </div>
    </div>
  );
}
