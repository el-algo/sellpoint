/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saleTotals, type SaleItem } from './format.ts';

const item = (quantity: number, unitPrice: number): SaleItem => ({
  id: '1',
  name: 'Coca-Cola 600 ml',
  quantity,
  unitPrice,
  unit: 'pza',
});

test('aplica un descuento que cabe en el subtotal', () => {
  assert.deepEqual(saleTotals([item(2, 20)], 5), { subtotal: 40, discount: 5, total: 35 });
});

test('ignora un descuento mayor que el subtotal en vez de cobrar $0', () => {
  assert.deepEqual(saleTotals([item(1, 10)], 40), { subtotal: 10, discount: 0, total: 10 });
});
