import { useEffect, useMemo } from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import Screen from '@/components/ui/screen';
import SearchLink from '@/components/catalog/search-link';
import SaleItemList from '@/components/sale/sale-item-list';
import TotalBar from '@/components/sale/total-bar';
import Button from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { saleTotal } from '@/lib/utils/format';
import { useSaleItems, useCurrentSaleId, startNewSale, clearSaleItems } from '@/lib/stores/sale-store';

export default function Sale() {
  const items = useSaleItems();
  const saleId = useCurrentSaleId();

  useEffect(() => {
    startNewSale();
  }, []);

  const total = useMemo(() => saleTotal(items), [items]);

  const clearSale = () => {
    if (items.length === 0) return;
    Alert.alert('Cancelar venta', '¿Quieres borrar todos los artículos?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, borrar', style: 'destructive', onPress: clearSaleItems },
    ]);
  };

  return (
    <Screen
      title={saleId ? `Venta #${String(saleId).padStart(4, '0')}` : 'Nueva venta'}
      headerRight={
        <Pressable style={styles.trashButton} onPress={clearSale}>
          <Icon name="trash-can" size={18} color="#0F172A" />
        </Pressable>
      }
    >
      <View style={styles.flex}>
        <SearchLink href="/search" />
        <SaleItemList items={items} />
        <TotalBar total={total} />
        <Button
          label="Cobrar"
          disabled={items.length === 0 || !saleId}
          href="/checkout"
        />
      </View>
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
