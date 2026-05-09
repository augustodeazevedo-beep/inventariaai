import { Scale, FileText, Briefcase, Search, Wallet, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type EcosystemAppId = "inventaria" | "peticiona" | "advoga" | "prospect" | "fin" | "study";

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
  {
    id: "prospect",
    name: "Prospect",
    suffix: ".AI",
    description: "Prospecção e inteligência de clientes",
    url: "https://prospectai-byadvocacyai.lovable.app",
    icon: Search,
    accent: "text-primary",
  },
  {
    id: "fin",
    name: "Fin",
    suffix: ".AI",
    description: "Gestão financeira do escritório",
    url: "https://finai-byadvocacyia.lovable.app",
    icon: Wallet,
    accent: "text-primary",
  },
  {
    id: "study",
    name: "Study",
    suffix: ".AI",
    description: "Pesquisa jurídica e estudos",
    url: "https://studyai-plataforma.lovable.app",
    icon: GraduationCap,
    accent: "text-primary",
  },
];