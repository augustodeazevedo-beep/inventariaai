import { AlertTriangle, FileText } from "lucide-react";
import type { Testamento } from "@/types/inventario";

interface Props {
  data: Testamento;
  onChange: (data: Testamento) => void;
}

export function StepTestamento({ data, onChange }: Props) {
  return (
    <div className="section-card animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold font-serif">Testamento e Disposições de Última Vontade</h2>
      </div>

      <div className="space-y-4">
        <div>
          <p className="font-medium mb-3">Existe testamento? *</p>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              onClick={() => onChange({ ...data, existeTestamento: true })}
              className={`py-3 rounded-lg border-2 font-medium transition-all ${
                data.existeTestamento
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              Sim
            </button>
            <button
              onClick={() => onChange({ ...data, existeTestamento: false })}
              className={`py-3 rounded-lg border-2 font-medium transition-all ${
                !data.existeTestamento
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              Não
            </button>
          </div>
        </div>

        {!data.existeTestamento && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Atenção:</p>
              <p className="text-sm text-muted-foreground">
                Havendo herdeiros necessários (descendentes, ascendentes ou cônjuge), a legítima
                corresponde a 50% do patrimônio líquido, não podendo ser objeto de testamento.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
