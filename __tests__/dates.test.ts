import { describe, expect, it } from "@jest/globals";
import {
  dueDateInMonth,
  getDueDay,
  getUpcomingBills,
  describeDue,
} from "../dueDates";
import {
  addMonths,
  filterByMonth,
  lastMonthWithData,
  monthKey,
  monthLabel,
  sumAmounts,
} from "../months";
import { faturaAtual } from "../fatura";
import { InterfaceBill, Type } from "../Types";

const bill = (extra: Partial<InterfaceBill> = {}): InterfaceBill => ({
  id: "1",
  nome: "Internet",
  valor: 100,
  venc: "Dia 10",
  obs: "",
  pago: false,
  ...extra,
});

const expense = (date: Date, extra: Partial<Type> = {}): Type => ({
  id: Math.random().toString(),
  title: "Gasto",
  amount: 10,
  category: "credit card",
  createdAt: date,
  ...extra,
});

describe("dueDates", () => {
  it("lê o dia do campo novo e de contas antigas", () => {
    expect(getDueDay(bill({ diaVencimento: 5 }))).toBe(5);
    expect(getDueDay(bill({ venc: "Dia 12" }))).toBe(12);
    expect(getDueDay(bill({ venc: "sem dia" }))).toBeNull();
    expect(getDueDay(bill({ diaVencimento: 40 }))).toBeNull();
  });

  it("dia 31 em fevereiro vira o último dia do mês", () => {
    expect(dueDateInMonth(31, 2026, 1).getDate()).toBe(28);
    expect(dueDateInMonth(31, 2028, 1).getDate()).toBe(29); // ano bissexto
    expect(dueDateInMonth(15, 2026, 1).getDate()).toBe(15);
  });

  it("lista contas a vencer e atrasadas, sem as pagas", () => {
    const now = new Date(2026, 10, 13);
    const list = getUpcomingBills(
      [
        bill({ id: "a", diaVencimento: 15 }),
        bill({ id: "b", diaVencimento: 10 }),
        bill({ id: "c", diaVencimento: 14, pago: true }),
        bill({ id: "d", diaVencimento: 28 }),
      ],
      now,
    );
    expect(list.map((item) => item.bill.id)).toEqual(["b", "a"]);
    expect(describeDue(list[0])).toBe("Venceu dia 10");
    expect(describeDue(list[1])).toBe("Vence em 2 dias");
  });
});

describe("months", () => {
  it("monta e soma meses", () => {
    expect(monthKey(new Date(2026, 10, 13))).toBe("2026-11");
    expect(addMonths("2026-11", 2)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(monthLabel("2026-03")).toBe("Março 2026");
  });

  it("filtra e soma os gastos do mês", () => {
    const list = [
      expense(new Date(2026, 10, 1), { amount: 10 }),
      expense(new Date(2026, 10, 30), { amount: 5.5 }),
      expense(new Date(2026, 9, 31), { amount: 100 }),
    ];
    expect(sumAmounts(filterByMonth(list, "2026-11"))).toBe(15.5);
    expect(lastMonthWithData(list, "2026-11")).toBe("2026-11");
    expect(lastMonthWithData([expense(new Date(2027, 1, 1))], "2026-11")).toBe(
      "2027-02",
    );
  });
});

describe("fatura do cartão", () => {
  it("soma o crédito entre um fechamento e o próximo", () => {
    const list = [
      expense(new Date(2026, 9, 9), { amount: 1 }), // antes do fechamento anterior
      expense(new Date(2026, 9, 10), { amount: 10 }), // no dia do fechamento: fatura nova
      expense(new Date(2026, 10, 9), { amount: 20 }),
      expense(new Date(2026, 10, 10), { amount: 40 }), // próxima fatura
      expense(new Date(2026, 10, 1), { amount: 80, category: "pix" }),
    ];
    const fatura = faturaAtual(list, 10, new Date(2026, 10, 5));
    expect(fatura.total).toBe(30);
    expect(fatura.fecha.getMonth()).toBe(10);
    expect(fatura.fecha.getDate()).toBe(10);
  });

  it("depois do fechamento, a fatura aberta fecha no mês seguinte", () => {
    const fatura = faturaAtual([], 10, new Date(2026, 11, 15));
    expect(fatura.fecha.getFullYear()).toBe(2027);
    expect(fatura.fecha.getMonth()).toBe(0);
  });
});
