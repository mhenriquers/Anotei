export interface Type {
  id: string;
  title: string;
  amount: number;
  createdAt: Date;
  category: "credit card" | "debit" | "pix"; // forma de pagamento
  observacao?: string;
}
export type RootStackParamList = {
  Home: undefined;
  ExpenseList: undefined;
  Bills: undefined;
  Reservas: undefined;
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
}
