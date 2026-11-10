import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import SearchInput from '@/components/catalog/search-input';
import CatalogSearchResults from '@/components/catalog/catalog-search-results';
import Button from '@/components/ui/button';
import TextField from '@/components/ui/text-field';
import { initDatabase, searchItemsByName, type GroceryItem } from '@/lib/db';
import { addReceivingLine } from '@/lib/stores/receiving-store';
import { parseAmount } from '@/lib/utils/format';

export default function GoodsReceiptItem() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroceryItem[]>([]);
  const [selected, setSelected] = useState<GroceryItem | null>(null);
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    let cancelled = false;

    initDatabase()
      .then(() => searchItemsByName(query))
      .then((items) => {
        if (!cancelled) setResults(items);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const selectItem = (item: GroceryItem) => {
    setSelected(item);
    setCost(item.cost > 0 ? String(item.cost) : '');
  };

  const parsedQuantity = parseAmount(quantity);
  const parsedCost = parseAmount(cost);
  const canAdd = selected != null && parsedQuantity != null && parsedQuantity > 0 && parsedCost != null;

  const add = () => {
    if (!selected || parsedQuantity == null || parsedCost == null) return;

    addReceivingLine({
      itemId: selected.id,
      name: selected.name,
      unit: selected.unit,
      quantity: parsedQuantity,
      unitCost: parsedCost,
    });
    router.back();
  };

  return (
    <Screen title="Agregar producto">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SearchInput value={query} onChangeText={setQuery} />
        <CatalogSearchResults items={results} selectedId={selected?.id} onItemPress={selectItem} />
        <View style={styles.row}>
          <TextField
            label="Cantidad"
            style={styles.half}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholder="0"
          />
          <TextField
            label="Me cuesta"
            style={styles.half}
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
            placeholder="$0.00"
          />
        </View>
        <Button label="Añadir" disabled={!canAdd} onPress={add} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
});
