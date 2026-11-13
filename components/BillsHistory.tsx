import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, formatBRL } from "../theme";
import { monthLabel } from "../months";
import { useBillsHistory } from "../billsMonth";
import { formStyles } from "./formStyles";

interface BillsHistoryProps {
  visible: boolean;
  onClose: () => void;
}

//---------------------- histórico das contas fixas, mês a mês ----------------------
const BillsHistory: React.FC<BillsHistoryProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const history = useBillsHistory();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={formStyles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            formStyles.sheet,
            styles.sheet,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={formStyles.handle} />
          <View style={formStyles.header}>
            <Text style={formStyles.title}>Histórico das contas</Text>
            <TouchableOpacity
              onPress={onClose}
              style={formStyles.closeButton}
              accessibilityLabel="Fechar"
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {history.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="time-outline"
                  size={40}
                  color={colors.textLight}
                />
                <Text style={styles.emptyText}>
                  Quando o mês virar, as contas pagas são desmarcadas e o mês
                  que acabou aparece aqui.
                </Text>
              </View>
            ) : (
              history.map((month) => {
                const pagas = month.contas.filter((c) => c.pago);
                const totalPago = pagas.reduce((s, c) => s + c.valor, 0);
                return (
                  <View key={month.mes} style={styles.month}>
                    <View style={styles.monthHeader}>
                      <Text style={styles.monthTitle}>
                        {monthLabel(month.mes)}
                      </Text>
                      <Text style={styles.monthTotal}>
                        {formatBRL(totalPago)} pagos
                      </Text>
                    </View>
                    <Text style={styles.monthHint}>
                      {pagas.length} de {month.contas.length} contas pagas
                    </Text>
                    {month.contas.map((conta, index) => (
                      <View key={`${conta.nome}-${index}`} style={styles.row}>
                        <Ionicons
                          name={
                            conta.pago ? "checkmark-circle" : "ellipse-outline"
                          }
                          size={18}
                          color={conta.pago ? colors.primary : colors.warning}
                        />
                        <Text style={styles.rowName} numberOfLines={1}>
                          {conta.nome}
                        </Text>
                        <Text style={styles.rowValue}>
                          {formatBRL(conta.valor)}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    maxHeight: "85%",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 10,
  },
  month: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  monthTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  monthHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  rowName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
});

export default BillsHistory;
