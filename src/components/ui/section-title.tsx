import { StyleSheet, Text } from 'react-native';

export default function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#64748B',
  },
});
