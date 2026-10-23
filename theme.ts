//------------------------------ cores do app ------------------------------
export const colors = {
  primary: "#3FA34D",
  primaryDark: "#2E7D3A",
  primarySoft: "#E3F4E5",

  background: "#F4F6FA",
  surface: "#FFFFFF",
  surfaceMuted: "#F8FAFC",
  border: "#E2E8F0",

  text: "#0F172A",
  textMuted: "#64748B",
  textLight: "#94A3B8",

  hero: "#1F4E5F",
  heroMuted: "#A9C7D1",

  credit: "#2B7A99",
  creditSoft: "#E1F0F6",
  debit: "#E07B24",
  debitSoft: "#FDEBDC",

  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",

  overlay: "rgba(15, 23, 42, 0.45)",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const shadow = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
};

//------------------------------ formatação ------------------------------
export const formatBRL = (value: number): string => {
  const safe = Number.isFinite(value) ? value : 0;
  const [inteiro, decimal] = Math.abs(safe).toFixed(2).split(".");
  const comPontos = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${safe < 0 ? "-" : ""}R$ ${comPontos},${decimal}`;
};

export const formatDate = (value: Date | string | number): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return String(value);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} às ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const DIAS_DA_SEMANA = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

// Ex: "Quarta-feira, 22 de outubro de 2026"
export const formatLongDate = (value: Date | string | number): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return String(value);
  const dia = DIAS_DA_SEMANA[date.getDay()];
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)}, ${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
};

// Ex: "14:30"
export const formatTime = (value: Date | string | number): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
