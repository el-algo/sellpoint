import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from './connection';

export type GroceryItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  expiration_date: string;
};

const SEED_ITEMS: Omit<GroceryItem, 'id'>[] = [
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
    'SELECT * FROM items WHERE name LIKE ? ORDER BY name ASC',
    `%${query.trim()}%`
  );
}