import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { IconName } from "./DetailsSheet";

export interface SheetAction {
  icon: IconName;
  label: string;
  onPress: () => void;
  danger?: boolean; // vermelho (ex: Apagar)
}

interface ActionSheetProps {
  title: string | null; // null = fechado
  actions: SheetAction[];
  onClose: () => void;
}

//---------------------- menu de ações rápidas (toque longo num gasto ou conta) ----------------------
const ActionSheet: React.FC<ActionSheetProps> = ({ title, actions, onClose }) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={title !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.sheet, { marginBottom: insets.bottom + 16 }]}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.action}
              onPress={() => {
                onClose();
                action.onPress();
              }}
            >
              <Ionicons
                name={action.icon}
                size={20}
                color={action.danger ? colors.danger : colors.text}
              />
              <Text
                style={[styles.actionText, action.danger && styles.danger]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 12,
  },
  danger: {
    color: colors.danger,
  },
  cancel: {
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.hero,
  },
});

export default ActionSheet;
