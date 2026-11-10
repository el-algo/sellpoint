import { StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  style?: ViewStyle;
};

export default function TextField({ label, style, ...inputProps }: Props) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...inputProps} />
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
  input: {
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    fontSize: 22,
    color: '#0F172A',
    backgroundColor: '#fff',
  },
});
