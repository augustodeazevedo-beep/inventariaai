
# Rebranding Inventaria.AI — alinhamento à identidade Advocacy.IA

## Diagnóstico

A identidade atual do Inventaria.AI (navy escuro + ciano + violeta) **não corresponde** à identidade real da Advocacy.IA, que é:

- **Fundo:** placa de circuito impresso em **cinza claro/grafite** com trilhas em **verde-lima neon** (#C5FF3D aprox.) e **ciano** (#22D3EE aprox.)
- **Logotipo:** letra **"A"** estilizada com trilhas e nós de circuito em verde-lima + texto **"Advocacy"** em grafite e **"IA"** em ciano
- **Tipografia:** sans-serif geométrica condensada, peso variável (títulos enormes contrastando com tags pequenas tipo "LEGAL AI LAB | AI-NATIVE")
- **Tom:** "tech jurídico" — limpo, técnico, com cards translúcidos e tags em caixa alta
- **Linguagem visual:** chips "MÓDULOS DE OPERAÇÃO", "OPERADOR", "AI-NATIVE", "IN-COMPANY", "HANDS-ON", "LIVE"

## O que será feito

### 1. Logotipo Inventaria.AI (gerado por IA)

Criar um logotipo no **mesmo idioma visual** do logo da Advocacy.IA:

- Letra **"I"** ou monograma **"iA"** estruturado como placa de circuito em verde-lima neon, com nós/pontos brilhantes
- Símbolo discreto remetendo a sucessões/inventário — uma **balança miniatura** ou **árvore genealógica** integrada às trilhas do circuito (mantendo paralelo com a balança da Advocacy.IA)
- Texto "Inventaria" em grafite + ".AI" em ciano (mesmo padrão da marca-mãe)
- Versões: ícone quadrado (favicon/sidebar) + lockup horizontal completo (header/landing/footer)
- Geração via Lovable AI (`google/gemini-3-pro-image-preview`) → salvos em `public/images/logo-inventaria-icon.png` e `public/images/logo-inventaria-full.png`
- Atualizar `public/favicon.ico` / `<link rel="icon">` no `index.html`

### 2. Sistema de design (paleta + tipografia)

Atualizar `src/index.css` e `tailwind.config.ts`:

| Token | Antes | Depois |
|---|---|---|
| `--primary` (verde-lima neon) | ciano | **`75 95% 60%`** (#C5FF3D aprox.) |
| `--accent` (ciano elétrico) | violeta | **`190 95% 55%`** (#22D3EE aprox.) |
| `--background` | navy 8% | **cinza grafite tech `220 15% 12%`** |
| `--card` | navy 12% | grafite translúcido com leve verde |
| Glow tokens | `--cyan-glow`, `--violet-glow` | **`--lime-glow`, `--cyan-glow`** |
| `gradient-text` | cyan→violet | **lime→cyan** |

Tipografia:
- Títulos: **Space Grotesk** (mantém) — usado em peso 700 com tracking apertado para títulos enormes ao estilo Advocacy.IA
- Body: **Inter** (mantém)
- Adicionar utilitário `.tag-chip` (caixa alta, tracking largo, borda fina) para reproduzir as etiquetas "LEGAL AI LAB | AI-NATIVE"

### 3. Background global

Substituir `public/images/capa-bg.jpeg` (foto genérica) por **textura de placa de circuito** semelhante à Advocacy.IA:

- Gerar via IA (`google/gemini-3-pro-image-preview`): plano cinza grafite com trilhas de PCB verde-lima e ciano, foco suave, perspectiva diagonal
- Salvar em `public/images/circuit-bg.jpg`
- Ajustar `.bg-page-overlay` para overlay mais sutil (a textura deve aparecer mais)

### 4. Landing page (`src/pages/Landing.tsx`) — reescrita

Estrutura inspirada na Advocacy.IA:

```text
┌──────────────────────────────────────────┐
│  [HERO]                                   │
│   tag chip: "LEGAL AI LAB | INVENTÁRIO"   │
│   H1 enorme em duas cores:                │
│     "Inventário Inteligente"  (lima)      │
│     "do diagnóstico à sentença" (branco)  │
│   sub-headline + 2 CTAs                   │
│   [logo central grande sobre o circuito]  │
├──────────────────────────────────────────┤
│  [OPERADOR / SOBRE]                       │
│   chip "OPERADOR" + descrição da plataforma│
├──────────────────────────────────────────┤
│  [MÓDULOS DE OPERAÇÃO]                    │
│   4 cards principais com chips            │
│   ("AI-NATIVE", "AUTO-CALC", "FISCAL",   │
│    "DRAFTING") — borda fina, hover glow   │
├──────────────────────────────────────────┤
│  [DIFERENCIAIS]                           │
│   3 features (anti-alucinação, padrão DPE,│
│   integração total)                       │
├──────────────────────────────────────────┤
│  [CTA FINAL]                              │
│   "Comece agora" + assinatura Advocacy.IA │
└──────────────────────────────────────────┘
```

### 5. Componentes de layout

- **`AppSidebar`**: substituir texto "Inventaria.AI" pelo `<img>` do logo gerado; adicionar mini-logo Advocacy.IA no rodapé da sidebar
- **`AppHeader`**: usar versão ícone do logo ao lado do título
- **`AppLayout` (footer)**: trocar texto "Advocacy.IA" por logo oficial em PNG (gerado/extraído com cores corretas)

### 6. Itens fora de escopo (deixar para próxima iteração se desejar)

- Multilíngue PT/EN/ES (Advocacy.IA tem)
- Página "Sobre o operador"
- Botão WhatsApp flutuante

## Detalhes técnicos

- **Geração de imagens**: edge function temporária ou script Node usando `LOVABLE_API_KEY` chamando `https://ai.gateway.lovable.dev/v1/chat/completions` com `google/gemini-3-pro-image-preview` (modalidade image+text) → decodificar base64 → salvar PNG em `public/images/`
- **Sem mudanças de banco** — rebranding é puramente front-end
- **Sem alteração de rotas** — `/` continua sendo a Landing
- **QA visual**: após gerar logo e bg, inspecionar os PNGs antes de commitar; iterar prompt se o resultado não casar com a estética do Advocacy.IA

## Arquivos afetados

- **Criar**: `public/images/logo-inventaria-icon.png`, `public/images/logo-inventaria-full.png`, `public/images/circuit-bg.jpg`, `public/favicon.png`
- **Editar**: `src/index.css`, `tailwind.config.ts`, `src/pages/Landing.tsx`, `src/components/layout/AppSidebar.tsx`, `src/components/layout/AppHeader.tsx`, `src/components/layout/AppLayout.tsx`, `index.html`
- **Remover**: `public/images/capa-bg.jpeg` (substituído), `public/favicon.ico` (substituído por `.png`)

Confirmando o plano, executo tudo na sequência: gero as imagens → aplico paleta → reescrevo a Landing → atualizo header/sidebar/footer → QA visual.
