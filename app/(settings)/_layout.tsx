import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
