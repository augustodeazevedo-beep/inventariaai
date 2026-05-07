import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dynamic CORS: refletir o Origin da requisição se ele for confiável.
const STATIC_ALLOWED = new Set<string>([
  "https://inventariaai.lovable.app",
]);
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (STATIC_ALLOWED.has(origin)) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    return (
      host.endsWith(".lovable.app") ||
      host.endsWith(".lovableproject.com") ||
      host === "localhost" ||
      host === "127.0.0.1"
    );
  } catch {
    return false;
  }
}
function buildCors(origin: string | null): Record<string, string> {
  const allowed = isAllowedOrigin(origin) ? (origin as string) : "https://inventariaai.lovable.app";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Expose-Headers": "x-request-id",
  };
}

// Erros mais comuns observados:
// 401 unauthorized      -> sessão do cliente expirou ou JWT ausente/ inválido
// 400 validation_error  -> body sem campo `dados`
// 402 no_credits        -> workspace sem créditos no Lovable AI Gateway
// 429 rate_limited      -> excedeu rate limit do gateway
// 500 ai_error          -> falha do gateway (timeout, modelo indisponível)
// 500 internal_error    -> exceção não tratada

const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const auditClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function audit(entry: {
  request_id: string;
  user_id: string | null;
  status: string;
  http_status: number;
  tipo_peticao?: string | null;
  duration_ms: number;
  error_code?: string | null;
}) {
  // Log estruturado (visível em Edge Function Logs) — sem dados sensíveis
  console.log(JSON.stringify({ scope: "gerar-peticao", ...entry }));
  try {
    await auditClient.from("peticao_audit_logs").insert({
      request_id: entry.request_id,
      user_id: entry.user_id,
      status: entry.status,
      http_status: entry.http_status,
      tipo_peticao: entry.tipo_peticao ?? null,
      duration_ms: entry.duration_ms,
      error_code: entry.error_code ?? null,
    });
  } catch (e) {
    console.error("audit_insert_failed", entry.request_id, e);
  }
}

const SYSTEM_PROMPT = "Você é um DEFENSOR PÚBLICO (USP; doutorado/PhD) especialista em Direito das Sucessões, Processo Civil e Direito Tributário, com atuação consolidada em inventários litigiosos de alta complexidade.\n\nSua linguagem é técnico-jurídica, formal, persuasiva e institucional, compatível com peças protocoladas perante Vara de Família e Sucessões, resguardando sempre os interesses do assistido da Defensoria Pública.\n\nREGRAS ABSOLUTAS — ANTI-ALUCINAÇÃO:\n1. Não invente dados. Dados ausentes devem usar [PLACEHOLDER: descrição].\n2. Toda referência a prova deve citar o NOME DO DOCUMENTO.\n3. Citações legais devem ser transcritas literalmente com fonte completa.\n4. Qualquer simulação de dado deve ser marcada como (FICTÍCIO).\n\nFORMATAÇÃO PADRÃO DPE.RS:\n- Títulos Principais em MAIÚSCULAS, negrito\n- Subtítulos com letras maiúsculas iniciais, negrito\n- Títulos numerados hierarquicamente: I. / I.1. / I.1.a.\n- Texto limpo, sem marcas de IA, sem símbolos estranhos\n\nESTRUTURA DA PETIÇÃO:\n1. Endereçamento (Vara de Família e Sucessões)\n2. Qualificação do requerente (Defensor Público) e do AUTOR DA HERANÇA (MAIÚSCULAS)\n3. Síntese fática (óbito, vínculos, contexto)\n4. Fundamentação jurídica (CPC e CC — transcrever artigos citados)\n5. Relação de bens e direitos (se conhecidos)\n6. Relação de dívidas conhecidas\n7. Ordem de vocação hereditária com herdeiros identificados (NOMES MAIÚSCULOS)\n8. Indicação do inventariante\n9. Pedidos finais numerados\n10. Local, data e assinatura\n\nSe o inventário for LITIGIOSO, inclua obrigatoriamente:\n- Capítulo sobre o caráter litigioso\n- Capítulo sobre desconhecimento patrimonial (se aplicável)\n- Capítulo sobre diligências investigativas (bancárias, fiscais, registrárias, veiculares, societárias, digitais)\n- Capítulo sobre ocultação patrimonial, simulação e doações inoficiosas (se aplicável)\n- Capítulo sobre posse exclusiva de bens e frutos (se aplicável)\n- Capítulo sobre cessões de direitos hereditários (se aplicável)\n- Capítulo sobre heranças cumulativas (se aplicável)\n- Pedidos subsidiários e condicionais\n\nSAÍDA PÓS-PEÇA (OBRIGATÓRIO):\nApós a petição, inclua seção OBSERVAÇÕES AO OPERADOR com:\n- Lista de PLACEHOLDERS com descrição\n- Recomendações documentais imediatas\n- Indicação: PEÇA GERADA COMO RASCUNHO — revisar, adaptar e assinar por Defensor(a) Público(a) antes do protocolo";

serve(async (req) => {
  const corsHeaders = buildCors(req.headers.get("Origin"));
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let userId: string | null = null;
  let tipoPeticao: string | null = null;

  try {
    // Require authenticated user to prevent anonymous AI credit abuse
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      await audit({ request_id: requestId, user_id: null, status: "unauthorized", http_status: 401, duration_ms: Date.now() - startedAt, error_code: "missing_bearer" });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json", "x-request-id": requestId },
      });
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      await audit({ request_id: requestId, user_id: null, status: "unauthorized", http_status: 401, duration_ms: Date.now() - startedAt, error_code: "invalid_jwt" });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json", "x-request-id": requestId },
      });
    }
    userId = userData.user.id;

    // Rate limit por usuário: máx 10 chamadas/min (mitiga abuso de créditos AI)
    try {
      const since = new Date(Date.now() - 60_000).toISOString();
      const { count } = await auditClient
        .from("peticao_audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since);
      if ((count ?? 0) >= 10) {
        await audit({ request_id: requestId, user_id: userId, status: "rate_limited_user", http_status: 429, duration_ms: Date.now() - startedAt, error_code: "user_quota_exceeded" });
        return new Response(JSON.stringify({ error: "Limite por usuário excedido. Aguarde 1 minuto." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "x-request-id": requestId },
        });
      }
    } catch (e) {
      console.error("rate_limit_check_failed", requestId, e);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      await audit({ request_id: requestId, user_id: userId, status: "validation_error", http_status: 400, duration_ms: Date.now() - startedAt, error_code: "invalid_json" });
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json", "x-request-id": requestId },
      });
    }
    const dados = body?.dados;
    if (!dados || typeof dados !== "object") {
      await audit({ request_id: requestId, user_id: userId, status: "validation_error", http_status: 400, duration_ms: Date.now() - startedAt, error_code: "missing_dados" });
      return new Response(JSON.stringify({ error: "Campo `dados` obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json", "x-request-id": requestId },
      });
    }
    tipoPeticao = typeof dados?.resultado?.natureza === "string" ? dados.resultado.natureza : null;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = buildPromptFromData(dados);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + LOVABLE_API_KEY,
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
        await audit({ request_id: requestId, user_id: userId, status: "rate_limited", http_status: 429, tipo_peticao: tipoPeticao, duration_ms: Date.now() - startedAt });
        return new Response(JSON.stringify({ error: "Limite de requisições excedido." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "x-request-id": requestId },
        });
      }
      if (response.status === 402) {
        await audit({ request_id: requestId, user_id: userId, status: "no_credits", http_status: 402, tipo_peticao: tipoPeticao, duration_ms: Date.now() - startedAt });
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json", "x-request-id": requestId },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", requestId, response.status, t);
      await audit({ request_id: requestId, user_id: userId, status: "ai_error", http_status: 500, tipo_peticao: tipoPeticao, duration_ms: Date.now() - startedAt, error_code: `gateway_${response.status}` });
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json", "x-request-id": requestId },
      });
    }

    await audit({ request_id: requestId, user_id: userId, status: "success", http_status: 200, tipo_peticao: tipoPeticao, duration_ms: Date.now() - startedAt });
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "x-request-id": requestId },
    });
  } catch (e) {
    console.error("gerar-peticao error:", requestId, e);
    await audit({ request_id: requestId, user_id: userId, status: "internal_error", http_status: 500, tipo_peticao: tipoPeticao, duration_ms: Date.now() - startedAt, error_code: e instanceof Error ? e.name : "unknown" });
    return new Response(JSON.stringify({ error: "Erro interno ao gerar a petição.", request_id: requestId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json", "x-request-id": requestId },
    });
  }
});

function buildPromptFromData(dados: any): string {
  const { falecido, herdeiros, bens, flags, cessoes, herancasCumulativas, resultado, contextoAdicional } = dados;

  const lines: string[] = [
    "Gere uma PETIÇÃO INICIAL DE INVENTÁRIO com base nos dados abaixo.",
    "",
    "=== DADOS DO FALECIDO (DE CUJUS) ===",
    "Nome: " + (falecido.nome || "[PLACEHOLDER: nome do falecido]"),
    "CPF: " + (falecido.cpf || "[PLACEHOLDER: CPF]"),
    "Data do Falecimento: " + (falecido.dataFalecimento || "[PLACEHOLDER: data]"),
    "Estado Civil: " + (falecido.estadoCivil || "[PLACEHOLDER: estado civil]"),
    "Regime de Bens: " + (falecido.regimeBens || "N/A"),
    "Último Domicílio: " + (falecido.ultimoDomicilio || "[PLACEHOLDER]") + " - " + (falecido.ufDomicilio || "[PLACEHOLDER: UF]"),
    "Profissão: " + (falecido.profissao || "[PLACEHOLDER]"),
    "Testamento: " + (falecido.possuiTestamento === true ? "SIM" : falecido.possuiTestamento === false ? "NÃO" : "A VERIFICAR"),
    "",
    "=== VIA E NATUREZA ===",
    "Via: " + (resultado?.via || "A definir"),
    "Natureza: " + (resultado?.natureza || "A definir"),
    "Justificativa: " + (resultado?.justificativa || ""),
    "",
    "=== HERDEIROS ===",
  ];

  if (herdeiros && herdeiros.length > 0) {
    herdeiros.forEach((h: any, i: number) => {
      lines.push((i + 1) + ". " + (h.nome || "[PLACEHOLDER]") + " — Parentesco: " + h.parentesco + " | CPF: " + (h.cpf || "[PLACEHOLDER]"));
      lines.push("   Menor: " + (h.menor ? "SIM" : "NÃO") + " | Incapaz: " + (h.incapaz ? "SIM" : "NÃO") + " | Concorda: " + (h.concorda ? "SIM" : "NÃO"));
      lines.push("   Renunciou: " + (h.renunciou ? "SIM" : "NÃO") + " | Pré-morto: " + (h.falecido ? "SIM" : "NÃO"));
      lines.push("   Representação: " + (h.representante ? "SIM — representa " + h.representaDe : "NÃO"));
    });
  } else {
    lines.push("Nenhum herdeiro cadastrado — usar [PLACEHOLDER].");
  }

  lines.push("", "=== BENS E DIREITOS ===");
  if (bens && bens.length > 0) {
    bens.forEach((b: any, i: number) => {
      lines.push((i + 1) + ". Tipo: " + b.tipo + " | Descrição: " + (b.descricao || "[PLACEHOLDER]"));
      lines.push("   Matrícula/Registro: " + (b.matriculaRegistro || "[PLACEHOLDER]") + " | Município: " + (b.municipio || "[PLACEHOLDER]") + "/" + (b.uf || "[PLACEHOLDER]"));
      lines.push("   Valor estimado: R$ " + (b.valorEstimado || 0) + " | Aquisição: " + (b.formaAquisicao || "[PLACEHOLDER]"));
      lines.push("   Na constância: " + (b.adquiridoNaConstancia ? "SIM" : "NÃO") + " | Em nome de: " + (b.emNomeDe || "[PLACEHOLDER]"));
    });
  } else {
    lines.push("Bens desconhecidos — solicitar diligências investigativas.");
  }

  if (flags) {
    const flagsAtivos: string[] = [];
    const safe = (v: any) => (v && String(v).trim() ? String(v).trim() : "[sem descrição]");
    if (flags.desconhecimentoPatrimonial) flagsAtivos.push("Desconhecimento patrimonial: " + safe(flags.descricaoDesconhecimento));
    if (flags.ocultacaoPatrimonial) flagsAtivos.push("Ocultação patrimonial: " + safe(flags.descricaoOcultacao));
    if (flags.doacaoInoficiosa) flagsAtivos.push("Doação inoficiosa: " + safe(flags.descricaoDoacaoInoficiosa));
    if (flags.simulacaoNegocioJuridico) flagsAtivos.push("Simulação: " + safe(flags.descricaoSimulacao));
    if (flags.alienacaoEmVida) flagsAtivos.push("Alienação em vida: " + safe(flags.descricaoAlienacao));
    if (flags.posseExclusivaBens) flagsAtivos.push("Posse exclusiva por: " + safe(flags.possuidorExclusivo) + ". " + safe(flags.descricaoPosseExclusiva));
    if (flags.cobrancaFrutosAlugueis) flagsAtivos.push("Cobrança de frutos: " + safe(flags.descricaoFrutos));
    if (flags.conflitosEntreHerdeiros) flagsAtivos.push("Conflitos: " + safe(flags.descricaoConflitos));

    if (flagsAtivos.length > 0) {
      lines.push("", "=== ELEMENTOS DE LITIGIOSIDADE ===");
      flagsAtivos.forEach((f) => lines.push(f));
    }
  }

  if (cessoes && cessoes.length > 0) {
    lines.push("", "=== CESSÕES DE DIREITOS HEREDITÁRIOS ===");
    cessoes.forEach((c: any, i: number) => {
      lines.push((i + 1) + ". Cedente: " + c.cedente + " → Cessionário: " + c.cessionario + " | " + c.percentual + "% | Formalizada: " + (c.formalizada ? "SIM" : "NÃO"));
    });
  }

  if (herancasCumulativas && herancasCumulativas.length > 0) {
    lines.push("", "=== HERANÇAS CUMULATIVAS ===");
    herancasCumulativas.forEach((hc: any, i: number) => {
      lines.push((i + 1) + ". Falecido: " + hc.nomeFalecido + " | Data: " + hc.dataFalecimento + " | Parentesco: " + hc.parentescoComDeCujus);
      lines.push("   Inventário aberto: " + (hc.inventarioAberto ? "SIM — Proc. " + hc.numeroProcesso : "NÃO"));
    });
  }

  if (contextoAdicional) {
    lines.push("", "=== CONTEXTO ADICIONAL / INSTRUÇÕES DO OPERADOR ===");
    lines.push(contextoAdicional);
  }

  return lines.join("\n");
}
