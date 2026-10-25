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
import EditCashierModal from '@/components/auth/edit-cashier-modal';
import {
  initDatabase,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
  type User,
} from '@/lib/db';

export default function Users() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [addVisible, setAddVisible] = useState(false);

  // Se guardan por separado para que el modal no se vacíe durante la animación de cierre.
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editVisible, setEditVisible] = useState(false);

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

  const reload = async () => {
    setUsers(await getUsersByRole('cashier'));
  };

  // Si alguna de estas funciones lanza un error, el modal lo muestra y se queda abierto.
  const handleCreate = async (name: string, pin: string) => {
    await createUser(name, 'cashier', pin);
    await reload();
    setAddVisible(false);
  };

  const handleSave = async (name: string, pin?: string) => {
    if (!editingUser) return;
    await updateUser(editingUser.id, name, pin);
    await reload();
    setEditVisible(false);
  };

  const handleDelete = async () => {
    if (!editingUser) return;
    await deleteUser(editingUser.id);
    await reload();
    setEditVisible(false);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditVisible(true);
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

        <Pressable style={styles.addButton} onPress={() => setAddVisible(true)}>
          <Text style={styles.addText}>+ Agregar cajero</Text>
        </Pressable>

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
                selected={editVisible && editingUser?.id === user.id}
                onPress={() => openEdit(user)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <AddCashierModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSubmit={handleCreate}
      />

      <EditCashierModal
        visible={editVisible}
        user={editingUser}
        onClose={() => setEditVisible(false)}
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