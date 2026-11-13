# Tarefas

Origem: `melhorias.md`. Uma tarefa por vez, na ordem. Ao terminar um bloco: `npx tsc --noEmit`,
marcar `[x]`, commit e push (ver CLAUDE.md).

## Regras que valem para todas
- Campo novo em `Type`, `InterfaceBill` ou `Reserva` é sempre **opcional** (`?`), para dados antigos
  e backups antigos continuarem funcionando. Assim não precisa subir `BACKUP_VERSION`.
- Chave nova no AsyncStorage (ex: `orcamento`) = campo opcional novo no backup, igual ao `nome`
  (ver `userName.ts` e `backup.ts`: export, `parseBackup`, `restoreBackup`, `useBackup`), e
  recarregar no `onDataRestored`. Anotar a chave em CLAUDE.md.
- Funções de cálculo (datas, meses, totais) vão em arquivo `.ts` próprio, sem React.
- Textos em pt-BR. Funciona no Android e na web (`isWeb` ou `.web.ts`).
- Modais seguem `ModalReserva.tsx` (modo edição por prop) e `formStyles.ts`.
- Confirmações usam `ConfirmDialog`, nunca `alert` novo.

---

## 6. Filtro por mês
- [ ] `months.ts`: `monthKey(date)` → "2026-11", `monthLabel(key)` → "Novembro 2026",
  `filterByMonth(expenses, key)`, `previousMonth(key)`, `nextMonth(key)`.
- [ ] `ExpensesList.tsx`: seletor `‹ Novembro 2026 ›` no topo; mostra só o mês escolhido
  (começa no atual). `PaymentSummary` e busca usam os gastos do mês.
- [ ] Home: "Total gasto" e `PaymentSummary` passam a mostrar o **mês atual** (rótulo
  "Gasto em novembro").

## 7. Comparação com o mês anterior
- [ ] Home, card do total: linha "12% a mais que outubro" (vermelho) ou "a menos" (verde), usando
  `months.ts`. Não mostra se o mês anterior não tiver gastos.

## 8. Limite/orçamento mensal
- [ ] Chave `orcamento` (número). Item "Limite do mês" no `SideDrawer` abre modal com o valor
  (`maskMoneyInput`); vazio = sem limite.
- [ ] Home: com limite, `ProgressBar` no card do total ("R$ X de R$ Y"); cor de aviso acima de
  80% e vermelho acima de 100%.

## 9. Receita do mês e quanto sobra
- [ ] Chave `receita` (número). Item "Receita do mês" no `SideDrawer`, modal igual ao da tarefa 8.
- [ ] Home: card "Sobra do mês" = receita − gastos do mês − contas fixas. Só aparece com receita.

## 10. Gráfico simples
- [ ] `components/MonthChart.tsx`: barras com `View` (sem biblioteca), gastos dos últimos 6 meses,
  mês atual destacado, valor em cima da barra.
- [ ] Mostrar no topo de `ExpensesList.tsx`.

## 11. Gasto parcelado no crédito
- [ ] `Type`: `parcelas?: number`, `parcela?: number`, `grupoParcela?: string`.
- [ ] `ModalScreen.tsx`: com "Crédito" escolhido, campo "Parcelas" (1 a 24, padrão 1).
- [ ] Salvar N gastos: valor ÷ N (centavos que sobram vão na 1ª), um por mês a partir da data,
  título "Geladeira (2/10)", mesmo `grupoParcela`.
- [ ] Ao apagar uma parcela, `ConfirmDialog` pergunta "Só esta" ou "Todas as parcelas".

## 12. Fechamento da fatura do cartão
- [ ] Chave `diaFechamento` (1 a 31). Item "Fatura do cartão" no `SideDrawer` para escolher o dia.
- [ ] `fatura.ts`: `faturaAtual(expenses, dia)` → gastos no crédito desde o último fechamento.
- [ ] `PaymentSummary`: no Crédito, texto "Fatura fecha dia X · R$ Y". Sem dia = como hoje.

## 13. Gastos recorrentes (assinaturas)
- [ ] Chave `recorrentes`: lista `{ id, title, amount, category, dia }`. Tela/modal simples para
  cadastrar, editar e apagar, aberta pelo `SideDrawer`.
- [ ] Ao abrir o app: para cada recorrente cujo `dia` já chegou neste mês e que ainda não gerou o
  gasto do mês (guardar `ultimoMes: "2026-11"`), criar o gasto automaticamente.

## 14. Virada de mês das contas fixas
- [ ] Chave `contasMes` = "2026-11". Ao carregar as contas, se o mês atual for diferente, desmarcar
  todas as `pago` e gravar o mês novo. Primeira vez (chave ausente): só grava, não desmarca.

## 15. Histórico de contas pagas por mês
- [ ] Antes de desmarcar na tarefa 14, salvar em `historicoContas`:
  `{ mes, contas: [{ nome, valor, pago }] }` (guardar no máximo 24 meses).
- [ ] Em `Bills.tsx`, menu ⋮ → "Histórico": lista por mês com total pago e contas.

## 16. Valor variável (luz, água)
- [ ] `InterfaceBill`: `variavel?: boolean`. Interruptor "Valor muda todo mês" no `ModalBills`.
- [ ] Ao marcar uma conta variável como paga, abrir modal com o valor (começa com o último);
  confirmar salva o valor novo e marca como paga.

## 17. Meta por reserva
- [ ] `Reserva`: `meta?: number`. Campo "Meta (opcional)" no `ModalReserva`.
- [ ] Card da reserva: barra com "% atingido" e "R$ X de R$ Y".

## 18. Histórico de depósitos e retiradas
- [ ] `Reserva`: `movimentos?: { id, valor, data, tipo: "deposito" | "retirada" }[]`.
- [ ] Botões "Guardar" e "Retirar" na reserva: modal com valor; atualiza `valor` e adiciona o
  movimento. Lista dos movimentos ao abrir a reserva. Não deixar retirar mais que o saldo.

## 19. Ocultar valores
- [ ] Chave `ocultarValores`. Ícone de olho no cabeçalho da Home.
- [ ] `formatBRL` passa a aceitar um modo oculto ("R$ ••••") via contexto simples
  (`hideValues.tsx` com Provider em `App.tsx`); todas as telas usam.

## 20. Tamanho e data do backup no menu
- [ ] `useBackup`: calcular tamanho do JSON do backup (`new Blob`/`length`) e mostrar no subtítulo
  do item "Fazer backup": "Último: 10/11 · 24 KB".

## 21. Exportar em CSV
- [ ] `csv.ts`: gera CSV com `;` e BOM UTF-8 (abre certo no Excel): Data; Hora; Descrição;
  Forma; Valor (vírgula decimal); Observação. Campos com `;` ou `"` entre aspas.
- [ ] Item "Exportar planilha" no `SideDrawer`; reaproveitar `shareBackupFile` para o arquivo
  `anotei-gastos-AAAA-MM-DD.csv` (adaptar para aceitar o tipo `text/csv`).

## 22. Tela "Sobre"
- [ ] Item "Sobre" no `SideDrawer` → modal com logo, versão (`app.json`), link do GitHub
  (`Linking.openURL`) e frase "Seus dados ficam só no aparelho".

## 23. Toque longo para ações rápidas
- [ ] `ExpenseItem` e `RenderCard`: `onLongPress` abre menu pequeno com "Editar" e "Apagar"
  (reaproveitar tarefas 1, 2 e 3).

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
