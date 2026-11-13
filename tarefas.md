# Tarefas

Origem: `melhorias.md`. Uma tarefa por vez, na ordem. Ao terminar um bloco: `npx tsc --noEmit`,
marcar `[x]`, commit e push (ver CLAUDE.md).

## Regras que valem para todas
- Campo novo em `Type`, `InterfaceBill` ou `Reserva` é sempre **opcional** (`?`), para dados antigos
  e backups antigos continuarem funcionando. Assim não precisa subir `BACKUP_VERSION`.
- Chave nova no AsyncStorage: acrescentar em `EXTRA_KEYS` (`storedValues.ts`) e usar
  `useStoredValue`/`setStored`; assim ela já entra no backup. Anotar a chave em CLAUDE.md.
- Funções de cálculo (datas, meses, totais) vão em arquivo `.ts` próprio, sem React.
- Textos em pt-BR. Funciona no Android e na web (`isWeb` ou `.web.ts`).
- Modais seguem `ModalReserva.tsx` (modo edição por prop) e `formStyles.ts`.
- Confirmações usam `ConfirmDialog`, nunca `alert` novo.

---

## 24. Feedback ao salvar
- [ ] Instalar `expo-haptics` (`npx expo install expo-haptics`). `feedback.ts` com `vibrar()`;
  `feedback.web.ts` vazio. Chamar ao salvar gasto, conta e reserva.
- [ ] Toast "Gasto salvo" (reusar `UndoToast` sem botão).

## 25. Tela de boas-vindas no primeiro uso
- [ ] Chave `boasVindas` ("1" quando visto). Se ausente e sem dados, mostrar 3 telas curtas
  (anotar gastos, contas fixas, backup) com "Começar". Não mostrar para quem já tem dados.

## 26. Modo escuro
- [ ] `theme.ts`: `lightColors` e `darkColors`; hook `useColors()` com `useColorScheme()`.
- [ ] Trocar `colors` fixo por `useColors()` tela por tela (fazer e commitar uma tela por vez é
  aceitável dentro deste bloco). `app.json`: `userInterfaceStyle: "automatic"`.

## 27. Layout largo (tablet e computador)
- [ ] Nas telas, conteúdo com `maxWidth: 640` e `alignSelf: "center"`; modais com `maxWidth`.

## 28. PWA: atalhos no manifest
- [ ] `public/manifest.json`: `shortcuts` "Novo gasto" → `./?acao=novo-gasto`.
- [ ] `App.tsx` (só web): se a URL tiver `acao=novo-gasto`, abrir o modal de gasto e limpar a URL.

## 29. PWA: aviso "Atualizado para a versão X"
- [ ] Chave `versaoVista`. Ao abrir, se diferente de `app.json` `version` e já existir, mostrar
  faixa "Atualizado para a versão X" (fecha no X) e gravar a versão. Android também pode usar.

## 30. APK: atalho no ícone ("Novo gasto")
- [ ] Ler a doc do Expo 58 sobre app shortcuts/quick actions antes. Se precisar de lib de terceiros
  ou config nativa complexa, **parar e perguntar** antes de instalar.

## 31. APK: notificação de backup pendente
- [ ] `notifications.ts`: agendar notificação local para 30 dias após o último backup
  ("Faça um backup dos seus dados"); reagendar ao fazer backup. Web não faz nada.

## 32. Checagem de tipos no GitHub Actions
- [ ] `deploy-web.yml` e `release-apk.yml`: passo `npx tsc --noEmit` depois do `npm ci`.

## 33. Lint e formatador
- [ ] Instalar ESLint (`npx expo lint` cria a config) e Prettier; scripts `lint` e `format`.
- [ ] Rodar o format num commit separado, só formatação.

## 34. Testes automáticos
- [ ] Instalar `jest-expo` + `jest`, script `test`.
- [ ] Testes de `dueDates.ts`, `months.ts`, `parseBackup` (backup v1, v2, com e sem `nome`) e
  `maskMoneyInput`/`parseBRLInput`. Adicionar `npm test` no Actions.

## 35. Bloqueio com PIN ou biometria (APK)
- [ ] Ler a doc de `expo-local-authentication` (SDK 58). Interruptor "Bloquear com digital" no
  `SideDrawer` (só Android). Ao abrir/voltar ao app, pedir a digital. Sem biometria no aparelho:
  não mostrar a opção. Web: não faz nada.

## 36. Backup criptografado com senha
- [ ] Antes de começar, **perguntar** qual biblioteca de criptografia usar (precisa funcionar
  igual no Android e na web). Senha opcional; backup sem senha continua igual.

## 37. Widget na tela inicial do Android
- [ ] Exige código nativo. **Perguntar antes** de começar; pode ficar de fora.
