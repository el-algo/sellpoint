import { useMemo, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import SegmentedControl from '@/components/ui/segmented-control';
import AmountInput from '@/components/checkout/amount-input';
import QuickAmounts from '@/components/checkout/quick-amounts';
import ValueCard from '@/components/ui/value-card';
import Button from '@/components/ui/button';
import TextField from '@/components/ui/text-field';
import { formatCurrency, saleTotals, type PaymentMethod } from '@/lib/utils/format';
import { useSaleItems, useCurrentSaleId, useSaleDiscount } from '@/lib/stores/sale-store';
import { completeSale } from '@/lib/db';

const METHODS = [
  { value: 'efectivo' as const, label: 'Efectivo' },
  { value: 'fiado' as const, label: 'Fiado' },
  { value: 'transferencia' as const, label: 'Transfer.' },
];

export default function Checkout() {
  const router = useRouter();
  const items = useSaleItems();
  const saleId = useCurrentSaleId();
  const discount = useSaleDiscount();
  const { subtotal, total } = useMemo(() => saleTotals(items, discount), [items, discount]);

  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [received, setReceived] = useState('');
  const [debtor, setDebtor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const receivedValue = parseFloat(received) || 0;
  const change = useMemo(() => receivedValue - total, [receivedValue, total]);
  const isCash = method === 'efectivo';
  const isCredit = method === 'fiado';
  const debtorName = debtor.trim();
  const canFinish =
    !submitting &&
    saleId != null &&
    items.length > 0 &&
    (!isCash || receivedValue >= total) &&
    (!isCredit || debtorName !== '');

  const finish = async () => {
    if (!saleId || submitting) return;

    setSubmitting(true);
    try {
      await completeSale({
        saleId,
        items: items.map((item) => ({
          itemId: Number(item.id),
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
        subtotal,
        total,
        method,
        received: isCash ? receivedValue : undefined,
        change: isCash ? change : undefined,
        debtor: isCredit ? debtorName : undefined,
      });

      router.replace({
        pathname: '/receipt',
        params: {
          folio: String(saleId),
          total: String(total),
          method,
          received: isCash ? String(receivedValue) : '',
          change: isCash ? String(change) : '',
        },
      });
    } catch {
      Alert.alert('No se pudo registrar la venta', 'Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen title={`Cobrar ${formatCurrency(total)}`}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SegmentedControl options={METHODS} value={method} onChange={setMethod} />

        {isCash && (
          <>
            <AmountInput label="Recibí" value={received} onChangeText={setReceived} />
            <QuickAmounts
              amounts={[50, 100, 200, 500]}
              onSelect={(amount) => setReceived((current) => String((parseFloat(current) || 0) + amount))}
            />
            {receivedValue > 0 && change < 0 ? (
              <ValueCard
                label="Monto insuficiente"
                value={`Faltan ${formatCurrency(-change)}`}
                danger
              />
            ) : (
              <ValueCard label="Cambio" value={formatCurrency(Math.max(change, 0))} />
            )}
            <View style={styles.flex} />
          </>
        )}

        {isCredit && (
          <>
            <TextField
              label="Nombre del deudor"
              value={debtor}
              onChangeText={setDebtor}
              placeholder="Ej. Don Beto (taller)"
              autoCapitalize="words"
              maxLength={60}
            />
            <View style={styles.flex} />
          </>
        )}

        <Button label="Finalizar" disabled={!canFinish} onPress={finish} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 14,
  },
});
