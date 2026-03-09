import { Check } from "lucide-react";

interface Step {
  label: string;
  number: number;
}

const steps: Step[] = [
  { label: "De Cujus", number: 1 },
  { label: "Herdeiros", number: 2 },
  { label: "Testamento", number: 3 },
  { label: "Bens", number: 4 },
  { label: "Preferências", number: 5 },
  { label: "Resultado", number: 6 },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap py-4">
      {steps.map((step, i) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <div key={step.number} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`step-badge ${
                  isCompleted
                    ? "step-badge-completed"
                    : isActive
                    ? "step-badge-active"
                    : "step-badge-inactive"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </span>
              <span
                className={`text-sm font-medium ${
                  isActive
                    ? "text-foreground"
                    : isCompleted
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-6 h-px bg-border hidden sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}
