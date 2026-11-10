import { StyleSheet, View, Pressable, Text } from 'react-native';
import { formatCurrency } from '@/lib/utils/format';
import { control } from '@/components/ui/theme';

type Props = {
  amounts: number[];
  onSelect: (amount: number) => void;
};

export default function QuickAmounts({ amounts, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {amounts.map((amount) => (
        <Pressable
          key={amount}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          onPress={() => onSelect(amount)}
        >
          <Text style={styles.label}>{formatCurrency(amount).replace('.00', '')}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    ...control,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  chipPressed: {
    backgroundColor: '#F1F5F9',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
});
