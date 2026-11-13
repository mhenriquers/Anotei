import { Platform } from "react-native";
import * as Application from "expo-application";

//---------------------- aviso de nova versão (APK) ----------------------
// Consulta a última release do GitHub e compara com a versão instalada.
// Na web o Metro usa updates.web.ts (a PWA se atualiza sozinha).
// É a única chamada de internet do app: não envia nenhum dado da pessoa.

const LATEST_RELEASE_URL =
  "https://api.github.com/repos/mhenriquers/Anotei/releases/latest";
const TIMEOUT_MS = 8000;

export interface UpdateInfo {
  version: string; // ex: "1.1.0"
  downloadUrl: string; // link do .apk (ou da página da release)
}

// "v1.2.3" → [1, 2, 3]; algo fora do padrão → null
const parseVersion = (text: string): number[] | null => {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(text.trim());
  return match ? match.slice(1).map(Number) : null;
};

const isNewer = (latest: number[], current: number[]) => {
  for (let i = 0; i < 3; i++) {
    if (latest[i] !== current[i]) return latest[i] > current[i];
  }
  return false;
};

// null = sem versão nova, sem internet ou qualquer erro (nunca atrapalha o app)
export const checkForUpdate = async (): Promise<UpdateInfo | null> => {
  if (Platform.OS !== "android") return null;
  const current = parseVersion(Application.nativeApplicationVersion ?? "");
  if (!current) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(LATEST_RELEASE_URL, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const release = await response.json();

    const latest = parseVersion(String(release.tag_name ?? ""));
    if (!latest || !isNewer(latest, current)) return null;

    const apk = Array.isArray(release.assets)
      ? release.assets.find((asset: any) =>
          String(asset?.name ?? "")
            .toLowerCase()
            .endsWith(".apk"),
        )
      : undefined;
    const downloadUrl = apk?.browser_download_url ?? release.html_url;
    if (typeof downloadUrl !== "string") return null;

    return { version: latest.join("."), downloadUrl };
  } catch {
    return null; // sem internet, demorou demais ou resposta estranha
  } finally {
    clearTimeout(timer);
  }
};
