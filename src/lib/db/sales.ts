import { getDatabase } from './connection';

export type SaleLineInput = {
  itemId: number;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type CompleteSaleInput = {
  saleId: number;
  items: SaleLineInput[];
  subtotal: number;
  total: number;
  method: string;
  received?: number;
  change?: number;
};

export type DailySales = {
  total: number;   // suma de las ventas del día
  count: number;   // cuántas ventas fueron
};

export async function createSale(): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO sales (created_at, status, subtotal, total) VALUES (?, 'open', 0, 0)",
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function completeSale(input: CompleteSaleInput): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    for (const line of input.items) {
      await db.runAsync(
        'INSERT INTO sale_items (sale_id, item_id, name, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        input.saleId,
        line.itemId,
        line.name,
        line.unitPrice,
        line.quantity,
        line.unitPrice * line.quantity
      );
      await db.runAsync(
        'UPDATE items SET quantity = MAX(quantity - ?, 0) WHERE id = ?',
        line.quantity,
        line.itemId
      );
    }

    await db.runAsync(
      `UPDATE sales
       SET status = 'completed', subtotal = ?, total = ?, method = ?, received = ?, change_amount = ?, completed_at = ?
       WHERE id = ?`,
      input.subtotal,
      input.total,
      input.method,
      input.received ?? null,
      input.change ?? null,
      new Date().toISOString(),
      input.saleId
    );
  });
}

export async function getSalesTotalByDate(date: Date = new Date()): Promise<DailySales> {
  const db = await getDatabase();

  // Inicio y fin del día en hora LOCAL del dispositivo
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const row = await db.getFirstAsync<{ total: number; count: number }>(
    `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS count
     FROM sales
     WHERE status = 'completed'
       AND completed_at >= ? AND completed_at < ?`,
    start.toISOString(),
    end.toISOString()
  );

  return {
    total: Math.round((row?.total ?? 0) * 100) / 100,
    count: row?.count ?? 0,
  };
}