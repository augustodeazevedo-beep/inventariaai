# Reduzir o letreiro do banner de saudação

## Objetivo
Diminuir o destaque visual do hero de boas-vindas em `/home` para que ele cumpra apenas o papel de cumprimento e não compita com os cards de ferramentas (que são o foco real da página). Mantém a mesma imagem de fundo (balança + circuito).

## Mudanças no `HeroGreetingBanner.tsx`

**Tipografia (reduções)**
- Saudação `<h1>`: `text-2xl sm:text-3xl lg:text-4xl` → `text-base sm:text-lg lg:text-xl`, peso `font-semibold` (em vez de `font-bold`).
- Nome do usuário: mantém maiúsculas e cor cyan (`text-accent`), mas no mesmo tamanho da saudação (sem `tracking-wide` agressivo).
- Data: `text-xs sm:text-sm` → `text-[11px]`, opacidade um pouco mais baixa.
- Chip "AI-NATIVE · INVENTARIA.AI": `text-[11px]` → `text-[10px]`, padding reduzido (`px-2.5 py-0.5`).

**Altura do container**
- `min-h-[180px] lg:min-h-[200px]` → `min-h-[96px] lg:min-h-[110px]`.
- Padding interno: `p-6 lg:p-8` → `px-5 py-4 lg:px-6 lg:py-5`.
- Espaçamento vertical entre elementos: `gap-3` → `gap-1.5`.

**Imagem de fundo**
- Mantida (`hero-greeting-bg.png`), mas com opacidade ajustada de `opacity-70` → `opacity-50` para não puxar o olhar.
- Gradiente mantido para garantir contraste do texto.

**Layout responsivo**
- Em telas ≥ `sm`: chip e saudação podem ficar na mesma linha (`flex-wrap items-center`) para deixar o bloco ainda mais compacto. Em mobile, mantém empilhado.

## Fora de escopo
- Cards de acesso rápido, sidebar, header, rotas — sem alterações.
- Imagem gerada permanece como está.

## Arquivo afetado
- `src/components/home/HeroGreetingBanner.tsx` (única edição)
