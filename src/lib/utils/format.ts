export type SaleUnit = 'pza' | 'kg';

export type SaleItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: SaleUnit;
};

export function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function formatQuantity(quantity: number, unit: SaleUnit) {
  return unit === 'kg' ? `${quantity.toFixed(3)} kg` : `${quantity}`;
}

export function itemSubtotal(item: SaleItem) {
  return item.quantity * item.unitPrice;
}

export function saleTotal(items: SaleItem[]) {
  return items.reduce((sum, item) => sum + itemSubtotal(item), 0);
}

export type PaymentMethod = 'efectivo' | 'fiado' | 'transferencia';

export type CompletedSale = {
  folio: number;
  date: Date;
  items: SaleItem[];
  total: number;
  method: PaymentMethod;
  received?: number;
  change?: number;
};

export function formatFolioDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
