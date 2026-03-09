import type { PartilhaState, ResultadoPartilha } from "@/types/inventario";

export function calcularPartilha(state: PartilhaState): ResultadoPartilha {
  const monteMor = state.bens.reduce((sum, b) => sum + b.valorEstimado, 0);
  const dividas = state.dividas;
  
  // Calcular meação (50% dos bens adquiridos na constância do casamento para regimes com comunhão)
  let meacao = 0;
  const regimesComMeacao: string[] = ["comunhao_parcial", "comunhao_universal", "participacao_final_aquestos"];
  
  if (state.deCujus.possuiConjugeSobrevivente && regimesComMeacao.includes(state.deCujus.regimeBens)) {
    if (state.deCujus.regimeBens === "comunhao_universal") {
      meacao = (monteMor - dividas) * 0.5;
    } else {
      // Comunhão parcial: meação apenas sobre bens adquiridos na constância
      const bensConstancia = state.bens
        .filter(b => b.adquiridoNaConstancia)
        .reduce((sum, b) => sum + b.valorEstimado, 0);
      meacao = bensConstancia * 0.5;
    }
  }
  
  const heranca = monteMor - dividas - meacao;
  
  // Distribuir herança entre herdeiros
  const herdeirosAtivos = state.herdeiros.filter(h => h.concorre);
  const numHerdeiros = herdeirosAtivos.length;
  
  // Verificar se cônjuge concorre com descendentes
  const temDescendentes = herdeirosAtivos.some(h => 
    ["filho", "neto"].includes(h.parentesco)
  );
  const conjugeHerdeiro = herdeirosAtivos.find(h => 
    ["conjuge", "companheiro"].includes(h.parentesco)
  );
  
  let quotaHeranca = heranca;
  
  // Se existe testamento, separar parte disponível
  let parteDisponivel = 0;
  let parteLegitimaTotal = heranca;
  
  if (state.testamento.existeTestamento && herdeirosAtivos.length > 0) {
    parteDisponivel = heranca * 0.5; // 50% é disponível
    parteLegitimaTotal = heranca * 0.5; // 50% é legítima
  }
  
  const quadroIndividual = herdeirosAtivos.map(h => {
    let quinhao = 0;
    
    if (state.preferencias.tipoDivisao === "igualitaria") {
      // Divisão igualitária entre todos os herdeiros
      // Regras simplificadas do Código Civil
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
    } else {
      // Divisão igualitária simples
      quinhao = parteLegitimaTotal / numHerdeiros;
    }
    
    const itcmd = state.preferencias.simularItcmd 
      ? quinhao * (state.preferencias.aliquotaItcmd / 100) 
      : 0;
    
    return {
      nome: h.nome,
      parentesco: getParentescoLabel(h.parentesco),
      heranca: quinhao,
      itcmd,
      totalRecebido: quinhao,
    };
  });
  
  const estimativaItcmd = state.preferencias.simularItcmd
    ? heranca * (state.preferencias.aliquotaItcmd / 100)
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
