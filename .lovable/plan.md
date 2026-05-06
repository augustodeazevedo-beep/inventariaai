## Resultado da auditoria de segurança

Executei nova varredura completa após as correções anteriores:

- **Security scanner:** ✅ Nenhum problema encontrado.
- **Database linter (Supabase):** ✅ Nenhum issue.
- **Auth config:** ✅ HIBP ativo, signup com confirmação de email.
- **Edge function `gerar-peticao`:** ✅ JWT validado em código, CORS restrito a `https://inventariaai.lovable.app`, sem segredos vazados.
- **RLS:** Não há tabelas públicas no schema (não há dados sensíveis expostos no momento).

Conclusão: postura de segurança atual está limpa. O que falta é **observabilidade** (logs de auditoria) — endereçada abaixo.

## Problema do acesso externo (https://inventariaai.lovable.app)

O HTML publicado responde 200, mas o bundle servido é **antigo** (o `<title>` ainda diz "Inventario Inteligente, do diagnostico a sentenca", anterior à reescrita do slogan). Ou seja: o site publicado **não foi atualizado** desde as últimas mudanças (landing, cores do logo, correções de segurança do `GeradorPeticao.tsx`).

No Lovable, **mudanças de frontend exigem clique manual em "Update" no diálogo Publish** para irem ao ar (somente backend/edge functions/DB sobem automaticamente). É por isso que o link externo aparece "preto/quebrado": versão obsoleta do JS.

Ação necessária após este plano: clicar em **Publish → Update** para republicar.

## Plano de implementação

### 1. Tabela de auditoria `peticao_audit_logs`
Migration nova com:
- `id uuid pk`, `user_id uuid`, `created_at timestamptz default now()`
- `status text` (success / unauthorized / rate_limited / no_credits / ai_error / internal_error / validation_error)
- `http_status int`
- `tipo_peticao text` (ex.: `inventario_consensual`) — sem dados pessoais
- `duration_ms int`
- `error_code text` (curto, sem stack)
- `request_id text` (uuid gerado por chamada, devolvido ao cliente)

RLS:
- Habilitar RLS.
- Policy SELECT: usuário lê apenas `user_id = auth.uid()`.
- Sem policy INSERT (writes só pela edge function via service role).

### 2. Atualizar edge function `gerar-peticao`
- Gerar `request_id` no início.
- Cliente com `SERVICE_ROLE_KEY` apenas para gravar o log (separado do client de auth).
- Inserir 1 linha em `peticao_audit_logs` em cada caminho de saída (sucesso, 401, 402, 429, 500, validation).
- **Não** logar `dados`, nomes, CPF ou conteúdo da petição. Somente metadados acima.
- Adicionar `console.log` estruturado JSON (`{request_id, user_id, status, http_status, duration_ms}`) — visível em Edge Function Logs.
- Validação simples do payload (presença de `dados` objeto) → status `validation_error`.

### 3. Cliente
- Em `src/pages/GeradorPeticao.tsx`: ler `x-request-id` do header de resposta e exibir no toast de erro ("Código: …") para suporte.

### 4. Análise dos erros mais comuns (documentar no README curto da função)
Comentário no topo de `gerar-peticao/index.ts` com tabela: 401 (sessão expirada), 402 (créditos), 429 (rate limit), 500 (gateway IA), validation_error (payload faltando).

### Detalhes técnicos

```text
client → POST /gerar-peticao (Bearer JWT)
  ├─ valida JWT (getUser)         → falha: log status=unauthorized 401
  ├─ valida payload                → falha: log status=validation_error 400
  ├─ chama Lovable AI Gateway
  │    ├─ 429 → log rate_limited
  │    ├─ 402 → log no_credits
  │    └─ !ok → log ai_error 500
  └─ stream OK → log success 200 (após start do stream)
```

Sem alteração de schema em tabelas existentes. Nenhum dado sensível persistido.
