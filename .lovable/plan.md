## Objetivo

Adicionar o wordmark "Inventaria.AI" abaixo do logotipo, com "Inventaria" em branco e ".AI" em verde-limão (cor `--primary` já presente na identidade visual), tanto na landing page quanto na aba lateral (sidebar) da plataforma.

## Alterações

### 1. `src/pages/Landing.tsx` — Hero
Logo abaixo do `<img>` do logotipo (ícone de 192px no HERO), inserir o wordmark:

```tsx
<div className="font-serif font-bold text-3xl lg:text-4xl tracking-tight">
  <span className="text-white">Inventaria</span>
  <span className="text-primary">.AI</span>
</div>
```

Posicionado entre a imagem do logo e o `<h1>` "Sucessão Inteligente".

### 2. `src/components/layout/AppSidebar.tsx` — Marca da sidebar
Atualmente a sidebar exibe apenas a imagem `logo-inventaria-full.png`. Substituir por: ícone (`logo-inventaria-icon.png`) + wordmark textual abaixo, com a mesma identidade:

```tsx
<Link to="/" className="block p-4 border-b border-sidebar-border hover:bg-sidebar-accent/30 transition-colors">
  <div className="flex flex-col items-center gap-2">
    <img
      src="/images/logo-inventaria-icon.png"
      alt="Inventaria.AI"
      className="w-20 h-20 object-contain"
    />
    <div className="font-serif font-bold text-xl tracking-tight">
      <span className="text-white">Inventaria</span>
      <span className="text-primary">.AI</span>
    </div>
  </div>
</Link>
```

Isso garante consistência visual com o footer da landing (que já usa o padrão `text-foreground` + `text-primary` para "Advocacy.AI").

## Notas técnicas

- A cor "verde limão" da identidade já existe como token `--primary` (HSL 73 100% 51%), aplicada via classe `text-primary`. Não é necessário criar nova cor.
- "Branco" será aplicado via `text-white` (Tailwind) para garantir branco puro independente do tema do sidebar.
- Fonte serifada (`font-serif`) mantém alinhamento com o wordmark "Advocacy.AI" já existente no rodapé.
- Nenhuma outra página é afetada; o `AppHeader` mobile mantém seu próprio rótulo.