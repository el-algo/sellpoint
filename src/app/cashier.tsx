import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';
import ActionCard from '@/components/ui/action-card';
import { Icon } from '@/components/ui/icon';
import { useCurrentUser, signOut } from '@/lib/stores/session-store';
import { useLowStockCount } from '@/lib/hooks/use-low-stock-count';

export default function Cashier() {
  const router = useRouter();
  const user = useCurrentUser();
  const lowStockCount = useLowStockCount();

  const handleLogout = () => {
    signOut();
    router.replace('/');
  };

  return (
    <Screen
      title={`Hola, ${user?.name ?? ''}`}
      showBack={false}
      headerRight={
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}
        >
          <Icon name="right-from-bracket" size={16} color="#fff" />
          <Text style={styles.logoutLabel}>Salir</Text>
        </Pressable>
      }
    >
      <Text style={styles.shiftStatus}>Turno abierto</Text>

      {lowStockCount > 0 && (
        <Pressable style={styles.alert} onPress={() => router.push('/inventory')}>
          <View style={styles.alertIcon}>
            <Icon name="triangle-exclamation" size={18} color="#B45309" />
          </View>
          <Text style={styles.alertText}>
            {lowStockCount} producto{lowStockCount === 1 ? '' : 's'} por acabarse
          </Text>
        </Pressable>
      )}

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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#DC2626',
  },
  logoutButtonPressed: {
    backgroundColor: '#B91C1C',
  },
  logoutLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  shiftStatus: {
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF9E8',
    borderWidth: 1,
    borderColor: '#FCE9A8',
    borderRadius: 12,
    padding: 14,
  },
  alertIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDF0C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
