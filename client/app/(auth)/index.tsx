import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const router = useRouter();

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