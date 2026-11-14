import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import PinInput, { PIN_LENGTH } from '@/components/auth/pin-input';
import { Icon, type IconName } from '@/components/ui/icon';
import { verifyAdminPin } from '@/lib/db';

const TONES = {
  danger: { color: '#DC2626', background: '#FEE2E2' },
  success: { color: '#16A34A', background: '#DCFCE7' },
};

type Props = {
  visible: boolean;
  // Completa la frase "Ingresa el NIP de administrador para ..."
  action: string;
  icon: IconName;
  tone: keyof typeof TONES;
  onCancel: () => void;
  onAuthorized: () => void;
};

export default function AdminPinModal({ visible, action, icon, tone, onCancel, onAuthorized }: Props) {
  const pinRef = useRef<TextInput>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (visible) {
      setPin('');
      setError(undefined);
      setChecking(false);
    }
  }, [visible]);

  const confirm = async () => {
    setChecking(true);
    try {
      if (await verifyAdminPin(pin)) {
        onAuthorized();
      } else {
        setError('NIP incorrecto');
        setPin('');
      }
    } catch {
      setError('No se pudo verificar, intenta de nuevo');
    } finally {
      setChecking(false);
    }
  };

  const colors = TONES[tone];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      {/* Modals render outside Screen, so they need their own tap-outside-to-hide-keyboard. */}
      <Pressable style={styles.backdrop} onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss} accessible={false} focusable={false}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
            <Icon name={icon} size={22} color={colors.color} />
          </View>
          <Text style={styles.title}>Autorización requerida</Text>
          <Text style={styles.subtitle}>Ingresa el NIP de administrador para {action}</Text>

          <PinInput
            ref={pinRef}
            value={pin}
            onChangeText={(text) => {
              setPin(text);
              setError(undefined);
            }}
            error={error}
            disabled={checking}
          />

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancel]} onPress={onCancel} disabled={checking}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirm, (checking || pin.length < PIN_LENGTH) && styles.disabled]}
              onPress={confirm}
              disabled={checking || pin.length < PIN_LENGTH}
            >
              {checking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirmar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  card: {
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 12,
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
  confirm: {
    backgroundColor: '#41CF56',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  disabled: {
    opacity: 0.6,
  },
});
