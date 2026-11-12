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
  pix: "#7C3AED",
  pixSoft: "#EDE9FE",

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

//------------------------------ campos de data e hora ------------------------------
// Ex: "22/10/2026" (formato do campo "Data" do cadastro)
export const formatDateInput = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

// Coloca as barras enquanto a pessoa digita: "22102026" → "22/10/2026"
export const maskDateInput = (text: string): string => {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

// Coloca os dois pontos enquanto a pessoa digita: "1430" → "14:30"
export const maskTimeInput = (text: string): string => {
  const digits = text.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

// Junta "dd/mm/aaaa" e "hh:mm" numa data. Se algo estiver errado, devolve a
// mensagem para mostrar à pessoa.
export const parseDateTimeInput = (
  dateText: string,
  timeText: string,
): { date: Date } | { error: string } => {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateText.trim());
  if (!dateMatch) return { error: "Digite a data no formato dd/mm/aaaa." };
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeText.trim());
  if (!timeMatch) return { error: "Digite a hora no formato hh:mm." };

  const [day, month, year] = dateMatch.slice(1).map(Number);
  const [hours, minutes] = timeMatch.slice(1).map(Number);
  if (hours > 23 || minutes > 59) return { error: "Digite uma hora válida." };

  const date = new Date(year, month - 1, day, hours, minutes);
  // new Date aceita 31/02 e "pula" para março; aqui isso é data inválida
  if (
    year < 2000 ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { error: "Digite uma data válida." };
  }
  // tolerância de 1 minuto: o campo é preenchido com a hora de agora
  if (date.getTime() > Date.now() + 60 * 1000) {
    return { error: "A data e a hora não podem estar no futuro." };
  }
  return { date };
};
