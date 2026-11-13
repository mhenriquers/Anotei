import { Type } from "./Types";
import { dueDateInMonth } from "./dueDates";

//---------------------- fatura do cartão de crédito ----------------------
// A fatura fecha todo mês no dia escolhido. Compra feita a partir do dia do
// fechamento já entra na fatura seguinte.

export interface Fatura {
  total: number;
  fecha: Date; // dia em que a fatura aberta fecha
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const faturaAtual = (
  expenses: Type[],
  diaFechamento: number,
  now: Date = new Date(),
): Fatura => {
  const today = startOfDay(now);
  const thisMonth = dueDateInMonth(
    diaFechamento,
    today.getFullYear(),
    today.getMonth(),
  );
  // fechamento deste mês já chegou: a fatura aberta fecha no mês que vem
  const fecha =
    today >= thisMonth
      ? dueDateInMonth(diaFechamento, today.getFullYear(), today.getMonth() + 1)
      : thisMonth;
  const abre = dueDateInMonth(
    diaFechamento,
    fecha.getFullYear(),
    fecha.getMonth() - 1,
  );

  const total = expenses
    .filter((expense) => {
      if (expense.category !== "credit card") return false;
      const date = new Date(expense.createdAt);
      return date >= abre && date < fecha;
    })
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return { total, fecha };
};
