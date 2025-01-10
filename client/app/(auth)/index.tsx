import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/context/auth';
import CustomSplashScreen from '../splash-screen';

export default function AuthScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // User data is still loading, show splash screen.
  if (isLoading) {
    return <CustomSplashScreen />;
  }

  // User is already authenticated, redirect to actual application.
  if (isAuthenticated) {
    return <Redirect href="/(tabs)"/>;
  }

  // User is not authenticated, display the authentication flow.
  return (
    <View style={styles.container}>
      <Button 
        mode="contained" 
        onPress={() => router.push('/(auth)/login')}
        style={styles.button}
      >
        Login
      </Button>
      <Button 
        mode="contained" 
        onPress={() => router.push('/(auth)/register')}
        style={styles.button}
      >
        Create Profile
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    marginVertical: 10,
  },
});