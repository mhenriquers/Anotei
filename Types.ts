export interface Expense {
  id: string;
  name: string;
  amount: number;
  createdAt: Date;
  category: "bill" | "variable";
  isWaste: boolean;
}
