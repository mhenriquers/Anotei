import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Type } from "../Types";
import { colors, radius, shadow, formatBRL, formatDate } from "../theme";

interface ExpenseItemProps {
  item: Type;
}

//---------------------- card de um gasto (usado na Home e na lista) ----------------------
const ExpenseItem: React.FC<ExpenseItemProps> = ({ item }) => {
  const isCredit = item.category === "credit card";

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: isCredit ? colors.creditSoft : colors.debitSoft },
        ]}
      >
        <Ionicons
          name={isCredit ? "card-outline" : "cash-outline"}
          size={22}
          color={isCredit ? colors.credit : colors.debit}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        {item.observacao ? (
          <Text style={styles.obs} numberOfLines={2}>
            {item.observacao}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{formatBRL(item.amount)}</Text>
        <Text
          style={[
            styles.tag,
            { color: isCredit ? colors.credit : colors.debit },
          ]}
        >
          {isCredit ? "Crédito" : "Débito"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    ...shadow,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  obs: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  tag: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default ExpenseItem;
