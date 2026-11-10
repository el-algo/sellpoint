import { StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { control } from '@/components/ui/theme';

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
    ...control,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 20,
    color: '#0F172A',
  },
});
