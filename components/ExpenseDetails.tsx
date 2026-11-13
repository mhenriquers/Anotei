import React, { useRef } from "react";
import { Type } from "../Types";
import DetailsSheet from "./DetailsSheet";
import { formatBRL, formatLongDate, formatTime } from "../theme";
import { getPaymentInfo } from "../paymentMethods";
import { expenseTitle } from "../installments";

interface ExpenseDetailsProps {
  expense: Type | null; // null = modal fechado
  onClose: () => void;
  onEdit?: (expense: Type) => void; // abre o cadastro para editar este gasto
}

//---------------------- modal com as informações de um gasto ----------------------
const ExpenseDetails: React.FC<ExpenseDetailsProps> = ({
  expense,
  onClose,
  onEdit,
}) => {
  // guarda o último gasto aberto para o conteúdo não sumir durante a animação de fechar
  const lastExpense = useRef<Type | null>(null);
  if (expense) lastExpense.current = expense;
  const item = expense ?? lastExpense.current;
  if (!item) return null;

  const payment = getPaymentInfo(item.category);

  return (
    <DetailsSheet
      visible={expense !== null}
      onClose={onClose}
      onEdit={onEdit ? () => onEdit(item) : undefined}
      title="Detalhes do gasto"
      icon={payment.icon}
      iconImage={payment.image}
      iconColor={payment.color}
      iconBackground={payment.softColor}
      amount={formatBRL(item.amount)}
      name={expenseTitle(item)}
      badge={{
        label: payment.longLabel,
        color: payment.color,
        backgroundColor: payment.softColor,
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
