import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PIN_LENGTH } from '@/components/auth/pin-input';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, pin: string) => Promise<void>;
};

const onlyDigits = (text: string) => text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);

export default function AddCashierModal({ visible, onClose, onSubmit }: Props) {
  const pinRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  // Limpia el formulario cada vez que se abre.
  useEffect(() => {
    if (visible) {
      setName('');
      setPin('');
      setConfirm('');
      setError(undefined);
      setSaving(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Escribe el nombre del cajero');
      return;
    }
    if (pin.length !== PIN_LENGTH) {
      setError(`El NIP debe tener ${PIN_LENGTH} dígitos`);
      return;
    }
    if (pin !== confirm) {
      setError('Los NIP no coinciden');
      return;
    }

    setSaving(true);
    setError(undefined);
    try {
      await onSubmit(trimmed, pin);
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'DUPLICATE_NAME'
          ? 'Ya existe un usuario con ese nombre'
          : 'No se pudo guardar, intenta de nuevo'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Nuevo cajero</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setError(undefined);
                }}
                placeholder="Ej. Lupita"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => pinRef.current?.focus()}
                maxLength={30}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>NIP de {PIN_LENGTH} dígitos</Text>
              <TextInput
                ref={pinRef}
                style={styles.input}
                value={pin}
                onChangeText={(t) => {
                  const digits = onlyDigits(t);
                  setPin(digits);
                  setError(undefined);
                  if (digits.length === PIN_LENGTH) confirmRef.current?.focus();
                }}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={PIN_LENGTH}
                placeholder="••••"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirmar NIP</Text>
              <TextInput
                ref={confirmRef}
                style={styles.input}
                value={confirm}
                onChangeText={(t) => {
                  setConfirm(onlyDigits(t));
                  setError(undefined);
                }}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={PIN_LENGTH}
                placeholder="••••"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.actions}>
              <Pressable
                style={[styles.button, styles.cancel]}
                onPress={onClose}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.save, saving && styles.saving]}
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  // La tarjeta va cerca de la parte superior para que el teclado no la tape.
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#fff',
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  save: {
    backgroundColor: '#41CF56',
  },
  saving: {
    opacity: 0.7,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});