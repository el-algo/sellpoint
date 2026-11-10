import { StyleSheet, View, FlatList, Text } from 'react-native';
import CatalogItemRow from '@/components/catalog/catalog-item-row';
import { card } from '@/components/ui/theme';
import type { GroceryItem } from '@/lib/db';

type Props = {
  items: GroceryItem[];
  selectedId?: number;
  onItemPress?: (item: GroceryItem) => void;
};

export default function CatalogSearchResults({ items, selectedId, onItemPress }: Props) {
  return (
    <View style={styles.card}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CatalogItemRow
            item={item}
            selected={item.id === selectedId}
            onPress={() => onItemPress?.(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Sin resultados</Text>
          </View>
        }
        contentContainerStyle={items.length === 0 && styles.emptyContainer}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...card,
    flex: 1,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
  },
});
