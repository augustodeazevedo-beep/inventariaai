# Banner de saudação na Home

## Objetivo
Criar um container hero no topo da **página inicial pós-login**, exibindo:
- Chip "AI-Native · Inventaria.AI" (verde-lima)
- Saudação dinâmica: "Bom dia / Boa tarde / Boa noite," + **NOME DO USUÁRIO em letras maiúsculas** (cor cyan, fonte serif/Space Grotesk em destaque)
- Data por extenso (ex: "Sábado, 09 De Maio De 2026")
- Imagem de fundo dark tech com circuito + balança da justiça (mesma vibe do print de referência)

## Arquitetura

### 1. Nova página Home pós-login
Criar `src/pages/Home.tsx` — dashboard inicial protegido. Estrutura:
- `<HeroGreetingBanner />` (novo componente)
- Grid de cards de acesso rápido aos 6 módulos existentes (Triagem, Partilha, ITCMD, Comparador, Petição, Holding) — reutilizando ícones/labels do menu já definido em `AppHeader`/`AppSidebar`.

### 2. Roteamento
Em `src/App.tsx`:
- Adicionar rota `/home` dentro de `<ProtectedRoute>` apontando para `<Home />`.
- A rota pública `/` continua exibindo `<Landing />`.
- Em `Landing.tsx` (e `Auth.tsx` após login bem-sucedido), redirecionar usuários autenticados para `/home`.
- Atualizar o link "Início" do menu mobile (`AppHeader`) e do `AppSidebar` para apontar para `/home` (atualmente aponta para `/`, que sai da área logada).

### 3. Componente `HeroGreetingBanner`
Arquivo: `src/components/home/HeroGreetingBanner.tsx`

Conteúdo:
- Lê `supabase.auth.getSession()` → `session.user.user_metadata.full_name` (fallback: parte antes do `@` do email).
- Aplica `.toUpperCase()` ao nome.
- Saudação calculada via `new Date().getHours()` (5–11: "Bom dia"; 12–17: "Boa tarde"; 18–4: "Boa noite").
- Data formatada com `Intl.DateTimeFormat('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })` + capitalização title-case.

Layout (Tailwind, semantic tokens):
```
<section class="relative overflow-hidden rounded-2xl border border-border min-h-[180px]
                bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--card))]">
  <img src={heroBg} class="absolute inset-0 w-full h-full object-cover opacity-60" />
  <div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
  <div class="relative p-6 lg:p-8 space-y-3">
    <Badge>AI-Native · Inventaria.AI</Badge>      // verde-lima outline (#c6ff3d)
    <h1 class="font-serif text-3xl lg:text-4xl font-bold">
      {greeting}, <span class="text-primary uppercase">{NAME}</span>
    </h1>
    <p class="text-sm text-muted-foreground capitalize">{date}</p>
  </div>
</section>
```

### 4. Imagem de fundo
Gerar PNG temático via `imagegen--generate_image` (premium):
- **Path**: `src/assets/hero-greeting-bg.png`
- **Dimensões**: 1920×480 (21:4 aprox., hero wide)
- **Prompt**: cena dark tech ultra-wide — gradiente azul-marinho profundo (#0a0e1a → #0f172a), balança da justiça translúcida em cyan (#00d4ff) à esquerda-centro com glow, padrão de circuito eletrônico fino e gráficos de barras estilizados à direita, partículas/linhas de luz, estética cinematográfica, sem texto.

### 5. Tokens de cor já existentes
Reutilizar `--primary` (cyan), `--background`, `--card`, `--border`, `--muted-foreground` definidos em `index.css`. Para o chip verde-lima usar variante `outline` do `Badge` com classe utilitária `border-[#c6ff3d] text-[#c6ff3d]` (única cor literal, justificada por ser destaque de "AI-Native" — alternativa: adicionar token `--accent-lime` em `index.css` e `tailwind.config.ts`).

## Arquivos afetados
**Criados**
- `src/pages/Home.tsx`
- `src/components/home/HeroGreetingBanner.tsx`
- `src/assets/hero-greeting-bg.png` (gerado)

**Editados**
- `src/App.tsx` — nova rota `/home`
- `src/pages/Auth.tsx` — redirect pós-login para `/home`
- `src/pages/Landing.tsx` — redirect se sessão ativa
- `src/components/layout/AppSidebar.tsx` — item "Início" → `/home`
- `src/components/layout/AppHeader.tsx` — item mobile "Início" → `/home`
- `src/index.css` + `tailwind.config.ts` — (opcional) token `--accent-lime`

## Fora de escopo
- Edição/cadastro de nome do usuário (já capturado no signup).
- Mudanças em outros módulos.
