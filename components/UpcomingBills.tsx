import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InterfaceBill } from "../Types";
import { colors, radius, shadow, formatBRL } from "../theme";
import { UPCOMING_DAYS, describeDue, getUpcomingBills } from "../dueDates";

interface UpcomingBillsProps {
  bills: InterfaceBill[];
  onPress: () => void; // abre a tela de contas fixas
}

const MAX_ROWS = 4;

//---------------------- versão web: contas a vencer (no lugar das notificações) ----------------------
const UpcomingBills: React.FC<UpcomingBillsProps> = ({ bills, onPress }) => {
  // o app instalado no iPhone fica aberto em segundo plano por dias;
  // ao voltar para ele, recalcula com a data de hoje
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);

  const upcoming = getUpcomingBills(bills, now);
  if (upcoming.length === 0) return null;

  const urgent = upcoming.some((item) => item.daysLeft <= 0);
  const accent = urgent ? colors.danger : colors.warning;
  const accentSoft = urgent ? colors.dangerSoft : colors.warningSoft;
  const hidden = upcoming.length - MAX_ROWS;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: accentSoft }]}>
          <Ionicons name="alarm-outline" size={20} color={accent} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Contas a vencer</Text>
          <Text style={styles.subtitle}>
            {upcoming.length === 1
              ? "1 conta pendente"
              : `${upcoming.length} contas pendentes`}{" "}
            · próximos {UPCOMING_DAYS} dias
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
      </View>

      {upcoming.slice(0, MAX_ROWS).map((item) => {
        const itemUrgent = item.daysLeft <= 0;
        return (
          <View key={item.bill.id} style={styles.row}>
            <View
              style={[
                styles.dot,
                { backgroundColor: itemUrgent ? colors.danger : colors.warning },
              ]}
            />
            <View style={styles.rowInfo}>
              <Text style={styles.rowName} numberOfLines={1}>
                {item.bill.nome}
              </Text>
              <Text
                style={[
                  styles.rowDue,
                  itemUrgent && { color: colors.danger, fontWeight: "600" },
                ]}
              >
                {describeDue(item)}
              </Text>
            </View>
            <Text style={styles.rowValue}>{formatBRL(item.bill.valor)}</Text>
          </View>
        );
      })}

      {hidden > 0 && (
        <Text style={styles.more}>
          {hidden === 1 ? "+ 1 outra conta" : `+ ${hidden} outras contas`}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
    ...shadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  rowInfo: {
    flex: 1,
    marginRight: 8,
  },
  rowName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  rowDue: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  more: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 10,
    textAlign: "center",
  },
});

export default UpcomingBills;
