import * as React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InterfaceBill } from "../Types";
import { colors, radius, shadow, formatBRL } from "../theme";

interface RenderItemProps {
  itemCard: InterfaceBill;
  onTogglePaid?: () => void;
}

//---------------------- card de uma conta fixa ----------------------
const RenderCard: React.FC<RenderItemProps> = ({ itemCard, onTogglePaid }) => {
  const [expanded, setExpanded] = React.useState(false);
  const paid = itemCard.pago;
  const hasObs = !!itemCard.obs && itemCard.obs.trim() !== "";

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={onTogglePaid}
          hitSlop={8}
          accessibilityLabel={
            paid ? "Marcar como não paga" : "Marcar como paga"
          }
          style={[styles.checkbox, paid && styles.checkboxChecked]}
        >
          {paid && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.content}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
          disabled={!hasObs}
        >
          <View style={styles.info}>
            <Text
              style={[styles.name, paid && styles.namePaid]}
              numberOfLines={1}
            >
              {itemCard.nome}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={colors.textMuted}
              />
              <Text style={styles.meta}>Venc. {itemCard.venc}</Text>
            </View>
          </View>

          <View style={styles.right}>
            <Text style={[styles.value, paid && styles.namePaid]}>
              {formatBRL(itemCard.valor)}
            </Text>
            <View
              style={[styles.badge, paid ? styles.badgePaid : styles.badgeOpen]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: paid ? colors.primaryDark : colors.warning },
                ]}
              >
                {paid ? "Paga" : "Pendente"}
              </Text>
            </View>
          </View>

          {hasObs && (
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.textLight}
              style={{ marginLeft: 6 }}
            />
          )}
        </TouchableOpacity>
      </View>

      {expanded && hasObs && (
        <View style={styles.obsBox}>
          <Text style={styles.obsLabel}>Observação</Text>
          <Text style={styles.obsText}>{itemCard.obs}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    ...shadow,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.textLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  namePaid: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 4,
  },
  right: {
    alignItems: "flex-end",
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePaid: {
    backgroundColor: colors.primarySoft,
  },
  badgeOpen: {
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  obsBox: {
    marginTop: 12,
    marginLeft: 38,
    padding: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  obsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  obsText: {
    fontSize: 14,
    color: colors.text,
  },
});

export default RenderCard;
