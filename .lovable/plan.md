# Plano: Hub Advocacy.AI (Inventaria + Peticiona + Advoga) + Auditoria

## Contexto

- **Inventaria.AI** (este projeto): React/Vite, sucessório.
- **Peticiona.AI** (peticionaai-byadvocacyai.lovable.app): TanStack Start, peças/contratos.
- **Advoga.AI** (advogaai-byadvocacy.lovable.app): TanStack Start, gestão de escritório.
- Cada projeto tem backend Lovable Cloud (Supabase) **isolado**.
- Sua escolha: módulos distintos + cada um mantém seu backend + SSO + App Switcher.

---

## Parte 1 — Integração (App Switcher + SSO leve)

Como os 3 projetos têm backends Supabase separados, "SSO real" (mesma sessão entre domínios) exigiria um Supabase central — o que conflita com "cada um mantém seu backend". A abordagem viável e de baixo atrito:

### 1.1 — Identidade compartilhada por convenção
- Cada plataforma usa **Google OAuth como provedor primário** (já configurado aqui).
- O usuário loga com a mesma conta Google nas 3 → identidade percebida como única, sem migração de dados.
- Email é a chave de ligação para futura federação de dados.

### 1.2 — App Switcher no header
Componente `AppSwitcher` adicionado ao `AppHeader.tsx` (e replicado nas outras duas plataformas):
- Botão grid (ícone 9 pontos) que abre dropdown com 3 cards: Inventaria, Peticiona, Advoga.
- Cada card tem ícone, nome, descrição curta e badge "Atual" na plataforma corrente.
- Clique abre a outra plataforma em nova aba (`target="_blank"`), preservando a sessão atual.
- URLs centralizadas em `src/config/ecosystem.ts` para fácil manutenção.

### 1.3 — Branding unificado
- Footer/sidebar: manter "Um produto Advocacy.AI" (já existe na tela de Auth).
- Adicionar mesmo selo no `AppSidebar` e `Landing` para reforçar pertencimento ao hub.

### 1.4 — Próximos passos (fora deste plano)
Replicar `AppSwitcher` + `ecosystem.ts` nos projetos Peticiona.AI e Advoga.AI (mudanças paralelas nos outros projetos Lovable). Será proposto separadamente.

---

## Parte 2 — Auditoria completa (Segurança + Lógica)

### 2.1 — Segurança (backend)
- Rodar `supabase--linter` e `security--run_security_scan`.
- Revisar RLS da tabela `peticao_audit_logs` (única tabela existente) — verificar se INSERT está bloqueado para clientes (deve ser, edge function usa service role).
- Validar edge function `gerar-peticao`:
  - Verificação de JWT em código.
  - Validação de input com Zod.
  - Rate limiting (atualmente ausente?).
  - Vazamento de prompt/secrets em mensagens de erro.
  - Headers CORS corretos.
- Confirmar que `LOVABLE_API_KEY` e demais secrets nunca são expostos ao cliente.
- Verificar `vite.config.ts`: hard-coded fallbacks de SUPABASE_URL/KEY são publishable (OK), mas confirmar.

### 2.2 — Segurança (frontend)
- `ProtectedRoute`: confirmar que não há flicker de conteúdo protegido durante loading.
- Auth: validar fluxo de reset de senha (`/reset-password` existe).
- Sanitização de input em formulários (Triagem, Partilha, ITCMD, Petição).
- Logs no console que possam vazar dados sensíveis (CPFs, valores).

### 2.3 — Lógica de negócio
- **`partilha-calculator.ts`**: revisar cálculo conforme Art. 1.829 CC (ordem de vocação, regimes de bens, concorrência cônjuge × descendentes).
- **`CalculadoraItcmd.tsx`**: verificar alíquotas e base de cálculo (varia por UF — confirmar se está parametrizado).
- **`triagem-utils.ts`** + **`diligencias-investigativas.ts`**: revisar árvore de decisão judicial vs extrajudicial (Art. 610 CPC, Resolução 35/2007 CNJ).
- **`gerar-peticao` edge function**: revisar prompt do sistema, garantir que persona "Defensor PhD" + regras anti-alucinação estão íntegras, validar streaming SSE.
- Estados de loading e erro consistentes em todas as páginas.

### 2.4 — Performance/UX
- Lazy loading de rotas pesadas (`React.lazy` nas páginas de calculadora/petição).
- Verificar bundle size.
- Imagens: `srcset` já aplicado no logo; verificar outras imagens.

### 2.5 — Entregável
Relatório em `/mnt/documents/auditoria-inventaria.md` com:
- Achados por severidade (crítico / alto / médio / baixo).
- Correções aplicadas inline durante a auditoria (bugs óbvios).
- Recomendações para itens que exigem decisão de produto.

---

## Detalhes técnicos

**Arquivos a criar:**
- `src/config/ecosystem.ts` — URLs e metadata das 3 plataformas.
- `src/components/layout/AppSwitcher.tsx` — Dropdown com cards.

**Arquivos a editar:**
- `src/components/layout/AppHeader.tsx` — Inserir `<AppSwitcher />`.
- `src/components/layout/AppSidebar.tsx` — Reforçar selo Advocacy.AI (opcional).

**Sem mudanças de schema** — não é necessária migração SQL para esta etapa.

**Auditoria:** sem mudanças de arquitetura; apenas correções pontuais e relatório.

---

## Ordem de execução
1. Criar `ecosystem.ts` + `AppSwitcher` + integrar no header.
2. Executar auditoria (linter + scan + revisão manual de calculadoras e edge function).
3. Aplicar correções críticas/altas encontradas.
4. Gerar relatório final.