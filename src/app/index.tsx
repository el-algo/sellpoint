import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
  type TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import SuccessBadge from '@/components/ui/success-badge';
import UserCard from '@/components/auth/user-card';
import PinInput, { PIN_LENGTH } from '@/components/auth/pin-input';
import { initDatabase, getAllUsers, verifyUserPin, type User } from '@/lib/db';
import { signIn } from '@/lib/stores/session-store';

const STORE_NAME = 'Abarrotes Doña Mari';

export default function Login() {
  const router = useRouter();
  const pinRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [users, setUsers] = useState<User[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(getAllUsers)
      .then(setUsers);
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    const t = setTimeout(() => pinRef.current?.focus(), 100);
    return () => clearTimeout(t)
  }, [selectedId]);

  useEffect(() => {
  const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
  const sub = Keyboard.addListener(event, () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  });
  return () => sub.remove();
}, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      pinRef.current?.blur();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleSelect = (userId: number) => {
    setSelectedId(userId);
    setPin('');
    setError(undefined);
  };

  const handlePinChange = async (value: string) => {
    setPin(value);
    setError(undefined);

    if (value.length < PIN_LENGTH || selectedId === null || verifying) {
      return;
    }

    setVerifying(true);
    const user = await verifyUserPin(selectedId, value);
    setVerifying(false);

    if (!user) {
      setPin('');
      setError('NIP incorrecto, intenta de nuevo');
      return;
    }

    setPin('');
    signIn(user);
    router.replace('/cashier');
  };

  return (
    <Screen title="SellPoint" showBack={false} centerTitle contentStyle={styles.body}>
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: 16 + keyboardHeight }]}
        keyboardShouldPersistTaps="handled"
      >
        <SuccessBadge
          title={STORE_NAME}
          subtitle="Selecciona quién eres"
          icon="cash-register"
          color="#D1FAE5"
        />

        <View style={styles.users}>
          {users === null ? (
            <ActivityIndicator color="#41CF56" />
          ) : (
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                selected={user.id === selectedId}
                onPress={() => handleSelect(user.id)}
              />
            ))
          )}
        </View>

        <View style={styles.pin}>
          <PinInput
            ref={pinRef}
            label="NIP de 4 dígitos"
            value={pin}
            onChangeText={handlePinChange}
            error={error}
            disabled={selectedId === null}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 0,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
  },
  users: {
    gap: 14,
  },
  pin: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingBottom: 16,
  },
});
