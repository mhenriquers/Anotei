import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Type } from "./Types";

interface ExpenseProps {
  expenseList: Type[];
}
const ExpenseList: React.FC<ExpenseProps> = ({ expenseList }) => {
  return (
    <FlatList
      data={expenseList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.expenseCard}>
          <Text style={styles.expenseName}> {item.title}</Text>
          <Text style={styles.expenseValue}> R$ {item.amount.toFixed(2)}</Text>
          <Text style={styles.expenseObs}> Obs:{item.observacao} </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  expenseCard: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginVertical: 5,
    backgroundColor: "#FFF",
  },

  expenseName: {
    fontWeight: "bold",
    fontSize: 18,
  },

  expenseValue: {
    fontWeight: "bold",
  },

  expenseObs: {},
});

export default ExpenseList;
