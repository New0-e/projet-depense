import { Pool } from "pg";
import { Expense } from "@/types/expense";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_expenses (
      email TEXT PRIMARY KEY,
      expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export async function getExpenses(email: string): Promise<Expense[]> {
  await initDb();
  const res = await pool.query(
    "SELECT expenses FROM user_expenses WHERE email = $1",
    [email]
  );
  return res.rows[0]?.expenses ?? [];
}

export async function saveExpenses(email: string, expenses: Expense[]) {
  await initDb();
  await pool.query(
    `INSERT INTO user_expenses (email, expenses, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (email) DO UPDATE
     SET expenses = $2::jsonb, updated_at = NOW()`,
    [email, JSON.stringify(expenses)]
  );
}
