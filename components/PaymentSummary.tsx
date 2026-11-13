import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, radius, shadow, formatBRL } from "../theme";
import {
  PAYMENT_METHODS,
  PaymentTotals,
  getPaymentInfo,
} from "../paymentMethods";
import PaymentIcon from "./PaymentIcon";

interface PaymentSummaryProps {
  totals: PaymentTotals;
  onPress?: () => void; // se passado, o card inteiro é tocável
}

//---------------------- total por forma de pagamento (Home e lista de gastos) ----------------------
// Uma linha por forma: cabe em qualquer largura de tela, mesmo com valores grandes.
const PaymentSummary: React.FC<PaymentSummaryProps> = ({ totals, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.8}
  >
    {PAYMENT_METHODS.map((method, index) => {
      const info = getPaymentInfo(method);
      return (
        <View
          key={method}
          style={[styles.row, index > 0 && styles.rowDivider]}
        >
          <View style={[styles.iconBadge, { backgroundColor: info.softColor }]}>
            <PaymentIcon method={method} size={18} />
          </View>
          <Text style={styles.label}>{info.label}</Text>
          <Text style={styles.value} numberOfLines={1}>
            {formatBRL(totals[method])}
          </Text>
        </View>
      );
    })}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
    ...shadow,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
});

export default PaymentSummary;
