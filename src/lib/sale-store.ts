import { useSyncExternalStore } from 'react';
import type { SaleItem } from '@/lib/format';
import { initDatabase, createSale, type GroceryItem } from '@/lib/db-services';

type Listener = () => void;

let items: SaleItem[] = [];
let saleId: number | null = null;

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
    : [...items, { id, name: item.name, quantity, unitPrice: item.price, unit: 'pza' }];

  emit();
}

export function clearSaleItems() {
  items = [];
  emit();
}

export async function startNewSale(): Promise<number> {
  items = [];
  saleId = null;
  emit();

  await initDatabase();
  const id = await createSale();
  saleId = id;
  emit();
  return id;
}
