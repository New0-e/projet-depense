export type FrequencyType = "mensuel" | "annuel";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: FrequencyType;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseData {
  expenses: Expense[];
  lastSaved: string;
}
