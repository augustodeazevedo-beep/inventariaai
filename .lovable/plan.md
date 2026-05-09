## Mudanças na Sidebar

### 1. "BY ADVOCACY.AI" abaixo do logo
No `AppSidebar.tsx`, adicionar uma linha de texto pequena, em maiúsculas com tracking aumentado, logo abaixo do wordmark "Inventaria.AI" — mesmo estilo da referência enviada (Advoga.AI):

```
Inventaria.AI
BY ADVOCACY.AI
```

- Texto: `text-[9px] uppercase tracking-[0.25em] text-sidebar-foreground/60`
- Mantém o selo "Um produto Advocacy.AI" no rodapé (não duplica visualmente, pois um é header e outro rodapé — mas posso remover o do rodapé se preferir).

### 2. Sidebar colapsável (modo ícones)

Migrar `AppSidebar` para o padrão **shadcn `Sidebar` com `collapsible="icon"`**, que já suporta nativamente o colapso para uma barra estreita mostrando apenas os ícones.

**Arquivos afetados:**
- `src/App.tsx` — envolver `<AppLayout />` com `<SidebarProvider>`.
- `src/components/layout/AppLayout.tsx` — remover wrapper manual; usar estrutura do shadcn.
- `src/components/layout/AppSidebar.tsx` — reescrever usando `Sidebar`, `SidebarContent`, `SidebarMenu`, `SidebarMenuButton` etc., com `collapsible="icon"`.
- `src/components/layout/AppHeader.tsx` — adicionar `<SidebarTrigger />` à esquerda (visível em desktop) para alternar expandido ↔ ícones. Em mobile mantém o menu existente.

**Comportamento:**
- Estado inicial: expandida (72 px → `w-72`).
- Colapsada: barra estreita (`w-14`) mostrando apenas ícones do menu; logo reduz para o ícone 64 px sem o wordmark; selo "Um produto Advocacy.AI" some.
- Tooltip nos ícones quando colapsada (nativo do shadcn).
- Estado persistido via cookie (padrão do shadcn `SidebarProvider`).

### 3. Não muda
- Cores, tokens de design, lógica de rotas, ícones do menu.
- Mobile (drawer existente continua igual).

---

**Detalhes técnicos**
- Usar `useSidebar()` para esconder o wordmark quando `state === "collapsed"`.
- `SidebarTrigger` no header (sempre visível) para garantir que o usuário pode reabrir.
- Manter `NavLink`/`useLocation` para destacar rota ativa (já existe).