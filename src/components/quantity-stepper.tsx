import { StyleSheet, View, Pressable, Text } from 'react-native';

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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
