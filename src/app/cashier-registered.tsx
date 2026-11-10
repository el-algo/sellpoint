import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Screen from '@/components/ui/screen';
import SuccessBadge from '@/components/ui/success-badge';
import Button from '@/components/ui/button';

export default function CashierRegistered() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();

  return (
    <Screen title="Registro exitoso">
      <View style={styles.center}>
        <SuccessBadge title={name ?? ''} subtitle="ha sido registrad@ en el sistema" />
      </View>
      <Button label="Regresar a cajeros" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
  },
});
