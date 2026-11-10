import { StyleSheet, Pressable, View, Text } from 'react-native';
import type { GroceryItem } from '@/lib/db';
import {
  formatCurrency,
} from '@/lib/utils/format';

type Props = {
  item: GroceryItem;
  selected?: boolean;
  onPress?: () => void;
  detail?: string;
  highlight?: string;
};

function formatExpiration(dateString: string) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// Parte el nombre para resaltar la palabra completa que contiene la búsqueda.
function splitHighlight(name: string, query: string) {
  const match = name.toLowerCase().indexOf(query.toLowerCase());
  if (match < 0) return null;

  const start = name.lastIndexOf(' ', match) + 1;
  const space = name.indexOf(' ', match + query.length);
  const end = space < 0 ? name.length : space;
  return [name.slice(0, start), name.slice(start, end), name.slice(end)];
}

export default function CatalogItemRow({ item, selected, onPress, detail, highlight }: Props) {
  const parts = highlight ? splitHighlight(item.name, highlight) : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
        selected && styles.rowSelected,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.info}>
        <Text style={[styles.name, parts && styles.nameRegular]} numberOfLines={1}>
          {parts ? (
            <>
              {parts[0]}
              <Text style={styles.nameHighlight}>{parts[1]}</Text>
              {parts[2]}
            </>
          ) : (
            item.name
          )}
        </Text>
        <Text style={styles.detail}>{detail ?? `Quedan ${item.quantity} ${item.unit === 'kg' ? 'kg' : 'piezas'}`}</Text>
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
  nameRegular: {
    fontWeight: '400',
  },
  nameHighlight: {
    fontWeight: '700',
    color: '#41CF56',
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
