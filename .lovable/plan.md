## Problema

A landing page renderiza todo o conteúdo (verifiquei via browser: as 4 seções de módulos estão no DOM), mas **classes CSS essenciais não existem**, então os cards e chips ficam sem background/borda/padding, parecendo "tela preta".

### Classes/variáveis ausentes detectadas

| Classe / Variável | Usada em | Status |
|---|---|---|
| `section-card` | `Landing.tsx` (cards de módulos e diferenciais) | **não definida** |
| `tag-chip` | `Landing.tsx` (todos os chips), `AppHeader.tsx` | **não definida** |
| `bg-page-pattern` | `AppLayout.tsx`, `Auth.tsx` | **não definida** |
| `bg-page-overlay` | `AppLayout.tsx`, `Auth.tsx` | **não definida** |
| `bg-header` / `text-header-foreground` | `AppHeader.tsx` | tailwind referencia `--header-*`, mas vars **não declaradas** em `:root` |
| `--success` / `--info` / `--warning` | `tailwind.config.ts` | **não declaradas** em `:root` |

## Correções (apenas em `src/index.css`)

### 1. Adicionar variáveis ausentes em `:root` (na identidade Inventaria.AI)
```css
--header-background: 219 21% 11%;
--header-foreground: 210 28% 93%;
--success: 73 100% 51%;
--success-foreground: 217 17% 9%;
--info: 189 82% 51%;
--info-foreground: 217 17% 9%;
--warning: 40 100% 60%;
--warning-foreground: 217 17% 9%;
```

### 2. Adicionar utilitários ausentes em `@layer utilities`

- **`.section-card`** — fundo `hsl(var(--card))`, borda `hsl(var(--border))`, `border-radius: var(--radius)`, padding 1.5rem, transição.
- **`.tag-chip`** — pílula uppercase com letter-spacing 0.18em, fundo `primary/10`, borda `primary/25`, cor `primary`, padding 0.25rem 0.625rem, font-size 0.65rem.
- **`.bg-page-pattern`** — fundo `hsl(var(--background))` + `radial-gradient` discreto (mesmo motivo que já está aplicado no `body`, agora reutilizável).
- **`.bg-page-overlay`** — `background: linear-gradient(180deg, transparent, hsl(var(--background)/0.6))` para suavizar leitura.

### 3. Corrigir chave extra em `src/index.css`

A linha **139** tem um `}` solitário fechando algo que já está fechado (a regra `.rule-neon` na 138 já se fecha sozinha). Vou remover esse `}` órfão para evitar que regras adicionadas no fim do arquivo fiquem fora do `@layer utilities`.

## Resultado esperado

- Os 4 cards de módulos voltam a ter fundo escuro com borda visível e hover neon.
- Os chips ("Legal AI Lab · Inventário · AI-Native", "AI-NATIVE", etc.) viram pílulas verdes-limão.
- Header da plataforma e fundo das páginas internas ficam com a textura grafite consistente.
- Página `/auth` ganha o fundo padrão.

Nenhuma alteração é necessária em componentes, rotas ou backend.