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
