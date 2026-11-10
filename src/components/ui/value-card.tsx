import { StyleSheet, Text, View } from 'react-native';
import { card } from '@/components/ui/theme';

type Props = {
  label: string;
  value: string;
  danger?: boolean;
};

// Muestra una sola cifra importante: cambio, diferencia del corte, ganancia.
export default function ValueCard({ label, value, danger }: Props) {
  return (
    <View style={[styles.card, danger && styles.cardDanger]}>
      <Text style={[styles.label, danger && styles.danger]}>{label}</Text>
      <Text style={[styles.value, danger && styles.danger]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...card,
    alignItems: 'center',
    gap: 4,
    padding: 24,
  },
  cardDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  label: {
    fontSize: 16,
    color: '#64748B',
  },
  value: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
  },
  danger: {
    color: '#DC2626',
  },
});
