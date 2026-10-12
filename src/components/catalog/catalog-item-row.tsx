import { StyleSheet, Pressable, View, Text } from 'react-native';
import type { GroceryItem } from '@/lib/db';
import {
  formatCurrency,
} from '@/lib/utils/format';

type Props = {
  item: GroceryItem;
  selected?: boolean;
  onPress?: () => void;
};

function formatExpiration(dateString: string) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function CatalogItemRow({ item, selected, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
        selected && styles.rowSelected,
      ]}
      onPress={onPress}
    >
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.detail}>Quedan {item.quantity} piezas</Text>
      </View>
      <Text style={styles.quantity}>{formatCurrency(item.price)}</Text>
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
  rowSelected: {
    backgroundColor: '#EFFDF1',
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
  quantity: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
});
