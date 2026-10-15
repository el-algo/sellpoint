import { Text, View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';
import SuccessBadge from '@/components/ui/success-badge';
import ActionCard from '@/components/ui/action-card';
import { Icon } from '@/components/ui/icon';
import { useCurrentUser, signOut } from '@/lib/stores/session-store';
import { initDatabase, getSalesTotalByDate, type DailySales } from '@/lib/db';
import { formatCurrency } from '@/lib/utils/format';

export default function Admin() {
  const router = useRouter();
  const user = useCurrentUser();
  const lowStockCount = 7;
  const [today, setToday] = useState<DailySales | null>(null);
  const [error, setError] = useState<string | undefined>();

  const handleLogout = () => {
    signOut();
    router.replace('/');
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;

      initDatabase()
        .then(() => getSalesTotalByDate())
        .then((result) => {
          if (active) {
            setToday(result);
            setError(undefined);
          }
        })
        .catch((e) => {
          console.error('Error cargando las ventas:', e);
          if (active) setError('No se pudieron cargar las ventas');
        });

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <Screen
      title={`Hola, admin ${user?.name ?? ''}`}
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

      <View style={styles.grid}>
        <Text>Venta de hoy:</Text>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : today === null ? (
          <ActivityIndicator color="#41CF56" />
        ) : (
          <Text>
            {formatCurrency(today.total)}
          </Text>
      )}
      </View>

      <View style={styles.grid}>
        <ActionCard label="Fiados" icon="receipt" href="/credit" />
        <ActionCard label="Entrada de mercancia" icon="truck" href="" />
        <ActionCard label="Reportes" icon="chart-simple" href="" />
        <ActionCard label="Productos" icon="barcode" href="" />
      </View>

      <Pressable style={styles.alert} onPress={() => router.push('/inventory')}>
        <View style={styles.alertIcon}>
          <Icon name="triangle-exclamation" size={18} color="#B45309" />
        </View>
        <Text style={styles.alertText}>{lowStockCount} productos por acabarse</Text>
      </Pressable>

      <Button label="Administrar cajeros" icon="users-line" href="/users" />
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
