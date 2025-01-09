import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/context/auth';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn(username, password);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button 
        mode="contained" 
        onPress={handleLogin}
        style={styles.button}
      >
        Login
      </Button>
      <Button 
        mode="outlined" 
        onPress={() => router.back()}
        style={styles.button}
      >
        Back
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginVertical: 8,
  },
});