import { StyleSheet, Pressable, View, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Icon, type IconName } from '@/components/ui/icon';

type Props = {
  label: string;
  icon: IconName;
  href: Href;
};

export default function ActionCard({ label, icon, href }: Props) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(href)}
    >
      <View style={styles.iconCircle}>
        <Icon name={icon} size={20} color="#334155" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: '#F1F5F9',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
});
