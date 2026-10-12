import { StyleSheet, View, Text, TextInput } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  autoFocus?: boolean;
};

export default function AmountInput({
  label,
  value,
  onChangeText,
  autoFocus,
}: Props) {
  const handleChange = (text: string) => {
    const cleaned = text.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const normalized =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
    onChangeText(normalized);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Text style={styles.currency}>$</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#CBD5E1"
          autoFocus={autoFocus}
          selectTextOnFocus
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currency: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    flex: 1,
    fontSize: 34,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
});
