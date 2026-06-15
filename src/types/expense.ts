export type Frequency = "mensuel" | "annuel";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
}
