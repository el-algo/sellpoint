import { useEffect, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/screen';
import SearchInput from '@/components/search-input';
import CatalogSearchResults from '@/components/catalog-search-results';
import QuantityStepper from '@/components/quantity-stepper';
import Button from '@/components/button';
import { initDatabase, searchItemsByName, type GroceryItem } from '@/lib/db-services';
import { addItemToSale, getCartQuantity } from '@/lib/sale-store';

export default function Search() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [dbReady, setDbReady] = useState(false);
  const [results, setResults] = useState<GroceryItem[]>([]);
  const [selected, setSelected] = useState<GroceryItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    initDatabase().then(() => setDbReady(true));
  }, []);

  useEffect(() => {
    if (!dbReady) return;

    let cancelled = false;
    searchItemsByName(query).then((items) => {
      if (!cancelled) setResults(items);
    });

    return () => {
      cancelled = true;
    };
  }, [query, dbReady]);

  const available = selected ? Math.max(selected.quantity - getCartQuantity(selected.id), 0) : 0;

  const selectItem = (item: GroceryItem) => {
    const remaining = Math.max(item.quantity - getCartQuantity(item.id), 0);
    setSelected(item);
    setQuantity(remaining > 0 ? 1 : 0);
  };

  const addToSale = () => {
    if (!selected || quantity <= 0 || quantity > available) return;
    addItemToSale(selected, quantity);
    router.back();
  };

  return (
    <Screen title="Búsqueda">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SearchInput value={query} onChangeText={setQuery} />
        <CatalogSearchResults
          items={results}
          selectedId={selected?.id}
          onItemPress={selectItem}
        />
        {selected && (
          <Text style={styles.availability}>
            {available > 0 ? `Disponibles: ${available}` : 'Sin existencias disponibles'}
          </Text>
        )}
        <QuantityStepper
          quantity={quantity}
          onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
          onIncrease={() => setQuantity((current) => Math.min(available, current + 1))}
        />
        <Button
          label="Añadir"
          disabled={!selected || quantity <= 0 || quantity > available}
          onPress={addToSale}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 16,
  },
  availability: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
