import { StyleSheet, View, Pressable, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Icon, type IconName } from '@/components/icon';

type Props = {
  label: string;
  href?: Href;
  icon?: IconName;
  disabled?: boolean;
  onPress?: () => void;
};

export default function Button({ label, href, icon, onPress, disabled }: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (href) {
      router.push(href);
    } else {
      onPress?.();
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        android_ripple={disabled ? undefined : { color: '#2FB544' }}
      >
        {icon && <Icon name={icon} size={20} color="#fff" />}
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 60,
  },
  button: {
    borderRadius: 12,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#41CF56',
  },
  buttonPressed: {
    backgroundColor: '#39B84C',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: '#A7E3B2',
  },
});
