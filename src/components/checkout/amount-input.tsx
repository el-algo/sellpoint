import { StyleSheet, View, Text, TextInput } from 'react-native';
import { control } from '@/components/ui/theme';

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
    <View style={styles.field}>
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
  field: {
    gap: 6,
  },
  label: {
    fontSize: 15,
    color: '#0F172A',
  },
  inputRow: {
    ...control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 64,
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
});
