import { Type } from "./Types";
import { getStored, setStored, useStoredValue } from "./storedValues";
import { dueDateInMonth } from "./dueDates";
import { monthKey } from "./months";

//---------------------- gastos recorrentes (assinaturas: Netflix, Spotify...) ----------------------
// Guardados na chave "recorrentes". Todo mês, quando chega o dia, o app lança
// o gasto sozinho (ao abrir ou ao voltar para o app).

export interface Recorrente {
  id: string;
  title: string;
  amount: number;
  category: Type["category"];
  dia: number; // dia do mês da cobrança (1 a 31)
  ultimoMes?: string; // último mês já lançado ("2026-11")
}

const isRecorrente = (item: any): item is Recorrente =>
  typeof item?.id === "string" &&
  typeof item?.title === "string" &&
  typeof item?.amount === "number" &&
  typeof item?.dia === "number";

const parseList = (text: string | null): Recorrente[] => {
  if (!text) return [];
  try {
    const list = JSON.parse(text);
    return Array.isArray(list) ? list.filter(isRecorrente) : [];
  } catch {
    return [];
  }
};

export const getRecorrentes = (): Recorrente[] =>
  parseList(getStored("recorrentes"));

export const useRecorrentes = (): Recorrente[] =>
  parseList(useStoredValue("recorrentes"));

export const saveRecorrentes = (list: Recorrente[]) =>
  setStored("recorrentes", list.length ? JSON.stringify(list) : null);

// Recorrente nova começa na próxima cobrança: se o dia já passou neste mês,
// considera este mês como lançado (a pessoa provavelmente já anotou).
export const firstMonthDone = (dia: number, now: Date = new Date()) =>
  now.getDate() >= dia ? monthKey(now) : undefined;

// Lança os gastos do mês que já chegaram. Devolve os gastos novos (vazio = nada a fazer).
export const applyRecorrentes = (
  newId: () => string,
  now: Date = new Date(),
): Type[] => {
  const list = getRecorrentes();
  const month = monthKey(now);
  const created: Type[] = [];

  const updated = list.map((item) => {
    const date = dueDateInMonth(
      item.dia,
      now.getFullYear(),
      now.getMonth(),
      12, // meio-dia do dia da cobrança
    );
    const dayArrived = now.getDate() >= date.getDate();
    if (!dayArrived || item.ultimoMes === month) return item;
    created.push({
      id: newId(),
      title: item.title,
      amount: item.amount,
      category: item.category,
      observacao: "Lançado automaticamente (recorrente)",
      createdAt: date > now ? now : date,
    });
    return { ...item, ultimoMes: month };
  });

  if (created.length > 0) saveRecorrentes(updated);
  return created;
};
