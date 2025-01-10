import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

import { ApolloProvider } from '@apollo/client';
import client from '@/apollo/client';

import { AuthProvider, useAuth } from '@/context/auth';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (typeof isAuthenticated === 'undefined') return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack
      screenOptions={{
        animation: 'none',
        headerShown: false
      }}
    >
      {/* Authentication flow. */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {/* Main application flow. */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Not found redirect. */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ApolloProvider client={client}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigation />
          <StatusBar style="auto" />
        </ThemeProvider>
      </ApolloProvider>
    </AuthProvider>
  );
}
