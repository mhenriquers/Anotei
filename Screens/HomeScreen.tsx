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
import PaymentSummary from "../components/PaymentSummary";
import { colors, radius, shadow, formatBRL } from "../theme";
import { PaymentTotals } from "../paymentMethods";
import { isWeb } from "../pwa";
import { useBackup } from "../backup";
import { USER_NAME_MAX, useUserName } from "../userName";

interface HomeProps {
  navigation: any;
  onOpenModal: () => void;
  expenses: Type[];
  paymentTotals: PaymentTotals;
  valorTotal: number;
  innerBill: InterfaceBill[];
  reservas: Reserva[];
  onDataRestored: () => Promise<void>; // recarrega os dados depois de restaurar um backup
}

const HomeScreen: React.FC<HomeProps> = ({
  navigation,
  onOpenModal,
  expenses,
  paymentTotals,
  valorTotal,
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
      key: "backup",
      icon: "share-outline",
      label: "Fazer backup",
      subtitle: describeLastBackup(backup.lastBackup),
      onPress: backup.backupNow, // chamado direto no toque (exigência do iPhone)
      disabled: !backup.hasData,
    },
    {
      key: "restore",
      icon: "download-outline",
      label: "Restaurar backup",
      subtitle: "Recuperar dados de um arquivo",
      onPress: restore.startRestore,
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
            <Text style={styles.heroLabel}>Total gasto</Text>
            <Text style={styles.heroValue}>{formatBRL(valorTotal)}</Text>
            <Text style={styles.heroHint}>
              {expenses.length === 1
                ? "1 gasto registrado"
                : `${expenses.length} gastos registrados`}
            </Text>
          </View>

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

        {/* confirmação do restaurar: fica fora da gaveta, que fecha no toque */}
        {restore.dialog}

        <ExpenseDetails
          expense={selectedExpense}
          onClose={() => setSelectedExpenseId(null)}
        />
      </View>
    </SafeAreaView>
  );
};

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
