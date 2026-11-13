import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DraggableFab from "../components/DraggableFab";
import ModalRecorrente from "../components/ModalRecorrente";
import ConfirmDialog from "../components/ConfirmDialog";
import PaymentIcon from "../components/PaymentIcon";
import { vibrar } from "../feedback";
import { colors, radius, shadow, formatBRL } from "../theme";
import { getPaymentInfo } from "../paymentMethods";
import {
  Recorrente,
  firstMonthDone,
  saveRecorrentes,
  useRecorrentes,
} from "../recurring";

interface RecorrentesProps {
  onApply: () => void; // lança na hora os gastos que já chegaram (depois de editar)
}

// null = modal fechado; "new" = novo; string = id do recorrente em edição
type Editing = null | "new" | string;

//---------------------- tela de gastos recorrentes (assinaturas) ----------------------
const Recorrentes: React.FC<RecorrentesProps> = ({ onApply }) => {
  const list = useRecorrentes();
  const [editing, setEditing] = useState<Editing>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const total = list.reduce((soma, item) => soma + item.amount, 0);
  const editingItem =
    editing && editing !== "new"
      ? (list.find((item) => item.id === editing) ?? null)
      : null;
  const itemToDelete = list.find((item) => item.id === confirmDeleteId);

  const handleSave = (data: Omit<Recorrente, "id" | "ultimoMes">) => {
    if (editingItem) {
      saveRecorrentes(
        list.map((item) =>
          item.id === editingItem.id ? { ...item, ...data } : item,
        ),
      );
    } else {
      saveRecorrentes([
        ...list,
        {
          ...data,
          id: Date.now().toString(),
          ultimoMes: firstMonthDone(data.dia),
        },
      ]);
    }
    setEditing(null);
    onApply();
    vibrar();
  };

  const confirmDelete = () => {
    saveRecorrentes(list.filter((item) => item.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.inner}>
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total por mês</Text>
              <Text style={styles.summaryValue}>{formatBRL(total)}</Text>
              <Text style={styles.summaryHint}>
                {list.length === 1
                  ? "1 gasto recorrente"
                  : `${list.length} gastos recorrentes`}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const payment = getPaymentInfo(item.category);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => setEditing(item.id)}
                activeOpacity={0.7}
                accessibilityHint="Abre o recorrente para editar"
              >
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: payment.softColor },
                  ]}
                >
                  <PaymentIcon method={item.category} size={20} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.details}>
                    Todo dia {item.dia} · {payment.label}
                  </Text>
                </View>
                <Text style={styles.amount}>{formatBRL(item.amount)}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textLight}
                  style={styles.chevron}
                />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="repeat-outline"
                size={40}
                color={colors.textLight}
              />
              <Text style={styles.emptyTitle}>Nenhum gasto recorrente</Text>
              <Text style={styles.emptyText}>
                Cadastre assinaturas como Netflix e Spotify: todo mês, no dia da
                cobrança, o gasto é lançado sozinho. Toque no botão + para
                começar.
              </Text>
            </View>
          }
          ListFooterComponent={<View style={styles.fabSpacer} />}
        />

        <DraggableFab
          onPress={() => setEditing("new")}
          storageKey="fab-position-recorrentes"
          accessibilityLabel="Adicionar recorrente"
        />

        {editing !== null && (
          <ModalRecorrente
            recorrente={editingItem}
            onClose={() => setEditing(null)}
            onSave={handleSave}
            onDelete={
              editingItem
                ? () => {
                    setConfirmDeleteId(editingItem.id);
                    setEditing(null);
                  }
                : undefined
            }
          />
        )}

        <ConfirmDialog
          visible={confirmDeleteId !== null}
          title="Excluir recorrente?"
          message={`"${itemToDelete?.title ?? ""}" deixa de ser lançado todo mês. Os gastos já lançados continuam na lista.`}
          icon="trash-outline"
          tone="danger"
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 10,
  },
  summaryCard: {
    backgroundColor: colors.hero,
    borderRadius: radius.xl,
    padding: 22,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.heroMuted,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
  },
  summaryHint: {
    fontSize: 13,
    color: colors.heroMuted,
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    ...shadow,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  details: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  chevron: {
    marginLeft: 6,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 20,
  },
  fabSpacer: {
    height: 70,
  },
});

export default Recorrentes;
