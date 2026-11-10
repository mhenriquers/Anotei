import { InterfaceBill } from "./Types";

export const REMINDER_HOUR = 9; // horário do aviso no dia do vencimento (Android)
export const UPCOMING_DAYS = 7; // a versão web mostra contas que vencem nos próximos 7 dias

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

// Data do vencimento no mês informado. Em meses mais curtos (ex: dia 31 em
// fevereiro), vence no último dia do mês.
export const dueDateInMonth = (
  dueDay: number,
  year: number,
  month: number,
  hour = 0,
): Date => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(dueDay, lastDay), hour, 0);
};

//---------------------- contas a vencer (aviso da versão web) ----------------------
export interface UpcomingBill {
  bill: InterfaceBill;
  daysLeft: number; // negativo = atrasada, 0 = vence hoje
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Contas não pagas, com aviso ligado, que já venceram neste mês ou vencem
// nos próximos dias. O "pago" vale para o mês atual (o usuário desmarca
// todas as contas quando o mês vira).
export const getUpcomingBills = (
  bills: InterfaceBill[],
  now: Date = new Date(),
  days: number = UPCOMING_DAYS,
): UpcomingBill[] => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return bills
    .flatMap((bill): UpcomingBill[] => {
      const dueDay = getDueDay(bill);
      if (bill.pago || !isReminderOn(bill) || dueDay === null) return [];

      // dia já passou e a conta não foi paga = atrasada (daysLeft negativo)
      const due = dueDateInMonth(dueDay, today.getFullYear(), today.getMonth());
      // Math.round evita erro de 1 dia na troca de horário de verão
      const daysLeft = Math.round(
        (due.getTime() - today.getTime()) / MS_PER_DAY,
      );
      return daysLeft <= days ? [{ bill, daysLeft }] : [];
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
};

// Ex: "Venceu dia 5", "Vence hoje", "Vence amanhã", "Vence em 3 dias"
export const describeDue = ({ bill, daysLeft }: UpcomingBill): string => {
  if (daysLeft < 0) return `Venceu dia ${getDueDay(bill)}`;
  if (daysLeft === 0) return "Vence hoje";
  if (daysLeft === 1) return "Vence amanhã";
  return `Vence em ${daysLeft} dias`;
};
