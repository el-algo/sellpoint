import { StyleSheet, Pressable, Text } from 'react-native';
import { Icon, type IconName } from '@/components/ui/icon';
import { control } from '@/components/ui/theme';

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
    ...control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 60,
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
