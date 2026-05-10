import type { PartilhaState, ResultadoPartilha } from "@/types/inventario";

export function calcularPartilha(state: PartilhaState): ResultadoPartilha {
  const monteMor = state.bens.reduce((sum, b) => sum + b.valorEstimado, 0);
  const dividas = state.dividas;
  
  // Calcular meação (50% dos bens da meação, ANTES da dedução de dívidas para evitar dupla dedução)
  let meacao = 0;
  const regimesComMeacao: string[] = ["comunhao_parcial", "comunhao_universal", "participacao_final_aquestos"];

  if (state.deCujus.possuiConjugeSobrevivente && regimesComMeacao.includes(state.deCujus.regimeBens)) {
    if (state.deCujus.regimeBens === "comunhao_universal") {
      meacao = monteMor * 0.5;
    } else {
      // Comunhão parcial / participação final: meação apenas sobre bens adquiridos na constância
      const bensConstancia = state.bens
        .filter(b => b.adquiridoNaConstancia)
        .reduce((sum, b) => sum + b.valorEstimado, 0);
      meacao = bensConstancia * 0.5;
    }
  }

  // Dívidas são deduzidas uma única vez do que resta do espólio (após meação)
  const heranca = Math.max(0, monteMor - meacao - dividas);
  
  // Distribuir herança entre herdeiros
  const herdeirosAtivos = state.herdeiros.filter(h => h.concorre);
  const numHerdeiros = herdeirosAtivos.length;
  if (!numHerdeiros || numHerdeiros <= 0) {
    return { monteMor, dividas, meacao, heranca, quadroIndividual: [], estimativaItcmd: 0, baseCalculoItcmd: heranca };
  }
  
  // Verificar se cônjuge concorre com descendentes
  const temDescendentes = herdeirosAtivos.some(h => 
    ["filho", "neto"].includes(h.parentesco)
  );
  const conjugeHerdeiro = herdeirosAtivos.find(h => 
    ["conjuge", "companheiro"].includes(h.parentesco)
  );
  
  // Se existe testamento, separar parte disponível
  // Nota: parte disponível é distribuída pelo testador a beneficiários externos não modelados aqui.
  let parteLegitimaTotal = heranca;
  
  if (state.testamento.existeTestamento && herdeirosAtivos.length > 0) {
    parteLegitimaTotal = heranca * 0.5; // 50% é legítima; 50% disponível fica com legatários do testamento
  }
  
  const quadroIndividual = herdeirosAtivos.map(h => {
    let quinhao = 0;

    // Aplicar regras do Código Civil em todos os modos. tipoDivisao apenas modifica a divisão final.
    {
      // Regras simplificadas do Código Civil (Art. 1.829)
      if (conjugeHerdeiro && temDescendentes && h.parentesco === "conjuge") {
        // Cônjuge concorre com descendentes no regime de comunhão parcial
        if (state.deCujus.regimeBens === "comunhao_parcial") {
          // Cônjuge recebe quinhão igual aos filhos, mínimo 1/4
          const numFilhos = herdeirosAtivos.filter(x => ["filho", "neto"].includes(x.parentesco)).length;
          const quotaConjuge = Math.max(parteLegitimaTotal / (numFilhos + 1), parteLegitimaTotal * 0.25);
          quinhao = quotaConjuge;
        } else if (state.deCujus.regimeBens === "separacao_total" || state.deCujus.regimeBens === "separacao_obrigatoria") {
          // Cônjuge concorre com quinhão igual
          quinhao = parteLegitimaTotal / numHerdeiros;
        } else {
          // Comunhão universal: cônjuge NÃO concorre com descendentes (já tem meação)
          quinhao = 0;
        }
      } else if (h.parentesco === "conjuge" && !temDescendentes) {
        // Cônjuge concorre com ascendentes ou herda sozinho
        const temAscendentes = herdeirosAtivos.some(x => ["pai", "mae", "avo"].includes(x.parentesco));
        if (temAscendentes) {
          quinhao = parteLegitimaTotal / 3; // 1/3 para cônjuge
        } else {
          quinhao = parteLegitimaTotal; // Cônjuge herda tudo
        }
      } else {
        // Demais herdeiros
        const outrosHerdeiros = herdeirosAtivos.filter(x => !["conjuge", "companheiro"].includes(x.parentesco));
        const quotaConjuge = conjugeHerdeiro ? (() => {
          if (state.deCujus.regimeBens === "comunhao_universal") return 0;
          if (state.deCujus.regimeBens === "comunhao_parcial") {
            return Math.max(parteLegitimaTotal / (outrosHerdeiros.length + 1), parteLegitimaTotal * 0.25);
          }
          return parteLegitimaTotal / numHerdeiros;
        })() : 0;
        
        const remanescente = parteLegitimaTotal - quotaConjuge;
        quinhao = outrosHerdeiros.length > 0 ? remanescente / outrosHerdeiros.length : 0;
      }
    }
    
    const itcmd = state.preferencias.simularItcmd
      ? calcularItcmdProgressivo(quinhao)
      : 0;
    
    return {
      nome: h.nome,
      parentesco: getParentescoLabel(h.parentesco),
      heranca: quinhao,
      itcmd,
      totalRecebido: quinhao,
    };
  });
  
  // When a testament exists the quadroIndividual only covers the legítima (50%).
  // The parte disponível (50%) also incurs ITCMD via testamentary legatees not modelled here.
  // Use calcularItcmdProgressivo(heranca) as the full-estate estimate in that case.
  const estimativaItcmd = state.preferencias.simularItcmd
    ? (state.testamento.existeTestamento
        ? calcularItcmdProgressivo(heranca)
        : quadroIndividual.reduce((sum, q) => sum + q.itcmd, 0))
    : 0;
  
  return {
    monteMor,
    dividas,
    meacao,
    heranca,
    quadroIndividual,
    estimativaItcmd,
    baseCalculoItcmd: heranca,
  };
}

export function getParentescoLabel(p: string): string {
  const labels: Record<string, string> = {
    conjuge: "Cônjuge",
    companheiro: "Companheiro(a)",
    filho: "Filho(a)",
    neto: "Neto(a)",
    pai: "Pai",
    mae: "Mãe",
    avo: "Avô/Avó",
    irmao: "Irmão/Irmã",
    sobrinho: "Sobrinho(a)",
    tio: "Tio(a)",
    primo: "Primo(a)",
    outro: "Outro",
  };
  return labels[p] || p;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// LC 227/2026 + EC 132/23 — faixas mínimas nacionais, cálculo marginal por tranche
export function calcularItcmdProgressivo(base: number): number {
  if (base <= 0) return 0;
  const brackets = [
    { ate: 1_000_000,  rate: 0.02 },  // Até R$ 1 milhão: 2%
    { ate: 5_000_000,  rate: 0.04 },  // R$ 1M – R$ 5M: 4%
    { ate: 15_000_000, rate: 0.06 },  // R$ 5M – R$ 15M: 6%
    { ate: Infinity,   rate: 0.08 },  // Acima de R$ 15M: 8%
  ];
  let total = 0;
  let prev = 0;
  for (const b of brackets) {
    if (base <= prev) break;
    const cap = b.ate === Infinity ? base : b.ate;
    total += (Math.min(base, cap) - prev) * b.rate;
    prev = cap;
  }
  return total;
}

// Marginal ITCMD when prior donations of `acumulado` already exist (12-month aggregation)
export function calcularItcmdMarginal(valor: number, acumulado: number): number {
  return calcularItcmdProgressivo(Math.max(0, acumulado) + Math.max(0, valor))
       - calcularItcmdProgressivo(Math.max(0, acumulado));
}
