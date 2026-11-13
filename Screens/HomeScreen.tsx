import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { InterfaceBill, Reserva, Type } from "../Types";
import ProgressBar from "../components/ProgressBar";
import ExpenseItem from "../components/ExpenseItem";
import DraggableFab from "../components/DraggableFab";
import ExpenseDetails from "../components/ExpenseDetails";
import UpcomingBills from "../components/UpcomingBills";
import {
  BackupReminder,
  describeLastBackup,
  useBackupRestore,
} from "../components/BackupSection";
import SideDrawer, { DrawerItem } from "../components/SideDrawer";
import UpdateBanner from "../components/UpdateBanner";
import UpdatedNotice from "../components/UpdatedNotice";
import PaymentSummary from "../components/PaymentSummary";
import { colors, radius, shadow, formatBRL } from "../theme";
import { totalsByPaymentMethod } from "../paymentMethods";
import {
  filterByMonth,
  monthKey,
  monthName,
  previousMonth,
  sumAmounts,
} from "../months";
import { isWeb } from "../pwa";
import { useBackup } from "../backup";
import { USER_NAME_MAX, useUserName } from "../userName";
import {
  setStored,
  useStoredNumber,
  useStoredValue,
} from "../storedValues";
import MoneyPrompt from "../components/MoneyPrompt";
import { faturaAtual } from "../fatura";
import { exportExpensesCsv } from "../csv";
import AboutDialog from "../components/AboutDialog";
import ActionSheet from "../components/ActionSheet";
import { expenseTitle } from "../installments";

// "12/11"
const formatShortDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;

interface HomeProps {
  navigation: any;
  onOpenModal: () => void;
  onEditExpense: (expense: Type) => void;
  onDeleteExpenses: (ids: string[]) => void; // apaga (com "Desfazer" no rodapé)
  expenses: Type[];
  innerBill: InterfaceBill[];
  reservas: Reserva[];
  onDataRestored: () => Promise<void>; // recarrega os dados depois de restaurar um backup
}

const HomeScreen: React.FC<HomeProps> = ({
  navigation,
  onOpenModal,
  onEditExpense,
  onDeleteExpenses,
  expenses,
  innerBill,
  reservas,
  onDataRestored,
}) => {
  const paidBills = innerBill.filter((bill) => bill.pago).length;
  const totalBills = innerBill.length;
  const totalContas = innerBill.reduce(
    (total, bill) => total + (bill.valor || 0),
    0,
  );
  const billsProgress = totalBills > 0 ? (paidBills / totalBills) * 100 : 0;

  //-------------------------- gastos do mês atual --------------------------
  const currentMonth = monthKey();
  const monthExpenses = filterByMonth(expenses, currentMonth);
  const paymentTotals = totalsByPaymentMethod(monthExpenses);
  const valorTotal = sumAmounts(monthExpenses);

  //-------------------------- comparação com o mês anterior --------------------------
  // compara o mesmo período: do dia 1 até hoje, nos dois meses (o mês atual
  // ainda não acabou, então comparar com o mês anterior inteiro seria injusto)
  const lastMonth = previousMonth(currentMonth);
  const today = new Date().getDate();
  const thisMonthSoFar = sumAmounts(
    monthExpenses.filter((e) => new Date(e.createdAt).getDate() <= today),
  );
  const lastMonthSamePeriod = sumAmounts(
    filterByMonth(expenses, lastMonth).filter(
      (e) => new Date(e.createdAt).getDate() <= today,
    ),
  );
  const comparison = (() => {
    if (lastMonthSamePeriod <= 0) return null; // nada para comparar
    const percent = Math.round(
      ((thisMonthSoFar - lastMonthSamePeriod) / lastMonthSamePeriod) * 100,
    );
    const period = `${monthName(lastMonth)} até o dia ${today}`;
    if (percent === 0) return { text: `Igual a ${period}`, up: false };
    return {
      text: `${Math.abs(percent)}% a ${percent > 0 ? "mais" : "menos"} que ${period}`,
      up: percent > 0,
    };
  })();

  const ocultarValores = useStoredValue("ocultarValores") === "1";

  //-------------------------- limite do mês --------------------------
  const orcamento = useStoredNumber("orcamento");
  const budgetPercent = orcamento ? (valorTotal / orcamento) * 100 : 0;
  const budgetColor =
    budgetPercent > 100
      ? HERO_UP
      : budgetPercent >= 80
        ? colors.warning
        : HERO_DOWN;

  //-------------------------- receita e quanto sobra --------------------------
  const receita = useStoredNumber("receita");
  // o que entra menos o que já foi gasto no mês e as contas fixas do mês
  const sobra = receita !== null ? receita - valorTotal - totalContas : 0;

  //-------------------------- fatura do cartão --------------------------
  const diaFechamento = useStoredNumber("diaFechamento");
  const fatura = diaFechamento ? faturaAtual(expenses, diaFechamento) : null;

  // caixa aberta pelo menu: limite do mês, receita ou dia da fatura
  const [prompt, setPrompt] = useState<
    "orcamento" | "receita" | "diaFechamento" | null
  >(null);

  //-------------------------- 3 gastos mais recentes --------------------------
  const recentExpenses = [...expenses]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  //-------------------------- gasto aberto no modal de detalhes --------------------------
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const selectedExpense =
    expenses.find((expense) => expense.id === selectedExpenseId) ?? null;

  // gasto com o menu de ações rápidas aberto (toque longo)
  const [quickExpense, setQuickExpense] = useState<Type | null>(null);

  //-------------------------- backup (os dados ficam só no aparelho) --------------------------
  const userName = useUserName();
  const backup = useBackup(expenses, innerBill, reservas, userName.name);
  const restore = useBackupRestore(backup.hasData, async () => {
    await onDataRestored();
    await backup.reload();
    await userName.reload();
  });

  //-------------------------- nome no título (toque para editar) --------------------------
  const [nameDraft, setNameDraft] = useState<string | null>(null); // null = não está editando
  const startEditingName = () => setNameDraft(userName.name);
  const finishEditingName = () => {
    if (nameDraft === null) return;
    userName.saveName(nameDraft);
    setNameDraft(null);
  };

  //-------------------------- menu lateral (gaveta) --------------------------
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const totalReservas = reservas.reduce((soma, r) => soma + (r.valor || 0), 0);

  const drawerItems: DrawerItem[] = [
    {
      key: "reservas",
      icon: "wallet-outline",
      label: "Reservas",
      subtitle:
        reservas.length > 0
          ? `${formatBRL(totalReservas)} guardados`
          : "Seu dinheiro guardado",
      onPress: () => navigation.navigate("Reservas"),
    },
    {
      key: "recorrentes",
      icon: "repeat-outline",
      label: "Gastos recorrentes",
      subtitle: "Assinaturas lançadas todo mês",
      onPress: () => navigation.navigate("Recorrentes"),
    },
    {
      key: "orcamento",
      icon: "speedometer-outline",
      label: "Limite do mês",
      subtitle: orcamento
        ? `${formatBRL(orcamento)} por mês`
        : "Defina quanto quer gastar",
      onPress: () => setPrompt("orcamento"),
    },
    {
      key: "receita",
      icon: "trending-up-outline",
      label: "Receita do mês",
      subtitle: receita
        ? `${formatBRL(receita)} por mês`
        : "Salário e outras entradas",
      onPress: () => setPrompt("receita"),
    },
    {
      key: "fatura",
      icon: "card-outline",
      label: "Fatura do cartão",
      subtitle: diaFechamento
        ? `Fecha todo dia ${diaFechamento}`
        : "Dia em que a fatura fecha",
      onPress: () => setPrompt("diaFechamento"),
    },
    {
      key: "backup",
      icon: "share-outline",
      label: "Fazer backup",
      subtitle: describeLastBackup(backup.lastBackup, backup.lastSize),
      onPress: backup.backupNow, // chamado direto no toque (exigência do iPhone)
      disabled: !backup.hasData,
    },
    {
      key: "csv",
      icon: "document-text-outline",
      label: "Exportar planilha",
      subtitle: "Todos os gastos em .csv (Excel)",
      // chamado direto no toque, sem await antes (exigência do iPhone)
      onPress: () => {
        exportExpensesCsv(expenses).catch((error) => {
          console.error("Erro ao exportar planilha", error);
          alert("Não foi possível exportar a planilha. Tente de novo.");
        });
      },
      disabled: expenses.length === 0,
    },
    {
      key: "restore",
      icon: "download-outline",
      label: "Restaurar backup",
      subtitle: "Recuperar dados de um arquivo",
      onPress: restore.startRestore,
    },
    {
      key: "sobre",
      icon: "information-circle-outline",
      label: "Sobre",
      subtitle: "Versão e privacidade",
      onPress: () => setIsAboutOpen(true),
    },
  ];

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom", "left", "right"]}
    >
      {/* View interno: a tela e o botão + terminam acima dos botões do celular */}
      <View style={styles.inner}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/*-------------------------- Cabeçalho -------------------------- */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setIsDrawerOpen(true)}
              style={styles.menuButton}
              hitSlop={10}
              accessibilityLabel="Abrir menu"
            >
              <Ionicons name="menu" size={26} color={colors.hero} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Olá!</Text>
              {nameDraft !== null ? (
                <TextInput
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  onBlur={finishEditingName}
                  onSubmitEditing={finishEditingName}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.textLight}
                  maxLength={USER_NAME_MAX}
                  autoFocus
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  style={[styles.headerTitle, styles.nameInput]}
                  accessibilityLabel="Seu nome"
                />
              ) : (
                <TouchableOpacity
                  onPress={startEditingName}
                  style={styles.titleRow}
                  activeOpacity={0.6}
                  accessibilityLabel="Editar nome"
                >
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    {userName.name || "Suas finanças"}
                  </Text>
                  <Ionicons
                    name="pencil"
                    size={13}
                    color={colors.textLight}
                    style={styles.pencil}
                  />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() =>
                setStored("ocultarValores", ocultarValores ? null : "1")
              }
              style={styles.eyeButton}
              hitSlop={8}
              accessibilityLabel={
                ocultarValores ? "Mostrar valores" : "Ocultar valores"
              }
            >
              <Ionicons
                name={ocultarValores ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.hero}
              />
            </TouchableOpacity>
            <View style={styles.logoBox}>
              <Image
                source={require("./../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/*---------- Nova versão do APK (só aparece no Android) ---------- */}
          <UpdateBanner />

          {/*---------- "Atualizado para a versão X" (uma vez, depois de atualizar) ---------- */}
          <UpdatedNotice />

          {/*---------- Contas a vencer (só na web, no lugar das notificações) ---------- */}
          {isWeb && (
            <UpcomingBills
              bills={innerBill}
              onPress={() => navigation.navigate("Bills")}
            />
          )}

          {backup.shouldRemind && (
            <BackupReminder
              daysSinceBackup={backup.daysSinceBackup}
              onBackup={backup.backupNow}
              onSnooze={backup.snooze}
            />
          )}

          {/*-------------------------- Card Total -------------------------- */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>
              Gasto em {monthName(currentMonth)}
            </Text>
            <Text style={styles.heroValue}>{formatBRL(valorTotal)}</Text>
            <Text style={styles.heroHint}>
              {monthExpenses.length === 1
                ? "1 gasto neste mês"
                : `${monthExpenses.length} gastos neste mês`}
            </Text>
            {orcamento !== null && (
              <View style={styles.budget}>
                <View style={styles.budgetBar}>
                  <View
                    style={[
                      styles.budgetFill,
                      {
                        width: `${Math.min(budgetPercent, 100)}%`,
                        backgroundColor: budgetColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.budgetText}>
                  {formatBRL(valorTotal)} de {formatBRL(orcamento)}
                  {budgetPercent > 100
                    ? ` · passou ${formatBRL(valorTotal - orcamento)}`
                    : ` · restam ${formatBRL(orcamento - valorTotal)}`}
                </Text>
              </View>
            )}
            {comparison && (
              <View style={styles.compareRow}>
                <Ionicons
                  name={comparison.up ? "trending-up" : "trending-down"}
                  size={16}
                  color={comparison.up ? HERO_UP : HERO_DOWN}
                />
                <Text
                  style={[
                    styles.compareText,
                    { color: comparison.up ? HERO_UP : HERO_DOWN },
                  ]}
                >
                  {comparison.text}
                </Text>
              </View>
            )}
          </View>

          {/*-------------------------- Sobra do mês -------------------------- */}
          {receita !== null && (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setPrompt("receita")}
              activeOpacity={0.8}
              accessibilityHint="Altera a receita do mês"
            >
              <View style={styles.sobraHeader}>
                <View
                  style={[
                    styles.iconBadge,
                    {
                      backgroundColor:
                        sobra >= 0 ? colors.primarySoft : colors.dangerSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name="wallet-outline"
                    size={20}
                    color={sobra >= 0 ? colors.primary : colors.danger}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>
                    {sobra >= 0 ? "Sobra do mês" : "Falta no mês"}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    Receita {formatBRL(receita)} − gastos − contas
                  </Text>
                </View>
                <Text
                  style={[
                    styles.cardValue,
                    { color: sobra >= 0 ? colors.primaryDark : colors.danger },
                  ]}
                >
                  {formatBRL(Math.abs(sobra))}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/*-------------------------- Contas Fixas -------------------------- */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Bills")}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Contas fixas</Text>
                <Text style={styles.cardSubtitle}>
                  {totalBills === 0
                    ? "Nenhuma conta cadastrada"
                    : `${paidBills} de ${totalBills} pagas`}
                </Text>
              </View>
              <Text style={styles.cardValue}>{formatBRL(totalContas)}</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textLight}
              />
            </View>
            <ProgressBar progress={billsProgress} compact />
          </TouchableOpacity>

          {/*-------------------------- Crédito, Débito e Pix -------------------------- */}
          <PaymentSummary
            totals={paymentTotals}
            onPress={() => navigation.navigate("ExpenseList")}
            creditNote={
              fatura
                ? `Fatura fecha ${formatShortDate(fatura.fecha)} · ${formatBRL(fatura.total)}`
                : undefined
            }
          />

          {/*-------------------------- Últimos gastos -------------------------- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos gastos</Text>
            {expenses.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate("ExpenseList")}
              >
                <Text style={styles.link}>Ver todos</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentExpenses.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="receipt-outline"
                size={36}
                color={colors.textLight}
              />
              <Text style={styles.emptyTitle}>Nenhum gasto ainda</Text>
              <Text style={styles.emptyText}>
                Toque no botão + para registrar seu primeiro gasto.
              </Text>
            </View>
          ) : (
            recentExpenses.map((item) => (
              <ExpenseItem
                key={item.id}
                item={item}
                onPress={() => setSelectedExpenseId(item.id)}
                onLongPress={() => setQuickExpense(item)}
              />
            ))
          )}

          {/* espaço para o botão + não cobrir o último gasto */}
          <View style={styles.fabSpacer} />
        </ScrollView>

        <DraggableFab
          onPress={onOpenModal}
          storageKey="fab-position-home"
          accessibilityLabel="Adicionar gasto"
        />

        <SideDrawer
          visible={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          items={drawerItems}
        />

        <MoneyPrompt
          visible={prompt === "orcamento"}
          title="Limite do mês"
          message="Quanto você quer gastar por mês, no máximo? Deixe vazio para tirar o limite."
          icon="speedometer-outline"
          value={orcamento}
          onSave={(value) => {
            setStored("orcamento", value === null ? null : String(value));
            setPrompt(null);
          }}
          onCancel={() => setPrompt(null)}
        />

        <MoneyPrompt
          visible={prompt === "receita"}
          title="Receita do mês"
          message="Quanto entra por mês (salário e outras entradas)? Deixe vazio para não mostrar a sobra."
          icon="trending-up-outline"
          value={receita}
          onSave={(value) => {
            setStored("receita", value === null ? null : String(value));
            setPrompt(null);
          }}
          onCancel={() => setPrompt(null)}
        />

        <MoneyPrompt
          visible={prompt === "diaFechamento"}
          kind="day"
          title="Fatura do cartão"
          message="Em que dia do mês a fatura do cartão fecha? Compras a partir desse dia entram na fatura seguinte. Deixe vazio para não mostrar."
          icon="card-outline"
          value={diaFechamento}
          onSave={(value) => {
            setStored("diaFechamento", value === null ? null : String(value));
            setPrompt(null);
          }}
          onCancel={() => setPrompt(null)}
        />

        <AboutDialog
          visible={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
        />

        {/* confirmação do restaurar: fica fora da gaveta, que fecha no toque */}
        {restore.dialog}

        {/* toque longo num gasto: editar ou apagar */}
        <ActionSheet
          title={quickExpense ? expenseTitle(quickExpense) : null}
          onClose={() => setQuickExpense(null)}
          actions={
            quickExpense
              ? [
                  {
                    icon: "pencil",
                    label: "Editar",
                    onPress: () => onEditExpense(quickExpense),
                  },
                  {
                    icon: "trash-outline",
                    label: "Apagar",
                    danger: true,
                    onPress: () => onDeleteExpenses([quickExpense.id]),
                  },
                ]
              : []
          }
        />

        <ExpenseDetails
          expense={selectedExpense}
          onClose={() => setSelectedExpenseId(null)}
          onEdit={(expense) => {
            setSelectedExpenseId(null); // fecha os detalhes antes de abrir o cadastro
            onEditExpense(expense);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

// cores claras de alta/baixa, legíveis sobre o fundo escuro do card do total
const HERO_UP = "#FCA5A5"; // gastou mais
const HERO_DOWN = "#86EFAC"; // gastou menos

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  inner: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 10, // + 10 de margem do último card = 20, igual às laterais
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 20,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    ...shadow,
  },

  headerText: {
    flex: 1,
  },

  fabSpacer: {
    height: 76,
  },

  greeting: {
    fontSize: 15,
    color: colors.textMuted,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    flexShrink: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    maxWidth: "100%",
  },

  pencil: {
    marginLeft: 6,
  },

  nameInput: {
    padding: 0,
    margin: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    ...(isWeb ? ({ outlineStyle: "none" } as object) : null),
  },

  eyeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    ...shadow,
  },

  logoBox: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },

  logo: {
    width: 48,
    height: 48,
  },

  heroCard: {
    backgroundColor: colors.hero,
    borderRadius: radius.xl,
    padding: 22,
    marginBottom: 16,
  },

  heroLabel: {
    fontSize: 14,
    color: colors.heroMuted,
    fontWeight: "500",
  },

  heroValue: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 6,
  },

  heroHint: {
    fontSize: 13,
    color: colors.heroMuted,
    marginTop: 8,
  },

  budget: {
    marginTop: 14,
  },

  budgetBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    overflow: "hidden",
  },

  budgetFill: {
    height: "100%",
    borderRadius: 4,
  },

  budgetText: {
    fontSize: 13,
    color: colors.heroMuted,
    marginTop: 6,
  },

  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  compareText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },

  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
    ...shadow,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  sobraHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  cardSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  cardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginRight: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  link: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  empty: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 10,
  },

  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
});

export default HomeScreen;
