import { describe, expect, it } from "@jest/globals";
import {
  formatBRL,
  maskMoneyInput,
  parseBRLInput,
  parseDateTimeInput,
} from "../theme";
import { splitInstallments, expenseTitle } from "../installments";
import { expensesToCsv } from "../csv";
import { normalizeText, searchExpenses } from "../search";
import { Type } from "../Types";

describe("valores em R$", () => {
  it("máscara entra pelos centavos", () => {
    expect(maskMoneyInput("1")).toBe("0,01");
    expect(maskMoneyInput("123")).toBe("1,23");
    expect(maskMoneyInput("123456")).toBe("1.234,56");
    expect(maskMoneyInput("000")).toBe("");
    expect(maskMoneyInput("abc")).toBe("");
  });

  it("lê o valor digitado", () => {
    expect(parseBRLInput("1.234,56")).toBe(1234.56);
    expect(parseBRLInput("1234.56")).toBe(1234.56);
    expect(parseBRLInput("2.000")).toBe(2000);
    expect(parseBRLInput("R$ 10,00")).toBe(10);
    expect(parseBRLInput("dez")).toBeNaN();
  });

  it("formata em reais", () => {
    expect(formatBRL(1234.5)).toBe("R$ 1.234,50");
    expect(formatBRL(-3)).toBe("-R$ 3,00");
    expect(formatBRL(NaN)).toBe("R$ 0,00");
  });
});

describe("data e hora do cadastro", () => {
  it("aceita data válida e recusa inválida", () => {
    expect("date" in parseDateTimeInput("01/02/2026", "10:30")).toBe(true);
    expect(parseDateTimeInput("31/02/2026", "10:30")).toEqual({
      error: "Digite uma data válida.",
    });
    expect(parseDateTimeInput("01/02/2026", "25:00")).toEqual({
      error: "Digite uma hora válida.",
    });
  });

  it("data futura só quando permitido", () => {
    const future = parseDateTimeInput("01/01/2099", "10:00");
    expect("error" in future).toBe(true);
    expect("date" in parseDateTimeInput("01/01/2099", "10:00", true)).toBe(
      true,
    );
  });
});

describe("parcelas", () => {
  it("divide em centavos e manda a sobra na 1ª parcela", () => {
    let n = 0;
    const list = splitInstallments(
      {
        title: "Geladeira",
        amount: 100,
        category: "credit card",
        createdAt: new Date(2026, 0, 31),
      },
      3,
      () => String(++n),
    );
    expect(list.map((item) => item.amount)).toEqual([33.34, 33.33, 33.33]);
    expect(list[1].createdAt.getMonth()).toBe(1);
    expect(list[1].createdAt.getDate()).toBe(28); // 31/01 → 28/02
    expect(new Set(list.map((item) => item.grupoParcela)).size).toBe(1);
    expect(expenseTitle(list[1])).toBe("Geladeira (2/3)");
  });
});

describe("planilha e busca", () => {
  const item: Type = {
    id: "1",
    title: 'Pão; "francês"',
    amount: 12.5,
    category: "pix",
    createdAt: new Date(2026, 10, 13, 8, 5),
    observacao: "Padaria",
  };

  it("gera CSV com ; e vírgula nos centavos", () => {
    const lines = expensesToCsv([item]).replace("﻿", "").split("\r\n");
    expect(lines[0]).toBe("Data;Hora;Descrição;Forma;Valor;Observação");
    expect(lines[1]).toBe(
      '13/11/2026;08:05;"Pão; ""francês""";Pix;12,50;Padaria',
    );
  });

  it("busca sem acento e sem maiúscula", () => {
    expect(normalizeText("Crédito ÁGUA")).toBe("credito agua");
    expect(searchExpenses([item], "pao")).toHaveLength(1);
    expect(searchExpenses([item], "padaria")).toHaveLength(1);
    expect(searchExpenses([item], "mercado")).toHaveLength(0);
  });
});
