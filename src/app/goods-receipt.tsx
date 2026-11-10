import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';
import TextField from '@/components/ui/text-field';
import { Icon } from '@/components/ui/icon';
import { initDatabase, registerPurchase, purchaseTotal } from '@/lib/db';
import {
  clearReceivingLines,
  removeReceivingLine,
  useReceivingLines,
} from '@/lib/stores/receiving-store';
import { formatCurrency, formatUnits } from '@/lib/utils/format';

export default function GoodsReceipt() {
  const router = useRouter();
  const lines = useReceivingLines();
  const [supplier, setSupplier] = useState('');
  const [invoice, setInvoice] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clearReceivingLines();
  }, []);

  const save = async () => {
    setSubmitting(true);
    setError(undefined);
    try {
      await initDatabase();
      await registerPurchase(supplier.trim(), invoice.trim(), lines);
      router.back();
    } catch {
      setError('No se pudo guardar la entrada, intenta de nuevo');
      setSubmitting(false);
    }
  };

  return (
    <Screen title="Entrada de mercancía">
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.row}>
          <TextField
            label="Proveedor"
            style={styles.half}
            value={supplier}
            onChangeText={setSupplier}
            placeholder="Opcional"
          />
          <TextField
            label="Nota / Factura"
            style={styles.half}
            value={invoice}
            onChangeText={setInvoice}
            placeholder="Opcional"
          />
        </View>

        {lines.length > 0 && (
          <View style={styles.card}>
            {lines.map((line, index) => (
              <View key={index} style={[styles.line, index > 0 && styles.lineDivider]}>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>
                    {line.name}
                  </Text>
                  <Text style={styles.detail}>
                    {formatUnits(line.quantity, line.unit)} × {formatCurrency(line.unitCost)}
                  </Text>
                </View>
                <Text style={styles.subtotal}>
                  {formatCurrency(line.quantity * line.unitCost)}
                </Text>
                <Pressable
                  onPress={() => removeReceivingLine(index)}
                  hitSlop={8}
                  accessibilityLabel={`Quitar ${line.name}`}
                >
                  <Icon name="xmark" size={16} color="#64748B" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Button label="+ Agregar producto" href="/goods-receipt-item" />
      </ScrollView>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total de la compra</Text>
        <Text style={styles.totalAmount}>{formatCurrency(purchaseTotal(lines))}</Text>
      </View>

      <Button
        label="Guardar y sumar al inventario"
        disabled={lines.length === 0 || submitting}
        onPress={save}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  lineDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
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
  subtotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
  },
});
