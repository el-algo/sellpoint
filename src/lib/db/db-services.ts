import * as SQLite from 'expo-sqlite';
import { SEED_ROLES, SEED_USERS, type RoleName } from '@/lib/db/seed-users';
import { hashPin, verifyPin } from '@/lib/utils/pin-hash';

export const DATABASE_NAME = 'sellpoint.db';

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

export type User = {
  id: number;
  name: string;
  role_name: RoleName;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

let initPromise: Promise<void> | null = null;

export function initDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = setupDatabase();
  }
  return initPromise;
}

async function setupDatabase(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      pin TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      expiration_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      subtotal REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      method TEXT,
      received REAL,
      change_amount REAL
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL REFERENCES sales(id),
      item_id INTEGER NOT NULL REFERENCES items(id),
      name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity REAL NOT NULL,
      subtotal REAL NOT NULL
    );
  `);

  await seedUsers(db);

  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM items'
  );

  if ((row?.count ?? 0) === 0) {
    for (const item of SEED_ITEMS) {
      await db.runAsync(
        'INSERT INTO items (name, price, quantity, expiration_date) VALUES (?, ?, ?, ?)',
        item.name,
        item.price,
        item.quantity,
        item.expiration_date
      );
    }
  }
}

async function seedUsers(db: SQLite.SQLiteDatabase): Promise<void> {
  const roleCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM roles'
  );

  if ((roleCount?.count ?? 0) === 0) {
    for (const role of SEED_ROLES) {
      await db.runAsync('INSERT INTO roles (role_name) VALUES (?)', role);
    }
  }

  const userCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM users'
  );

  if ((userCount?.count ?? 0) === 0) {
    for (const user of SEED_USERS) {
      await db.runAsync(
        'INSERT INTO users (name, role_id, pin) SELECT ?, id, ? FROM roles WHERE role_name = ?',
        user.name,
        await hashPin(user.pin),
        user.role
      );
    }
  }

  // Upgrade databases seeded before PINs were hashed.
  const plainPins = await db.getAllAsync<{ id: number; pin: string }>(
    "SELECT id, pin FROM users WHERE pin NOT LIKE '%:%'"
  );

  for (const row of plainPins) {
    await db.runAsync('UPDATE users SET pin = ? WHERE id = ?', await hashPin(row.pin), row.id);
  }
}

const USER_SELECT = `
  SELECT users.id, users.name, roles.role_name
  FROM users JOIN roles ON roles.id = users.role_id
`;

export async function getAllUsers(): Promise<User[]> {
  const db = await getDatabase();
  return db.getAllAsync<User>(`${USER_SELECT} ORDER BY users.name ASC`);
}

export async function verifyUserPin(userId: number, pin: string): Promise<User | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<User & { pin: string }>(
    `SELECT users.id, users.name, users.pin, roles.role_name
     FROM users JOIN roles ON roles.id = users.role_id
     WHERE users.id = ?`,
    userId
  );

  if (!row || !(await verifyPin(pin, row.pin))) {
    return null;
  }

  const { pin: _stored, ...user } = row;
  return user;
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

export async function createSale(): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO sales (created_at, status, subtotal, total) VALUES (?, 'open', 0, 0)",
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

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
