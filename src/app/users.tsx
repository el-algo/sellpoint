import { useCallback, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Screen from '@/components/ui/screen';
import SuccessBadge from '@/components/ui/success-badge';
import Button from '@/components/ui/button';
import UserCard from '@/components/auth/user-card';
import { initDatabase, getUsersByRole, type User } from '@/lib/db';

export default function Users() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>();

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
            console.error('Error cargando usuarios:', e);
          if (active) setError('No se pudieron cargar los usuarios');
        });

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <Screen title="Cajeros" contentStyle={styles.body}>
      <ScrollView contentContainerStyle={styles.content}>
        <SuccessBadge
          title="Cajeros"
          subtitle={
            users === null ? 'Cargando...' : `${users.length} cajero${users.length === 1 ? '' : 's'} registrado${users.length === 1 ? '' : 's'}`
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
            <Text style={styles.empty}>Todavía no hay usuarios registrados</Text>
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
      <Button label="Agregar cajero" href="/users" />
      </ScrollView>
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