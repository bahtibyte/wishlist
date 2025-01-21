import { PaperProvider } from 'react-native-paper';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ApolloProvider } from '@apollo/client';
import client from '@/apollo/client';

import { AuthProvider, useAuth } from '@/context/auth';
import { AppDataProvider } from '../context/app';

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
      router.replace('/(tabs)/feed');
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
    <PaperProvider>
      <ApolloProvider client={client}>
        <AppDataProvider>
          <AuthProvider>
            <RootNavigation />
            <StatusBar style="auto" />
          </AuthProvider>
        </AppDataProvider>
      </ApolloProvider>
    </PaperProvider>
  );
}
