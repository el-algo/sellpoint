import { Fragment } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { card } from '@/components/ui/theme';

export type ReceiptLine = {
  label: string;
  value: string;
  divider?: boolean;
  strong?: boolean;
};

type Props = {
  lines: ReceiptLine[];
};

export default function ReceiptCard({ lines }: Props) {
  return (
    <View style={styles.card}>
      {lines.map((line, index) => (
        <Fragment key={`${line.label}-${index}`}>
          {line.divider && <View style={styles.divider} />}
          <View style={styles.row}>
            <Text style={[styles.label, line.strong && styles.strongLabel]} numberOfLines={1}>
              {line.label}
            </Text>
            <Text style={[styles.value, line.strong && styles.strongValue]}>{line.value}</Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...card,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },
  value: {
    fontSize: 15,
    color: '#0F172A',
  },
  strongLabel: {
    fontWeight: '700',
    color: '#0F172A',
  },
  strongValue: {
    fontSize: 20,
    fontWeight: '800',
  },
});
