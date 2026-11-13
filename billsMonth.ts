import { InterfaceBill } from "./Types";
import { getStored, setStored, useStoredValue } from "./storedValues";
import { monthKey } from "./months";

//---------------------- virada de mês das contas fixas ----------------------
// O "pago" das contas vale para o mês atual. Quando o mês vira, o app guarda
// como ficou o mês que acabou (histórico) e desmarca todas as contas.
// Chaves: "contasMes" (mês das marcações atuais) e "historicoContas".

const MAX_MESES = 24; // guarda no máximo 2 anos de histórico

export interface MesContas {
  mes: string; // "2026-10"
  contas: { nome: string; valor: number; pago: boolean }[];
}

const parseHistory = (text: string | null): MesContas[] => {
  if (!text) return [];
  try {
    const list = JSON.parse(text);
    return Array.isArray(list)
      ? list.filter(
          (item) => typeof item?.mes === "string" && Array.isArray(item.contas),
        )
      : [];
  } catch {
    return [];
  }
};

// mais recentes primeiro
export const useBillsHistory = (): MesContas[] =>
  parseHistory(useStoredValue("historicoContas"));

// Devolve as contas desmarcadas se o mês virou; null se não há nada a fazer.
// Na primeira vez (sem "contasMes" salvo) só guarda o mês, sem desmarcar.
export const rollBillsMonth = (
  bills: InterfaceBill[],
  now: Date = new Date(),
): InterfaceBill[] | null => {
  const current = monthKey(now);
  const saved = getStored("contasMes");
  if (saved === current) return null;
  setStored("contasMes", current);
  if (saved === null) return null;

  // guarda como ficou o mês que acabou
  if (bills.length > 0) {
    const entry: MesContas = {
      mes: saved,
      contas: bills.map((bill) => ({
        nome: bill.nome,
        valor: bill.valor || 0,
        pago: !!bill.pago,
      })),
    };
    const history = [
      entry,
      ...parseHistory(getStored("historicoContas")).filter(
        (item) => item.mes !== saved,
      ),
    ].slice(0, MAX_MESES);
    setStored("historicoContas", JSON.stringify(history));
  }

  if (!bills.some((bill) => bill.pago)) return null;
  return bills.map((bill) => ({ ...bill, pago: false }));
};
