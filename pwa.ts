import { Platform } from "react-native";

//---------------------- versão web (PWA) ----------------------
export const isWeb = Platform.OS === "web";

// iPhone/iPad abrindo pelo navegador. O iPadOS se apresenta como Mac;
// a diferença é que o iPad tem tela de toque.
const isIOSBrowser = (): boolean => {
  if (!isWeb || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
};

// aberto pelo ícone da tela de início (e não numa aba do navegador)
export const isInstalledPWA = (): boolean => {
  if (!isWeb || typeof window === "undefined") return false;
  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true
  );
};

// No iPhone, a aba do Safari e o app instalado guardam os dados em lugares
// separados. Para nada ficar "preso" no Safari, o app só funciona instalado.
// No Android e no computador os dois compartilham os dados, então não precisa.
export const needsInstallFirst = (): boolean =>
  isIOSBrowser() && !isInstalledPWA();
