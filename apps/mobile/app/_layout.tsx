import { Stack } from 'expo-router';
import { NavigationProvider } from '@/contexts/NavigationContext';

export default function RootLayout() {
  return (
    <NavigationProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </NavigationProvider>
  );
}
