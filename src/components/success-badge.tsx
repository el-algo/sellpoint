import { StyleSheet, View, Text } from 'react-native';
import { Icon } from '@/components/icon';

type Props = {
  title: string;
  subtitle?: string;
};

export default function SuccessBadge({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Icon name="check" size={44} color="#0F172A" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  circle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#41CF56',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
  },
});
