import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { GroceryItem, NewItem } from '@/lib/db';

type Props = {
  visible: boolean;
  item: GroceryItem | null; // null = agregar producto nuevo
  onClose: () => void;
  onSave: (data: NewItem) => Promise<void>;
  onDelete: () => Promise<void>;
};

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

function parseNumber(text: string): number | null {
  const clean = text.trim().replace(',', '.');
  if (clean === '') return null;
  const n = Number(clean);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export default function ProductModal({ visible, item, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiration, setExpiration] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Carga los datos del producto (o limpia el formulario) cada vez que se abre.
  useEffect(() => {
    if (!visible) return;
    setName(item?.name ?? '');
    setPrice(item ? String(item.price) : '');
    setQuantity(item ? String(item.quantity) : '');
    setExpiration(item?.expiration_date ?? '');
    setError(undefined);
    setBusy(false);
  }, [visible, item]);

  // Deja espacio para el teclado dentro del scroll.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const clearError = () => setError(undefined);

  const handleSave = async () => {
    const trimmed = name.trim();
    const parsedPrice = parseNumber(price);
    const parsedQuantity = parseNumber(quantity);

    if (!trimmed) {
      setError('Escribe el nombre del producto');
      return;
    }
    if (parsedPrice === null) {
      setError('El precio debe ser un número mayor o igual a 0');
      return;
    }
    if (parsedQuantity === null) {
      setError('La cantidad debe ser un número mayor o igual a 0');
      return;
    }
    if (!isValidDate(expiration)) {
      setError('La caducidad debe ser una fecha válida (AAAA-MM-DD)');
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      await onSave({
        name: trimmed,
        price: parsedPrice,
        quantity: parsedQuantity,
        expiration_date: expiration,
      });
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'DUPLICATE_NAME'
          ? 'Ya existe un producto con ese nombre'
          : 'No se pudo guardar, intenta de nuevo'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    if (!item) return;

    Alert.alert(
      'Eliminar producto',
      `¿Seguro que quieres eliminar "${item.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            setError(undefined);
            try {
              await onDelete();
            } catch (e) {
              setError(
                e instanceof Error && e.message === 'ITEM_HAS_SALES'
                  ? 'Este producto ya tiene ventas registradas y no se puede eliminar'
                  : 'No se pudo eliminar, intenta de nuevo'
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 24 + keyboardHeight }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>{item ? 'Editar producto' : 'Nuevo producto'}</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  clearError();
                }}
                placeholder="Ej. Leche Lala 1 L"
                placeholderTextColor="#94A3B8"
                autoCapitalize="sentences"
                maxLength={60}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.half]}>
                <Text style={styles.label}>Precio</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={(t) => {
                    setPrice(t);
                    clearError();
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={[styles.field, styles.half]}>
                <Text style={styles.label}>Cantidad</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={(t) => {
                    setQuantity(t);
                    clearError();
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Caducidad</Text>
              <TextInput
                style={styles.input}
                value={expiration}
                onChangeText={(t) => {
                  setExpiration(formatDateInput(t));
                  clearError();
                }}
                keyboardType="number-pad"
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#94A3B8"
                maxLength={10}
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.actions}>
              <Pressable
                style={[styles.button, styles.cancel]}
                onPress={onClose}
                disabled={busy}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.save, busy && styles.disabled]}
                onPress={handleSave}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Guardar</Text>
                )}
              </Pressable>
            </View>

            {item && (
              <Pressable
                style={[styles.button, styles.delete, busy && styles.disabled]}
                onPress={handleDelete}
                disabled={busy}
              >
                <Text style={styles.deleteText}>Eliminar producto</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  field: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#fff',
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  save: {
    backgroundColor: '#41CF56',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  delete: {
    flex: 0,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  disabled: {
    opacity: 0.6,
  },
});