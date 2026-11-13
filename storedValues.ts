import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

//---------------------- valores avulsos salvos no aparelho ----------------------
// Configurações e dados pequenos (limite do mês, receita...). Ficam numa cópia
// em memória para o backup conseguir ler tudo na hora do toque, sem await
// (exigência do iPhone, ver exportBackup em backup.ts).
//
// Toda chave desta lista entra no backup (campo "extras"). Chave nova: é só
// acrescentar aqui e anotar no CLAUDE.md.
export const EXTRA_KEYS = [
  "orcamento",
  "receita",
  "diaFechamento",
  "recorrentes",
] as const;

export type ExtraKey = (typeof EXTRA_KEYS)[number];
export type Extras = Partial<Record<ExtraKey, string | null>>;

const cache: Record<string, string | null> = {};
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

// lê tudo do armazenamento (ao abrir o app e depois de restaurar um backup)
export const loadStoredValues = async () => {
  try {
    const pairs = await AsyncStorage.multiGet([...EXTRA_KEYS]);
    for (const [key, value] of pairs) cache[key] = value;
  } catch (error) {
    console.error("Erro ao ler configurações", error);
  }
  notify();
};

export const getStored = (key: ExtraKey): string | null => cache[key] ?? null;

// null apaga a chave
export const setStored = async (key: ExtraKey, value: string | null) => {
  cache[key] = value;
  notify();
  try {
    if (value === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Erro ao salvar configuração", error);
  }
};

// valor atual na tela, atualizado quando muda em qualquer lugar do app
export const useStoredValue = (key: ExtraKey): string | null => {
  const [value, setValue] = useState(() => getStored(key));
  useEffect(() => {
    const listener = () => setValue(getStored(key));
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, [key]);
  return value;
};

// número salvo (ex: limite do mês) ou null se não tiver
export const useStoredNumber = (key: ExtraKey): number | null => {
  const value = useStoredValue(key);
  const number = value === null ? NaN : Number(value);
  return Number.isFinite(number) ? number : null;
};

//---------------------- backup ----------------------
// Todas as chaves da lista, inclusive as vazias (null): ao restaurar, a chave
// vazia é apagada. Chave que não está no arquivo (backup antigo) fica como está.
export const extrasSnapshot = (): Extras => {
  const snapshot: Extras = {};
  for (const key of EXTRA_KEYS) snapshot[key] = getStored(key);
  return snapshot;
};

export const parseExtras = (value: unknown): Extras | undefined => {
  if (typeof value !== "object" || value === null) return undefined;
  const extras: Extras = {};
  for (const key of EXTRA_KEYS) {
    if (!(key in value)) continue;
    const item = (value as Record<string, unknown>)[key];
    if (item === null || typeof item === "string") extras[key] = item;
  }
  return extras;
};

export const restoreExtras = async (extras: Extras) => {
  const toSet: [string, string][] = [];
  const toRemove: string[] = [];
  for (const key of EXTRA_KEYS) {
    if (!(key in extras)) continue;
    const value = extras[key];
    if (typeof value === "string") toSet.push([key, value]);
    else toRemove.push(key);
  }
  if (toSet.length) await AsyncStorage.multiSet(toSet);
  if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
};
