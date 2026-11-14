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
  verifyAdminPin,
  type User,
} from './users';
export {
  getAllItems,
  searchItemsByName,
  getRecentlySoldItems,
  getItemById,
  getLowStockCount,
  createItem,
  updateItem,
  deleteItem,
  type GroceryItem,
  type NewItem,
  type RecentlySoldItem,
} from './items';
export { registerPurchase, purchaseTotal, type PurchaseLine } from './purchases';
export { getReport, type Report, type TopItem } from './reports';
export { getDebtors, registerPayment, type Debtor, type PaymentMethodForCredit } from './credit';
export {
  getCashCount,
  closeCashCount,
  getExpensesSinceClosing,
  registerExpense,
  type CashCount,
  type Expense,
} from './cash-count';
export {
  createSale,
  completeSale,
  type SaleLineInput,
  type CompleteSaleInput,
} from './sales';