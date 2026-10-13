import { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import Screen from '@/components/ui/screen';
import SuccessBadge from '@/components/ui/success-badge';
import UserCard from '@/components/auth/user-card';
import AddCashierModal from '@/components/auth/add-cashier-modal';
import { initDatabase, getUsersByRole, createUser, type User } from '@/lib/db';

export default function Users() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      initDatabase()
        .then(() => getUsersByRole('cashier'))
        .then((result) => {
          if (active) {
            setUsers(result);
            setError(undefined);
          }
        })
        .catch((e) => {
          console.error('Error cargando cajeros:', e);
          if (active) setError('No se pudieron cargar los cajeros');
        });

      return () => {
        active = false;
      };
    }, [])
  );

  // Si createUser lanza un error, el modal lo muestra y se queda abierto.
  const handleCreate = async (name: string, pin: string) => {
    await createUser(name, 'cashier', pin);
    setUsers(await getUsersByRole('cashier'));
    setModalVisible(false);
  };

  const count = users?.length ?? 0;

  return (
    <Screen title="Cajeros" contentStyle={styles.body}>
      <ScrollView contentContainerStyle={styles.content}>
        <SuccessBadge
          title="Cajeros"
          subtitle={
            users === null
              ? 'Cargando...'
              : `${count} cajero${count === 1 ? '' : 's'} registrado${count === 1 ? '' : 's'}`
          }
          icon="cash-register"
          color="#D1FAE5"
        />

        <View style={styles.list}>
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : users === null ? (
            <ActivityIndicator color="#41CF56" />
          ) : users.length === 0 ? (
            <Text style={styles.empty}>Todavía no hay cajeros registrados</Text>
          ) : (
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                selected={user.id === selectedId}
                onPress={() => setSelectedId(user.id === selectedId ? null : user.id)}
              />
            ))
          )}
        </View>
        
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addText}>+ Agregar cajero</Text>
        </Pressable>
      </ScrollView>

      <AddCashierModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreate}
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
  list: {
    gap: 14,
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