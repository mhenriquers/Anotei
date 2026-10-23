import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";

interface MenuOverlayProps {
  isVisible: boolean;
  dataLength: number;
  dataType: "bills" | "expenses";
  onOpen: () => void;
  onClose: () => void;
  onDeleteAll?: () => void; // se for passado, o menu mostra a opção "Apagar todos"
  onUncheckAll?: () => void; // se for passado, o menu mostra a opção "Desmarcar todas"
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({
  isVisible,
  dataLength,
  dataType,
  onOpen,
  onClose,
  onDeleteAll,
  onUncheckAll,
}) => {
  const insets = useSafeAreaInsets();

  const showEmptyWarning = () => {
    const message =
      dataType === "bills"
        ? "Não há contas para apagar."
        : "Não há gastos para apagar.";

    Alert.alert("Aviso", message);
    onClose();
  };

  const handlePressDelete = () => {
    if (dataLength > 0) {
      onOpen();
    } else {
      showEmptyWarning();
    }
  };

  const handlePressDeleteAll = () => {
    if (dataLength > 0) {
      onClose();
      onDeleteAll?.();
    } else {
      showEmptyWarning();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { paddingTop: insets.top + 52 }]}>
          <View style={styles.menuContainer}>
            {onUncheckAll && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  onUncheckAll();
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={colors.text}
                />
                <Text style={styles.actionText}>Desmarcar todas as contas</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.menuItem,
                !!onUncheckAll && styles.menuItemDivider,
              ]}
              onPress={handlePressDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={styles.deleteText}>
                {dataType === "bills" ? "Excluir contas" : "Excluir gastos"}
              </Text>
            </TouchableOpacity>

            {onDeleteAll && (
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDivider]}
                onPress={handlePressDeleteAll}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text style={styles.deleteText}>
                  {dataType === "bills"
                    ? "Apagar todas as contas"
                    : "Apagar todos os gastos"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.2)",
    alignItems: "flex-end",
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    minWidth: 180,
    paddingVertical: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },
});

export default MenuOverlay;
