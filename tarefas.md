# Tarefas

<!-- Uma tarefa por vez, na ordem. Marcar [x] ao terminar.
     Cada tarefa precisa funcionar no Android e na web e passar no `npx tsc --noEmit`. -->

## 1. Data e hora da compra

- [x] 1.1 Em `theme.ts`, criar funções para converter `Date` ↔ texto `dd/mm/aaaa` e `hh:mm`, com validação (data e hora válidas, data não pode ser no futuro)
- [x] 1.2 No modal de novo gasto (`ModalScreen.tsx`), adicionar campos "Data" e "Hora", preenchidos com a data/hora de agora ao abrir
- [x] 1.3 Adicionar atalhos "Hoje" e "Ontem" acima dos campos de data
- [x] 1.4 Mostrar erro e bloquear o salvar se data/hora forem inválidas
- [x] 1.5 Em `App.tsx` (`handleSaveExpense`), usar a data escolhida no `createdAt` em vez de `new Date()`
- [x] 1.6 Conferir que a lista de gastos e os detalhes do gasto mostram a data escolhida e que a ordenação continua certa

## 2. Pix como forma de pagamento

- [ ] 2.1 Em `Types.ts`, adicionar `"pix"` ao campo `category` do gasto (`"credit card" | "debit" | "pix"`)
- [ ] 2.2 No modal de novo gasto (`ModalScreen.tsx`), adicionar a opção "Pix" ao lado de Crédito e Débito
- [ ] 2.3 Em `ExpenseItem.tsx` e `ExpenseDetails.tsx`, trocar o "se não é crédito, é débito" por um rótulo/cor para cada forma (Crédito, Débito, Pix)
- [ ] 2.4 Em `App.tsx`, calcular `valorTotalPix` e somar no total geral
- [ ] 2.5 Mostrar o total do Pix na Home e no resumo da lista de gastos (`ExpensesList.tsx`), ao lado de Crédito e Débito, sem quebrar o layout em telas pequenas

## 3. Menu sanduíche (gaveta lateral) na Home

- [ ] 3.1 Criar `components/SideDrawer.tsx`: gaveta que abre da esquerda para a direita (Modal + Animated), fundo escurecido, fecha ao tocar fora ou no botão voltar do Android
- [ ] 3.2 A gaveta recebe uma lista de itens (ícone + texto + ação), para facilitar adicionar features depois
- [ ] 3.3 Adicionar o botão ☰ no canto esquerdo do topo da Home que abre a gaveta
- [ ] 3.4 Colocar na gaveta o nome do app e a versão (lida do `app.json`) no rodapé
- [ ] 3.5 Adicionar na gaveta os itens "Fazer backup" e "Restaurar backup", reaproveitando a lógica de `backup.ts` e a confirmação de `BackupSection.tsx`. Mostrar a data do último backup abaixo do item. Atenção: no iPhone, `exportBackup` precisa ser chamado direto no toque (não esperar a animação da gaveta fechar)
- [ ] 3.6 Tirar o card de backup do fim da Home (`BackupCard`); o lembrete de backup no topo continua
- [ ] 3.7 Por enquanto os itens de backup aparecem só na web (até a feature 4)

## 4. Backup no Android

Hoje o backup só existe na web; o APK não tem nenhum.

- [ ] 4.1 Instalar `expo-file-system`, `expo-sharing` e `expo-document-picker` (com `npx expo install`)
- [ ] 4.2 Separar o que depende da plataforma: gerar/compartilhar o arquivo e escolher o arquivo vão para `backupFile.ts` (Android) e `backupFile.web.ts` (o código atual da web). `parseBackup` passa a receber o texto do arquivo, igual nos dois
- [ ] 4.3 Ligar o backup no Android: `useBackup` ativo, itens de backup na gaveta e lembrete na Home
- [ ] 4.4 O arquivo `.json` é o mesmo nos dois: um backup feito no iPhone restaura no Android e vice-versa

## 5. Reservas (dinheiro guardado)

Nome provisório: "Reservas". Alternativas: "Cofrinhos", "Caixinhas", "Meu dinheiro guardado".

- [ ] 5.1 Em `Types.ts`, criar o tipo `Reserva`: `id`, `nome`, `valor`, `finalidade` (ex: emergência, viagem), `local` (opcional, ex: banco)
- [ ] 5.2 Em `App.tsx`, carregar e salvar as reservas no AsyncStorage (chave `reservas`), igual aos gastos
- [ ] 5.3 Criar a tela `Screens/Reservas.tsx` com a lista de reservas e o total guardado no topo; registrar no stack (`RootStackParamList`)
- [ ] 5.4 Adicionar o item "Reservas" na gaveta, que navega para a tela
- [ ] 5.5 Criar o modal de nova reserva (nome, valor, finalidade, local opcional)
- [ ] 5.6 Permitir editar e excluir uma reserva (ex: ao tocar no card)
- [ ] 5.7 Incluir as reservas no backup (`backup.ts`): subir `BACKUP_VERSION` para 2 e continuar aceitando backups da versão 1 (sem reservas)

## 6. Aviso de nova versão (APK)

- [ ] 6.1 Instalar `expo-constants` (com `npx expo install`) para ler a versão do app
- [ ] 6.2 Criar `updates.ts`: no Android, buscar a última release em `https://api.github.com/repos/mhenriquers/Anotei/releases/latest`, comparar a tag (ex: `v1.1.0`) com a versão do app; sem internet ou com erro, não faz nada
- [ ] 6.3 Criar `updates.web.ts` vazio (a PWA já se atualiza sozinha)
- [ ] 6.4 Mostrar um aviso na Home "Nova versão disponível" com botão que abre o link do APK da release; botão "Agora não" esconde até a próxima versão
- [ ] 6.5 No README, trocar o link do APK para `releases/latest/download/Anotei.apk` (sempre aponta para a versão mais nova)
- [ ] 6.6 Em `eas.json`, garantir que o perfil `production` gere `.apk` (não `.aab`)
- [ ] 6.7 Documentar o fluxo de publicação no CLAUDE.md (seção "Versões e publicação")

## 7. Publicação automática (opcional, precisa de ação sua)

- [ ] 7.1 Workflow do GitHub que, ao criar uma tag `vX.Y.Z`, gera o APK no EAS e anexa como `Anotei.apk` numa release (precisa do secret `EXPO_TOKEN` configurado por você no GitHub)
