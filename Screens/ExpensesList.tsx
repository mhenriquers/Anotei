import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Type } from "../Types";
import MenuExclusaoGenerico from "../components/ExcluseMenu";
import ExpenseItem from "../components/ExpenseItem";
import { colors, radius, shadow, formatBRL } from "../theme";

interface ExpenseProps {
  expenseList: Type[];
  totalGastoCredito: number;
  totalGastoDebito: number;
  isDeleteMode: boolean;
  setIsDeleteMode: (visible: boolean) => void;
  onDeleteExpenses: (ids: string[]) => void; // Mantemos a função que atualiza a lista global
}

const ExpenseList: React.FC<ExpenseProps> = ({
  expenseList,
  totalGastoCredito,
  totalGastoDebito,
  isDeleteMode,
  setIsDeleteMode,
  onDeleteExpenses,
}) => {
  //-------------------------- mais recentes primeiro --------------------------
  const sortedExpenses = [...expenseList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    // edges "bottom": a lista termina acima dos botões do celular
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          //--------------------------------CARD TOTAL---------------------------------//
          <View>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { marginRight: 12 }]}>
                <View style={styles.summaryLabelRow}>
                  <Ionicons
                    name="card-outline"
                    size={16}
                    color={colors.credit}
                  />
                  <Text style={styles.summaryLabel}>Crédito</Text>
                </View>
                <Text style={styles.summaryValue}>
                  {formatBRL(totalGastoCredito)}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <View style={styles.summaryLabelRow}>
                  <Ionicons
                    name="cash-outline"
                    size={16}
                    color={colors.debit}
                  />
                  <Text style={styles.summaryLabel}>Débito</Text>
                </View>
                <Text style={styles.summaryValue}>
                  {formatBRL(totalGastoDebito)}
                </Text>
              </View>
            </View>
            {expenseList.length > 0 && (
              <Text style={styles.sectionTitle}>
                Histórico ({expenseList.length})
              </Text>
            )}
          </View>
        }
        data={sortedExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseItem item={item} />}
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
  summaryRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow,
  },
  summaryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
    marginLeft: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 8,
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
