import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, formatDate } from "../theme";
import ConfirmDialog, { ConfirmDialogContent } from "./ConfirmDialog";
import {
  BackupData,
  parseBackup,
  pickBackupFile,
  restoreBackup,
} from "../backup";

//---------------------- versão web: lembrete de backup (topo da tela inicial) ----------------------
interface BackupReminderProps {
  daysSinceBackup: number | null; // null = nunca fez backup
  onBackup: () => void;
  onSnooze: () => void;
}

export const BackupReminder: React.FC<BackupReminderProps> = ({
  daysSinceBackup,
  onBackup,
  onSnooze,
}) => (
  <View style={styles.reminder}>
    <View style={styles.reminderHeader}>
      <Ionicons name="cloud-upload-outline" size={22} color={colors.hero} />
      <Text style={styles.reminderTitle}>Hora de fazer um backup</Text>
    </View>
    <Text style={styles.reminderText}>
      {daysSinceBackup === null
        ? "Você ainda não fez nenhum backup."
        : `Seu último backup foi há ${daysSinceBackup} dias.`}{" "}
      Seus dados ficam só neste celular: com o backup, você não perde nada se
      trocar de aparelho.
    </Text>
    <View style={styles.reminderButtons}>
      <TouchableOpacity
        style={styles.reminderSecondary}
        onPress={onSnooze}
        activeOpacity={0.8}
      >
        <Text style={styles.reminderSecondaryText}>Agora não</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.reminderPrimary}
        onPress={onBackup}
        activeOpacity={0.8}
      >
        <Text style={styles.reminderPrimaryText}>Fazer backup</Text>
      </TouchableOpacity>
    </View>
  </View>
);

//---------------------- versão web: backup e restauração (fim da tela inicial) ----------------------
interface BackupCardProps {
  lastBackup: number | null;
  hasData: boolean;
  onBackup: () => void;
}

type Dialog = ConfirmDialogContent | null;

const describeBackup = (data: BackupData) => {
  const gastos =
    data.expenses.length === 1 ? "1 gasto" : `${data.expenses.length} gastos`;
  const contas =
    data.bills.length === 1 ? "1 conta fixa" : `${data.bills.length} contas fixas`;
  const date = new Date(data.exportedAt);
  const when = isNaN(date.getTime()) ? "" : ` (feito em ${formatDate(date)})`;
  return `O backup tem ${gastos} e ${contas}${when}.`;
};

export const BackupCard: React.FC<BackupCardProps> = ({
  lastBackup,
  hasData,
  onBackup,
}) => {
  const [dialog, setDialog] = useState<Dialog>(null);
  const closeDialog = () => setDialog(null);

  const showError = (message: string) =>
    setDialog({
      title: "Não deu para restaurar",
      message,
      icon: "alert-circle-outline",
      tone: "danger",
      confirmLabel: "Entendi",
      onConfirm: closeDialog,
    });

  const handleRestore = async () => {
    const file = await pickBackupFile();
    if (!file) return;

    let data: BackupData;
    try {
      data = await parseBackup(file);
    } catch (error) {
      showError((error as Error).message);
      return;
    }

    setDialog({
      title: "Restaurar backup?",
      message: hasData
        ? `${describeBackup(data)} Os gastos e contas que estão no app agora serão substituídos.`
        : describeBackup(data),
      icon: "cloud-download-outline",
      tone: hasData ? "danger" : "brand",
      confirmLabel: "Restaurar",
      cancelLabel: "Cancelar",
      onConfirm: async () => {
        try {
          await restoreBackup(data);
          // recarrega o app para todas as telas lerem os dados restaurados
          window.location.reload();
        } catch (error) {
          console.error("Erro ao restaurar backup", error);
          showError("Algo deu errado ao salvar os dados. Tente de novo.");
        }
      },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBadge}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.hero} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>Backup dos dados</Text>
          <Text style={styles.cardSubtitle}>
            {lastBackup
              ? `Último backup: ${formatDate(lastBackup)}`
              : "Nenhum backup ainda"}
          </Text>
        </View>
      </View>

      <View style={styles.cardButtons}>
        <TouchableOpacity
          style={[styles.cardButton, !hasData && styles.cardButtonDisabled]}
          onPress={onBackup}
          disabled={!hasData}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={18} color={colors.hero} />
          <Text style={styles.cardButtonText}>Fazer backup</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cardButton, { marginLeft: 10 }]}
          onPress={handleRestore}
          activeOpacity={0.8}
        >
          <Ionicons name="download-outline" size={18} color={colors.hero} />
          <Text style={styles.cardButtonText}>Restaurar</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={dialog !== null}
        title={dialog?.title ?? ""}
        message={dialog?.message ?? ""}
        icon={dialog?.icon ?? "alert-circle-outline"}
        tone={dialog?.tone ?? "brand"}
        confirmLabel={dialog?.confirmLabel ?? ""}
        cancelLabel={dialog?.cancelLabel}
        onConfirm={() => dialog?.onConfirm()}
        onCancel={closeDialog}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  reminder: {
    backgroundColor: colors.creditSoft,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.heroMuted,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.hero,
    marginLeft: 8,
  },
  reminderText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    marginTop: 8,
  },
  reminderButtons: {
    flexDirection: "row",
    marginTop: 14,
  },
  reminderSecondary: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  reminderSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.hero,
  },
  reminderPrimary: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.hero,
  },
  reminderPrimaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 14,
    marginBottom: 86, // espaço para o botão + não cobrir os botões do backup
    ...shadow,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.creditSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardButtons: {
    flexDirection: "row",
    marginTop: 14,
  },
  cardButton: {
    flex: 1,
    flexDirection: "row",
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardButtonDisabled: {
    opacity: 0.45,
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.hero,
    marginLeft: 6,
  },
});
