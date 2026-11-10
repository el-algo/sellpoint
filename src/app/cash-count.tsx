import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';
import AmountInput from '@/components/checkout/amount-input';
import ReceiptCard from '@/components/checkout/receipt-card';
import ValueCard from '@/components/ui/value-card';
import { initDatabase, getCashCount, closeCashCount, type CashCount as Summary } from '@/lib/db';
import { signOut } from '@/lib/stores/session-store';
import { formatCurrency } from '@/lib/utils/format';

function differenceLabel(difference: number) {
  if (difference === 0) return 'Caja cuadrada';
  return `${difference < 0 ? 'Faltan' : 'Sobran'} ${formatCurrency(Math.abs(difference))}`;
}

export default function CashCount() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [counted, setCounted] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(getCashCount)
      .then(setSummary)
      .catch((e) => {
        console.error('Error cargando el corte de caja:', e);
        setError('No se pudo cargar el corte de caja');
      });
  }, []);

  const countedValue = parseFloat(counted);
  const hasCount = Number.isFinite(countedValue);

  const closeShift = async () => {
    if (!summary || !hasCount || submitting) return;

    setSubmitting(true);
    try {
      await closeCashCount(summary.expected, countedValue);
      signOut();
      router.replace('/');
    } catch {
      Alert.alert('No se pudo cerrar el turno', 'Intenta de nuevo.');
      setSubmitting(false);
    }
  };

  if (!summary) {
    return (
      <Screen title="Corte de caja">
        {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color="#41CF56" />}
      </Screen>
    );
  }

  const difference = Math.round((countedValue - summary.expected) * 100) / 100;

  return (
    <Screen title="Corte de caja">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ReceiptCard
          lines={[
            { label: 'Ventas en efectivo', value: formatCurrency(summary.cashSales) },
            { label: 'Abonos recibidos', value: formatCurrency(summary.payments) },
            {
              label: 'Retiros y gastos',
              value:
                summary.withdrawals > 0
                  ? `−${formatCurrency(summary.withdrawals)}`
                  : formatCurrency(0),
            },
            {
              label: 'Debe haber',
              value: formatCurrency(summary.expected),
              divider: true,
              strong: true,
            },
          ]}
        />

        <AmountInput label="¿Cuánto contaste?" value={counted} onChangeText={setCounted} />

        {hasCount && (
          <ValueCard
            label="Diferencia"
            value={differenceLabel(difference)}
            danger={difference < 0}
          />
        )}

        <View style={styles.flex} />

        <Button
          label="Cerrar turno"
          destructive
          disabled={!hasCount || submitting}
          onPress={closeShift}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 16,
  },
  error: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});
