import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from './connection';
import { SEED_ROLES, SEED_USERS, type RoleName } from './seed-users';
import { hashPin, verifyPin } from '@/lib/utils/pin-hash';

export type User = {
  id: number;
  name: string;
  role_name: RoleName;
};

export async function seedUsers(db: SQLiteDatabase): Promise<void> {
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