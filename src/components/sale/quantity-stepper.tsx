import { StyleSheet, View, Pressable, Text } from 'react-native';
import { control } from '@/components/ui/theme';

type Props = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export default function QuantityStepper({ quantity, onDecrease, onIncrease }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [styles.stepButton, pressed && styles.stepButtonPressed]}
        onPress={onDecrease}
      >
        <Text style={styles.stepLabel}>−</Text>
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable
        style={({ pressed }) => [styles.stepButton, pressed && styles.stepButtonPressed]}
        onPress={onIncrease}
      >
        <Text style={styles.stepLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  stepButton: {
    ...control,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonPressed: {
    backgroundColor: '#F1F5F9',
  },
  stepLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  quantity: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
});
