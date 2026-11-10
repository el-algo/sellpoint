import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from './connection';
import type { SaleUnit } from '@/lib/utils/format';

export type GroceryItem = {
  id: number;
  barcode: string | null;
  name: string;
  unit: SaleUnit;
  cost: number;
  price: number;
  quantity: number;
  low_stock: number;
  expiration_date: string;
};

const SEED_ITEMS: Pick<GroceryItem, 'name' | 'price' | 'quantity' | 'expiration_date'>[] = [
  { name: 'Coca-Cola 600 ml', price: 40.0, quantity: 24, expiration_date: '2026-12-01' },
  { name: 'Tomate a granel', price: 40.0, quantity: 50, expiration_date: '2026-09-20' },
  { name: 'Sabritas adobadas', price: 40.0, quantity: 30, expiration_date: '2027-02-15' },
  { name: 'Leche Lala 1 L', price: 40.0, quantity: 18, expiration_date: '2026-09-25' },
  { name: 'Pan Bimbo blanco', price: 40.0, quantity: 15, expiration_date: '2026-09-18' },
  { name: 'Huevo San Juan 30 pzas', price: 40.0, quantity: 10, expiration_date: '2026-10-05' },
  { name: 'Arroz Verde Valle 1 kg', price: 40.0, quantity: 40, expiration_date: '2027-06-01' },
  { name: 'Frijol negro 1 kg', price: 40.0, quantity: 35, expiration_date: '2027-05-10' },
  { name: 'Aceite Nutrioli 1 L', price: 40.0, quantity: 20, expiration_date: '2027-01-30' },
  { name: 'Cerveza Corona 355 ml', price: 40.0, quantity: 48, expiration_date: '2026-11-11' },
];

export async function seedItems(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM items'
  );

  if ((row?.count ?? 0) > 0) return;

  await db.withTransactionAsync(async () => {
    for (const item of SEED_ITEMS) {
      await db.runAsync(
        'INSERT INTO items (name, price, quantity, expiration_date) VALUES (?, ?, ?, ?)',
        item.name,
        item.price,
        item.quantity,
        item.expiration_date
      );
    }
  });
}

export async function getAllItems(): Promise<GroceryItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<GroceryItem>('SELECT * FROM items ORDER BY name ASC');
}

export async function searchItemsByName(query: string): Promise<GroceryItem[]> {
  const db = await getDatabase();

  if (!query.trim()) {
    return getAllItems();
  }

  return db.getAllAsync<GroceryItem>(
    'SELECT * FROM items WHERE name LIKE ? OR barcode = ? ORDER BY name ASC',
    `%${query.trim()}%`,
    query.trim()
  );
}

export async function getItemById(id: number): Promise<GroceryItem | null> {
  const db = await getDatabase();
  return db.getFirstAsync<GroceryItem>('SELECT * FROM items WHERE id = ?', id);
}

export async function getLowStockCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM items WHERE quantity <= low_stock'
  );
  return row?.count ?? 0;
}

export type RecentlySoldItem = GroceryItem & { last_sold_at: string };

export async function getRecentlySoldItems(limit = 5): Promise<RecentlySoldItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<RecentlySoldItem>(
    `SELECT items.*, MAX(sales.completed_at) AS last_sold_at
     FROM items
     JOIN sale_items ON sale_items.item_id = items.id
     JOIN sales ON sales.id = sale_items.sale_id
     WHERE sales.status = 'completed'
     GROUP BY items.id
     ORDER BY last_sold_at DESC
     LIMIT ?`,
    limit
  );
}

export type NewItem = Omit<GroceryItem, 'id'>;

export async function createItem(item: NewItem): Promise<number> {
  const db = await getDatabase();
  const name = item.name.trim();

  const duplicate = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM items WHERE LOWER(name) = LOWER(?)',
    name
  );
  if (duplicate) throw new Error('DUPLICATE_NAME');

  const result = await db.runAsync(
    `INSERT INTO items (barcode, name, unit, cost, price, quantity, low_stock, expiration_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    item.barcode,
    name,
    item.unit,
    item.cost,
    item.price,
    item.quantity,
    item.low_stock,
    item.expiration_date
  );
  return result.lastInsertRowId;
}

export async function updateItem(id: number, item: NewItem): Promise<void> {
  const db = await getDatabase();
  const name = item.name.trim();

  const duplicate = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM items WHERE LOWER(name) = LOWER(?) AND id != ?',
    name,
    id
  );
  if (duplicate) throw new Error('DUPLICATE_NAME');

  await db.runAsync(
    `UPDATE items
     SET barcode = ?, name = ?, unit = ?, cost = ?, price = ?, quantity = ?, low_stock = ?, expiration_date = ?
     WHERE id = ?`,
    item.barcode,
    name,
    item.unit,
    item.cost,
    item.price,
    item.quantity,
    item.low_stock,
    item.expiration_date,
    id
  );
}

export async function deleteItem(id: number): Promise<void> {
  const db = await getDatabase();

  const used = await db.getFirstAsync<{ count: number }>(
    `SELECT (SELECT COUNT(*) FROM sale_items WHERE item_id = ?)
          + (SELECT COUNT(*) FROM purchase_items WHERE item_id = ?) AS count`,
    id,
    id
  );
  if ((used?.count ?? 0) > 0) throw new Error('ITEM_IN_USE');

  await db.runAsync('DELETE FROM items WHERE id = ?', id);
}