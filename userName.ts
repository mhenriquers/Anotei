import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

//---------------------- nome da pessoa (título da Home) ----------------------
// Fica salvo no aparelho e entra no backup. Vazio = mostra "Suas finanças".

export const KEY_USER_NAME = "nome";
export const USER_NAME_MAX = 30;

export const cleanUserName = (value: unknown) =>
  typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, USER_NAME_MAX)
    : "";

export const useUserName = () => {
  const [name, setName] = useState("");

  // relê o nome salvo (ex: depois de restaurar um backup)
  const reload = useCallback(async () => {
    try {
      setName(cleanUserName(await AsyncStorage.getItem(KEY_USER_NAME)));
    } catch (error) {
      console.error("Erro ao ler o nome", error);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveName = useCallback(async (value: string) => {
    const clean = cleanUserName(value);
    setName(clean);
    try {
      if (clean) await AsyncStorage.setItem(KEY_USER_NAME, clean);
      else await AsyncStorage.removeItem(KEY_USER_NAME);
    } catch (error) {
      console.error("Erro ao salvar o nome", error);
    }
  }, []);

  return { name, saveName, reload };
};
