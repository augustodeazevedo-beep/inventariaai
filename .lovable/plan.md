## Diagnóstico

**1. Fundo dos logotipos**
Tanto `public/images/logo-inventaria-full.png` quanto `public/images/logo-inventaria-icon.png` estão **com fundo branco** (não transparente). Por isso, em todo o app, eles aparecem dentro de "caixinhas brancas" forçadas no código (`bg-white rounded-md p-1`, `bg-white rounded-2xl p-4`) — uma gambiarra para esconder o branco contra o tema escuro. Mesmo problema em `src/assets/advocacy-ai-logo.png`.

**2. Ícone errado da Advocacy.AI**
A versão oficial em `https://advocacyai.lovable.app/` usa um ícone **"F" 3D azul/aço** (estilizado, gradiente ciano metálico) — exatamente o da `image-9.png` que você anexou. Já o asset atual `src/assets/advocacy-ai-logo.png` mostra um "F" parecido mas com a tipografia "Advocacy.AI" embaixo + texto "by Advocacy.AI" duplicado (errado para usar como ícone do rodapé). E a `image-8.png` também tem fundo escuro fixo (não transparente).

## Plano de correção

### A) Substituir os 3 logos por versões com fundo 100% transparente

Vou gerar (via ferramenta de imagem com prompt fiel à identidade) novos PNGs **sem fundo**, mantendo:
- Ícone "I" circuito verde-ciano para o Inventaria (cores existentes da marca preservadas)
- Lockup horizontal "Inventaria.AI by Advocacy.AI" para o logo full
- Ícone "F" azul metálico 3D oficial da Advocacy.AI (fiel ao site advocacyai.lovable.app)

Arquivos a substituir:
- `public/images/logo-inventaria-full.png` → fundo transparente
- `public/images/logo-inventaria-icon.png` → fundo transparente
- `src/assets/advocacy-ai-logo.png` → **apenas o ícone "F" 3D azul** (sem texto), fundo transparente — é assim que ele é usado (ao lado do texto "Advocacy.AI" renderizado em HTML)

### B) Remover as "caixinhas brancas" do código

Agora que os PNGs serão transparentes, removo os wrappers `bg-white p-1/p-4 rounded-*` em:
- `src/components/layout/AppHeader.tsx` (linha do logo mobile)
- `src/pages/Auth.tsx` (cartão grande do logo Inventaria + mini-logo Advocacy no rodapé)
- `src/pages/Landing.tsx` (rodapé com logo Advocacy + qualquer outro uso)

Os logos passarão a "respirar" sobre o fundo escuro do tema (#0a0e1a), como na referência da Advocacy.AI.

### C) Memória de marca

Atualizar `mem://branding/identity` registrando: logos sempre com fundo transparente, ícone Advocacy.AI = "F" 3D azul metálico (referência: image-9.png).

## Resultado esperado

- Header, sidebar, tela de Auth e rodapé exibirão os logos diretamente sobre o tema escuro, sem caixas brancas destoantes.
- O ícone ao lado de "Advocacy.AI" no rodapé da Landing e da página Auth passará a ser o "F" 3D azul oficial — idêntico ao usado em advocacyai.lovable.app.
- Identidade visual unificada com a desenvolvedora proprietária.

Aprove para eu executar.