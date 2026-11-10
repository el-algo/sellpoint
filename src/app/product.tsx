import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';
import SecondaryButton from '@/components/ui/secondary-button';
import SegmentedControl from '@/components/ui/segmented-control';
import TextField from '@/components/ui/text-field';
import {
  initDatabase,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from '@/lib/db';
import { parseAmount, type SaleUnit } from '@/lib/utils/format';

const UNITS = [
  { value: 'pza' as const, label: 'Pieza' },
  { value: 'kg' as const, label: 'Kilo' },
];

// Escribe solo dígitos y el campo agrega los guiones: 20261231 -> 2026-12-31
function formatDateInput(text: string): string {
  const d = text.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export default function Product() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const itemId = id ? Number(id) : null;

  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<SaleUnit>('pza');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [lowStock, setLowStock] = useState('5');
  const [expiration, setExpiration] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (itemId === null) return;

    initDatabase()
      .then(() => getItemById(itemId))
      .then((item) => {
        if (!item) return;
        setBarcode(item.barcode ?? '');
        setName(item.name);
        setUnit(item.unit);
        setQuantity(String(item.quantity));
        setCost(String(item.cost));
        setPrice(String(item.price));
        setLowStock(String(item.low_stock));
        setExpiration(item.expiration_date);
      });
  }, [itemId]);

  const save = async () => {
    const parsedQuantity = parseAmount(quantity);
    const parsedCost = parseAmount(cost);
    const parsedPrice = parseAmount(price);
    const parsedLowStock = parseAmount(lowStock);

    if (!name.trim()) return setError('Escribe el nombre del producto');
    if (parsedQuantity === null) return setError('La existencia debe ser un número');
    if (parsedCost === null) return setError('El costo debe ser un número');
    if (parsedPrice === null) return setError('El precio debe ser un número');
    if (parsedLowStock === null) return setError('El aviso debe ser un número');
    if (!isValidDate(expiration)) return setError('La caducidad debe ser una fecha válida');

    const data = {
      barcode: barcode.trim() || null,
      name,
      unit,
      cost: parsedCost,
      price: parsedPrice,
      quantity: parsedQuantity,
      low_stock: parsedLowStock,
      expiration_date: expiration,
    };

    setBusy(true);
    setError(undefined);
    try {
      await initDatabase();
      if (itemId === null) {
        await createItem(data);
      } else {
        await updateItem(itemId, data);
      }
      router.back();
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'DUPLICATE_NAME'
          ? 'Ya existe un producto con ese nombre'
          : 'No se pudo guardar, intenta de nuevo'
      );
      setBusy(false);
    }
  };

  const remove = async () => {
    if (itemId === null) return;

    setBusy(true);
    setError(undefined);
    try {
      await deleteItem(itemId);
      router.back();
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'ITEM_IN_USE'
          ? 'Este producto ya tiene ventas o entradas registradas y no se puede eliminar'
          : 'No se pudo eliminar, intenta de nuevo'
      );
      setConfirmingDelete(false);
      setBusy(false);
    }
  };

  return (
    <Screen title={itemId === null ? 'Nuevo producto' : 'Editar producto'} contentStyle={styles.body}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            label="Código de barras"
            value={barcode}
            onChangeText={setBarcode}
            keyboardType="number-pad"
            placeholder="Opcional"
          />
          <TextField
            label="Nombre del producto"
            value={name}
            onChangeText={setName}
            placeholder="Ej. Coca-Cola 600 ml"
            maxLength={60}
          />

          <View style={styles.unitField}>
            <Text style={styles.label}>Se vende por</Text>
            <SegmentedControl options={UNITS} value={unit} onChange={setUnit} />
          </View>

          <TextField
            label="Existencia"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholder="0"
          />

          <View style={styles.row}>
            <TextField
              label="Me cuesta"
              style={styles.half}
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
              placeholder="$0.00"
            />
            <TextField
              label="Lo vendo en"
              style={styles.half}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="$0.00"
            />
          </View>

          <TextField
            label="Avisarme cuando queden"
            value={lowStock}
            onChangeText={setLowStock}
            keyboardType="decimal-pad"
            placeholder="0"
          />
          <TextField
            label="Caducidad"
            value={expiration}
            onChangeText={(text) => setExpiration(formatDateInput(text))}
            keyboardType="number-pad"
            placeholder="AAAA-MM-DD"
            maxLength={10}
          />

          {itemId !== null && !confirmingDelete && (
            <Button
              label="Eliminar producto"
              destructive
              disabled={busy}
              onPress={() => setConfirmingDelete(true)}
            />
          )}
        </ScrollView>

        <View style={styles.footer}>
          {error && <Text style={styles.error}>{error}</Text>}

          {confirmingDelete ? (
            <>
              <Text style={styles.confirmText}>
                ¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.
              </Text>
              <Button label="Sí, eliminar" destructive disabled={busy} onPress={remove} />
              <SecondaryButton label="Cancelar" onPress={() => setConfirmingDelete(false)} />
            </>
          ) : (
            <Button label="Guardar producto" disabled={busy} onPress={save} />
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 0,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  unitField: {
    gap: 6,
  },
  label: {
    fontSize: 15,
    color: '#0F172A',
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});
