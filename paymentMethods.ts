import { Ionicons } from "@expo/vector-icons";
import { Type } from "./Types";
import { colors } from "./theme";

//---------------------- formas de pagamento de um gasto ----------------------
export type PaymentMethod = Type["category"];

// ordem em que aparecem no cadastro e nos resumos
export const PAYMENT_METHODS: PaymentMethod[] = ["credit card", "debit", "pix"];

interface PaymentInfo {
  label: string; // "Crédito"
  longLabel: string; // "Cartão de crédito" (detalhes do gasto)
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  softColor: string;
}

const PAYMENT_INFO: Record<PaymentMethod, PaymentInfo> = {
  "credit card": {
    label: "Crédito",
    longLabel: "Cartão de crédito",
    icon: "card-outline",
    color: colors.credit,
    softColor: colors.creditSoft,
  },
  debit: {
    label: "Débito",
    longLabel: "Débito",
    icon: "cash-outline",
    color: colors.debit,
    softColor: colors.debitSoft,
  },
  pix: {
    label: "Pix",
    longLabel: "Pix",
    icon: "qr-code-outline",
    color: colors.pix,
    softColor: colors.pixSoft,
  },
};

// valor desconhecido (dado antigo ou estragado) aparece como débito, como antes
export const getPaymentInfo = (method: string): PaymentInfo =>
  PAYMENT_INFO[method as PaymentMethod] ?? PAYMENT_INFO.debit;

export type PaymentTotals = Record<PaymentMethod, number>;

export const totalsByPaymentMethod = (expenses: Type[]): PaymentTotals => {
  const totals: PaymentTotals = { "credit card": 0, debit: 0, pix: 0 };
  for (const expense of expenses) {
    const method = PAYMENT_INFO[expense.category] ? expense.category : "debit";
    totals[method] += expense.amount;
  }
  return totals;
};
