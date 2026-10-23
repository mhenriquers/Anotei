import * as React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InterfaceBill } from "../Types";
import { colors, radius, shadow, formatBRL } from "../theme";

interface RenderItemProps {
  itemCard: InterfaceBill;
  onTogglePaid?: () => void;
  onPress?: () => void; // abre o modal com os detalhes da conta
}

//---------------------- card de uma conta fixa ----------------------
const RenderCard: React.FC<RenderItemProps> = ({
  itemCard,
  onTogglePaid,
  onPress,
}) => {
  const paid = itemCard.pago;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={onTogglePaid}
        hitSlop={8}
        accessibilityLabel={paid ? "Marcar como não paga" : "Marcar como paga"}
        style={[styles.checkbox, paid && styles.checkboxChecked]}
      >
        {paid && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityHint={onPress ? "Abre os detalhes da conta" : undefined}
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

        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textLight}
            style={styles.chevron}
          />
        )}
      </TouchableOpacity>
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
    backgroundColor: colors.warningSoft,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  chevron: {
    marginLeft: 6,
  },
});

export default RenderCard;
