import { StyleSheet, Pressable, View, Text } from 'react-native';
import { Icon } from '@/components/ui/icon';
import type { User } from '@/lib/db/db-services';
import type { RoleName } from '@/lib/db/seed-users';

const ROLE_LABELS: Record<RoleName, string> = {
  admin: 'Dueña',
  cashier: 'Cajera',
};

type Props = {
  user: User;
  selected?: boolean;
  onPress?: () => void;
};

export default function UserCard({ user, selected, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        selected && styles.cardSelected,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconCircle}>
        <Icon name="person" size={20} color="#0F172A" />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {user.name} - {ROLE_LABELS[user.role_name] ?? user.role_name}
      </Text>
      <Icon name="chevron-right" size={16} color="#64748B" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: '#F1F5F9',
  },
  cardSelected: {
    backgroundColor: '#EFFDF1',
    borderColor: '#41CF56',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
});
