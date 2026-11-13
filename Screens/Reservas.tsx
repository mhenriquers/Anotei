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
import { Reserva } from "../Types";
import DraggableFab from "../components/DraggableFab";
import ModalReserva from "../components/ModalReserva";
import ConfirmDialog from "../components/ConfirmDialog";
import { colors, radius, shadow, formatBRL } from "../theme";

interface ReservasProps {
  reservas: Reserva[];
  onChange: (reservas: Reserva[]) => void; // salva a lista atualizada
}

// null = modal fechado; "new" = nova reserva; string = id da reserva em edição
type Editing = null | "new" | string;

//---------------------- tela de reservas (dinheiro guardado) ----------------------
const Reservas: React.FC<ReservasProps> = ({ reservas, onChange }) => {
  const [editing, setEditing] = useState<Editing>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const total = reservas.reduce((soma, r) => soma + (r.valor || 0), 0);
  const editingReserva =
    editing && editing !== "new"
      ? (reservas.find((r) => r.id === editing) ?? null)
      : null;
  const reservaToDelete = reservas.find((r) => r.id === confirmDeleteId);

  const handleSave = (data: Omit<Reserva, "id">) => {
    if (editingReserva) {
      onChange(
        reservas.map((r) =>
          r.id === editingReserva.id ? { ...data, id: r.id } : r,
        ),
      );
    } else {
      onChange([...reservas, { ...data, id: Date.now().toString() }]);
    }
    setEditing(null);
  };

  const confirmDelete = () => {
    onChange(reservas.filter((r) => r.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      {/* View interno: a lista e o botão + terminam acima dos botões do celular */}
      <View style={styles.inner}>
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total guardado</Text>
              <Text style={styles.summaryValue}>{formatBRL(total)}</Text>
              <Text style={styles.summaryHint}>
                {reservas.length === 1
                  ? "1 reserva"
                  : `${reservas.length} reservas`}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const details = [item.finalidade, item.local]
              .filter((text) => text && text.trim())
              .join(" · ");
            const metaPercent = item.meta
              ? Math.min((item.valor / item.meta) * 100, 100)
              : 0;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => setEditing(item.id)}
                activeOpacity={0.7}
                accessibilityHint="Abre a reserva para editar"
              >
                <View style={styles.cardRow}>
                <View style={styles.iconBadge}>
                  <Ionicons
                    name="wallet-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  {details ? (
                    <Text style={styles.details} numberOfLines={2}>
                      {details}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.amount}>{formatBRL(item.valor)}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textLight}
                  style={styles.chevron}
                />
                </View>

                {/* meta: barra com quanto já foi juntado */}
                {!!item.meta && (
                  <View style={styles.meta}>
                    <View style={styles.metaBar}>
                      <View
                        style={[
                          styles.metaFill,
                          { width: `${metaPercent}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.metaText}>
                      {Math.floor((item.valor / item.meta) * 100)}% da meta ·{" "}
                      {formatBRL(item.valor)} de {formatBRL(item.meta)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="wallet-outline"
                size={40}
                color={colors.textLight}
              />
              <Text style={styles.emptyTitle}>Nenhuma reserva</Text>
              <Text style={styles.emptyText}>
                Dê um nome para cada parte do seu dinheiro guardado: reserva de
                emergência, viagem, carro novo... Toque no botão + para começar.
              </Text>
            </View>
          }
          ListFooterComponent={<View style={styles.fabSpacer} />}
        />

        <DraggableFab
          onPress={() => setEditing("new")}
          storageKey="fab-position-reservas"
          accessibilityLabel="Adicionar reserva"
        />

        {editing !== null && (
          <ModalReserva
            visible
            reserva={editingReserva}
            onClose={() => setEditing(null)}
            onSave={handleSave}
            onDelete={
              editingReserva
                ? () => {
                    setConfirmDeleteId(editingReserva.id);
                    setEditing(null);
                  }
                : undefined
            }
          />
        )}

        <ConfirmDialog
          visible={confirmDeleteId !== null}
          title="Excluir reserva?"
          message={`"${reservaToDelete?.nome ?? ""}" será apagada. Essa ação não pode ser desfeita.`}
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    ...shadow,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  meta: {
    marginTop: 12,
  },
  metaBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  metaFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
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

export default Reservas;
