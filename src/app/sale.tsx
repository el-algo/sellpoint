import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Screen from '@/components/ui/screen';
import SearchLink from '@/components/catalog/search-link';
import SaleItemList from '@/components/sale/sale-item-list';
import TotalBar from '@/components/sale/total-bar';
import UndoToast from '@/components/sale/undo-toast';
import AdminPinModal from '@/components/auth/admin-pin-modal';
import AmountInput from '@/components/checkout/amount-input';
import Button from '@/components/ui/button';
import SecondaryButton from '@/components/ui/secondary-button';
import { Icon } from '@/components/ui/icon';
import { formatCurrency, parseAmount, saleTotals } from '@/lib/utils/format';
import {
  useSaleItems,
  useCurrentSaleId,
  useSaleDiscount,
  useLastAdded,
  startNewSale,
  clearSaleItems,
  setSaleDiscount,
  undoLastAdd,
  dismissLastAdded,
} from '@/lib/stores/sale-store';

type Authorizing = 'cancel' | 'discount' | null;

export default function Sale() {
  const items = useSaleItems();
  const saleId = useCurrentSaleId();
  const requestedDiscount = useSaleDiscount();
  const lastAdded = useLastAdded();

  const [authorizing, setAuthorizing] = useState<Authorizing>(null);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountText, setDiscountText] = useState('');

  useEffect(() => {
    startNewSale();
  }, []);

  // El aviso de "Producto añadido" desaparece solo.
  useEffect(() => {
    if (!lastAdded) return;
    const timer = setTimeout(dismissLastAdded, 4000);
    return () => clearTimeout(timer);
  }, [lastAdded]);

  const { subtotal, discount, total } = useMemo(
    () => saleTotals(items, requestedDiscount),
    [items, requestedDiscount]
  );

  const discountValue = parseAmount(discountText);
  const validDiscount = discountValue !== null && discountValue <= subtotal;

  const authorized = () => {
    if (authorizing === 'cancel') {
      clearSaleItems();
    } else {
      setDiscountText(discount > 0 ? String(discount) : '');
      setEditingDiscount(true);
    }
    setAuthorizing(null);
  };

  const applyDiscount = () => {
    if (!validDiscount) return;
    setSaleDiscount(discountValue);
    setEditingDiscount(false);
  };

  return (
    <Screen
      title={saleId ? `Venta #${String(saleId).padStart(4, '0')}` : 'Nueva venta'}
      headerRight={
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.headerButton}
            onPress={() => items.length > 0 && setAuthorizing('discount')}
            accessibilityLabel="Aplicar descuento"
          >
            <Icon name="file-invoice-dollar" size={18} color="#0F172A" />
          </Pressable>
          <Pressable
            style={styles.headerButton}
            onPress={() => items.length > 0 && setAuthorizing('cancel')}
            accessibilityLabel="Cancelar venta"
          >
            <Icon name="trash-can" size={18} color="#0F172A" />
          </Pressable>
        </View>
      }
    >
      <View style={styles.flex}>
        <SearchLink href="/search" />
        <SaleItemList items={items} />

        {lastAdded && <UndoToast message="Producto añadido" onUndo={undoLastAdd} />}

        {editingDiscount ? (
          <>
            <AmountInput label="Descuento" value={discountText} onChangeText={setDiscountText} />
            <View style={styles.row}>
              <View style={styles.half}>
                <SecondaryButton label="Cancelar" onPress={() => setEditingDiscount(false)} />
              </View>
              <View style={styles.half}>
                <Button label="Aplicar" disabled={!validDiscount} onPress={applyDiscount} />
              </View>
            </View>
          </>
        ) : (
          <>
            {discount > 0 && (
              <View style={styles.discountRow}>
                <Text style={styles.discountText}>Descuento</Text>
                <Text style={styles.discountText}>−{formatCurrency(discount)}</Text>
              </View>
            )}
            <TotalBar total={total} />
            <Button
              label="Cobrar"
              disabled={items.length === 0 || !saleId}
              href="/checkout"
            />
          </>
        )}
      </View>

      <AdminPinModal
        visible={authorizing !== null}
        action={authorizing === 'cancel' ? 'cancelar esta venta' : 'aplicar descuento'}
        icon={authorizing === 'cancel' ? 'trash-can' : 'file-invoice-dollar'}
        tone={authorizing === 'cancel' ? 'danger' : 'success'}
        onCancel={() => setAuthorizing(null)}
        onAuthorized={authorized}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -12,
  },
  discountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16A34A',
  },
});
