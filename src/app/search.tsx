import { useEffect, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import SearchInput from '@/components/catalog/search-input';
import CatalogSearchResults from '@/components/catalog/catalog-search-results';
import QuantityStepper from '@/components/sale/quantity-stepper';
import Button from '@/components/ui/button';
import { initDatabase, searchItemsByName, type GroceryItem } from '@/lib/db';
import { addItemToSale, getCartQuantity } from '@/lib/stores/sale-store';

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
  const exceeds = selected != null && quantity > available;
  // Si pide más de lo que hay, se añade solo lo disponible.
  const toAdd = Math.min(quantity, available);

  const selectItem = (item: GroceryItem) => {
    setSelected(item);
    setQuantity(1);
  };

  const addToSale = () => {
    if (!selected || toAdd <= 0) return;
    addItemToSale(selected, toAdd);
    router.back();
  };

  const stockWarning = () => {
    if (!selected) return '';
    if (available <= 0) return 'Sin existencias disponibles';
    const amount =
      selected.unit === 'kg' ? `${available} kg` : `${available} pieza${available === 1 ? '' : 's'}`;
    return `Solo ${available === 1 && selected.unit !== 'kg' ? 'queda' : 'quedan'} ${amount} en existencia`;
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
        <QuantityStepper
          quantity={quantity}
          onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
          onIncrease={() => setQuantity((current) => current + 1)}
        />
        {exceeds && (
          <View style={styles.warning}>
            <View style={styles.warningIcon}>
              <Icon name="triangle-exclamation" size={14} color="#B45309" />
            </View>
            <Text style={styles.warningText}>{stockWarning()}</Text>
          </View>
        )}
        <Button
          label={exceeds && toAdd > 0 ? `Añadir ${toAdd}` : 'Añadir'}
          disabled={!selected || toAdd <= 0}
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
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF9E8',
    borderWidth: 1,
    borderColor: '#FCE9A8',
    borderRadius: 12,
    padding: 14,
  },
  warningIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDF0C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
  },
});
