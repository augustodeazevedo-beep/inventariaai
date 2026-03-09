import { DadosHerdeiro, DadosFalecido, ChecklistItem, ViaInventario, MotivoJudicial } from "@/types/triagem";

export function determinarVia(
  falecido: DadosFalecido,
  herdeiros: DadosHerdeiro[]
): { via: ViaInventario; motivo: MotivoJudicial | null; justificativa: string } {
  const temMenor = herdeiros.some((h) => h.menor);
  const temIncapaz = herdeiros.some((h) => h.incapaz);
  const todosConcodam = herdeiros.every((h) => h.concorda);
  const temTestamento = falecido.possuiTestamento === true;

  if (temMenor || temIncapaz) {
    return {
      via: "judicial",
      motivo: "menor_incapaz",
      justificativa:
        "Há herdeiro(s) menor(es) ou incapaz(es). O inventário deve seguir pela via judicial (Art. 610, §1º, CPC).",
    };
  }

  if (!todosConcodam) {
    return {
      via: "judicial",
      motivo: "sem_consenso",
      justificativa:
        "Não há consenso entre todos os herdeiros. O inventário deve seguir pela via judicial (Art. 610, §1º, CPC).",
    };
  }

  if (temTestamento) {
    return {
      via: "judicial",
      motivo: "testamento",
      justificativa:
        "Existe testamento deixado pelo falecido. Em regra, o inventário segue pela via judicial para abertura e cumprimento do testamento (Art. 610, §1º, CPC). Obs: Admite-se escritura pública se todos os herdeiros forem capazes, concordes, e o testamento já tiver sido registrado judicialmente (Resolução CNJ 35/2007, Art. 29).",
    };
  }

  return {
    via: "extrajudicial",
    motivo: null,
    justificativa:
      "Todos os herdeiros são maiores, capazes e concordes, sem testamento. O inventário pode seguir pela via extrajudicial em Tabelionato de Notas (Art. 610, §1º, CPC c/c Lei 11.441/2007).",
  };
}

export function gerarChecklist(via: ViaInventario): ChecklistItem[] {
  const items: Omit<ChecklistItem, "id" | "concluido" | "observacao">[] = [
    // Documentos do falecido
    {
      categoria: "Documentos do Falecido",
      descricao: "Certidão de Óbito (original ou cópia autenticada)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos do Falecido",
      descricao: "RG e CPF do falecido (cópias)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos do Falecido",
      descricao: "Certidão de Casamento atualizada (se casado) ou Certidão de Nascimento",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos do Falecido",
      descricao: "Certidão Negativa de Testamento (CRPN/CRC)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos do Falecido",
      descricao: "CND Federal (Receita Federal / Dívida Ativa)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos do Falecido",
      descricao: "CND Municipal (Setor de Tributação - validade 30 dias)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos do Falecido",
      descricao: "CND Estadual (Fazenda Estadual)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos do Falecido",
      descricao: "CND Trabalhista (TST)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    // Documentos dos herdeiros
    {
      categoria: "Documentos dos Herdeiros",
      descricao: "RG e CPF de todos os herdeiros (cópias) ou CNH",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos dos Herdeiros",
      descricao: "Comprovante de renda de todos os herdeiros",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos dos Herdeiros",
      descricao: "Comprovante de residência de todos os herdeiros",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos dos Herdeiros",
      descricao: "Certidões de Nascimento e/ou Casamento atualizadas (máx. 6 meses)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos dos Herdeiros",
      descricao: "Declaração de Hipossuficiência (todos os herdeiros)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    // Documentos dos bens
    {
      categoria: "Documentos dos Bens",
      descricao: "Matrícula atualizada do imóvel (CRI)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos dos Bens",
      descricao: "Certidão Negativa de Ônus Reais (CRI)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos dos Bens",
      descricao: "Certidão Descritiva do imóvel (Cadastro da Prefeitura)",
      obrigatorio: true,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos dos Bens",
      descricao: "Documento do veículo (CRLV/CRV) e Certidão do DETRAN",
      obrigatorio: false,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos dos Bens",
      descricao: "Extrato de saldo de conta/poupança bancária",
      obrigatorio: false,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos dos Bens",
      descricao: "Declaração de valores do INSS",
      obrigatorio: false,
      aplicavelVia: "ambas",
    },
    {
      categoria: "Documentos dos Bens",
      descricao: "Comprovante de saldo PIS/FGTS",
      obrigatorio: false,
      aplicavelVia: "ambas",
    },
    // Específicos judicial
    {
      categoria: "Específico Judicial",
      descricao: "Endereço e dados pessoais dos herdeiros não assistidos pela DPE",
      obrigatorio: true,
      aplicavelVia: "judicial",
    },
    // Específicos extrajudicial
    {
      categoria: "Específico Extrajudicial",
      descricao: "Declaração de Atendimento (todos os herdeiros assinam - encaminhar ao Tabelionato)",
      obrigatorio: true,
      aplicavelVia: "extrajudicial",
    },
  ];

  return items
    .filter(
      (item) => item.aplicavelVia === "ambas" || item.aplicavelVia === via
    )
    .map((item, index) => ({
      ...item,
      id: `check-${index}`,
      concluido: false,
      observacao: "",
    }));
}

export const ROTEIRO_ETAPAS = [
  "Colher Declaração de Hipossuficiência e comprovantes de Renda e Residência do assistido principal",
  "Solicitar documentação básica (RG e CPF) e informações sobre estado civil, regime de bens, profissão e endereços de todas as partes",
  "Verificar se há Concordância dos demais Herdeiros e colher Declaração destes",
  "Colher dados dos Bens e Direitos a partilhar, assim como os Valores de cada patrimônio",
  "Ordenar Histórico de Falecimentos a viabilizar a análise da vocação hereditária e partilha",
  "Requisitar Certidão Negativa de Testamento em nome do autor da herança",
  "Requisitar Certidão Descritiva (Prefeitura) e Certidão de Registro (DETRAN)",
  "Verificar o CRPN/CRC dos registros de falecimento, nascimento e casamento",
  "Requisitar Certidões de Nascimento, Óbito e Casamento de todas as partes",
  "Requisitar Matrícula e Certidão Negativa de Ônus Reais ao CRI",
  "Requisitar CND's Municipal, Estadual, Federal e Trabalhista do falecido",
  "Refazer Checklist — verificar documentação completa",
  "Imprimir Documentação Completa",
  "Avisar assistido para buscar documentação na Defensoria e levar ao Tabelionato",
  "Colher/Emitir Declaração de Atendimento com os dados da partilha",
  "Entrega da documentação",
];
