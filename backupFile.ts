import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

//---------------------- arquivo de backup: versão Android ----------------------
// Na web o Metro usa backupFile.web.ts no lugar deste arquivo.

// Grava o .json no cache do app e abre o Compartilhar do Android (Drive,
// WhatsApp, Arquivos...). Retorna false se não deu para abrir o Compartilhar.
// O Android não avisa se a pessoa fechou o menu sem escolher nada.
export const shareBackupFile = async (
  fileName: string,
  json: string,
): Promise<boolean> => {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Compartilhamento indisponível neste aparelho.");
  }
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  await file.write(json);
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Backup do Anotei",
  });
  return true;
};

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
