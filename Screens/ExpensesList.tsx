import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Type } from "../Types";
import MenuExclusaoGenerico from "../components/ExcluseMenu";
import ExpenseItem from "../components/ExpenseItem";
import ExpenseDetails from "../components/ExpenseDetails";
import PaymentSummary from "../components/PaymentSummary";
import { colors, formatBRL, radius, shadow } from "../theme";
import { totalsByPaymentMethod } from "../paymentMethods";
import {
  filterByMonth,
  lastMonthWithData,
  monthKey,
  monthLabel,
  nextMonth,
  previousMonth,
  sumAmounts,
} from "../months";
import { searchExpenses } from "../search";
import { groupByDay } from "../expenseGroups";
import MonthChart from "../components/MonthChart";
import { expenseTitle } from "../installments";
import { isWeb } from "../pwa";

interface ExpenseProps {
  expenseList: Type[];
  isDeleteMode: boolean;
  setIsDeleteMode: (visible: boolean) => void;
  onDeleteExpenses: (ids: string[]) => void; // Mantemos a função que atualiza a lista global
  onEditExpense: (expense: Type) => void; // abre o cadastro para editar o gasto
}

const ExpenseList: React.FC<ExpenseProps> = ({
  expenseList,
  isDeleteMode,
  setIsDeleteMode,
  onDeleteExpenses,
  onEditExpense,
}) => {
  //-------------------------- mês mostrado (começa no atual) --------------------------
  const [month, setMonth] = useState(() => monthKey());
  const monthExpenses = filterByMonth(expenseList, month);
  const paymentTotals = totalsByPaymentMethod(monthExpenses);
  const monthTotal = sumAmounts(monthExpenses);
  // dá para avançar até o mês atual (ou até o último com gasto lançado à frente)
  const canGoNext = month < lastMonthWithData(expenseList);

  //-------------------------- busca --------------------------
  const [query, setQuery] = useState("");
  const isSearching = query.trim() !== "";

  //-------------------------- agrupados por dia, mais recentes primeiro --------------------------
  // a busca procura em todos os meses; sem busca, só o mês escolhido
  const sortedExpenses = isSearching
    ? searchExpenses(expenseList, query)
    : monthExpenses;
  const sections = groupByDay(sortedExpenses);

  //-------------------------- gasto aberto no modal de detalhes --------------------------
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const selectedExpense =
    expenseList.find((expense) => expense.id === selectedExpenseId) ?? null;

  return (
    // edges "bottom": a lista termina acima dos botões do celular
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <SectionList
        contentContainerStyle={styles.listContent}
        sections={sections}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.dayHeader}>
            <Text style={styles.dayTitle}>{section.title}</Text>
            <Text style={styles.dayTotal}>{formatBRL(section.total)}</Text>
          </View>
        )}
        ListHeaderComponent={
          //--------------------------------CARD TOTAL---------------------------------//
          <View>
            {/*----------------- seletor de mês: ‹ Novembro 2026 › ----------------- */}
            <View style={styles.monthBar}>
              <TouchableOpacity
                onPress={() => setMonth(previousMonth(month))}
                style={styles.monthArrow}
                hitSlop={8}
                accessibilityLabel="Mês anterior"
              >
                <Ionicons name="chevron-back" size={22} color={colors.hero} />
              </TouchableOpacity>
              <View style={styles.monthCenter}>
                <Text style={styles.monthLabel}>{monthLabel(month)}</Text>
                <Text style={styles.monthTotal}>{formatBRL(monthTotal)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setMonth(nextMonth(month))}
                style={[styles.monthArrow, !canGoNext && styles.monthArrowOff]}
                disabled={!canGoNext}
                hitSlop={8}
                accessibilityLabel="Próximo mês"
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={colors.hero}
                />
              </TouchableOpacity>
            </View>

            {expenseList.length > 0 && (
              <MonthChart
                expenses={expenseList}
                month={month}
                onSelectMonth={setMonth}
              />
            )}

            <PaymentSummary totals={paymentTotals} />
            {expenseList.length > 0 && (
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar gasto"
                  placeholderTextColor={colors.textLight}
                  value={query}
                  onChangeText={setQuery}
                  autoCorrect={false}
                  returnKeyType="search"
                  accessibilityLabel="Buscar gasto"
                />
                {isSearching && (
                  <TouchableOpacity
                    onPress={() => setQuery("")}
                    hitSlop={10}
                    accessibilityLabel="Limpar busca"
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.textLight}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            {sortedExpenses.length > 0 && (
              <Text style={styles.sectionTitle}>
                {isSearching ? "Resultados em todos os meses" : "Histórico"} (
                {sortedExpenses.length})
              </Text>
            )}
          </View>
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseItem
            item={item}
            onPress={() => setSelectedExpenseId(item.id)}
          />
        )}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          isSearching ? (
            <View style={styles.empty}>
              <Ionicons name="search" size={40} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Nenhum gasto encontrado</Text>
              <Text style={styles.emptyText}>
                Tente buscar por outra palavra.
              </Text>
            </View>
          ) : (
          <View style={styles.empty}>
            <Ionicons
              name="receipt-outline"
              size={40}
              color={colors.textLight}
            />
            <Text style={styles.emptyTitle}>
              {expenseList.length === 0
                ? "Nenhum gasto registrado"
                : `Nenhum gasto em ${monthLabel(month).toLowerCase()}`}
            </Text>
            <Text style={styles.emptyText}>
              {expenseList.length === 0
                ? "Volte para o início e toque no botão + para adicionar."
                : "Use as setas acima para ver outros meses."}
            </Text>
          </View>
          )
        }
      />

      {/* RENDERIZAÇÃO DO MODAL GENÉRICO PARA A LISTA DE GASTOS */}
      {isDeleteMode && (
        <MenuExclusaoGenerico
          items={expenseList}
          storageKey="expenses"
          title="Excluir gastos"
          subtitle="Selecione os gastos que deseja remover da lista."
          renderTitle={(item) => expenseTitle(item)}
          renderSubtitle={(item) => formatBRL(item.amount)}
          onDelete={onDeleteExpenses}
          onCancel={() => setIsDeleteMode(false)}
        />
      )}

      {/* MODAL COM OS DETALHES DO GASTO TOCADO */}
      <ExpenseDetails
        expense={selectedExpense}
        onClose={() => setSelectedExpenseId(null)}
        onEdit={(expense) => {
          setSelectedExpenseId(null); // fecha os detalhes antes de abrir o cadastro
          onEditExpense(expense);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 10, // + 10 de margem do último card = 20, igual às laterais
  },
  monthBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 8,
    marginBottom: 16,
    ...shadow,
  },
  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  monthArrowOff: {
    opacity: 0.3,
  },
  monthCenter: {
    flex: 1,
    alignItems: "center",
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  monthTotal: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16, // 16 ou mais: o iPhone não dá zoom ao tocar no campo
    color: colors.text,
    marginLeft: 8,
    paddingVertical: 0,
    ...(isWeb ? ({ outlineStyle: "none" } as object) : null),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 8,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
  },
  dayTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
});

export default ExpenseList;
