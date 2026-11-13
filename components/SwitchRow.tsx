import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { IconName } from "./DetailsSheet";

interface SwitchRowProps {
  icon: IconName;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

//---------------------- linha com chave liga/desliga (mesmo visual do ReminderToggle) ----------------------
const SwitchRow: React.FC<SwitchRowProps> = ({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}) => (
  <View style={styles.row}>
    <View
      style={[
        styles.iconBadge,
        { backgroundColor: value ? colors.primarySoft : colors.border },
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={value ? colors.primary : colors.textMuted}
      />
    </View>
    <View style={styles.info}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor="#FFFFFF"
    />
  </View>
);

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

export default SwitchRow;
