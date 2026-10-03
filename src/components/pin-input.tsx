import type { RefObject } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';

export const PIN_LENGTH = 4;

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  disabled?: boolean;
  ref: RefObject<TextInput | null>;
};

export default function PinInput({ label, value, onChangeText, error, disabled, ref }: Props) {
  const focus = () => ref.current?.focus();

  return (
    <Pressable style={styles.container} onPress={focus} disabled={disabled}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>

      <View style={styles.boxes}>
        {Array.from({ length: PIN_LENGTH }, (_, index) => {
          const filled = index < value.length;
          const active = !disabled && index === value.length;
          return (
            <View
              key={index}
              style={[
                styles.box,
                active && styles.boxActive,
                !!error && styles.boxError,
                disabled && styles.boxDisabled,
              ]}
            >
              {filled && <View style={styles.dot} />}
            </View>
          );
        })}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        ref={ref}
        style={styles.hiddenInput}
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH))}
        keyboardType="number-pad"
        maxLength={PIN_LENGTH}
        secureTextEntry
        editable={!disabled}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 14,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  labelDisabled: {
    color: '#94A3B8',
  },
  boxes: {
    flexDirection: 'row',
    gap: 16,
  },
  box: {
    width: 58,
    height: 74,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: '#41CF56',
    borderWidth: 2,
  },
  boxError: {
    borderColor: '#EF4444',
  },
  boxDisabled: {
    backgroundColor: '#F1F5F9',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0F172A',
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
