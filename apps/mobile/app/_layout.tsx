import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NavigationProvider } from '@/contexts/NavigationContext';

export default function RootLayout() {
  return (
    <NavigationProvider>
      <StatusBar style="light" backgroundColor="#172741" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </NavigationProvider>
  );
}
