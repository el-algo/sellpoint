import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import Screen from '@/components/ui/screen';
import SuccessBadge from '@/components/ui/success-badge';
import ProductModal from '@/components/inventory/product-modal';
import {
  initDatabase,
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  type GroceryItem,
  type NewItem,
} from '@/lib/db';

const LOW_STOCK = 5; // a partir de aquí se marca "Poco stock"
const EXPIRING_DAYS = 7; // a partir de aquí se marca "Caduca pronto"
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const money = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

// Quita acentos y mayúsculas para que "dona" encuentre "Doña".
const normalize = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

type Tag = { label: string; color: string; background: string };

const RED = { color: '#DC2626', background: '#FEF2F2' };
const AMBER = { color: '#B45309', background: '#FEF3C7' };

function getTags(item: GroceryItem): Tag[] {
  const tags: Tag[] = [];

  if (item.quantity <= 0) {
    tags.push({ label: 'Agotado', ...RED });
  } else if (item.quantity <= LOW_STOCK) {
    tags.push({ label: 'Poco stock', ...AMBER });
  }

  const days = daysUntil(item.expiration_date);
  if (days < 0) {
    tags.push({ label: 'Caducado', ...RED });
  } else if (days <= EXPIRING_DAYS) {
    tags.push({
      label: days === 0 ? 'Caduca hoy' : `Caduca en ${days} día${days === 1 ? '' : 's'}`,
      ...AMBER,
    });
  }

  return tags;
}

export default function Inventory() {
  const [items, setItems] = useState<GroceryItem[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [query, setQuery] = useState('');

  // Se guardan por separado para que el modal no se vacíe durante la animación de cierre.
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      initDatabase()
        .then(getAllItems)
        .then((result) => {
          if (active) {
            setItems(result);
            setError(undefined);
          }
        })
        .catch((e) => {
          console.error('Error cargando inventario:', e);
          if (active) setError('No se pudo cargar el inventario');
        });

      return () => {
        active = false;
      };
    }, [])
  );

  const reload = async () => {
    setItems(await getAllItems());
  };

  const openModal = (item: GroceryItem | null) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  // Si alguna de estas funciones lanza un error, el modal lo muestra y se queda abierto.
  const handleSave = async (data: NewItem) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      await createItem(data);
    }
    await reload();
    setModalVisible(false);
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    await deleteItem(editingItem.id);
    await reload();
    setModalVisible(false);
  };

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = normalize(query.trim());
    return q ? items.filter((item) => normalize(item.name).includes(q)) : items;
  }, [items, query]);

  const total = items?.length ?? 0;

  return (
    <Screen title="Inventario" contentStyle={styles.body}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SuccessBadge
          title="Inventario"
          subtitle={
            items === null
              ? 'Cargando...'
              : `${total} producto${total === 1 ? '' : 's'} registrado${total === 1 ? '' : 's'}`
          }
          icon="cash-register"
          color="#D1FAE5"
        />

        <Pressable style={styles.addButton} onPress={() => openModal(null)}>
          <Text style={styles.addText}>+ Agregar producto</Text>
        </Pressable>

        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar producto"
          placeholderTextColor="#94A3B8"
          autoCorrect={false}
          returnKeyType="search"
        />

        <View style={styles.list}>
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : filtered === null ? (
            <ActivityIndicator color="#41CF56" />
          ) : total === 0 ? (
            <Text style={styles.empty}>Todavía no hay productos registrados</Text>
          ) : filtered.length === 0 ? (
            <Text style={styles.empty}>No hay productos que coincidan con tu búsqueda</Text>
          ) : (
            filtered.map((item) => {
              const tags = getTags(item);
              return (
                <Pressable key={item.id} style={styles.card} onPress={() => openModal(item)}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.detail}>
                        Stock: {item.quantity} · Cad. {formatDate(item.expiration_date)}
                      </Text>
                    </View>
                    <Text style={styles.price}>{money(item.price)}</Text>
                  </View>

                  {tags.length > 0 && (
                    <View style={styles.tags}>
                      {tags.map((tag) => (
                        <View
                          key={tag.label}
                          style={[styles.tag, { backgroundColor: tag.background }]}
                        >
                          <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <ProductModal
        visible={modalVisible}
        item={editingItem}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 0,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
  },
  addButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#41CF56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  search: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#fff',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detail: {
    fontSize: 14,
    color: '#64748B',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 24,
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
  },
});