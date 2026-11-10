import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '@/components/ui/screen';
import SegmentedControl from '@/components/ui/segmented-control';
import SectionTitle from '@/components/ui/section-title';
import ValueCard from '@/components/ui/value-card';
import { card } from '@/components/ui/theme';
import { initDatabase, getReport, type Report } from '@/lib/db';
import { formatCurrency, formatUnits } from '@/lib/utils/format';

type Period = 'day' | 'week' | 'month';

const PERIODS = [
  { value: 'day' as const, label: 'Hoy' },
  { value: 'week' as const, label: 'Semana' },
  { value: 'month' as const, label: 'Mes' },
];

// Inicio del periodo en hora local; la semana empieza en lunes.
function periodStart(period: Period): Date {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  if (period === 'month') start.setDate(1);
  return start;
}

function Rows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <View key={row.label} style={[styles.row, index > 0 && styles.rowDivider]}>
          <Text style={styles.rowText} numberOfLines={1}>
            {row.label}
          </Text>
          <Text style={styles.rowText}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState<Period>('day');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    initDatabase()
      .then(() => getReport(periodStart(period)))
      .then((result) => {
        if (!cancelled) setReport(result);
      })
      .catch((e) => {
        console.error('Error cargando el reporte:', e);
        if (!cancelled) setError('No se pudo cargar el reporte');
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <Screen title="Reportes">
      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} />

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : !report ? (
          <ActivityIndicator color="#41CF56" />
        ) : (
          <>
            <Rows
              rows={[
                { label: 'Vendí', value: formatCurrency(report.sold) },
                { label: 'Me costó', value: formatCurrency(report.cost) },
                { label: 'Gastos', value: formatCurrency(report.expenses) },
              ]}
            />

            <ValueCard
              label="Me quedaron"
              value={formatCurrency(report.sold - report.cost - report.expenses)}
            />

            <SectionTitle>Lo que más se vende</SectionTitle>
            {report.topItems.length > 0 ? (
              <Rows
                rows={report.topItems.map((item) => ({
                  label: item.name,
                  value: formatUnits(item.quantity, item.unit),
                }))}
              />
            ) : (
              <Text style={styles.empty}>Aún no hay ventas en este periodo</Text>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  card: {
    ...card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  rowText: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    fontSize: 15,
    color: '#94A3B8',
  },
  error: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});
