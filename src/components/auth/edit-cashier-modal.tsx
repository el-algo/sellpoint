import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PIN_LENGTH } from '@/components/auth/pin-input';
import type { User } from '@/lib/db';

type Props = {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  // pin llega como undefined cuando no se quiere cambiar el NIP.
  onSave: (name: string, pin?: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

const onlyDigits = (text: string) => text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);

export default function EditCashierModal({ visible, user, onClose, onSave, onDelete }: Props) {
  const pinRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Carga los datos del cajero cada vez que se abre el modal.
  useEffect(() => {
    if (visible && user) {
      setName(user.name);
      setPin('');
      setConfirm('');
      setError(undefined);
      setBusy(false);
    }
  }, [visible, user]);

  // Deja espacio para el teclado dentro del scroll.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleSave = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Escribe el nombre del cajero');
      return;
    }

    // Si no escribe nada en los campos de NIP, se conserva el actual.
    const changingPin = pin.length > 0 || confirm.length > 0;
    if (changingPin) {
      if (pin.length !== PIN_LENGTH) {
        setError(`El NIP debe tener ${PIN_LENGTH} dígitos`);
        return;
      }
      if (pin !== confirm) {
        setError('Los NIP no coinciden');
        return;
      }
    }

    setBusy(true);
    setError(undefined);
    try {
      await onSave(trimmed, changingPin ? pin : undefined);
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'DUPLICATE_NAME'
          ? 'Ya existe un usuario con ese nombre'
          : 'No se pudo guardar, intenta de nuevo'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    if (!user) return;

    Alert.alert(
      'Eliminar cajero',
      `¿Seguro que quieres eliminar a ${user.name}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            setError(undefined);
            try {
              await onDelete();
            } catch {
              setError('No se pudo eliminar, intenta de nuevo');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
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
          contentContainerStyle={[styles.scroll, { paddingBottom: 24 + keyboardHeight }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Editar cajero</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setError(undefined);
                }}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => pinRef.current?.focus()}
                maxLength={30}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nuevo NIP (opcional)</Text>
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
              <Text style={styles.hint}>Déjalo vacío para conservar el NIP actual</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirmar nuevo NIP</Text>
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
                disabled={busy}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.save, busy && styles.disabled]}
                onPress={handleSave}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Guardar</Text>
                )}
              </Pressable>
            </View>

            <Pressable
              style={[styles.button, styles.delete, busy && styles.disabled]}
              onPress={handleDelete}
              disabled={busy}
            >
              <Text style={styles.deleteText}>Eliminar cajero</Text>
            </Pressable>
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 48,
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
  hint: {
    fontSize: 13,
    color: '#94A3B8',
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
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  delete: {
    flex: 0,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  disabled: {
    opacity: 0.6,
  },
});