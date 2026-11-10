import { getDatabase } from './connection';
import type { SaleUnit } from '@/lib/utils/format';

export type TopItem = {
  name: string;
  unit: SaleUnit;
  quantity: number;
};

export type Report = {
  sold: number;
  cost: number;
  expenses: number;
  topItems: TopItem[];
};

export async function getReport(since: Date): Promise<Report> {
  const db = await getDatabase();
  const from = since.toISOString();

  const sold = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(ROUND(SUM(total), 2), 0) AS total
     FROM sales
     WHERE status = 'completed' AND completed_at >= ?`,
    from
  );

  const cost = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(ROUND(SUM(sale_items.unit_cost * sale_items.quantity), 2), 0) AS total
     FROM sale_items
     JOIN sales ON sales.id = sale_items.sale_id
     WHERE sales.status = 'completed' AND sales.completed_at >= ?`,
    from
  );

  const expenses = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(ROUND(SUM(amount), 2), 0) AS total FROM expenses WHERE created_at >= ?',
    from
  );

  const topItems = await db.getAllAsync<TopItem>(
    `SELECT items.name AS name, items.unit AS unit, SUM(sale_items.quantity) AS quantity
     FROM sale_items
     JOIN sales ON sales.id = sale_items.sale_id
     JOIN items ON items.id = sale_items.item_id
     WHERE sales.status = 'completed' AND sales.completed_at >= ?
     GROUP BY items.id
     ORDER BY quantity DESC
     LIMIT 3`,
    from
  );

  return {
    sold: sold?.total ?? 0,
    cost: cost?.total ?? 0,
    expenses: expenses?.total ?? 0,
    topItems,
  };
}
