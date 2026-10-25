import { getDatabase } from './connection';
import { createTables } from './schema';
import { seedUsers } from './users';
import { seedItems } from './items';

let initPromise: Promise<void> | null = null;

export function initDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await getDatabase();
      await createTables(db);
      await seedUsers(db);
      await seedItems(db);
    })();
  }
  return initPromise;
}

export { DATABASE_NAME } from './connection';
export {
  getAllUsers,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
  verifyUserPin,
  type User,
} from './users';
export {
  getAllItems,
  searchItemsByName,
  createItem,
  updateItem,
  deleteItem,
  type GroceryItem,
  type NewItem,
} from './items';
export {
  createSale,
  completeSale,
  getSalesTotalByDate,
  type SaleLineInput,
  type CompleteSaleInput,
  type DailySales,
} from './sales';