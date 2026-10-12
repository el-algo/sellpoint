import { StyleSheet, View, Text } from 'react-native';
import { formatCurrency } from '@/lib/utils/format';

type Props = {
  change: number;
  insufficient?: boolean;
};

export default function ChangeDisplay({ change, insufficient }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{insufficient ? 'Falta' : 'Cambio'}</Text>
      <Text style={[styles.amount, insufficient && styles.amountShort]}>
        {formatCurrency(Math.abs(change))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#64748B',
  },
  amount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#0F172A',
  },
  amountShort: {
    color: '#DC2626',
  },
});
