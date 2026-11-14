import type { SQLiteDatabase } from 'expo-sqlite';

export async function createTables(db: SQLiteDatabase): Promise<void> {
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

    -- Movimientos de fiado: amount > 0 es un cargo, amount < 0 es un abono.
    CREATE TABLE IF NOT EXISTS credit_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      debtor TEXT NOT NULL COLLATE NOCASE,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cash_closings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      closed_at TEXT NOT NULL,
      expected REAL NOT NULL,
      counted REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concept TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier TEXT NOT NULL,
      invoice TEXT NOT NULL,
      total REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL REFERENCES purchases(id),
      item_id INTEGER NOT NULL REFERENCES items(id),
      quantity REAL NOT NULL,
      unit_cost REAL NOT NULL
    );
  `);

  await addColumn(db, 'items', 'barcode', 'TEXT');
  await addColumn(db, 'items', 'unit', "TEXT NOT NULL DEFAULT 'pza'");
  await addColumn(db, 'items', 'cost', 'REAL NOT NULL DEFAULT 0');
  await addColumn(db, 'items', 'low_stock', 'REAL NOT NULL DEFAULT 5');
  await addColumn(db, 'sale_items', 'unit_cost', 'REAL NOT NULL DEFAULT 0');
  // Forma de pago de los abonos; los anteriores se tomaban como efectivo.
  await addColumn(db, 'credit_entries', 'method', "TEXT NOT NULL DEFAULT 'efectivo'");
}

// CREATE TABLE IF NOT EXISTS no modifica tablas de bases ya instaladas.
async function addColumn(
  db: SQLiteDatabase,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (columns.some((c) => c.name === column)) return;
  await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}