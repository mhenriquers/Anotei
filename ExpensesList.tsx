import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Type } from "./Types";

interface ExpenseProps {
  expenseList: Type[];
  totalGasto: number;
  selectedExpenseIds: string[];
  onSelectExpense: (id: string) => void;
  isDeleteMode: boolean;
}
const ExpenseList: React.FC<ExpenseProps> = ({
  expenseList,
  totalGasto,
  selectedExpenseIds,
  onSelectExpense,
  isDeleteMode,
}) => {
  return (
    <View style={{ flex: 1 }}>
      {/* <View style={styles.totalCard}>
        <Text> Total: </Text>
        <Text>R$ {totalGasto.toFixed(2)}</Text>
      </View> */}
      <FlatList
        ListHeaderComponent={
          <View style={{ overflow: "visible", paddingHorizontal: 12 }}>
            <View style={styles.totalCard}>
              <Text style={{ fontSize: 14, color: "#666", fontWeight: "500" }}>
                Total:
              </Text>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "bold",
                  color: "#333",
                  marginTop: 6,
                }}
              >
                R$ {totalGasto.toFixed(2)}
              </Text>
            </View>
          </View>
        }
        data={expenseList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseCard}>
            <TouchableOpacity>
              <View style={styles.cardSuperior}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={require("./assets/credit-card-icon.png")}
                    style={styles.cardIcon}
                  />
                  <Text style={styles.expenseTitle}> {item.title}</Text>
                </View>
                <Text style={styles.expenseSuperior}>
                  R$ {item.amount.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.expenseInferior}>
                {item.createdAt.toLocaleString("pt-BR")}
              </Text>
              {item.observacao && (
                <Text style={styles.expenseInferior}>{item.observacao} </Text>
              )}
            </TouchableOpacity>
            {isDeleteMode && (
              <View style={styles.checkBox}>
                <TouchableOpacity
                  onPress={() => onSelectExpense(item.id)}
                  style={[
                    styles.buttonCheckBox,
                    selectedExpenseIds.includes(item.id) && {
                      backgroundColor: "#d60606",
                    },
                  ]}
                >
                  {selectedExpenseIds.includes(item.id) && (
                    <Text style={styles.checkMark}> ✓ </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  expenseCard: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingBottom: 5,
    marginHorizontal: 20,
    marginVertical: 5,
    backgroundColor: "#FFF",
    elevation: 10,
  },

  totalCard: {
    backgroundColor: "#90CAF9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#333",
  },

  cardSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  expenseSuperior: {
    fontWeight: "bold",
    fontSize: 20,
  },

  expenseTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  expenseInferior: {
    fontSize: 16,
    marginTop: 2,
  },

  cardIcon: {
    height: 50,
    width: 50,
  },

  checkBox: {
    alignItems: "flex-end",
    bottom: 15,
    right: 10,
  },

  buttonCheckBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 4,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  checkMark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ExpenseList;
