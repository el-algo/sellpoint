import { Fragment } from 'react';
import { StyleSheet, View, Text } from 'react-native';

export type ReceiptLine = {
  label: string;
  value: string;
  divider?: boolean;
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
            <Text style={styles.label} numberOfLines={1}>
              {line.label}
            </Text>
            <Text style={styles.value}>{line.value}</Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
});
