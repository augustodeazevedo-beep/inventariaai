import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Preferencias } from "@/types/inventario";
import { Settings } from "lucide-react";

interface Props {
  data: Preferencias;
  onChange: (data: Preferencias) => void;
}

export function StepPreferencias({ data, onChange }: Props) {
  const update = (partial: Partial<Preferencias>) => onChange({ ...data, ...partial });

  return (
    <div className="section-card animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold font-serif">Preferências de Cálculo</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label>Tipo de Divisão</Label>
          <Select
            value={data.tipoDivisao}
            onValueChange={(v) => update({ tipoDivisao: v as "igualitaria" | "personalizada" })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="igualitaria">Divisão Igualitária (Quinhões)</SelectItem>
              <SelectItem value="personalizada">Divisão Personalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Simular ITCMD?</Label>
            <Switch
              checked={data.simularItcmd}
              onCheckedChange={(v) => update({ simularItcmd: v })}
            />
          </div>

          {data.simularItcmd && (
            <div className="space-y-1.5 animate-fade-in">
              <Label>Alíquota do ITCMD (%)</Label>
              <Input
                type="number"
                value={data.aliquotaItcmd}
                onChange={(e) => update({ aliquotaItcmd: parseFloat(e.target.value) || 0 })}
                min={0}
                max={8}
                step={0.5}
              />
              <p className="text-xs text-muted-foreground">A alíquota varia por estado (máx 8%).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
