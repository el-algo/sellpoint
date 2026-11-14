import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';
import AmountInput from '@/components/checkout/amount-input';
import TotalBar from '@/components/sale/total-bar';
import { card } from '@/components/ui/theme';
import SegmentedControl from '@/components/ui/segmented-control';
import {
  initDatabase,
  getDebtors,
  registerPayment,
  type Debtor,
  type PaymentMethodForCredit,
} from '@/lib/db';
import { formatCurrency, formatDayMonth } from '@/lib/utils/format';

const METHODS = [
  { value: 'efectivo' as const, label: 'Efectivo' },
  { value: 'transferencia' as const, label: 'Transferencia' },
];

export default function Credit() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [selected, setSelected] = useState<Debtor | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethodForCredit>('efectivo');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    await initDatabase();
    setDebtors(await getDebtors());
  }, []);

  useEffect(() => {
    load().catch((e) => {
      console.error('Error cargando los fiados:', e);
      Alert.alert('No se pudieron cargar los fiados', 'Intenta de nuevo.');
    });
  }, [load]);

  const total = debtors.reduce((sum, debtor) => sum + debtor.balance, 0);
  const payment = parseFloat(amount) || 0;
  const canRegister = !submitting && selected != null && payment > 0 && payment <= selected.balance;

  const selectDebtor = (debtor: Debtor) => {
    setSelected(debtor);
    setAmount('');
    setMethod('efectivo');
  };

  const register = async () => {
    if (!selected || !canRegister) return;

    setSubmitting(true);
    try {
      await registerPayment(selected.name, payment, method);
      setSelected(null);
      setAmount('');
      await load();
    } catch {
      Alert.alert('No se pudo registrar el abono', 'Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen title="Fiados">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TotalBar label="Total por cobrar" total={total} />

        <FlatList
          style={styles.flex}
          contentContainerStyle={styles.card}
          data={debtors}
          keyExtractor={(debtor) => debtor.name}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, item.name === selected?.name && styles.rowSelected]}
              onPress={() => selectDebtor(item)}
            >
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.detail}>
                  {item.last_payment_at
                    ? `Último abono: ${formatDayMonth(item.last_payment_at)}`
                    : 'Sin abonos'}
                </Text>
              </View>
              <Text style={styles.balance}>{formatCurrency(item.balance)}</Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text style={styles.empty}>No hay fiados pendientes</Text>}
          keyboardShouldPersistTaps="handled"
        />

        {selected && (
          <>
            <SegmentedControl options={METHODS} value={method} onChange={setMethod} />
            <AmountInput label={`Abono de ${selected.name}`} value={amount} onChangeText={setAmount} />
          </>
        )}

        <Button label="Registrar abono" disabled={!canRegister} onPress={register} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 16,
  },
  card: {
    ...card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowSelected: {
    backgroundColor: '#EFFDF1',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detail: {
    fontSize: 14,
    color: '#64748B',
  },
  balance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    fontSize: 15,
    color: '#94A3B8',
  },
});
