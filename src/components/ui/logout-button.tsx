import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { signOut } from '@/lib/stores/session-store';

export default function LogoutButton() {
  const router = useRouter();

  const logout = () => {
    signOut();
    router.replace('/');
  };

  return (
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={logout}>
      <Icon name="right-from-bracket" size={16} color="#fff" />
      <Text style={styles.label}>Salir</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#DC2626',
  },
  pressed: {
    backgroundColor: '#B91C1C',
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
