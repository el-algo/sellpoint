import { useMemo, useState } from 'react';
import { StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Screen from '@/components/screen';
import SearchInput from '@/components/search-input';
import SaleItemList from '@/components/sale-item-list';
import TotalBar from '@/components/total-bar';
import Button from '@/components/button';
import { Icon } from '@/components/icon';
import { saleTotal, type SaleItem } from '@/lib/format';

const DEMO_ITEMS: SaleItem[] = [
  { id: '1', name: 'Coca-Cola 600 ml', quantity: 2, unitPrice: 20, unit: 'pza' },
  { id: '2', name: 'Tomate a granel', quantity: 0.75, unitPrice: 32, unit: 'kg' },
  { id: '3', name: 'Sabritas adobadas', quantity: 1, unitPrice: 18, unit: 'pza' },
];

export default function Sale() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SaleItem[]>(DEMO_ITEMS);
  const saleNumber = 7;

  const total = useMemo(() => saleTotal(items), [items]);

  const clearSale = () => {
    if (items.length === 0) return;
    Alert.alert('Cancelar venta', '¿Quieres borrar todos los artículos?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, borrar', style: 'destructive', onPress: () => setItems([]) },
    ]);
  };

  return (
    <Screen
      title={`Venta #${String(saleNumber).padStart(4, '0')}`}
      headerRight={
        <Pressable style={styles.trashButton} onPress={clearSale}>
          <Icon name="trash-can" size={18} color="#0F172A" />
        </Pressable>
      }
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SearchInput value={query} onChangeText={setQuery} />
        <SaleItemList items={items} />
        <TotalBar total={total} />
        <Button
          label="Cobrar"
          disabled={items.length === 0}
          href="/checkout"
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
  trashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
