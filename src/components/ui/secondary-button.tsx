import { StyleSheet, Pressable, Text } from 'react-native';
import { Icon, type IconName } from '@/components/ui/icon';

type Props = {
  label: string;
  icon?: IconName;
  onPress: () => void;
};

export default function SecondaryButton({ label, icon, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      {icon && <Icon name={icon} size={20} color="#0F172A" />}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonPressed: {
    backgroundColor: '#F1F5F9',
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
});
