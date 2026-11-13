import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

//---------------------- bloqueio do app com digital (Android) ----------------------
// Fica só neste aparelho (chave "bloqueio"), fora do backup: restaurar num
// celular sem digital não pode deixar o app trancado.

const KEY_LOCK = "bloqueio";

let enabled: boolean | null = null; // null = ainda não leu
const listeners = new Set<(value: boolean) => void>();

export const loadLockSetting = async (): Promise<boolean> => {
  if (enabled === null) {
    try {
      enabled = (await AsyncStorage.getItem(KEY_LOCK)) === "1";
    } catch {
      enabled = false;
    }
  }
  return enabled;
};

export const setLockSetting = async (value: boolean) => {
  enabled = value;
  listeners.forEach((listener) => listener(value));
  try {
    if (value) await AsyncStorage.setItem(KEY_LOCK, "1");
    else await AsyncStorage.removeItem(KEY_LOCK);
  } catch (error) {
    console.error("Erro ao salvar o bloqueio", error);
  }
};

// valor atual do bloqueio (ligado/desligado), atualizado quando muda
export const useLockSetting = (): boolean => {
  const [value, setValue] = useState(enabled ?? false);
  useEffect(() => {
    loadLockSetting().then(setValue);
    listeners.add(setValue);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
};
