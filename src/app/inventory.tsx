import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';
import SearchInput from '@/components/catalog/search-input';
import SectionTitle from '@/components/ui/section-title';
import { card } from '@/components/ui/theme';
import { initDatabase, getAllItems, type GroceryItem } from '@/lib/db';
import { formatCurrency } from '@/lib/utils/format';
import { useCurrentUser, isAdmin } from '@/lib/stores/session-store';

const EXPIRING_DAYS = 7; // a partir de aquí se marca "Caduca pronto"
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Quita acentos y mayúsculas para que "dona" encuentre "Doña".
const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

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
  } else if (item.quantity <= item.low_stock) {
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
  const router = useRouter();
  // La cajera llega aquí desde el aviso de productos por acabarse: solo puede ver.
  const canEdit = isAdmin(useCurrentUser());
  const [items, setItems] = useState<GroceryItem[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [query, setQuery] = useState('');

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

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = normalize(query.trim());
    return q ? items.filter((item) => normalize(item.name).includes(q)) : items;
  }, [items, query]);

  const total = items?.length ?? 0;

  return (
    <Screen title="Productos">
      <SearchInput value={query} onChangeText={setQuery} />

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : filtered === null ? (
        <ActivityIndicator color="#41CF56" />
      ) : (
        <>
          <SectionTitle>{`${total} producto${total === 1 ? '' : 's'} registrado${total === 1 ? '' : 's'}`}</SectionTitle>
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.card}
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const tags = getTags(item);
              return (
                <Pressable
                  disabled={!canEdit}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  onPress={() =>
                    router.push({ pathname: '/product', params: { id: String(item.id) } })
                  }
                >
                  <View style={styles.rowTop}>
                    <View style={styles.info}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.detail}>
                        Existencia: {item.quantity} · Cad. {formatDate(item.expiration_date)}
                      </Text>
                    </View>
                    <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                  </View>

                  {tags.length > 0 && (
                    <View style={styles.tags}>
                      {tags.map((tag) => (
                        <View key={tag.label} style={[styles.tag, { backgroundColor: tag.background }]}>
                          <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {total === 0
                  ? 'Todavía no hay productos registrados'
                  : 'No hay productos que coincidan con tu búsqueda'}
              </Text>
            }
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}

      {canEdit && <Button label="+ Agregar producto" href="/product" />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  card: {
    ...card,
    overflow: 'hidden',
  },
  row: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: {
    backgroundColor: '#F8FAFC',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
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
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
  },
});
