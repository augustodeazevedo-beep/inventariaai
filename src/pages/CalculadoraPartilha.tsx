import { useState } from "react";
import { StepIndicator } from "@/components/partilha/StepIndicator";
import { StepDeCujus } from "@/components/partilha/StepDeCujus";
import { StepHerdeiros } from "@/components/partilha/StepHerdeiros";
import { StepTestamento } from "@/components/partilha/StepTestamento";
import { StepBens } from "@/components/partilha/StepBens";
import { StepPreferencias } from "@/components/partilha/StepPreferencias";
import { StepResultado } from "@/components/partilha/StepResultado";
import { calcularPartilha } from "@/lib/partilha-calculator";
import type { PartilhaState } from "@/types/inventario";
import { ChevronLeft, ChevronRight } from "lucide-react";

const initialState: PartilhaState = {
  currentStep: 1,
  deCujus: {
    nome: "",
    dataFalecimento: "",
    estadoCivil: "Casado(a)",
    regimeBens: "comunhao_parcial",
    possuiConjugeSobrevivente: false,
    nomeConjuge: "",
  },
  herdeiros: [],
  testamento: {
    existeTestamento: false,
    percentualDisponivel: 50,
    beneficiarios: [],
  },
  bens: [],
  dividas: 0,
  preferencias: {
    tipoDivisao: "igualitaria",
    simularItcmd: true,
    aliquotaItcmd: 4,
  },
  resultado: null,
};

export default function CalculadoraPartilha() {
  const [state, setState] = useState<PartilhaState>(initialState);

  const goNext = () => {
    if (state.currentStep === 5) {
      const resultado = calcularPartilha(state);
      setState((s) => ({ ...s, currentStep: 6, resultado }));
    } else {
      setState((s) => ({ ...s, currentStep: Math.min(s.currentStep + 1, 6) }));
    }
  };

  const goBack = () => {
    setState((s) => ({ ...s, currentStep: Math.max(s.currentStep - 1, 1) }));
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <StepDeCujus
            data={state.deCujus}
            onChange={(deCujus) => setState((s) => ({ ...s, deCujus }))}
          />
        );
      case 2:
        return (
          <StepHerdeiros
            herdeiros={state.herdeiros}
            onChange={(herdeiros) => setState((s) => ({ ...s, herdeiros }))}
          />
        );
      case 3:
        return (
          <StepTestamento
            data={state.testamento}
            onChange={(testamento) => setState((s) => ({ ...s, testamento }))}
          />
        );
      case 4:
        return (
          <StepBens
            bens={state.bens}
            dividas={state.dividas}
            onChange={(bens, dividas) => setState((s) => ({ ...s, bens, dividas }))}
          />
        );
      case 5:
        return (
          <StepPreferencias
            data={state.preferencias}
            onChange={(preferencias) => setState((s) => ({ ...s, preferencias }))}
          />
        );
      case 6:
        return state.resultado ? <StepResultado resultado={state.resultado} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="sr-only">Calculadora de Partilha — Inventaria.AI</h1>
      <StepIndicator currentStep={state.currentStep} />
      <div className="mt-4">{renderStep()}</div>
      <div className="flex items-center justify-between mt-6">
        {state.currentStep > 1 ? (
          <button onClick={goBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
        ) : (
          <div />
        )}
        {state.currentStep < 6 && (
          <button onClick={goNext} className="gold-button flex items-center gap-1">
            Próximo Passo <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
