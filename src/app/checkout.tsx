import { useMemo, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import SegmentedControl from '@/components/ui/segmented-control';
import AmountInput from '@/components/checkout/amount-input';
import QuickAmounts from '@/components/checkout/quick-amounts';
import ChangeDisplay from '@/components/checkout/change-display';
import Button from '@/components/ui/button';
import { formatCurrency, saleTotal, type PaymentMethod } from '@/lib/utils/format';
import { useSaleItems, useCurrentSaleId } from '@/lib/stores/sale-store';
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
  const total = useMemo(() => saleTotal(items), [items]);

  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [received, setReceived] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const receivedValue = parseFloat(received) || 0;
  const change = useMemo(() => receivedValue - total, [receivedValue, total]);
  const isCash = method === 'efectivo';
  const canFinish =
    !submitting && saleId != null && items.length > 0 && (!isCash || receivedValue >= total);

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
        subtotal: total,
        total,
        method,
        received: isCash ? receivedValue : undefined,
        change: isCash ? change : undefined,
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
            <ChangeDisplay change={change} insufficient={change < 0} />
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
