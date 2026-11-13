import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, formatDate } from "../theme";
import ConfirmDialog, { ConfirmDialogContent } from "./ConfirmDialog";
import { BackupData, parseBackup, restoreBackup } from "../backup";
import { pickBackupText } from "../backupFile";

//---------------------- lembrete de backup (topo da tela inicial) ----------------------
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

//---------------------- texto do item "Fazer backup" do menu ----------------------
export const describeLastBackup = (lastBackup: number | null) =>
  lastBackup ? `Último: ${formatDate(lastBackup)}` : "Nenhum backup ainda";

//---------------------- restaurar backup (escolher arquivo + confirmação) ----------------------
const describeBackup = (data: BackupData) => {
  const gastos =
    data.expenses.length === 1 ? "1 gasto" : `${data.expenses.length} gastos`;
  const contas =
    data.bills.length === 1 ? "1 conta fixa" : `${data.bills.length} contas fixas`;
  const reservas = data.reservas
    ? data.reservas.length === 1
      ? "1 reserva"
      : `${data.reservas.length} reservas`
    : null;
  const partes = reservas
    ? `${gastos}, ${contas} e ${reservas}`
    : `${gastos} e ${contas}`;
  const date = new Date(data.exportedAt);
  const when = isNaN(date.getTime()) ? "" : ` (feito em ${formatDate(date)})`;
  return `O backup tem ${partes}${when}.`;
};

// `startRestore` precisa ser chamado direto no toque do botão: o iPhone só abre
// o seletor de arquivos se não houver espera entre o toque e a chamada.
// `dialog` é a caixa de confirmação: renderize fora da gaveta, que fecha no toque.
// `onRestored` recarrega os dados do app depois de restaurar.
export const useBackupRestore = (
  hasData: boolean,
  onRestored: () => Promise<void>,
) => {
  const [dialog, setDialog] = useState<ConfirmDialogContent | null>(null);
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

  const startRestore = async () => {
    let text: string | null;
    try {
      text = await pickBackupText();
    } catch (error) {
      console.error("Erro ao ler o arquivo de backup", error);
      showError("Não foi possível abrir esse arquivo. Tente de novo.");
      return;
    }
    if (text === null) return; // cancelou

    let data: BackupData;
    try {
      data = parseBackup(text);
    } catch (error) {
      showError((error as Error).message);
      return;
    }

    setDialog({
      title: "Restaurar backup?",
      message: hasData
        ? `${describeBackup(data)} ${
            data.reservas
              ? "Os gastos, contas e reservas"
              : "Os gastos e contas"
          } que estão no app agora serão substituídos.`
        : describeBackup(data),
      icon: "cloud-download-outline",
      tone: hasData ? "danger" : "brand",
      confirmLabel: "Restaurar",
      cancelLabel: "Cancelar",
      onConfirm: async () => {
        try {
          await restoreBackup(data);
          // as telas leem os dados restaurados
          await onRestored();
          setDialog({
            title: "Backup restaurado",
            message: "Seus dados foram recuperados.",
            icon: "checkmark-circle-outline",
            tone: "brand",
            confirmLabel: "OK",
            onConfirm: closeDialog,
          });
        } catch (error) {
          console.error("Erro ao restaurar backup", error);
          showError("Algo deu errado ao salvar os dados. Tente de novo.");
        }
      },
    });
  };

  const dialogElement = (
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
  );

  return { startRestore, dialog: dialogElement };
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
});
