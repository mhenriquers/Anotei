import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Type } from "../Types";
import MenuExclusaoGenerico from "../components/ExcluseMenu";
import ExpenseItem from "../components/ExpenseItem";
import ExpenseDetails from "../components/ExpenseDetails";
import PaymentSummary from "../components/PaymentSummary";
import { colors, formatBRL } from "../theme";
import { PaymentTotals } from "../paymentMethods";

interface ExpenseProps {
  expenseList: Type[];
  paymentTotals: PaymentTotals;
  isDeleteMode: boolean;
  setIsDeleteMode: (visible: boolean) => void;
  onDeleteExpenses: (ids: string[]) => void; // Mantemos a função que atualiza a lista global
}

const ExpenseList: React.FC<ExpenseProps> = ({
  expenseList,
  paymentTotals,
  isDeleteMode,
  setIsDeleteMode,
  onDeleteExpenses,
}) => {
  //-------------------------- mais recentes primeiro --------------------------
  const sortedExpenses = [...expenseList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  //-------------------------- gasto aberto no modal de detalhes --------------------------
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const selectedExpense =
    expenseList.find((expense) => expense.id === selectedExpenseId) ?? null;

  return (
    // edges "bottom": a lista termina acima dos botões do celular
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          //--------------------------------CARD TOTAL---------------------------------//
          <View>
            <PaymentSummary totals={paymentTotals} />
            {expenseList.length > 0 && (
              <Text style={styles.sectionTitle}>
                Histórico ({expenseList.length})
              </Text>
            )}
          </View>
        }
        data={sortedExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseItem
            item={item}
            onPress={() => setSelectedExpenseId(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="receipt-outline"
              size={40}
              color={colors.textLight}
            />
            <Text style={styles.emptyTitle}>Nenhum gasto registrado</Text>
            <Text style={styles.emptyText}>
              Volte para o início e toque no botão + para adicionar.
            </Text>
          </View>
        }
      />

      {/* RENDERIZAÇÃO DO MODAL GENÉRICO PARA A LISTA DE GASTOS */}
      {isDeleteMode && (
        <MenuExclusaoGenerico
          items={expenseList}
          storageKey="expenses"
          title="Excluir gastos"
          subtitle="Selecione os gastos que deseja remover da lista."
          renderTitle={(item) => item.title}
          renderSubtitle={(item) => formatBRL(item.amount)}
          onDelete={onDeleteExpenses}
          onCancel={() => setIsDeleteMode(false)}
        />
      )}

      {/* MODAL COM OS DETALHES DO GASTO TOCADO */}
      <ExpenseDetails
        expense={selectedExpense}
        onClose={() => setSelectedExpenseId(null)}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
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
