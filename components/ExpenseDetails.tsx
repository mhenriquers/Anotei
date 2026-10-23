import React, { useRef } from "react";
import { Type } from "../Types";
import DetailsSheet from "./DetailsSheet";
import { colors, formatBRL, formatLongDate, formatTime } from "../theme";

interface ExpenseDetailsProps {
  expense: Type | null; // null = modal fechado
  onClose: () => void;
}

//---------------------- modal com as informações de um gasto ----------------------
const ExpenseDetails: React.FC<ExpenseDetailsProps> = ({
  expense,
  onClose,
}) => {
  // guarda o último gasto aberto para o conteúdo não sumir durante a animação de fechar
  const lastExpense = useRef<Type | null>(null);
  if (expense) lastExpense.current = expense;
  const item = expense ?? lastExpense.current;
  if (!item) return null;

  const isCredit = item.category === "credit card";

  return (
    <DetailsSheet
      visible={expense !== null}
      onClose={onClose}
      title="Detalhes do gasto"
      icon={isCredit ? "card-outline" : "cash-outline"}
      iconColor={isCredit ? colors.credit : colors.debit}
      iconBackground={isCredit ? colors.creditSoft : colors.debitSoft}
      amount={formatBRL(item.amount)}
      name={item.title}
      badge={{
        label: isCredit ? "Cartão de crédito" : "Débito",
        color: isCredit ? colors.credit : colors.debit,
        backgroundColor: isCredit ? colors.creditSoft : colors.debitSoft,
      }}
      rows={[
        {
          icon: "calendar-outline",
          label: "Data",
          value: formatLongDate(item.createdAt),
        },
        {
          icon: "time-outline",
          label: "Horário",
          value: formatTime(item.createdAt),
        },
        {
          icon: "document-text-outline",
          label: "Observação",
          value: item.observacao?.trim() ? item.observacao : "Sem observação",
        },
      ]}
    />
  );
};

export default ExpenseDetails;
