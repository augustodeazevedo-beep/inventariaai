import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Herdeiro, ParentescoHerdeiro } from "@/types/inventario";
import { Plus, Trash2, Users } from "lucide-react";

interface Props {
  herdeiros: Herdeiro[];
  onChange: (herdeiros: Herdeiro[]) => void;
}

const parentescoOptions: { value: ParentescoHerdeiro; label: string }[] = [
  { value: "conjuge", label: "Cônjuge" },
  { value: "companheiro", label: "Companheiro(a)" },
  { value: "filho", label: "Filho(a)" },
  { value: "neto", label: "Neto(a)" },
  { value: "pai", label: "Pai" },
  { value: "mae", label: "Mãe" },
  { value: "avo", label: "Avô/Avó" },
  { value: "irmao", label: "Irmão/Irmã" },
  { value: "sobrinho", label: "Sobrinho(a)" },
  { value: "tio", label: "Tio(a)" },
  { value: "outro", label: "Outro" },
];

export function StepHerdeiros({ herdeiros, onChange }: Props) {
  const addHerdeiro = () => {
    onChange([
      ...herdeiros,
      {
        id: crypto.randomUUID(),
        nome: "",
        parentesco: "filho",
        concorre: true,
      },
    ]);
  };

  const removeHerdeiro = (id: string) => {
    onChange(herdeiros.filter((h) => h.id !== id));
  };

  const updateHerdeiro = (id: string, partial: Partial<Herdeiro>) => {
    onChange(herdeiros.map((h) => (h.id === id ? { ...h, ...partial } : h)));
  };

  return (
    <div className="section-card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold font-serif">Herdeiros</h2>
        </div>
        <Button onClick={addHerdeiro} size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
          <Plus className="w-4 h-4 mr-1" /> Adicionar Herdeiro
        </Button>
      </div>

      {herdeiros.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Nenhum herdeiro adicionado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {herdeiros.map((h) => (
            <div
              key={h.id}
              className="border rounded-lg p-4 bg-secondary/30 animate-fade-in"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <Label>Nome *</Label>
                  <Input
                    placeholder="Nome do herdeiro"
                    value={h.nome}
                    onChange={(e) => updateHerdeiro(h.id, { nome: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Parentesco *</Label>
                  <Select
                    value={h.parentesco}
                    onValueChange={(v) => updateHerdeiro(h.id, { parentesco: v as ParentescoHerdeiro })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {parentescoOptions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={h.concorre}
                      onCheckedChange={(v) => updateHerdeiro(h.id, { concorre: v })}
                    />
                    <Label className="text-sm">Concorre</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHerdeiro(h.id)}
                    className="text-destructive hover:text-destructive"
                    aria-label="Excluir herdeiro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
