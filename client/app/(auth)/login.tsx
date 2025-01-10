import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/context/auth';

export default function LoginScreen() {
  const [errorMessage, setErrorMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn(username, password);
    } catch (error: any) {
      if (error.name === 'UserNotConfirmedException') {
        // User is not confirmed, redirect to verification screen.
        router.push({
          pathname: '/(auth)/verification',
          params: { username }
        });
      } else {
        setErrorMessage(error.message);
        setVisible(true);
      }
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
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setVisible(false),
        }}
      >
        {errorMessage}
      </Snackbar>
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