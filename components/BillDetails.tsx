import React, { useRef } from "react";
import { InterfaceBill } from "../Types";
import DetailsSheet, { DetailRow } from "./DetailsSheet";
import ReminderToggle from "./ReminderToggle";
import { colors, formatBRL, formatDate } from "../theme";
import { getDueDay, isReminderOn } from "../notifications";

interface BillDetailsProps {
  bill: InterfaceBill | null; // null = modal fechado
  onClose: () => void;
  onToggleReminder?: (value: boolean) => void; // liga/desliga o aviso no vencimento
}

//---------------------- modal com as informações de uma conta fixa ----------------------
const BillDetails: React.FC<BillDetailsProps> = ({
  bill,
  onClose,
  onToggleReminder,
}) => {
  // guarda a última conta aberta para o conteúdo não sumir durante a animação de fechar
  const lastBill = useRef<InterfaceBill | null>(null);
  if (bill) lastBill.current = bill;
  const item = bill ?? lastBill.current;
  if (!item) return null;

  const rows: DetailRow[] = [
    { icon: "calendar-outline", label: "Vencimento", value: item.venc },
  ];

  // o id da conta é criado com Date.now() no cadastro, então guarda a data de criação
  const createdAt = Number(item.id);
  if (Number.isFinite(createdAt) && createdAt > 1e12) {
    rows.push({
      icon: "time-outline",
      label: "Cadastrada em",
      value: formatDate(createdAt),
    });
  }

  rows.push({
    icon: "document-text-outline",
    label: "Observação",
    value: item.obs?.trim() ? item.obs : "Sem observação",
  });

  return (
    <DetailsSheet
      visible={bill !== null}
      onClose={onClose}
      title="Detalhes da conta"
      icon="receipt-outline"
      iconColor={colors.primary}
      iconBackground={colors.primarySoft}
      amount={formatBRL(item.valor)}
      name={item.nome}
      badge={
        item.pago
          ? {
              label: "Paga",
              color: colors.primaryDark,
              backgroundColor: colors.primarySoft,
            }
          : {
              label: "Pendente",
              color: colors.warning,
              backgroundColor: colors.warningSoft,
            }
      }
      rows={rows}
    >
      {onToggleReminder && (
        <ReminderToggle
          value={isReminderOn(item)}
          onValueChange={onToggleReminder}
          dueDay={getDueDay(item)}
        />
      )}
    </DetailsSheet>
  );
};

export default BillDetails;
