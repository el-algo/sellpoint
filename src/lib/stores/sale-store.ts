import { useSyncExternalStore } from 'react';
import type { SaleItem } from '@/lib/utils/format';
import { initDatabase, createSale, type GroceryItem } from '@/lib/db';

type Listener = () => void;

let items: SaleItem[] = [];
let saleId: number | null = null;
let discount = 0;
// Lo último que se agregó, para poder deshacerlo.
let lastAdded: { id: string; quantity: number } | null = null;

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getItemsSnapshot() {
  return items;
}

function getSaleIdSnapshot() {
  return saleId;
}

export function useSaleItems(): SaleItem[] {
  return useSyncExternalStore(subscribe, getItemsSnapshot, getItemsSnapshot);
}

export function useCurrentSaleId(): number | null {
  return useSyncExternalStore(subscribe, getSaleIdSnapshot, getSaleIdSnapshot);
}

const getDiscountSnapshot = () => discount;
const getLastAddedSnapshot = () => lastAdded;

export function useSaleDiscount(): number {
  return useSyncExternalStore(subscribe, getDiscountSnapshot, getDiscountSnapshot);
}

export function useLastAdded() {
  return useSyncExternalStore(subscribe, getLastAddedSnapshot, getLastAddedSnapshot);
}

export function setSaleDiscount(amount: number) {
  discount = amount;
  emit();
}

export function undoLastAdd() {
  if (!lastAdded) return;
  const { id, quantity } = lastAdded;
  items = items
    .map((saleItem) =>
      saleItem.id === id ? { ...saleItem, quantity: saleItem.quantity - quantity } : saleItem
    )
    .filter((saleItem) => saleItem.quantity > 0);
  lastAdded = null;
  emit();
}

export function dismissLastAdded() {
  if (!lastAdded) return;
  lastAdded = null;
  emit();
}

export function getCartQuantity(itemId: number): number {
  const id = String(itemId);
  return items.find((saleItem) => saleItem.id === id)?.quantity ?? 0;
}

export function addItemToSale(item: GroceryItem, quantity: number) {
  const id = String(item.id);
  const existing = items.find((saleItem) => saleItem.id === id);

  items = existing
    ? items.map((saleItem) =>
        saleItem.id === id
          ? { ...saleItem, quantity: saleItem.quantity + quantity }
          : saleItem
      )
    : [...items, { id, name: item.name, quantity, unitPrice: item.price, unit: item.unit }];
  lastAdded = { id, quantity };

  emit();
}

export function clearSaleItems() {
  items = [];
  discount = 0;
  lastAdded = null;
  emit();
}

export async function startNewSale(): Promise<number> {
  items = [];
  saleId = null;
  discount = 0;
  lastAdded = null;
  emit();

  await initDatabase();
  const id = await createSale();
  saleId = id;
  emit();
  return id;
}
