import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { colors, formatBRL, radius } from "../theme";
import { PaymentTotals } from "../paymentMethods";
import { searchExpenses } from "../search";
import { isWeb } from "../pwa";

interface ExpenseProps {
  expenseList: Type[];
  paymentTotals: PaymentTotals;
  isDeleteMode: boolean;
  setIsDeleteMode: (visible: boolean) => void;
  onDeleteExpenses: (ids: string[]) => void; // Mantemos a função que atualiza a lista global
  onEditExpense: (expense: Type) => void; // abre o cadastro para editar o gasto
}

const ExpenseList: React.FC<ExpenseProps> = ({
  expenseList,
  paymentTotals,
  isDeleteMode,
  setIsDeleteMode,
  onDeleteExpenses,
  onEditExpense,
}) => {
  //-------------------------- busca --------------------------
  const [query, setQuery] = useState("");
  const isSearching = query.trim() !== "";

  //-------------------------- mais recentes primeiro --------------------------
  const sortedExpenses = searchExpenses(expenseList, query).sort(
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
                {isSearching ? "Resultados" : "Histórico"} (
                {sortedExpenses.length})
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
            <Text style={styles.emptyTitle}>Nenhum gasto registrado</Text>
            <Text style={styles.emptyText}>
              Volte para o início e toque no botão + para adicionar.
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
