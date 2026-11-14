/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saleTotals, quantityStep, roundQuantity, type SaleItem } from './format.ts';

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

test('los kilos avanzan de cuarto en cuarto y las piezas de una en una', () => {
  assert.equal(quantityStep('kg'), 0.25);
  assert.equal(quantityStep('pza'), 1);
});

test('redondea los kilos sobrantes a gramos', () => {
  assert.equal(roundQuantity(2.3 - 0.25), 2.05);
});
