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
- `App.tsx`: navegação, estado principal (gastos e contas) e leitura/gravação no AsyncStorage;
  ao abrir (e ao voltar ao app) lança os recorrentes e faz a virada de mês das contas
- `Screens/`: Home, lista de gastos (`ExpensesList`, por mês, com busca e gráfico), contas (`Bills`),
  `Reservas` (dinheiro guardado, com meta e movimentações) e `Recorrentes` (assinaturas)
- `components/`: modais, cards, menus, seção de backup e contas a vencer
- `Types.ts`: `Type` (gasto), `InterfaceBill` (conta) e `Reserva`
- `theme.ts`: cores (clara/escura, escolhida ao abrir pelo tema do celular), formatação e
  "ocultar valores" (`formatBRL` mostra `R$ ••••`); `components/formStyles.ts`: estilos de formulário
- `storedValues.ts`: valores avulsos (`EXTRA_KEYS`) com cópia em memória; entram no backup em `extras`
- `months.ts` (meses "AAAA-MM"), `expenseGroups.ts` (lista por dia), `search.ts` (busca),
  `installments.ts` (parcelas no crédito), `fatura.ts` (fatura do cartão), `recurring.ts`
  (gastos recorrentes), `billsMonth.ts` (virada de mês e histórico das contas), `csv.ts` (planilha)
- `biometrics.ts`/`.web.ts` + `appLock.ts` + `components/LockGate.tsx`: bloqueio com digital (Android)
- `feedback.ts`/`.web.ts`: vibração ao salvar (Android)
- `dueDates.ts`: cálculo de vencimentos
- `notifications.ts` (nativo) e `notifications.web.ts` (web, vazio): o Metro escolhe pelo sufixo `.web`
- `pwa.ts`: detecção de web/iPhone/PWA instalada
- `backup.ts`: backup/restauração em .json e lembrete a cada 30 dias (Android e web); a parte de
  arquivo fica em `backupFile.ts` (Android: expo-file-system/sharing/document-picker) e
  `backupFile.web.ts` (web: menu Compartilhar/download e seletor de arquivo)
- `userName.ts`: nome da pessoa no título da Home (toque para editar; vazio = "Suas finanças"),
  salvo na chave `nome` e incluído no backup (campo opcional `nome`)
- `paymentMethods.ts`: formas de pagamento (crédito, débito, pix) com rótulo, ícone, cor e totais
- `components/SideDrawer.tsx`: menu lateral (☰) da Home; novos itens vão na lista `drawerItems`
- `public/` + `workbox-config.js`: manifest, ícones e service worker da PWA

## Regras importantes
- Chaves do AsyncStorage: `expenses`, `bills`, `reservas`, `nome`, `backup:*` e as de
  `EXTRA_KEYS` em `storedValues.ts` (`orcamento`, `receita`, `recorrentes`...), que entram no backup
  no campo `extras`. Só do aparelho (fora do backup): `bloqueio`, `versaoVista`, `update:*`,
  `fab-position-*`. Se mudar o formato de
  `Type`, `InterfaceBill` ou `Reserva`, mantenha a leitura de dados antigos e confira
  `BACKUP_VERSION` em `backup.ts` (hoje 2): arquivos de backup já salvos (versão 1 e 2) precisam
  continuar restaurando. Dado novo que a pessoa cadastra tem que entrar no backup.
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
- O app Android avisa quando há versão nova (`updates.ts` + `components/UpdateBanner.tsx`):
  compara a tag da última release com `Application.nativeApplicationVersion` (expo-application).
  Na web `updates.web.ts` não faz nada. Única chamada de internet do app; não envia dados.

### Como publicar uma versão nova
1. Subir a `version` no `app.json` (ex: 1.0.0 → 1.1.0): correção = último número, feature = do meio.
2. Commit e push na `main` → a PWA é publicada sozinha.
3. Criar e enviar a tag: `git tag v1.1.0` e `git push origin v1.1.0`. O workflow
   `.github/workflows/release-apk.yml` confere se a tag bate com o `app.json`, gera o APK no EAS
   (perfil `production`, que gera `.apk`; o `versionCode` sobe sozinho) e cria a release com o
   arquivo `Anotei.apk`. Precisa do secret `EXPO_TOKEN` no GitHub.
   Sem o workflow (manual): `eas build -p android --profile production`, depois criar a release
   com a tag e anexar o APK com o nome exato `Anotei.apk`.
4. O README aponta para `releases/latest/download/Anotei.apk`, então sempre baixa a mais nova.
5. Quem usa o APK antigo vê o aviso "Nova versão disponível" ao abrir o app.

## Comandos
- `npm start` / `npm run web`: rodar em desenvolvimento
- `npx tsc --noEmit`: checar tipos
- `npm test`: testes (Jest, pasta `__tests__/`); `npm run lint`: ESLint; `npm run format`: Prettier
- O GitHub Actions roda tipos e testes antes de publicar a PWA e o APK
- `npm run build:web`: gerar a PWA em `dist/`
- Push na `main` publica a PWA automaticamente (`.github/workflows/deploy-web.yml`)

## Tarefas
A lista de tarefas fica em `tarefas.md`. Faça uma por vez, na ordem, e marque como
concluída (`[x]`) ao terminar. Ao terminar cada feature (cada bloco numerado de `tarefas.md`),
rode `npx tsc --noEmit` e, se passar, faça um commit e push na `main` (incluindo o `tarefas.md`
atualizado). Não faça commit de feature pela metade.
