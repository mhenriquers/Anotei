//---------------------- arquivo de backup: versão web (PWA) ----------------------
// O Metro usa este arquivo na web no lugar de backupFile.ts (Android).

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
export const shareTextFile = async (
  fileName: string,
  text: string,
  mimeType: string,
  title: string,
): Promise<boolean> => {
  const file = new File([text], fileName, { type: mimeType });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return true;
    } catch (error) {
      if ((error as Error).name === "AbortError") return false; // cancelou
      // outro erro (ex: navegador recusou o compartilhamento): baixa o arquivo
    }
  }
  downloadFile(file);
  return true;
};

export const shareBackupFile = (fileName: string, json: string) =>
  shareTextFile(fileName, json, "application/json", "Backup do Anotei");

// Abre o seletor de arquivos e devolve o texto do arquivo (null = cancelou).
// Também precisa ser chamado direto no toque do botão (exigência do iPhone).
export const pickBackupText = (): Promise<string | null> =>
  new Promise((resolve, reject) => {
    // o iPhone só abre o seletor se o campo estiver na página
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    const finish = (file: File | null) => {
      input.remove();
      if (!file) resolve(null);
      else file.text().then(resolve, reject);
    };
    input.onchange = () => finish(input.files?.[0] ?? null);
    input.oncancel = () => finish(null);
    document.body.appendChild(input);
    input.click();
  });
