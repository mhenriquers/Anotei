import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { formStyles } from "./formStyles";

// Adicionado o tipo genérico <T> que estende um objeto com 'id'
interface MenuExclusaoGenericoProps<T extends { id: string }> {
  items: T[]; // A lista de dados (bills, expenses, etc.)
  storageKey: string; // A chave específica do AsyncStorage para salvar
  title: string; // O título principal do Modal (ex: "Excluir Gastos")
  subtitle: string; // O subtítulo descritivo
  renderTitle: (item: T) => string; // Função que escolhe qual propriedade é o título
  renderSubtitle: (item: T) => string; // Função que escolhe qual propriedade é o valor/subtítulo
  onDelete: (ids: string[]) => void; // Disparado passando os IDs deletados para atualizar a tela principal
  onCancel: () => void; // Fecha o modal
}

// O componente aceita o tipo genérico <T>
const MenuExclusaoGenerico = <T extends { id: string }>({
  items,
  storageKey,
  title,
  subtitle,
  renderTitle,
  renderSubtitle,
  onDelete,
  onCancel,
}: MenuExclusaoGenericoProps<T>) => {
  const insets = useSafeAreaInsets();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const persistItems = async (updatedItems: T[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems));
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar os dados atualizados.");
    }
  };

  const handleSelect = (id: string): void => {
    setSelectedIds((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((item) => item !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (selectedIds.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um item para excluir.");
      return;
    }

    setIsDeleting(true);
    try {
      const updatedItems = items.filter(
        (item) => !selectedIds.includes(item.id),
      );
      await persistItems(updatedItems);

      onDelete(selectedIds);
      setSelectedIds([]);
      onCancel();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível realizar a exclusão.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = (): void => {
    setSelectedIds([]);
    onCancel();
  };

  const renderItem = ({ item }: { item: T }) => {
    const selected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.item, selected && styles.itemSelected]}
        onPress={() => handleSelect(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.check, selected && styles.checkSelected]}>
          {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
        {/* Usa as funções dinâmicas passadas por props para renderizar os textos */}
        <Text style={styles.description} numberOfLines={1}>
          {renderTitle(item)}
        </Text>
        <Text style={styles.amount}>{renderSubtitle(item)}</Text>
      </TouchableOpacity>
    );
  };

  const disabled = selectedIds.length === 0 || isDeleting;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={items.length > 0}
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <View style={formStyles.overlay}>
        <View
          style={[
            formStyles.sheet,
            styles.sheet,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={formStyles.handle} />
          <Text style={formStyles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum item disponível.</Text>
            }
          />

          <View style={formStyles.buttonRow}>
            <TouchableOpacity
              style={[formStyles.button, formStyles.buttonSecondary]}
              onPress={handleCancel}
              disabled={isDeleting}
            >
              <Text style={formStyles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                formStyles.button,
                styles.deleteButton,
                disabled && styles.buttonDisabled,
              ]}
              onPress={handleConfirmDelete}
              disabled={disabled}
            >
              <Text style={formStyles.buttonPrimaryText}>
                {isDeleting
                  ? "Excluindo..."
                  : `Excluir (${selectedIds.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    maxHeight: "80%",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 14,
  },
  list: { maxHeight: 340 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  itemSelected: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkSelected: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  amount: { fontSize: 15, fontWeight: "700", color: colors.text },
  emptyText: { textAlign: "center", color: colors.textLight, marginTop: 20 },
  deleteButton: { backgroundColor: colors.danger },
  buttonDisabled: { opacity: 0.5 },
});

export default MenuExclusaoGenerico;
