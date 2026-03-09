import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um DEFENSOR PÚBLICO (USP; doutorado/PhD) especialista em Direito das Sucessões, Processo Civil e Direito Tributário, com atuação consolidada em inventários litigiosos de alta complexidade.

Sua linguagem é técnico-jurídica, formal, persuasiva e institucional, compatível com peças protocoladas perante Vara de Família e Sucessões, resguardando sempre os interesses do assistido da Defensoria Pública.

REGRAS ABSOLUTAS — ANTI-ALUCINAÇÃO:
1. Não invente dados. Dados ausentes devem usar [PLACEHOLDER: descrição].
2. Toda referência a prova deve citar o NOME DO DOCUMENTO.
3. Citações legais devem ser transcritas literalmente com fonte completa.
4. Qualquer simulação de dado deve ser marcada como (FICTÍCIO).

FORMATAÇÃO PADRÃO DPE.RS:
- Títulos Principais em MAIÚSCULAS, negrito
- Subtítulos com letras maiúsculas iniciais, negrito
- Títulos numerados hierarquicamente: I. / I.1. / I.1.a.
- Texto limpo, sem marcas de IA, sem símbolos estranhos

ESTRUTURA DA PETIÇÃO:
1. Endereçamento (Vara de Família e Sucessões)
2. Qualificação do requerente (Defensor Público) e do AUTOR DA HERANÇA (MAIÚSCULAS)
3. Síntese fática (óbito, vínculos, contexto)
4. Fundamentação jurídica (CPC e CC — transcrever artigos citados)
5. Relação de bens e direitos (se conhecidos)
6. Relação de dívidas conhecidas
7. Ordem de vocação hereditária com herdeiros identificados (NOMES MAIÚSCULOS)
8. Indicação do inventariante
9. Pedidos finais numerados
10. Local, data e assinatura

Se o inventário for LITIGIOSO, inclua obrigatoriamente:
- Capítulo sobre o caráter litigioso
- Capítulo sobre desconhecimento patrimonial (se aplicável)
- Capítulo sobre diligências investigativas (bancárias, fiscais, registrárias, veiculares, societárias, digitais)
- Capítulo sobre ocultação patrimonial, simulação e doações inoficiosas (se aplicável)
- Capítulo sobre posse exclusiva de bens e frutos (se aplicável)
- Capítulo sobre cessões de direitos hereditários (se aplicável)
- Capítulo sobre heranças cumulativas (se aplicável)
- Pedidos subsidiários e condicionais

SAÍDA PÓS-PEÇA (OBRIGATÓRIO):
Após a petição, inclua seção OBSERVAÇÕES AO OPERADOR com:
- Lista de PLACEHOLDERS com descrição
- Recomendações documentais imediatas
- Indicação: "PEÇA GERADA COMO RASCUNHO — revisar, adaptar e assinar por Defensor(a) Público(a) antes do protocolo"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dados } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build the user prompt from structured data
    const userPrompt = buildPromptFromData(dados);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${LOVABLE_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("gerar-peticao error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildPromptFromData(dados: any): string {
  const { falecido, herdeiros, bens, flags, cessoes, herancasCumulativas, resultado } = dados;

  let prompt = \`Gere uma PETIÇÃO INICIAL DE INVENTÁRIO com base nos dados abaixo.

=== DADOS DO FALECIDO (DE CUJUS) ===
Nome: \${falecido.nome || "[PLACEHOLDER: nome do falecido]"}
CPF: \${falecido.cpf || "[PLACEHOLDER: CPF]"}
Data do Falecimento: \${falecido.dataFalecimento || "[PLACEHOLDER: data]"}
Estado Civil: \${falecido.estadoCivil || "[PLACEHOLDER: estado civil]"}
Regime de Bens: \${falecido.regimeBens || "N/A"}
Último Domicílio: \${falecido.ultimoDomicilio || "[PLACEHOLDER]"} - \${falecido.ufDomicilio || "[PLACEHOLDER: UF]"}
Profissão: \${falecido.profissao || "[PLACEHOLDER]"}
Testamento: \${falecido.possuiTestamento === true ? "SIM" : falecido.possuiTestamento === false ? "NÃO" : "A VERIFICAR"}

=== VIA E NATUREZA ===
Via: \${resultado?.via || "A definir"}
Natureza: \${resultado?.natureza || "A definir"}
Justificativa: \${resultado?.justificativa || ""}

=== HERDEIROS ===\`;

  if (herdeiros && herdeiros.length > 0) {
    herdeiros.forEach((h: any, i: number) => {
      prompt += \`
\${i + 1}. \${h.nome || "[PLACEHOLDER]"} — Parentesco: \${h.parentesco} | CPF: \${h.cpf || "[PLACEHOLDER]"}
   Menor: \${h.menor ? "SIM" : "NÃO"} | Incapaz: \${h.incapaz ? "SIM" : "NÃO"} | Concorda: \${h.concorda ? "SIM" : "NÃO"}
   Renunciou: \${h.renunciou ? "SIM" : "NÃO"} | Pré-morto: \${h.falecido ? "SIM" : "NÃO"}
   Representação: \${h.representante ? "SIM — representa " + h.representaDe : "NÃO"}\`;
    });
  } else {
    prompt += \`
Nenhum herdeiro cadastrado — usar [PLACEHOLDER].\`;
  }

  prompt += \`

=== BENS E DIREITOS ===\`;
  if (bens && bens.length > 0) {
    bens.forEach((b: any, i: number) => {
      prompt += \`
\${i + 1}. Tipo: \${b.tipo} | Descrição: \${b.descricao || "[PLACEHOLDER]"}
   Matrícula/Registro: \${b.matriculaRegistro || "[PLACEHOLDER]"} | Município: \${b.municipio || "[PLACEHOLDER]"}/\${b.uf || "[PLACEHOLDER]"}
   Valor estimado: R$ \${b.valorEstimado || 0} | Aquisição: \${b.formaAquisicao || "[PLACEHOLDER]"}
   Na constância: \${b.adquiridoNaConstancia ? "SIM" : "NÃO"} | Em nome de: \${b.emNomeDe || "[PLACEHOLDER]"}\`;
    });
  } else {
    prompt += \`
Bens desconhecidos — solicitar diligências investigativas.\`;
  }

  // Flags de litígio
  if (flags) {
    const flagsAtivos: string[] = [];
    if (flags.desconhecimentoPatrimonial) flagsAtivos.push(\`Desconhecimento patrimonial: \${flags.descricaoDesconhecimento}\`);
    if (flags.ocultacaoPatrimonial) flagsAtivos.push(\`Ocultação patrimonial: \${flags.descricaoOcultacao}\`);
    if (flags.doacaoInoficiosa) flagsAtivos.push(\`Doação inoficiosa: \${flags.descricaoDoacaoInoficiosa}\`);
    if (flags.simulacaoNegocioJuridico) flagsAtivos.push(\`Simulação: \${flags.descricaoSimulacao}\`);
    if (flags.alienacaoEmVida) flagsAtivos.push(\`Alienação em vida: \${flags.descricaoAlienacao}\`);
    if (flags.posseExclusivaBens) flagsAtivos.push(\`Posse exclusiva por: \${flags.possuidorExclusivo}. \${flags.descricaoPosseExclusiva}\`);
    if (flags.cobrancaFrutosAlugueis) flagsAtivos.push(\`Cobrança de frutos: \${flags.descricaoFrutos}\`);
    if (flags.conflitosEntreHerdeiros) flagsAtivos.push(\`Conflitos: \${flags.descricaoConflitos}\`);

    if (flagsAtivos.length > 0) {
      prompt += \`

=== ELEMENTOS DE LITIGIOSIDADE ===
\${flagsAtivos.join("\\n")}\`;
    }
  }

  if (cessoes && cessoes.length > 0) {
    prompt += \`

=== CESSÕES DE DIREITOS HEREDITÁRIOS ===\`;
    cessoes.forEach((c: any, i: number) => {
      prompt += \`
\${i + 1}. Cedente: \${c.cedente} → Cessionário: \${c.cessionario} | \${c.percentual}% | Formalizada: \${c.formalizada ? "SIM" : "NÃO"}\`;
    });
  }

  if (herancasCumulativas && herancasCumulativas.length > 0) {
    prompt += \`

=== HERANÇAS CUMULATIVAS ===\`;
    herancasCumulativas.forEach((hc: any, i: number) => {
      prompt += \`
\${i + 1}. Falecido: \${hc.nomeFalecido} | Data: \${hc.dataFalecimento} | Parentesco: \${hc.parentescoComDeCujus}
   Inventário aberto: \${hc.inventarioAberto ? "SIM — Proc. " + hc.numeroProcesso : "NÃO"}\`;
    });
  }

  return prompt;
}
