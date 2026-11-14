import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from './connection';

export type CashCount = {
  cashSales: number;
  payments: number;
  withdrawals: number;
  expected: number;
};

export type Expense = {
  id: number;
  concept: string;
  amount: number;
  created_at: string;
};

function roundCents(amount: number) {
  return Math.round(amount * 100) / 100;
}

async function getLastClosingAt(db: SQLiteDatabase): Promise<string> {
  const row = await db.getFirstAsync<{ closed_at: string | null }>(
    'SELECT MAX(closed_at) AS closed_at FROM cash_closings'
  );
  return row?.closed_at ?? '';
}

// Totales desde el último cierre de caja.
export async function getCashCount(): Promise<CashCount> {
  const db = await getDatabase();
  const since = await getLastClosingAt(db);

  const sales = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(total), 0) AS total
     FROM sales
     WHERE status = 'completed' AND method = 'efectivo' AND completed_at > ?`,
    since
  );
  const credit = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(-SUM(amount), 0) AS total FROM credit_entries WHERE amount < 0 AND method = 'efectivo' AND created_at > ?",
    since
  );
  const expenses = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE created_at > ?',
    since
  );

  const cashSales = roundCents(sales?.total ?? 0);
  const payments = roundCents(credit?.total ?? 0);
  const withdrawals = roundCents(expenses?.total ?? 0);

  return {
    cashSales,
    payments,
    withdrawals,
    expected: roundCents(cashSales + payments - withdrawals),
  };
}

export async function closeCashCount(expected: number, counted: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO cash_closings (closed_at, expected, counted) VALUES (?, ?, ?)',
    new Date().toISOString(),
    expected,
    counted
  );
}

export async function getExpensesSinceClosing(): Promise<Expense[]> {
  const db = await getDatabase();
  return db.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE created_at > ? ORDER BY created_at DESC',
    await getLastClosingAt(db)
  );
}

export async function registerExpense(concept: string, amount: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO expenses (concept, amount, created_at) VALUES (?, ?, ?)',
    concept,
    amount,
    new Date().toISOString()
  );
}
