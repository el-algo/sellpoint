import { StyleSheet, Pressable, View, Text } from 'react-native';
import {
  formatCurrency,
  formatQuantity,
  itemSubtotal,
  type SaleItem,
} from '@/lib/format';

type Props = {
  item: SaleItem;
  onPress?: () => void;
};

export default function SaleItemRow({ item, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.detail}>
          {formatQuantity(item.quantity, item.unit)} × {formatCurrency(item.unitPrice)}
        </Text>
      </View>
      <Text style={styles.amount}>{formatCurrency(itemSubtotal(item))}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: {
    backgroundColor: '#F8FAFC',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detail: {
    fontSize: 14,
    color: '#64748B',
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
});
