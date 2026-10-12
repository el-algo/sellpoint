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
export { getAllUsers, verifyUserPin, type User } from './users';
export { getAllItems, searchItemsByName, type GroceryItem } from './items';
export {
  createSale,
  completeSale,
  type SaleLineInput,
  type CompleteSaleInput,
} from './sales';