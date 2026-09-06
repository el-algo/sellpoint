import { StyleSheet, View, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Screen from '@/components/screen';
import SuccessBadge from '@/components/success-badge';
import ReceiptCard, { type ReceiptLine } from '@/components/receipt-card';
import SecondaryButton from '@/components/secondary-button';
import Button from '@/components/button';
import { formatFolioDate } from '@/lib/format';

export default function Receipt() {
  const router = useRouter();
  const { folio } = useLocalSearchParams<{ folio: string }>();
  const date = new Date();

  const lines: ReceiptLine[] = [
    { label: 'Coca-Cola 600 ml', value: '40.00' },
    { label: 'Tomate a granel', value: '24.00' },
    { label: 'Sabritas adobadas', value: '18.00' },
    { label: 'Total', value: '82.00', divider: true },
    { label: 'Efectivo / Cambio', value: '100.00 / 18.00' },
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
