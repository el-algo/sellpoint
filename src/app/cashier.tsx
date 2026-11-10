import { Text, View, StyleSheet } from 'react-native';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';
import ActionCard from '@/components/ui/action-card';
import LogoutButton from '@/components/ui/logout-button';
import LowStockAlert from '@/components/ui/low-stock-alert';
import { useCurrentUser } from '@/lib/stores/session-store';

export default function Cashier() {
  const user = useCurrentUser();

  return (
    <Screen title={`Hola, ${user?.name ?? ''}`} showBack={false} headerRight={<LogoutButton />}>
      <Text style={styles.shiftStatus}>Turno abierto</Text>

      <LowStockAlert />

      <View style={styles.grid}>
        <ActionCard label="Fiados" icon="receipt" href="/credit" />
        <ActionCard label="Calculadora" icon="calculator" href="/calculator" />
        <ActionCard label="Corte de caja" icon="cash-register" href="/cash-count" />
        <ActionCard label="Buscar precio" icon="magnifying-glass" href="/price-lookup" />
        <ActionCard label="Retiros y gastos" icon="money-bill-wave" href="/expenses" />
      </View>

      <Button label="Nueva venta" href="/sale" icon="cart-shopping" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  shiftStatus: {
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
