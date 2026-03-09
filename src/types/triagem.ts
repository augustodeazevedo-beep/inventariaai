export type ViaInventario = "extrajudicial" | "judicial" | "indefinida";
export type MotivoJudicial = "menor_incapaz" | "sem_consenso" | "testamento" | "litigio" | "outro";
export type NaturezaInventario = "consensual" | "litigioso" | "indefinida";

export interface DadosFalecido {
  nome: string;
  cpf: string;
  dataFalecimento: string;
  estadoCivil: string;
  regimeBens: string;
  possuiTestamento: boolean | null;
  localFalecimento: string;
  ufFalecimento: string;
  ultimoDomicilio: string;
  ufDomicilio: string;
  profissao: string;
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
  // Novos campos para vocação hereditária expandida
  representante: boolean; // herda por representação (direito de representação)
  representaDe: string; // nome do herdeiro pré-morto que representa
  falecido: boolean; // herdeiro pré-morto (para cálculo de representação)
  renunciou: boolean; // renunciou à herança
}

export interface CessaoDireitosHereditarios {
  id: string;
  cedente: string; // nome do herdeiro cedente
  cessionario: string; // nome do cessionário
  percentual: number;
  formalizada: boolean; // se foi feita por escritura pública
  datacessao: string;
  observacoes: string;
}

export interface HerancaCumulativa {
  id: string;
  nomeFalecido: string;
  dataFalecimento: string;
  parentescoComDeCujus: string;
  inventarioAberto: boolean;
  numeroProcesso: string;
  observacoes: string;
}

export interface FlagsLitigio {
  posseExclusivaBens: boolean;
  possuidorExclusivo: string;
  descricaoPosseExclusiva: string;
  ocultacaoPatrimonial: boolean;
  descricaoOcultacao: string;
  doacaoInoficiosa: boolean;
  descricaoDoacaoInoficiosa: string;
  simulacaoNegocioJuridico: boolean;
  descricaoSimulacao: string;
  alienacaoEmVida: boolean;
  descricaoAlienacao: string;
  cobrancaFrutosAlugueis: boolean;
  descricaoFrutos: string;
  conflitosEntreHerdeiros: boolean;
  descricaoConflitos: string;
  desconhecimentoPatrimonial: boolean; // não se conhece integralmente o acervo
  descricaoDesconhecimento: string;
}

export interface DadosBemTriagem {
  id: string;
  tipo: "imovel_urbano" | "imovel_rural" | "veiculo" | "conta_bancaria" | "investimento" | "pis_fgts" | "inss" | "quotas_acoes" | "outros";
  descricao: string;
  localizacao: string;
  uf: string;
  municipio: string;
  matriculaRegistro: string;
  valorEstimado: number;
  possuiDivida: boolean;
  valorDivida: number;
  formaAquisicao: "compra_onerosa" | "doacao" | "heranca" | "usucapiao" | "outros" | "";
  adquiridoNaConstancia: boolean;
  emNomeDe: string;
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

export type CategoriaDiligencia = 
  | "bancaria_financeira"
  | "fiscal_tributaria"
  | "registraria_imobiliaria"
  | "veicular"
  | "societaria"
  | "digital_eletronica"
  | "documental_geral";

export interface DiligenciaInvestigativa {
  id: string;
  categoria: CategoriaDiligencia;
  descricao: string;
  fundamentoLegal: string;
  orgaoDestinatario: string;
  prioridade: "alta" | "media" | "baixa";
  aplicavelQuando: "sempre" | "litigioso" | "desconhecimento_patrimonial" | "ocultacao" | "doacao_inoficiosa";
  concluido: boolean;
  observacao: string;
  dataRealizacao: string;
}

export interface TriagemState {
  etapaAtual: number;
  falecido: DadosFalecido;
  herdeiros: DadosHerdeiro[];
  bens: DadosBemTriagem[];
  viaDefinida: ViaInventario;
  natureza: NaturezaInventario;
  motivoJudicial: MotivoJudicial | null;
  flagsLitigio: FlagsLitigio;
  cessoes: CessaoDireitosHereditarios[];
  herancasCumulativas: HerancaCumulativa[];
  checklist: ChecklistItem[];
  diligencias: DiligenciaInvestigativa[];
}
