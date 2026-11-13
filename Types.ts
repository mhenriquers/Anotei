export interface Type {
  id: string;
  title: string;
  amount: number;
  createdAt: Date;
  category: "credit card" | "debit" | "pix"; // forma de pagamento
  observacao?: string;
  // compra parcelada no crédito: cada parcela é um gasto, no mês em que cai
  parcela?: number; // número desta parcela (1, 2, 3...)
  parcelas?: number; // total de parcelas
  grupoParcela?: string; // igual em todas as parcelas da mesma compra
}
export type RootStackParamList = {
  Home: undefined;
  ExpenseList: undefined;
  Bills: undefined;
  Reservas: undefined;
  Recorrentes: undefined;
};

// dinheiro guardado (reserva de emergência, objetivo, investimento...)
export interface Reserva {
  id: string;
  nome: string;
  valor: number;
  finalidade: string; // ex: "Emergência", "Viagem"
  local?: string; // onde o dinheiro está (banco, carteira...), opcional
}

export interface InterfaceBill {
  nome: string;
  valor: number;
  venc: string;
  obs: string;
  id: string;
  dueDate?: string;
  category?: string;
  pago: boolean;
  diaVencimento?: number; // dia do mês (1 a 31), usado para agendar o aviso
  avisar?: boolean; // aviso no dia do vencimento (ausente = ligado)
  variavel?: boolean; // valor muda todo mês (luz, água): pergunta o valor ao marcar como paga
}
