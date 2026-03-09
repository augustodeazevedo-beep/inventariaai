import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { DeCujus, RegimeBens } from "@/types/inventario";
import { UserCircle } from "lucide-react";

interface Props {
  data: DeCujus;
  onChange: (data: DeCujus) => void;
}

const regimesOptions: { value: RegimeBens; label: string }[] = [
  { value: "comunhao_parcial", label: "Comunhão Parcial de Bens" },
  { value: "comunhao_universal", label: "Comunhão Universal de Bens" },
  { value: "separacao_total", label: "Separação Total de Bens" },
  { value: "separacao_obrigatoria", label: "Separação Obrigatória" },
  { value: "participacao_final_aquestos", label: "Participação Final nos Aquestos" },
];

const estadoCivilOptions = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
  "União Estável",
];

export function StepDeCujus({ data, onChange }: Props) {
  const update = (partial: Partial<DeCujus>) => onChange({ ...data, ...partial });

  return (
    <div className="section-card animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <UserCircle className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold font-serif">Dados do De Cujus (Falecido)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            placeholder="Nome do falecido"
            value={data.nome}
            onChange={(e) => update({ nome: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dataFalecimento">Data do Falecimento *</Label>
          <Input
            id="dataFalecimento"
            type="date"
            value={data.dataFalecimento}
            onChange={(e) => update({ dataFalecimento: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Estado Civil *</Label>
          <Select value={data.estadoCivil} onValueChange={(v) => update({ estadoCivil: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {estadoCivilOptions.map((ec) => (
                <SelectItem key={ec} value={ec}>{ec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Regime de Bens *</Label>
          <Select value={data.regimeBens} onValueChange={(v) => update({ regimeBens: v as RegimeBens })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {regimesOptions.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-full flex items-center gap-3 pt-2">
          <Switch
            checked={data.possuiConjugeSobrevivente}
            onCheckedChange={(v) => update({ possuiConjugeSobrevivente: v })}
          />
          <Label>Possui cônjuge/companheiro(a) sobrevivente?</Label>
        </div>

        {data.possuiConjugeSobrevivente && (
          <div className="space-y-1.5 animate-fade-in">
            <Label htmlFor="nomeConjuge">Nome do Cônjuge/Companheiro(a)</Label>
            <Input
              id="nomeConjuge"
              placeholder="Nome"
              value={data.nomeConjuge}
              onChange={(e) => update({ nomeConjuge: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
