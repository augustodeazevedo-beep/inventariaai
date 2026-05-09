## Reestilizar logo Inventaria.AI + adicionar Fin.AI ao switcher

### Parte 1 — Reestilizar o ícone Inventaria.AI

Alinhar o badge ao padrão visual de Advoga.AI e Peticiona.AI: quadrado dark de cantos arredondados, ícone-silhueta com glow neon, borda iluminada sutil.

**Geração do novo ícone** (via `imagegen--edit_image`, usando o atual + Advoga/Peticiona como referência de estilo):
- Conceito: letra **"I" estilizada** (mantém DNA da Inventaria, diferencia das outras 3).
- Tratamento: silhueta limpa em **verde-ciano (#00d4ff → #4ade80)** com glow neon.
- Fundo: dark `#0a0e1a` arredondado com leve borda iluminada; padrão de circuito sutil ao fundo.
- Aspect ratio 1:1, transparência fora do badge.

**Arquivos atualizados** (mesmos caminhos — sem mudança de código nos componentes):
- `public/images/logo-inventaria-icon.png` (mestre)
- `public/images/logo-inventaria-icon-64.png` / `-128` / `-192` / `-256` / `-384.png` (regerados via redimensionamento PIL a partir do mestre)

### Parte 2 — Adicionar Fin.AI ao ecossistema

`Fin.AI` (gestão financeira pessoal inteligente) → `https://finai-byadvocacyia.lovable.app`.

**`src/config/ecosystem.ts`:**
- Acrescentar `"finai"` ao tipo `EcosystemAppId`.
- Importar ícone `Wallet` (lucide-react).
- Adicionar entrada:
  ```ts
  {
    id: "finai",
    name: "Fin",
    suffix: ".AI",
    description: "Gestão financeira pessoal inteligente",
    url: "https://finai-byadvocacyia.lovable.app",
    icon: Wallet,
    accent: "text-primary",
  }
  ```

**`src/components/layout/AppSwitcher.tsx`:** verificar se itera `ECOSYSTEM_APPS.map(...)` (esperado). Caso o dropdown tenha altura/grid fixos, ajustar para acomodar 4 cards empilhados verticalmente sem cortar.

### Sem mudanças
- Schema, autenticação, rotas, lógica de negócio.
- Wordmark + tagline "By Advocacy.AI" (já no padrão correto).

### Replicação cross-app (próximo passo, fora deste plano)
Adicionar Fin.AI à lista do switcher também em Inventaria/Peticiona/Advoga/Fin separadamente.