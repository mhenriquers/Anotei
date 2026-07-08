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
  totalGastoCredito: number;
  totalGastoDebito: number;
  selectedExpenseIds: string[];
  onSelectExpense: (id: string) => void;
  isDeleteMode: boolean;
}
const ExpenseList: React.FC<ExpenseProps> = ({
  expenseList,
  totalGastoCredito,
  totalGastoDebito,
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
          //--------------------------------CARD TOTAL---------------------------------//

          <View style={styles.containerCards}>
            <View style={[styles.totalCard, styles.totalCredit]}>
              <Text style={styles.textTotal}>Crédito:</Text>
              <Text style={styles.textoNumberTotal}>
                R$ {totalGastoCredito.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.totalCard, styles.totalDebit]}>
              <Text style={styles.textTotal}>Débito:</Text>
              <Text style={styles.textoNumberTotal}>
                R$ {totalGastoDebito.toFixed(2)}
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Image
                    source={
                      item.category === "credit card"
                        ? require("./assets/credit-card-icon.png")
                        : require("./assets/money-icon.png")
                    }
                    style={styles.cardIcon}
                  />
                  <View style={styles.cardTitle}>
                    <Text style={styles.expenseTitle} numberOfLines={2}>
                      {" "}
                      {item.title}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text style={styles.expenseValue}>
                    R$ {item.amount.toFixed(2)}
                  </Text>
                </View>
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
  containerCards: {
    overflow: "visible",
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#333",
  },

  totalCredit: {
    left: 10,
    backgroundColor: "#90CAF9",
    minWidth: "40%",
  },

  totalDebit: {
    right: 15,
    marginLeft: 5,
    backgroundColor: "#bfffab",
    minWidth: "40%",
  },

  textTotal: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  textoNumberTotal: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 6,
  },
  cardSuperior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  expenseValue: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "right",
  },

  cardTitle: {
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: 165,
    // borderWidth: 1,
    // borderColor: "#000",
  },

  expenseTitle: {
    paddingTop: 10,
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
