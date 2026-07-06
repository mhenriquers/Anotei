export interface Type {
  id: string;
  title: string;
  amount: number;
  createdAt: Date;
  category: "credit card" | "debit";
  observacao?: string;
}
export type RootStackParamList = {
  Home: undefined;
  ExpenseList: undefined;
};
