import { StyleSheet, Text, View } from 'react-native';
import Screen from '@/components/ui/screen';
import Button from '@/components/ui/button';

export default function NotFoundScreen() {
  return (
    <Screen title="Página no encontrada">
      <View style={styles.center}>
        <Text style={styles.text}>Esta página no existe.</Text>
      </View>
      <Button label="Regresar al inicio" href="/" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#64748B',
  },
});
