import { Type } from "./Types";

//---------------------- compra parcelada no crédito ----------------------
export const MAX_PARCELAS = 24;

// "Geladeira (2/10)" para parcelas; o nome normal para os outros gastos
export const expenseTitle = (expense: Type): string =>
  expense.parcela && expense.parcelas && expense.parcelas > 1
    ? `${expense.title} (${expense.parcela}/${expense.parcelas})`
    : expense.title;

// mesma data N meses depois; dia 31 num mês mais curto vira o último dia do mês
const addMonthsToDate = (date: Date, months: number): Date => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  return new Date(
    target.getFullYear(),
    target.getMonth(),
    Math.min(date.getDate(), lastDay),
    date.getHours(),
    date.getMinutes(),
  );
};

// Divide a compra em N gastos, um por mês a partir da data da compra.
// O valor é dividido em centavos; os centavos que sobram vão na 1ª parcela
// (ex: R$ 100,00 em 3x = 33,34 + 33,33 + 33,33).
export const splitInstallments = (
  data: Omit<Type, "id">,
  parcelas: number,
  newId: () => string,
): Type[] => {
  const totalCents = Math.round(data.amount * 100);
  const baseCents = Math.floor(totalCents / parcelas);
  const extraCents = totalCents - baseCents * parcelas;
  const grupo = newId();
  const start = new Date(data.createdAt);

  return Array.from({ length: parcelas }, (_, i) => ({
    ...data,
    id: newId(),
    amount: (baseCents + (i === 0 ? extraCents : 0)) / 100,
    createdAt: addMonthsToDate(start, i),
    parcela: i + 1,
    parcelas,
    grupoParcela: grupo,
  }));
};
