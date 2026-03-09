import type { DiligenciaInvestigativa, CategoriaDiligencia, FlagsLitigio } from "@/types/triagem";

interface DiligenciaTemplate {
  categoria: CategoriaDiligencia;
  descricao: string;
  fundamentoLegal: string;
  orgaoDestinatario: string;
  prioridade: "alta" | "media" | "baixa";
  aplicavelQuando: "sempre" | "litigioso" | "desconhecimento_patrimonial" | "ocultacao" | "doacao_inoficiosa";
}

const DILIGENCIAS_TEMPLATES: DiligenciaTemplate[] = [
  // === BANCÁRIAS / FINANCEIRAS ===
  {
    categoria: "bancaria_financeira",
    descricao: "Ofício ao Banco Central (BACEN/CCS) para identificar todas as contas, aplicações e investimentos em nome do de cujus",
    fundamentoLegal: "Art. 620, IV, CPC c/c LC 105/2001",
    orgaoDestinatario: "Banco Central do Brasil — Sistema CCS",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "bancaria_financeira",
    descricao: "Ofício às instituições financeiras identificadas para obtenção de extratos de saldo na data do óbito",
    fundamentoLegal: "Art. 620, IV, CPC",
    orgaoDestinatario: "Instituições financeiras",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "bancaria_financeira",
    descricao: "Ofício para levantamento de movimentações bancárias dos últimos 5 anos (identificar doações/transferências suspeitas)",
    fundamentoLegal: "Art. 2.002 e 2.003, CC c/c Art. 620, IV, CPC",
    orgaoDestinatario: "Instituições financeiras",
    prioridade: "media",
    aplicavelQuando: "ocultacao",
  },
  {
    categoria: "bancaria_financeira",
    descricao: "Ofício à B3 (Bolsa de Valores) para identificar ações, fundos e investimentos em corretoras",
    fundamentoLegal: "Art. 620, IV, CPC",
    orgaoDestinatario: "B3 — Brasil, Bolsa, Balcão",
    prioridade: "media",
    aplicavelQuando: "desconhecimento_patrimonial",
  },
  {
    categoria: "bancaria_financeira",
    descricao: "Consulta ao saldo de PIS/PASEP e FGTS do falecido",
    fundamentoLegal: "Lei 8.036/90 e Lei 10.208/2001",
    orgaoDestinatario: "Caixa Econômica Federal",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },

  // === FISCAIS / TRIBUTÁRIAS ===
  {
    categoria: "fiscal_tributaria",
    descricao: "Ofício à Receita Federal para obtenção das últimas Declarações de IRPF do de cujus (5 anos)",
    fundamentoLegal: "Art. 620, IV, CPC c/c CTN, Art. 198, §1º, II",
    orgaoDestinatario: "Receita Federal do Brasil",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "fiscal_tributaria",
    descricao: "CND Federal — Certidão de Débitos Relativos a Créditos Tributários Federais e Dívida Ativa da União",
    fundamentoLegal: "Art. 192, CTN",
    orgaoDestinatario: "Receita Federal / PGFN",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "fiscal_tributaria",
    descricao: "CND Estadual — Certidão Negativa de Débitos Estaduais",
    fundamentoLegal: "Art. 192, CTN",
    orgaoDestinatario: "Secretaria da Fazenda Estadual",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "fiscal_tributaria",
    descricao: "CND Municipal — Certidão Negativa de Débitos Municipais (IPTU, ISS, taxas)",
    fundamentoLegal: "Art. 192, CTN",
    orgaoDestinatario: "Prefeitura Municipal — Setor de Tributação",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "fiscal_tributaria",
    descricao: "CND Trabalhista — Certidão Negativa de Débitos Trabalhistas",
    fundamentoLegal: "Art. 642-A, CLT",
    orgaoDestinatario: "Tribunal Superior do Trabalho (TST)",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "fiscal_tributaria",
    descricao: "Verificar existência de débitos de ITCMD pendentes (heranças anteriores não regularizadas)",
    fundamentoLegal: "Legislação estadual do ITCMD",
    orgaoDestinatario: "Secretaria da Fazenda Estadual",
    prioridade: "media",
    aplicavelQuando: "sempre",
  },

  // === REGISTRÁRIAS / IMOBILIÁRIAS ===
  {
    categoria: "registraria_imobiliaria",
    descricao: "Ofício ao CRI (Cartório de Registro de Imóveis) para Matrícula atualizada e Certidão Negativa de Ônus Reais",
    fundamentoLegal: "Art. 620, IV, CPC c/c Lei 6.015/73",
    orgaoDestinatario: "Cartório de Registro de Imóveis",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "registraria_imobiliaria",
    descricao: "Certidão Descritiva do imóvel (cadastro na Prefeitura)",
    fundamentoLegal: "Art. 620, IV, CPC",
    orgaoDestinatario: "Prefeitura Municipal — Cadastro Imobiliário",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "registraria_imobiliaria",
    descricao: "Ofício a todos os CRIs da comarca para verificar existência de imóveis não declarados em nome do de cujus",
    fundamentoLegal: "Art. 620, IV, CPC",
    orgaoDestinatario: "Cartórios de Registro de Imóveis da comarca",
    prioridade: "alta",
    aplicavelQuando: "desconhecimento_patrimonial",
  },
  {
    categoria: "registraria_imobiliaria",
    descricao: "Verificar registro de doações de imóveis feitas em vida pelo de cujus (últimos 5 anos) para análise de colação",
    fundamentoLegal: "Art. 2.002 e 2.003, CC",
    orgaoDestinatario: "Cartórios de Registro de Imóveis",
    prioridade: "alta",
    aplicavelQuando: "doacao_inoficiosa",
  },
  {
    categoria: "registraria_imobiliaria",
    descricao: "Certidão Negativa de Testamento — Central de Registro de Penhoras e Protestos (CRPN/CRC)",
    fundamentoLegal: "Res. CNJ 35/2007",
    orgaoDestinatario: "CENSEC / CRC Nacional",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },

  // === VEICULARES ===
  {
    categoria: "veicular",
    descricao: "Ofício ao DETRAN para levantamento de todos os veículos registrados em nome do de cujus",
    fundamentoLegal: "Art. 620, IV, CPC c/c CTB",
    orgaoDestinatario: "DETRAN Estadual",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "veicular",
    descricao: "Verificar transferências de veículos realizadas nos últimos 5 anos (possível doação inoficiosa)",
    fundamentoLegal: "Art. 2.002, CC",
    orgaoDestinatario: "DETRAN Estadual",
    prioridade: "media",
    aplicavelQuando: "doacao_inoficiosa",
  },

  // === SOCIETÁRIAS ===
  {
    categoria: "societaria",
    descricao: "Ofício à JUCERGS/Junta Comercial para verificar participações societárias do de cujus",
    fundamentoLegal: "Art. 620, IV, CPC c/c Lei 8.934/94",
    orgaoDestinatario: "Junta Comercial do Estado",
    prioridade: "media",
    aplicavelQuando: "desconhecimento_patrimonial",
  },
  {
    categoria: "societaria",
    descricao: "Consulta ao CNPJ (Receita Federal) para identificar empresas vinculadas ao CPF do de cujus",
    fundamentoLegal: "Art. 620, IV, CPC",
    orgaoDestinatario: "Receita Federal — Cadastro CNPJ",
    prioridade: "media",
    aplicavelQuando: "desconhecimento_patrimonial",
  },
  {
    categoria: "societaria",
    descricao: "Avaliação de quotas/ações societárias — solicitar balanço patrimonial da empresa",
    fundamentoLegal: "Art. 1.031, CC",
    orgaoDestinatario: "Empresa / Contador responsável",
    prioridade: "media",
    aplicavelQuando: "sempre",
  },

  // === DIGITAIS / ELETRÔNICAS ===
  {
    categoria: "digital_eletronica",
    descricao: "Consulta ao INFOJUD (Receita Federal) para cruzamento de dados patrimoniais e fiscais",
    fundamentoLegal: "Convênio SINIEF / Art. 198, §1º, II, CTN",
    orgaoDestinatario: "Poder Judiciário — via INFOJUD",
    prioridade: "alta",
    aplicavelQuando: "litigioso",
  },
  {
    categoria: "digital_eletronica",
    descricao: "Consulta RENAJUD — restrição/pesquisa de veículos via sistema judicial",
    fundamentoLegal: "Res. CNJ 61/2008",
    orgaoDestinatario: "Poder Judiciário — via RENAJUD",
    prioridade: "media",
    aplicavelQuando: "litigioso",
  },
  {
    categoria: "digital_eletronica",
    descricao: "Consulta SISBAJUD para bloqueio ou pesquisa de ativos financeiros",
    fundamentoLegal: "Res. CNJ 61/2008 c/c Provimento CSM 2.554/2020",
    orgaoDestinatario: "Poder Judiciário — via SISBAJUD",
    prioridade: "alta",
    aplicavelQuando: "ocultacao",
  },
  {
    categoria: "digital_eletronica",
    descricao: "Pesquisa de bens via ARISP (Central Registral de Imóveis de São Paulo) ou sistema equivalente no estado",
    fundamentoLegal: "Art. 620, IV, CPC",
    orgaoDestinatario: "Central Registral do Estado",
    prioridade: "media",
    aplicavelQuando: "desconhecimento_patrimonial",
  },

  // === DOCUMENTAL GERAL ===
  {
    categoria: "documental_geral",
    descricao: "Certidão de Óbito (original ou cópia autenticada)",
    fundamentoLegal: "Art. 615, CPC",
    orgaoDestinatario: "Cartório de Registro Civil",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "documental_geral",
    descricao: "Certidões de Nascimento e/ou Casamento atualizadas de todos os herdeiros (máx. 6 meses)",
    fundamentoLegal: "Art. 615, CPC c/c Provimento CNJ 63/2017",
    orgaoDestinatario: "Cartórios de Registro Civil",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "documental_geral",
    descricao: "RG, CPF e comprovante de residência de todos os herdeiros",
    fundamentoLegal: "Art. 615, CPC",
    orgaoDestinatario: "Herdeiros",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "documental_geral",
    descricao: "Declaração de Hipossuficiência (todos os herdeiros assistidos pela DPE)",
    fundamentoLegal: "Lei 1.060/50 c/c Art. 98, CPC",
    orgaoDestinatario: "Defensoria Pública",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
  {
    categoria: "documental_geral",
    descricao: "Comprovante de renda de todos os herdeiros",
    fundamentoLegal: "Art. 99, §2º, CPC",
    orgaoDestinatario: "Herdeiros",
    prioridade: "alta",
    aplicavelQuando: "sempre",
  },
];

export const CATEGORIAS_DILIGENCIA: Record<CategoriaDiligencia, string> = {
  bancaria_financeira: "Bancárias / Financeiras",
  fiscal_tributaria: "Fiscais / Tributárias",
  registraria_imobiliaria: "Registrárias / Imobiliárias",
  veicular: "Veiculares",
  societaria: "Societárias",
  digital_eletronica: "Digitais / Eletrônicas",
  documental_geral: "Documental Geral",
};

export function gerarDiligencias(
  natureza: "consensual" | "litigioso" | "indefinida",
  flags: FlagsLitigio
): DiligenciaInvestigativa[] {
  return DILIGENCIAS_TEMPLATES
    .filter((t) => {
      if (t.aplicavelQuando === "sempre") return true;
      if (t.aplicavelQuando === "litigioso" && natureza === "litigioso") return true;
      if (t.aplicavelQuando === "desconhecimento_patrimonial" && flags.desconhecimentoPatrimonial) return true;
      if (t.aplicavelQuando === "ocultacao" && flags.ocultacaoPatrimonial) return true;
      if (t.aplicavelQuando === "doacao_inoficiosa" && flags.doacaoInoficiosa) return true;
      return false;
    })
    .map((t, i) => ({
      ...t,
      id: `dilig-${i}`,
      concluido: false,
      observacao: "",
      dataRealizacao: "",
    }));
}
