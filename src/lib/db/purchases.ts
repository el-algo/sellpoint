import { getDatabase } from './connection';

export type PurchaseLine = {
  itemId: number;
  quantity: number;
  unitCost: number;
};

export function purchaseTotal(lines: PurchaseLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
}

export async function registerPurchase(
  supplier: string,
  invoice: string,
  lines: PurchaseLine[]
): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    const purchase = await db.runAsync(
      'INSERT INTO purchases (supplier, invoice, total, created_at) VALUES (?, ?, ?, ?)',
      supplier,
      invoice,
      purchaseTotal(lines),
      new Date().toISOString()
    );

    for (const line of lines) {
      await db.runAsync(
        'INSERT INTO purchase_items (purchase_id, item_id, quantity, unit_cost) VALUES (?, ?, ?, ?)',
        purchase.lastInsertRowId,
        line.itemId,
        line.quantity,
        line.unitCost
      );
      await db.runAsync(
        'UPDATE items SET quantity = quantity + ?, cost = ? WHERE id = ?',
        line.quantity,
        line.unitCost,
        line.itemId
      );
    }
  });
}
