import { StyleSheet, View, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Screen from '@/components/ui/screen';
import SuccessBadge from '@/components/ui/success-badge';
import ReceiptCard, { type ReceiptLine } from '@/components/checkout/receipt-card';
import SecondaryButton from '@/components/ui/secondary-button';
import Button from '@/components/ui/button';
import {
  formatFolioDate,
  formatCurrency,
  formatQuantity,
  itemSubtotal,
  saleTotals,
} from '@/lib/utils/format';
import { useSaleItems, useSaleDiscount } from '@/lib/stores/sale-store';
import { useCurrentUser, isAdmin } from '@/lib/stores/session-store';

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
  const home = isAdmin(useCurrentUser()) ? '/admin' : '/cashier';
  const items = useSaleItems();
  const { discount } = saleTotals(useSaleItems(), useSaleDiscount());
  const date = new Date();

  const lines: ReceiptLine[] = [
    ...items.map((item) => ({
      label: `${item.name} ×${formatQuantity(item.quantity, item.unit)}`,
      value: formatCurrency(itemSubtotal(item)),
    })),
    ...(discount > 0
      ? [{ label: 'Descuento', value: `−${formatCurrency(discount)}`, divider: true }]
      : []),
    { label: 'Total', value: formatCurrency(Number(total) || 0), divider: discount === 0 },
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

      <Button label="Regresar al inicio" href={home} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: {
    flex: 1,
  },
});
