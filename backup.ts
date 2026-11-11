import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InterfaceBill, Type } from "./Types";

//---------------------- backup da versão web (PWA) ----------------------
// Os dados ficam só no aparelho. O backup é um arquivo .json que a pessoa guarda
// onde quiser (Arquivos/iCloud, WhatsApp, e-mail) e usa para restaurar depois.

const BACKUP_APP = "anotei";
const BACKUP_VERSION = 1;
export const BACKUP_REMIND_DAYS = 30; // lembra de fazer backup depois de 30 dias
const SNOOZE_DAYS = 7; // "Agora não" adia o lembrete por 7 dias
const DAY = 24 * 60 * 60 * 1000;

const KEY_LAST = "backup:last";
const KEY_FIRST_SEEN = "backup:firstSeen";
const KEY_SNOOZE = "backup:snoozeUntil";

export interface BackupData {
  exportedAt: string;
  expenses: Type[];
  bills: InterfaceBill[];
}

//---------------------- gerar e compartilhar o arquivo ----------------------
const todayStamp = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const downloadFile = (file: File) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

// Abre o menu Compartilhar do celular (Salvar em Arquivos, WhatsApp...).
// Sem suporte (computador), baixa o arquivo. Retorna false se a pessoa cancelou.
// Precisa ser chamado direto no toque do botão: o iPhone só abre o menu
// Compartilhar se não houver espera entre o toque e a chamada.
export const exportBackup = async (
  expenses: Type[],
  bills: InterfaceBill[],
): Promise<boolean> => {
  const data = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    expenses,
    bills,
  };
  const file = new File(
    [JSON.stringify(data, null, 2)],
    `anotei-backup-${todayStamp()}.json`,
    { type: "application/json" },
  );

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Backup do Anotei" });
      return true;
    } catch (error) {
      if ((error as Error).name === "AbortError") return false; // cancelou
      // outro erro (ex: navegador recusou o compartilhamento): baixa o arquivo
    }
  }
  downloadFile(file);
  return true;
};

//---------------------- escolher e ler um arquivo de backup ----------------------
export const pickBackupFile = (): Promise<File | null> =>
  new Promise((resolve) => {
    // o iPhone só abre o seletor se o campo estiver na página
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    const finish = (file: File | null) => {
      input.remove();
      resolve(file);
    };
    input.onchange = () => finish(input.files?.[0] ?? null);
    input.oncancel = () => finish(null);
    document.body.appendChild(input);
    input.click();
  });

const isObjectWithId = (item: unknown) =>
  typeof item === "object" && item !== null && "id" in item;

// Lança um Error com a mensagem para mostrar à pessoa se o arquivo não servir
export const parseBackup = async (file: File): Promise<BackupData> => {
  let data: any;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error("Esse arquivo não é um backup do Anotei.");
  }
  if (data?.app !== BACKUP_APP) {
    throw new Error("Esse arquivo não é um backup do Anotei.");
  }
  if (typeof data.version !== "number" || data.version > BACKUP_VERSION) {
    throw new Error(
      "Esse backup foi feito numa versão mais nova do Anotei. Atualize o app e tente de novo.",
    );
  }
  if (
    !Array.isArray(data.expenses) ||
    !Array.isArray(data.bills) ||
    !data.expenses.every(isObjectWithId) ||
    !data.bills.every(isObjectWithId)
  ) {
    throw new Error("O arquivo de backup está incompleto ou danificado.");
  }
  return {
    exportedAt: String(data.exportedAt ?? ""),
    expenses: data.expenses,
    bills: data.bills,
  };
};

// Substitui os dados atuais pelos do backup (mesmo formato salvo pelo App.tsx)
export const restoreBackup = async (data: BackupData) => {
  await AsyncStorage.multiSet([
    ["expenses", JSON.stringify(data.expenses)],
    ["bills", JSON.stringify(data.bills)],
    [KEY_LAST, String(Date.now())],
  ]);
  await AsyncStorage.removeItem(KEY_SNOOZE);
};

//---------------------- lembrete de backup ----------------------
interface BackupInfo {
  lastBackup: number | null;
  firstSeen: number;
  snoozeUntil: number | null;
}

const toNumber = (value: string | null) =>
  value !== null && Number.isFinite(Number(value)) ? Number(value) : null;

// enabled = false (Android/iOS nativo): não lê nada e nunca lembra
export const useBackup = (
  expenses: Type[],
  bills: InterfaceBill[],
  enabled: boolean,
) => {
  const [info, setInfo] = useState<BackupInfo | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    (async () => {
      const values = Object.fromEntries(
        await AsyncStorage.multiGet([KEY_LAST, KEY_FIRST_SEEN, KEY_SNOOZE]),
      );
      let firstSeen = toNumber(values[KEY_FIRST_SEEN]);
      if (firstSeen === null) {
        firstSeen = Date.now();
        await AsyncStorage.setItem(KEY_FIRST_SEEN, String(firstSeen));
      }
      setInfo({
        lastBackup: toNumber(values[KEY_LAST]),
        firstSeen,
        snoozeUntil: toNumber(values[KEY_SNOOZE]),
      });
    })().catch((error) => console.error("Erro ao ler dados do backup", error));

    // o app instalado fica aberto em segundo plano por dias
    const refresh = () => {
      if (document.visibilityState === "visible") setNow(Date.now());
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [enabled]);

  const hasData = expenses.length > 0 || bills.length > 0;
  const reference = info ? (info.lastBackup ?? info.firstSeen) : now;
  const daysSinceBackup = Math.floor((now - reference) / DAY);
  const shouldRemind =
    enabled &&
    info !== null &&
    hasData &&
    now >= (info.snoozeUntil ?? 0) &&
    daysSinceBackup >= BACKUP_REMIND_DAYS;

  const backupNow = useCallback(async () => {
    try {
      // sem await antes desta chamada (ver exportBackup)
      const saved = await exportBackup(expenses, bills);
      if (!saved) return;
      const time = Date.now();
      await AsyncStorage.setItem(KEY_LAST, String(time));
      await AsyncStorage.removeItem(KEY_SNOOZE);
      setNow(time);
      setInfo((prev) =>
        prev ? { ...prev, lastBackup: time, snoozeUntil: null } : prev,
      );
    } catch (error) {
      console.error("Erro ao fazer backup", error);
      alert("Não foi possível fazer o backup. Tente de novo.");
    }
  }, [expenses, bills]);

  const snooze = useCallback(async () => {
    const until = Date.now() + SNOOZE_DAYS * DAY;
    setInfo((prev) => (prev ? { ...prev, snoozeUntil: until } : prev));
    await AsyncStorage.setItem(KEY_SNOOZE, String(until));
  }, []);

  return {
    lastBackup: info?.lastBackup ?? null,
    hasData,
    shouldRemind,
    daysSinceBackup: info?.lastBackup ? daysSinceBackup : null,
    backupNow,
    snooze,
  };
};
