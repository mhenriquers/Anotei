import { Type } from "./Types";
import { MESES } from "./theme";

//---------------------- meses ("2026-11") ----------------------
// O mês é guardado como texto "AAAA-MM": dá para comparar com < e > direto.

const pad = (n: number) => n.toString().padStart(2, "0");

export const monthKey = (date: Date | string | number = new Date()): string => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

const parseKey = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return { year, month: month - 1 }; // month: 0 a 11
};

// "novembro"
export const monthName = (key: string): string => MESES[parseKey(key).month];

// "Novembro 2026"
export const monthLabel = (key: string): string => {
  const { year } = parseKey(key);
  const name = monthName(key);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
};

// soma (ou subtrai) meses: addMonths("2026-11", 2) → "2027-01"
export const addMonths = (key: string, amount: number): string => {
  const { year, month } = parseKey(key);
  return monthKey(new Date(year, month + amount, 1));
};

export const previousMonth = (key: string) => addMonths(key, -1);
export const nextMonth = (key: string) => addMonths(key, 1);

export const filterByMonth = (expenses: Type[], key: string): Type[] =>
  expenses.filter((expense) => monthKey(expense.createdAt) === key);

export const sumAmounts = (expenses: Type[]): number =>
  expenses.reduce((total, expense) => total + (expense.amount || 0), 0);

// o mês mais à frente que tem gasto (ou o atual, se não houver nenhum depois)
export const lastMonthWithData = (
  expenses: Type[],
  current: string = monthKey(),
): string =>
  expenses.reduce((latest, expense) => {
    const key = monthKey(expense.createdAt);
    return key > latest ? key : latest;
  }, current);
