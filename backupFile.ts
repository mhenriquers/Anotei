import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

//---------------------- arquivo de backup: versão Android ----------------------
// Na web o Metro usa backupFile.web.ts no lugar deste arquivo.

// Grava o arquivo no cache do app e abre o Compartilhar do Android (Drive,
// WhatsApp, Arquivos...). Retorna false se não deu para abrir o Compartilhar.
// O Android não avisa se a pessoa fechou o menu sem escolher nada.
export const shareTextFile = async (
  fileName: string,
  text: string,
  mimeType: string,
  title: string,
): Promise<boolean> => {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Compartilhamento indisponível neste aparelho.");
  }
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  await file.write(text);
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: title });
  return true;
};

export const shareBackupFile = (fileName: string, json: string) =>
  shareTextFile(fileName, json, "application/json", "Backup do Anotei");

// Abre o seletor de arquivos e devolve o texto do arquivo (null = cancelou).
export const pickBackupText = async (): Promise<string | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    // alguns apps salvam .json como texto ou "arquivo genérico"
    type: ["application/json", "text/plain", "application/octet-stream"],
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  return new File(result.assets[0].uri).text();
};
