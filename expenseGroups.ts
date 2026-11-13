import { Type } from "./Types";
import { MESES } from "./theme";

//---------------------- gastos agrupados por dia ----------------------
export interface DaySection {
  key: string; // "2026-11-12"
  title: string; // "Hoje", "Ontem", "12 de novembro"
  total: number;
  data: Type[];
}

const pad = (n: number) => n.toString().padStart(2, "0");
const dayKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// "Hoje", "Ontem", "12 de novembro" ou, em outro ano, "12 de novembro de 2025"
export const dayTitle = (date: Date, now: Date = new Date()): string => {
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );
  if (dayKey(date) === dayKey(now)) return "Hoje";
  if (dayKey(date) === dayKey(yesterday)) return "Ontem";
  const text = `${date.getDate()} de ${MESES[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear()
    ? text
    : `${text} de ${date.getFullYear()}`;
};

// Mais recentes primeiro, dentro do dia e entre os dias
export const groupByDay = (expenses: Type[]): DaySection[] => {
  const sorted = [...expenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const sections: DaySection[] = [];
  for (const expense of sorted) {
    const date = new Date(expense.createdAt);
    const key = dayKey(date);
    let section = sections[sections.length - 1];
    if (!section || section.key !== key) {
      section = { key, title: dayTitle(date), total: 0, data: [] };
      sections.push(section);
    }
    section.data.push(expense);
    section.total += expense.amount || 0;
  }
  return sections;
};
