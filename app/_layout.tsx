import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

export default function RootLayout() {
  // Ignore specific warnings that might cause infinite loading
  useEffect(() => {
    LogBox.ignoreLogs([
      'Warning: Failed prop type',
      'VirtualizedLists should never be nested',
      'ViewPropTypes will be removed',
      'AsyncStorage has been extracted'
    ]);
  }, []);

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="screens/LoginScreen" options={{ title: 'התחברות' }} />
        <Stack.Screen name="screens/RegisterScreen" options={{ title: 'הרשמה' }} />
        <Stack.Screen name="screens/DashboardScreen" options={{ title: 'לוח מחוונים' }} />
        <Stack.Screen name="screens/CowDetailScreen" options={{ title: 'פרטי פרה' }} />
      </Stack>
    </SafeAreaProvider>
  );
}