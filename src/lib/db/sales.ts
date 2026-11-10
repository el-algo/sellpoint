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
  debtor?: string;
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
        `INSERT INTO sale_items (sale_id, item_id, name, unit_price, unit_cost, quantity, subtotal)
         VALUES (?, ?, ?, ?, (SELECT cost FROM items WHERE id = ?), ?, ?)`,
        input.saleId,
        line.itemId,
        line.name,
        line.unitPrice,
        line.itemId,
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

    if (input.debtor) {
      await db.runAsync(
        'INSERT INTO credit_entries (debtor, amount, created_at) VALUES (?, ?, ?)',
        input.debtor,
        input.total,
        new Date().toISOString()
      );
    }
  });
}
