# Corrigir login Google no link público (`inventariaai.lovable.app`)

## Sintoma confirmado
A tela do Google abre, mas após autorizar, o usuário volta para `/auth` sem sessão criada. O fluxo OAuth está completando, mas a sessão Supabase não está sendo persistida no domínio publicado.

## Diagnóstico provável
O código atual em `src/pages/Auth.tsx` chama:
```ts
lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })
```
- `window.location.origin` = `https://inventariaai.lovable.app` (sem path).
- Após o broker `oauth.lovable.app` processar o callback em `/~oauth/callback`, o usuário é redirecionado para `/` (Landing).
- Em alguns casos, quando o redirect_uri é a raiz (`/`) e o handler de callback não chega a rodar antes do `Navigate`, a sessão fica num estado intermediário e o usuário acaba voltando ao `/auth`.
- Não existe nenhum gate de "admin/role" no código — a confusão sobre "admin" é provavelmente irrelevante; o problema é puramente do retorno OAuth.

## Plano de correção

### 1. Apontar `redirect_uri` para `/auth`
No `handleGoogle` de `src/pages/Auth.tsx`, trocar:
```ts
redirect_uri: window.location.origin
```
por:
```ts
redirect_uri: `${window.location.origin}/auth`
```
Assim o usuário retorna na própria tela `Auth`, onde o `onAuthStateChange` já está montado e detecta a sessão imediatamente, redirecionando para `/home`.

### 2. Garantir detecção de sessão no retorno
Confirmar que o `useEffect` de `Auth.tsx` continua chamando `supabase.auth.getSession()` após o mount (já está) — nenhuma mudança extra necessária se o passo 1 for aplicado.

### 3. Adicionar logs temporários de diagnóstico
Em `Auth.tsx`, adicionar `console.log` antes/depois do `signInWithOAuth` e dentro de `onAuthStateChange` para capturar:
- evento OAuth recebido
- presença/ausência de `session`
- erros do `result`

Assim, se mesmo após (1) o problema persistir, os logs do console aparecem automaticamente na próxima mensagem para análise.

### 4. Verificações fora do código (sem alterações automáticas)
- Confirmar que **Sign in with Google** está **ativado** em Lovable Cloud → Users → Sign In Methods.
- Conferir se o domínio `inventariaai.lovable.app` é o publicado oficial (ele é, conforme `project_urls`).
- Limpar cookies/localStorage do domínio publicado e tentar novamente após o deploy do fix.

## Arquivos afetados
- `src/pages/Auth.tsx` — única edição (handler `handleGoogle` + 2-3 `console.log`).

## Fora de escopo
- Nenhuma mudança em `lovable.auth`, configuração do Supabase, RLS, sidebar, banner de saudação ou demais módulos.
- Nenhum sistema de roles/admin será adicionado (não existe hoje, e não é a causa).
