import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Type } from "../Types";
import { colors, radius, shadow, formatBRL, formatDate } from "../theme";
import { getPaymentInfo } from "../paymentMethods";
import { expenseTitle } from "../installments";
import PaymentIcon from "./PaymentIcon";

interface ExpenseItemProps {
  item: Type;
  onPress?: () => void; // abre o modal com os detalhes do gasto
}

//---------------------- card de um gasto (usado na Home e na lista) ----------------------
const ExpenseItem: React.FC<ExpenseItemProps> = ({ item, onPress }) => {
  const payment = getPaymentInfo(item.category);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityHint={onPress ? "Abre os detalhes do gasto" : undefined}
    >
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: payment.softColor },
        ]}
      >
        <PaymentIcon method={item.category} size={22} />
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {expenseTitle(item)}
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
        <Text style={[styles.tag, { color: payment.color }]}>
          {payment.label}
        </Text>
      </View>

      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textLight}
          style={styles.chevron}
        />
      )}
    </TouchableOpacity>
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
  chevron: {
    marginLeft: 6,
  },
});

export default ExpenseItem;
