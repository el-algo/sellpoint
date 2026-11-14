import { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Button from '@/components/ui/button';
import { useFocusEffect, useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import SuccessBadge from '@/components/ui/success-badge';
import UserCard from '@/components/auth/user-card';
import AddCashierModal from '@/components/auth/add-cashier-modal';
import EditCashierModal from '@/components/auth/edit-cashier-modal';
import SecondaryButton from '@/components/ui/secondary-button';
import { useCurrentUser, signIn } from '@/lib/stores/session-store';
import {
  initDatabase,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
  type User,
} from '@/lib/db';

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [addVisible, setAddVisible] = useState(false);

  // Se guardan por separado para que el modal no se vacíe durante la animación de cierre.
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editVisible, setEditVisible] = useState(false);

  // La dueña cambia aquí su propio nombre o NIP.
  const me = useCurrentUser();
  const [selfVisible, setSelfVisible] = useState(false);

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
    router.push({ pathname: '/cashier-registered', params: { name: name.trim() } });
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

  const handleSaveSelf = async (name: string, pin?: string) => {
    if (!me) return;
    await updateUser(me.id, name, pin);
    signIn({ ...me, name: name.trim() });
    setSelfVisible(false);
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

        <Button label="+ Agregar cajero" onPress={() => setAddVisible(true)} />
        <SecondaryButton label="Cambiar mi NIP" icon="key" onPress={() => setSelfVisible(true)} />

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

      <EditCashierModal
        visible={selfVisible}
        user={me}
        title="Mis datos"
        onClose={() => setSelfVisible(false)}
        onSave={handleSaveSelf}
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