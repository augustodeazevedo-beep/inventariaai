export type ViaInventario = "extrajudicial" | "judicial" | "indefinida";
export type MotivoJudicial = "menor_incapaz" | "sem_consenso" | "testamento" | "outro";

export interface DadosFalecido {
  nome: string;
  cpf: string;
  dataFalecimento: string;
  estadoCivil: string;
  regimeBens: string;
  possuiTestamento: boolean | null;
  localFalecimento: string;
  ufFalecimento: string;
}

export interface DadosHerdeiro {
  id: string;
  nome: string;
  cpf: string;
  parentesco: string;
  menor: boolean;
  incapaz: boolean;
  concorda: boolean;
  endereco: string;
  telefone: string;
  email: string;
  profissao: string;
  estadoCivil: string;
}

export interface DadosBemTriagem {
  id: string;
  tipo: "imovel_urbano" | "imovel_rural" | "veiculo" | "conta_bancaria" | "investimento" | "pis_fgts" | "inss" | "outros";
  descricao: string;
  localizacao: string;
  uf: string;
  municipio: string;
  matriculaRegistro: string;
  valorEstimado: number;
  possuiDivida: boolean;
  valorDivida: number;
}

export interface ChecklistItem {
  id: string;
  categoria: string;
  descricao: string;
  obrigatorio: boolean;
  aplicavelVia: ViaInventario | "ambas";
  concluido: boolean;
  observacao: string;
}

export interface TriagemState {
  etapaAtual: number;
  falecido: DadosFalecido;
  herdeiros: DadosHerdeiro[];
  bens: DadosBemTriagem[];
  viaDefinida: ViaInventario;
  motivoJudicial: MotivoJudicial | null;
  checklist: ChecklistItem[];
}
