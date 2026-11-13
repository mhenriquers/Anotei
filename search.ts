import { Type } from "./Types";

//---------------------- busca de gastos ----------------------
// Sem diferenciar maiúscula/minúscula nem acento: "credito" acha "Crédito".
export const normalizeText = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

// Gastos cujo nome ou observação contém o texto buscado (busca vazia = todos)
export const searchExpenses = (expenses: Type[], query: string): Type[] => {
  const term = normalizeText(query);
  if (!term) return expenses;
  return expenses.filter((expense) =>
    normalizeText(`${expense.title} ${expense.observacao ?? ""}`).includes(
      term,
    ),
  );
};
