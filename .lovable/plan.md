
# Auditoria de Código, Segurança e Privacidade — Inventaria.AI

## 1. Resultado dos varredores automáticos

- **Security Scanner Lovable**: nenhum achado.
- **Supabase Linter (DB)**: nenhum issue.
- **RLS** em `peticao_audit_logs`: SELECT restrito por `auth.uid() = user_id`; INSERT/UPDATE/DELETE bloqueados a roles públicos (insert é feito via service role na edge function — correto).
- **Edge function `gerar-peticao`**: exige Bearer JWT, valida com `getUser`, audita request_id, status, http_status, duração — sem PII.

## 2. Achados da revisão manual

### 🔴 Crítico
Nenhum.

### 🟠 Alto
1. **CORS fixo em produção quebra preview / domínios**
   `supabase/functions/gerar-peticao/index.ts` define `Access-Control-Allow-Origin = https://inventariaai.lovable.app`. Isso bloqueia chamadas vindas de:
   - URL de preview (`*.lovableproject.com`)
   - URL de preview com ID (`id-preview--*.lovable.app`)
   - Eventual domínio próprio.
   **Correção:** validar `Origin` contra allowlist (lovable.app, lovableproject.com, custom domain) e refletir o origin permitido no header.

2. **Vazamento de mensagem de erro interna no catch genérico**
   No `catch` final, a resposta retorna `e.message` diretamente para o cliente. Pode expor detalhes internos. **Correção:** retornar mensagem genérica e manter detalhes apenas no log/audit.

### 🟡 Médio
3. **Lógica de partilha — divergência de "tipoDivisao"**
   Em `src/lib/partilha-calculator.ts` o branch `else` (linha 93) está comentado como “igualitária simples”, mas é executado quando `tipoDivisao !== "igualitaria"`. A lógica correta de Código Civil só roda quando o usuário escolhe "igualitaria"; outros modos (`legitima`, `proporcional`, etc.) caem em divisão simples por número total de herdeiros — ignora cônjuge x descendentes e regimes. **Correção:** padronizar para sempre aplicar regras do CC e usar `tipoDivisao` apenas para preferências auxiliares.

4. **Cálculo da meação na comunhão universal**
   `meacao = (monteMor − dividas) * 0.5` desconta dívidas antes da meação, mas em seguida `heranca = monteMor − dividas − meacao`, o que faz dívidas serem deduzidas duas vezes. **Correção:** calcular meação sobre `monteMor*0.5` e depois `heranca = monteMor − meacao − dividas` (dívidas deduzidas uma única vez).

5. **ITCMD — fração e acumulação**
   `CalculadoraItcmd.tsx` aplica `valor * fração/100` apenas no monte, mas calcula ITCMD por beneficiário usando o `acumulado` total para cada beneficiário independentemente — pode superestimar quando há vários beneficiários distintos com bases independentes. **Correção:** acumulado é por par doador/donatário; aplicar individualmente, não global.

6. **`possuidorExclusivo` e demais campos opcionais entram no prompt mesmo quando `posseExclusivaBens=false`** (linha 220 do edge). Risco de incluir lixo no prompt e gerar alucinação. **Correção:** já há filtro por flag — confirmar e remover concatenações de string `undefined`.

7. **GeradorPeticao não usa dados da Triagem**
   Página gera petição apenas com nome/data — todo o restante vai como `[PLACEHOLDER]`. Sem persistência da triagem, fluxo prometido na landing ("da triagem à sentença") não se concretiza. **Correção (futuro):** persistir triagem no DB ou em sessionStorage e injetar em `dados`.

### 🟢 Baixo / Hardening
8. **Senha mínima 6** no Auth.tsx — usar mínimo 8 + ativar **HIBP leaked password check** via `configure_auth`.
9. **Sem rate limit por usuário** no edge — Lovable AI Gateway protege globalmente, mas adicionar contagem em `peticao_audit_logs` (ex.: máx 10 chamadas/min por user_id) reduz abuso.
10. **`console.error(e)` em GeradorPeticao.tsx (linha 163)** pode logar token/dados em browser. Trocar por mensagem genérica.
11. **`Auth.tsx`**: `emailRedirectTo: window.location.origin + "/"` está OK, mas falta página `/reset-password` e link "Esqueci minha senha".
12. **Alerta visual sobre "padrão DPE"** ainda aparece em `GeradorPeticao.tsx` (linha 183) — inconsistente com a decisão de neutralizar a linguagem (advogados particulares).

## 3. Plano de correção (a executar após aprovação)

### Backend
- Editar `supabase/functions/gerar-peticao/index.ts`:
  - Implementar CORS dinâmico com allowlist (`*.lovable.app`, `*.lovableproject.com`, custom).
  - Sanitizar resposta de erro do `catch` final (não vazar `e.message`).
  - Adicionar rate limit simples: `select count(*) from peticao_audit_logs where user_id=$1 and created_at > now()-interval '1 minute'` → bloquear se ≥10.
  - Garantir que apenas flags ativas entram no prompt.

### Frontend
- `src/lib/partilha-calculator.ts`:
  - Corrigir dupla dedução de dívidas em comunhão universal.
  - Aplicar regras do CC em todos os modos de divisão (não apenas "igualitaria"); manter `tipoDivisao` só para variações documentadas.
- `src/pages/CalculadoraItcmd.tsx`: revisar acumulado individual por beneficiário.
- `src/pages/GeradorPeticao.tsx`:
  - Trocar texto "formatação DPE" por "formatação técnico-forense".
  - Remover `console.error(e)`.
- `src/pages/Auth.tsx`:
  - `minLength={8}`.
  - Adicionar link "Esqueci minha senha" + página `/reset-password`.

### Segurança backend (auth)
- Habilitar **HIBP password check** via `configure_auth(password_hibp_enabled: true)`.

### Persistência (opcional, médio prazo)
- Criar tabela `triagens` com RLS por `user_id` e popular `GeradorPeticao` automaticamente a partir da última triagem do usuário.

## 4. Sobre o link público https://inventariaai.lovable.app
A causa mais provável da inacessibilidade externa relatada é justamente o item **#1 (CORS fixo)** combinado com o `verify_jwt` da edge — usuários não logados disparavam OPTIONS/POST e recebiam erro de origem ou 401. Após o fix do CORS dinâmico + página de login funcional, o acesso externo deve normalizar. Se persistir, será necessário re-publicar (Frontend changes exigem clique em "Update" no diálogo Publish).

---

Aprove para que eu execute as correções acima na ordem: Alto → Médio → Hardening.
