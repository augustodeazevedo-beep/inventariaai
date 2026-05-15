import { Scale, FileText, Briefcase, Target, Wallet, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type EcosystemAppId = "advocase" | "advoga" | "peticiona" | "inventaria" | "fin" | "study";

export interface EcosystemApp {
  id: EcosystemAppId;
  name: string;
  suffix: string;
  description: string;
  chip: string;
  url: string;
  icon: LucideIcon;
  accent: string; // tailwind text color class
}

export const CURRENT_APP_ID: EcosystemAppId = "inventaria";

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    id: "advocase",
    name: "Advocase",
    suffix: ".AI",
    description: "Capte, qualifique e converta clientes com inteligência preditiva.",
    chip: "CRM · SDR",
    url: "https://advocaseai-byadvocacyai.lovable.app",
    icon: Target,
    accent: "text-primary",
  },
  {
    id: "advoga",
    name: "Advoga",
    suffix: ".AI",
    description: "Processos, prazos e escritório operando em fluxo contínuo.",
    chip: "GESTÃO",
    url: "https://advogaai-byadvocacyai.lovable.app",
    icon: Briefcase,
    accent: "text-primary",
  },
  {
    id: "peticiona",
    name: "Peticiona",
    suffix: ".AI",
    description: "Petições, minutas e contratos gerados em minutos, sob seu padrão.",
    chip: "DOCUMENTAL",
    url: "https://peticionaai-byadvocacyai.lovable.app",
    icon: FileText,
    accent: "text-primary",
  },
  {
    id: "inventaria",
    name: "Inventaria",
    suffix: ".AI",
    description: "Planejamento sucessório e patrimonial guiado por dados.",
    chip: "PATRIMONIAL",
    url: "https://inventariaai-byadvocacyai.lovable.app",
    icon: Scale,
    accent: "text-primary",
  },
  {
    id: "fin",
    name: "Fin",
    suffix: ".AI",
    description: "Conciliação, honorários e fluxo de caixa em tempo real.",
    chip: "FINANCEIRO",
    url: "https://finai-byadvocacyai.lovable.app",
    icon: Wallet,
    accent: "text-primary",
  },
  {
    id: "study",
    name: "Study",
    suffix: ".AI",
    description: "Estudos jurídicos personalizados com IA adaptativa.",
    chip: "EDUCAÇÃO",
    url: "https://studyai-byadvocacyai.lovable.app",
    icon: GraduationCap,
    accent: "text-primary",
  },
];