import { useCallback, useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';
import TextField from '@/components/ui/text-field';
import AmountInput from '@/components/checkout/amount-input';
import TotalBar from '@/components/sale/total-bar';
import { card } from '@/components/ui/theme';
import {
  initDatabase,
  getExpensesSinceClosing,
  registerExpense,
  type Expense,
} from '@/lib/db';
import { formatCurrency, formatFolioDate } from '@/lib/utils/format';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    await initDatabase();
    setExpenses(await getExpensesSinceClosing());
  }, []);

  useEffect(() => {
    load().catch((e) => {
      console.error('Error cargando los gastos:', e);
      setError('No se pudieron cargar los gastos');
    });
  }, [load]);

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const conceptText = concept.trim();
  const value = parseFloat(amount) || 0;
  const canRegister = !submitting && conceptText !== '' && value > 0;

  const register = async () => {
    setSubmitting(true);
    setError(undefined);
    try {
      await registerExpense(conceptText, value);
      setConcept('');
      setAmount('');
      await load();
    } catch {
      setError('No se pudo registrar, intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen title="Retiros y gastos">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TotalBar label="Desde el último corte" total={total} />

        <FlatList
          style={styles.flex}
          contentContainerStyle={styles.card}
          data={expenses}
          keyExtractor={(expense) => String(expense.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.concept} numberOfLines={1}>
                  {item.concept}
                </Text>
                <Text style={styles.detail}>{formatFolioDate(new Date(item.created_at))}</Text>
              </View>
              <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text style={styles.empty}>No hay retiros ni gastos</Text>}
          keyboardShouldPersistTaps="handled"
        />

        <TextField
          label="Concepto"
          value={concept}
          onChangeText={setConcept}
          placeholder="Ej. Pago de luz"
          maxLength={60}
        />
        <AmountInput label="Monto" value={amount} onChangeText={setAmount} />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button label="Registrar" disabled={!canRegister} onPress={register} />
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
  info: {
    flex: 1,
    gap: 2,
  },
  concept: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detail: {
    fontSize: 14,
    color: '#64748B',
  },
  amount: {
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
  error: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
});
