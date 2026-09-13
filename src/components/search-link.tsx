import { StyleSheet, Pressable, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Icon } from '@/components/icon';

type Props = {
  href: Href;
  placeholder?: string;
};

export default function SearchLink({ href, placeholder = 'Busca un artículo...' }: Props) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push(href)}
    >
      <Icon name="magnifying-glass" size={18} color="#64748B" />
      <Text style={styles.placeholder}>{placeholder}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: {
    backgroundColor: '#F8FAFC',
  },
  placeholder: {
    fontSize: 16,
    color: '#94A3B8',
  },
});
