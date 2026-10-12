import { StyleSheet, Pressable, Text } from 'react-native';
import { Icon, type IconName } from '@/components/ui/icon';

type Props = {
  label?: string;
  icon?: IconName;
  active?: boolean;
  onPress: () => void;
};

export default function CalculatorKey({ label, icon, active, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.key,
        pressed && styles.keyPressed,
        active && styles.keyActive,
      ]}
      onPress={onPress}
      accessibilityLabel={label ?? icon}
    >
      {icon ? (
        <Icon name={icon} size={20} color="#0F172A" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    flex: 1,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: '#F1F5F9',
  },
  keyActive: {
    backgroundColor: '#EFFDF1',
    borderColor: '#41CF56',
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
});
