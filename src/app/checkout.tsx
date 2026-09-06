import { useMemo, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/screen';
import SegmentedControl from '@/components/segmented-control';
import AmountInput from '@/components/amount-input';
import QuickAmounts from '@/components/quick-amounts';
import ChangeDisplay from '@/components/change-display';
import Button from '@/components/button';
import { formatCurrency, type PaymentMethod } from '@/lib/format';

const METHODS = [
  { value: 'efectivo' as const, label: 'Efectivo' },
  { value: 'fiado' as const, label: 'Fiado' },
  { value: 'transferencia' as const, label: 'Transfer.' },
];

export default function Checkout() {
  const router = useRouter();
  const total = 82;

  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [received, setReceived] = useState('');

  const receivedValue = parseFloat(received) || 0;
  const change = useMemo(() => receivedValue - total, [receivedValue, total]);
  const isCash = method === 'efectivo';
  const canFinish = !isCash || receivedValue >= total;

  const finish = () => {
    router.replace({
      pathname: '/receipt',
      params: { folio: '1042' },
    });
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
              onSelect={(amount) => setReceived(String(amount))}
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
