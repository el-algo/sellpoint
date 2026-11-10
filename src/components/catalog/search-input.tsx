import { StyleSheet, View, TextInput } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { control } from '@/components/ui/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
};

export default function SearchInput({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Buscar producto...',
}: Props) {
  return (
    <View style={styles.container}>
      <Icon name="magnifying-glass" size={18} color="#64748B" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    padding: 0,
  },
});
