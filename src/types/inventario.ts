export type RegimeBens = 
  | "comunhao_parcial"
  | "comunhao_universal"
  | "separacao_total"
  | "separacao_obrigatoria"
  | "participacao_final_aquestos";

export type ParentescoHerdeiro =
  | "conjuge"
  | "companheiro"
  | "filho"
  | "neto"
  | "pai"
  | "mae"
  | "avo"
  | "irmao"
  | "sobrinho"
  | "tio"
  | "primo"
  | "outro";

export type TipoBem = "imovel" | "veiculo" | "conta_bancaria" | "investimento" | "acoes" | "outros";

export type FormaAquisicao = "compra_onerosa" | "doacao" | "heranca" | "usucapiao" | "outros";

export interface DeCujus {
  nome: string;
  dataFalecimento: string;
  estadoCivil: string;
  regimeBens: RegimeBens;
  possuiConjugeSobrevivente: boolean;
  nomeConjuge: string;
}

export interface Herdeiro {
  id: string;
  nome: string;
  parentesco: ParentescoHerdeiro;
  concorre: boolean;
}

export interface Testamento {
  existeTestamento: boolean;
  percentualDisponivel: number;
  beneficiarios: { id: string; nome: string; percentual: number }[];
}

export interface Bem {
  id: string;
  descricao: string;
  tipo: TipoBem;
  valorEstimado: number;
  formaAquisicao: FormaAquisicao;
  emNomeDe: string;
  adquiridoNaConstancia: boolean;
  dataAquisicao: string;
}

export interface Preferencias {
  tipoDivisao: "igualitaria" | "personalizada";
  simularItcmd: boolean;
  aliquotaItcmd: number;
}

export interface ResultadoPartilha {
  monteMor: number;
  dividas: number;
  meacao: number;
  heranca: number;
  quadroIndividual: {
    nome: string;
    parentesco: string;
    heranca: number;
    itcmd: number;
    totalRecebido: number;
  }[];
  estimativaItcmd: number;
  baseCalculoItcmd: number;
}

export interface PartilhaState {
  currentStep: number;
  deCujus: DeCujus;
  herdeiros: Herdeiro[];
  testamento: Testamento;
  bens: Bem[];
  dividas: number;
  preferencias: Preferencias;
  resultado: ResultadoPartilha | null;
}

// ITCMD Types
export type FatoGerador = "doacao" | "causa_mortis";
export type ResidenciaType = "brasil" | "exterior";

export interface Beneficiario {
  id: string;
  nome: string;
  percentual: number;
  residencia: ResidenciaType;
  uf: string;
}

export interface BemItcmd {
  id: string;
  descricao: string;
  fracao: number;
  natureza: TipoBem;
  localizacao: ResidenciaType;
  uf: string;
  valor: number;
}

export interface ItcmdState {
  fatoGerador: FatoGerador;
  nomeDoador: string;
  residenciaDoador: ResidenciaType;
  ufDoador: string;
  doacoesAcumuladas12m: number;
  beneficiarios: Beneficiario[];
  bens: BemItcmd[];
}
