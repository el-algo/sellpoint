import { StyleSheet, View, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Screen from '@/components/screen';
import SuccessBadge from '@/components/success-badge';
import ReceiptCard, { type ReceiptLine } from '@/components/receipt-card';
import SecondaryButton from '@/components/secondary-button';
import Button from '@/components/button';
import { formatFolioDate, formatCurrency, formatQuantity, itemSubtotal } from '@/lib/format';
import { useSaleItems } from '@/lib/sale-store';

const METHOD_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  fiado: 'Fiado',
  transferencia: 'Transferencia',
};

export default function Receipt() {
  const { folio, total, method, received, change } = useLocalSearchParams<{
    folio: string;
    total: string;
    method: string;
    received: string;
    change: string;
  }>();
  const items = useSaleItems();
  const date = new Date();

  const lines: ReceiptLine[] = [
    ...items.map((item) => ({
      label: `${item.name} ×${formatQuantity(item.quantity, item.unit)}`,
      value: formatCurrency(itemSubtotal(item)),
    })),
    { label: 'Total', value: formatCurrency(Number(total) || 0), divider: true },
    method === 'efectivo'
      ? {
          label: 'Efectivo / Cambio',
          value: `${formatCurrency(Number(received) || 0)} / ${formatCurrency(Number(change) || 0)}`,
        }
      : { label: 'Método', value: METHOD_LABELS[method as string] ?? method ?? '' },
  ];

  const share = () => {
    const body = lines.map((l) => `${l.label}: ${l.value}`).join('\n');
    Share.share({ message: `Folio ${folio}\n${body}` });
  };

  return (
    <Screen title="Recibo" showBack>
      <SuccessBadge
        title="Venta registrada"
        subtitle={`Folio ${folio} · ${formatFolioDate(date)}`}
      />

      <ReceiptCard lines={lines} />
      <SecondaryButton label="Compartir" icon="share-nodes" onPress={share} />

      <View style={styles.spacer} />

      <Button label="Regresar al Inicio" href="/cashier" icon="backward" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: {
    flex: 1,
  },
});
