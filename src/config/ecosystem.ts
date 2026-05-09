import { Scale, FileText, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type EcosystemAppId = "inventaria" | "peticiona" | "advoga";

export interface EcosystemApp {
  id: EcosystemAppId;
  name: string;
  suffix: string;
  description: string;
  url: string;
  icon: LucideIcon;
  accent: string; // tailwind text color class
}

export const CURRENT_APP_ID: EcosystemAppId = "inventaria";

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    id: "inventaria",
    name: "Inventaria",
    suffix: ".AI",
    description: "Planejamento patrimonial e sucessório",
    url: "https://inventariaai.lovable.app",
    icon: Scale,
    accent: "text-primary",
  },
  {
    id: "peticiona",
    name: "Peticiona",
    suffix: ".AI",
    description: "Petições, minutas e contratos",
    url: "https://peticionaai-byadvocacyai.lovable.app",
    icon: FileText,
    accent: "text-primary",
  },
  {
    id: "advoga",
    name: "Advoga",
    suffix: ".AI",
    description: "Gestão de processos e escritório",
    url: "https://advogaai-byadvocacy.lovable.app",
    icon: Briefcase,
    accent: "text-primary",
  },
];