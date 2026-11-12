@AGENTS.md
@tarefas.md

# Anotei

App de controle financeiro pessoal (gastos diários + contas fixas do mês), 100% offline.
Um único código Expo/React Native gera o app Android (APK via EAS) e a versão web/PWA para iPhone,
publicada no GitHub Pages.

## Stack
- Expo SDK 58, React Native 0.88, React 19, TypeScript
- React Navigation (native-stack), React Native Paper
- Dados: AsyncStorage (no navegador vira localStorage)

## Estrutura
- `App.tsx`: navegação, estado principal (gastos e contas) e leitura/gravação no AsyncStorage
- `Screens/`: Home, lista de gastos (`ExpensesList`) e contas (`Bills`)
- `components/`: modais, cards, menus, seção de backup e contas a vencer
- `Types.ts`: `Type` (gasto) e `InterfaceBill` (conta)
- `theme.ts`: cores; `components/formStyles.ts`: estilos de formulário
- `dueDates.ts`: cálculo de vencimentos
- `notifications.ts` (nativo) e `notifications.web.ts` (web, vazio): o Metro escolhe pelo sufixo `.web`
- `pwa.ts`: detecção de web/iPhone/PWA instalada
- `backup.ts`: backup/restauração em .json e lembrete a cada 30 dias (só na web)
- `public/` + `workbox-config.js`: manifest, ícones e service worker da PWA

## Regras importantes
- Chaves do AsyncStorage: `expenses`, `bills`, `backup:*`. Se mudar o formato de `Type` ou
  `InterfaceBill`, mantenha a leitura de dados antigos e confira `BACKUP_VERSION` em `backup.ts`:
  arquivos de backup já salvos precisam continuar restaurando.
- Toda mudança deve funcionar no Android **e** na web. Código específico de plataforma vai em
  arquivo `.web.ts` ou atrás de `isWeb` (`pwa.ts`).
- Na web não há notificações; o aviso de vencimento é a lista `UpcomingBills` na Home.
- No iPhone, `exportBackup` precisa ser chamado direto no toque do botão (sem `await` antes).
- Textos da interface e comentários no código em português do Brasil.
- Mensagens de commit em inglês, curtas, no imperativo (ver `git log`).

## Versões e publicação
- Android (APK) e web (PWA) saem do mesmo código e da mesma versão: o campo `version` do `app.json`
  é a única fonte. Nunca criar código, branch ou versão separada para uma plataforma.
- Toda feature nova entra nos dois ao mesmo tempo; diferenças só via `.web.ts` ou `isWeb`.
- A PWA se atualiza sozinha a cada push na `main`. O APK é publicado como release no GitHub
  (tag `vX.Y.Z` igual à `version` do `app.json`, arquivo `Anotei.apk`).

## Comandos
- `npm start` / `npm run web`: rodar em desenvolvimento
- `npx tsc --noEmit`: checar tipos (não há testes nem lint configurados)
- `npm run build:web`: gerar a PWA em `dist/`
- Push na `main` publica a PWA automaticamente (`.github/workflows/deploy-web.yml`)

## Tarefas
A lista de tarefas fica em `tarefas.md`. Faça uma por vez, na ordem, e marque como
concluída (`[x]`) ao terminar. Ao terminar cada feature (cada bloco numerado de `tarefas.md`),
rode `npx tsc --noEmit` e, se passar, faça um commit e push na `main` (incluindo o `tarefas.md`
atualizado). Não faça commit de feature pela metade.
