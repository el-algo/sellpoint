import { useSyncExternalStore } from 'react';
import type { PurchaseLine } from '@/lib/db';
import type { SaleUnit } from '@/lib/utils/format';

export type ReceivingLine = PurchaseLine & {
  name: string;
  unit: SaleUnit;
};

type Listener = () => void;

let lines: ReceivingLine[] = [];

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return lines;
}

export function useReceivingLines(): ReceivingLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addReceivingLine(line: ReceivingLine) {
  lines = [...lines, line];
  emit();
}

export function removeReceivingLine(index: number) {
  lines = lines.filter((_, i) => i !== index);
  emit();
}

export function clearReceivingLines() {
  lines = [];
  emit();
}
