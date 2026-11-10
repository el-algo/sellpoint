import { StyleSheet, Pressable, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { control } from '@/components/ui/theme';

type Props = {
  href: Href;
  placeholder?: string;
};

export default function SearchLink({ href, placeholder = 'Buscar producto...' }: Props) {
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
    ...control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  pressed: {
    backgroundColor: '#F8FAFC',
  },
  placeholder: {
    fontSize: 16,
    color: '#94A3B8',
  },
});
