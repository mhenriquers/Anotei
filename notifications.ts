import * as Notifications from "expo-notifications";
import { LogBox, Platform } from "react-native";
import { InterfaceBill } from "./Types";
import { formatBRL } from "./theme";

export const REMINDER_HOUR = 9; // horário do aviso no dia do vencimento
const CHANNEL_ID = "vencimentos";

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

//---------------------- dia do vencimento (1 a 31) ----------------------
// Contas novas guardam o número em diaVencimento. Nas antigas, o número é lido do texto (ex: "Dia 5").
export const getDueDay = (bill: InterfaceBill): number | null => {
  const day =
    bill.diaVencimento ?? Number(bill.venc?.match(/\d{1,2}/)?.[0] ?? NaN);
  return Number.isInteger(day) && day >= 1 && day <= 31 ? day : null;
};

// aviso ligado quando o campo não existe (contas antigas) ou é true
export const isReminderOn = (bill: InterfaceBill): boolean =>
  bill.avisar !== false;

//---------------------- próxima data do aviso ----------------------
// Dia do vencimento às 9h, neste mês ou no próximo. Conta já paga pula o mês atual.
// Em meses mais curtos (ex: dia 31 em fevereiro), avisa no último dia do mês.
const nextReminderDate = (dueDay: number, paid: boolean): Date => {
  const now = new Date();
  const build = (year: number, month: number) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(dueDay, lastDay), REMINDER_HOUR, 0);
  };

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
    // o app só agenda avisos de vencimento, então dá para recomeçar do zero
    await Notifications.cancelAllScheduledNotificationsAsync();

    const billsWithReminder = bills.filter(
      (bill) => isReminderOn(bill) && getDueDay(bill) !== null,
    );
    if (billsWithReminder.length === 0) return;
    if (!(await ensurePermission())) return;

    for (const bill of billsWithReminder) {
      await Notifications.scheduleNotificationAsync({
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
