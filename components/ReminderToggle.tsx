import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { REMINDER_HOUR } from "../notifications";

interface ReminderToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  dueDay: number | null; // sem um dia válido, a chave fica desativada
}

//---------------------- chave "Avisar no vencimento" (cadastro e detalhes da conta) ----------------------
const ReminderToggle: React.FC<ReminderToggleProps> = ({
  value,
  onValueChange,
  dueDay,
}) => {
  const enabled = dueDay !== null;
  const active = value && enabled;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: active ? colors.primarySoft : colors.border },
        ]}
      >
        <Ionicons
          name={active ? "notifications" : "notifications-off-outline"}
          size={18}
          color={active ? colors.primary : colors.textMuted}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>Avisar no vencimento</Text>
        <Text style={styles.subtitle}>
          {!enabled
            ? "Informe o dia do vencimento"
            : value
              ? `Notificação no dia ${dueDay}, às ${REMINDER_HOUR}h`
              : "Desligado"}
        </Text>
      </View>

      <Switch
        value={active}
        onValueChange={onValueChange}
        disabled={!enabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default ReminderToggle;
