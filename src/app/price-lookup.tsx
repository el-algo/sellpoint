import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Screen from '@/components/ui/screen';
import SearchInput from '@/components/catalog/search-input';
import CatalogItemRow from '@/components/catalog/catalog-item-row';
import {
  initDatabase,
  searchItemsByName,
  getRecentlySoldItems,
  type GroceryItem,
} from '@/lib/db';
import { formatTimeAgo } from '@/lib/utils/format';

type LookupItem = GroceryItem & { last_sold_at?: string };

export default function PriceLookup() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<LookupItem[]>([]);
  const term = query.trim();

  useEffect(() => {
    let cancelled = false;

    initDatabase()
      .then((): Promise<LookupItem[]> => (term ? searchItemsByName(term) : getRecentlySoldItems()))
      .then((found) => {
        if (!cancelled) setItems(found);
      });

    return () => {
      cancelled = true;
    };
  }, [term]);

  return (
    <Screen title="Búsqueda">
      <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar producto..." />
      <Text style={styles.section}>{term ? 'RESULTADOS DE BÚSQUEDA' : 'RECIENTES'}</Text>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.card}
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CatalogItemRow
            item={item}
            highlight={term}
            detail={item.last_sold_at && `Última venta: ${formatTimeAgo(item.last_sold_at)}`}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.empty}>{term ? 'Sin resultados' : 'Aún no hay ventas'}</Text>
        }
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#64748B',
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    fontSize: 15,
    color: '#94A3B8',
  },
});
