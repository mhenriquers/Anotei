import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { InterfaceBill, Type } from "../Types";
import ProgressBar from "../components/ProgressBar";
import ExpenseItem from "../components/ExpenseItem";
import DraggableFab from "../components/DraggableFab";
import ExpenseDetails from "../components/ExpenseDetails";
import { colors, radius, shadow, formatBRL } from "../theme";

interface HomeProps {
  navigation: any;
  onOpenModal: () => void;
  expenses: Type[];
  totalGastoCredito: number;
  totalGastoDebito: number;
  valorTotal: number;
  innerBill: InterfaceBill[];
}

const HomeScreen: React.FC<HomeProps> = ({
  navigation,
  onOpenModal,
  expenses,
  totalGastoCredito,
  totalGastoDebito,
  valorTotal,
  innerBill,
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
            <View>
              <Text style={styles.greeting}>Olá!</Text>
              <Text style={styles.headerTitle}>Suas finanças</Text>
            </View>
            <View style={styles.logoBox}>
              <Image
                source={require("./../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

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

          {/*-------------------------- Crédito e Débito -------------------------- */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statCard, { marginRight: 12 }]}
              onPress={() => navigation.navigate("ExpenseList")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: colors.creditSoft },
                ]}
              >
                <Ionicons name="card-outline" size={20} color={colors.credit} />
              </View>
              <Text style={styles.statLabel}>Crédito</Text>
              <Text style={styles.statValue}>
                {formatBRL(totalGastoCredito)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate("ExpenseList")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: colors.debitSoft },
                ]}
              >
                <Ionicons name="cash-outline" size={20} color={colors.debit} />
              </View>
              <Text style={styles.statLabel}>Débito</Text>
              <Text style={styles.statValue}>
                {formatBRL(totalGastoDebito)}
              </Text>
            </TouchableOpacity>
          </View>

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
        </ScrollView>

        <DraggableFab
          onPress={onOpenModal}
          storageKey="fab-position-home"
          accessibilityLabel="Adicionar gasto"
        />

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

  greeting: {
    fontSize: 15,
    color: colors.textMuted,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
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

  statsRow: {
    flexDirection: "row",
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow,
  },

  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 12,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
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
