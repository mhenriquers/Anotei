import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseBackup, restoreBackup } from "../backup";

// notificações e arquivos dependem do celular; aqui só importa ler e restaurar
jest.mock("../notifications", () => ({
  syncBackupReminder: jest.fn(),
  syncBillReminders: jest.fn(),
}));
jest.mock("../backupFile", () => ({
  shareBackupFile: jest.fn(),
  shareTextFile: jest.fn(),
  pickBackupText: jest.fn(),
}));

// O backup é a única forma de recuperar os dados: arquivos de versões antigas
// do app precisam continuar restaurando.

const expense = {
  id: "g1",
  title: "Mercado",
  amount: 50,
  category: "debit",
  createdAt: "2026-11-01T10:00:00.000Z",
};
const bill = {
  id: "c1",
  nome: "Luz",
  valor: 120,
  venc: "Dia 5",
  obs: "",
  pago: true,
};
const reserva = { id: "r1", nome: "Emergência", valor: 1000, finalidade: "" };

const file = (data: object) =>
  JSON.stringify({ app: "anotei", exportedAt: "2026-11-01", ...data });

describe("parseBackup", () => {
  it("lê backup da versão 1 (sem reservas)", () => {
    const data = parseBackup(
      file({ version: 1, expenses: [expense], bills: [bill] }),
    );
    expect(data.expenses).toHaveLength(1);
    expect(data.reservas).toBeUndefined();
    expect(data.nome).toBeUndefined();
    expect(data.extras).toBeUndefined();
  });

  it("lê backup da versão 2 sem nome e sem extras", () => {
    const data = parseBackup(
      file({
        version: 2,
        expenses: [expense],
        bills: [bill],
        reservas: [reserva],
      }),
    );
    expect(data.reservas).toHaveLength(1);
    expect(data.nome).toBeUndefined();
  });

  it("lê backup da versão 2 com nome e extras", () => {
    const data = parseBackup(
      file({
        version: 2,
        expenses: [],
        bills: [],
        reservas: [],
        nome: "  Ana   Maria ",
        extras: { orcamento: "2000", receita: null, chaveDesconhecida: "x" },
      }),
    );
    expect(data.nome).toBe("Ana Maria");
    expect(data.extras).toEqual({ orcamento: "2000", receita: null });
  });

  it("recusa arquivos que não servem", () => {
    expect(() => parseBackup("não é json")).toThrow(
      "Esse arquivo não é um backup do Anotei.",
    );
    expect(() =>
      parseBackup(JSON.stringify({ app: "outro", version: 1 })),
    ).toThrow("Esse arquivo não é um backup do Anotei.");
    expect(() =>
      parseBackup(file({ version: 99, expenses: [], bills: [] })),
    ).toThrow("versão mais nova");
    expect(() =>
      parseBackup(file({ version: 2, expenses: [], bills: [] })),
    ).toThrow("incompleto ou danificado");
  });
});

describe("restoreBackup", () => {
  beforeEach(() => AsyncStorage.clear());

  it("backup antigo não apaga nome nem configurações do app", async () => {
    await AsyncStorage.multiSet([
      ["nome", "Bia"],
      ["orcamento", "1500"],
    ]);
    await restoreBackup(
      parseBackup(file({ version: 1, expenses: [expense], bills: [bill] })),
    );
    expect(await AsyncStorage.getItem("nome")).toBe("Bia");
    expect(await AsyncStorage.getItem("orcamento")).toBe("1500");
    expect(JSON.parse((await AsyncStorage.getItem("expenses"))!)).toHaveLength(
      1,
    );
  });

  it("backup novo troca o nome e apaga configuração vazia", async () => {
    await AsyncStorage.multiSet([
      ["nome", "Bia"],
      ["receita", "3000"],
    ]);
    await restoreBackup(
      parseBackup(
        file({
          version: 2,
          expenses: [],
          bills: [],
          reservas: [reserva],
          nome: "Ana",
          extras: { orcamento: "2000", receita: null },
        }),
      ),
    );
    expect(await AsyncStorage.getItem("nome")).toBe("Ana");
    expect(await AsyncStorage.getItem("orcamento")).toBe("2000");
    expect(await AsyncStorage.getItem("receita")).toBeNull();
    expect(JSON.parse((await AsyncStorage.getItem("reservas"))!)).toHaveLength(
      1,
    );
  });
});
