import { InterfaceBill } from "./Types";

// Versão web (PWA): o navegador não consegue agendar notificações locais.
// No lugar delas, a tela inicial mostra as contas a vencer (UpcomingBills).
// O Metro usa este arquivo na web no lugar de notifications.ts, então o
// expo-notifications nem entra no bundle web.
export const syncBillReminders = async (
  _bills: InterfaceBill[],
): Promise<void> => {};
