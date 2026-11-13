//---------------------- aviso de nova versão: versão web (PWA) ----------------------
// A PWA se atualiza sozinha a cada publicação no GitHub Pages (service worker),
// então não há o que avisar. O Metro usa este arquivo na web no lugar de updates.ts.

export interface UpdateInfo {
  version: string;
  downloadUrl: string;
}

export const checkForUpdate = async (): Promise<UpdateInfo | null> => null;
