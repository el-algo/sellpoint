import { getDatabase } from './connection';

export type Debtor = {
  name: string;
  balance: number;
  last_payment_at: string | null;
};

export async function getDebtors(): Promise<Debtor[]> {
  const db = await getDatabase();
  return db.getAllAsync<Debtor>(
    `SELECT debtor AS name,
            ROUND(SUM(amount), 2) AS balance,
            MAX(CASE WHEN amount < 0 THEN created_at END) AS last_payment_at
     FROM credit_entries
     GROUP BY debtor
     HAVING balance > 0
     ORDER BY debtor ASC`
  );
}

export async function registerPayment(debtor: string, amount: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO credit_entries (debtor, amount, created_at) VALUES (?, ?, ?)',
    debtor,
    -amount,
    new Date().toISOString()
  );
}
