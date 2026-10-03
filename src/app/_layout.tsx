import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Iniciar sesión' }} />
      <Stack.Screen name="cashier" options={{ title: 'Caja' }} />
    </Stack>
  );
}
