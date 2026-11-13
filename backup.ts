import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InterfaceBill, Type } from "./Types";
import { shareBackupFile } from "./backupFile";

//---------------------- backup (Android e web) ----------------------
// Os dados ficam só no aparelho. O backup é um arquivo .json que a pessoa guarda
// onde quiser (Arquivos/iCloud, Drive, WhatsApp, e-mail) e usa para restaurar
// depois. O arquivo é o mesmo nas duas versões: dá para fazer o backup no
// iPhone e restaurar no Android, e vice-versa.
// A parte que depende da plataforma (gerar e escolher o arquivo) fica em
// backupFile.ts (Android) e backupFile.web.ts (web).

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

// Retorna false se a pessoa cancelou. Precisa ser chamado direto no toque do
// botão: o iPhone só abre o menu Compartilhar se não houver espera entre o
// toque e a chamada (por isso nada de await antes de shareBackupFile).
export const exportBackup = (
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
  return shareBackupFile(
    `anotei-backup-${todayStamp()}.json`,
    JSON.stringify(data, null, 2),
  );
};

//---------------------- ler um arquivo de backup ----------------------
const isObjectWithId = (item: unknown) =>
  typeof item === "object" && item !== null && "id" in item;

// Recebe o texto do arquivo. Lança um Error com a mensagem para mostrar à
// pessoa se o arquivo não servir.
export const parseBackup = (text: string): BackupData => {
  let data: any;
  try {
    data = JSON.parse(text);
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

const readBackupInfo = async (): Promise<BackupInfo> => {
  const values = Object.fromEntries(
    await AsyncStorage.multiGet([KEY_LAST, KEY_FIRST_SEEN, KEY_SNOOZE]),
  );
  let firstSeen = toNumber(values[KEY_FIRST_SEEN]);
  if (firstSeen === null) {
    firstSeen = Date.now();
    await AsyncStorage.setItem(KEY_FIRST_SEEN, String(firstSeen));
  }
  return {
    lastBackup: toNumber(values[KEY_LAST]),
    firstSeen,
    snoozeUntil: toNumber(values[KEY_SNOOZE]),
  };
};

export const useBackup = (expenses: Type[], bills: InterfaceBill[]) => {
  const [info, setInfo] = useState<BackupInfo | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // relê as datas salvas (ex: depois de restaurar um backup)
  const reload = useCallback(async () => {
    try {
      setInfo(await readBackupInfo());
      setNow(Date.now());
    } catch (error) {
      console.error("Erro ao ler dados do backup", error);
    }
  }, []);

  useEffect(() => {
    reload();
    // o app fica aberto em segundo plano por dias: atualiza ao voltar
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setNow(Date.now());
    });
    return () => subscription.remove();
  }, [reload]);

  const hasData = expenses.length > 0 || bills.length > 0;
  const reference = info ? (info.lastBackup ?? info.firstSeen) : now;
  const daysSinceBackup = Math.floor((now - reference) / DAY);
  const shouldRemind =
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
    reload,
  };
};
