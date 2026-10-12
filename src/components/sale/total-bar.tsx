import { StyleSheet, View, Text } from 'react-native';
import { formatCurrency } from '@/lib/utils/format';

type Props = {
  total: number;
  label?: string;
};

export default function TotalBar({ total, label = 'Total' }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.amount}>{formatCurrency(total)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
});
