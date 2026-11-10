import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { useLowStockCount } from '@/lib/hooks/use-low-stock-count';

export default function LowStockAlert() {
  const router = useRouter();
  const count = useLowStockCount();

  if (count === 0) return null;

  return (
    <Pressable style={styles.alert} onPress={() => router.push('/inventory')}>
      <View style={styles.icon}>
        <Icon name="triangle-exclamation" size={18} color="#B45309" />
      </View>
      <Text style={styles.text}>
        {count} producto{count === 1 ? '' : 's'} por acabarse
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF9E8',
    borderWidth: 1,
    borderColor: '#FCE9A8',
    borderRadius: 12,
    padding: 14,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDF0C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
  },
});
