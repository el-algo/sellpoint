export type SaleUnit = 'pza' | 'kg';

export type SaleItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: SaleUnit;
};

export function formatCurrency(amount: number) {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${formatted}`;
}

export function formatQuantity(quantity: number, unit: SaleUnit) {
  return unit === 'kg' ? `${quantity.toFixed(3)} kg` : `${quantity}`;
}

export function formatUnits(quantity: number, unit: SaleUnit) {
  if (unit === 'kg') return `${quantity} kg`;
  return `${quantity} ${quantity === 1 ? 'pza' : 'pzas'}`;
}

// Regresa null si el texto no es un número mayor o igual a 0.
export function parseAmount(text: string): number | null {
  const clean = text.trim().replace(',', '.');
  if (clean === '') return null;
  const value = Number(clean);
  return Number.isFinite(value) && value >= 0 ? value : null;
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

export function formatDayMonth(isoDate: string) {
  const date = new Date(isoDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

export function formatTimeAgo(isoDate: string) {
  const minutes = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} ${hours === 1 ? 'hr' : 'hrs'}`;

  const days = Math.floor(hours / 24);
  return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
}

export function formatFolioDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
