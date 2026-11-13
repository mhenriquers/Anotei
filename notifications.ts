import * as Notifications from "expo-notifications";
import { LogBox, Platform } from "react-native";
import { InterfaceBill } from "./Types";
import { formatBRL } from "./theme";
import {
  REMINDER_HOUR,
  dueDateInMonth,
  getDueDay,
  isReminderOn,
} from "./dueDates";

// Só Android/iOS. Na web o Metro usa notifications.web.ts no lugar deste arquivo.
const CHANNEL_ID = "vencimentos";
const BACKUP_CHANNEL_ID = "backup";
const BILL_PREFIX = "conta:"; // identificador dos avisos de vencimento
const BACKUP_ID = "backup"; // identificador do lembrete de backup
const BACKUP_HOUR = 10; // horário do lembrete de backup

// No Expo Go do Android, o expo-notifications avisa que notificações remotas (push de servidor)
// não funcionam. O app só usa notificações locais, que funcionam, então esses avisos são escondidos.
LogBox.ignoreLogs([
  "`expo-notifications` functionality is not fully supported in Expo Go",
  "[expo-notifications] Push notifications (remote notifications) are unavailable",
]);

// mostra o aviso mesmo se o app estiver aberto na hora
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

//---------------------- próxima data do aviso ----------------------
// Dia do vencimento às 9h, neste mês ou no próximo. Conta já paga pula o mês atual.
// Em meses mais curtos (ex: dia 31 em fevereiro), avisa no último dia do mês.
const nextReminderDate = (dueDay: number, paid: boolean): Date => {
  const now = new Date();
  const build = (year: number, month: number) =>
    dueDateInMonth(dueDay, year, month, REMINDER_HOUR);

  const thisMonth = build(now.getFullYear(), now.getMonth());
  if (!paid && thisMonth > now) return thisMonth;
  return build(now.getFullYear(), now.getMonth() + 1);
};

//---------------------- permissão (Android 13+ pede ao usuário) ----------------------
const ensurePermission = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    // no Android, o pedido de permissão só aparece depois de criar um canal
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Vencimento das contas",
      importance: Notifications.AndroidImportance.HIGH,
    });
    await Notifications.setNotificationChannelAsync(BACKUP_CHANNEL_ID, {
      name: "Lembrete de backup",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

//---------------------- reagenda os avisos de todas as contas ----------------------
const scheduleReminders = async (bills: InterfaceBill[]) => {
  try {
    // recomeça do zero só os avisos de vencimento (o lembrete de backup fica)
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    // (inclui avisos de versões antigas do app, que não tinham o prefixo "conta:")
    for (const item of scheduled) {
      if (item.identifier === BACKUP_ID) continue;
      await Notifications.cancelScheduledNotificationAsync(item.identifier);
    }

    const billsWithReminder = bills.filter(
      (bill) => isReminderOn(bill) && getDueDay(bill) !== null,
    );
    if (billsWithReminder.length === 0) return;
    if (!(await ensurePermission())) return;

    for (const bill of billsWithReminder) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${BILL_PREFIX}${bill.id}`,
        content: {
          title: `${bill.nome} vence hoje`,
          body: `Não esqueça de pagar: ${formatBRL(bill.valor)}`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: nextReminderDate(getDueDay(bill)!, bill.pago),
          channelId: CHANNEL_ID,
        },
      });
    }
  } catch (error) {
    console.error("Erro ao agendar os avisos de vencimento", error);
  }
};

// as chamadas entram numa fila para dois reagendamentos não se misturarem
let queue: Promise<void> = Promise.resolve();
export const syncBillReminders = (bills: InterfaceBill[]): Promise<void> => {
  queue = queue.then(() => scheduleReminders(bills));
  return queue;
};

//---------------------- lembrete de backup pendente ----------------------
// Avisa 30 dias depois do último backup (ou do primeiro uso). Se já passou,
// avisa daqui a 3 dias (o lembrete na tela inicial já aparece antes disso).
const scheduleBackupReminder = async (
  reference: number,
  remindDays: number,
  hasData: boolean,
) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(BACKUP_ID);
    if (!hasData) return;

    const day = 24 * 60 * 60 * 1000;
    let date = new Date(reference + remindDays * day);
    if (date.getTime() <= Date.now()) date = new Date(Date.now() + 3 * day);
    date.setHours(BACKUP_HOUR, 0, 0, 0);

    if (!(await ensurePermission())) return;
    await Notifications.scheduleNotificationAsync({
      identifier: BACKUP_ID,
      content: {
        title: "Hora de fazer backup",
        body: "Seus dados ficam só no aparelho. Abra o Anotei e salve um backup.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: BACKUP_CHANNEL_ID,
      },
    });
  } catch (error) {
    console.error("Erro ao agendar o lembrete de backup", error);
  }
};

export const syncBackupReminder = (
  reference: number,
  remindDays: number,
  hasData: boolean,
): Promise<void> => {
  queue = queue.then(() =>
    scheduleBackupReminder(reference, remindDays, hasData),
  );
  return queue;
};
