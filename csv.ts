import { Type } from "./Types";
import { formatDateInput, formatTime } from "./theme";
import { getPaymentInfo } from "./paymentMethods";
import { expenseTitle } from "./installments";
import { shareTextFile } from "./backupFile";

//---------------------- exportar os gastos em planilha (.csv) ----------------------
// Separador ";" e vírgula nos centavos: é o formato que o Excel em português
// abre direto. O BOM no começo faz os acentos aparecerem certos.

const BOM = "﻿";

// coloca entre aspas o que tiver ; " ou quebra de linha
const cell = (value: string): string =>
  /[;"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

// 1234.5 → "1234,50" (sem "R$" e sem ponto de milhar, para a planilha entender como número)
const csvNumber = (value: number) => value.toFixed(2).replace(".", ",");

export const expensesToCsv = (expenses: Type[]): string => {
  const header = ["Data", "Hora", "Descrição", "Forma", "Valor", "Observação"];
  const rows = [...expenses]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((expense) => {
      const date = new Date(expense.createdAt);
      return [
        formatDateInput(date),
        formatTime(date),
        expenseTitle(expense),
        getPaymentInfo(expense.category).label,
        csvNumber(expense.amount || 0),
        expense.observacao ?? "",
      ];
    });
  return (
    BOM + [header, ...rows].map((row) => row.map(cell).join(";")).join("\r\n")
  );
};

const todayStamp = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Precisa ser chamado direto no toque do botão (exigência do iPhone, igual ao backup)
export const exportExpensesCsv = (expenses: Type[]): Promise<boolean> =>
  shareTextFile(
    `anotei-gastos-${todayStamp()}.csv`,
    expensesToCsv(expenses),
    "text/csv",
    "Gastos do Anotei",
  );
