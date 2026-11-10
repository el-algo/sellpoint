import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';
import ActionCard from '@/components/ui/action-card';
import LogoutButton from '@/components/ui/logout-button';
import LowStockAlert from '@/components/ui/low-stock-alert';
import { useCurrentUser } from '@/lib/stores/session-store';
import { initDatabase, getReport, type Report } from '@/lib/db';
import { formatCurrency } from '@/lib/utils/format';

export default function Admin() {
  const user = useCurrentUser();
  const [today, setToday] = useState<Report | null>(null);
  const [error, setError] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      let active = true;

      initDatabase()
        .then(() => {
          const now = new Date();
          return getReport(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
        })
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
      showBack={false}
      headerRight={<LogoutButton />}
    >
      <Text style={styles.shiftStatus}>Turno abierto</Text>

      <LowStockAlert />

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : today === null ? (
        <ActivityIndicator color="#41CF56" />
      ) : (
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Venta de hoy</Text>
            <Text style={styles.statValue}>{formatCurrency(today.sold)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Ganancias de hoy</Text>
            <Text style={styles.statValue}>
              {formatCurrency(today.sold - today.cost - today.expenses)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.grid}>
        <ActionCard label="Fiados" icon="receipt" href="/credit" />
        <ActionCard label="Entrada de mercancía" icon="truck" href="/goods-receipt" />
        <ActionCard label="Reportes" icon="chart-simple" href="/reports" />
        <ActionCard label="Productos" icon="barcode" href="/inventory" />
        <ActionCard label="Retiros y gastos" icon="money-bill-wave" href="/expenses" />
      </View>

      <Button label="Administrar cajeros" icon="users-line" href="/users" />
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
  stats: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontSize: 15,
    color: '#64748B',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  error: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});
